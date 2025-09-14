package com.Courses.Courses.security;

import com.Courses.Courses.enums.Status;
import com.Courses.Courses.model.entity.AcceptedAccount;
import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.repository.AcceptedAccountRepository;
import com.Courses.Courses.repository.StudentRepository;
import com.Courses.Courses.repository.TeacherRepository;
import com.Courses.Courses.repository.UsersRepository;
import com.Courses.Courses.security.jwt.JWTUtil;
import com.Courses.Courses.service.CustomUserDetailService;
import com.Courses.Courses.service.GooglePeopleService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UsersRepository usersRepository;
    private final CustomUserDetailService customUserDetailService;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final GooglePeopleService googlePeopleService;
    private final JWTUtil jwtService;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    @Autowired
    private AcceptedAccountRepository acceptedAccountRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Lấy access token từ Google OAuth2
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                oauthToken.getAuthorizedClientRegistrationId(),
                oauthToken.getName());
        String accessToken = client.getAccessToken().getTokenValue();

        // Lấy số điện thoại từ Google People API
        String phone = null;
        try {
            phone = googlePeopleService.fetchPrimaryPhone(accessToken);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Kiểm tra AcceptedAccount
        Optional<AcceptedAccount> acceptedAccountOptional = acceptedAccountRepository.findByEmail(email);
        if (acceptedAccountOptional.isEmpty()) {
            response.sendRedirect(frontendUrl + "/oauth2/error?reason=not_accepted");
            return;
        }

        // Tìm hoặc tạo mới User
        Optional<Users> optionalUser = usersRepository.findByEmail(email);
        Users user;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
            if (user.getFullName() == null && name != null) user.setFullName(name);
            if (user.getPhoneNumber() == null && phone != null) user.setPhoneNumber(phone);
            user.setLastLoginAt(LocalDateTime.now());
            usersRepository.save(user);
        } else {
            user = new Users();
            user.setEmail(email);
            user.setFullName(name);
            user.setPhoneNumber(phone);
            user.setStatus(Status.ACTIVE);
            user.setCreatedAt(LocalDateTime.now());
            user.setLastLoginAt(LocalDateTime.now());
            user.setIsOauth2(true);
            user.setRoles(acceptedAccountOptional.get().getRoles());
            usersRepository.save(user);
        }

        // ✅ Kiểm tra trạng thái User
        if (user.getStatus() == Status.INACTIVE) {
            response.sendRedirect(frontendUrl + "/oauth2/error?reason=not_accepted");
            return;
        }
        if (user.getStatus() == Status.BANNED) {
            response.sendRedirect(frontendUrl + "/oauth2/error?reason=not_accepted");
            return;
        }

        // Load UserDetails để sinh JWT
        UserDetails userDetails = customUserDetailService.loadUserByUsername(user.getEmail());

        // Lấy studentId và teacherId nếu có
        Long studentId = studentRepository.findStudentByUser_Id(user.getId()) != null
                ? studentRepository.findStudentByUser_Id(user.getId()).getId()
                : null;

        Long teacherId = teacherRepository.findTeacherByUser_Id(user.getId()) != null
                ? teacherRepository.findTeacherByUser_Id(user.getId()).getId()
                : null;

        // Sinh JWT
        String jwt = jwtService.generateToken(userDetails);
        String encodedToken = URLEncoder.encode(jwt, StandardCharsets.UTF_8);

        // Redirect về frontend kèm thông tin
        String redirectUri = frontendUrl + "/oauth2/redirect"
                + "?token=" + encodedToken
                + "&userId=" + user.getId()
                + "&studentId=" + (studentId != null ? studentId : "null")
                + "&teacherId=" + (teacherId != null ? teacherId : "null");

        response.sendRedirect(redirectUri);
    }
}
