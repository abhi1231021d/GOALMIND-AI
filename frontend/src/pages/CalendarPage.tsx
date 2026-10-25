import React, { useState, useEffect } from 'react';
import { taskService } from '../services/api';
import { Task } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMonthTasks();
  }, [currentMonth]);

  const loadMonthTasks = async () => {
    setIsLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const res = await taskService.getTasks({ fromDate: firstDay, toDate: lastDay });
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks for calendar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Generate calendar grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday

  const days: Array<{ dayNum: number; dateStr: string; isCurrentMonth: boolean }> = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ dayNum: 0, dateStr: '', isCurrentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dayNum: d, dateStr, isCurrentMonth: true });
  }

  const tasksForSelectedDate = tasks.filter((t) => t.dueDate === selectedDate);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>CALENDAR VIEW</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
          >
            Current Month
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {isLoading ? (
            <LoadingSpinner size="md" text="Loading calendar schedule..." />
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {days.map((item, idx) => {
                if (!item.isCurrentMonth) {
                  return <div key={idx} className="h-20 rounded-2xl bg-slate-50/40 dark:bg-slate-950/20" />;
                }

                const dayTasks = tasks.filter((t) => t.dueDate === item.dateStr);
                const isSelected = selectedDate === item.dateStr;
                const isToday = item.dateStr === new Date().toISOString().split('T')[0];
                const completedTasks = dayTasks.filter((t) => t.status === 'COMPLETED').length;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`h-20 p-2 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                        : isToday
                        ? 'border-indigo-400 bg-white dark:bg-slate-900'
                        : 'border-slate-200/70 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isToday
                            ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {item.dayNum}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-400">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    {dayTasks.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              completedTasks === dayTasks.length
                                ? 'bg-emerald-500'
                                : completedTasks > 0
                                ? 'bg-amber-500'
                                : 'bg-indigo-500'
                            }`}
                          />
                          <span className="text-[10px] text-slate-500 truncate block max-w-full">
                            {completedTasks}/{dayTasks.length} done
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Date Details Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Selected Date</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedDate}</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {tasksForSelectedDate.length} Tasks
              </span>
            </div>

            {tasksForSelectedDate.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No tasks scheduled for this day. Select another date from the calendar.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {tasksForSelectedDate.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold ${t.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {t.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          t.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block line-clamp-1">{t.instructions}</span>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                      <span>Est: {t.estimatedMinutes}m</span>
                      <span>Priority: {t.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => (window.location.href = '/daily-planner')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow transition"
            >
              Open in Daily Planner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
