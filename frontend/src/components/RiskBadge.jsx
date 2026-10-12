import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export default function RiskBadge({ level, size = 'md' }) {
  const norm = (level || 'Low Risk').toLowerCase();

  let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let Icon = ShieldCheck;
  let label = level || 'Low Risk';

  if (norm.includes('critical')) {
    bg = 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
    Icon = AlertOctagon;
  } else if (norm.includes('high')) {
    bg = 'bg-amber-100 text-amber-800 border-amber-300';
    Icon = AlertTriangle;
  } else if (norm.includes('medium')) {
    bg = 'bg-yellow-50 text-yellow-700 border-yellow-200';
    Icon = Info;
  }

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1' 
    : size === 'lg' 
    ? 'text-sm px-3.5 py-1.5 gap-2 font-semibold' 
    : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border ${bg} ${sizeClasses}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{label}</span>
    </span>
  );
}
