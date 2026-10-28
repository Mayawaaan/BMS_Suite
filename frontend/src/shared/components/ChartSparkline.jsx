import React, { useState, useRef, useEffect } from 'react';

export const ChartSparkline = ({
  data = [0, 0, 0, 0, 0, 0],
  labels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  height = 180,
  strokeColor = '#9A3412',
  valuePrefix = '₹',
  showGrid = true,
  showLabels = true,
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(500);

  // Measure container width responsively to prevent SVG aspect ratio collapse
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) setContainerWidth(w);
      }
    };
    updateWidth();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(updateWidth);
      ro.observe(containerRef.current);
      return () => ro.disconnect();
    } else {
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, []);

  // Safe fallback if data is empty or invalid
  const safeData = Array.isArray(data) && data.length > 0 ? data : [0, 0, 0, 0, 0, 0];
  const safeLabels = Array.isArray(labels) && labels.length > 0 ? labels : ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

  const numPoints = safeData.length;
  const paddingX = Math.min(36, Math.max(16, containerWidth / 15));
  const paddingY = 24;
  const usableWidth = Math.max(containerWidth - paddingX * 2, 20);
  const chartHeight = Math.max(height - paddingY * 2, 20);

  const numericVals = safeData.map((v) => Number(v) || 0);
  const allZero = numericVals.every((v) => v === 0);
  const minVal = Math.min(...numericVals);
  const maxVal = Math.max(...numericVals);
  const range = maxVal - minVal;

  // Calculate points coordinates
  const points = numericVals.map((val, idx) => {
    const x = numPoints > 1
      ? paddingX + (idx / (numPoints - 1)) * usableWidth
      : containerWidth / 2;

    let y;
    if (allZero) {
      // Baseline resting near the bottom
      y = height - paddingY - 8;
    } else if (range === 0) {
      y = height / 2;
    } else {
      y = height - paddingY - ((val - minVal) / range) * chartHeight;
    }

    return {
      x,
      y,
      val,
      label: safeLabels[idx] || `Pt ${idx + 1}`,
    };
  });

  // Build SVG path
  let pathD = '';
  if (points.length === 1) {
    pathD = `M ${paddingX} ${points[0].y} L ${containerWidth - paddingX} ${points[0].y}`;
  } else if (allZero || range === 0) {
    pathD = `M ${points[0].x} ${points[0].y} L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
  } else {
    pathD = points.reduce((acc, pt, idx, arr) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[idx - 1];
      const cpX1 = prev.x + (pt.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (pt.x - prev.x) / 2;
      const cpY2 = pt.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
    }, '');
  }

  const baselineY = height - paddingY;
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`
    : '';

  // Grid reference lines
  const yTop = paddingY;
  const yMid = height / 2;
  const yBase = baselineY;

  return (
    <div className="relative w-full select-none" ref={containerRef}>
      {/* SVG Canvas with explicit pixel dimensions */}
      <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
        <svg
          viewBox={`0 0 ${containerWidth} ${height}`}
          width="100%"
          height={height}
          style={{ width: '100%', height: `${height}px`, display: 'block', overflow: 'visible' }}
        >
          {/* Subtle Horizontal Reference Guidelines */}
          {showGrid && (
            <g className="opacity-60">
              <line
                x1={paddingX}
                y1={yTop}
                x2={containerWidth - paddingX}
                y2={yTop}
                stroke="#E5DDD0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <line
                x1={paddingX}
                y1={yMid}
                x2={containerWidth - paddingX}
                y2={yMid}
                stroke="#E5DDD0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <line
                x1={paddingX}
                y1={yBase}
                x2={containerWidth - paddingX}
                y2={yBase}
                stroke="#E5DDD0"
                strokeWidth="1"
              />
            </g>
          )}

          {/* Solid Subtle Fill - Zero Gradients */}
          {areaD && (
            <path
              d={areaD}
              fill={strokeColor}
              fillOpacity={allZero ? '0.03' : '0.07'}
              className="transition-opacity duration-300"
            />
          )}

          {/* Main Trajectory Stroke */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={allZero ? '6 4' : 'none'}
              className="transition-all duration-300"
            />
          )}

          {/* Tracking vertical guide when hovering */}
          {hoverIndex !== null && points[hoverIndex] && (
            <line
              x1={points[hoverIndex].x}
              y1={yTop}
              x2={points[hoverIndex].x}
              y2={yBase}
              stroke={strokeColor}
              strokeDasharray="3 3"
              strokeWidth="1.5"
              opacity="0.4"
            />
          )}

          {/* Interactive Data Points */}
          {points.map((pt, i) => {
            const isHovered = hoverIndex === i;
            return (
              <g key={i}>
                {/* Outer halo when active */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={9}
                    fill={strokeColor}
                    fillOpacity="0.16"
                  />
                )}
                {/* Crisp Point Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#FFFFFF"
                  stroke={strokeColor}
                  strokeWidth={isHovered ? 2.5 : 2}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
                {/* Generous Hover Target */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={22}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Operational Zero-State Overlay Badge */}
        {allZero && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-4">
            <div className="px-3.5 py-1.5 rounded-full bg-[#FAF6EF] border border-[#E5DDD0] text-xs font-mono text-[var(--text-secondary)] shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#9A3412] animate-pulse" />
              <span className="font-semibold text-[#9A3412]">Operational Baseline Active</span>
              <span className="text-[var(--text-muted)] hidden sm:inline">• Awaiting Transactions</span>
            </div>
          </div>
        )}

        {/* Floating Tooltip - Positioned Safely Without Clipping */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="absolute pointer-events-none z-30 transition-all duration-100 ease-out"
            style={{
              left: `${points[hoverIndex].x}px`,
              top: `${Math.max(10, points[hoverIndex].y - 58)}px`,
              transform: points[hoverIndex].x < 70
                ? 'translate(-10%, 0)'
                : points[hoverIndex].x > containerWidth - 70
                ? 'translate(-90%, 0)'
                : 'translate(-50%, 0)',
            }}
          >
            <div className="bg-[#231F1C] text-white px-3 py-1.5 rounded-xl shadow-xl border border-[#9A3412]/40 text-xs font-mono min-w-[110px] text-center">
              <div className="text-[10px] text-[#D1C7BD] uppercase tracking-wider font-semibold">
                {points[hoverIndex].label}
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {valuePrefix}
                {typeof points[hoverIndex].val === 'number'
                  ? points[hoverIndex].val.toLocaleString('en-IN')
                  : points[hoverIndex].val}
              </div>
              {allZero && (
                <div className="text-[9px] text-[#F59E0B] font-sans mt-0.5">
                  Zero Baseline
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* X-Axis Month / Category Labels */}
      {showLabels && (
        <div className="flex justify-between items-center px-2 pt-2 border-t border-[var(--border-color)] mt-1">
          {points.map((pt, i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              className={`text-[11px] font-mono transition-all px-2 py-0.5 rounded cursor-pointer ${
                hoverIndex === i
                  ? 'text-[#9A3412] font-bold bg-[#FAF6EF]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {pt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChartSparkline;
