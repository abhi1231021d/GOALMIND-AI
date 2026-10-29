# GoalMind AI + Career Intelligence Platform Integration Roadmap

## Objective
Unify GoalMind AI with AI Resume Analyzer and Interview Simulator into a single cohesive Career Intelligence Platform on `http://localhost:3000` with shared auth, seamless interactive permission bridges, and bidirectional skill mastery loops.

---

### Phase 1: Gateway & Reverse Proxy Configuration
- [x] Configure `frontend/vite.config.ts` to proxy career suite endpoints (`/api/analyze`, `/api/rewrite`, `/api/interview`, `/api/sessions`, `/api/resume-document`, `/api/company-library`, `/api/dashboard`, `/api/config`) to `http://localhost:8787` and GoalMind endpoints to `http://localhost:8080`.

### Phase 2: Career Suite Styles & Bridge Modal Component
- [x] Create `frontend/src/styles/career-suite.css` cleanly scoped for the career suite.
- [x] Create `frontend/src/components/career/GoalMindBridgeModal.tsx` for permission-based handoff into GoalMind learning roadmaps.

### Phase 3: Port Resume Analyzer View
- [x] Create `frontend/src/pages/ResumeAnalyzerPage.tsx` including:
  - Audit & Insights (ATS, Recruiter, Health scores)
  - Keyword and Taxonomy Telemetry with GoalMind bridge
  - Bento Grid (Strengths, Weaknesses, Improvements) with GoalMind bridge
  - Role Match & Proof Matrix with GoalMind bridge
  - Executive Writer Studio & Resume Document Export
  - Bridge modal confirmation and `sessionStorage` payload dispatch

### Phase 4: Port Interview Simulator View
- [x] Create `frontend/src/pages/InterviewSimulatorPage.tsx` including:
  - Setup screen with Role, Mode, Project Defense, and Topic selection
  - Question player with timer, dictation, pacing telemetry, and STAR framework
  - Follow-up defense and staff ghost answers
  - 100+ Question Company Library
  - Replay and review modal
  - Bridge modal on low-scoring questions (< 7/10) to master concepts in GoalMind

### Phase 5: Auto-Fill Integration in Goal Creation Wizard
- [x] Update `frontend/src/pages/CreateGoalPage.tsx` to read `goalmind_bridge_payload` from `sessionStorage`.
- [x] Pre-populate title, category, reason, target outcome, daily hours, days per week, difficulty.
- [x] Render informative assessment origin badge.

### Phase 6: Bi-Directional Retest Loop
- [x] Update `frontend/src/pages/GoalDetailPage.tsx` with a celebration card when progress reaches 100%, linking directly to a 5-minute mock interview in `/interview-simulator`.

### Phase 7: Navigation & Routing Integration
- [x] Update `frontend/src/components/layout/Navbar.tsx` with navigation links for Goals & Roadmaps, Resume Analyzer, and Interview Simulator.
- [x] Update `frontend/src/components/layout/Sidebar.tsx` with a dedicated Career Intelligence Suite section.
- [x] Update `frontend/src/App.tsx` with protected routes for `/resume-analyzer` and `/interview-simulator`.

### Phase 8: Multi-Service Automation Launcher
- [x] Update `start.ps1` to stop lingering processes and orchestrate both Spring Boot backends (8080 and 8787), frontend (3000), and reverse proxy gateway.
- [x] Update `start.bat` for seamless execution.

### Phase 9: Empirical Validation & Adversarial Review
- [x] Typecheck frontend (`npx tsc --noEmit` -> 0 errors).
- [x] Build frontend (`npm run build` -> 0 errors, 2459 modules bundled).
- [x] Run backend tests (`mvn test` -> 19 tests run, 0 failures, 0 errors).
- [x] Adversarial CodeRabbit review (Security, Reliability, Edge Cases, Regressions audited and verified).

---

## Milestone 2: Enterprise Hardening & Unified Backend Monolith

### Phase 10: Backend Codebase Consolidation (Single Port 8080 JAR)
- [x] Merge dependencies from `ai resume analyzer and interview simulator/pom.xml` (PDFBox, Tika, etc.) into `backend/pom.xml`.
- [x] Port `com.resumekit` and `com.example.interview` packages directly into `backend/src/main/java`.
- [x] Update `frontend/vite.config.ts` to route all `/api/**` endpoints to the single backend on port 8080 (eliminating port 8787).

### Phase 11: Multi-Tenant Isolation for Interview Sessions
- [x] Associate `com.example.interview.model.InterviewSession` with GoalMind's authenticated `User`.
- [x] Restrict `GET /api/sessions`, `GET /api/sessions/{id}`, and deletions so users can only access their own practice sessions.

### Phase 12: Security & Resilience Hardening
- [x] Fix CORS configuration: remove wildcard origin pattern when credentials are enabled; support environment-driven origin whitelist.
- [x] Configure `RestTemplate` in `AiService` with explicit 5-second connect and 20-second read timeouts.
- [x] Add PostgreSQL cloud database configuration profile for Render deployment alongside local H2.

