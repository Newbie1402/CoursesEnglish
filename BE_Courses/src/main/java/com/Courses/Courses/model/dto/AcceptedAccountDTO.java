package com.Courses.Courses.model.dto;

import com.Courses.Courses.enums.Role;
import com.Courses.Courses.model.entity.AcceptedAccount;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcceptedAccountDTO {
    private Long id;
    private String email;
    private Set<Role> roles;

    public AcceptedAccount toEntity() {
        return AcceptedAccount.builder()
                .id(this.id)
                .email(this.email)
                .roles(this.roles)
                .build();
    }
}
