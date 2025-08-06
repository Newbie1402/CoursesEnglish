package com.Courses.Courses.service;

import com.Courses.Courses.enums.Role;
import com.Courses.Courses.model.dto.AcceptedAccountDTO;
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

    public ResponseEntity<ResponseData<AcceptedAccountDTO>> addAccount(AcceptedAccountRequest request) {
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
        AcceptedAccountDTO dto = toDTO(saved);

        return ResponseEntity.ok(new ResponseData<>(200, "Thêm tài khoản thành công", dto));
    }

    public ResponseEntity<ResponseData<AcceptedAccountDTO>> updateAccount(Long id, AcceptedAccountRequest request) {
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

    private AcceptedAccountDTO toDTO(AcceptedAccount entity) {
        return AcceptedAccountDTO.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .roles(entity.getRoles())
                .build();
    }
}
