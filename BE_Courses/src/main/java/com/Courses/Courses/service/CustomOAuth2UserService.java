package com.Courses.Courses.service;

import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.repository.UsersRepository;
import com.Courses.Courses.enums.Role;
import com.Courses.Courses.enums.Status;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UsersRepository usersRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User user = super.loadUser(userRequest);
        return processOAuth2User(user);
    }

    private OAuth2User processOAuth2User(OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = (String) attributes.get("email");
        String fullName = (String) attributes.get("name");
        String avatar = (String) attributes.get("picture");

        Optional<Users> existingUserOpt = usersRepository.findByEmail(email);

        if (existingUserOpt.isEmpty()) {
            Users user = new Users();
            user.setEmail(email);
            user.setFullName(fullName);
            user.setAvatarUrl(avatar);
            user.setCreatedAt(LocalDateTime.now());
            user.setLastLoginAt(LocalDateTime.now());
            user.setIsOauth2(true);
            user.setStatus(Status.ACTIVE);

            usersRepository.save(user);
        } else {
            Users existingUser = existingUserOpt.get();
            existingUser.setLastLoginAt(LocalDateTime.now());
            usersRepository.save(existingUser);
        }

        return oAuth2User;
    }
}
