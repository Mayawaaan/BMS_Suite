import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  formattedValue,
  change,
  isPositive = true,
  period = 'vs last month',
  icon: Icon,
  accentColor = 'brand',
}) => {
  const [displayNum, setDisplayNum] = useState(0);

  useEffect(() => {
    if (typeof value !== 'number') return;
    
    // Smooth RAF counter
    let startTimestamp = null;
    const duration = 700;
    const startVal = 0;
    const endVal = value;

    let frameId;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * easeProgress);
      setDisplayNum(current);
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  const colorMap = {
    brand: {
      bg: 'bg-[var(--badge-brand-bg)]',
      text: 'text-[var(--badge-brand-text)]',
      border: 'border-[var(--badge-brand-border)]',
    },
    emerald: {
      bg: 'bg-[var(--badge-success-bg)]',
      text: 'text-[var(--badge-success-text)]',
      border: 'border-[var(--badge-success-border)]',
    },
    amber: {
      bg: 'bg-[var(--badge-warning-bg)]',
      text: 'text-[var(--badge-warning-text)]',
      border: 'border-[var(--badge-warning-border)]',
    },
    rose: {
      bg: 'bg-[var(--badge-danger-bg)]',
      text: 'text-[var(--badge-danger-text)]',
      border: 'border-[var(--badge-danger-border)]',
    },
    cyan: {
      bg: 'bg-[var(--badge-info-bg)]',
      text: 'text-[var(--badge-info-text)]',
      border: 'border-[var(--badge-info-border)]',
    },
    gold: {
      bg: 'bg-[var(--badge-warning-bg)]',
      text: 'text-[var(--badge-warning-text)]',
      border: 'border-[var(--badge-warning-border)]',
    },
  };

  const scheme = colorMap[accentColor] || colorMap.brand;

  const renderedValue = formattedValue
    ? formattedValue
    : typeof value === 'number'
    ? displayNum.toLocaleString()
    : value;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text-muted)]">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.text} border ${scheme.border} transition-transform duration-200 group-hover:scale-105`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-mono">
          {renderedValue}
        </h3>
      </div>

      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold border ${
              isPositive
                ? 'badge-success'
                : 'badge-danger'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
          <span className="text-[var(--text-muted)]">{period}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
