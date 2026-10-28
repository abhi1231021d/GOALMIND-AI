package com.example.interview.api;

import com.example.interview.service.InterviewService;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@Validated
@RequestMapping("/api")
public class InterviewController {
    private final InterviewService service;
    public InterviewController(InterviewService service) { this.service = service; }
    @PostMapping("/sessions") @ResponseStatus(HttpStatus.CREATED)
    public InterviewDtos.SessionView start(@Valid @RequestBody InterviewDtos.StartRequest request) { return service.start(request); }
    @GetMapping("/sessions/{id}") public InterviewDtos.SessionView get(@PathVariable long id) { return service.get(id); }
    @GetMapping("/sessions") public List<InterviewDtos.SessionView> history() { return service.history(); }
    @DeleteMapping("/sessions/{id}")
    public InterviewDtos.DeletionResponse delete(@PathVariable @Positive long id) {
        service.delete(id);
        return new InterviewDtos.DeletionResponse(1, "Session deleted successfully.");
    }
    @DeleteMapping("/sessions")
    public InterviewDtos.DeletionResponse reset() {
        int count = service.reset();
        return new InterviewDtos.DeletionResponse(count, "All practice sessions reset.");
    }
    @GetMapping("/dashboard") public InterviewDtos.DashboardView dashboard() { return service.dashboard(); }
    @GetMapping("/sessions/{id}/replay") public InterviewDtos.ReplayView replay(@PathVariable long id) { return service.replay(id); }
    @PostMapping("/sessions/{sessionId}/questions/{questionId}/answer")
    public InterviewDtos.QuestionView answer(@PathVariable long sessionId, @PathVariable long questionId,
                                             @Valid @RequestBody InterviewDtos.AnswerRequest request) {
        return service.answer(sessionId, questionId, request);
    }
    @PostMapping("/sessions/{sessionId}/questions/{questionId}/skip")
    public InterviewDtos.QuestionView skip(@PathVariable long sessionId, @PathVariable long questionId) {
        return service.skip(sessionId, questionId);
    }
    @PostMapping("/sessions/{sessionId}/questions/{questionId}/clarify")
    public InterviewDtos.ClarificationDto clarify(@PathVariable long sessionId, @PathVariable long questionId,
                                                  @Valid @RequestBody InterviewDtos.ClarifyRequest request) {
        return service.clarify(sessionId, questionId, request);
    }
    @PostMapping("/sessions/{sessionId}/questions/{questionId}/hint")
    public InterviewDtos.HintResponse hint(@PathVariable long sessionId, @PathVariable long questionId) {
        return service.hint(sessionId, questionId);
    }
    @PostMapping("/sessions/{sessionId}/questions/{questionId}/followup")
    public InterviewDtos.QuestionView defendFollowUp(@PathVariable long sessionId, @PathVariable long questionId,
                                                     @Valid @RequestBody InterviewDtos.AnswerRequest request) {
        return service.defendFollowUp(sessionId, questionId, request);
    }

    @ExceptionHandler(NoSuchElementException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> notFound(NoSuchElementException exception) {
        return Map.of("error", "The requested interview resource was not found.");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> badRequest(IllegalArgumentException exception) {
        return Map.of("error", exception.getMessage() != null ? exception.getMessage() : "Invalid argument.");
    }

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> conflict(IllegalStateException exception) {
        return Map.of("error", exception.getMessage());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> invalidRequest(ConstraintViolationException exception) {
        return Map.of("error", exception.getMessage() != null ? exception.getMessage() : "Invalid request parameter.");
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> invalidPayload(org.springframework.web.bind.MethodArgumentNotValidException exception) {
        String msg = exception.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .findFirst().orElse("Invalid request payload.");
        return Map.of("error", msg);
    }
}
