package com.goalmind;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.goalmind", "com.resumekit", "com.example.interview"})
@EntityScan(basePackages = {"com.goalmind.model", "com.example.interview.model"})
@EnableJpaRepositories(basePackages = {"com.goalmind.repository", "com.example.interview.repository"})
public class GoalMindApplication {

    public static void main(String[] args) {
        SpringApplication.run(GoalMindApplication.class, args);
    }
}
