package com.Courses.Courses.service;

import com.Courses.Courses.enums.Role;
import com.Courses.Courses.model.dto.AcceptedAccountDto;
import com.Courses.Courses.model.entity.AcceptedAccount;
import com.Courses.Courses.model.request.AcceptedAccountRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.repository.AcceptedAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AcceptedAccountService {

    private final AcceptedAccountRepository acceptedAccountRepository;

    private static final Set<Role> ALLOWED_ROLES = Set.of(Role.TEACHER, Role.STUDENT);

    public ResponseEntity<ResponseData<AcceptedAccountDto>> addAccount(AcceptedAccountRequest request) {
        // Kiểm tra role hợp lệ, chỉ cho phép STUDENT và TEACHER
        for (Role role : request.getRoles()) {
            if (!ALLOWED_ROLES.contains(role)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        new ResponseData<>(400, "Chỉ chấp nhận role STUDENT và TEACHER", null)
                );
            }
        }

        if (acceptedAccountRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    new ResponseData<>(409, "Email đã tồn tại trong danh sách được chấp nhận", null)
            );
        }

        AcceptedAccount account = AcceptedAccount.builder()
                .email(request.getEmail())
                .roles(request.getRoles())
                .build();

        AcceptedAccount saved = acceptedAccountRepository.save(account);
        AcceptedAccountDto dto = toDTO(saved);

        return ResponseEntity.ok(new ResponseData<>(200, "Thêm tài khoản thành công", dto));
    }

    public ResponseEntity<ResponseData<AcceptedAccountDto>> updateAccount(Long id, AcceptedAccountRequest request) {
        for (Role role : request.getRoles()) {
            if (!ALLOWED_ROLES.contains(role)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        new ResponseData<>(400, "Chỉ chấp nhận role STUDENT và TEACHER", null)
                );
            }
        }

        Optional<AcceptedAccount> optional = acceptedAccountRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseData<>(404, "Không tìm thấy tài khoản với id = " + id, null)
            );
        }

        AcceptedAccount account = optional.get();
        account.setEmail(request.getEmail());
        account.setRoles(request.getRoles());

        AcceptedAccount updated = acceptedAccountRepository.save(account);
        return ResponseEntity.ok(new ResponseData<>(200, "Cập nhật thành công", toDTO(updated)));
    }

    public ResponseEntity<ResponseData<Void>> deleteAccount(Long id) {
        Optional<AcceptedAccount> optional = acceptedAccountRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ResponseData<>(404, "Không tìm thấy tài khoản với id = " + id, null)
            );
        }

        acceptedAccountRepository.deleteById(id);
        return ResponseEntity.ok(new ResponseData<>(200, "Xoá thành công", null));
    }

    private AcceptedAccountDto toDTO(AcceptedAccount entity) {
        return AcceptedAccountDto.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .roles(entity.getRoles())
                .build();
    }
}
