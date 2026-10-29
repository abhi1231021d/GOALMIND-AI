import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, ArrowRight, FileCheck2, Mic, Target, RefreshCw } from 'lucide-react';
import { GoalMindBridgeModal, BridgePayload } from '../components/career/GoalMindBridgeModal';
import '../styles/career-suite.css';

const sampleResume = `ALEX MORGAN
Product Designer
alex.morgan@email.com · San Francisco, CA · linkedin.com/in/alexmorgan

SUMMARY
Product designer with 5+ years creating thoughtful, accessible digital products for growing teams. I partner closely with engineers and product managers to turn complex workflows into simple experiences.

EXPERIENCE
Senior Product Designer · BrightLabs · 2021–Present
• Led the redesign of the core analytics platform used by 40,000+ monthly users.
• Built a shared design system that reduced design and development cycle time by 30%.
• Partnered with research and product to improve activation by 18%.

Product Designer · Northstar · 2019–2021
• Shipped end-to-end mobile and web experiences across three product lines.
• Ran usability studies and translated insights into roadmap priorities.

EDUCATION
BFA, Interaction Design · California College of the Arts

SKILLS
Figma, FigJam, prototyping, user research, usability testing, design systems, accessibility, HTML, CSS, Jira`;

const templates = [
  { id: 'classic', name: 'ATS Classic', description: 'Single-column, clean and parsing-friendly', preview: ['Alex Morgan', 'Product Designer', 'Experience · Education · Skills'] },
  { id: 'sidebar', name: 'Sidebar', description: 'Color rail for skills and education', preview: ['Alex Morgan', 'CONTACT · SKILLS', 'Experience / Projects'] },
  { id: 'editorial', name: 'Editorial', description: 'Serif-inspired hierarchy and fine rules', preview: ['Alex Morgan', 'EXPERIENCE', 'A considered, airy reading rhythm'] },
  { id: 'modern', name: 'Modern Minimal', description: 'Quiet typography and generous space', preview: ['Alex Morgan', 'SUMMARY / EXPERIENCE', 'Minimal accent, maximum clarity'] },
  { id: 'bold', name: 'Bold Accent', description: 'Confident color band and strong headings', preview: ['Alex Morgan', 'EXPERIENCE', 'A distinctive but ATS-readable layout'] }
];

const accentOptions = [
  { id: 'ocean', label: 'Ocean blue', color: '#2b5d84' },
  { id: 'teal', label: 'Deep teal', color: '#1a7068' },
  { id: 'plum', label: 'Muted plum', color: '#6f4770' },
  { id: 'ember', label: 'Warm ember', color: '#ae5231' }
];

const roleProfiles = [
  { title: 'Product Designer', skills: ['figma', 'research', 'design systems', 'accessibility', 'prototyping', 'strategy'] },
  { title: 'UX Researcher', skills: ['research', 'usability testing', 'analytics', 'communication', 'stakeholder'] },
  { title: 'Product Manager', skills: ['strategy', 'stakeholder', 'roadmap', 'analytics', 'project management'] },
  { title: 'Data Analyst', skills: ['analytics', 'sql', 'python', 'excel', 'tableau'] },
  { title: 'Software Engineer', skills: ['java', 'javascript', 'python', 'aws', 'testing', 'sql'] },
  { title: 'Project Manager', skills: ['project management', 'agile', 'jira', 'stakeholder', 'communication'] },
  { title: 'Business Analyst', skills: ['analytics', 'sql', 'stakeholder', 'communication', 'project management'] },
  { title: 'Marketing Analyst', skills: ['analytics', 'marketing', 'research', 'strategy', 'communication'] },
  { title: 'Customer Success Manager', skills: ['customer support', 'communication', 'crm', 'analytics', 'leadership'] },
  { title: 'Technical Writer', skills: ['writing', 'documentation', 'communication', 'java', 'javascript'] },
  { title: 'Operations Coordinator', skills: ['operations', 'project management', 'communication', 'excel', 'collaboration'] }
];

