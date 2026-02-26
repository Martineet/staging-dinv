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

export function BtcHistoricalChart({ currentPrice }: BtcHistoricalChartProps) {
  const { data: historicalData, loading, error } = useHistoricalBtcPrices();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart<'line'> | null>(null);

  const chartPoints = useMemo(() => {
    const base = historicalData.map((point) => ({ x: new Date(point.date).getTime(), y: point.price }));
    const today = new Date().toISOString().slice(0, 10);
    const todayTimestamp = new Date(today).getTime();
    const hasToday = base.some((point) => point.x === todayTimestamp);

    if (!hasToday && currentPrice > 0) {
      base.push({ x: todayTimestamp, y: currentPrice });
    }

    return base;
  }, [historicalData, currentPrice]);

  useEffect(() => {
    if (!canvasRef.current || !chartPoints.length) return;

    if (chartRef.current) {
      chartRef.current.destroy();
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
            pointRadius: isMobile ? 0 : 2,
            pointHoverRadius: isMobile ? 0 : 4
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
                const date = items[0]?.parsed?.x ? new Date(items[0].parsed.x) : null;
                return date
                  ? date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' })
                  : '';
              },
              label: (ctx) =>
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0
                }).format(Number(ctx.parsed.y))
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
              tooltipFormat: 'MMM d, yyyy'
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
              callback: (value) =>
                new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0
                }).format(Number(value))
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
