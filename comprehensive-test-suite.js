/**
 * Comprehensive Automated End-to-End Test Suite for Unified Career Intelligence Platform
 * (GoalMind AI + Resume Analyzer + Interview Simulator)
 * Targeting: http://localhost:3000
 */

const { createRealisticResumePdfBase64 } = require('./test-pdf-generator');

const BASE_URL = 'http://localhost:3000';
const REALISTIC_PDF_BASE64 = createRealisticResumePdfBase64();

const SAMPLE_RESUME_TEXT = `
Alex Mercer
Senior Full Stack Engineer | Bengaluru, India | alex.mercer@example.com | +91 9876543210
linkedin.com/in/alexmercer | github.com/alexmercer

PROFESSIONAL SUMMARY
Results-driven Senior Full Stack Software Engineer with 6+ years of experience building high-scale distributed systems, microservices, and modern web applications. Proven track record of improving system throughput by 42% and reducing API latency by 35% across cloud environments.

CORE COMPETENCIES & TECHNICAL SKILLS
Languages: Java (8/11/17/21), TypeScript, JavaScript, Python, SQL
Frameworks & Libraries: Spring Boot, React, Next.js, Node.js, Express, Redux Toolkit, Tailwind CSS
Databases & Storage: PostgreSQL, MySQL, Redis, MongoDB, Elasticsearch
Cloud & DevOps: AWS (EC2, S3, ECS, Lambda), Docker, Kubernetes, GitHub Actions, Terraform
Architecture: Microservices, RESTful APIs, Event-Driven Architecture, Kafka, System Design

WORK EXPERIENCE
Senior Software Engineer | FinTech Innovations Inc. | 2022 - Present
- Architected and delivered a payment orchestration microservice using Spring Boot and PostgreSQL, handling 15,000+ transactions per second with 99.99% uptime.
- Spearheaded migration of monolithic customer portal to React and Vite with TypeScript, improving Core Web Vitals score from 58 to 94.
- Integrated Redis caching and database indexing strategies, slashing average query response times from 180ms to 24ms.
- Mentored 5 junior and mid-level engineers through code reviews, design docs, and pair programming sessions.

Software Engineer | CloudScale Systems | 2019 - 2022
- Designed and maintained 12+ RESTful microservices using Spring Cloud, Docker, and Kafka.
- Implemented comprehensive CI/CD pipelines using GitHub Actions, reducing deployment cycle times by 65%.
- Authored automated test suites with JUnit 5, Mockito, and Cypress achieving 88% test coverage.

EDUCATION
Bachelor of Engineering in Computer Science & Engineering | Top Tier University | 2015 - 2019
CGPA: 8.9/10

CERTIFICATIONS & AWARDS
- AWS Certified Solutions Architect - Associate
- Best Innovation Award (Q3 2023) - FinTech Innovations
`;

let testResults = [];

function recordTest(suite, testName, passed, details = '') {
    const status = passed ? 'PASS' : 'FAIL';
    testResults.push({ suite, testName, passed, details });
    const color = passed ? '\x1b[32m' : '\x1b[31m';
    console.log(`${color}[${status}]\x1b[0m [${suite}] ${testName} ${details ? '- ' + details : ''}`);
}

