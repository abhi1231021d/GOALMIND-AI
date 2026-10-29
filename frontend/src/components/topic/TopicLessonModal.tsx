import React, { useState, useEffect, useMemo } from 'react';
import { Task } from '../../types';
import { taskService } from '../../services/api';
import {
  getVideosForTopic,
  getBestVideoForTask,
  generateCustomYouTubeSearchUrl,
  cleanAndFormatEmbedUrl,
  RecommendedVideo,
  VideoSpecificationLevel,
  VideoSpecificationFormat,
  VideoSpecificationDuration,
  VideoSpecificationLanguage,
  VideoSpecificationFilters
} from '../../services/videoRecommendationService';
import {
  X,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Video,
  Layers,
  Award,
  ExternalLink,
  Edit2,
  Save,
  Check,
  Sparkles,
  HelpCircle,
  Lightbulb,
  FileCode,
  AlertCircle,
  Search,
  Filter,
  SlidersHorizontal,
  Youtube,
  RefreshCw,
  Eye,
  CheckCheck,
  ArrowRight
} from 'lucide-react';

interface TopicLessonModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStartTimer?: (task: Task) => void;
  onMarkComplete?: (task: Task) => void;
  onUpdateTask?: (updatedTask: Task) => Promise<void> | void;
}

export const TopicLessonModal: React.FC<TopicLessonModalProps> = ({
  task,
  isOpen,
  onClose,
  onStartTimer,
  onMarkComplete,
  onUpdateTask,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'explanation' | 'instructions' | 'criteria'>('video');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>('');
  const [customVideoUrl, setCustomVideoUrl] = useState<string>('');
  const [isEditingVideo, setIsEditingVideo] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // User Specification Filters
  const [selectedLevel, setSelectedLevel] = useState<VideoSpecificationLevel>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<VideoSpecificationFormat>('ALL');
  const [selectedDuration, setSelectedDuration] = useState<VideoSpecificationDuration>('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<VideoSpecificationLanguage>('ALL');
  const [customKeywords, setCustomKeywords] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Sync state when task changes - Automatically selects best video based on topic
  useEffect(() => {
    if (task) {
      const best = getBestVideoForTask(task.title, task.milestoneTitle, task.videoUrl);
      setActiveVideoUrl(best.embedUrl);
      setCustomVideoUrl(best.embedUrl);
      setSaveSuccessMessage(null);
      setIsEditingVideo(false);
      setCustomKeywords('');
      setSelectedLevel('ALL');
      setSelectedFormat('ALL');
      setSelectedDuration('ALL');
      setSelectedLanguage('ALL');
    }
  }, [task]);

  // Clean & formatted URLs
  const { embedUrl, watchUrl, isValid } = useMemo(() => {
    return cleanAndFormatEmbedUrl(activeVideoUrl);
  }, [activeVideoUrl]);

  // Curated recommendations based on user specification
  const recommendedVideos = useMemo(() => {
    if (!task) return [];
    const filters: VideoSpecificationFilters = {
      level: selectedLevel,
      format: selectedFormat,
      duration: selectedDuration,
      language: selectedLanguage,
      customKeywords: customKeywords.trim() || undefined,
    };
    return getVideosForTopic(task.title, task.milestoneTitle, filters);
  }, [task, selectedLevel, selectedFormat, selectedDuration, selectedLanguage, customKeywords]);

  if (!isOpen || !task) return null;

  // Handle switching active preview video
  const handleSelectVideo = (video: RecommendedVideo) => {
    setActiveVideoUrl(video.embedUrl);
    setCustomVideoUrl(video.embedUrl);
  };

  // Handle manual URL submission
  const handleApplyCustomUrl = () => {
    if (!customVideoUrl.trim()) return;
    const formatted = cleanAndFormatEmbedUrl(customVideoUrl);
    setActiveVideoUrl(formatted.embedUrl || customVideoUrl);
    setIsEditingVideo(false);
  };

  // Persist selected video to task in database and parent roadmap state
  const handleSaveVideoToTask = async (urlToSave?: string) => {
    const targetUrl = urlToSave || activeVideoUrl;
    if (!task) return;

    setIsSaving(true);
    setSaveSuccessMessage(null);

    const updatedTask: Task = {
      ...task,
      videoUrl: targetUrl,
    };

    try {
      // If task is persisted in DB with a valid ID
      if (task.id && task.id > 0) {
        await taskService.updateTask(task.id, {
          title: task.title,
          instructions: task.instructions,
          estimatedMinutes: task.estimatedMinutes,
          actualMinutes: task.actualMinutes,
          priority: task.priority,
          difficulty: task.difficulty,
          dueDate: task.dueDate,
          status: task.status,
          dependencies: task.dependencies,
          completionCriteria: task.completionCriteria,
          completionNotes: task.completionNotes,
          blockerNotes: task.blockerNotes,
          topicExplanation: task.topicExplanation,
          videoUrl: targetUrl,
        });
      }

      // Notify parent component (AiRoadmapPage, GoalDetailPage, DailyPlannerPage)
      if (onUpdateTask) {
        await onUpdateTask(updatedTask);
      }

      setSaveSuccessMessage('Video specification saved to task successfully!');
      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 3500);
    } catch (err) {
      console.error('Failed to update task video in database:', err);
      // Still notify parent in case it is in preview mode
      if (onUpdateTask) {
        onUpdateTask(updatedTask);
      }
      setSaveSuccessMessage('Video updated in current roadmap session.');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Custom YouTube search link
  const customSearchUrl = generateCustomYouTubeSearchUrl(
    task.title,
    customKeywords,
    selectedFormat,
    selectedLevel,
    selectedLanguage
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 max-h-[94vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-start justify-between p-5 sm:p-6 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 flex-shrink-0">
          <div className="space-y-1.5 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                Topic Video & Study Hub
              </span>
              {task.milestoneTitle && (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  • Milestone: {task.milestoneTitle}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {task.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Est: {task.estimatedMinutes} mins
              </span>
              <span>•</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                  task.priority === 'HIGH'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : task.priority === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                {task.priority} Priority
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Difficulty: {task.difficulty}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition flex-shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('video')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'video'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video & User Specifications</span>
          </button>
          <button
            onClick={() => setActiveTab('explanation')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'explanation'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Concept Explanation</span>
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'instructions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Practical Instructions</span>
          </button>
          <button
            onClick={() => setActiveTab('criteria')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
              activeTab === 'criteria'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Mastery Criteria</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {saveSuccessMessage && (
            <div className="flex items-center space-x-2 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl animate-fadeIn">
              <CheckCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {/* TAB 1: VIDEO LESSON & SPECIFICATION ENGINE */}
          {activeTab === 'video' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Active Video Player */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
                    <Video className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Active Topic Video Tutorial</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {watchUrl && (
                      <a
                        href={watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 transition flex items-center space-x-1"
                        title="Watch directly on YouTube (Fixes any embedding or restrictions errors)"
                      >
                        <Youtube className="w-3.5 h-3.5 text-red-600" />
                        <span>Watch on YouTube</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}

                    <button
                      onClick={() => setIsEditingVideo(!isEditingVideo)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{isEditingVideo ? 'Cancel' : 'Paste Custom URL'}</span>
                    </button>
                  </div>
                </div>

                {/* Paste Custom URL Drawer */}
                {isEditingVideo && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 animate-fadeIn">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Paste Any Video URL (YouTube watch, short, embed, or video stream):
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={customVideoUrl}
                        onChange={(e) => setCustomVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleApplyCustomUrl}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => handleSaveVideoToTask(customVideoUrl)}
                          disabled={isSaving}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save to Task</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video IFrame Container with Error Detection & Safe Fallback */}
                {embedUrl ? (
                  <div className="space-y-2">
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 shadow-md relative group">
                      <iframe
                        src={embedUrl}
                        title={`Video Tutorial for ${task.title}`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    {/* Embedding restriction & error notification */}
                    <div className="flex items-center justify-between p-2.5 px-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>
                          Notice an embedding error or restricted playback? Open directly via YouTube:
                        </span>
                      </div>
                      <a
                        href={watchUrl || activeVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center space-x-0.5 flex-shrink-0 ml-2"
                      >
                        <span>Open on YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center space-y-3">
                    <Video className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        No Video Currently Attached
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        Choose from the recommended videos below based on your specification, or search YouTube directly.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* USER SPECIFICATION FILTER PANEL */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-2 text-indigo-950 dark:text-indigo-200 font-bold text-xs uppercase tracking-wider">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Find Videos Based on Your Specification</span>
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:underline self-start sm:self-auto flex items-center space-x-1"
                  >
                    <Filter className="w-3 h-3" />
                    <span>{showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}</span>
                  </button>
                </div>

                {/* Primary Specification: Format / Learning Style */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    Learning Format & Depth:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: 'ALL', label: 'All Formats' },
                      { key: 'CRASH_COURSE', label: '⚡ Crash Course (Fast)' },
                      { key: 'HANDS_ON', label: '💻 Hands-on Code / Project' },
                      { key: 'DEEP_DIVE', label: '🔬 In-Depth Masterclass' },
                      { key: 'INTERVIEW_PREP', label: '🎯 Interview Drills' },
                    ].map((fmt) => (
                      <button
                        key={fmt.key}
                        onClick={() => setSelectedFormat(fmt.key as VideoSpecificationFormat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          selectedFormat === fmt.key
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collapsible Advanced Filters (Level, Duration, Language, Custom Keywords) */}
                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 animate-fadeIn">
                    {/* Level */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                        Skill Level:
                      </label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value as VideoSpecificationLevel)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="ALL">All Levels</option>
                        <option value="BEGINNER">Beginner Fundamentals</option>
                        <option value="INTERMEDIATE">Intermediate Practical</option>
                        <option value="ADVANCED">Advanced Architecture</option>
                      </select>
                    </div>

                    {/* Duration */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                        Duration / Pace:
                      </label>
                      <select
                        value={selectedDuration}
                        onChange={(e) => setSelectedDuration(e.target.value as VideoSpecificationDuration)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="ALL">Any Duration</option>
                        <option value="QUICK">Bite-sized (&lt; 15 mins)</option>
                        <option value="MEDIUM">Focused (15 - 45 mins)</option>
                        <option value="COMPREHENSIVE">Deep Lecture (45+ mins)</option>
                      </select>
                    </div>

                    {/* Language */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                        Language:
                      </label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value as VideoSpecificationLanguage)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="ALL">Any Language</option>
                        <option value="EN">English</option>
                        <option value="HI">Hindi (हिंदी)</option>
                        <option value="ES">Spanish (Español)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Custom Specification Prompt / Keywords Input */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    Custom Topic Specification / Specific Questions:
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={customKeywords}
                        onChange={(e) => setCustomKeywords(e.target.value)}
                        placeholder="e.g. explain with visual diagrams, virtual threads vs platform, common beginner mistakes..."
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <a
                      href={customSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition flex-shrink-0 shadow-sm"
                      title="Open YouTube with your exact custom specification search"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Search on YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* SPECIFICATION-MATCHED RECOMMENDED VIDEOS GRID */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Curated Educational Videos for this Topic ({recommendedVideos.length})</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Click to load into player or set as task video
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendedVideos.map((video) => {
                    const isCurrent = activeVideoUrl === video.embedUrl || activeVideoUrl === video.watchUrl;
                    return (
                      <div
                        key={video.id}
                        className={`p-4 rounded-2xl border transition text-xs flex flex-col justify-between space-y-3 ${
                          isCurrent
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-sm ring-1 ring-indigo-500/30'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {video.channel}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {video.durationLabel}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                            {video.title}
                          </h4>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {video.description}
                          </p>

                          <div className="flex flex-wrap gap-1 pt-1">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                              {video.format.replace('_', ' ')}
                            </span>
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                              {video.level}
                            </span>
                            {video.language !== 'EN' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                                {video.language}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                          <button
                            onClick={() => handleSelectVideo(video)}
                            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition ${
                              isCurrent
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{isCurrent ? 'Now Playing' : 'Preview Video'}</span>
                          </button>

                          <button
                            onClick={() => handleSaveVideoToTask(video.embedUrl)}
                            disabled={isSaving}
                            className="p-1.5 px-2.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition flex items-center space-x-1"
                            title="Save this specific video as the default tutorial for this task"
                          >
                            <Save className="w-3 h-3" />
                            <span>Set as Task Video</span>
                          </button>

                          <a
                            href={video.watchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                            title="Open on YouTube in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED CONCEPT EXPLANATION */}
          {activeTab === 'explanation' && (
            <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Topic Core Concept Breakdown</span>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                {task.topicExplanation ||
                  `In-depth study topic: ${task.title}. Understand the foundational theoretical principles, architectural trade-offs, and practical execution patterns before writing code or completing this work.`}
              </p>
              <div className="pt-2 flex items-start space-x-2.5 text-xs text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
                <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Pro-Tip:</strong> Review the specification-matched video tutorial first, take focused notes, and immediately anchor your understanding with a 30-minute focus timer session.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: PRACTICAL INSTRUCTIONS */}
          {activeTab === 'instructions' && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-fadeIn">
              <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
                <FileCode className="w-4 h-4 text-indigo-500" />
                <span>Step-by-Step Task Instructions</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                {task.instructions || 'Execute the planned exercises, write verified unit tests, and document your learnings.'}
              </p>
            </div>
          )}

          {/* TAB 4: MASTERY CRITERIA */}
          {activeTab === 'criteria' && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-fadeIn">
              <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Topic Completion Criteria</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                {task.completionCriteria || 'Able to build and verify working examples without referencing external solutions.'}
              </p>
            </div>
          )}
        </div>

        {/* Action Bar Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Status: <strong className="text-slate-800 dark:text-slate-200 uppercase">{task.status}</strong>
            </span>
            {activeVideoUrl && (
              <button
                onClick={() => handleSaveVideoToTask()}
                disabled={isSaving}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                title="Save current active video to task"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Video to Task'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {onStartTimer && task.status !== 'COMPLETED' && (
              <button
                onClick={() => {
                  onClose();
                  onStartTimer(task);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Focus Timer</span>
              </button>
            )}

            {onMarkComplete && task.status !== 'COMPLETED' && (
              <button
                onClick={() => {
                  onClose();
                  onMarkComplete(task);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Completed</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicLessonModal;
