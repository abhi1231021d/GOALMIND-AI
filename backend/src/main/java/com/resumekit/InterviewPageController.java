package com.resumekit;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
class InterviewPageController {
    @GetMapping({"/interview", "/interview/"})
    String interview() {
        return "forward:/interview/index.html";
    }
}
