package com.goalmind.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AppRedirectController {

    @GetMapping("/")
    public String redirectToApp() {
        return "redirect:http://localhost:3000";
    }
}
