package com.resumekit;

import com.example.interview.api.InterviewDtos;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interview")
class InterviewResumeContextController {
    private final InterviewResumeContextService context;

    InterviewResumeContextController(InterviewResumeContextService context) {
        this.context = context;
    }

    @PostMapping("/context")
    InterviewDtos.ResumeContextView context(@Valid @RequestBody AnalyzeRequest request) {
        return context.extract(request);
    }
}
