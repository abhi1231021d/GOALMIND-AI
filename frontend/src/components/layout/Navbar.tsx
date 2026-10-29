import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationService } from '../../services/api';
import { NotificationItem } from '../../types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  Check,
  Target
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, setTheme, theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 45000); // poll every 45s
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      // ignore
    }
  };

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      try {
        const res = await notificationService.getNotifications();
        setNotifications(res.data.slice(0, 5));
      } catch (e) {}
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (e) {}
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="flex items-center space-x-4">
        {/* Mobile brand header if sidebar is hidden */}
        <Link to="/dashboard" className="md:hidden flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <Target className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">GoalMind</span>
        </Link>
      </div>

      {/* Central Navigation Tabs for Career Intelligence Suite */}
      <div className="hidden md:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
        <Link
          to="/dashboard"
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
            location.pathname === '/dashboard' || location.pathname.startsWith('/goals')
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>🎯</span>
          <span>Goals &amp; Roadmaps</span>
        </Link>
        <Link
          to="/resume-analyzer"
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
            location.pathname === '/resume-analyzer'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>📄</span>
          <span>Resume Analyzer</span>
        </Link>
        <Link
          to="/interview-simulator"
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
            location.pathname === '/interview-simulator'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>🎙️</span>
          <span>Interview Simulator</span>
        </Link>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-3.5">
        {/* Quick Add Goal shortcut */}
        <Link
          to="/goals/new"
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-xl border border-indigo-100 dark:border-indigo-900/60 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={() => {
            const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
            setTheme(nextTheme);
          }}
          className="flex items-center space-x-1.5 p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs"
          title={`Theme: ${theme.toUpperCase()} (Click to toggle Light / Dark / System)`}
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : theme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Monitor className="w-4 h-4 text-slate-400" />
          )}
          <span className="hidden sm:inline-block text-[10px] font-semibold uppercase text-slate-400">
            {theme}
          </span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={handleOpenNotifications}
            className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-fadeIn">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer ${
                        !n.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                      onClick={() => {
                        setShowNotifications(false);
                        if (n.link) navigate(n.link);
                      }}
                    >
                      <p className="font-semibold text-slate-900 dark:text-white mb-0.5">{n.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-2 px-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-indigo-100 dark:ring-indigo-900/50">
              {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <p className="font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-28">
                {user?.fullName || user?.username}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-28">@{user?.username}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.fullName || user?.username}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">@{user?.username}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>Account & Preferences</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
