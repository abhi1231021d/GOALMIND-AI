import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goalService } from '../services/api';
import { FeasibilityCheckResponse } from '../types';
import {
  Target,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

export const CreateGoalPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('CAREER');
  const [currentLevel, setCurrentLevel] = useState('BEGINNER');
  const [targetOutcome, setTargetOutcome] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [dailyHours, setDailyHours] = useState<number>(2.0);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(6);
  const [priority, setPriority] = useState('HIGH');
  const [difficulty, setDifficulty] = useState('MODERATE');
  const [reason, setReason] = useState('');
  const [learningStyle, setLearningStyle] = useState('PRACTICAL_PROJECTS');

  // Feasibility Check State
  const [feasibility, setFeasibility] = useState<FeasibilityCheckResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Career Bridge Assessment Handoff Banner State
  const [bridgeOrigin, setBridgeOrigin] = useState<{ source: string; notes?: string } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('goalmind_bridge_payload');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.title) setTitle(data.title);
        if (data.category) {
          const catUpper = String(data.category).toUpperCase();
          if (['CAREER', 'EDUCATION', 'HEALTH', 'PERSONAL_FINANCE', 'CREATIVE', 'OTHER'].includes(catUpper)) {
            setCategory(catUpper);
          } else {
            setCategory('CAREER');
          }
        }
        if (data.reason) setReason(data.reason);
        if (data.targetOutcome) setTargetOutcome(data.targetOutcome);
        if (data.suggestedDailyHours) setDailyHours(Number(data.suggestedDailyHours));
        if (data.daysPerWeek) setDaysPerWeek(Number(data.daysPerWeek));
        if (data.difficulty) setDifficulty(data.difficulty);

        setBridgeOrigin({
          source: data.reason || 'Career Assessment Bridge',
          notes: data.title
        });
        sessionStorage.removeItem('goalmind_bridge_payload');
      } catch (e) {
        console.error('Failed to parse goalmind_bridge_payload', e);
      }
    }
  }, []);

  const handleAnalyzeFeasibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsChecking(true);
    try {
      // 1. Guard against empty title
      if (!title.trim()) {
        setError('Please enter a goal title (e.g. "Master Cloud Architecture & Microservices") before analyzing feasibility.');
        setIsChecking(false);
        return;
      }

      // 2. Ensure date validity and prevent past/inverted dates
      let effectiveStart = startDate;
      if (!effectiveStart) {
        effectiveStart = new Date().toISOString().split('T')[0];
        setStartDate(effectiveStart);
      }

      let effectiveTarget = targetDate;
      if (!effectiveTarget || new Date(effectiveTarget) <= new Date(effectiveStart)) {
        const d = new Date(effectiveStart);
        d.setMonth(d.getMonth() + 3);
        effectiveTarget = d.toISOString().split('T')[0];
        setTargetDate(effectiveTarget);
      }

      const payload = {
        title: title.trim(),
        description: description || 'Master competencies and architectural rigor.',
        category: category || 'CAREER',
        currentLevel: currentLevel || 'BEGINNER',
        targetOutcome: targetOutcome || `Complete ${title.trim()} milestones and build production capstone.`,
        startDate: effectiveStart,
        targetDate: effectiveTarget,
        dailyHours: Number(dailyHours) || 2.0,
        daysPerWeek: Number(daysPerWeek) || 6,
        priority: priority || 'HIGH',
        difficulty: difficulty || 'MODERATE',
        reason: reason || 'Advance career and pass technical interviews.',
        learningStyle: learningStyle || 'PRACTICAL_PROJECTS',
      };

      // 3. Try backend API first
      try {
        const res = await goalService.checkFeasibility(payload);
        if (res && res.data && res.data.status) {
          setFeasibility(res.data);
          return;
        }
      } catch (backendErr: any) {
        console.warn('Backend feasibility check warning, computing resilient client feasibility:', backendErr);
      }

      // 4. Instant Deterministic Client-Side Feasibility Engine (Zero Failure Guarantee)
      const startMs = new Date(effectiveStart).getTime();
      const targetMs = new Date(effectiveTarget).getTime();
      const totalDays = Math.max(1, Math.round((targetMs - startMs) / (1000 * 60 * 60 * 24)));
      const workingDaysRatio = (Number(daysPerWeek) || 6) / 7.0;
      const availableWorkingDays = totalDays * workingDaysRatio;
      const availableWorkingHours = Math.round(availableWorkingDays * (Number(dailyHours) || 2.0) * 10) / 10;

      let baselineHours = 200.0;
      const diff = (difficulty || 'MODERATE').toUpperCase();
      if (diff === 'EASY') baselineHours = 80.0;
      else if (diff === 'CHALLENGING') baselineHours = 350.0;
      else if (diff === 'HARD') baselineHours = 600.0;

      if ((currentLevel || '').toUpperCase() === 'ADVANCED') baselineHours *= 0.75;
      else if ((currentLevel || '').toUpperCase() === 'BEGINNER') baselineHours *= 1.25;

      const ratio = Math.round((baselineHours / Math.max(1.0, availableWorkingHours)) * 100) / 100;
      let status: 'FEASIBLE' | 'CHALLENGING' | 'AT_RISK' | 'UNREALISTIC' = 'FEASIBLE';
      let summaryMessage = 'The goal is realistic and well-dimensioned with healthy buffer capacity for unforeseen delays.';
      const constraints = [
        `Available: ${totalDays} total days, working ${daysPerWeek || 6} days/week at ${dailyHours || 2} hrs/day.`,
        `Target deadline: ${effectiveTarget}.`
      ];
      const potentialRisks: string[] = [];
      const suggestedAdjustments: string[] = [];

      if (ratio <= 0.70) {
        status = 'FEASIBLE';
        summaryMessage = 'The goal is realistic and well-dimensioned with healthy buffer capacity for unforeseen delays.';
        suggestedAdjustments.push('Maintain consistent daily tracking to prevent procrastination complacency.');
      } else if (ratio <= 0.90) {
        status = 'CHALLENGING';
        summaryMessage = 'The goal is achievable, but requires consistent adherence with limited margin for missed sessions.';
        potentialRisks.push('Missing more than 2-3 sessions per month will create schedule slippage.');
        suggestedAdjustments.push('Consider increasing daily focus time by 30 minutes for extra margin.');
      } else if (ratio <= 1.15) {
        status = 'AT_RISK';
        summaryMessage = 'Estimated effort exceeds comfortable capacity. There is significant risk of schedule compression.';
        potentialRisks.push('Burnout risk from overly demanding schedule.');
        potentialRisks.push('Insufficient buffer for complex topics.');
        suggestedAdjustments.push('Extend target completion date by 3 to 5 weeks.');
      } else {
        status = 'UNREALISTIC';
        summaryMessage = 'The planned timeline is mathematically insufficient for the target outcome and difficulty level.';
        potentialRisks.push('High probability of abandoned goal due to unrealistic daily requirements.');
        suggestedAdjustments.push('Extend deadline or narrow initial scope to core essentials.');
      }

      setFeasibility({
        status,
        estimatedWorkloadHours: Math.round(baselineHours * 10) / 10,
        availableWorkingHours,
        capacityUtilizationRatio: ratio,
        summaryMessage,
        constraints,
        potentialRisks,
        suggestedAdjustments
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze feasibility. Please verify dates.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleConfirmAndCreate = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      let effectiveStart = startDate || new Date().toISOString().split('T')[0];
      let effectiveTarget = targetDate;
      if (!effectiveTarget || new Date(effectiveTarget) <= new Date(effectiveStart)) {
        const d = new Date(effectiveStart);
        d.setMonth(d.getMonth() + 3);
        effectiveTarget = d.toISOString().split('T')[0];
      }

      const payload = {
        title: title.trim() || 'Career Mastery & Cloud Architecture',
        description: description || 'Master competencies and architectural rigor.',
        category: category || 'CAREER',
        currentLevel: currentLevel || 'BEGINNER',
        targetOutcome: targetOutcome || `Complete ${title.trim() || 'engineering'} milestones and build production capstone.`,
        startDate: effectiveStart,
        targetDate: effectiveTarget,
        dailyHours: Number(dailyHours) || 2.0,
        daysPerWeek: Number(daysPerWeek) || 6,
        priority: priority || 'HIGH',
        difficulty: difficulty || 'MODERATE',
        reason: reason || 'Advance career and pass technical interviews.',
        learningStyle: learningStyle || 'PRACTICAL_PROJECTS',
        status: 'ACTIVE',
      };
      const res = await goalService.createGoal(payload);
      // Navigate to the AI roadmap preview page for this new goal!
      navigate(`/goals/${res.data.id}/roadmap`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create a New Goal
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Provide your target parameters. Our engine will mathematically analyze whether your timeline is realistic before generating your milestone roadmap.
        </p>
      </div>

      {bridgeOrigin && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-cyan-500/10 to-indigo-500/5 border border-indigo-200 dark:border-indigo-800/80 shadow-sm animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Assessment Bridge Connected</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                  Auto-Populated
                </span>
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Pre-filled from your career audit / interview telemetry: <strong className="text-indigo-600 dark:text-indigo-400">{bridgeOrigin.notes}</strong>. Review your schedule and click "Analyze Feasibility" to generate your roadmap!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBridgeOrigin(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1 rounded-lg ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleAnalyzeFeasibility} className="space-y-6">
        {/* Core Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>1. Objective & Scope</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Goal Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Become a Java Developer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Goal Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CAREER">Career & Professional</option>
                <option value="EDUCATION">Education & Skills</option>
                <option value="HEALTH">Health & Fitness</option>
                <option value="PERSONAL_FINANCE">Personal Finance</option>
                <option value="CREATIVE">Creative & Arts</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Skill / Experience Level
              </label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BEGINNER">Beginner (No prior background)</option>
                <option value="INTERMEDIATE">Intermediate (Basic foundations known)</option>
                <option value="ADVANCED">Advanced (Seeking specialization/mastery)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Desired Outcome / Target Deliverable
              </label>
              <input
                type="text"
                placeholder="e.g., Become ready to apply for junior backend software engineering roles"
                value={targetOutcome}
                onChange={(e) => setTargetOutcome(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Why is this goal important to you?
              </label>
              <textarea
                rows={2}
                placeholder="e.g., To transition careers into tech, achieve financial independence, and build meaningful software"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Timeline & Availability Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>2. Schedule & Time Budget</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Available Daily Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                required
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Working Days / Week
              </label>
              <input
                type="number"
                min="1"
                max="7"
                required
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="HIGH">High Priority (Core Focus)</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority (Secondary)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="EASY">Easy (Quick ramp-up)</option>
                <option value="MODERATE">Moderate (Standard rigor)</option>
                <option value="CHALLENGING">Challenging (Heavy depth)</option>
                <option value="HARD">Hard (Mastery & rigorous problems)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Learning / Working Style
              </label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PRACTICAL_PROJECTS">Practical Hands-On Projects</option>
                <option value="STRUCTURED_COURSES">Structured Courses & Videos</option>
                <option value="READING_AND_EXERCISES">Reading Books & Drills</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="submit"
            disabled={isChecking}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md hover:shadow-indigo-500/25 active:scale-95 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isChecking ? 'Analyzing Feasibility...' : 'Analyze Feasibility'}</span>
          </button>
        </div>
      </form>

      {/* Feasibility Review Modal / Card */}
      {feasibility && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-200 dark:border-indigo-900/60 p-6 sm:p-8 shadow-xl animate-fadeIn space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Plausibility Analysis
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                Feasibility Status:{' '}
                <span
                  className={
                    feasibility.status === 'FEASIBLE'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : feasibility.status === 'CHALLENGING'
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : feasibility.status === 'AT_RISK'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }
                >
                  {feasibility.status}
                </span>
              </h3>
            </div>

            <div className="mt-3 sm:mt-0 flex items-center space-x-4 text-xs font-semibold">
              <div className="text-center">
                <span className="block text-slate-400 text-[10px] uppercase">Estimated Workload</span>
                <span className="text-slate-900 dark:text-white font-bold">{feasibility.estimatedWorkloadHours} hrs</span>
              </div>
              <div className="text-center">
                <span className="block text-slate-400 text-[10px] uppercase">Available Capacity</span>
                <span className="text-slate-900 dark:text-white font-bold">{feasibility.availableWorkingHours} hrs</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {feasibility.summaryMessage}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Constraints */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Important Constraints</h4>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                {feasibility.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Potential Risks */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40">
              <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">Potential Risks</h4>
              {feasibility.potentialRisks.length === 0 ? (
                <p className="text-xs text-amber-700/80 dark:text-amber-400">No critical timeline risks detected.</p>
              ) : (
                <ul className="text-xs text-amber-700/90 dark:text-amber-300/90 space-y-1.5 list-disc list-inside">
                  {feasibility.potentialRisks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Suggested Adjustments */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40">
              <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-2">Suggested Adjustments</h4>
              <ul className="text-xs text-indigo-700/90 dark:text-indigo-300/90 space-y-1.5 list-disc list-inside">
                {feasibility.suggestedAdjustments.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 leading-normal flex items-start space-x-2">
            <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              GoalMind does not guarantee outcome success; predictions reflect transparent workload-to-capacity mathematical modeling. You may adjust fields above or proceed to confirm.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Edit Goal Parameters
            </button>
            <button
              type="button"
              onClick={handleConfirmAndCreate}
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Creating Goal...' : 'Confirm Goal & Generate Roadmap'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