### Phase 13: Frontend Optimization & Bundle Splitting
- [x] Implement `React.lazy()` and `Suspense` for all major routes in `frontend/src/App.tsx`.
- [x] Verify production bundle splitting cuts initial chunk size under 500KB (initial chunk reduced to 89KB).
- [x] Replace `window.location.href = '/login'` in `api.ts` with SPA navigation and reactive auth session event handling.

### Phase 14: Verification, Test Suite & Git Synchronization
- [x] Run backend unit tests (`mvn test` -> 19 passed, 0 failures).
- [x] Package backend JAR (`mvn package` -> `goalmind-backend-1.0.0.jar` created).
- [x] Run frontend production build (`npm run build` -> 0 errors, all chunks < 500KB).
- [x] Run 31-point end-to-end test suite (`node comprehensive-test-suite.js` -> 31/31 PASSED).
- [x] Synchronize and commit all fixes to Git.

---

## Milestone 3: AI Reliability & Latency Optimization

### Phase 15: Resume Extraction & Validation Resilience
- [x] Prevent false rejections on real resumes in `ResumeValidator.java` and `ResumeAnalyzerPage.tsx` by relaxing heading regex, supporting modern titles/frameworks/dates, and bypassing raw text checks on binary PDF/DOCX uploads.
- [x] Upgrade `ResumeExtractionService.java` with 3-layer PDF extraction: Column-aware stripper -> standard PDFTextStripper -> Apache Tika parser fallback.
- [x] Upgrade `AnalysisContractValidator.java` with normalized excerpt matching (`containsEvidence`, `normalizeForMatch`) to handle whitespace, CRLF vs LF, non-breaking spaces, and unicode quotes/dashes without throwing unhandled exceptions.
- [x] Harden `ResumeService.java` with `safeValidate` to guarantee valid structured analysis even under excerpt variance.

### Phase 16: Zero-Freeze Latency & Fallback Architecture
- [x] Reduce HTTP client connect (2.5s) and read (6s) timeouts across `ProviderClient.java` and `AiService.java`.
- [x] Implement instant deterministic fallbacks (`demo.analyze()`, `orchestrator.offlineRewrite()`, and `generateRuleBasedRoadmap()`).
- [x] Add lazy initialization for `HttpClient` in `ProviderClient.java` to prevent loopback socket failures on restricted environments/containers.
- [x] Standardize AI performance endpoint routing (`@PostMapping({"/analyse-performance/{goalId}", "/analyze-performance/{goalId}"})`).

### Phase 17: Multi-Tenant Session Security & Navigation Polish
- [x] Synchronize all authentication headers (`Authorization: Bearer <token>`) across `ResumeAnalyzerPage.tsx` and `InterviewSimulatorPage.tsx` for multi-tenant security.
- [x] Add route alias `<Route path="/create-goal" element={<CreateGoalPage />} />` in `frontend/src/App.tsx`.
- [x] Standardize bridge redirects to `/goals/new`.
- [x] Add unit test suite `ResumeServiceTest.java` (4/4 passing).
- [x] Verify backend compilation and packaging (`BUILD SUCCESS` in 8.7s) and frontend production build (`tsc && vite build` in 6.9s).

---

## Milestone 4: Multi-Tenant Dashboard Partitioning & System-Wide Theme Switcher

### Phase 18: Multi-Tenant Dashboard Isolation
- [x] Partition mock & fallback storage per username in `frontend/src/services/api.ts` (`goalmind_local_goals_${currentUsername}`).
- [x] Dynamically compute dashboard analytics (`/analytics/dashboard`) strictly from the logged-in user's goals.
- [x] Eliminate hardcoded `id: 1` in `AuthContext.tsx` by deriving deterministic numeric user IDs via `generateFallbackUserId(username)`.
- [x] Clear `goalmind_bridge_payload` and session state cleanly upon logout.
- [x] Bind `DashboardPage.tsx` fetching to `[user?.id, user?.username]` so switching user accounts immediately wipes old state and loads that user's personalized dashboard.
- [x] Add personalized welcome greeting (`Welcome back, {name}!`) and clear empty onboarding states for accounts with 0 goals.

### Phase 19: Comprehensive 3-Mode Theme Switcher
- [x] Add 3-button segmented Theme Quick Switcher in `frontend/src/components/layout/Sidebar.tsx` (`[ ☀️ Light | 🌙 Dark | 💻 Auto ]`).
- [x] Enhance theme toggle in `frontend/src/components/layout/Navbar.tsx` with active mode indicator and cycling support.
- [x] Upgrade Appearance section in `frontend/src/pages/SettingsPage.tsx` to a visual 3-card theme picker with instant reactivity.
- [x] Verify frontend production build (`npm run build` -> 0 errors).
- [x] Synchronize both repositories (`GoalMind-AI` and subfolder `GOALMIND-AI`).