async function runResumeAnalyzerTests() {
    console.log('\n--- SUITE 1: RESUME ANALYZER (Proxying /api/* -> Port 8787) ---');

    // 1.1 Health check
    try {
        const res = await fetch(`${BASE_URL}/api/health`, { headers: { Origin: BASE_URL } });
        const json = await res.json();
        recordTest('ResumeAnalyzer', 'Health Check', res.status === 200 && json.ok === true, `Service: ${json.service}`);
    } catch (e) {
        recordTest('ResumeAnalyzer', 'Health Check', false, e.message);
    }

    // 1.2 Config endpoint
    try {
        const res = await fetch(`${BASE_URL}/api/config`, { headers: { Origin: BASE_URL } });
        const json = await res.json();
        recordTest('ResumeAnalyzer', 'Config Check', res.status === 200, `Model: ${json.model || 'rule-engine'}`);
    } catch (e) {
        recordTest('ResumeAnalyzer', 'Config Check', false, e.message);
    }

    // 1.3 Analyze with valid raw text (Software Engineer)
    try {
        const res = await fetch(`${BASE_URL}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
            body: JSON.stringify({
                resume: SAMPLE_RESUME_TEXT
            })
        });
        const json = await res.json();
        const valid = res.status === 200 && typeof json.overall === 'number' && json.overall > 0;
        recordTest('ResumeAnalyzer', 'Analyze Plain Text Resume', valid, `Score: ${json.overall}/100, ATS: ${json.ats}/100, Recruiter: ${json.recruiter}/100`);
    } catch (e) {
        recordTest('ResumeAnalyzer', 'Analyze Plain Text Resume', false, e.message);
    }

    // 1.4 Analyze with Base64 PDF file (The exact user scenario!)
    try {
        const res = await fetch(`${BASE_URL}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
            body: JSON.stringify({
                fileName: 'alex_mercer_resume.pdf',
                fileContentBase64: REALISTIC_PDF_BASE64
            })
        });
        const json = await res.json();
        const valid = res.status === 200 && typeof json.overall === 'number' && json.overall > 0;
        recordTest('ResumeAnalyzer', 'Analyze PDF File (Base64 Extraction)', valid, `Score: ${json.overall}/100, ATS: ${json.ats}/100, Words: ${json.wordCount}`);
    } catch (e) {
        recordTest('ResumeAnalyzer', 'Analyze PDF File (Base64 Extraction)', false, e.message);
    }

    // 1.5 Short / Invalid input handling (Should reject gracefully with 400 Bad Request)
    try {
        const res = await fetch(`${BASE_URL}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
            body: JSON.stringify({
                resume: 'Too short text'
            })
        });
        const json = await res.json();
        recordTest('ResumeAnalyzer', 'Short Invalid Resume Validation', res.status === 400, `Rejected cleanly: "${json.error || 'Invalid'}"`);
    } catch (e) {
        recordTest('ResumeAnalyzer', 'Short Invalid Resume Validation', false, e.message);
    }

    // 1.6 Resume Rewrite Feature
    try {
        const res = await fetch(`${BASE_URL}/api/rewrite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
            body: JSON.stringify({
                resume: SAMPLE_RESUME_TEXT,
                template: 'classic',
                targetRole: 'Senior Cloud Architect'
            })
        });
        const json = await res.json();
        const valid = res.status === 200 && json.rewritten && json.rewritten.length > 50;
        recordTest('ResumeAnalyzer', 'Resume Rewrite AI Engine', valid, `Generated ${json.rewritten ? json.rewritten.length : 0} chars`);
    } catch (e) {
        recordTest('ResumeAnalyzer', 'Resume Rewrite AI Engine', false, e.message);
    }

    // 1.7 Document Generation & Export
    try {
        const res = await fetch(`${BASE_URL}/api/document`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
            body: JSON.stringify({
                text: SAMPLE_RESUME_TEXT,
                template: 'classic'
            })
        });
        const json = await res.json();
        const valid = res.status === 200 && json.filename && json.content;
        recordTest('ResumeAnalyzer', 'Document RTF Generation', valid, `Filename: ${json.filename}, Type: ${json.contentType}`);
    } catch (e) {
        recordTest('ResumeAnalyzer', 'Document RTF Generation', false, e.message);
    }

    // 1.8 Vacancy matching
    try {
        const res = await fetch(`${BASE_URL}/api/vacancies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
            body: JSON.stringify({
                resume: SAMPLE_RESUME_TEXT
            })
        });
        const json = await res.json();
        const valid = res.status === 200 && Array.isArray(json) && json.length > 0;
        recordTest('ResumeAnalyzer', 'Job Vacancies Matcher', valid, `Matched ${json ? json.length : 0} live job postings`);
    } catch (e) {
        recordTest('ResumeAnalyzer', 'Job Vacancies Matcher', false, e.message);
    }

    // 1.9 Vacancy summary
    try {
        const res = await fetch(`${BASE_URL}/api/vacancies/summary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
            body: JSON.stringify({
                resume: SAMPLE_RESUME_TEXT
            })
        });
        const json = await res.json();
        const valid = res.status === 200 && json.role && Array.isArray(json.matchedTerms);
        recordTest('ResumeAnalyzer', 'Job Vacancy Role Summary', valid, `Role: "${json.role}", Matched: ${json.matchedTerms ? json.matchedTerms.length : 0} keywords`);
    } catch (e) {
        recordTest('ResumeAnalyzer', 'Job Vacancy Role Summary', false, e.message);
    }
}

