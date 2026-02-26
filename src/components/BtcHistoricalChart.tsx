'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  Chart,
  type ChartConfiguration,
  LineController,
  LineElement,
  PointElement,
  TimeScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useHistoricalBtcPrices } from '@/hooks/useHistoricalBtcPrices';

Chart.register(LineController, LineElement, PointElement, TimeScale, LinearScale, Tooltip, Legend);

type BtcHistoricalChartProps = {
  currentPrice: number;
};

const EURO_FORMATTER = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });
const DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

const formatEuro = (value: number) => `${EURO_FORMATTER.format(Math.round(value))} \u20AC`;

export function BtcHistoricalChart({ currentPrice }: BtcHistoricalChartProps) {
  const { data: historicalData, loading, error } = useHistoricalBtcPrices();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<'line'> | null>(null);

  const chartPoints = useMemo(() => {
    const base = historicalData
      .map((point) => ({ x: new Date(point.date).getTime(), y: point.price }))
      .sort((a, b) => a.x - b.x);

    const todayKey = new Date().toISOString().slice(0, 10);
    const todayTimestamp = new Date(todayKey).getTime();
    const hasToday = base.some((point) => point.x === todayTimestamp);

    if (!hasToday && currentPrice > 0) {
      base.push({ x: todayTimestamp, y: currentPrice });
    }

    return base.sort((a, b) => a.x - b.x);
  }, [historicalData, currentPrice]);

  useEffect(() => {
    if (!canvasRef.current || !chartPoints.length) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const isMobile = window.matchMedia('(max-width: 600px)').matches;
    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        datasets: [
          {
            data: chartPoints,
            borderColor: '#22c55e',
            backgroundColor: '#22c55e',
            borderWidth: 2,
            fill: false,
            tension: 0.2,
            pointRadius: 0,
            pointHoverRadius: 0,
            pointHitRadius: 14
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: isMobile ? 1.4 : 2.2,
        interaction: {
          mode: 'nearest',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: (items) => {
                const timestamp = items[0]?.parsed?.x;
                return timestamp ? DATE_FORMATTER.format(new Date(timestamp)) : '';
              },
              label: (ctx) => formatEuro(Number(ctx.parsed.y))
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'month',
              displayFormats: {
                month: 'MMM yyyy'
              },
              tooltipFormat: 'MMM yyyy'
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: isMobile ? 5 : 10,
              color: '#9ca3af'
            },
            grid: {
              color: 'rgba(45, 53, 72, 0.5)'
            }
          },
          y: {
            ticks: {
              maxTicksLimit: isMobile ? 5 : 8,
              color: '#9ca3af',
              callback: (value) => formatEuro(Number(value))
            },
            grid: {
              color: 'rgba(45, 53, 72, 0.5)'
            }
          }
        }
      }
    };

    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [chartPoints]);

  if (loading && !chartPoints.length) {
    return (
      <section className="historical-chart-section">
        <div className="content-width">
          <div className="historical-chart-card">
            <div className="loading">Loading chart data...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error && !chartPoints.length) {
    return (
      <section className="historical-chart-section">
        <div className="content-width">
          <div className="historical-chart-card">
            <p className="error centered-text">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="historical-chart-section">
      <div className="content-width">
        <div className="historical-chart-card">
          <div className="historical-chart-canvas-wrap">
            <canvas ref={canvasRef} aria-label="Bitcoin historical price chart" role="img" />
          </div>
        </div>
      </div>
    </section>
  );
}
