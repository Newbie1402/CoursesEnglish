package com.Courses.Courses.controller;

import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.security.jwt.JWTBlacklistService;
import com.Courses.Courses.security.jwt.JWTUtil;
import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.repository.UsersRepository;
import com.Courses.Courses.service.CustomUserDetailService;
import com.Courses.Courses.service.reCAPTCHAService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsersRepository usersRepository;
    private final JWTUtil jwtService;

    private final reCAPTCHAService recaptchaService;

    @Autowired
    private CustomUserDetailService customUserDetailService;

    @Autowired
    private JWTBlacklistService tokenBlackListService;

    @Autowired
    private JWTUtil jwtUtil;

    @PostMapping("/verify-captcha")
    public ResponseEntity<ResponseData<Boolean>> verifyCaptcha(@RequestParam("token") String token) {
        boolean captchaValid = recaptchaService.verifyCaptcha(token);

        ResponseData<Boolean> response = ResponseData.<Boolean>builder()
                .StatusCode(captchaValid ? 200 : 400)
                .Message(captchaValid ? "Captcha verification successful!" : "Invalid captcha verification!")
                .data(captchaValid)
                .build();

        return ResponseEntity
                .status(captchaValid ? 200 : 400)
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ResponseData<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            ResponseData<Void> errorResponse = ResponseData.<Void>builder()
                    .StatusCode(400)
                    .Message("Thiếu hoặc sai định dạng Authorization header.")
                    .data(null)
                    .build();
            return ResponseEntity.badRequest().body(errorResponse);
        }
        String jwt = authorizationHeader.substring(7);
        tokenBlackListService.blacklistToken(jwt);
        ResponseData<Void> successResponse = ResponseData.<Void>builder()
                .StatusCode(200)
                .Message("Đăng xuất thành công.")
                .data(null)
                .build();
        return ResponseEntity.ok(successResponse);
    }


}
