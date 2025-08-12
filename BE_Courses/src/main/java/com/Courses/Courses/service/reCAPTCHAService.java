package com.Courses.Courses.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class reCAPTCHAService {

    @Value("${recaptcha.secret}")
    private String recaptchaSecret;

    @Value("${recaptcha.verify.url}")
    private String recaptchaVerifyUrl;

    public boolean verifyCaptcha(String responseToken) {
        RestTemplate restTemplate = new RestTemplate();
        String verifyUrl = String.format("%s?secret=%s&response=%s",
                recaptchaVerifyUrl, recaptchaSecret, responseToken);

        ResponseEntity<Map> resp = restTemplate.postForEntity(verifyUrl, null, Map.class);
        Map body = resp.getBody();

        return body != null && Boolean.TRUE.equals(body.get("success"));
    }
}

