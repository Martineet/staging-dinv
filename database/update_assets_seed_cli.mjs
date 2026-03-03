#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_PATH = path.join(__dirname, 'assets_daily_prices_seed.csv');

function formatDateUTC(date) {
  return date.toISOString().slice(0, 10);
}

function parseIsoDate(input) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const date = new Date(`${input}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return formatDateUTC(date) === input ? date : null;
}

function firstDayOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function previousMonthEnd(firstDayDate) {
  return new Date(Date.UTC(firstDayDate.getUTCFullYear(), firstDayDate.getUTCMonth(), 0));
}

function fixed8(value) {
  return value.toFixed(8);
}

async function fetchMonthlySeries(symbol) {
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol)}&i=m`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Could not fetch Stooq series for ${symbol}. HTTP ${response.status}`);
  }

  const csv = (await response.text()).trim();
  const lines = csv.split('\n');
  if (lines.length < 2) {
    throw new Error(`Stooq returned no monthly rows for ${symbol}.`);
  }

  const map = new Map();
  for (const line of lines.slice(1)) {
    const cols = line.split(',');
    const date = cols[0];
    const close = Number(cols[4]);
    if (!date || !Number.isFinite(close) || close <= 0) continue;
    map.set(date, close);
  }

  return map;
}

function getCloseOnDate(series, symbol, date) {
  const close = series.get(date);
  if (!Number.isFinite(close) || close <= 0) {
    throw new Error(`No monthly close found for ${symbol} on ${date}.`);
  }
  return close;
}

function buildCsvRow(priceDate, values) {
  return [
    priceDate,
    fixed8(values.btcEur),
    'stooq:btceur',
    fixed8(values.goldEur),
    'stooq:xauusd/eurusd',
    fixed8(values.sp500Eur),
    'stooq:^spx/eurusd',
    fixed8(values.ibex35Eur),
    'stooq:^ibex'
  ].join(',');
}

async function upsertRow(csvPath, priceDate, row) {
  const raw = await fs.readFile(csvPath, 'utf8');
  const lines = raw.trimEnd().split(/\r?\n/);
  if (lines.length === 0) throw new Error('CSV file is empty.');

  const header = lines[0];
  const dataLines = lines.slice(1);
  const targetPrefix = `${priceDate},`;
  const existingIndex = dataLines.findIndex((line) => line.startsWith(targetPrefix));

  if (existingIndex >= 0) {
    dataLines[existingIndex] = row;
  } else {
    dataLines.push(row);
    dataLines.sort((a, b) => a.slice(0, 10).localeCompare(b.slice(0, 10)));
  }

  const output = [header, ...dataLines].join('\n') + '\n';
  await fs.writeFile(csvPath, output, 'utf8');
  return existingIndex >= 0 ? 'updated' : 'inserted';
}

async function askDateInteractively() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question('Price date (YYYY-MM-DD): ')).trim();
    return answer;
  } finally {
    rl.close();
  }
}

async function main() {
  const arg = process.argv[2];

  if (arg === '--help' || arg === '-h') {
    console.log('Usage: node database/update_assets_seed_cli.mjs [YYYY-MM-DD]');
    console.log('If no date is provided, the script asks for it interactively.');
    process.exit(0);
  }

  const input = arg ?? (await askDateInteractively());
  const parsed = parseIsoDate(input);
  if (!parsed) {
    throw new Error(`Invalid date "${input}". Expected YYYY-MM-DD.`);
  }

  const priceDate = firstDayOfMonth(parsed);
  const priceDateStr = formatDateUTC(priceDate);
  const marketDateStr = formatDateUTC(previousMonthEnd(priceDate));

  const [btcSeries, goldSeries, eurusdSeries, spxSeries, ibexSeries] = await Promise.all([
    fetchMonthlySeries('btceur'),
    fetchMonthlySeries('xauusd'),
    fetchMonthlySeries('eurusd'),
    fetchMonthlySeries('^spx'),
    fetchMonthlySeries('^ibex')
  ]);

  const btcEur = getCloseOnDate(btcSeries, 'btceur', marketDateStr);
  const goldUsd = getCloseOnDate(goldSeries, 'xauusd', marketDateStr);
  const eurUsd = getCloseOnDate(eurusdSeries, 'eurusd', marketDateStr);
  const sp500Usd = getCloseOnDate(spxSeries, '^spx', marketDateStr);
  const ibex35Eur = getCloseOnDate(ibexSeries, '^ibex', marketDateStr);

  const row = buildCsvRow(priceDateStr, {
    btcEur,
    goldEur: goldUsd / eurUsd,
    sp500Eur: sp500Usd / eurUsd,
    ibex35Eur
  });

  const result = await upsertRow(CSV_PATH, priceDateStr, row);
  console.log(`${result.toUpperCase()}: ${row}`);
  console.log(`Source month-end used: ${marketDateStr}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

