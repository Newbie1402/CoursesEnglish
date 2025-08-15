package com.Courses.Courses.controller;

import com.Courses.Courses.model.dto.AcceptedAccountDto;
import com.Courses.Courses.model.request.AcceptedAccountRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.service.AcceptedAccountService;
import com.Courses.Courses.service.MailSenderService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accepted-accounts")
@RequiredArgsConstructor
public class AcceptedAccountController {

    private final AcceptedAccountService acceptedAccountService;

    private final MailSenderService mailSenderService;

    @PostMapping("/create")
    public ResponseEntity<ResponseData<AcceptedAccountDto>> createAccount(@RequestBody AcceptedAccountRequest request) {
        return acceptedAccountService.addAccount(request);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ResponseData<AcceptedAccountDto>> updateAccount(@PathVariable Long id, @RequestBody AcceptedAccountRequest request) {
        return acceptedAccountService.updateAccount(id, request);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseData<Void>> deleteAccount(@PathVariable Long id) {
        return acceptedAccountService.deleteAccount(id);
    }

    @PostMapping("/send-email")
    public ResponseEntity<ResponseData<Void>> sendEmail(@RequestParam String email) throws MessagingException {
        return mailSenderService.sendNotification(email);
    }
}
