import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { User, UserPreference } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Settings,
  User as UserIcon,
  Sliders,
  Moon,
  Sun,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe
} from 'lucide-react';

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const SettingsPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profile, setProfile] = useState<{ fullName: string; username: string; email: string; timezone: string }>({
    fullName: '',
    username: '',
    email: '',
    timezone: 'UTC',
  });

  const [preferences, setPreferences] = useState<UserPreference>({
    theme: 'system',
    meaningfulProgressThresholdMinutes: 30,
    meaningfulTaskRequired: true,
    dailyReminderTime: '09:00',
    notificationsEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileRes, prefRes] = await Promise.all([
        userService.getProfile(),
        userService.getPreferences(),
      ]);

      setProfile({
        fullName: profileRes.data.fullName || '',
        username: profileRes.data.username || authUser?.username || '',
        email: profileRes.data.email || '',
        timezone: profileRes.data.timezone || 'UTC',
      });

      if (prefRes.data) {
        setPreferences({
          theme: prefRes.data.theme || 'system',
          meaningfulProgressThresholdMinutes: prefRes.data.meaningfulProgressThresholdMinutes || 30,
          meaningfulTaskRequired: prefRes.data.meaningfulTaskRequired ?? true,
          dailyReminderTime: prefRes.data.dailyReminderTime || '09:00',
          notificationsEnabled: prefRes.data.notificationsEnabled ?? true,
        });
      }
    } catch (err: any) {
      setError('Failed to fetch user settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileSuccess(false);
      setError(null);
      await userService.updateProfile({
        fullName: profile.fullName,
        timezone: profile.timezone,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPreferences(true);
      setPrefSuccess(false);
      setError(null);
      await userService.updatePreferences(preferences);
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 3500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update preferences.');
    } finally {
      setSavingPreferences(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading preferences..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <Settings className="w-6 h-6" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Account & Engine Settings
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Customize your profile, timezone, consistency calculation parameters, and visual appearance.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* User Profile Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
          <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-bold text-lg">Personal Profile</h2>
        </div>

        {profileSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={profile.username || authUser?.username || ''}
                disabled
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <span className="text-xs text-gray-400 mt-1 block">Account login identifier</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Display Name / Full Name
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                placeholder="Optional display name"
                className="w-full px-3 py-2 bg-white dark:bg-gray-750 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Timezone (for accurate streak & calendar tracking)
            </label>
            <div className="relative">
              <select
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-750 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Consistency & Engine Preferences Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
          <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-bold text-lg">Consistency & Tracking Parameters</h2>
        </div>

        {prefSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Preferences updated successfully!
          </div>
        )}

        <form onSubmit={handlePreferencesSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Meaningful Progress Threshold (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={preferences.meaningfulProgressThresholdMinutes}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    meaningfulProgressThresholdMinutes: parseInt(e.target.value) || 30,
                  })
                }
                className="w-full px-3 py-2 bg-white dark:bg-gray-750 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-gray-400 mt-1 block">
                Minimum focused work time required to count a day toward your streak.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Daily Reflection Reminder Time
              </label>
              <input
                type="time"
                value={preferences.dailyReminderTime}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    dailyReminderTime: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-white dark:bg-gray-750 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-xs text-gray-400 mt-1 block">
                Recommended time for daily reflection and tomorrow's planning.
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.meaningfulTaskRequired}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    meaningfulTaskRequired: e.target.checked,
                  })
                }
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
              <div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Require at least one completed task for meaningful daily progress
                </span>
                <span className="text-xs text-gray-400 block">
                  Prevents counting passive timer running if no objective task was completed.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notificationsEnabled}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    notificationsEnabled: e.target.checked,
                  })
                }
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
              <div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Enable in-app alerts and notifications
                </span>
                <span className="text-xs text-gray-400 block">
                  Receive proactive warnings when tasks become overdue or milestones approach.
                </span>
              </div>
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingPreferences}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {savingPreferences ? 'Saving...' : 'Save Parameters'}
            </button>
          </div>
        </form>
      </div>

      {/* Visual Theme Appearance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              Appearance Theme
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Currently using <span className="font-semibold capitalize text-gray-800 dark:text-gray-200">{theme} mode</span>.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-2"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" /> Switch to Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-500" /> Switch to Dark Mode
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
