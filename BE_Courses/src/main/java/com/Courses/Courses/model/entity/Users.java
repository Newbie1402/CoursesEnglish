package com.Courses.Courses.model.entity;

import com.Courses.Courses.enums.Role;
import com.Courses.Courses.enums.Status;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    private String email;

    private String phoneNumber;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @NotEmpty(message = "Người dùng phải có ít nhất một vai trò")
    private Set<Role> roles;

    private LocalDate dateOfBirth;

    private String gender;

    private String address;

    private LocalDateTime createdAt;

    private LocalDateTime lastLoginAt;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "is_oauth2")
    private Boolean isOauth2 = false;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private Student student;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private Teacher teacher;

}
