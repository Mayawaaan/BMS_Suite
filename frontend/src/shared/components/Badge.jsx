import React from 'react';
import { getStatusInfo } from '../../core/config/systemConfig';

export const Badge = ({ status, text, size = 'sm', className = '' }) => {
  const statusInfo = getStatusInfo(status);
  const displayText = text || statusInfo.label;
  const badgeClass = statusInfo.badgeClass || 'badge-neutral';

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${badgeClass} ${
        sizeClasses[size] || sizeClasses.sm
      } ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {displayText}
    </span>
  );
};

export default Badge;
