package com.Courses.Courses.controller;

import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.service.UploadFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadFileController {

    private final UploadFileService uploadFileService;

    @PostMapping("/avatar/{userId}")
    @PreAuthorize("hasRole('ADMIN') or @securityUtils.isCurrentUser(#userId)")
    public ResponseEntity<ResponseData<Void>> uploadAvatar(
            @PathVariable Long userId,
            @RequestParam MultipartFile file) throws IOException {
        return uploadFileService.uploadAvatar(userId, file);
    }
}