async function runInterviewSimulatorTests() {
    console.log('\n--- SUITE 2: INTERVIEW SIMULATOR (Proxying /api/* -> Port 8787) ---');

    // 2.1 Company Library (Questions bank)
    try {
        const res = await fetch(`${BASE_URL}/api/company-library`, { headers: { Origin: BASE_URL } });
        const json = await res.json();
        const valid = res.status === 200 && Array.isArray(json.questions) && json.questions.length > 0;
        recordTest('InterviewSimulator', 'Company Library Retrieval', valid, `Available questions: ${json.questions ? json.questions.length : 0}`);
    } catch (e) {
        recordTest('InterviewSimulator', 'Company Library Retrieval', false, e.message);
    }

    // 2.2 Company Library Filter (Filter by company)
    try {
        const res = await fetch(`${BASE_URL}/api/company-library?company=Google`, { headers: { Origin: BASE_URL } });
        const json = await res.json();
        const valid = res.status === 200 && Array.isArray(json.questions) && json.questions.length > 0;
        recordTest('InterviewSimulator', 'Company Library Google Filter', valid, `Filtered questions: ${json.questions ? json.questions.length : 0}`);
    } catch (e) {
        recordTest('InterviewSimulator', 'Company Library Google Filter', false, e.message);
    }

    // 2.3 Dashboard & Readiness Metrics
    try {
        const res = await fetch(`${BASE_URL}/api/dashboard`, { headers: { Origin: BASE_URL } });
        const json = await res.json();
        const valid = res.status === 200 && Array.isArray(json.skills);
        recordTest('InterviewSimulator', 'Readiness Dashboard', valid, `Skills monitored: ${json.skills ? json.skills.length : 0}`);
    } catch (e) {
        recordTest('InterviewSimulator', 'Readiness Dashboard', false, e.message);
    }

    // 2.4 Start an Interview Session (Senior System Design at Google)
    let sessionId = null;
    let firstQuestionId = null;
    try {
        const res = await fetch(`${BASE_URL}/api/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
            body: JSON.stringify({
                role: 'Senior Backend Engineer',
                experienceLevel: 'SENIOR',
                interviewType: 'System Design',
                company: 'Google',
                questionCount: 2
            })
        });
        const json = await res.json();
        const valid = res.status === 201 && json.id;
        sessionId = json.id;
        if (json.questions && json.questions.length > 0) {
            firstQuestionId = json.questions[0].id;
        }
        recordTest('InterviewSimulator', 'Start Interview Session', valid, `Session #${sessionId}, Questions: ${json.questions ? json.questions.length : 0}`);
    } catch (e) {
        recordTest('InterviewSimulator', 'Start Interview Session', false, e.message);
    }

    // 2.5 Ask for a Hint on Question 1
    if (sessionId && firstQuestionId) {
        try {
            const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}/questions/${firstQuestionId}/hint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Origin: BASE_URL }
            });
            const json = await res.json();
            const valid = res.status === 200 && Boolean(json.hint);
            recordTest('InterviewSimulator', 'Request Question Hint', valid, `Hint received (${json.hintsUsed} used)`);
        } catch (e) {
            recordTest('InterviewSimulator', 'Request Question Hint', false, e.message);
        }

        // 2.6 Ask for a Clarification on Question 1
        try {
            const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}/questions/${firstQuestionId}/clarify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
                body: JSON.stringify({ query: 'What is the expected read-to-write ratio?' })
            });
            const json = await res.json();
            const valid = res.status === 200 && Boolean(json.interviewerAnswer);
            recordTest('InterviewSimulator', 'Interviewer Clarification Flow', valid, `Interviewer Answer: "${json.interviewerAnswer ? json.interviewerAnswer.substring(0, 50) + '...' : ''}"`);
        } catch (e) {
            recordTest('InterviewSimulator', 'Interviewer Clarification Flow', false, e.message);
        }

        // 2.7 Submit Answer for Question 1 & Receive AI Evaluation
        try {
            const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}/questions/${firstQuestionId}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
                body: JSON.stringify({
                    answer: 'I would design this using an event-driven microservices architecture with Apache Kafka for log streaming, Redis for distributed caching, and PostgreSQL partitioned horizontally with read replicas for data durability. For high availability, I will place services behind an AWS Application Load Balancer.'
                })
            });
            const json = await res.json();
            const valid = res.status === 200 && typeof json.score === 'number';
            recordTest('InterviewSimulator', 'Submit Answer & AI Evaluation', valid, `Score: ${json.score}/100, Accepted: ${json.accepted}`);
        } catch (e) {
            recordTest('InterviewSimulator', 'Submit Answer & AI Evaluation', false, e.message);
        }

        // 2.8 Retrieve Session State
        try {
            const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}`, { headers: { Origin: BASE_URL } });
            const json = await res.json();
            recordTest('InterviewSimulator', 'Retrieve Session State by ID', res.status === 200 && json.id === sessionId, `Session #${json.id} verified`);
        } catch (e) {
            recordTest('InterviewSimulator', 'Retrieve Session State by ID', false, e.message);
        }
    }

    // 2.9 Session History
    try {
        const res = await fetch(`${BASE_URL}/api/sessions`, { headers: { Origin: BASE_URL } });
        const json = await res.json();
        recordTest('InterviewSimulator', 'Session History Listing', res.status === 200 && Array.isArray(json), `Total past sessions: ${json.length}`);
    } catch (e) {
        recordTest('InterviewSimulator', 'Session History Listing', false, e.message);
    }

    // 2.10 Resume Context Extraction for Interview
    try {
        const res = await fetch(`${BASE_URL}/api/interview/context`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
            body: JSON.stringify({
                resume: SAMPLE_RESUME_TEXT
            })
        });
        const json = await res.json();
        const valid = res.status === 200 && Boolean(json.resumeContext);
        recordTest('InterviewSimulator', 'Extract Resume Context for Tailored Questions', valid, `Context length: ${json.resumeContext ? json.resumeContext.length : 0} chars, Note: ${json.note}`);
    } catch (e) {
        recordTest('InterviewSimulator', 'Extract Resume Context for Tailored Questions', false, e.message);
    }
}

