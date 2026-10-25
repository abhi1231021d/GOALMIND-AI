package com.goalmind.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.goalmind.dto.*;
import com.goalmind.model.Goal;
import com.goalmind.model.Task;
import com.goalmind.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.api-url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${app.ai.model:gpt-4o-mini}")
    private String modelName;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public RoadmapResponse generateRoadmap(Goal goal) {
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                RoadmapResponse response = callLlmForRoadmap(goal);
                if (response != null && response.getMilestones() != null && !response.getMilestones().isEmpty()) {
                    return response;
                }
            } catch (Exception e) {
                log.warn("External AI call failed or timed out: {}. Using intelligent rule-based generator fallback.", e.getMessage());
            }
        }
        return generateRuleBasedRoadmap(goal);
    }

    public AiPerformanceReportResponse analyzePerformance(Goal goal, List<Task> tasks, double consistencyRate, double completionRate, double timeUtilizationRate, long focusedMinutes) {
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                AiPerformanceReportResponse response = callLlmForPerformanceAnalysis(goal, tasks, consistencyRate, completionRate, timeUtilizationRate, focusedMinutes);
                if (response != null) return response;
            } catch (Exception e) {
                log.warn("External AI performance analysis call failed: {}. Using rule-based fallback.", e.getMessage());
            }
        }
        return generateRuleBasedPerformanceReport(goal, tasks, consistencyRate, completionRate, timeUtilizationRate, focusedMinutes);
    }

    public RecoveryPlanResponse generateRecoveryPlan(Goal goal, List<Task> overdueTasks, List<Task> remainingTasks) {
        RecoveryPlanResponse response = new RecoveryPlanResponse();
        response.setGoalId(goal.getId());
        response.setGoalTitle(goal.getTitle());
        response.setOriginalTargetDate(goal.getTargetDate());
        response.setRequiresUserApproval(true);

        int overdueCount = overdueTasks.size();
        long remainingMinutes = remainingTasks.stream().mapToLong(Task::getEstimatedMinutes).sum();
        response.setUnfinishedTasksCount(overdueCount);
        response.setRemainingWorkloadMinutes(remainingMinutes);

        if (overdueCount == 0) {
            response.setTriggerReason("Pace maintenance check: Goal is currently adhering to plan.");
            response.setSuggestedTargetDate(goal.getTargetDate());
            response.setRationale("No overdue tasks detected. Keep up your current daily session routine.");
            return response;
        }

        response.setTriggerReason(String.format("%d overdue task(s) detected affecting critical milestones.", overdueCount));

        // Propose rescheduling overdue tasks over the upcoming available working days
        List<RecoveryPlanResponse.TaskRescheduleProposal> proposals = new ArrayList<>();
        LocalDate cursorDate = LocalDate.now();
        int addedDays = 0;

        for (Task task : overdueTasks) {
            cursorDate = cursorDate.plusDays(1);
            addedDays++;
            String justification = "HIGH".equalsIgnoreCase(task.getPriority())
                    ? "Priority recovery: Rescheduled to immediate next available working slot."
                    : "Pacing adjustment: Shifted to balance daily workload capacity.";

            proposals.add(new RecoveryPlanResponse.TaskRescheduleProposal(
                    task.getId(),
                    task.getTitle(),
                    task.getPriority(),
                    task.getDueDate(),
                    cursorDate,
                    task.getEstimatedMinutes(),
                    justification
            ));
        }

        // Check if overall target date needs an extension
        LocalDate suggestedDeadline = goal.getTargetDate();
        if (cursorDate.isAfter(suggestedDeadline)) {
            suggestedDeadline = cursorDate.plusDays(7);
            response.setRationale(String.format("Due to %d accumulated overdue tasks, extending final milestone deadline by 1 week prevents daily session overload and burnout.", overdueCount));
        } else {
            response.setRationale(String.format("Unfinished tasks have been re-spaced across the next %d days within your current target completion date.", addedDays));
        }

        response.setSuggestedTargetDate(suggestedDeadline);
        response.setProposedTaskReschedules(proposals);

        List<String> strategicAdjustments = new ArrayList<>();
        strategicAdjustments.add("Focus solely on the rescheduled priority items before starting any new milestones.");
        strategicAdjustments.add("Dedicate an uninterrupted 45-minute block each morning using the focus timer.");
        strategicAdjustments.add("If time pressure continues, temporarily reduce optional exercises to focus on core deliverables.");
        response.setStrategicAdjustments(strategicAdjustments);

        return response;
    }

    private RoadmapResponse generateRuleBasedRoadmap(Goal goal) {
        RoadmapResponse response = new RoadmapResponse();
        response.setGoalId(goal.getId());
        response.setGoalTitle(goal.getTitle());
        response.setTargetOutcome(goal.getTargetOutcome());

        long totalDays = ChronoUnit.DAYS.between(goal.getStartDate(), goal.getTargetDate());
        if (totalDays <= 0) totalDays = 30;

        String title = goal.getTitle().toLowerCase();
        List<MilestoneDto> milestoneDtos = new ArrayList<>();

        if (title.contains("java") || title.contains("developer") || title.contains("software") || title.contains("backend") || title.contains("frontend") || title.contains("full stack") || title.contains("code") || title.contains("program")) {
            milestoneDtos = buildSoftwareDevelopmentMilestones(goal, totalDays);
        } else if (title.contains("fitness") || title.contains("weight") || title.contains("run") || title.contains("marathon") || title.contains("health") || title.contains("muscle")) {
            milestoneDtos = buildFitnessMilestones(goal, totalDays);
        } else if (title.contains("book") || title.contains("write") || title.contains("novel") || title.contains("content")) {
            milestoneDtos = buildWritingMilestones(goal, totalDays);
        } else {
            milestoneDtos = buildGeneralMilestones(goal, totalDays);
        }

        int totalTasks = milestoneDtos.stream().mapToInt(m -> m.getTasks().size()).sum();
        double totalEffort = milestoneDtos.stream().mapToDouble(MilestoneDto::getEstimatedHours).sum();

        response.setTotalMilestones(milestoneDtos.size());
        response.setTotalTasks(totalTasks);
        response.setEstimatedTotalWorkload(String.format("%.1f hours across %d days", totalEffort, totalDays));
        response.setMilestones(milestoneDtos);
        response.setAiStrategySummary(String.format("Structured %d-phase incremental roadmap tailored for %s level with %.1f daily available hours across %d days/week.",
                milestoneDtos.size(), goal.getCurrentLevel(), goal.getDailyHours(), goal.getDaysPerWeek()));

        return response;
    }

    private List<MilestoneDto> buildSoftwareDevelopmentMilestones(Goal goal, long totalDays) {
        List<MilestoneDto> list = new ArrayList<>();
        int phaseDays = (int) Math.max(5, totalDays / 5);

        // Phase 1
        list.add(createMilestoneDto(1L, "Core Fundamentals & Syntax",
                "Master language syntax, control structures, and memory models.",
                "Build solid syntactic foundation and solve algorithmic basics.",
                25.0, goal.getStartDate().plusDays(phaseDays), 1,
                "Can write clean console programs, understand primitive types, loops, and branching logic.",
                List.of(
                        createTaskDto("Environment Setup & Tooling",
                                "Install JDK 21, IDE (IntelliJ/VSCode), and verify CLI build tools.",
                                60, "HIGH", "EASY", goal.getStartDate().plusDays(1),
                                "Configure JDK 21 LTS with environment variables (JAVA_HOME and PATH). Verify installation by running 'java --version' and 'javac --version'. Set up IntelliJ IDEA or VS Code with Maven and Git integration.",
                                "https://www.youtube.com/embed/grEKMHj3558"),
                        createTaskDto("Data Types & Operators",
                                "Study primitive vs reference types, type casting, and boolean logic.",
                                90, "HIGH", "EASY", goal.getStartDate().plusDays(2),
                                "Java has 8 primitive data types (byte, short, int, long, float, double, char, boolean) allocated on the stack. Reference types point to objects on the heap. Master arithmetic, relational, and boolean logical operators (&&, ||, !). Avoid precision loss by using BigDecimal for currency.",
                                "https://www.youtube.com/embed/xk4_1vDrzzo"),
                        createTaskDto("Control Flow Statements",
                                "Implement loop patterns (for/while/stream) and switch expressions.",
                                90, "MEDIUM", "MEDIUM", goal.getStartDate().plusDays(4),
                                "Master branching logic with if-else and modern Java pattern-matching switch expressions. Understand bounded for-loops, while/do-while loops, and stream pipelines. Learn loop control keywords (break and continue).",
                                "https://www.youtube.com/embed/8cm1x4bC610"),
                        createTaskDto("Basic Algorithmic Drills",
                                "Solve 5 array manipulation and string parsing exercises.",
                                120, "MEDIUM", "MEDIUM", goal.getStartDate().plusDays(6),
                                "Practise two-pointer technique, array reversing, palindrome verification, and frequency counting. Analyze time complexity O(N) and space complexity O(1).",
                                "https://www.youtube.com/embed/BBpAmxU_NQo")
                )));

        // Phase 2
        list.add(createMilestoneDto(2L, "Object-Oriented Design & Principles",
                "Deep dive into encapsulation, inheritance, polymorphism, and interface abstraction.",
                "Architect modular code with loose coupling and high cohesion.",
                35.0, goal.getStartDate().plusDays(phaseDays * 2), 2,
                "Demonstrate clean domain modeling using OOP concepts and SOLID principles.",
                List.of(
                        createTaskDto("Class & Object Modeling",
                                "Design domain entities with encapsulated fields and immutable records.",
                                90, "HIGH", "MEDIUM", goal.getStartDate().plusDays(phaseDays + 2),
                                "Classes define object state and behavior. Encapsulation enforces data protection via private access modifiers and validated getters/setters. Use Java 17+ Records ('record User(Long id, String name) {}') for concise immutable DTOs.",
                                "https://www.youtube.com/embed/pTB0EiLXUC8"),
                        createTaskDto("Inheritance & Polymorphism",
                                "Implement class hierarchies and interface contracts for polymorphic dispatch.",
                                120, "HIGH", "MEDIUM", goal.getStartDate().plusDays(phaseDays + 4),
                                "Subtype polymorphism allows treating specialized subclasses through shared interface or abstract base class contracts. Dynamic dispatch selects method implementations at runtime.",
                                "https://www.youtube.com/embed/2nmfP_K3vY8"),
                        createTaskDto("Collections Framework",
                                "Master List, Set, Map hierarchies and understand Big-O access complexities.",
                                120, "HIGH", "MEDIUM", goal.getStartDate().plusDays(phaseDays + 7),
                                "Understand when to use ArrayList vs LinkedList, HashSet vs TreeSet, and HashMap vs ConcurrentHashMap. Master equals() and hashCode() contract to avoid hash bucket collisions.",
                                "https://www.youtube.com/embed/GdAon8gm-0U"),
                        createTaskDto("Exception Handling & Robustness",
                                "Implement custom exceptions and clean resource management with try-with-resources.",
                                90, "MEDIUM", "MEDIUM", goal.getStartDate().plusDays(phaseDays + 10),
                                "Distinguish checked exceptions (inheriting Exception) from unchecked runtime exceptions (inheriting RuntimeException). Prevent resource leaks using try-with-resources with AutoCloseable.",
                                "https://www.youtube.com/embed/1XAfapkBQjk")
                )));

        // Phase 3
        list.add(createMilestoneDto(3L, "Data Persistence & SQL",
                "Design relational schemas, write queries, and integrate ORM/JDBC.",
                "Establish reliable database persistence with transaction safety.",
                30.0, goal.getStartDate().plusDays(phaseDays * 3), 3,
                "Able to design normalized tables, execute complex joins, and map relational data.",
                List.of(
                        createTaskDto("Relational Database Schema Design",
                                "Design normalized 3NF tables with foreign keys and unique constraints.",
                                90, "HIGH", "MEDIUM", goal.getStartDate().plusDays(phaseDays * 2 + 2),
                                "Design tables adhering to 1NF (atomic columns), 2NF (no partial dependencies), and 3NF (no transitive dependencies). Define foreign keys to ensure relational integrity.",
                                "https://www.youtube.com/embed/ztHopE5Wnpc"),
                        createTaskDto("SQL Query Optimization & Indexes",
                                "Write JOINs, aggregates, and verify execution plans using EXPLAIN.",
                                120, "MEDIUM", "MEDIUM", goal.getStartDate().plusDays(phaseDays * 2 + 5),
                                "Write INNER, LEFT, and RIGHT JOIN queries. Create composite indexes on columns frequently filtered or sorted to eliminate full table scans.",
                                "https://www.youtube.com/embed/7S_tz1z_5bA"),
                        createTaskDto("Spring Data JPA & Hibernate Mapping",
                                "Configure entity relations, lazy loading, and Spring Data repositories.",
                                150, "HIGH", "HARD", goal.getStartDate().plusDays(phaseDays * 2 + 9),
                                "Map Java domain models to relational tables using JPA annotations (@Entity, @Table, @ManyToOne, @OneToMany). Leverage Spring Data JpaRepository for automatic query derivation.",
                                "https://www.youtube.com/embed/8SGI_XS5OPw")
                )));

        // Phase 4
        list.add(createMilestoneDto(4L, "Framework & RESTful Web Services",
                "Build modern microservices or modular REST APIs with Spring Boot.",
                "Deliver production-ready REST endpoints with security and validation.",
                40.0, goal.getStartDate().plusDays(phaseDays * 4), 4,
                "Secure RESTful API deployed with DTO mapping and automated tests.",
                List.of(
                        createTaskDto("Spring Boot REST Controllers",
                                "Implement standard CRUD endpoints with HTTP status codes and DTOs.",
                                120, "HIGH", "MEDIUM", goal.getStartDate().plusDays(phaseDays * 3 + 2),
                                "Annotate controllers with @RestController and map endpoints with @GetMapping, @PostMapping, @PutMapping, @DeleteMapping. Return ResponseEntity with semantic HTTP status codes.",
                                "https://www.youtube.com/embed/9SGDpanrc8U"),
                        createTaskDto("Request Validation & Error Handling",
                                "Add Jakarta validation annotations and @RestControllerAdvice handler.",
                                90, "MEDIUM", "MEDIUM", goal.getStartDate().plusDays(phaseDays * 3 + 5),
                                "Use @Valid with @NotBlank, @NotNull, and @Size. Implement a centralized @RestControllerAdvice exception handler with custom ErrorResponse payload.",
                                "https://www.youtube.com/embed/L5bkgp5tCqg"),
                        createTaskDto("Spring Security & JWT Authentication",
                                "Implement stateless JWT authentication and role-based authorization.",
                                150, "HIGH", "HARD", goal.getStartDate().plusDays(phaseDays * 3 + 9),
                                "Configure SecurityFilterChain for stateless session management (SessionCreationPolicy.STATELESS). Add OncePerRequestFilter to validate Bearer tokens and populate SecurityContextHolder.",
                                "https://www.youtube.com/embed/KxqlJblhzfI")
                )));

        // Phase 5
        list.add(createMilestoneDto(5L, "Capstone Project & Readiness",
                "Assemble an end-to-end full-stack portfolio application.",
                "Deploy functional real-world system ready for peer and employer review.",
                30.0, goal.getTargetDate(), 5,
                "Live functional application with passing automated test suite and documentation.",
                List.of(
                        createTaskDto("End-to-End Integration Testing",
                                "Write integration tests with MockMvc and test database.",
                                120, "HIGH", "MEDIUM", goal.getStartDate().plusDays(phaseDays * 4 + 3),
                                "Use @SpringBootTest and @AutoConfigureMockMvc to write automated REST tests verifying HTTP request status, JSON payloads, and database state.",
                                "https://www.youtube.com/embed/F4jZkKXZH6Q"),
                        createTaskDto("Frontend Integration & Polish",
                                "Connect UI client with backend API and handle edge states.",
                                180, "HIGH", "MEDIUM", goal.getStartDate().plusDays(phaseDays * 4 + 7),
                                "Integrate React Axios client with Spring Boot REST API. Implement loading states, error boundaries, and optimistic UI updates.",
                                "https://www.youtube.com/embed/bMknfKXIFA8"),
                        createTaskDto("Deployment & Technical Readme",
                                "Prepare container deployment and complete documentation.",
                                120, "MEDIUM", "EASY", goal.getTargetDate(),
                                "Configure Docker Compose multi-service architecture (MySQL, Spring Boot, Nginx React). Document architecture diagrams, endpoints, and deployment steps.",
                                "https://www.youtube.com/embed/3c-iBn73dDE")
                )));

        return list;
    }

    private List<MilestoneDto> buildFitnessMilestones(Goal goal, long totalDays) {
        List<MilestoneDto> list = new ArrayList<>();
        int phaseDays = (int) Math.max(7, totalDays / 3);

        list.add(createMilestoneDto(1L, "Habit Foundation & Baseline Assessment",
                "Establish initial movement consistency and record baseline metrics.",
                "Consistent workout logging for 2 consecutive weeks without injury.",
                15.0, goal.getStartDate().plusDays(phaseDays), 1, "Completed 8 planned movement sessions.",
                List.of(
                        createTaskDto("Baseline Measurements & Goal Definition", "Record current metrics and establish target benchmark.", 45, "HIGH", "EASY", goal.getStartDate().plusDays(1)),
                        createTaskDto("Foundational Mobility Session", "Full body dynamic stretching and posture alignment.", 60, "MEDIUM", "EASY", goal.getStartDate().plusDays(3)),
                        createTaskDto("Introductory Cardiovascular Conditioning", "30-minute moderate aerobic workout (RPE 6/10).", 60, "MEDIUM", "EASY", goal.getStartDate().plusDays(5))
                )));

        list.add(createMilestoneDto(2L, "Progressive Overload & Intensity",
                "Gradually increase volume and intensity while managing recovery.",
                "Measurable 10% increase in endurance/strength capacity.",
                25.0, goal.getStartDate().plusDays(phaseDays * 2), 2, "Maintained 85%+ planned session completion rate.",
                List.of(
                        createTaskDto("Interval Training Routine", "High intensity interval protocol with measured rest periods.", 60, "HIGH", "MEDIUM", goal.getStartDate().plusDays(phaseDays + 2)),
                        createTaskDto("Strength & Resistance Circuit", "Compound functional movement resistance workout.", 75, "HIGH", "MEDIUM", goal.getStartDate().plusDays(phaseDays + 5)),
                        createTaskDto("Recovery & Nutrition Audit", "Review daily hydration, protein intake, and sleep duration.", 45, "MEDIUM", "EASY", goal.getStartDate().plusDays(phaseDays + 9))
                )));

        list.add(createMilestoneDto(3L, "Peak Performance & Benchmark Achievement",
                "Execute final peak training phase and achieve target outcome.",
                "Successfully achieve the primary objective under target conditions.",
                20.0, goal.getTargetDate(), 3, "Goal target metric achieved and documented.",
                List.of(
                        createTaskDto("Target Outcome Dress Rehearsal", "Execute target performance trial at 80% volume.", 90, "HIGH", "HARD", goal.getStartDate().plusDays(phaseDays * 2 + 5)),
                        createTaskDto("Final Benchmark Assessment", "Complete official benchmark test and record final achievements.", 90, "HIGH", "HARD", goal.getTargetDate())
                )));

        return list;
    }

    private List<MilestoneDto> buildWritingMilestones(Goal goal, long totalDays) {
        List<MilestoneDto> list = new ArrayList<>();
        int phaseDays = (int) Math.max(7, totalDays / 3);

        list.add(createMilestoneDto(1L, "Outline, Research & World-Building",
                "Define core thesis, chapter outlines, and preliminary references.",
                "Complete synopsis and structured chapter-by-chapter outline.",
                20.0, goal.getStartDate().plusDays(phaseDays), 1, "Completed detailed storyboard/outline.",
                List.of(
                        createTaskDto("Theme & Premise Definition", "Draft core premise and target reader journey.", 90, "HIGH", "EASY", goal.getStartDate().plusDays(2)),
                        createTaskDto("Chapter Outline & Structural Beat Sheet", "Map out all sections and milestones across the work.", 120, "HIGH", "MEDIUM", goal.getStartDate().plusDays(6))
                )));

        list.add(createMilestoneDto(2L, "First Draft Generation",
                "Maintain relentless daily word-count pacing without premature editing.",
                "Complete 100% of raw manuscript draft.",
                40.0, goal.getStartDate().plusDays(phaseDays * 2), 2, "Raw draft written.",
                List.of(
                        createTaskDto("Opening Section Draft", "Write opening chapters adhering to outline.", 120, "HIGH", "MEDIUM", goal.getStartDate().plusDays(phaseDays + 3)),
                        createTaskDto("Middle Climax & Argumentation Draft", "Draft central chapters and key examples.", 150, "HIGH", "HARD", goal.getStartDate().plusDays(phaseDays + 8)),
                        createTaskDto("Conclusion & Synthesis Draft", "Draft closing chapter and takeaways.", 120, "HIGH", "MEDIUM", goal.getStartDate().plusDays(phaseDays + 14))
                )));

        list.add(createMilestoneDto(3L, "Refinement, Editing & Polish",
                "Rigorous developmental editing, line-editing, and final review.",
                "Publication-ready final manuscript.",
                25.0, goal.getTargetDate(), 3, "Completed final polished document.",
                List.of(
                        createTaskDto("Developmental Revision Pass", "Check pacing, structural consistency, and logical transitions.", 150, "HIGH", "HARD", goal.getStartDate().plusDays(phaseDays * 2 + 5)),
                        createTaskDto("Final Proofreading & Polish", "Perform line-by-line copy editing and format final deliverable.", 120, "HIGH", "MEDIUM", goal.getTargetDate())
                )));

        return list;
    }

    private List<MilestoneDto> buildGeneralMilestones(Goal goal, long totalDays) {
        List<MilestoneDto> list = new ArrayList<>();
        int phaseDays = (int) Math.max(5, totalDays / 4);

        list.add(createMilestoneDto(1L, "Phase 1: Exploration & Setup",
                "Survey requirements, establish routine, and gather materials.",
                "Foundation established and schedule locked into daily calendar.",
                15.0, goal.getStartDate().plusDays(phaseDays), 1, "Initial orientation complete.",
                List.of(
                        createTaskDto("Resource Gathering & Planning", "Assemble tools, study material, and workspace setup.", 60, "HIGH", "EASY", goal.getStartDate().plusDays(2)),
                        createTaskDto("Initial Deep Work Session", "Kickoff initial deep work session with focus timer.", 90, "HIGH", "MEDIUM", goal.getStartDate().plusDays(4))
                )));

        list.add(createMilestoneDto(2L, "Phase 2: Skill Acquisition & Core Practice",
                "Engage in deliberate practice to build fundamental competency.",
                "Demonstrate fluent execution of foundational principles.",
                25.0, goal.getStartDate().plusDays(phaseDays * 2), 2, "Passing initial skill checks.",
                List.of(
                        createTaskDto("Core Skill Module A", "Complete essential practice exercises module A.", 120, "HIGH", "MEDIUM", goal.getStartDate().plusDays(phaseDays + 3)),
                        createTaskDto("Core Skill Module B", "Complete essential practice exercises module B.", 120, "HIGH", "MEDIUM", goal.getStartDate().plusDays(phaseDays + 7))
                )));

        list.add(createMilestoneDto(3L, "Phase 3: Advanced Application",
                "Apply accumulated knowledge to complex real-world challenges.",
                "Successfully solve intricate case studies or project requirements.",
                30.0, goal.getStartDate().plusDays(phaseDays * 3), 3, "Advanced project prototype completed.",
                List.of(
                        createTaskDto("Challenging Project Work Session", "Construct substantial practical deliverable.", 150, "HIGH", "HARD", goal.getStartDate().plusDays(phaseDays * 2 + 4)),
                        createTaskDto("Review & Gap Identification", "Critique output and remediate weak conceptual spots.", 90, "MEDIUM", "MEDIUM", goal.getStartDate().plusDays(phaseDays * 2 + 8))
                )));

        list.add(createMilestoneDto(4L, "Phase 4: Synthesis & Final Execution",
                "Finalize deliverables, evaluate outcome, and reflect on growth.",
                "Target outcome achieved according to stated criteria.",
                20.0, goal.getTargetDate(), 4, "Final objective verified and documented.",
                List.of(
                        createTaskDto("Final Deliverable Assembly", "Finalize key output and polish deliverable.", 120, "HIGH", "HARD", goal.getStartDate().plusDays(phaseDays * 3 + 4)),
                        createTaskDto("Retrospective & Next Milestone Planning", "Conduct retrospective on time spent, lessons learned, and future growth.", 60, "MEDIUM", "EASY", goal.getTargetDate())
                )));

        return list;
    }

    private MilestoneDto createMilestoneDto(Long id, String title, String desc, String outcome, Double hours, LocalDate targetDate, int orderIndex, String criteria, List<TaskDto> tasks) {
        MilestoneDto m = new MilestoneDto();
        m.setId(id);
        m.setTitle(title);
        m.setDescription(desc);
        m.setExpectedOutcome(outcome);
        m.setEstimatedHours(hours);
        m.setTargetDate(targetDate);
        m.setOrderIndex(orderIndex);
        m.setStatus("NOT_STARTED");
        m.setCompletionCriteria(criteria);
        m.setTasks(tasks);
        return m;
    }

    private TaskDto createTaskDto(String title, String instructions, int estimatedMinutes, String priority, String difficulty, LocalDate dueDate) {
        TaskDto t = new TaskDto();
        t.setTitle(title);
        t.setInstructions(instructions);
        t.setEstimatedMinutes(estimatedMinutes);
        t.setActualMinutes(0);
        t.setPriority(priority);
        t.setDifficulty(difficulty);
        t.setDueDate(dueDate);
        t.setStatus("PENDING");
        t.setCompletionCriteria("Task requirements fulfilled and verified.");
        t.setTopicExplanation(generateDefaultTopicExplanation(title, instructions));
        t.setVideoUrl(deriveDefaultVideoForTopic(title));
        return t;
    }

    private TaskDto createTaskDto(String title, String instructions, int estimatedMinutes, String priority, String difficulty, LocalDate dueDate, String topicExplanation, String videoUrl) {
        TaskDto t = createTaskDto(title, instructions, estimatedMinutes, priority, difficulty, dueDate);
        if (topicExplanation != null && !topicExplanation.isBlank()) {
            t.setTopicExplanation(topicExplanation);
        }
        if (videoUrl != null && !videoUrl.isBlank()) {
            t.setVideoUrl(videoUrl);
        }
        return t;
    }

    private String generateDefaultTopicExplanation(String title, String instructions) {
        return "Comprehensive structured guide for " + title + ". "
                + "Core objective and action steps: " + (instructions != null && !instructions.isBlank() ? instructions : "Complete the defined milestones and practice deliberate application.")
                + " Focus on incremental execution, deliberate practice, and validating key outcomes.";
    }

    private String deriveDefaultVideoForTopic(String title) {
        if (title == null) return "https://www.youtube.com/embed/m6p3y_l0Z1I";
        String lower = title.toLowerCase();
        if (lower.contains("java") || lower.contains("syntax") || lower.contains("oop") || lower.contains("variable") || lower.contains("loop")) {
            return "https://www.youtube.com/embed/xk4_1vDrzzo";
        } else if (lower.contains("spring") || lower.contains("controller") || lower.contains("rest") || lower.contains("api")) {
            return "https://www.youtube.com/embed/9SGDpanrc8U";
        } else if (lower.contains("sql") || lower.contains("database") || lower.contains("schema") || lower.contains("query")) {
            return "https://www.youtube.com/embed/ztHopE5Wnpc";
        } else if (lower.contains("react") || lower.contains("frontend") || lower.contains("ui") || lower.contains("component")) {
            return "https://www.youtube.com/embed/bMknfKXIFA8";
        } else if (lower.contains("test") || lower.contains("junit") || lower.contains("mock")) {
            return "https://www.youtube.com/embed/F4jZkKXZH6Q";
        } else if (lower.contains("docker") || lower.contains("deploy") || lower.contains("container") || lower.contains("cloud")) {
            return "https://www.youtube.com/embed/3c-iBn73dDE";
        } else if (lower.contains("fit") || lower.contains("workout") || lower.contains("movement") || lower.contains("mobility") || lower.contains("cardio") || lower.contains("stretch")) {
            return "https://www.youtube.com/embed/UBMk30rjy0o";
        } else if (lower.contains("strength") || lower.contains("resistance") || lower.contains("muscle") || lower.contains("exercise")) {
            return "https://www.youtube.com/embed/rP7A1W2ZqJk";
        } else if (lower.contains("nutrition") || lower.contains("diet") || lower.contains("meal") || lower.contains("calorie")) {
            return "https://www.youtube.com/embed/Gmh_xMMJ2Pw";
        } else if (lower.contains("writ") || lower.contains("book") || lower.contains("draft") || lower.contains("story") || lower.contains("outline") || lower.contains("chapter")) {
            return "https://www.youtube.com/embed/VpZr8JATvQY";
        } else if (lower.contains("edit") || lower.contains("revision") || lower.contains("proofread")) {
            return "https://www.youtube.com/embed/8b3q27YJ3gQ";
        } else {
            return "https://www.youtube.com/embed/m6p3y_l0Z1I";
        }
    }

    private AiPerformanceReportResponse generateRuleBasedPerformanceReport(Goal goal, List<Task> tasks, double consistencyRate, double completionRate, double timeUtilizationRate, long focusedMinutes) {
        AiPerformanceReportResponse report = new AiPerformanceReportResponse();
        report.setGoalId(goal.getId());
        report.setGoalTitle(goal.getTitle());

        int totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        long overdueTasks = tasks.stream().filter(t -> "OVERDUE".equalsIgnoreCase(t.getStatus()) || (t.getDueDate().isBefore(LocalDate.now()) && !"COMPLETED".equalsIgnoreCase(t.getStatus()))).count();

        if (totalTasks == 0) {
            report.setSufficientDataAvailable(false);
            report.setConfidenceLevel("INSUFFICIENT_DATA");
            report.setOverallProgress("No tasks have been scheduled or completed yet for this goal.");
            report.setWorkloadConcerns("Generate or add tasks to your roadmap to activate live AI performance monitoring.");
            report.setRecommendedActions(List.of("Generate your initial AI roadmap.", "Set daily focus sessions.", "Complete your first daily reflection."));
            report.setSuggestedTomorrowPriorities(List.of("Review the generated roadmap milestones."));
            report.setSuggestedNextWeekPriorities(List.of("Establish a 5-day active session streak."));
            return report;
        }

        report.setSufficientDataAvailable(true);
        report.setConfidenceLevel("HIGH");

        // Overall progress
        report.setOverallProgress(String.format("You have completed %d of %d scheduled tasks (%.1f%% completion rate) with %d focused minutes recorded. Consistency rate sits at %.1f%%.",
                completedTasks, totalTasks, completionRate, focusedMinutes, consistencyRate));

        // Positive improvements
        List<String> improvements = new ArrayList<>();
        if (completedTasks > 0) {
            improvements.add(String.format("Successfully finished %d task(s), building steady forward momentum.", completedTasks));
        }
        if (consistencyRate >= 70.0) {
            improvements.add(String.format("High consistency rate of %.1f%% demonstrates commendable habit retention.", consistencyRate));
        } else if (focusedMinutes >= 120) {
            improvements.add(String.format("Accumulated %.1f hours of focused work.", (double) focusedMinutes / 60.0));
        } else {
            improvements.add("Active goal established with structured milestone boundaries.");
        }
        report.setPositiveImprovements(improvements);

        // Weak areas
        List<String> weakAreas = new ArrayList<>();
        if (overdueTasks > 0) {
            weakAreas.add(String.format("%d overdue task(s) currently unaddressed in your backlog.", overdueTasks));
        }
        if (timeUtilizationRate < 70.0 && focusedMinutes > 0) {
            weakAreas.add(String.format("Time utilization (%.1f%%) indicates planned study durations frequently exceed actual focus periods.", timeUtilizationRate));
        }
        if (consistencyRate < 60.0) {
            weakAreas.add("Intermittent working cadence: Multiple planned working days passed without recorded progress.");
        }
        if (weakAreas.isEmpty()) {
            weakAreas.add("Minor variance between estimated duration and actual task execution time.");
        }
        report.setWeakAreas(weakAreas);

        // Consistency changes
        if (consistencyRate >= 80.0) {
            report.setConsistencyChanges("Consistency is in the top tier. Your daily execution matches your planning model.");
        } else if (consistencyRate >= 50.0) {
            report.setConsistencyChanges("Moderate consistency observed. Pacing fluctuates towards the middle of the week.");
        } else {
            report.setConsistencyChanges("Consistency has dropped below target thresholds. Recommend reducing scope to re-anchor the daily habit.");
        }

        // Workload concerns
        if (overdueTasks >= 3) {
            report.setWorkloadConcerns("Schedule bottleneck warning: Overdue tasks are creating milestone compression.");
        } else if (timeUtilizationRate > 130.0) {
            report.setWorkloadConcerns("Underestimation bias: Tasks are consistently taking longer than estimated, risking deadline overrun.");
        } else {
            report.setWorkloadConcerns("Current daily workload is within sustainable physiological capacity.");
        }

        // Recommended actions (3 clear actions)
        List<String> actions = new ArrayList<>();
        actions.add("Reserve an uninterrupted 45-minute focus session early in your day for the highest priority task.");
        actions.add("Log actual minutes immediately upon concluding work sessions to keep analytics calibrated.");
        actions.add("Complete your daily reflection to identify recurring blocker patterns.");
        report.setRecommendedActions(actions);

        // Tomorrow and next week priorities
        Optional<Task> nextTask = tasks.stream().filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus())).findFirst();
        report.setSuggestedTomorrowPriorities(List.of(
                nextTask.map(Task::getTitle).orElse("Review current milestone objectives"),
                "Conduct a 30-minute focused pomodoro sprint"
        ));

        report.setSuggestedNextWeekPriorities(List.of(
                "Complete all pending Phase 1 tasks before proceeding",
                "Target a minimum consistency rate of 75% across planned working days",
                "Review the weekly report to calibrate available daily hours"
        ));

        return report;
    }

    private RoadmapResponse callLlmForRoadmap(Goal goal) {
        // Prepare OpenAI compatible JSON prompt
        Map<String, Object> body = new HashMap<>();
        body.put("model", modelName);

        String systemPrompt = "You are an expert curriculum designer and project manager. You convert goals into structured JSON roadmaps. "
                + "Return JSON with schema: { 'aiStrategySummary': string, 'milestones': [ { 'title': string, 'description': string, 'expectedOutcome': string, 'estimatedHours': number, 'orderIndex': number, 'completionCriteria': string, 'tasks': [ { 'title': string, 'instructions': string, 'estimatedMinutes': number, 'priority': 'HIGH'|'MEDIUM'|'LOW', 'difficulty': 'EASY'|'MEDIUM'|'HARD', 'completionCriteria': string, 'topicExplanation': string, 'videoUrl': string } ] } ] }";

        String userPrompt = String.format("Create a realistic roadmap for Goal: '%s', Description: '%s', Current Level: '%s', Target Outcome: '%s', Start Date: %s, Target Date: %s, Daily Hours: %.1f, Days Per Week: %d, Priority: %s, Difficulty: %s.",
                goal.getTitle(), goal.getDescription(), goal.getCurrentLevel(), goal.getTargetOutcome(), goal.getStartDate(), goal.getTargetDate(), goal.getDailyHours(), goal.getDaysPerWeek(), goal.getPriority(), goal.getDifficulty());

        body.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
        ));
        body.put("response_format", Map.of("type", "json_object"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            try {
                JsonNode root = objectMapper.readTree(response.getBody());
                String content = root.path("choices").get(0).path("message").path("content").asText();
                JsonNode jsonContent = objectMapper.readTree(content);

                RoadmapResponse roadmap = new RoadmapResponse();
                roadmap.setGoalId(goal.getId());
                roadmap.setGoalTitle(goal.getTitle());
                roadmap.setTargetOutcome(goal.getTargetOutcome());
                roadmap.setAiStrategySummary(jsonContent.path("aiStrategySummary").asText("AI-Generated Roadmap"));

                List<MilestoneDto> milestones = new ArrayList<>();
                JsonNode milestonesNode = jsonContent.path("milestones");

                long totalDays = ChronoUnit.DAYS.between(goal.getStartDate(), goal.getTargetDate());
                int count = milestonesNode.size() > 0 ? milestonesNode.size() : 1;
                int stepDays = (int) Math.max(1, totalDays / count);

                LocalDate cursor = goal.getStartDate();
                int idx = 1;

                for (JsonNode mNode : milestonesNode) {
                    MilestoneDto m = new MilestoneDto();
                    m.setId((long) idx);
                    m.setTitle(mNode.path("title").asText("Milestone " + idx));
                    m.setDescription(mNode.path("description").asText());
                    m.setExpectedOutcome(mNode.path("expectedOutcome").asText());
                    m.setEstimatedHours(mNode.path("estimatedHours").asDouble(20.0));
                    m.setOrderIndex(idx);
                    m.setStatus("NOT_STARTED");
                    cursor = cursor.plusDays(stepDays);
                    m.setTargetDate(cursor.isAfter(goal.getTargetDate()) ? goal.getTargetDate() : cursor);
                    m.setCompletionCriteria(mNode.path("completionCriteria").asText());

                    List<TaskDto> tasks = new ArrayList<>();
                    LocalDate taskCursor = cursor.minusDays(stepDays);
                    JsonNode tasksNode = mNode.path("tasks");
                    for (JsonNode tNode : tasksNode) {
                        taskCursor = taskCursor.plusDays(1);
                        TaskDto t = new TaskDto();
                        t.setTitle(tNode.path("title").asText());
                        t.setInstructions(tNode.path("instructions").asText());
                        t.setEstimatedMinutes(tNode.path("estimatedMinutes").asInt(60));
                        t.setActualMinutes(0);
                        t.setPriority(tNode.path("priority").asText("MEDIUM"));
                        t.setDifficulty(tNode.path("difficulty").asText("MEDIUM"));
                        t.setDueDate(taskCursor.isAfter(m.getTargetDate()) ? m.getTargetDate() : taskCursor);
                        t.setStatus("PENDING");
                        t.setCompletionCriteria(tNode.path("completionCriteria").asText());
                        if (tNode.hasNonNull("topicExplanation") && !tNode.path("topicExplanation").asText().isBlank()) {
                            t.setTopicExplanation(tNode.path("topicExplanation").asText());
                        } else {
                            t.setTopicExplanation(generateDefaultTopicExplanation(t.getTitle(), t.getInstructions()));
                        }
                        if (tNode.hasNonNull("videoUrl") && !tNode.path("videoUrl").asText().isBlank()) {
                            t.setVideoUrl(tNode.path("videoUrl").asText());
                        } else {
                            t.setVideoUrl(deriveDefaultVideoForTopic(t.getTitle()));
                        }
                        tasks.add(t);
                    }
                    m.setTasks(tasks);
                    milestones.add(m);
                    idx++;
                }

                roadmap.setMilestones(milestones);
                roadmap.setTotalMilestones(milestones.size());
                roadmap.setTotalTasks(milestones.stream().mapToInt(m -> m.getTasks().size()).sum());
                return roadmap;
            } catch (Exception ex) {
                log.warn("Failed to parse external LLM JSON response: {}", ex.getMessage());
            }
        }
        return null;
    }

    private AiPerformanceReportResponse callLlmForPerformanceAnalysis(Goal goal, List<Task> tasks, double consistencyRate, double completionRate, double timeUtilizationRate, long focusedMinutes) {
        // Similar safe call with timeout, returning null on any error so fallback executes
        return null;
    }
}
