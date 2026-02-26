'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

const TEN_YEARS_IN_MONTHS = 120;
const EURO_FORMATTER = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });
const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat('es-ES', { month: 'short', year: 'numeric' });
const FULL_DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

const formatEuro = (value: number) => `${EURO_FORMATTER.format(Math.round(value))} €`;

type ChartPoint = {
  x: number;
  y: number;
};

export function BtcHistoricalChart({ currentPrice }: BtcHistoricalChartProps) {
  const { data: historicalData, loading, error } = useHistoricalBtcPrices();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<'line'> | null>(null);
  const [windowStart, setWindowStart] = useState(0);

  const chartPoints = useMemo<ChartPoint[]>(() => {
    const base = historicalData
      .map((point) => ({ x: new Date(point.date).getTime(), y: point.price }))
      .sort((a, b) => a.x - b.x);

    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const todayTimestamp = new Date(todayKey).getTime();
    const hasToday = base.some((point) => point.x === todayTimestamp);

    if (!hasToday && currentPrice > 0) {
      base.push({ x: todayTimestamp, y: currentPrice });
    }

    return base.sort((a, b) => a.x - b.x);
  }, [historicalData, currentPrice]);

  const windowSize = Math.min(TEN_YEARS_IN_MONTHS, chartPoints.length);
  const maxStart = Math.max(0, chartPoints.length - windowSize);

  useEffect(() => {
    setWindowStart(maxStart);
  }, [maxStart]);

  const visiblePoints = useMemo(
    () => chartPoints.slice(windowStart, windowStart + windowSize),
    [chartPoints, windowStart, windowSize]
  );

  useEffect(() => {
    if (!canvasRef.current || !visiblePoints.length) return;

    const yValues = visiblePoints.map((point) => point.y);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yPadding = Math.max((yMax - yMin) * 0.08, 300);
    const isMobile = window.matchMedia('(max-width: 600px)').matches;

    if (!chartRef.current) {
      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          datasets: [
            {
              data: visiblePoints,
              borderColor: '#22c55e',
              backgroundColor: '#22c55e',
              borderWidth: 2,
              fill: false,
              tension: 0.2,
              pointRadius: 0,
              pointHoverRadius: 4,
              pointHitRadius: 16
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: isMobile ? 1.35 : 2.1,
          animation: false,
          normalized: true,
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
                  return timestamp ? FULL_DATE_FORMATTER.format(new Date(timestamp)) : '';
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
                color: '#9ca3af',
                callback: (_, index) => {
                  const point = visiblePoints[index];
                  return point ? MONTH_YEAR_FORMATTER.format(new Date(point.x)) : '';
                }
              },
              grid: {
                color: 'rgba(45, 53, 72, 0.5)'
              }
            },
            y: {
              min: yMin - yPadding,
              max: yMax + yPadding,
              ticks: {
                maxTicksLimit: isMobile ? 5 : 7,
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
      return;
    }

    const chart = chartRef.current;
    chart.data.datasets[0].data = visiblePoints;
    chart.options.scales = {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          displayFormats: { month: 'MMM yyyy' },
          tooltipFormat: 'MMM yyyy'
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: isMobile ? 5 : 10,
          color: '#9ca3af',
          callback: (_, index) => {
            const point = visiblePoints[index];
            return point ? MONTH_YEAR_FORMATTER.format(new Date(point.x)) : '';
          }
        },
        grid: {
          color: 'rgba(45, 53, 72, 0.5)'
        }
      },
      y: {
        min: yMin - yPadding,
        max: yMax + yPadding,
        ticks: {
          maxTicksLimit: isMobile ? 5 : 7,
          color: '#9ca3af',
          callback: (value) => formatEuro(Number(value))
        },
        grid: {
          color: 'rgba(45, 53, 72, 0.5)'
        }
      }
    };
    chart.options.aspectRatio = isMobile ? 1.35 : 2.1;
    chart.update('none');
  }, [visiblePoints]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

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
          {maxStart > 0 ? (
            <div className="historical-chart-scroll">
              <input
                type="range"
                min={0}
                max={maxStart}
                value={windowStart}
                step={1}
                aria-label="Scroll historical range"
                onChange={(event) => setWindowStart(Number(event.target.value))}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
