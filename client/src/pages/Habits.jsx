import React from 'react';
import { AttendanceTracker } from '../components/AttendanceTracker';

export const Habits = () => {
  return (
    <div className="space-y-6 pb-12 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-futuristic tracking-wide uppercase">
            Habit Attendance Workspace
          </h1>
          <p className="text-[10px] text-slate-400 font-display mt-0.5 uppercase tracking-widest">
            Spreadsheet-grid attendance registry & consistency logger
          </p>
        </div>
      </div>

      {/* Main Attendance Table spreadsheet */}
      <AttendanceTracker />

    </div>
  );
};
