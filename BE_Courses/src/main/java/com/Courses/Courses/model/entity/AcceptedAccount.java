package com.Courses.Courses.model.entity;

import com.Courses.Courses.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "accepted_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcceptedAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "is_accepted", nullable = false)
    private boolean isAccepted = true;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "accepted_account_roles", joinColumns = @JoinColumn(name = "accepted_account_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Set<Role> roles;
}
