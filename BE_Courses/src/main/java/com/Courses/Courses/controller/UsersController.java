package com.Courses.Courses.controller;

import com.Courses.Courses.model.dto.UsersDto;
import com.Courses.Courses.model.request.UserUpdateRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.service.UsersService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RestController
@RequestMapping("/api/users")
public class UsersController {
    @Autowired
    private UsersService usersService;

    /**
     * API cập nhật thông tin cá nhân của người dùng
     */
    @PutMapping("/{id}/profile")
    public ResponseEntity<ResponseData<UsersDto>> updateUserProfile(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        return usersService.updateUserProfile(id, request);
    }

    /**
     * API vô hiệu hóa tài khoản người dùng (chỉ dành cho ADMIN)
     */
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseData<String>> deactivateUser(@PathVariable Long id) {
        return usersService.deactivateUser(id);
    }

    /**
     * API kích hoạt lại tài khoản người dùng (chỉ dành cho ADMIN)
     */
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseData<String>> activateUser(@PathVariable Long id) {
        return usersService.activateUser(id);
    }
}
