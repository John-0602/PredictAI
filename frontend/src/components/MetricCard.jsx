import React from 'react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  accent = 'blue',
  badge
}) {
  const accentColors = {
    blue: {
      border: 'border-blue-100',
      iconBg: 'bg-blue-50 text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700'
    },
    teal: {
      border: 'border-teal-100',
      iconBg: 'bg-teal-50 text-teal-600',
      badgeBg: 'bg-teal-50 text-teal-700'
    },
    rose: {
      border: 'border-rose-100',
      iconBg: 'bg-rose-50 text-rose-600',
      badgeBg: 'bg-rose-50 text-rose-700'
    },
    amber: {
      border: 'border-amber-100',
      iconBg: 'bg-amber-50 text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-700'
    },
    indigo: {
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-50 text-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-700'
    }
  };

  const style = accentColors[accent] || accentColors.blue;

  return (
    <div className={`bg-white rounded-xl border ${style.border} shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 truncate">
          {trend && (
            <span className={`font-semibold ${trendPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend}
            </span>
          )}
          <span className="truncate">{subtitle}</span>
        </div>
        {badge && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${style.badgeBg}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
