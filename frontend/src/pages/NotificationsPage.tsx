import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/api';
import { NotificationItem } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Check,
  CheckCheck,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await notificationService.getNotifications();
      setNotifications(res.data);
    } catch (err: any) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read');
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'UNREAD' ? !n.read : true
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'WARNING':
      case 'OVERDUE':
        return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      case 'SUCCESS':
      case 'MILESTONE':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-indigo-500 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <Bell className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications & Activity Feed
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Stay informed on milestone deadlines, consistency streaks, and adaptive adjustments.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Mark all as read
            </button>
          )}

          {/* Filter toggle */}
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filter === 'ALL'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filter === 'UNREAD'
                  ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading notifications..." />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          title={filter === 'UNREAD' ? 'No unread notifications' : 'No notifications found'}
          description="You're all caught up! Updates regarding milestone deadlines and adaptive scheduling will appear here."
          icon={<Bell className="w-12 h-12 text-gray-400" />}
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                notif.read
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 opacity-80'
                  : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getTypeIcon(notif.type)}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm font-semibold ${
                        notif.read
                          ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-4 pt-1 text-xs text-gray-400">
                    <span>{new Date(notif.createdAt).toLocaleString()}</span>
                    {notif.link && (
                      <Link
                        to={notif.link}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        View Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  title="Mark as read"
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
