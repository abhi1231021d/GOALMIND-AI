package com.resumekit;

import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.resumekit")
@Order(1)
class ApiExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream().findFirst().map(x -> x.getField()+" is required or invalid.").orElse("Invalid request.");
        return ResponseEntity.badRequest().body(new ErrorResponse(message));
    }
    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ErrorResponse> json() { return ResponseEntity.badRequest().body(new ErrorResponse("Invalid JSON body.")); }
    @ExceptionHandler(IllegalStateException.class)
    ResponseEntity<ErrorResponse> provider(IllegalStateException e) { return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new ErrorResponse(e.getMessage())); }
    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ErrorResponse> badInput(IllegalArgumentException e) { return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage())); }
}
