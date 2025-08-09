package com.Courses.Courses.service;

import com.Courses.Courses.exception.StatusApplication;
import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.repository.UsersRepository;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UploadFileService {

    private final Cloudinary cloudinary;
    private final UsersRepository userRepository;

    public ResponseEntity<ResponseData<Void>> uploadAvatar(Long userId, MultipartFile file) throws IOException {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getAvatarPublicId() != null) {
            cloudinary.uploader().destroy(user.getAvatarPublicId(), ObjectUtils.emptyMap());
        }


        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("folder", "avatars"));

        String url = uploadResult.get("secure_url").toString();
        String publicId = uploadResult.get("public_id").toString();

        user.setAvatarUrl(url);
        user.setAvatarPublicId(publicId);
        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseData<>(StatusApplication.SUCCESS.getCode(), "Upload image successfully", null)
        );
    }
}
