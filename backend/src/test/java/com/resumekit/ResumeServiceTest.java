package com.resumekit;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ResumeServiceTest {

    private ResumeService resumeService;

    private static final String SAMPLE_RESUME = """
            Alex Mercer
            Senior Software Engineer | Bengaluru, India | alex.mercer@example.com | +91 9876543210
            linkedin.com/in/alexmercer | github.com/alexmercer

            SUMMARY
            Experienced Senior Full Stack Developer with 6+ years building microservices, cloud systems, and modern web apps.

            EXPERIENCE
            Senior Software Engineer | Tech Corp | 2022 - Present
            - Architected and delivered payment orchestration microservice using Java, Spring Boot, and PostgreSQL.
            - Handled 15,000 transactions per second with 99.99% uptime and reduced latency by 35%.
            - Mentored 5 junior engineers and led code review sessions.

            Software Developer | Cloud Systems | 2019 - 2022
            - Designed 12 RESTful microservices with Docker and Kubernetes.
            - Improved CI/CD deployment cycle times by 65% with GitHub Actions.

            EDUCATION
            Bachelor of Technology in Computer Science | University Institute | 2015 - 2019

            SKILLS
            Java, Python, TypeScript, React, Spring Boot, PostgreSQL, Redis, Docker, Kubernetes, AWS, Git
            """;

    @BeforeEach
    void setUp() {
        ObjectMapper mapper = new ObjectMapper();
        ProviderClient provider = new ProviderClient(mapper, "", "gpt-4o-mini", "https://api.openai.com/v1");
        ResumeTextAnalyzer analyzer = new ResumeTextAnalyzer();
        VacancyUrlService vacancies = new VacancyUrlService();
        DemoAnalysisService demo = new DemoAnalysisService(analyzer, vacancies);
        RequestGuard guard = new RequestGuard();
        AnalysisContractValidator contract = new AnalysisContractValidator();
        ResumeQualityRules qualityRules = new ResumeQualityRules();
        RtfDocumentService rtf = new RtfDocumentService();
        RewriteOrchestrator orchestrator = new RewriteOrchestrator(analyzer, qualityRules, rtf);
        ResumeDocumentService documents = new ResumeDocumentService(rtf, guard);
        SubmissionDocumentService submissionDocuments = new SubmissionDocumentService();
        ResumeExtractionService extraction = new ResumeExtractionService();

        resumeService = new ResumeService(provider, mapper, demo, guard, contract, orchestrator, documents, submissionDocuments, extraction);
    }

    @Test
    @DisplayName("ResumeValidator correctly accepts legitimate resumes with various formats")
    void testResumeValidatorAcceptsLegitimateResume() {
        assertTrue(ResumeValidator.isResume(SAMPLE_RESUME));
    }

    @Test
    @DisplayName("ResumeValidator rejects non-resume content like code, invoices, and recipes")
    void testResumeValidatorRejectsNonResumes() {
        String javaCode = """
                package com.example;
                import java.util.List;
                public class Main {
                    public static void main(String[] args) {
                        System.out.println("Hello World");
                    }
                }
                """;
        assertFalse(ResumeValidator.isResume(javaCode), "Pure Java source code must be rejected");

        String invoice = """
                INVOICE #INV-2024-001
                Bill to: Acme Corp
                Total Due: $1,250.00
                Amount Due: $1,250.00
                Due date: 2024-11-15
                """;
        assertFalse(ResumeValidator.isResume(invoice), "Invoices must be rejected");

        String recipe = """
                Chocolate Chip Cookies
                Prep time: 15 mins
                Cook time: 10 mins
                Servings: 24 cookies
                Preheat oven to 375 degrees.
                Add 2 tablespoons of sugar and 1 teaspoon of vanilla.
                """;
        assertFalse(ResumeValidator.isResume(recipe), "Recipes must be rejected");
    }

    @Test
    @DisplayName("ResumeService.analyze produces structured, valid analysis without throwing")
    void testAnalyzeProducesValidAnalysis() {
        AnalyzeRequest request = new AnalyzeRequest(SAMPLE_RESUME, null, null);
        Analysis analysis = resumeService.analyze(request);

        assertNotNull(analysis);
        assertTrue(analysis.overall() >= 0 && analysis.overall() <= 100);
        assertTrue(analysis.ats() >= 0 && analysis.ats() <= 100);
        assertTrue(analysis.recruiter() >= 0 && analysis.recruiter() <= 100);
        assertTrue(analysis.readability() >= 0 && analysis.readability() <= 100);
        assertNotNull(analysis.strengths());
        assertFalse(analysis.strengths().isEmpty());
        assertNotNull(analysis.weaknesses());
        assertNotNull(analysis.keywords());
        assertNotNull(analysis.roles());
        assertNotNull(analysis.screeningChecks());
    }

    @Test
    @DisplayName("ResumeService.rewrite produces structured rewrite output")
    void testRewriteProducesFormattedOutput() {
        RewriteRequest request = new RewriteRequest(SAMPLE_RESUME, "modern", null, null, "Staff Software Engineer", "Led distributed systems architecture", "Lead engineering team");
        RewriteResponse response = resumeService.rewrite(request);

        assertNotNull(response);
        assertNotNull(response.rewritten());
        assertTrue(response.rewritten().length() > 50);
        assertTrue(response.rewritten().contains("Alex Mercer") || response.rewritten().contains("EXPERIENCE") || response.rewritten().contains("Software Engineer"));
    }
}