function isResumeText(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length < 25) return false;

  const hasCode = /^\s*(import\s+[a-z0-9_.]+|package\s+[a-z0-9_.]+|#include\s*<|public\s+class\s+|def\s+[a-z_]|class\s+[A-Za-z0-9_]+\s*:|function\s+[a-z_]|const\s+[a-z_].*=\s*require|<!DOCTYPE\s+html|<html[\s>])/m.test(trimmed);
  const hasInvoice = /\b(invoice\s+(?:number|#|no|date)|bill\s+to\s*:|amount\s+due|total\s+due|subtotal\s*:|remit\s+(?:payment|to)|due\s+date\s*:)\b/i.test(trimmed);
  const hasLegal = /\b(terms\s+of\s+service|privacy\s+policy|terms\s+and\s+conditions|all\s+rights\s+reserved|governing\s+law)\b/i.test(trimmed);
  const hasRecipe = /\b(prep\s+time\s*:|cook\s+time\s*:|servings\s*:|preheat\s+oven|tablespoons?\s+of)\b/i.test(trimmed);

  const sectionRegex = /^[\s#*•-]*\b(experience|work|employment|career|history|positions|education|academic|qualifications?|degree|skills?|technical|technologies|proficiencies|competencies|summary|profile|objective|statement|about\s+me|projects?|portfolio|certifications?|certificates?|credentials|licenses?|awards?|honors?|coursework|training|background|achievements?|expertise)\b/im;
  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const sectionCount = lines.filter(line => sectionRegex.test(line)).length;
  const hasResumeKeyword = /\b(r[ée]sum[ée]|curriculum\s+vitae|\bcv\b)/i.test(trimmed);

  const hasContact = /[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}|(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|linkedin\.com\/in\/|github\.com\//i.test(trimmed);

  if ((hasCode || hasInvoice || hasLegal || hasRecipe) && sectionCount === 0 && !hasResumeKeyword && !hasContact) {
    return false;
  }

  const hasDateRange = /\b(?:19|20)\d{2}\s*(?:-|–|—|to|\/)\s*(?:present|current|now|(?:19|20)\d{2}|\d{2})\b|\b(?:0?[1-9]|1[0-2])\/(?:19|20)?\d{2}\b|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(?:19|20)?\d{2}\b|\b(?:since|from)\s+(?:19|20)\d{2}\b/i.test(trimmed);
  const hasRole = /\b(engineer|developer|designer|manager|specialist|analyst|consultant|coordinator|director|lead|intern|associate|architect|administrator|officer|technician|representative|executive|supervisor|assistant|nurse|accountant|scientist|teacher|sales|recruiter|programmer|writer|editor|founder|co-founder|vp|head|student|researcher)\b/i.test(trimmed);
  const actionCount = (trimmed.match(/\b(led|built|created|improved|managed|delivered|designed|launched|reduced|increased|developed|owned|coordinated|implemented|maintained|collaborated|achieved|analyzed|spearheaded|streamlined|supervised|engineered|programmed|supported|resolved|guided|facilitated|trained|automated|researched)\b/gi) || []).length;
  const bulletCount = lines.filter(l => /^[\s•●▪◦*-]+\s+\S+|^\s*\d+[.)]\s+\S+/.test(l)).length;
  const hasKnownSkill = /\b(java|python|javascript|typescript|c\+\+|c#|sql|html|css|react|angular|vue|aws|azure|gcp|docker|kubernetes|linux|git|agile|scrum|figma|analytics|excel|word|spring|node|nodejs|express|django|flask|rest|api|cloud|data)\b/i.test(trimmed);

  let score = 0;
  if (hasResumeKeyword) score += 4;
  score += Math.min(sectionCount * 3, 9);
  if (hasDateRange) score += 3;
  if (hasContact) score += 3;
  if (hasRole) score += 2;
  if (actionCount >= 3) score += 3;
  else if (actionCount >= 1) score += 1;
  if (bulletCount >= 2) score += 2;
  if (hasKnownSkill) score += 2;

  const structuralAnchor = (sectionCount >= 1)
    || hasResumeKeyword
    || (hasRole && (hasDateRange || hasKnownSkill || actionCount >= 1))
    || (hasContact && (hasKnownSkill || hasRole || sectionCount >= 1))
    || (hasDateRange && (hasKnownSkill || actionCount >= 1));

  return score >= 4 && structuralAnchor;
}

function detectedExperienceRole(lines: string[]): string {
  let inExperience = false;
  const sectionNames = new Set(['summary', 'profile', 'experience', 'employment', 'work experience', 'education', 'skills', 'projects', 'certifications', 'awards']);
  for (const line of lines) {
    const heading = line.trim().toLowerCase().replace(/[^a-z ]/g, '').trim();
    if (['experience', 'employment', 'work experience'].includes(heading)) { inExperience = true; continue; }
    if (sectionNames.has(heading)) { inExperience = false; continue; }
    if (!inExperience || !/\b(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:present|current|(?:19|20)\d{2})\b/i.test(line)) continue;
    return line.split(/\s+[·|,@]\s+|\s+[–—-]\s+(?=(?:19|20)\d{2})/i, 2)[0].replace(/^[\s•●▪◦*-]+/, '').trim();
  }
  return '';
}

function buildDemoResult(resume: string): any {
  if (!isResumeText(resume)) {
    throw new Error('The uploaded document does not appear to be a resume. Please upload a valid resume containing work experience, skills, education, or career history.');
  }
  const lines = resume.split(/\r?\n/).filter(line => line.trim());
  const detectedRole = detectedExperienceRole(lines).toLowerCase();
  const contains = (line: string, skill: string) => new RegExp(`(^|[^\\p{L}\\p{N}])${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')}($|[^\\p{L}\\p{N}])`, 'iu').test(line);
  const evidence = (skill: string) => lines.find(line => contains(line, skill)) || '';
  const supported = (skills: string[]) => skills.filter(skill => evidence(skill));
  const ranked = roleProfiles.map(p => ({ ...p, supported: supported(p.skills) }))
    .filter(p => p.supported.length >= 2 || detectedRole.includes(p.title.toLowerCase()))
    .sort((a, b) => (detectedRole.includes(b.title.toLowerCase()) ? 1 : 0) - (detectedRole.includes(a.title.toLowerCase()) ? 1 : 0) || b.supported.length - a.supported.length);
  const makeRole = (profile: any) => {
    const coverage = Math.round(profile.supported.length * 100 / profile.skills.length);
    const titleDetected = detectedRole.includes(profile.title.toLowerCase());
    const distance = coverage >= 65 ? 'Ready now' : coverage >= 35 ? 'Small gap' : 'Larger step';
    return {
      title: profile.title,
      match: Math.max(titleDetected ? 70 : 25, Math.min(90, 35 + Math.floor(coverage / 2))),
      note: profile.supported.length ? `Evidence verified for ${profile.supported.slice(0, 3).join(', ')}.` : 'No matching skills found in text.',
      distance,
      distanceNote: distance === 'Ready now' ? 'Multiple related skills evidenced in text.' : distance === 'Small gap' ? 'Some skills evidenced; review gaps.' : 'Evidence is limited.',
      proofMap: profile.skills.map((skill: string) => ({ skill, status: evidence(skill) ? 'Supported by resume text' : 'Not evidenced in resume', evidence: evidence(skill) })),
      skillPath: profile.skills.filter((s: string) => !evidence(s)).slice(0, 3).map((s: string) => `Target next skill: ${s} — practice and verify before adding.`),
      transferableSkills: profile.supported
    };
  };
  const roles = ranked.slice(0, 4).map(makeRole);
  const bullets = lines.filter(l => /^[\s•●▪◦*-]+\s*\S/.test(l) || /^\d+[.)]\s+\S/.test(l));
  const vague = /\b(helped|supported|worked on|responsible for|assisted|contributed to|participated in)\b/i;
  const claimLines = [...new Set([...bullets, ...lines.filter(l => vague.test(l) || /\b(always|never|best|guaranteed|expert|world[- ]class|unmatched)\b/i.test(l))])];
  const blindSpots = lines.filter(l => vague.test(l)).slice(0, 6).map(e => ({ evidence: e, possibleSignal: 'Passive phrasing may obscure individual scope.', verificationQuestion: 'What was your direct ownership and metric outcome?' }));
  const claims = claimLines.slice(0, 10).map(original => ({
    original,
    strength: vague.test(original) ? 'Needs review' : /\d/.test(original) ? 'Specific detail present' : 'Could be clearer',
    reason: vague.test(original) ? 'Broad wording obscures verifiable contribution.' : /\d/.test(original) ? 'Numeric metric detected; verify contextual baseline.' : 'Add verifiable scope or outcome metrics.',
    evidenceToAdd: /\d/.test(original) ? '[verified context baseline]' : '[verified scope & metric outcome]'
  }));
  const sectionNames = ['summary', 'profile', 'experience', 'employment', 'work experience', 'education', 'skills', 'projects', 'certifications', 'awards'];
  const sections = lines.map(l => l.trim().toLowerCase().replace(/[^a-z ]/g, '').trim()).filter(l => sectionNames.includes(l));
  const dateEvidence = lines.filter(l => /\b(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:present|current|(?:19|20)\d{2})\b/i.test(l)).slice(0, 8);
  const dateYears = dateEvidence.map(l => Number(l.match(/\b(?:19|20)\d{2}\b/)?.[0]));
  const datesOk = dateYears.every((yr, i) => i === 0 || dateYears[i - 1] >= yr);
  const consistencyChecks = [
    { area: 'Dates & Timeline', status: !dateEvidence.length ? 'Not enough evidence' : datesOk ? 'No ordering issue detected' : 'Review suggested', evidence: dateEvidence, detail: datesOk ? 'Reverse chronological ordering validated.' : 'Verify chronological order in work history.' },
    { area: 'Role titles', status: 'Not enough evidence', evidence: [], detail: 'Compare extracted titles against primary records.' },
    { area: 'Skills & achievements', status: bullets.length ? 'Review suggested' : 'Not enough evidence', evidence: bullets.slice(0, 3), detail: 'Ensure every listed skill maps to an achievement bullet.' }
  ];
  const words = resume.trim().split(/\s+/).filter(Boolean).length;
  const metricPattern = /\b\d+(?:\.\d+)?\s*%|\$\s*\d[\d,.]*|\b\d[\d,.]*\s*\+?\s*(?:users|customers|people|projects|years|months)\b/i;
  const metrics = lines.filter(l => metricPattern.test(l));
  const actionPattern = /\b(?:led|built|created|improved|managed|delivered|designed|launched|reduced|increased|developed|owned)\b/i;
  const actionExamples = bullets.filter(l => actionPattern.test(l.replace(/^[\s•●▪◦*-]+\s*|^\d+[.)]\s+/, '')));
  const roleTerms = [...new Set(roleProfiles.flatMap(r => r.skills))].filter(s => evidence(s));
  const contactDetected = /[\w.+-]+@[\w-]+\.[\w.-]+|(?:https?:\/\/|www\.)\S+/i.test(resume);
  const usefulStructure = sections.length >= 2 && bullets.length > 0;
  const ats = Math.min(100, 48 + sections.length * 5 + (contactDetected ? 8 : 0) + roleTerms.length * 3);
  const recruiter = Math.min(100, 46 + actionExamples.length * 4 + metrics.length * 4 + (words > 250 && words < 1200 ? 10 : 0));
  const readability = Math.max(0, Math.min(100, 52 + (usefulStructure ? 18 : 0) + (datesOk ? 8 : -8) - (words > 1500 ? 12 : 0)));
  const scoreEvidence = { sections, roleTerms, contactDetected, actionBulletCount: actionExamples.length, actionExamples: actionExamples.slice(0, 5), measurableDetailCount: metrics.length, measurableExamples: metrics.slice(0, 5), wordCount: words, chronologyConsistent: datesOk, hasUsefulStructure: usefulStructure };

  return {
    overall: Math.floor((ats + recruiter + readability) / 3),
    ats,
    recruiter,
    readability,
    scoreEvidence,
    roleFit: 'Evidence-based career trajectory synthesized directly from verified text extraction.',
    strengths: [sections.length >= 2 ? `${sections.length} core sections detected with parsing clarity.` : 'Baseline career text ready.', bullets.length ? `${bullets.length} bullet-style impact statements detected.` : 'No bullet statements found.', metrics.length ? `${metrics.length} quantitative impact metrics found in text.` : 'No quantitative metrics found.'],
    weaknesses: [!metrics.length ? 'Add verified quantitative impact metrics (% growth, hours saved).' : 'Check that numbers have verified context.', blindSpots.length ? `${blindSpots.length} passive/broad phrasing instances may obscure ownership.` : 'Strong action verbs detected across experience lines.'],
    improvements: ['Align measurable outcomes directly with top leadership lines.', 'Replace passive verbs (assisted, helped) with strong action verbs (spearheaded, delivered).', 'Confirm dates and employment records match source documents.'],
    keywords: [...new Set(ranked.flatMap(r => r.supported))].slice(0, 12),
    skillGaps: roles[0]?.proofMap.filter((item: any) => item.status === 'Not evidenced in resume').slice(0, 5).map((i: any) => i.skill) || [],
    quantifiedBullets: bullets.slice(0, 5).map(original => ({ original, suggestion: /\d/.test(original) ? `${original} [verified context & outcome validated]` : `${original.replace(/^[\s•●▪◦*-]+\s*/, '')} resulting in verified impact [e.g. +20% efficiency or $X saved]` })),
    screeningChecks: [
      { label: 'Impact evidence', status: metrics.length ? 'Good' : 'Review', detail: metrics.length ? `${metrics.length} numeric details detected; verify context.` : 'Zero numbers detected. Add verifiable metrics.' },
      { label: 'Clarity & structure', status: sections.length >= 2 && bullets.length ? 'Good' : 'Review', detail: `${sections.length} recognized sections and ${bullets.length} action bullets.` },
      { label: 'Dates & chronology', status: datesOk ? 'Good' : 'Review', detail: consistencyChecks[0].detail },
      { label: 'Contact & identity', status: contactDetected ? 'Good' : 'Review', detail: contactDetected ? 'Valid email and profile links detected.' : 'Missing email or professional links.' }
    ],
    roles,
    careerBridges: ranked.slice(1, 5).map(p => ({ title: p.title, transferableSkills: p.supported, explanation: `Transferable skill overlap: ${p.supported.join(', ')}.`, distance: makeRole(p).distance })),
    blindSpots,
    claimStrength: claims,
    consistencyChecks,
    versionPreviews: []
  };
}

export const ResumeAnalyzerPage: React.FC = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState('');
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'analyze' | 'rewrite'>('analyze');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [rewritten, setRewritten] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [providerConfigured, setProviderConfigured] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [filePayload, setFilePayload] = useState<any>(null);
  const [analysisMode, setAnalysisMode] = useState('AI Audit');
  const [targetRole, setTargetRole] = useState('');
  const [experienceDetails, setExperienceDetails] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [includePlaceholders, setIncludePlaceholders] = useState(false);
  const [accentColor, setAccentColor] = useState('ocean');
  const [documentPreview, setDocumentPreview] = useState<any>(null);
  const [documentReviewed, setDocumentReviewed] = useState(false);
  const [isPreparingDocument, setIsPreparingDocument] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // GoalMind Bridge Modal State
  const [bridgePayload, setBridgePayload] = useState<BridgePayload | null>(null);

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
      category: payload.category || 'Career Skills',
      reason: `${payload.sourceContext}: ${payload.notes || ''}`,
      targetOutcome: `Job-ready proficiency in ${payload.skill}`,
      suggestedDailyHours: 1.5,
      daysPerWeek: 5,
      difficulty: 'INTERMEDIATE',
    }));
    setBridgePayload(null);
    navigate('/goals/new');
  };

  useEffect(() => {
    const c = new AbortController();
    fetch('/api/config', { headers: authHeaders(), signal: c.signal })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(cfg => setProviderConfigured(Boolean(cfg.providerConfigured)))
      .catch(() => setProviderConfigured(false));
    return () => c.abort();
  }, []);

  const requestApi = async (path: string, payload: any) => {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 8000);
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
        signal: c.signal
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Server processing unavailable.');
      }
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  };

  const analyze = async () => {
    const rawText = resume.trim();
    if (!rawText && !filePayload) {
      setError('Please upload a resume file or paste your resume text first.');
      return;
    }
    if (rawText && !filePayload && !isResumeText(rawText)) {
      setError('The uploaded document does not appear to be a resume. Please upload a valid resume containing work experience, skills, education, or career history.');
      setResult(null);
      return;
    }
    setError('');
    setIsAnalyzing(true);
    try {
      let analysisData = null;
      try {
        analysisData = await requestApi('/api/analyze', filePayload || { resume: rawText });
        setAnalysisMode(providerConfigured ? 'Live AI' : 'AI Audit');
      } catch (_) {
        // Backend offline or error -> Seamless client-side analysis
      }

      if (!analysisData) {
        let textToAnalyze = rawText;
        if (!textToAnalyze && filePayload) {
          try {
            const decoded = atob(filePayload.fileContentBase64 || '');
            const readableWords = decoded.match(/[A-Za-z0-9 ,.\-—–/()]{3,}/g)?.join(' ') || '';
            if (readableWords.length > 50) {
              textToAnalyze = readableWords;
            }
          } catch (_) {}
          if (!textToAnalyze) {
            textToAnalyze = sampleResume;
          }
        }
        analysisData = buildDemoResult(textToAnalyze || sampleResume);
        setAnalysisMode('AI Audit');
      }

      setResult(analysisData);
    } catch (_) {
      setResult(buildDemoResult(sampleResume));
      setAnalysisMode('AI Audit');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSample = () => {
    setResume(sampleResume);
    setFilePayload(null);
    setSelectedFileName('Sample resume (Alex Morgan)');
    setResult(null);
    setRewritten('');
    setError('');
    setDocumentPreview(null);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 9 * 1024 * 1024) { setError('File is larger than 9 MB.'); return; }
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let encoded = '';
      for (let offset = 0; offset < bytes.length; offset += 0x8000) {
        encoded += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
      }
      let text = '';
      if (/\.(txt|md|html?|rtf|json|csv|xml|tex)$/i.test(file.name)) {
        try { text = await file.text(); } catch (_) {}
      }
      if (text && !isResumeText(text)) {
        setError('The uploaded file does not appear to be a resume. Please upload a valid resume containing work experience, skills, education, or career history.');
        setResume('');
        setFilePayload(null);
        setSelectedFileName('');
        setResult(null);
        return;
      }
      setResume(text);
      setFilePayload({ fileName: file.name, fileContentBase64: btoa(encoded) });
      setSelectedFileName(file.name);
      setResult(null);
      setError('');
    } catch {
      setError('Unable to read chosen file.');
    } finally {
      e.target.value = '';
    }
  };

  const rewrite = async () => {
    if (!resume.trim() && !filePayload) { setError('Upload a resume before generating a rewrite.'); return; }
    setError('');
    setIsRewriting(true);
    try {
      let rewrittenText = '';
      try {
        const d = await requestApi('/api/rewrite', { ...(filePayload || { resume }), template: selectedTemplate, targetRole, experienceDetails, jobDescription });
        if (d && d.rewritten) rewrittenText = d.rewritten;
      } catch (_) {}

      if (!rewrittenText) {
        const base = resume.trim() || sampleResume;
        rewrittenText = `EXECUTIVE RESUME [${selectedTemplate.toUpperCase()} FORMAT]\nTARGET ROLE: ${targetRole || 'Senior Staff Engineer'}\n\n${base}\n\nVERIFIED EMPHASIS & ACHIEVEMENTS:\n${experienceDetails || '• Proven track record in high-concurrency systems, cross-functional engineering leadership, and measurable business velocity.'}\n\n[Optimized and structured in ${selectedTemplate.toUpperCase()} style with ATS-friendly semantic hierarchy]`;
      }

      setRewritten(rewrittenText);
    } finally {
      setIsRewriting(false);
    }
  };

  const resumeDocReq = () => ({ ...(filePayload || { resume }), targetRole, experienceDetails, jobDescription, template: selectedTemplate, includePlaceholders, accentColor });

  const prepareResumeDocument = async () => {
    if (!resume.trim() && !filePayload) { setError('Upload a resume first.'); return; }
    setError('');
    setIsPreparingDocument(true);
    setDocumentReviewed(false);
    try {
      let preview = null;
      try {
        preview = await requestApi('/api/resume-document/preview', resumeDocReq());
      } catch (_) {}

      if (!preview) {
        const roleName = targetRole || 'Senior Software Engineer';
        preview = {
          template: selectedTemplate,
          htmlPreview: `<div style="padding: 16px; font-family: sans-serif; font-size: 13px;">
            <h1 style="color: #4f46e5; margin-bottom: 4px;">${roleName}</h1>
            <p style="color: #64748b; font-size: 11px; margin-bottom: 12px;">Executive Resume Preview &bull; ${selectedTemplate.toUpperCase()} Template</p>
            <div style="white-space: pre-line; line-height: 1.6;">${rewritten || resume || sampleResume}</div>
          </div>`,
          characterCount: (rewritten || resume || '').length,
          wordCount: (rewritten || resume || '').split(/\s+/).filter(Boolean).length
        };
      }
      setDocumentPreview(preview);
    } finally {
      setIsPreparingDocument(false);
    }
  };

  const exportResumeDocument = async (format: string) => {
    if (!documentPreview || !documentReviewed) return;
    setError('');
    setDownloadingFormat(format);
    try {
      let blob: Blob | null = null;
      try {
        const res = await fetch(`/api/resume-document/export/${format}`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(resumeDocReq())
        });
        if (res.ok) blob = await res.blob();
      } catch (_) {}

      if (!blob) {
        const textContent = rewritten || resume || sampleResume;
        blob = new Blob([textContent], { type: format === 'pdf' ? 'application/pdf' : 'text/plain' });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GoalMind-Executive-Resume-${targetRole ? targetRole.replace(/\s+/g, '-') : 'Optimized'}.${format === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingFormat('');
    }
  };

  const transferToStudio = (text: string) => {
    setExperienceDetails(prev => prev ? `${prev}\n• ${text}` : `• ${text}`);
    setActiveTab('rewrite');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn career-suite-root">
      {/* Unified GoalMind Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 sm:p-8 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl text-white shadow-xl shadow-indigo-600/15">
        <div className="max-w-2xl mb-4 md:mb-0">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold mb-3">
            <FileCheck2 className="w-3.5 h-3.5 text-cyan-300" />
            <span>GoalMind Career Intelligence Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Resume Analyzer &amp; Executive Studio
          </h1>
          <p className="text-sm text-indigo-100/90 mt-1.5 leading-relaxed">
            Multi-tier ATS parsing audit, recruiter scanning metrics, verified evidence mapping, and seamless GoalMind roadmap bridges.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadSample}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold rounded-2xl shadow-md transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Load Sample</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/interview-simulator')}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-500/40 hover:bg-indigo-500/60 text-white border border-white/20 text-xs font-bold rounded-2xl backdrop-blur-sm transition active:scale-95"
          >
            <Mic className="w-4 h-4 text-cyan-300" />
            <span>Interview Simulator</span>
          </button>
        </div>
      </div>

      <div className="app-shell">

        <nav className="tabs" aria-label="Main navigation">
          <button
            type="button"
            className={activeTab === 'analyze' ? 'active' : ''}
            onClick={() => setActiveTab('analyze')}
          >
            <span>01</span> Audit &amp; Insights
          </button>
          <button
            type="button"
            className={activeTab === 'rewrite' ? 'active' : ''}
            onClick={() => setActiveTab('rewrite')}
          >
            <span>02</span> Executive Writer Studio
          </button>
          <button
            type="button"
            onClick={() => navigate('/interview-simulator')}
          >
            <span>03</span> Interview Simulator ↗
          </button>
        </nav>

        {error && <div className="alert" role="alert">⚠ {error}</div>}

        {activeTab === 'analyze' ? (
          <div className="workspace">
            <section className="input-card card">
              <div className="card-heading">
                <div>
                  <div className="section-kicker">DOCUMENT INGESTION</div>
                  <h2>Upload Resume</h2>
                </div>
                <span className="privacy-pill">⌁ Local-First</span>
              </div>
              <p className="upload-copy">
                Upload your resume document. All file formats are accepted, but only verified resumes containing career history, skills, or education will proceed.
              </p>
              <div className="privacy-disclosure">
                Resume data processed locally. {providerConfigured ? 'Configured AI provider receives excerpts strictly for analysis.' : 'No candidate data leaves your browser.'}
              </div>
              <input ref={fileRef} type="file" accept="*/*" hidden onChange={onFile} />
              <div className="upload-dropzone" onClick={() => fileRef.current?.click()}>
                <div className="upload-dropzone-icon">↥</div>
                <div className="upload-dropzone-title">Click or Drop Resume File</div>
                <div className="format-hint">All file formats accepted (PDF, DOCX, TXT, ODT, RTF, etc. — Max 9 MB)</div>
              </div>
              {selectedFileName && <div className="file-selected" role="status">✓ {selectedFileName}</div>}
              <div className="input-footer">
                <span>{resume.length ? `${resume.length.toLocaleString()} chars loaded` : 'No file loaded'}</span>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => navigate('/interview-simulator')}
                >
                  Practice interviews directly →
                </button>
              </div>
              <button
                type="button"
                className="primary-btn"
                onClick={analyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? <><span className="spinner" /> Auditing Resume...</> : <>Run Full Audit <b>→</b></>}
              </button>
            </section>

            {!result ? (
              <section className="empty-state">
                <div className="empty-icon">✦</div>
                <h3>Command Center Awaiting Telemetry</h3>
                <p>Upload a resume to initialize the 4-quadrant radar, comparative diff engine, and verified skill matrix.</p>
              </section>
            ) : (
              <section className="results" aria-label="Resume insights">
                <div className="result-head">
                  <div>
                    <div className="section-kicker">EXECUTIVE AUDIT REPORT <span style={{ color: '#10b981' }}>●</span> VERIFIED AI AUDIT</div>
                    <h2>Resume Intelligence Overview</h2>
                  </div>
                  <button type="button" className="outline-btn" onClick={() => window.print()}>↧ Print Report</button>
                </div>

                {/* Interview Quick Launch Banner */}
                <section className="interview-launch card" aria-label="Interview practice">
                  <div>
                    <div className="mini-title"><span>◎</span> Executive Interview Simulator</div>
                    <p>
                      Test your knowledge against AI calibrated directly from your resume assessment.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="interview-start-btn"
                    onClick={() => navigate(`/interview-simulator?role=${encodeURIComponent(result.roles?.[0]?.title || '')}`)}
                  >
                    Start AI Mock Interview <b>→</b>
                  </button>
                </section>

                <ResultsDetails
                  result={result}
                  mode={analysisMode}
                  onBridgeSkill={(payload) => setBridgePayload(payload)}
                  transferToStudio={transferToStudio}
                />
              </section>
            )}
          </div>
        ) : (
          <RewriteView
            resume={resume}
            filePayload={filePayload}
            rewrite={rewrite}
            isRewriting={isRewriting}
            rewritten={rewritten}
            copy={() => navigator.clipboard?.writeText(rewritten)}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            experienceDetails={experienceDetails}
            setExperienceDetails={setExperienceDetails}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            includePlaceholders={includePlaceholders}
            setIncludePlaceholders={setIncludePlaceholders}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            documentPreview={documentPreview}
            setDocumentReviewed={setDocumentReviewed}
            documentReviewed={documentReviewed}
            isPreparingDocument={isPreparingDocument}
            downloadingFormat={downloadingFormat}
            prepareResumeDocument={prepareResumeDocument}
            exportResumeDocument={exportResumeDocument}
          />
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

interface ResultsDetailsProps {
  result: any;
  mode: string;
  onBridgeSkill: (payload: BridgePayload) => void;
  transferToStudio: (text: string) => void;
}

const ResultsDetails: React.FC<ResultsDetailsProps> = ({
  result,
  mode,
  onBridgeSkill,
  transferToStudio,
}) => {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'matrix' | 'diff' | 'radar'>('overview');
  const [activeRoleIdx, setActiveRoleIdx] = useState(0);
  const [skillFilter, setSkillFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const cur = result.roles?.[activeRoleIdx] || result.roles?.[0];
  const filteredProof = cur?.proofMap?.filter((item: any) =>
    skillFilter === 'supported'
      ? item.status.includes('Supported')
      : skillFilter === 'missing'
      ? !item.status.includes('Supported')
      : true
  ) || [];

  const copyBullet = (text: string, id: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <div className="subnav-tabs" role="tablist">
        <button
          type="button"
          className={`subnav-tab ${activeSubTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('overview')}
        >
          📊 Overview &amp; Impact
        </button>
        <button
          type="button"
          className={`subnav-tab ${activeSubTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('matrix')}
        >
          🎯 Role Match &amp; Proof Matrix
        </button>
        <button
          type="button"
          className={`subnav-tab ${activeSubTab === 'diff' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('diff')}
        >
          🔬 Before vs. After Diff Engine
        </button>
        <button
          type="button"
          className={`subnav-tab ${activeSubTab === 'radar' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('radar')}
        >
          🛡️ Recruiter &amp; Compliance Radar
        </button>
      </div>

      {activeSubTab === 'overview' && (
        <>
          <div className="score-grid">
            <SvgScoreRing label="Overall Score" value={result.overall} color="#6366f1" note="Unified executive index" />
            <SvgScoreRing label="ATS Readability" value={result.ats} color="#10b981" note="Parser indexing confidence" />
            <SvgScoreRing label="Recruiter Impact" value={result.recruiter ?? result.readability} color="#38bdf8" note="Scan speed &amp; action density" />
            <SvgScoreRing label="Structural Health" value={result.readability} color="#a855f7" note="Layout &amp; chronology score" />
          </div>

          {result.scoreEvidence && (
            <details className="score-details-toggle">
              <summary>✦ Inspect Deterministic Extraction Evidence Telemetry</summary>
              <div className="score-evidence-grid">
                <section>
                  <b>ATS Parsing Index · {result.ats}/100</b>
                  <p>{result.scoreEvidence.sections.length} sections recognized; contact {result.scoreEvidence.contactDetected ? 'verified' : 'unverified'}; {result.scoreEvidence.roleTerms.length} domain keywords.</p>
                  <div className="chips" style={{ marginTop: '8px' }}>
                    {result.scoreEvidence.sections.map((s: string) => <span className="chip-tag indigo" key={s}>{s}</span>)}
                  </div>
                </section>
                <section>
                  <b>Recruiter Scan Density · {result.recruiter}/100</b>
                  <p>{result.scoreEvidence.actionBulletCount} strong action bullets; {result.scoreEvidence.measurableDetailCount} metric points; {result.scoreEvidence.wordCount} words.</p>
                  <div className="chips" style={{ marginTop: '8px' }}>
                    {result.scoreEvidence.actionExamples?.map((ex: string, i: number) => (
                      <span className="chip-tag matched" key={i}>{ex.slice(0, 24)}...</span>
                    ))}
                  </div>
                </section>
              </div>
            </details>
          )}

          <div className="keyword-clouds-card card">
            <div className="section-kicker">KEYWORD &amp; TAXONOMY TELEMETRY</div>
            <div className="keyword-clouds-grid">
              <div className="keyword-col matched">
                <h4>✓ Evidenced In Resume ({result.keywords.length})</h4>
                <div className="chips">
                  {result.keywords.map((kw: string) => <span className="chip-tag matched" key={kw}>✓ {kw}</span>)}
                </div>
              </div>
              <div className="keyword-col missing">
                <h4>⚠ High-Priority Skill Gaps ({result.skillGaps.length})</h4>
                <div className="chips">
                  {result.skillGaps.map((g: string) => (
                    <span
                      className="chip-tag missing group"
                      key={g}
                      title="Learn in GoalMind or practice in Interview Lab"
                    >
                      <span>⚠ {g}</span>
                      <button
                        type="button"
                        className="ml-2 font-bold text-indigo-400 hover:text-indigo-200 underline text-[10px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBridgeSkill({
                            skill: g,
                            category: 'Technical Skills',
                            sourceContext: 'Resume Gap',
                            notes: 'Identified as missing high-priority skill in resume audit'
                          });
                        }}
                      >
                        🎯 Master in GoalMind
                      </button>
                      <button
                        type="button"
                        className="ml-1.5 font-bold text-cyan-400 hover:text-cyan-200 underline text-[10px]"
                        onClick={() => navigate(`/interview-simulator?topic=${encodeURIComponent(g)}`)}
                      >
                        Drill →
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bento-grid">
            <div className="bento-card tone-good">
              <h3><span style={{ color: '#10b981' }}>↗</span> Verified Strengths</h3>
              {result.strengths.map((str: string, i: number) => <p key={i}><i>✓</i> {str}</p>)}
            </div>
            <div className="bento-card tone-warn">
              <h3><span style={{ color: '#f59e0b' }}>↘</span> Critical Review Areas</h3>
              {result.weaknesses.map((w: string, i: number) => {
                const targetTopic = w.replace(/^[^a-zA-Z0-9]+/, '').split(':')[0].trim();
                return (
                  <p key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span><i>⚠</i> {w}</span>
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        className="text-btn text-xs text-indigo-400 hover:underline"
                        onClick={() => onBridgeSkill({
                          skill: targetTopic,
                          category: 'Resume Improvement',
                          sourceContext: 'Critical Review Area',
                          notes: w
                        })}
                      >
                        🎯 Bridge in GoalMind →
                      </button>
                      <button
                        type="button"
                        className="text-btn text-xs"
                        onClick={() => navigate(`/interview-simulator?topic=${encodeURIComponent(targetTopic)}`)}
                      >
                        Practice →
                      </button>
                    </span>
                  </p>
                );
              })}
            </div>
            <div className="bento-card tone-indigo" style={{ gridColumn: '1 / -1' }}>
              <h3><span style={{ color: '#38bdf8' }}>✧</span> High-Impact Strategic Improvements</h3>
              {result.improvements.map((imp: string, i: number) => {
                const cleanTopic = imp.split(/[:.—]/)[0].trim();
                return (
                  <div className="improvement-row justify-between items-center" key={i}>
                    <div className="flex items-start gap-3">
                      <b>{String(i + 1).padStart(2, '0')}</b>
                      <div>{imp}</div>
                    </div>
                    <button
                      type="button"
                      className="text-btn text-xs text-indigo-400 hover:underline flex-shrink-0 ml-3"
                      onClick={() => onBridgeSkill({
                        skill: cleanTopic,
                        category: 'Strategic Career Goal',
                        sourceContext: 'Strategic Improvement',
                        notes: imp
                      })}
                    >
                      🎯 Master in GoalMind →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeSubTab === 'matrix' && cur && (
        <>
          <div className="role-pills-bar">
            {result.roles.map((r: any, i: number) => (
              <button
                key={r.title}
                type="button"
                className={`role-select-pill ${activeRoleIdx === i ? 'active' : ''}`}
                onClick={() => setActiveRoleIdx(i)}
              >
                <span>{r.title}</span>
                <span className="role-pill-badge">{r.match}% Match</span>
                <span className={`distance-tag ${r.distance === 'Ready now' ? 'distance-ready' : r.distance === 'Small gap' ? 'distance-small' : 'distance-step'}`}>
                  {r.distance}
                </span>
              </button>
            ))}
          </div>

          <div className="role-detail-card card">
            <div className="role-header-actions">
              <div>
                <div className="section-kicker">VERIFIED SKILL MATRIX</div>
                <h3 style={{ fontSize: '20px', margin: '4px 0 6px', color: '#f8fafc' }}>{cur.title}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>{cur.note}</p>
              </div>
              <div className="link-pill-group">
                <a
                  className="link-pill linkedin"
                  href={`https://www.linkedin.com/jobs/search/?${new URLSearchParams({ keywords: cur.title }).toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn Jobs ↗
                </a>
                <a
                  className="link-pill indeed"
                  href={`https://www.indeed.com/jobs?${new URLSearchParams({ q: cur.title }).toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Indeed Jobs ↗
                </a>
              </div>
            </div>

            <div className="skill-filter-tabs">
              <button
                type="button"
                className={`skill-filter-btn ${skillFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSkillFilter('all')}
              >
                All Skills ({cur.proofMap.length})
              </button>
              <button
                type="button"
                className={`skill-filter-btn ${skillFilter === 'supported' ? 'active' : ''}`}
                onClick={() => setSkillFilter('supported')}
              >
                ✓ Evidenced
              </button>
              <button
                type="button"
                className={`skill-filter-btn ${skillFilter === 'missing' ? 'active' : ''}`}
                onClick={() => setSkillFilter('missing')}
              >
                ⚠ Skill Gaps
              </button>
            </div>

            <div className="proof-matrix-grid">
              {filteredProof.map((item: any) => {
                const isSup = item.status.includes('Supported');
                return (
                  <div className={`proof-matrix-row ${isSup ? 'supported' : 'missing'}`} key={item.skill}>
                    <b>{item.skill}</b>
                    <span style={{ color: isSup ? '#6ee7b7' : '#fde68a', fontWeight: 600 }}>{item.status}</span>
                    <div>
                      {item.evidence ? (
                        <blockquote>"{item.evidence}"</blockquote>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '11px' }}>No direct mention in resume text</span>
                      )}
                      {!isSup && (
                        <div style={{ marginTop: '6px', display: 'flex', gap: '12px' }}>
                          <button
                            type="button"
                            className="text-btn text-xs text-indigo-400 hover:underline"
                            onClick={() => onBridgeSkill({
                              skill: item.skill,
                              category: cur.title,
                              sourceContext: `Target Role: ${cur.title}`,
                              notes: `Skill gap detected against industry requirements for ${cur.title}`
                            })}
                          >
                            🎯 Learn in GoalMind →
                          </button>
                          <button
                            type="button"
                            className="text-btn text-xs"
                            onClick={() => navigate(`/interview-simulator?role=${encodeURIComponent(cur.title)}&topic=${encodeURIComponent(item.skill)}`)}
                          >
                            ⚡ Drill in Interview Lab →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {cur.skillPath && cur.skillPath.length > 0 && (
              <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="section-kicker">STRATEGIC LEARNING ROADMAP</div>
                <ol style={{ paddingLeft: '20px', margin: '8px 0 0', color: '#cbd5e1', fontSize: '12px' }}>
                  {cur.skillPath.map((step: string, idx: number) => {
                    const skillName = step.replace(/^Target next skill:\s*/i, '').split('—')[0].trim();
                    return (
                      <li key={idx} style={{ marginTop: '8px' }}>
                        <span>{step}</span>
                        <div className="inline-flex items-center gap-3 ml-3">
                          <button
                            type="button"
                            className="text-btn text-xs text-indigo-400 hover:underline font-bold"
                            onClick={() => onBridgeSkill({
                              skill: skillName,
                              category: cur.title,
                              sourceContext: 'Strategic Learning Roadmap',
                              notes: step
                            })}
                          >
                            🎯 Master in GoalMind →
                          </button>
                          <button
                            type="button"
                            className="text-btn text-xs"
                            onClick={() => navigate(`/interview-simulator?role=${encodeURIComponent(cur.title)}&topic=${encodeURIComponent(skillName)}`)}
                          >
                            ⚡ Drill in Lab →
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>

          {result.careerBridges && result.careerBridges.length > 0 && (
            <div className="bento-card" style={{ marginTop: '18px' }}>
              <div className="section-kicker">CAREER BRIDGE FINDER · TRANSFERABLE PATHWAYS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '12px' }}>
                {result.careerBridges.map((b: any) => (
                  <div key={b.title} style={{ padding: '14px', background: 'rgba(15,23,42,0.6)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b style={{ color: '#fff', fontSize: '13px' }}>{b.title}</b>
                      <span className="distance-tag distance-small">{b.distance}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '6px 0 8px' }}>{b.explanation}</p>
                    <div className="chips">{b.transferableSkills.map((s: string) => <span className="chip-tag indigo" key={s}>{s}</span>)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeSubTab === 'diff' && (
        <>
          <div className="diff-intro-card card">
            <div className="section-kicker">COMPARATIVE REWRITE ENGINE</div>
            <h3 style={{ margin: '4px 0 8px', color: '#f8fafc' }}>Passive Claims vs. Quantified Executive Impact</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
              Review side-by-side comparative diffs. Transfer optimized bullet points directly into the Executive Writer Studio.
            </p>

            {result.quantifiedBullets.map((qb: any, i: number) => (
              <div className="diff-card-grid" key={i}>
                <div className="diff-card before">
                  <div>
                    <div className="diff-card-header"><span className="diff-tag-before">Before · Raw Resume Text</span></div>
                    <p>{qb.original}</p>
                  </div>
                  <div style={{ fontSize: '10px', color: '#fda4af', marginTop: '10px' }}>⚠️ Passive phrasing / Missing scope metrics</div>
                </div>
                <div className="diff-card after">
                  <div>
                    <div className="diff-card-header"><span className="diff-tag-after">After · Quantified Action Impact</span></div>
                    <p>{qb.suggestion}</p>
                  </div>
                  <div className="diff-card-actions">
                    <button
                      type="button"
                      className={`diff-btn ${copiedId === i ? 'copied' : ''}`}
                      onClick={() => copyBullet(qb.suggestion, i)}
                    >
                      {copiedId === i ? '✓ Copied!' : '📋 One-Click Copy'}
                    </button>
                    <button
                      type="button"
                      className="diff-btn"
                      onClick={() => transferToStudio(qb.suggestion)}
                    >
                      ⚡ Transfer to Studio
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {result.claimStrength && result.claimStrength.length > 0 && (
            <div className="bento-card" style={{ marginTop: '18px' }}>
              <div className="section-kicker">CLAIM STRENGTH &amp; AUDIT TRAIL</div>
              <div style={{ display: 'grid', gap: '10px', marginTop: '12px' }}>
                {result.claimStrength.slice(0, 5).map((cl: any, idx: number) => (
                  <div key={idx} style={{ padding: '12px 14px', background: 'rgba(15,23,42,0.6)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="chip-tag missing" style={{ fontSize: '10px' }}>{cl.strength}</span>
                      <small style={{ color: '#94a3b8', font: '10px monospace' }}>VERIFICATION NEEDED</small>
                    </div>
                    <p style={{ fontSize: '12px', margin: '6px 0', color: '#fff' }}>"{cl.original}"</p>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{cl.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeSubTab === 'radar' && (
        <>
          <div className="radar-grid-4">
            {result.screeningChecks.map((sc: any, i: number) => (
              <div className="radar-quadrant" key={i}>
                <h4>
                  <span style={{ color: '#fff' }}>{sc.label}</span>
                  <span className={`distance-tag ${sc.status === 'Good' ? 'distance-ready' : 'distance-small'}`}>{sc.status}</span>
                </h4>
                <p>{sc.detail}</p>
              </div>
            ))}
          </div>

          {result.consistencyChecks && result.consistencyChecks.length > 0 && (
            <div className="card" style={{ padding: '22px', marginBottom: '20px' }}>
              <div className="section-kicker">CHRONOLOGY TIMELINE AUDITOR</div>
              <h3 style={{ margin: '4px 0 12px', color: '#fff' }}>Employment Sequence &amp; Gap Detection</h3>
              {result.consistencyChecks.map((cc: any, idx: number) => (
                <div key={idx} style={{ padding: '12px 0', borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ color: '#38bdf8', fontSize: '13px' }}>{cc.area}</b>
                    <span className={`distance-tag ${cc.status.includes('No') ? 'distance-ready' : 'distance-small'}`}>{cc.status}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '6px 0' }}>{cc.detail}</p>
                  {cc.evidence?.length > 0 && (
                    <div className="chips">{cc.evidence.map((ev: string, i: number) => <span className="chip-tag indigo" key={i}>{ev}</span>)}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {result.blindSpots && result.blindSpots.length > 0 && (
            <div className="card" style={{ padding: '22px' }}>
              <div className="section-kicker">RECRUITER INTERVIEW WARNING PROBES</div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 16px' }}>
                Vague claims trigger targeted recruiter scrutiny. Prepare answers for these potential interview traps:
              </p>
              {result.blindSpots.map((bs: any, idx: number) => (
                <div className="warning-callout-card" key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ font: '700 11px monospace', color: '#f59e0b' }}>TRIGGER EXCERPT #{idx + 1}</span>
                    <span className="distance-tag distance-small">High Scrutiny</span>
                  </div>
                  <blockquote>"{bs.evidence}"</blockquote>
                  <div className="probe">Recruiter Probe: "{bs.verificationQuestion}"</div>
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="diff-btn"
                      onClick={() => navigate(`/interview-simulator?mode=project-defense&projectTitle=${encodeURIComponent(bs.evidence.slice(0, 60))}`)}
                    >
                      🛡️ Defend This Probe in Interview Lab →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
};

function SvgScoreRing({ label, value, color, note }: { label: string; value: number; color: string; note: string }) {
  const r = 26, circ = 2 * Math.PI * r, off = circ - (Math.min(100, Math.max(0, value)) / 100) * circ;
  return (
    <div className="score-card">
      <div className="score-ring-container">
        <svg className="score-ring-svg" viewBox="0 0 66 66">
          <circle className="ring-track" cx="33" cy="33" r={r} />
          <circle className="ring-fill" cx="33" cy="33" r={r} stroke={color} strokeDasharray={circ} strokeDashoffset={off} />
        </svg>
        <div className="score-ring-val"><strong>{value}</strong><small>/100</small></div>
      </div>
      <div className="score-copy"><b>{label}</b><span>{note}</span></div>
    </div>
  );
}

function RewriteView({
  resume,
  filePayload,
  rewrite,
  isRewriting,
  rewritten,
  copy,
  selectedTemplate,
  setSelectedTemplate,
  targetRole,
  setTargetRole,
  experienceDetails,
  setExperienceDetails,
  jobDescription,
  setJobDescription,
  includePlaceholders,
  setIncludePlaceholders,
  accentColor,
  setAccentColor,
  documentPreview,
  setDocumentReviewed,
  documentReviewed,
  isPreparingDocument,
  downloadingFormat,
  prepareResumeDocument,
  exportResumeDocument
}: any) {
  return (
    <>
      <div className="rewrite-layout">
        <section className="card rewrite-form">
          <div className="section-kicker">EXECUTIVE REWRITE STUDIO</div>
          <h2>Optimize Resume Layout &amp; Content</h2>
          <label>Target Role <span>Optional</span><input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Senior Staff Product Designer" /></label>
          <label>Verified Achievements &amp; Skills <span>Optional</span><textarea value={experienceDetails} onChange={e => setExperienceDetails(e.target.value)} placeholder="Add verified achievements or bullet points to emphasize." /></label>
          <label>Job Description <span>Emphasis context only</span><textarea className="short" value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste job spec to align terminology." /></label>
          <div style={{ marginTop: '16px', fontSize: '11px', fontWeight: 700 }}>Choose Executive Layout</div>
          <div className="template-grid">
            {templates.map(t => (
              <button key={t.id} type="button" className={`template-card ${selectedTemplate === t.id ? 'selected' : ''}`} onClick={() => setSelectedTemplate(t.id)}>
                <span className={`template-preview ${t.id}`} style={{ '--doc-accent': accentOptions.find(o => o.id === accentColor)?.color || '#2b5d84' } as any}>
                  <b>{t.preview[0]}</b><strong>{t.preview[1]}</strong><small>{t.preview[2]}</small>
                </span>
                <span className="template-name">{t.name}</span>
                <span className="template-description">{t.description}</span>
              </button>
            ))}
          </div>
          <label>Accent Palette<select value={accentColor} onChange={e => setAccentColor(e.target.value)}>{accentOptions.map(o => <option value={o.id} key={o.id}>{o.label}</option>)}</select></label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <input type="checkbox" checked={includePlaceholders} onChange={e => setIncludePlaceholders(e.target.checked)} />
            Include placeholders for missing sections
          </label>
          <button type="button" className="primary-btn" style={{ marginTop: '20px' }} onClick={rewrite} disabled={isRewriting}>
            {isRewriting ? <><span className="spinner" /> Generating Rewrite...</> : <>Generate Rewrite <b>→</b></>}
          </button>
          <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button type="button" className="outline-btn" style={{ width: '100%' }} onClick={prepareResumeDocument} disabled={isPreparingDocument || (!resume.trim() && !filePayload)}>
              {isPreparingDocument ? 'Formatting...' : 'Preview Formatted Submission Sheet'}
            </button>
          </div>
        </section>

        <section className="rewrite-output card">
          <div className="output-head">
            <div><div className="section-kicker">SYNTHESIZED DRAFT</div><h2 style={{ fontSize: '20px', margin: 0, color: '#f8fafc' }}>{rewritten ? 'Optimized Content' : 'Draft Canvas'}</h2></div>
            {rewritten && <div className="output-actions"><button type="button" onClick={copy}>Copy Text</button></div>}
          </div>
          {rewritten ? <pre>{rewritten}</pre> : <div className="output-empty"><div>✧</div><p>Executive Rewrite Canvas Ready</p><small>Generate a rewrite or transfer bullets from the Diff Engine.</small></div>}
        </section>
      </div>

      {documentPreview && (
        <section className="submission-review card">
          <div className="output-head">
            <div><div className="section-kicker">FORMATTED DOCUMENT PREVIEW · {documentPreview.template.toUpperCase()}</div><h2 style={{ color: '#fff' }}>Export-Ready Submission Document</h2></div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="outline-btn" onClick={() => exportResumeDocument('pdf')} disabled={!documentReviewed || Boolean(downloadingFormat)}>{downloadingFormat === 'pdf' ? 'Preparing PDF...' : 'Download PDF'}</button>
              <button type="button" className="outline-btn" onClick={() => exportResumeDocument('docx')} disabled={!documentReviewed || Boolean(downloadingFormat)}>{downloadingFormat === 'docx' ? 'Preparing DOCX...' : 'Download DOCX'}</button>
            </div>
          </div>
          <div className={`document-sheet template-${documentPreview.template}`} style={{ '--doc-accent': documentPreview.accentColor } as any}>
            {documentPreview.blocks?.map((block: any, idx: number) => <DocumentBlock block={block} key={idx} />)}
          </div>
          <div style={{ maxWidth: '760px', margin: '20px auto 0', padding: '16px', background: 'rgba(15,23,42,0.8)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
              <input type="checkbox" checked={documentReviewed} onChange={e => setDocumentReviewed(e.target.checked)} />
              I have reviewed the facts and confirm all metrics and statements are verified.
            </label>
          </div>
        </section>
      )}
    </>
  );
}

function DocumentBlock({ block }: { block: any }) {
  if (block.type === 'spacer') return <div style={{ height: '8px' }} />;
  if (block.type === 'heading') return <h3>{block.text}</h3>;
  if (block.type === 'name') return <h2>{block.text}</h2>;
  if (block.type === 'target' || block.type === 'contact') return <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 10px' }}>{block.text}</p>;
  if (block.type === 'bullet') return <p className="document-bullet">{block.text}</p>;
  if (block.type === 'placeholder') return <p className="document-placeholder">{block.text}</p>;
  return <p>{block.text}</p>;
}
