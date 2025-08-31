package com.Courses.Courses.service;

import com.Courses.Courses.enums.Status;
import com.Courses.Courses.enums.StatusApplication;
import com.Courses.Courses.model.dto.UsersDto;
import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.model.request.UserUpdateRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.repository.UsersRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsersService {
    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private AdminNotificationService adminNotificationService;

    /**
     * Cập nhật thông tin cá nhân của người dùng
     */
    @Transactional
    public ResponseEntity<ResponseData<UsersDto>> updateUserProfile(Long id, UserUpdateRequest request) {
        Optional<Users> optionalUser = usersRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(
                            StatusApplication.NOT_FOUND.getCode(),
                            "Không tìm thấy người dùng với ID: " + id,
                            null
                    ));
        }

        Users user = optionalUser.get();

        // Kiểm tra nếu tài khoản đã bị vô hiệu hóa
        if (user.getStatus() == Status.INACTIVE) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ResponseData<>(
                            StatusApplication.ERROR.getCode(),
                            "Tài khoản đã bị vô hiệu hóa, không thể cập nhật thông tin",
                            null
                    ));
        }

        // Cập nhật thông tin
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        Users savedUser = usersRepository.save(user);

        return ResponseEntity.ok(new ResponseData<>(
                StatusApplication.SUCCESS.getCode(),
                "Cập nhật thông tin người dùng thành công",
                convertToDto(savedUser)
        ));
    }

    /**
     * Vô hiệu hóa tài khoản người dùng
     * @param id ID của người dùng
     * @param reason Lý do khóa tài khoản
     * @param deactivatedByUsername Tên người khóa tài khoản
     */
    @Transactional
    public ResponseEntity<ResponseData<String>> deactivateUser(Long id, String reason, String deactivatedByUsername) {
        Optional<Users> optionalUser = usersRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(
                            StatusApplication.NOT_FOUND.getCode(),
                            "Không tìm thấy người dùng với ID: " + id,
                            null
                    ));
        }

        Users user = optionalUser.get();
        user.setStatus(Status.INACTIVE);
        usersRepository.save(user);
        adminNotificationService.notifyAccountLocked(
            id,
            user.getEmail(),
            user.getFullName(),
            reason,
            deactivatedByUsername
        );

        return ResponseEntity.ok(new ResponseData<>(
                StatusApplication.SUCCESS.getCode(),
                "Vô hiệu hóa tài khoản người dùng thành công",
                "Tài khoản của " + user.getFullName() + " đã bị vô hiệu hóa"
        ));
    }

    /**
     * Kích hoạt lại tài khoản người dùng
     * @param id ID của người dùng
     * @param activatedByUsername Tên người mở khóa tài khoản
     */
    @Transactional
    public ResponseEntity<ResponseData<String>> activateUser(Long id, String activatedByUsername) {
        Optional<Users> optionalUser = usersRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(
                            StatusApplication.NOT_FOUND.getCode(),
                            "Không tìm thấy người dùng với ID: " + id,
                            null
                    ));
        }

        Users user = optionalUser.get();
        user.setStatus(Status.ACTIVE);
        usersRepository.save(user);
        adminNotificationService.notifyAccountUnlocked(
            id,
            user.getEmail(),
            user.getFullName(),
            activatedByUsername
        );

        return ResponseEntity.ok(new ResponseData<>(
                StatusApplication.SUCCESS.getCode(),
                "Kích hoạt tài khoản người dùng thành công",
                "Tài khoản của " + user.getFullName() + " đã được kích hoạt"
        ));
    }

    private UsersDto convertToDto(Users user) {
        return UsersDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .roles(user.getRoles())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .address(user.getAddress())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .status(user.getStatus())
                .avatarUrl(user.getAvatarUrl())
                .isOauth2(user.getIsOauth2())
                .build();
    }
}
