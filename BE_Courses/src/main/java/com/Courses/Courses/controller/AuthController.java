package com.Courses.Courses.controller;

import com.Courses.Courses.JWT.JWTUtil;
import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.repository.UsersRepository;
import com.Courses.Courses.service.CustomUserDetailService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsersRepository usersRepository;
    private final JWTUtil jwtService;

    @Autowired
    private CustomUserDetailService customUserDetailService;

    @GetMapping("/google-token")
    public ResponseEntity<?> getGoogleToken(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().body("User not authenticated");
        }

        // Lấy thông tin từ Google
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        String picture = principal.getAttribute("picture");

        // Tìm hoặc tạo user mới
        Optional<Users> optionalUser = usersRepository.findByEmail(email);
        Users user;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
        } else {
            user = new Users();
            user.setEmail(email);
            user.setEmail(name);
            user.setAvatarUrl(picture);
            user.setIsOauth2(true); // bạn có thể thêm enum Provider nếu muốn
            //user.setRoles("USER"); // Hoặc "CUSTOMER" tuỳ theo enum Role của bạn
            usersRepository.save(user);
        }

        // Tạo JWT
        UserDetails userDetails = customUserDetailService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        // Trả về token và thông tin user
        return ResponseEntity.ok().body(
                new AuthResponse(token, email, name, picture)
        );
    }

    @GetMapping("/check")
    public ResponseEntity<String> check() {
        return ResponseEntity.ok("AuthController is up!");
    }

    // Inner class cho response
    private record AuthResponse(String token, String email, String name, String picture) {}
}