async function runGoalMindTests() {
    console.log('\n--- SUITE 3: GOALMIND AI (Proxying /api/* -> Port 8080) ---');

    const testUsername = `user_${Date.now()}`;
    const testPassword = 'StrongPassword!2026';
    let jwtToken = null;

    // 3.1 Register with strong credentials
    try {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
            body: JSON.stringify({
                username: testUsername,
                password: testPassword
            })
        });
        const json = await res.json();
        const valid = (res.status === 200 || res.status === 201) && json.token;
        jwtToken = json.token;
        recordTest('GoalMindAuth', 'Register with Username & Strong Password', valid, `User: ${testUsername}`);
    } catch (e) {
        recordTest('GoalMindAuth', 'Register with Username & Strong Password', false, e.message);
    }

    // 3.2 Duplicate username rejection
    try {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
            body: JSON.stringify({
                username: testUsername,
                password: testPassword
            })
        });
        recordTest('GoalMindAuth', 'Reject Duplicate Username', res.status === 400 || res.status === 409, `Rejected with HTTP ${res.status}`);
    } catch (e) {
        recordTest('GoalMindAuth', 'Reject Duplicate Username', false, e.message);
    }

    // 3.3 Weak password rejection
    try {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
            body: JSON.stringify({
                username: `weak_${Date.now()}`,
                password: '123'
            })
        });
        recordTest('GoalMindAuth', 'Reject Weak Password', res.status === 400, `Rejected with HTTP ${res.status}`);
    } catch (e) {
        recordTest('GoalMindAuth', 'Reject Weak Password', false, e.message);
    }

    // 3.4 Login with valid credentials
    try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
            body: JSON.stringify({
                username: testUsername,
                password: testPassword
            })
        });
        const json = await res.json();
        const valid = res.status === 200 && json.token;
        if (valid) jwtToken = json.token;
        recordTest('GoalMindAuth', 'Login with Username & Password', valid, `JWT token received`);
    } catch (e) {
        recordTest('GoalMindAuth', 'Login with Username & Password', false, e.message);
    }

    if (!jwtToken) {
        console.error('Cannot proceed with authenticated GoalMind tests without JWT.');
        return;
    }

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
        Origin: BASE_URL
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const targetDateStr = new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0];

    // 3.5 Goal Feasibility Check (AI Engine)
    try {
        const res = await fetch(`${BASE_URL}/api/goals/feasibility`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                title: 'Master Kubernetes Architecture & Helm Deployments',
                category: 'CAREER',
                startDate: todayStr,
                targetDate: targetDateStr,
                dailyHours: 2.0,
                daysPerWeek: 6
            })
        });
        const json = await res.json();
        const valid = res.status === 200 && json.status !== undefined;
        recordTest('GoalMindGoals', 'AI Feasibility Check', valid, `Feasibility: ${json.status}, Estimated Hours: ${json.estimatedWorkloadHours}`);
    } catch (e) {
        recordTest('GoalMindGoals', 'AI Feasibility Check', false, e.message);
    }

    // 3.6 Create Bridged Goal from Resume Analyzer Skill Gap
    let createdGoalId = null;
    try {
        const res = await fetch(`${BASE_URL}/api/goals`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                title: 'Bridge Skill Gap: Microservices & Distributed Tracing',
                description: 'Pre-filled from Resume Analyzer improvement recommendation',
                category: 'CAREER',
                startDate: todayStr,
                targetDate: targetDateStr,
                dailyHours: 2.0,
                daysPerWeek: 6,
                priority: 'HIGH'
            })
        });
        const json = await res.json();
        const valid = (res.status === 200 || res.status === 201) && json.id;
        createdGoalId = json.id;
        recordTest('GoalMindGoals', 'Create Bridged Goal', valid, `Goal ID #${createdGoalId}`);
    } catch (e) {
        recordTest('GoalMindGoals', 'Create Bridged Goal', false, e.message);
    }

    // 3.7 AI Roadmap Preview & Application (Milestone and Task Population)
    if (createdGoalId) {
        let roadmapPreview = null;
        try {
            const res = await fetch(`${BASE_URL}/api/goals/${createdGoalId}/roadmap/generate`, {
                method: 'POST',
                headers: authHeaders
            });
            const json = await res.json();
            const valid = res.status === 200 && Array.isArray(json.milestones) && json.milestones.length > 0;
            roadmapPreview = json;
            recordTest('GoalMindGoals', 'AI Roadmap Generation Preview', valid, `Milestones planned: ${json.milestones ? json.milestones.length : 0}`);
        } catch (e) {
            recordTest('GoalMindGoals', 'AI Roadmap Generation Preview', false, e.message);
        }

        if (roadmapPreview) {
            try {
                const res = await fetch(`${BASE_URL}/api/goals/${createdGoalId}/roadmap/apply`, {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify(roadmapPreview)
                });
                const json = await res.json();
                const valid = res.status === 200 && Array.isArray(json.milestones) && json.milestones.length > 0;
                recordTest('GoalMindGoals', 'Apply AI Roadmap to Calendar & DB', valid, `Committed milestones: ${json.milestones.length}`);
            } catch (e) {
                recordTest('GoalMindGoals', 'Apply AI Roadmap to Calendar & DB', false, e.message);
            }
        }

        // 3.8 Retrieve Goal Details with Milestones
        try {
            const res = await fetch(`${BASE_URL}/api/goals/${createdGoalId}`, { headers: authHeaders });
            const json = await res.json();
            const valid = res.status === 200 && json.id === createdGoalId;
            recordTest('GoalMindGoals', 'Retrieve Goal Details & Progress', valid, `Goal: "${json.title}", Status: ${json.status}`);
        } catch (e) {
            recordTest('GoalMindGoals', 'Retrieve Goal Details & Progress', false, e.message);
        }
    }

    // 3.9 Dashboard Analytics
    try {
        const res = await fetch(`${BASE_URL}/api/analytics/dashboard`, { headers: authHeaders });
        const json = await res.json();
        const valid = res.status === 200 && json.activeGoals !== undefined;
        recordTest('GoalMindAnalytics', 'Dashboard Analytics', valid, `Active Goals: ${json.activeGoals}, Total Tasks: ${json.totalTasks}`);
    } catch (e) {
        recordTest('GoalMindAnalytics', 'Dashboard Analytics', false, e.message);
    }

    // 3.10 Consistency Analytics
    try {
        const res = await fetch(`${BASE_URL}/api/analytics/consistency?period=LAST_30_DAYS`, { headers: authHeaders });
        const json = await res.json();
        recordTest('GoalMindAnalytics', 'Consistency Engine Analytics', res.status === 200, `Consistency score: ${json.consistencyScore !== undefined ? json.consistencyScore : 'calculated'}`);
    } catch (e) {
        recordTest('GoalMindAnalytics', 'Consistency Engine Analytics', false, e.message);
    }

    // 3.11 Notifications
    try {
        const res = await fetch(`${BASE_URL}/api/notifications`, { headers: authHeaders });
        const json = await res.json();
        recordTest('GoalMindNotifications', 'Retrieve Notifications', res.status === 200 && Array.isArray(json), `Notifications count: ${json.length}`);
    } catch (e) {
        recordTest('GoalMindNotifications', 'Retrieve Notifications', false, e.message);
    }
}

async function main() {
    console.log('================================================================');
    console.log(' STARTING END-TO-END MULTI-INPUT INTEGRATION VALIDATION');
    console.log(` Target Unified Endpoint: ${BASE_URL}`);
    console.log('================================================================');

    await runResumeAnalyzerTests();
    await runInterviewSimulatorTests();
    await runGoalMindTests();

    console.log('\n================================================================');
    console.log(' TEST EXECUTION SUMMARY');
    console.log('================================================================');
    const total = testResults.length;
    const passed = testResults.filter(t => t.passed).length;
    const failed = total - passed;

    console.log(`Total Scenarios Tested: ${total}`);
    console.log(`Passed:                 \x1b[32m${passed}\x1b[0m`);
    console.log(`Failed:                 \x1b[31m${failed}\x1b[0m`);

    if (failed === 0) {
        console.log('\n\x1b[32m>>> ALL SCENARIOS PASSED WITH ZERO ERRORS! PLATFORM IS FULLY OPERATIONAL. <<<\x1b[0m');
        process.exit(0);
    } else {
        console.log(`\n\x1b[31m>>> ${failed} SCENARIOS FAILED! <<<\x1b[0m`);
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Test execution fatal error:', err);
    process.exit(1);
});
