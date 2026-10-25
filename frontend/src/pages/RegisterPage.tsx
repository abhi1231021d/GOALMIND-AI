import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Target, ArrowRight, AlertCircle, CheckCircle2, XCircle, User, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-detect timezone without prompting user
  const detectedTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }, []);

  // Strong password rule evaluations
  const passwordRules = useMemo(() => {
    return [
      { id: 'length', label: 'At least 8 characters', valid: password.length >= 8 },
      { id: 'uppercase', label: 'One uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
      { id: 'lowercase', label: 'One lowercase letter (a-z)', valid: /[a-z]/.test(password) },
      { id: 'number', label: 'One number (0-9)', valid: /[0-9]/.test(password) },
      { id: 'special', label: 'One special symbol (!@#$%^&*)', valid: /[@$!%*?&#^()_+\-=\[\]{}|;:,.<>~`'/\\"]/.test(password) },
    ];
  }, [password]);

  const passedRulesCount = useMemo(() => {
    return passwordRules.filter((r) => r.valid).length;
  }, [passwordRules]);

  const isPasswordStrong = passedRulesCount === 5;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Strength score and label
  const strengthInfo = useMemo(() => {
    if (!password) return { label: 'None', color: 'bg-slate-200 dark:bg-slate-700', width: 'w-0' };
    if (passedRulesCount <= 2) return { label: 'Weak', color: 'bg-rose-500', width: 'w-1/4' };
    if (passedRulesCount === 3) return { label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' };
    if (passedRulesCount === 4) return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  }, [password, passedRulesCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedUsername)) {
      setError('Username can only contain letters, numbers, underscores, dots, and hyphens');
      return;
    }

    if (!isPasswordStrong) {
      setError('Please fulfill all strong password criteria below');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register(trimmedUsername, password, detectedTimezone);
      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.username ||
        err.response?.data?.errors?.password ||
        'Registration failed. Please choose another username.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2.5 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Target className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 dark:text-white">GoalMind AI</span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choose a unique username and strong password to get started
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm">
          {error && (
            <div className="flex items-center space-x-2 p-3 mb-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Unique Username Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Unique Username
                </label>
                <span className="text-[10px] text-slate-400">Min 3 characters</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="e.g. alex_mercer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {/* Strong Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Strong Password
                </label>
                {password && (
                  <span
                    className={`text-[10px] font-bold ${
                      isPasswordStrong ? 'text-emerald-500' : 'text-amber-500'
                    }`}
                  >
                    {strengthInfo.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Meter Bar */}
              {password && (
                <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${strengthInfo.color} ${strengthInfo.width} transition-all duration-300`} />
                </div>
              )}

              {/* Password Requirements Checklist */}
              <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Strong Password Requirements:
                </p>
                {passwordRules.map((rule) => (
                  <div key={rule.id} className="flex items-center space-x-2 text-[11px]">
                    {rule.valid ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
                    )}
                    <span
                      className={
                        rule.valid
                          ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                    >
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm Password
                </label>
                {confirmPassword && (
                  <span
                    className={`text-[10px] font-bold ${
                      passwordsMatch ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {passwordsMatch ? 'Matches' : 'Does not match'}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordStrong || !passwordsMatch || username.trim().length < 3}
              className="w-full mt-2 inline-flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-indigo-500/25 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
