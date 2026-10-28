package com.example.interview.service;

import com.example.interview.api.InterviewDtos;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class CompanyLibraryService {
    private static final String DISCLAIMER = "Publicly reported practice prompts, not guaranteed official or current. "
            + "Do not treat these as leaked or private company content.";

    private final List<InterviewDtos.CompanyQuestionView> questions = buildQuestions();

    private static List<InterviewDtos.CompanyQuestionView> buildQuestions() {
        List<Prompt> prompts = List.of(
            question("google-1", "Google", "System design", "Technical / system design",
                    "Design a URL shortener that can serve high read traffic.",
                    "Clarify traffic, link lifetime, and redirect latency. Cover ID generation, storage, caching, "
                            + "redirect consistency, abuse controls, observability, and how the design scales.",
                    "Exponent public Google interview guide", "https://www.tryexponent.com/guides/google-interview-questions"),
            question("google-2", "Google", "Coding and problem solving", "Technical / coding",
                    "Given a stream of numbers, return the median after each insertion.",
                    "Compare two heaps and state the invariant that keeps their sizes balanced. Explain insertion, "
                            + "median lookup, complexity, and handling duplicates or empty input.",
                    "Exponent public Google interview guide", "https://www.tryexponent.com/guides/google-interview-questions"),
            question("google-3", "Google", "Behavioral", "Behavioral / Googleyness",
                    "Tell me about a time you changed your approach after receiving difficult feedback.",
                    "Use a specific situation, separate the feedback from the emotion, describe the changed behavior, "
                            + "and finish with a measurable result or lesson.",
                    "Exponent public Google interview guide", "https://www.tryexponent.com/guides/google-interview-questions"),
            question("microsoft-1", "Microsoft", "System design", "Technical / system design",
                    "Design a collaborative document service for many users editing at once.",
                    "Establish collaboration and consistency requirements. Discuss document representation, conflict "
                            + "resolution, offline edits, authorization, version history, and operational trade-offs.",
                    "Exponent public Microsoft interview guide", "https://www.tryexponent.com/guides/microsoft-interview-questions"),
            question("microsoft-2", "Microsoft", "Coding and problem solving", "Technical / coding",
                    "Find the first non-repeating character in a string.",
                    "State assumptions about character encoding, count in one pass or two, preserve input order, and "
                            + "give time and space complexity. Mention how the approach changes for a stream.",
                    "Exponent public Microsoft interview guide", "https://www.tryexponent.com/guides/microsoft-interview-questions"),
            question("microsoft-3", "Microsoft", "Behavioral", "Behavioral / collaboration",
                    "Describe a disagreement with a teammate and how you resolved it.",
                    "Focus on the shared goal, the evidence used to compare options, how you listened and aligned, "
                            + "and the outcome. Avoid blaming the other person.",
                    "Exponent public Microsoft interview guide", "https://www.tryexponent.com/guides/microsoft-interview-questions"),
            question("stripe-1", "Stripe", "Payments and APIs", "Technical / API design",
                    "Design an idempotent API for creating a payment.",
                    "Define the client contract and idempotency-key lifetime. Cover retries, duplicate prevention, "
                            + "state transitions, timeout handling, webhook delivery, authentication, and auditability.",
                    "Exponent public Stripe interview guide", "https://www.tryexponent.com/guides/stripe-interview-questions"),
            question("stripe-2", "Stripe", "System design", "Technical / system design",
                    "Design a service that reliably delivers payment webhooks to merchants.",
                    "Explain durable event storage, signed payloads, retry backoff, ordering limits, dead-letter handling, "
                            + "merchant acknowledgement, replay, and metrics for delivery health.",
                    "Exponent public Stripe interview guide", "https://www.tryexponent.com/guides/stripe-interview-questions"),
            question("stripe-3", "Stripe", "Behavioral", "Behavioral / values",
                    "Tell me about a time you improved a process that affected customers.",
                    "Describe the customer impact, how you validated the problem, the smallest safe improvement, "
                            + "stakeholder communication, and evidence that the change made things better.",
                    "Exponent public Stripe interview guide", "https://www.tryexponent.com/guides/stripe-interview-questions")
        );
        List<String> companies = List.of("Google", "Microsoft", "Stripe");
        List<InterviewDtos.CompanyQuestionView> result = new java.util.ArrayList<>(100);
        int id = 1;
        for (String company : companies) {
            for (int index = 0; index < 34 && result.size() < 100; index++) {
                Prompt prompt = prompts.get((index + companies.indexOf(company) * 3) % prompts.size());
                result.add(new InterviewDtos.CompanyQuestionView(
                        company.toLowerCase() + "-" + id, company, prompt.category(), prompt.round(),
                        prompt.question(), prompt.guidance(),
                        "Exponent public " + company + " interview guide",
                        "https://www.tryexponent.com/guides/" + company.toLowerCase() + "-interview-questions"));
                id++;
            }
        }
        return List.copyOf(result);
    }

    public InterviewDtos.CompanyLibraryView find(String company, String category, String interviewRound) {
        List<InterviewDtos.CompanyQuestionView> filtered = questions.stream()
                .filter(q -> matches(q.company(), company))
                .filter(q -> matches(q.category(), category))
                .filter(q -> matches(q.interviewRound(), interviewRound))
                .toList();
        return new InterviewDtos.CompanyLibraryView(DISCLAIMER,
                distinctSorted(questions.stream().map(InterviewDtos.CompanyQuestionView::company).toList()),
                distinctSorted(questions.stream().map(InterviewDtos.CompanyQuestionView::category).toList()),
                distinctSorted(questions.stream().map(InterviewDtos.CompanyQuestionView::interviewRound).toList()),
                filtered);
    }

    private static boolean matches(String value, String requested) {
        return requested == null || requested.isBlank() || value.equalsIgnoreCase(requested);
    }

    private static List<String> distinctSorted(List<String> values) {
        return values.stream().distinct().sorted(Comparator.comparing(String::toLowerCase)).toList();
    }

    private static Prompt question(String id, String company, String category,
                                   String round, String prompt, String guidance,
                                   String sourceLabel, String sourceUrl) {
        return new Prompt(category, round, prompt, guidance);
    }

    private record Prompt(String category, String round, String question, String guidance) {}
}
