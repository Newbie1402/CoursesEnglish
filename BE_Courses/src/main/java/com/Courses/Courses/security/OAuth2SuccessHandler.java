package com.Courses.Courses.security;

import com.Courses.Courses.enums.Status;
import com.Courses.Courses.model.entity.AcceptedAccount;
import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.repository.AcceptedAccountRepository;
import com.Courses.Courses.repository.UsersRepository;
import com.Courses.Courses.security.jwt.JWTUtil;
import com.Courses.Courses.service.AcceptedAccountService;
import com.Courses.Courses.service.CustomUserDetailService;
import com.Courses.Courses.service.GooglePeopleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements org.springframework.security.web.authentication.AuthenticationSuccessHandler {

    @Autowired
    private final UsersRepository usersRepository;

    @Autowired
    private final CustomUserDetailService customUserDetailService;

    @Autowired
    private final OAuth2AuthorizedClientService authorizedClientService;


    private final GooglePeopleService googlePeopleService;
    private final JWTUtil jwtService;
    @Autowired
    private ObjectMapper jacksonObjectMapper;

    @Autowired
    private AcceptedAccountService acceptedAccountService;

    @Autowired
    private AcceptedAccountRepository acceptedAccountRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                oauthToken.getAuthorizedClientRegistrationId(),
                oauthToken.getName());
        String accessToken = client.getAccessToken().getTokenValue();

        String phone = null;
        try {
            phone = googlePeopleService.fetchPrimaryPhone(accessToken);
        } catch (Exception e) {
            e.printStackTrace();
        }

        Optional<AcceptedAccount> acceptedAccountOptional = acceptedAccountRepository.findByEmail(email);

        if (acceptedAccountOptional.isEmpty()) {
            ResponseData<String> errorResponse = ResponseData.<String>builder()
                    .StatusCode(403)
                    .Message("your account is not accepted yet")
                    .data(null)
                    .build();

            String json = jacksonObjectMapper.writeValueAsString(errorResponse);

            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(json);
            return;
        }

        Optional<Users> optionalUser = usersRepository.findByEmail(email);
        Users user;

        if (optionalUser.isPresent()) {
            user = optionalUser.get();

            if (user.getFullName() == null && name != null) {
                user.setFullName(name);
            }
            if (user.getPhoneNumber() == null && phone != null) {
                user.setPhoneNumber(phone);
            }
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
            usersRepository.save(user);
        }

        UserDetails userDetails = customUserDetailService.loadUserByUsername(user.getEmail());
        String jwt = jwtService.generateToken(userDetails);

        ResponseData<String> responseData = ResponseData.<String>builder()
                .StatusCode(200)
                .Message("Login successful")
                .data(jwt)
                .build();

        String json = jacksonObjectMapper.writeValueAsString(responseData);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(json);
    }


}
