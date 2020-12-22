package com.example.PhotoShareMicroservice;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {
    @GetMapping("/HelloWorld")
    public String helloWorld(){
        return "Hello World";
    }

}
