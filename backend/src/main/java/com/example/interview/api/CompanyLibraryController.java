package com.example.interview.api;

import com.example.interview.service.CompanyLibraryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/company-library")
public class CompanyLibraryController {
    private final CompanyLibraryService service;

    public CompanyLibraryController(CompanyLibraryService service) {
        this.service = service;
    }

    @GetMapping
    public InterviewDtos.CompanyLibraryView list(
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String interviewRound) {
        return service.find(company, category, interviewRound);
    }
}
