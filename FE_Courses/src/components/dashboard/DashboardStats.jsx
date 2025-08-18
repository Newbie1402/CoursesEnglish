import React from 'react';
import { cn } from '@/lib/utils';

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            stat.bg,
            "rounded-xl p-4 lg:p-6 transition-all hover:scale-[1.02] hover:shadow-lg",
            "active:scale-95 touch-manipulation" // Thêm feedback khi tap trên mobile
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm lg:text-base font-medium text-gray-600">{stat.label}</p>
              <p className="mt-1 text-xl lg:text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
            <div className="p-2 lg:p-3 rounded-lg bg-white/50 backdrop-blur-sm">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
