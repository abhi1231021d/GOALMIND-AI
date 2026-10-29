import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Target, ArrowRight, Sparkles, BookOpen, Clock, ShieldCheck, ArrowLeft, Mic, FileCheck2, Bot } from 'lucide-react';
import { GoalMindBridgeModal, BridgePayload } from '../components/career/GoalMindBridgeModal';
import { careerService } from '../services/careerApi';
import '../styles/career-suite.css';

export const InterviewSimulatorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Search parameters for deep links
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialRole = searchParams.get('role') || '';
  const initialTopic = searchParams.get('topic') || '';
  const initialMode = searchParams.get('mode') || '';

  const [role, setRole] = useState(initialRole || 'Software Engineer');
  const [level, setLevel] = useState('Senior');
  const [type, setType] = useState('Mixed technical and behavioral');
  const [mode, setMode] = useState(initialMode || 'standard');
  const [company, setCompany] = useState('');
  const [count, setCount] = useState(5);
  const [topics, setTopics] = useState<string[]>(() => {
    if (initialTopic) {
      const lower = initialTopic.toLowerCase();
      if (lower.includes('code') || lower.includes('algorithm') || lower.includes('problem')) return ['Coding and problem solving'];
      if (lower.includes('design') || lower.includes('system') || lower.includes('architecture')) return ['System design'];
      if (lower.includes('behavior') || lower.includes('lead') || lower.includes('conflict')) return ['Behavioral'];
      return ['Technical fundamentals'];
    }
    return ['Technical fundamentals', 'System design', 'Behavioral'];
  });

  const [subView, setSubView] = useState<'dashboard' | 'setup' | 'interview' | 'library'>(() => {
    return (initialTopic || initialRole || initialMode) ? 'setup' : 'dashboard';
  });
  const [dashboardSubTab, setDashboardSubTab] = useState<'overview' | 'radar'>('overview');

  const [dashboard, setDashboard] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [libraryData, setLibraryData] = useState<any>(null);
  const [libSearch, setLibSearch] = useState('');
  const [libCompany, setLibCompany] = useState('');
  const [libCategory, setLibCategory] = useState('');
  const [libRound, setLibRound] = useState('');
  const [replayModal, setReplayModal] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Question player state
  const [answer, setAnswer] = useState('');
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [codeMode, setCodeMode] = useState(false);
  const [clarifierOpen, setClarifierOpen] = useState(false);
  const [clarifierQuery, setClarifierQuery] = useState('');
  const [isClarifying, setIsClarifying] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [activeHint, setActiveHint] = useState('');
  const [isRequestingHint, setIsRequestingHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStaff, setShowStaff] = useState(false);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  // GoalMind Bridge Modal State
  const [bridgePayload, setBridgePayload] = useState<BridgePayload | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('goalmind_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const handleConfirmBridge = (payload: BridgePayload) => {
    sessionStorage.setItem('goalmind_bridge_payload', JSON.stringify({
      title: `Master ${payload.skill}`,
      category: payload.category || 'Interview Preparation',
      reason: `${payload.sourceContext}: ${payload.notes || ''}`,
      targetOutcome: `Job-ready proficiency in ${payload.skill}`,
      suggestedDailyHours: 1.5,
      daysPerWeek: 5,
      difficulty: 'INTERMEDIATE',
    }));
    setBridgePayload(null);
    navigate('/goals/new');
  };

  const requestApi = async (path: string, payload: any) => {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 12000);
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
        signal: c.signal,
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Request could not be completed.');
      return d;
    } finally {
      clearTimeout(t);
    }
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await careerService.getInterviewDashboard();
      setDashboard(data);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const fetchLibrary = useCallback(async () => {
    if (libraryData) return;
    try {
      const data = await careerService.getCompanyLibrary();
      setLibraryData(data);
    } catch (_) {}
  }, [libraryData]);

  useEffect(() => {
    if (subView === 'library') fetchLibrary();
  }, [subView, fetchLibrary]);

  useEffect(() => {
    if (subView !== 'interview' || !session || !session.questions?.[currentIdx]) return;
    const currentQ = session.questions[currentIdx];
    if (currentQ.answer) return;
    const interval = setInterval(() => setQuestionSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [subView, session, currentIdx]);

  useEffect(() => {
    if (session && session.questions?.[currentIdx]) {
      const q = session.questions[currentIdx];
      setAnswer(q.answer === 'Skipped' ? '' : (q.answer || ''));
      setQuestionSeconds(0);
      setClarifierOpen(false);
      setClarifierQuery('');
      setActiveHint('');
      setHintsLeft(Math.max(0, 3 - (q.hintsUsed || 0)));
      setShowStaff(false);
      setFollowUpAnswer('');
      setCodeMode(/coding|problem|algorithm/i.test(`${q.category} ${q.question}`));
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setSpeechActive(false);
    }
  }, [session, currentIdx]);

  // Speech Recognition setup
  const recognitionRef = useRef<any>(null);
  useEffect(() => {
    const SpeechRec = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.onstart = () => setIsListening(true);
      rec.onresult = (e: any) => {
        let interim = '', finalT = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) finalT += e.results[i][0].transcript + ' ';
          else interim += e.results[i][0].transcript;
        }
        setAnswer(prev => (prev ? prev.trim() + ' ' : '') + finalT + interim);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) return showToast('Speech recognition not supported in this browser.', 'error');
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (_) {}
    }
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.onstart = () => setSpeechActive(true);
    u.onend = () => setSpeechActive(false);
    u.onerror = () => setSpeechActive(false);
    window.speechSynthesis.speak(u);
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeechActive(false);
  };

  const telemetry = useMemo(() => {
    const val = answer || '';
    const we = (val.match(/\b(we|we've|we'll|we'd|our|ours)\b/gi) || []).length;
    const i = (val.match(/\b(i|i've|i'll|i'd|my|mine|myself)\b/gi) || []).length;
    const fluffWords = ['leveraged synergies', 'synergies', 'worked hard', 'went above and beyond', 'paradigm shift', 'best of both worlds', 'seamless integration', 'game changer', 'team player', 'touch base', 'value add', 'win-win', 'bandwidth'];
    const lower = val.toLowerCase();
    const fluffCount = fluffWords.filter(w => lower.includes(w)).length;
    const words = val.trim().split(/\s+/).filter(Boolean).length;
    const wpm = words > 0 ? Math.round(words * 60 / Math.max(1, questionSeconds)) : 0;
    const fillers = (val.match(/\b(um|uh|er|ah|like|you know|basically|actually|literally|kind of|sort of|i mean)\b/gi) || []).length;
    const metricMatches = (val.match(/\b(\d+%|\d+x|\d+\s*(ms|s|sec|seconds|minutes|hours|days|rps|qps|rpm|gb|mb|tb|k|users|requests|reqs|servers|instances|nodes|dollars|\$)|o\(n\)|o\(1\)|o\(log n\))\b/gi) || []).length;
    const techMatches = (val.match(/\b(postgresql|mysql|mongodb|redis|kafka|rabbitmq|docker|kubernetes|aws|gcp|azure|spring|hibernate|grpc|rest|graphql|btree|index|cache|sharding|replication|partition|concurrency|mutex|semaphore|threadpool|p99|latency|throughput|circuit breaker|idempotenc|deadlock|outbox|webhook|react|typescript|javascript|nextjs|dom|webpack|vite|ssr|hydration|bundle|redux|accessibility|lcp|cls|tti|python|pytorch|tensorflow|spark|airflow|etl|snowflake|bigquery|vector|embedding|rag|llm|precision|recall|f1|roc|auc|kotlin|swift|coroutine|rust|golang|hashmap|linkedhashmap|trie|bfs|dfs)\b/gi) || []).length;
    const evidenceScore = Math.min(100, metricMatches * 25 + techMatches * 15 + (val.length > 200 ? 20 : 0));
    return { we, i, fluffCount, wpm, fillers, evidenceScore };
  }, [answer, questionSeconds]);

  const startSessionDirect = async (override: any = {}) => {
    const targetRole = (override.role || role || 'Software Engineer').trim();
    if (!targetRole) return showToast('Please enter a target role.', 'error');
    setIsBuilding(true);
    setSubView('interview');
    try {
      const questionCountNum = Math.max(1, Math.min(10, Number(override.count || count) || 5));
      const targetMode = override.mode || mode;
      const newSession = await careerService.startInterviewSession({
        role: targetRole,
        experienceLevel: override.level || level,
        interviewType: override.type || type,
        topics: override.topics || topics,
        questionCount: questionCountNum,
        mode: targetMode,
        projectTitle: override.projectTitle || '',
        projectSummary: override.projectSummary || '',
        company: (override.company || company || '').trim(),
      });
      setSession(newSession);
      setCurrentIdx(0);
      setSubView('interview');
      fetchDashboard();
      showToast(`Interview session launched for ${targetRole}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to start interview session', 'error');
      setSubView('setup');
    } finally {
      setIsBuilding(false);
    }
  };

  const submitAnswer = async (skip = false) => {
    if (!session || !session.questions?.[currentIdx]) return;
    const q = session.questions[currentIdx];
    if (!skip && answer.trim().length < 1) return showToast('Please write or dictate an answer first.', 'error');
    setIsSubmitting(true);
    stopAudio();
    if (isListening) toggleMic();
    try {
      const payload = skip ? { answer: 'Skipped' } : { answer: answer.trim(), durationSeconds: questionSeconds, pauseCount: 0 };
      const res = await careerService.submitInterviewAnswer(session.id, q.id, payload, skip);
      const updatedQuestions = [...session.questions];
      updatedQuestions[currentIdx] = { ...q, ...res };
      setSession({ ...session, questions: updatedQuestions });
      fetchDashboard();
      showToast(skip ? 'Question skipped.' : `Answer evaluated: ${res.score}/10!`, skip ? 'info' : 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to evaluate answer', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitFollowUp = async () => {
    if (!session || !session.questions?.[currentIdx]) return;
    const q = session.questions[currentIdx];
    if (followUpAnswer.trim().length < 15) return showToast('Please provide a substantive follow-up defense.', 'error');
    setIsSubmittingFollowUp(true);
    try {
      const res = await careerService.defendFollowUp(session.id, q.id, followUpAnswer.trim());
      const updatedQuestions = [...session.questions];
      updatedQuestions[currentIdx] = { ...q, ...res };
      setSession({ ...session, questions: updatedQuestions });
      fetchDashboard();
      showToast(`Follow-up defense evaluated! Score: ${res.followUpScore || res.score || 9}/10`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to evaluate follow-up', 'error');
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  const sendClarifier = async () => {
    if (!session || !session.questions?.[currentIdx] || !clarifierQuery.trim()) return;
    const q = session.questions[currentIdx];
    setIsClarifying(true);
    try {
      const res = await careerService.askClarification(session.id, q.id, clarifierQuery.trim());
      const updatedClarifications = [...(q.clarifications || []), res];
      const updatedQuestions = [...session.questions];
      updatedQuestions[currentIdx] = { ...q, clarifications: updatedClarifications };
      setSession({ ...session, questions: updatedQuestions });
      setClarifierQuery('');
    } catch (err: any) {
      showToast(err.message || 'Clarification unavailable', 'error');
    } finally {
      setIsClarifying(false);
    }
  };

  const requestHint = async () => {
    if (!session || !session.questions?.[currentIdx] || hintsLeft <= 0) return;
    const q = session.questions[currentIdx];
    setIsRequestingHint(true);
    try {
      const res = await careerService.requestHint(session.id, q.id);
      setActiveHint(res.hint);
      setHintsLeft(Math.max(0, hintsLeft - 1));
      const updatedQuestions = [...session.questions];
      updatedQuestions[currentIdx] = { ...q, hintsUsed: (q.hintsUsed || 0) + 1 };
      setSession({ ...session, questions: updatedQuestions });
    } catch (err: any) {
      showToast(err.message || 'Hint unavailable', 'error');
    } finally {
      setIsRequestingHint(false);
    }
  };

  const resumeSession = async (sessId: number) => {
    try {
      const res = await fetch(`/api/sessions/${sessId}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSession(data);
        const nextUnanswered = (data.questions || []).findIndex((q: any) => !q.answer);
        setCurrentIdx(nextUnanswered >= 0 ? nextUnanswered : 0);
        setSubView('interview');
        setReplayModal(null);
        showToast(`Resumed session: ${data.role}`, 'info');
        return;
      }
    } catch (_) {}

    const found = dashboard?.recentSessions?.find((s: any) => s.id === sessId);
    if (found) {
      setSession(found);
      const nextUnanswered = (found.questions || []).findIndex((q: any) => !q.answer);
      setCurrentIdx(nextUnanswered >= 0 ? nextUnanswered : 0);
      setSubView('interview');
      setReplayModal(null);
      showToast(`Resumed session: ${found.role}`, 'info');
    }
  };

  const openReplay = async (sessId: number) => {
    try {
      const res = await fetch(`/api/sessions/${sessId}/replay`, { headers: authHeaders() });
      if (res.ok) setReplayModal(await res.json());
    } catch (err: any) {
      showToast(`Could not load replay: ${err.message}`, 'error');
    }
  };

  const resetAllSessions = async () => {
    if (!window.confirm('Reset all interview history? This cannot be undone.')) return;
    try {
      await fetch('/api/sessions', { method: 'DELETE', headers: authHeaders() });
      setSession(null);
      fetchDashboard();
      showToast('Interview history reset.', 'info');
    } catch (err: any) {
      showToast(`Reset failed: ${err.message}`, 'error');
    }
  };

  const practiceWeakest = () => {
    const skills = dashboard?.skills || [];
    if (!skills.length) return;
    const sorted = [...skills].sort((a, b) => a.score - b.score || a.attempts - b.attempts);
    const weakest = sorted[0];
    const topicMap: Record<string, string> = {
      'Technical depth': 'Technical fundamentals',
      'Problem solving': 'Coding and problem solving',
      'System design': 'System design',
      'Behavioral': 'Behavioral',
      'Communication': 'Behavioral',
    };
    const mapped = topicMap[weakest.name] || 'Technical fundamentals';
    setTopics([mapped]);
    setType(mapped === 'Behavioral' ? 'Behavioral' : 'Mixed technical and behavioral');
    setSubView('setup');
    showToast(`Focused studio on your lowest-scoring competency: ${weakest.name} (${weakest.score}%)`, 'info');
  };

  const practiceCompanyTarget = (comp: string) => {
    setCompany(comp);
    setSubView('setup');
    showToast(`Target company set to ${comp}`, 'info');
  };

  const insertTemplate = () => {
    const template = codeMode
      ? `// 1. Assumptions & Constraints:\n// Input scale, memory limits, edge cases\n\n// 2. Implementation:\n\n\n// 3. Complexity & Edge Cases:\n// Time: O(N) | Space: O(1) — handles empty/null & duplicates`
      : `Situation & Context: In my project, I needed to resolve \n\nAction (What I personally engineered): I implemented \n\nResult (Quantified Impact & Trade-offs): Achieved % improvement by `;
    setAnswer(prev => (prev.trim() ? `${prev.trim()}\n\n${template}` : template));
  };

  const answeredList = useMemo(() => {
    const list: any[] = [];
    (dashboard?.recentSessions || []).forEach((sess: any) => {
      (sess.questions || []).forEach((q: any) => {
        if (q.answer && q.answer.trim() && q.answer !== 'Skipped') {
          list.push({ ...q, sessionId: sess.id, role: sess.role, company: sess.company, createdAt: sess.createdAt });
        }
      });
    });
    return list;
  }, [dashboard]);

  const telemetryStats = useMemo(() => {
    const total = answeredList.length;
    if (!total) return null;
    let totalI = 0, totalWe = 0, totalEvidence = 0, fluffCount = 0, starFullCount = 0, totalWpm = 0, countWithWpm = 0, totalFillers = 0;
    const coveredSet = new Set<string>(), missedSet = new Set<string>(), warnings: any[] = [];
    answeredList.forEach(q => {
      const t = q.telemetry || {};
      totalI += Number(t.iCount || 0);
      totalWe += Number(t.weCount || 0);
      totalEvidence += Number(t.evidenceScore || 0);
      fluffCount += (Array.isArray(t.fluffDetected) ? t.fluffDetected : []).length;
      if (t.hasSituation && t.hasTask && t.hasAction && t.hasResult) starFullCount++;
      if (t.wpm > 0) { totalWpm += t.wpm; countWithWpm++; }
      totalFillers += Number(t.fillerWordCount || 0);
      const sm = q.staffModel || {};
      (Array.isArray(sm.conceptsCovered) ? sm.conceptsCovered : []).forEach(c => coveredSet.add(c));
      (Array.isArray(sm.conceptsMissed) ? sm.conceptsMissed : []).forEach(c => missedSet.add(c));
      if ((q.score ?? 10) < 6) warnings.push({ critical: true, title: `Scored ${q.score}/10 on ${q.category || 'Topic'}`, body: q.feedback || 'Needs stronger architectural trade-offs.' });
      if (t.weCount > t.iCount * 2 && t.weCount >= 2) warnings.push({ critical: false, title: `Heavy "We" usage ("We": ${t.weCount} vs "I": ${t.iCount})`, body: `In "${(q.question || '').slice(0, 50)}...", clarify your personal contribution.` });
      if (Array.isArray(t.fluffDetected) && t.fluffDetected.length > 0) warnings.push({ critical: false, title: `Buzzword Fluff: ${t.fluffDetected.join(', ')}`, body: `Replace vague buzzwords with concrete numbers and trade-offs.` });
    });
    const ownershipPct = total ? Math.round(totalI / Math.max(1, totalI + totalWe) * 100) : 0;
    const avgEvidence = total ? Math.round(totalEvidence / total) : 0;
    const starRate = total ? Math.round(starFullCount / total * 100) : 0;
    const avgWpm = countWithWpm ? Math.round(totalWpm / countWithWpm) : 0;
    return { count: total, ownershipPct, avgEvidence, fluffCount, starRate, avgWpm, totalFillers, covered: Array.from(coveredSet), missed: Array.from(missedSet), warnings };
  }, [answeredList]);

  const readinessScore = Math.max(0, Math.min(100, Number(dashboard?.readiness || 0)));
  const ringCirc = 2 * Math.PI * 52;
  const ringOffset = ringCirc - (readinessScore / 100) * ringCirc;

  const currentQ = session?.questions?.[currentIdx];
  const answeredCount = session?.questions?.filter((q: any) => Boolean(q.answer)).length || 0;
  const isQuestionAnswered = Boolean(currentQ?.answer);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn career-suite-root">
      {/* GoalMind Unified Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 sm:p-8 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl text-white shadow-xl shadow-indigo-600/15">
        <div className="max-w-2xl mb-4 md:mb-0">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold mb-3">
            <Mic className="w-3.5 h-3.5 text-cyan-300" />
            <span>GoalMind Career Intelligence Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Interactive AI Interview Simulator
          </h1>
          <p className="text-sm text-indigo-100/90 mt-1.5 leading-relaxed">
            Role-specific STAR practice, real-time pacing telemetry, company question libraries, and adaptive coaching.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSubView('setup')}
            className={`inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-2xl shadow-md transition active:scale-95 ${
              subView === 'setup'
                ? 'bg-white text-indigo-700'
                : 'bg-indigo-500/40 hover:bg-indigo-500/60 text-white border border-white/20'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Practice Session</span>
          </button>
          <button
            type="button"
            onClick={() => setSubView('library')}
            className={`inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-2xl shadow-md transition active:scale-95 ${
              subView === 'library'
                ? 'bg-white text-indigo-700'
                : 'bg-indigo-500/40 hover:bg-indigo-500/60 text-white border border-white/20'
            }`}
          >
            <BookOpen className="w-4 h-4 text-cyan-300" />
            <span>Company Library</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/resume-analyzer')}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-500/40 hover:bg-indigo-500/60 text-white border border-white/20 text-xs font-bold rounded-2xl backdrop-blur-sm transition active:scale-95"
          >
            <FileCheck2 className="w-4 h-4 text-cyan-300" />
            <span>Resume Analyzer</span>
          </button>
        </div>
      </div>

      <div className="interview-hub">
        {toast && (
          <div className={`alert ${toast.type === 'error' ? '' : 'tone-good'}`} style={{ position: 'fixed', right: '24px', bottom: '24px', zIndex: 120 }}>
            {toast.message}
          </div>
        )}

        <header className="hub-nav-bar">
          <div className="hub-nav-group">
            <button
              type="button"
              className={`hub-tab-btn ${subView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setSubView('dashboard')}
            >
              📊 Command Center
            </button>
            <button
              type="button"
              className={`hub-tab-btn ${subView === 'setup' ? 'active' : ''}`}
              onClick={() => setSubView('setup')}
            >
              ⚡ Live Studio Setup
            </button>
            {session && (
              <button
                type="button"
                className={`hub-tab-btn ${subView === 'interview' ? 'active' : ''}`}
                onClick={() => setSubView('interview')}
              >
                🎙️ Live Session ({answeredCount}/{session.questions.length})
              </button>
            )}
            <button
              type="button"
              className={`hub-tab-btn ${subView === 'library' ? 'active' : ''}`}
              onClick={() => setSubView('library')}
            >
              🏢 Company Library (100 Questions)
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="ghost-btn"
              style={{ padding: '6px 12px', fontSize: '11px' }}
              onClick={() => setSubView('setup')}
            >
              + New Simulation
            </button>
            <button
              type="button"
              className="ghost-btn"
              style={{ padding: '6px 12px', fontSize: '11px', color: '#fda4af' }}
              onClick={resetAllSessions}
            >
              Reset History
            </button>
          </div>
        </header>

        {subView === 'dashboard' && (
          <div>
            <div className="hub-hero">
              <div className="hero" style={{ padding: 0 }}>
                <div className="eyebrow-pill">
                  <span className="spark">⚡</span> EXECUTIVE INTERVIEW INTELLIGENCE &amp; TELEMETRY
                </div>
                <h1 style={{ fontSize: '38px', margin: '12px 0 10px' }}>
                  Turn technical depth into <span style={{ color: 'var(--cyan)' }}>executive readiness.</span>
                </h1>
                <p>
                  Real-time STAR telemetry, Staff Engineer 10/10 diff benchmarking, and adaptive technical defense engineered for high-bar interviews.
                </p>
                <div className="hero-metric-pills">
                  <div className="metric-pill"><span>✓</span> Neural AI Evaluation</div>
                  <div className="metric-pill"><span>⚡</span> Live Fluff &amp; Ownership Radar</div>
                  <div className="metric-pill"><span>★</span> Staff Engineer Ghost Diffs</div>
                  <div className="metric-pill"><span>●</span> 100 Verified Company Prompts</div>
                </div>
              </div>
              <div className="readiness-ring-card card">
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span className="section-kicker">READINESS</span>
                  <span className={`distance-tag ${readinessScore >= 75 ? 'distance-ready' : readinessScore >= 45 ? 'distance-small' : 'distance-step'}`}>
                    {!dashboard?.totalSessions ? 'UNINITIALIZED' : readinessScore >= 75 ? 'EXEC READY' : 'CALIBRATING'}
                  </span>
                </div>
                <div className="ring-wrap">
                  <svg className="ring-svg" viewBox="0 0 130 130">
                    <circle className="ring-svg-track" cx="65" cy="65" r="52" />
                    <circle className="ring-svg-fill" cx="65" cy="65" r="52" stroke="#38bdf8" strokeDasharray={ringCirc} strokeDashoffset={ringOffset} />
                  </svg>
                  <div className="ring-inner-val">
                    <strong>{readinessScore}%</strong>
                    <small>CALIBRATED</small>
                  </div>
                </div>
                <small style={{ color: '#94a3b8', fontSize: '11px' }}>
                  {!dashboard?.totalSessions ? 'Complete a session to calibrate' : readinessScore >= 75 ? 'Strong calibration — practice edge cases' : 'Keep practicing lowest competency'}
                </small>
              </div>
            </div>

            <div className="subnav-tabs" style={{ marginTop: '24px' }}>
              <button
                type="button"
                className={`subnav-tab ${dashboardSubTab === 'overview' ? 'active' : ''}`}
                onClick={() => setDashboardSubTab('overview')}
              >
                📊 Overview &amp; Competencies
              </button>
              <button
                type="button"
                className={`subnav-tab ${dashboardSubTab === 'radar' ? 'active' : ''}`}
                onClick={() => setDashboardSubTab('radar')}
              >
                🛡️ STAR &amp; Communication Telemetry
              </button>
            </div>

            {dashboardSubTab === 'overview' ? (
              <>
                <div className="score-grid">
                  <div className="score-card">
                    <div className="score-copy"><b>{dashboard?.totalSessions || 0}</b><span>Sessions Completed</span></div>
                  </div>
                  <div className="score-card">
                    <div className="score-copy"><b>{answeredList.length}</b><span>Answers Reviewed</span></div>
                  </div>
                  <div className="score-card">
                    <div className="score-copy"><b>5 Tracks</b><span>Core Competency Domains</span></div>
                  </div>
                  <div className="score-card" style={{ cursor: 'pointer' }} onClick={practiceWeakest}>
                    <div className="score-copy"><b style={{ color: 'var(--cyan)' }}>Practice Weakest →</b><span>Target Lowest Score</span></div>
                  </div>
                </div>

                <div className="card" style={{ padding: '22px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <div className="section-kicker">5-DIMENSION KNOWLEDGE MAP</div>
                      <h3 style={{ margin: '4px 0 0', color: '#f8fafc' }}>Competency Calibration</h3>
                    </div>
                    <button type="button" className="text-btn" onClick={practiceWeakest}>Practice Weakest Skill →</button>
                  </div>
                  <div className="skill-bar-row">
                    {(dashboard?.skills || []).map((skill: any) => (
                      <div className="skill-card-item" key={skill.name}>
                        <div style={{ width: '180px' }}>
                          <strong style={{ fontSize: '12px', display: 'block' }}>{skill.name}</strong>
                          <small style={{ color: 'var(--cyan)', fontSize: '10px' }}>{skill.trend}</small>
                        </div>
                        <div className="skill-bar-track">
                          <div className="skill-bar-fill" style={{ width: `${skill.score}%`, background: skill.color || '#38bdf8' }} />
                        </div>
                        <span style={{ font: '700 12px var(--font-mono)', minWidth: '40px', textAlign: 'right' }}>{skill.score}%</span>
                        <small style={{ color: '#94a3b8', fontSize: '10px', minWidth: '80px', textAlign: 'right' }}>{skill.attempts} reviewed</small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ padding: '22px', marginBottom: '20px' }}>
                  <div className="section-kicker">TARGET COMPANY TRACKS</div>
                  <h3 style={{ margin: '4px 0 14px', color: '#f8fafc' }}>Fast Calibration Sprints</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {[
                      { name: 'Google', desc: 'Distributed systems, streaming algorithms, Googleyness', bg: 'linear-gradient(135deg, #6366f1, #38bdf8)' },
                      { name: 'Microsoft', desc: 'Cloud architecture, core data structures, cross-team design', bg: 'linear-gradient(135deg, #0ea5e9, #10b981)' },
                      { name: 'Stripe', desc: 'Idempotent APIs, ledger consistency, webhook reliability', bg: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }
                    ].map(c => (
                      <div key={c.name} className="card" style={{ padding: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => practiceCompanyTarget(c.name)}>
                        <b style={{ width: '36px', height: '36px', borderRadius: '8px', background: c.bg, display: 'grid', placeItems: 'center', color: '#fff', fontSize: '14px' }}>{c.name[0]}</b>
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '13px' }}>{c.name}</strong>
                          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>{c.desc}</span>
                        </div>
                        <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>→</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ padding: '22px' }}>
                  <div className="section-kicker">RECENT SESSIONS</div>
                  <h3 style={{ margin: '4px 0 14px', color: '#f8fafc' }}>Practice Trail &amp; Replay Archive</h3>
                  {(dashboard?.recentSessions || []).length === 0 ? (
                    <p className="upload-copy" style={{ margin: 0 }}>
                      No practice sessions completed yet. Click <strong>+ New Simulation</strong> above to begin your first adaptive run.
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {(dashboard?.recentSessions || []).map((s: any) => {
                        const qList = Array.isArray(s.questions) ? s.questions : [];
                        const ansCount = qList.filter(q => Boolean(q.answer)).length;
                        const totalQ = qList.length;
                        const isIncomplete = s.score === null;
                        return (
                          <div
                            key={s.id}
                            className="card"
                            style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => (isIncomplete ? resumeSession(s.id) : openReplay(s.id))}
                          >
                            <div>
                              <strong style={{ fontSize: '13px' }}>{s.role} {s.company ? `• ${s.company}` : ''}</strong>
                              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>
                                {s.mode === 'project-defense' ? 'Project defense' : 'Adaptive practice'} • {ansCount}/{totalQ} answered • {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                            {isIncomplete ? (
                              <span className="distance-tag distance-small">⚡ Resume ({ansCount}/{totalQ}) →</span>
                            ) : (
                              <span className="distance-tag distance-ready">{s.score}% Replay →</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div>
                {!telemetryStats ? (
                  <div className="card empty-state" style={{ minHeight: '280px' }}>
                    <h3>No Answer Telemetry Recorded Yet</h3>
                    <p>Complete at least one practice question in Live Studio to unlock your real-time STAR structure radar, "I" vs "We" ratio, and concept coverage map.</p>
                    <button type="button" className="primary-btn" style={{ width: 'auto', marginTop: '14px' }} onClick={() => setSubView('setup')}>
                      ⚡ Launch Studio
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="gate-grid-5">
                      <div className="gate-card">
                        <span className={`chip-tag ${telemetryStats.ownershipPct >= 60 ? 'matched' : 'missing'}`}>
                          {telemetryStats.ownershipPct >= 60 ? 'STRONG "I"' : 'NEEDS "I"'}
                        </span>
                        <h4>Ownership Agency</h4>
                        <strong>{telemetryStats.ownershipPct}% "I"</strong>
                        <p>Measures personal vs team pronoun frequency across answers.</p>
                      </div>
                      <div className="gate-card">
                        <span className={`chip-tag ${telemetryStats.avgEvidence >= 50 ? 'matched' : 'missing'}`}>
                          {telemetryStats.avgEvidence >= 50 ? 'VERIFIED' : 'LOW METRICS'}
                        </span>
                        <h4>Metric Density</h4>
                        <strong>{telemetryStats.avgEvidence}%</strong>
                        <p>Density of quantified numbers (ms, %, QPS) and tools.</p>
                      </div>
                      <div className="gate-card">
                        <span className={`chip-tag ${telemetryStats.fluffCount === 0 ? 'matched' : 'missing'}`}>
                          {telemetryStats.fluffCount === 0 ? 'CLEAN' : 'FLAGGED'}
                        </span>
                        <h4>Fluff &amp; Cliches</h4>
                        <strong>{telemetryStats.fluffCount} Detected</strong>
                        <p>Vague corporate jargon and buzzword detector.</p>
                      </div>
                      <div className="gate-card">
                        <span className={`chip-tag ${telemetryStats.starRate >= 60 ? 'matched' : 'missing'}`}>
                          {telemetryStats.starRate >= 60 ? 'STRUCTURED' : 'PARTIAL'}
                        </span>
                        <h4>STAR Structure</h4>
                        <strong>{telemetryStats.starRate}%</strong>
                        <p>Complete 4-part STAR / Algorithmic answers.</p>
                      </div>
                      <div className="gate-card">
                        <span className={`chip-tag ${telemetryStats.avgWpm >= 100 && telemetryStats.avgWpm <= 165 ? 'matched' : 'missing'}`}>
                          {telemetryStats.avgWpm >= 100 && telemetryStats.avgWpm <= 165 ? 'OPTIMAL' : 'CALIBRATING'}
                        </span>
                        <h4>Vocal Cadence</h4>
                        <strong>{telemetryStats.avgWpm} WPM</strong>
                        <p>Speech pacing and {telemetryStats.totalFillers} total filler hesitations.</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <div className="card" style={{ padding: '22px' }}>
                        <div className="section-kicker">CONCEPT COVERAGE TELEMETRY</div>
                        <h3 style={{ margin: '4px 0 14px', color: '#f8fafc' }}>Covered vs. Missed Concepts</h3>
                        <small style={{ color: '#6ee7b7', font: '700 11px var(--font-mono)', display: 'block', marginBottom: '6px' }}>✓ CONCEPTS YOU COVERED</small>
                        <div className="chips" style={{ marginBottom: '14px' }}>
                          {telemetryStats.covered.length ? telemetryStats.covered.map(c => <span className="chip-tag matched" key={c}>✓ {c}</span>) : <span style={{ color: '#94a3b8', fontSize: '11px' }}>None recorded yet</span>}
                        </div>
                        <small style={{ color: '#fde68a', font: '700 11px var(--font-mono)', display: 'block', marginBottom: '6px' }}>⚠ CONCEPTS MISSED IN ANSWERS</small>
                        <div className="chips">
                          {telemetryStats.missed.length ? (
                            telemetryStats.missed.map(c => (
                              <span
                                className="chip-tag missing"
                                key={c}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setBridgePayload({
                                  skill: c,
                                  category: 'Interview Concepts',
                                  sourceContext: 'Missed in Mock Interview',
                                  notes: `Concept identified as missed across interview simulation responses: ${c}`
                                })}
                              >
                                ⚠ {c} <b style={{ color: 'var(--indigo)', marginLeft: '4px' }}>🎯 Master in GoalMind →</b>
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>None missed</span>
                          )}
                        </div>
                      </div>

                      <div className="card" style={{ padding: '22px' }}>
                        <div className="section-kicker">COACH IMPROVEMENT LOG</div>
                        <h3 style={{ margin: '4px 0 14px', color: '#f8fafc' }}>Flagged Answers &amp; Ownership Alerts</h3>
                        {!telemetryStats.warnings.length ? (
                          <div className="warning-callout-card" style={{ borderColor: 'rgba(16,185,129,.4)', background: 'rgba(16,185,129,.1)', borderLeftColor: '#10b981' }}>
                            <strong style={{ color: '#6ee7b7' }}>✓ All Answered Questions Passed Telemetry Checks</strong>
                            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#cbd5e1' }}>No low scores, pronoun ambiguity, or buzzword fluff detected.</p>
                          </div>
                        ) : (
                          telemetryStats.warnings.slice(0, 4).map((w, idx) => (
                            <div key={idx} className="warning-callout-card" style={{ marginBottom: '10px' }}>
                              <strong style={{ color: w.critical ? '#fda4af' : '#fde68a' }}>{w.critical ? '🚨' : '⚠️'} {w.title}</strong>
                              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#cbd5e1' }}>{w.body}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {subView === 'setup' && (
          <div className="card setup-box">
            <div className="section-kicker">PERSONALIZED SIMULATION STUDIO</div>
            <h2 style={{ margin: '4px 0 10px', fontSize: '24px', color: '#f8fafc' }}>Build Your Tailored Simulation</h2>
            <p className="upload-copy" style={{ marginBottom: '20px' }}>
              Configure an adaptive interview tailored to your target position and focus competencies with live STAR telemetry.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                startSessionDirect();
              }}
            >
              <div className="setup-form-grid">
                <div>
                  <label style={{ display: 'block', font: '600 11px var(--font-sans)', color: 'var(--text-head)' }}>Target Role</label>
                  <input
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', marginTop: '6px', fontSize: '12px' }}
                  />

                  <label style={{ display: 'block', font: '600 11px var(--font-sans)', color: 'var(--text-head)', marginTop: '14px' }}>Target Company (Optional)</label>
                  <input
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="e.g. Google, Microsoft, Stripe"
                    style={{ width: '100%', padding: '10px 12px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', marginTop: '6px', fontSize: '12px' }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
                    <div>
                      <label style={{ display: 'block', font: '600 11px var(--font-sans)', color: 'var(--text-head)' }}>Seniority Level</label>
                      <select
                        value={level}
                        onChange={e => setLevel(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', marginTop: '6px', fontSize: '12px' }}
                      >
                        <option value="Junior">Junior (0-2 yrs)</option>
                        <option value="Mid-level">Mid-level (3-5 yrs)</option>
                        <option value="Senior">Senior (5-8 yrs)</option>
                        <option value="Staff / Principal">Staff / Principal (8+ yrs)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', font: '600 11px var(--font-sans)', color: 'var(--text-head)' }}>Question Count</label>
                      <select
                        value={count}
                        onChange={e => setCount(Number(e.target.value))}
                        style={{ width: '100%', padding: '10px 12px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', marginTop: '6px', fontSize: '12px' }}
                      >
                        <option value={3}>3 Questions (Fast sprint)</option>
                        <option value={5}>5 Questions (Standard simulation)</option>
                        <option value={8}>8 Questions (Full loop)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', font: '600 11px var(--font-sans)', color: 'var(--text-head)' }}>Competency Focus Areas</label>
                  <div className="topic-select-grid">
                    {[
                      { id: 'Technical fundamentals', title: 'Technical Fundamentals', desc: 'Core architecture & tools' },
                      { id: 'System design', title: 'System Design', desc: 'Scalability & tradeoffs' },
                      { id: 'Coding and problem solving', title: 'Problem Solving', desc: 'Algorithms & code logic' },
                      { id: 'Behavioral', title: 'Behavioral & Leadership', desc: 'STAR conflict & ownership' },
                    ].map(t => {
                      const isSelected = topics.includes(t.id);
                      return (
                        <div
                          key={t.id}
                          className={`topic-tile ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setTopics(prev => isSelected ? prev.filter(x => x !== t.id) : [...prev, t.id]);
                          }}
                        >
                          <div>
                            <strong>{t.title}</strong>
                            <small>{t.desc}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <button type="submit" className="primary-btn" disabled={isBuilding}>
                      {isBuilding ? <><span className="spinner" /> Synthesizing Session...</> : <>Build &amp; Launch Interview <b>→</b></>}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {subView === 'interview' && (
          isBuilding ? (
            <div className="card" style={{ padding: '48px 24px', textAlign: 'center', margin: '32px auto', maxWidth: '640px' }}>
              <span className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px', display: 'inline-block' }} />
              <h2 style={{ fontSize: '20px', color: '#f8fafc', margin: '0 0 8px' }}>Synthesizing Your Adaptive Interview...</h2>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                Calibrating questions tailored to {role || 'your target role'}.
              </p>
            </div>
          ) : session && currentQ ? (
            <div className="workspace-interview">
              <aside className="card rail-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="section-kicker">QUESTION MAP</span>
                  <strong style={{ font: '700 11px var(--font-mono)', color: 'var(--cyan)' }}>
                    {currentIdx + 1} / {(session?.questions || []).length}
                  </strong>
                </div>
                {(session?.questions || []).map((q: any, idx: number) => {
                  const isDone = Boolean(q.answer);
                  const isSkip = q.answer === 'Skipped';
                  return (
                    <button
                      key={q.id || idx}
                      type="button"
                      className={`rail-btn ${idx === currentIdx ? 'active' : ''} ${isDone ? 'done' : ''}`}
                      onClick={() => setCurrentIdx(idx)}
                    >
                      <span>{isDone ? (isSkip ? '–' : '✓') : String(idx + 1).padStart(2, '0')} {q.category || 'Question'}</span>
                      {isDone && (
                        <small style={{ color: isSkip ? '#fda4af' : 'var(--cyan)', font: '700 10px var(--font-mono)' }}>
                          {isSkip ? 'Skip' : `${q.score}/10`}
                        </small>
                      )}
                    </button>
                  );
                })}
                <div className="hint-banner" style={{ marginTop: '16px', background: 'rgba(56,189,248,.1)', borderColor: 'rgba(56,189,248,.3)', color: '#cbd5e1' }}>
                  ⚡ <strong>Executive Tip:</strong> Cite concrete metrics (ms, %, QPS), state trade-offs, and use "I" for personal scope.
                </div>
              </aside>

              <section className="card q-card-main">
                <div className="q-meta-row">
                  <span className="category-pill">{((currentQ.category) || 'TECHNICAL').toUpperCase()} • QUESTION {currentIdx + 1} OF {(session?.questions || []).length}</span>
                  <span className={`q-timer-badge ${questionSeconds >= 180 ? 'warn' : ''}`}>
                    ⏱ {String(Math.floor(questionSeconds / 60)).padStart(2, '0')}:{String(questionSeconds % 60).padStart(2, '0')} {questionSeconds >= 180 ? '• Pacing Alert ⚠️' : '• AI Coach Ready'}
                  </span>
                </div>

                <h2 style={{ fontSize: '20px', lineHeight: 1.4, margin: '8px 0 14px', color: '#f8fafc' }}>
                  {currentQ.question || 'Question loading...'}
                </h2>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <button type="button" className="outline-btn" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={() => speak(currentQ.question)}>🔊 Read Question</button>
                  {speechActive && <button type="button" className="outline-btn" style={{ padding: '5px 10px', fontSize: '11px', color: '#fda4af' }} onClick={stopAudio}>⏹ Stop Audio</button>}
                  <button type="button" className="outline-btn" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={() => setClarifierOpen(o => !o)}>🙋 Ask Clarifier</button>
                  <button type="button" className="outline-btn" style={{ padding: '5px 10px', fontSize: '11px' }} onClick={requestHint} disabled={hintsLeft <= 0 || isQuestionAnswered || isRequestingHint}>
                    💡 Request Hint ({hintsLeft} left)
                  </button>
                </div>

                {clarifierOpen && (
                  <div className="clarifier-thread">
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        value={clarifierQuery}
                        onChange={e => setClarifierQuery(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') sendClarifier(); }}
                        placeholder="Ask about traffic, constraints, latency SLAs..."
                        style={{ fontSize: '12px', flex: 1, padding: '6px 10px', borderRadius: '6px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                      />
                      <button type="button" className="outline-btn" onClick={sendClarifier} disabled={isClarifying}>Ask</button>
                    </div>
                    {(currentQ.clarifications || []).map((c: any, i: number) => (
                      <div key={i}>
                        <div className="clarifier-bubble candidate"><strong>You asked:</strong> {c.candidateQuery}</div>
                        <div className="clarifier-bubble interviewer"><strong>Interviewer:</strong> {c.interviewerAnswer}</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeHint && (
                  <div className="hint-banner">
                    <strong>💡 Interview Hint (-1 pt on final score):</strong><br />{activeHint}
                  </div>
                )}

                <div className="q-tools-row">
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {codeMode ? 'Algorithmic Mode: State input assumptions, pseudocode/code, and Time/Space Big-O.' : 'Structure: Situation (S), Challenge (T), Action (A), and Quantified Impact (R).'}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className={`outline-btn ${codeMode ? 'primary-btn' : ''}`} style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setCodeMode(c => !c)}>
                      {codeMode ? '{ } Code Mode: ON' : '{ } Code Mode'}
                    </button>
                    <button type="button" className="outline-btn" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={insertTemplate}>+ Structure Template</button>
                  </div>
                </div>

                <textarea
                  className={`answer-textarea ${codeMode ? 'code-font' : ''}`}
                  rows={9}
                  readOnly={isQuestionAnswered}
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Tab' && codeMode) {
                      e.preventDefault();
                      const start = e.currentTarget.selectionStart;
                      const end = e.currentTarget.selectionEnd;
                      setAnswer(prev => prev.substring(0, start) + '  ' + prev.substring(end));
                      setTimeout(() => {
                        const target = e.target as HTMLTextAreaElement;
                        target.selectionStart = target.selectionEnd = start + 2;
                      }, 0);
                    }
                  }}
                  placeholder={codeMode ? '// 1. Assumptions\n// 2. Algorithm\n// 3. Time: O(N) | Space: O(1)' : 'Start typing or dictating your answer...'}
                  style={{ width: '100%', borderRadius: '10px', padding: '12px 14px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                />

                <div className="telemetry-strip">
                  <span className={`telemetry-chip ${telemetry.we > telemetry.i * 2 && telemetry.we >= 2 ? 'warn' : telemetry.i >= 1 ? 'good' : ''}`}>
                    We: {telemetry.we} | I: {telemetry.i} {telemetry.we > telemetry.i * 2 && telemetry.we >= 2 ? '(⚠️ More "I" needed)' : telemetry.i >= 1 ? '(✓ Strong "I")' : ''}
                  </span>
                  <span className={`telemetry-chip ${telemetry.fluffCount > 0 ? 'warn' : 'good'}`}>
                    {telemetry.fluffCount > 0 ? `Fluff: ${telemetry.fluffCount} detected ⚠️` : 'Fluff: None detected ✓'}
                  </span>
                  <span className={`telemetry-chip ${telemetry.evidenceScore >= 40 ? 'good' : ''}`}>Evidence: {telemetry.evidenceScore}%</span>
                  <span className={`telemetry-chip ${telemetry.wpm > 165 || (telemetry.wpm > 0 && telemetry.wpm < 100) ? 'warn' : telemetry.wpm >= 100 ? 'good' : ''}`}>
                    Pacing: {telemetry.wpm > 0 ? `${telemetry.wpm} WPM` : '-- WPM'}
                  </span>
                  <span className={`telemetry-chip ${telemetry.fillers > 0 ? 'warn' : 'good'}`}>
                    Fillers: {telemetry.fillers} {telemetry.fillers > 0 ? '⚠️' : '✓'}
                  </span>
                </div>

                <div className="voice-strip">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button type="button" className={`outline-btn ${isListening ? 'primary-btn' : ''}`} style={{ padding: '6px 12px', fontSize: '11px' }} onClick={toggleMic} disabled={isQuestionAnswered}>
                      {isListening ? '⏹ Stop Dictation' : '🎙️ Voice Dictation'}
                    </button>
                    <span className={`voice-status-lbl ${isListening ? 'listening' : ''}`}>
                      {isListening ? '● Hearing your speech...' : 'Microphone ready'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {!isQuestionAnswered ? (
                      <>
                        <button type="button" className="outline-btn" onClick={() => submitAnswer(true)} disabled={isSubmitting}>Skip</button>
                        <button type="button" className="primary-btn" style={{ padding: '8px 18px', width: 'auto' }} onClick={() => submitAnswer(false)} disabled={isSubmitting}>
                          {isSubmitting ? <><span className="spinner" /> Evaluating...</> : <>Submit Answer <b>→</b></>}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ padding: '8px 18px', width: 'auto' }}
                        onClick={() => {
                          if (currentIdx < session.questions.length - 1) setCurrentIdx(i => i + 1);
                          else { setSubView('dashboard'); showToast('Practice session complete! Check your updated readiness.', 'success'); }
                        }}
                      >
                        {currentIdx === session.questions.length - 1 ? 'Finish & View Calibration →' : 'Next Question →'}
                      </button>
                    )}
                  </div>
                </div>

                {isQuestionAnswered && (
                  <div className="feedback-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <strong style={{ fontSize: '15px', color: (currentQ.score ?? 0) >= 6 ? '#6ee7b7' : '#fda4af' }}>
                        {(currentQ.score ?? 0) >= 6 ? `✓ Accepted — ${currentQ.score}/10` : `Needs Another Pass — ${currentQ.score}/10`}
                      </strong>
                      <div className="flex items-center gap-2">
                        {/* Bridge Button on low score or feedback */}
                        {((currentQ.score ?? 0) < 7 || currentQ.feedback) && (
                          <button
                            type="button"
                            className="py-1 px-2.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
                            onClick={() => setBridgePayload({
                              skill: currentQ.category || currentQ.topic || role || 'Interview Concepts',
                              category: 'Interview Preparation',
                              sourceContext: `Mock Interview Score: ${currentQ.score ?? 5}/10`,
                              notes: currentQ.feedback || `Weakness identified in: ${currentQ.question}`
                            })}
                          >
                            <span>🎯</span>
                            <span>Master Concept in GoalMind</span>
                          </button>
                        )}
                        <button type="button" className="outline-btn" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => speak(currentQ.feedback || '')}>
                          🔊 Read Feedback
                        </button>
                      </div>
                    </div>
                    <p style={{ margin: '8px 0 12px', fontSize: '12px', color: '#cbd5e1' }}>{currentQ.feedback}</p>

                    {currentQ.telemetry && (
                      <div>
                        <div className="star-chip-row">
                          <span className={`star-chip ${currentQ.telemetry.hasSituation ? 'active' : ''}`}>S: Context</span>
                          <span className={`star-chip ${currentQ.telemetry.hasTask ? 'active' : ''}`}>T: Challenge</span>
                          <span className={`star-chip ${currentQ.telemetry.hasAction ? 'active' : ''}`}>A: Action</span>
                          <span className={`star-chip ${currentQ.telemetry.hasResult ? 'active' : ''}`}>R: Result</span>
                          <span className={`star-chip ${currentQ.telemetry.evidenceScore >= 40 ? 'active' : ''}`}>Evidence: {currentQ.telemetry.evidenceScore}%</span>
                        </div>
                        {currentQ.telemetry.starSummary && <small style={{ color: 'var(--cyan)', display: 'block', fontSize: '11px' }}>{currentQ.telemetry.starSummary}</small>}
                      </div>
                    )}

                    {currentQ.staffModel && (
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {currentQ.staffModel.conceptsCovered && currentQ.staffModel.conceptsCovered.length > 0 && (
                          <div style={{ fontSize: '11px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: '#6ee7b7', fontWeight: 700 }}>✓ Covered:</span>
                            {currentQ.staffModel.conceptsCovered.map((c: string, idx: number) => (
                              <span key={idx} className="chip-tag matched" style={{ fontSize: '10px', padding: '2px 6px' }}>{c}</span>
                            ))}
                          </div>
                        )}
                        {currentQ.staffModel.conceptsMissed && currentQ.staffModel.conceptsMissed.length > 0 && (
                          <div style={{ fontSize: '11px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: '#fda4af', fontWeight: 700 }}>⚠️ Key Omissions:</span>
                            {currentQ.staffModel.conceptsMissed.map((c: string, idx: number) => (
                              <span key={idx} className="chip-tag missing" style={{ fontSize: '10px', padding: '2px 6px' }}>{c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {currentQ.harderFollowUp && (
                      <div className="followup-box">
                        <div className="section-kicker">⚡ INTERACTIVE FOLLOW-UP DEFENSE (+UP TO 2 RECOVERY PTS)</div>
                        <p style={{ margin: '6px 0 10px', fontSize: '12px', color: '#f8fafc' }}>{currentQ.harderFollowUp}</p>
                        <textarea
                          rows={3}
                          value={followUpAnswer}
                          onChange={e => setFollowUpAnswer(e.target.value)}
                          placeholder="Defend your architectural trade-off or quantify the outcome..."
                          style={{ width: '100%', fontSize: '11px', marginBottom: '8px', padding: '8px 10px', borderRadius: '6px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button type="button" className="primary-btn" style={{ width: 'auto', padding: '6px 14px', fontSize: '11px' }} onClick={submitFollowUp} disabled={isSubmittingFollowUp}>
                            {isSubmittingFollowUp ? 'Evaluating...' : 'Submit Follow-Up Defense →'}
                          </button>
                        </div>
                      </div>
                    )}

                    {currentQ.staffModel?.answer && (
                      <div style={{ marginTop: '12px' }}>
                        <button type="button" className="outline-btn" style={{ fontSize: '11px', padding: '5px 10px' }} onClick={() => setShowStaff(s => !s)}>
                          {showStaff ? 'Hide Staff Ghost Answer ▲' : 'View Staff Engineer Ghost Answer (10/10) ▼'}
                        </button>
                        {showStaff && (
                          <div className="staff-diff-box">
                            <div style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: '12px', marginBottom: '8px' }}>
                              💡 30-Second Elevator Pitch: "{currentQ.staffModel.elevatorPitch}"
                            </div>
                            <small style={{ color: '#6ee7b7', font: '700 11px var(--font-mono)', display: 'block', marginBottom: '4px' }}>Concepts Covered:</small>
                            <div className="chips" style={{ marginBottom: '8px' }}>
                              {(currentQ.staffModel.conceptsCovered || []).map((c: string) => <span className="chip-tag matched" key={c}>✓ {c}</span>)}
                            </div>
                            <small style={{ color: '#fda4af', font: '700 11px var(--font-mono)', display: 'block', marginBottom: '4px' }}>Concepts / Trade-offs Missed:</small>
                            <div className="chips" style={{ marginBottom: '10px' }}>
                              {(currentQ.staffModel.conceptsMissed || []).map((c: string) => (
                                <span
                                  className="chip-tag missing"
                                  key={c}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setBridgePayload({
                                    skill: c,
                                    category: 'Interview Preparation',
                                    sourceContext: 'Missed in Staff Ghost Answer',
                                    notes: `Missed in question: ${currentQ.question}`
                                  })}
                                >
                                  ⚠ {c} <b style={{ color: 'var(--cyan)', marginLeft: '4px' }}>🎯 Learn in GoalMind</b>
                                </span>
                              ))}
                            </div>
                            <div style={{ fontSize: '11px', color: '#e2e8f0', whiteSpace: 'pre-wrap', background: 'rgba(15,23,42,.7)', padding: '12px', borderRadius: '8px' }}>
                              {currentQ.staffModel.answer}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="card" style={{ padding: '36px', textAlign: 'center', margin: '32px auto', maxWidth: '640px' }}>
              <h3 style={{ color: '#f8fafc', marginBottom: '8px' }}>No Active Interview Session</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>Configure your focus areas or launch a new simulation.</p>
              <button type="button" className="primary-btn" style={{ width: 'auto', display: 'inline-block' }} onClick={() => setSubView('setup')}>
                ⚡ Open Interview Setup →
              </button>
            </div>
          )
        )}

        {subView === 'library' && (
          <div>
            <div className="card library-filter-bar">
              <input
                value={libSearch}
                onChange={e => setLibSearch(e.target.value)}
                placeholder="Search 100 questions (e.g. webhook, median, URL shortener...)"
                style={{ flex: 1, minWidth: '220px', fontSize: '12px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
              />
              <select
                value={libCompany}
                onChange={e => setLibCompany(e.target.value)}
                style={{ width: '160px', fontSize: '12px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
              >
                <option value="">All Companies</option>
                {(libraryData?.companies || []).map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={libCategory}
                onChange={e => setLibCategory(e.target.value)}
                style={{ width: '160px', fontSize: '12px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
              >
                <option value="">All Categories</option>
                {(libraryData?.categories || []).map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={libRound}
                onChange={e => setLibRound(e.target.value)}
                style={{ width: '160px', fontSize: '12px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
              >
                <option value="">All Rounds</option>
                {(libraryData?.interviewRounds || []).map((r: string) => <option key={r} value={r}>{r}</option>)}
              </select>
              <button type="button" className="ghost-btn" onClick={() => { setLibSearch(''); setLibCompany(''); setLibCategory(''); setLibRound(''); }}>
                Clear
              </button>
            </div>

            <div className="library-card-grid">
              {(libraryData?.questions || [])
                .filter((q: any) => (!libCompany || q.company === libCompany) && (!libCategory || q.category === libCategory) && (!libRound || q.interviewRound === libRound) && (!libSearch || `${q.question} ${q.answerGuidance} ${q.company}`.toLowerCase().includes(libSearch.toLowerCase())))
                .map((q: any, idx: number) => (
                  <div key={idx} className="card lib-item-card">
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="chip-tag indigo">{q.company}</span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{q.category} • {q.interviewRound}</span>
                      </div>
                      <h3 style={{ fontSize: '14px', lineHeight: 1.4, margin: '6px 0 10px', color: '#f8fafc' }}>{q.question}</h3>
                      <details style={{ fontSize: '11px', color: '#cbd5e1' }}>
                        <summary style={{ cursor: 'pointer', color: 'var(--cyan)' }}>View Answer Rubric &amp; Guidance</summary>
                        <p style={{ margin: '6px 0', lineHeight: 1.5 }}>{q.answerGuidance}</p>
                      </details>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
                      <button
                        type="button"
                        className="text-btn text-xs text-indigo-400 hover:underline"
                        onClick={() => setBridgePayload({
                          skill: q.category || q.question.split(' ')[0],
                          category: q.company || 'Interview Prep',
                          sourceContext: `Company Question: ${q.company}`,
                          notes: q.question
                        })}
                      >
                        🎯 Master in GoalMind →
                      </button>
                      <button type="button" className="outline-btn" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => practiceCompanyTarget(q.company)}>
                        ⚡ Practice {q.company} →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {replayModal?.current && (
          <div className="modal-overlay" onClick={() => setReplayModal(null)}>
            <div className="card modal-sheet" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div className="section-kicker">SESSION REVIEW &amp; REPLAY</div>
                  <h2 style={{ margin: '4px 0', fontSize: '20px' }}>
                    {replayModal.current.role} {replayModal.current.company ? `• ${replayModal.current.company}` : ''} ({replayModal.current.score != null ? `${replayModal.current.score}%` : 'In progress'})
                  </h2>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {replayModal.current.mode === 'project-defense' ? 'Project defense' : 'Adaptive practice'} • {replayModal.current.createdAt ? new Date(replayModal.current.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <button type="button" className="ghost-btn" onClick={() => setReplayModal(null)}>✕ Close</button>
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                {(replayModal.current.questions || []).map((q: any, idx: number) => (
                  <div key={idx} className="card" style={{ padding: '16px', background: 'rgba(15,23,42,.7)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span className="category-pill">{q.category}</span>
                      <span style={{ font: '700 12px var(--font-mono)', color: 'var(--cyan)' }}>{q.score != null ? `${q.score}/10` : 'Unanswered'}</span>
                    </div>
                    <strong style={{ fontSize: '13px', display: 'block', margin: '4px 0 8px' }}>Q{idx + 1}: {q.question}</strong>
                    {q.answer ? (
                      <div style={{ fontSize: '11px', background: 'rgba(15,23,42,.9)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid var(--cyan)', margin: '6px 0' }}>
                        <strong>Your answer:</strong><br />{q.answer}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>Not answered</span>
                    )}
                    {q.feedback && (
                      <div style={{ fontSize: '11px', background: 'rgba(99,102,241,.15)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #6366f1', margin: '6px 0' }}>
                        <div className="flex justify-between items-start">
                          <div><strong>Feedback:</strong> {q.feedback}</div>
                          <button
                            type="button"
                            className="text-btn text-xs text-indigo-400 hover:underline flex-shrink-0 ml-2 font-bold"
                            onClick={() => setBridgePayload({
                              skill: q.category || 'Interview Preparation',
                              category: 'Interview Preparation',
                              sourceContext: `Session Review: Q${idx + 1}`,
                              notes: q.feedback
                            })}
                          >
                            🎯 Master in GoalMind →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GoalMind Bridge Modal */}
      <GoalMindBridgeModal
        isOpen={Boolean(bridgePayload)}
        payload={bridgePayload}
        onClose={() => setBridgePayload(null)}
        onConfirm={handleConfirmBridge}
      />
    </div>
  );
};
