package com.Courses.Courses.controller;

import com.Courses.Courses.model.dto.AcceptedAccountDTO;
import com.Courses.Courses.model.request.AcceptedAccountRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.service.AcceptedAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/accepted-accounts")
@RequiredArgsConstructor
public class AcceptedAccountController {

    private final AcceptedAccountService acceptedAccountService;

    @PostMapping("/create")
    public ResponseEntity<ResponseData<AcceptedAccountDTO>> createAccount(@RequestBody AcceptedAccountRequest request) {
        return acceptedAccountService.addAccount(request);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ResponseData<AcceptedAccountDTO>> updateAccount(@PathVariable Long id, @RequestBody AcceptedAccountRequest request) {
        return acceptedAccountService.updateAccount(id, request);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseData<Void>> deleteAccount(@PathVariable Long id) {
        return acceptedAccountService.deleteAccount(id);
    }
}
