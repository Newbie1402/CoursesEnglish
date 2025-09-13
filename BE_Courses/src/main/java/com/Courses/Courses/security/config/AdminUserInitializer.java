package com.Courses.Courses.security.config;

import com.Courses.Courses.enums.Role;
import com.Courses.Courses.enums.Status;
import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.repository.UsersRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Configuration
public class AdminUserInitializer {
    private static final Logger logger = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UsersRepository usersRepository;
    private final Environment env;

    public AdminUserInitializer(UsersRepository usersRepository, Environment env) {
        this.usersRepository = usersRepository;
        this.env = env;
    }

    @Bean
    public CommandLineRunner initAdminUser() {
        return args -> {
            String adminFullName = env.getProperty("admin.user.fullName", "Administrator");
            String adminEmail = env.getProperty("admin.user.email");
            String adminPhone = env.getProperty("admin.user.phone");

            if (adminEmail == null) {
                logger.warn("Email của tài khoản admin chưa khởi tạo. Bỏ qua việc tạo tài khoản admin.");
                return;
            }

            Optional<Users> existingAdmin = usersRepository.findByEmail(adminEmail);

            if (existingAdmin.isPresent()) {
                logger.info("Tài khoản admin với email {} đã tồn tại.", adminEmail);

                Users admin = existingAdmin.get();
                Set<Role> roles = admin.getRoles();
                if (roles == null) {
                    roles = new HashSet<>();
                }
                if (!roles.contains(Role.ADMIN)) {
                    roles.add(Role.ADMIN);
                    admin.setRoles(roles);
                    usersRepository.save(admin);
                    logger.info("Đã cập nhật quyền ADMIN cho người dùng có email: {}", adminEmail);
                }
            } else {
                logger.info("Đang tạo tài khoản admin với email: {}", adminEmail);

                Users adminUser = new Users();
                adminUser.setFullName(adminFullName);
                adminUser.setEmail(adminEmail);
                if (adminPhone != null && !adminPhone.trim().isEmpty()) {
                    adminUser.setPhoneNumber(adminPhone);
                }

                adminUser.setCreatedAt(LocalDateTime.now());
                adminUser.setLastLoginAt(LocalDateTime.now());
                adminUser.setStatus(Status.ACTIVE);
                Set<Role> roles = new HashSet<>();
                roles.add(Role.ADMIN);
                adminUser.setRoles(roles);
                adminUser.setIsOauth2(true);
                usersRepository.save(adminUser);
                logger.info("Tài khoản admin {} đã được tạo thành công.", adminFullName);
            }
        };
    }
}
