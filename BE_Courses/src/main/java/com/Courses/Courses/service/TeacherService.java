package com.Courses.Courses.service;

import com.Courses.Courses.exception.StatusApplication;
import com.Courses.Courses.model.dto.TeacherDto;
import com.Courses.Courses.model.entity.Teacher;
import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.model.request.TeacherCreateRequest;
import com.Courses.Courses.model.request.TeacherUpdateRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.repository.TeacherRepository;
import com.Courses.Courses.repository.UsersRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeacherService {
    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UsersRepository usersRepository;

    /**
     * Lấy danh sách toàn bộ giáo viên
     */
    public ResponseEntity<ResponseData<List<TeacherDto>>> getAllTeachers() {
        List<Teacher> teachers = teacherRepository.findAll();
        List<TeacherDto> dtos = teachers.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        StatusApplication.SUCCESS.getMessage(),
                        dtos
                )
        );
    }

    /**
     * Lấy thông tin chi tiết giáo viên theo id
     */
    public ResponseEntity<ResponseData<TeacherDto>> getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên với id: " + id));
        TeacherDto dto = toDto(teacher);
        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        StatusApplication.SUCCESS.getMessage(),
                        dto
                )
        );
    }

    /**
     * Thêm mới giáo viên
     */
    @Transactional
    public ResponseEntity<ResponseData<TeacherDto>> createTeacher(TeacherCreateRequest request) {
        Users user = usersRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + request.getUserId()));
        Teacher teacher = new Teacher();
        teacher.setUser(user);
        teacher.setSpecialization(request.getSpecialization());
        teacher.setBio(request.getBio());
        teacher.setExperienceYears(request.getExperienceYears());
        Teacher saved = teacherRepository.save(teacher);
        TeacherDto teacherDto = toDto(saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        StatusApplication.SUCCESS.getMessage(),
                        teacherDto
                )
        );
    }

    /**
     * Sửa thông tin giáo viên theo id
     */
    @Transactional
    public ResponseEntity<ResponseData<TeacherDto>> updateTeacher(Long id, TeacherUpdateRequest request) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên với id: " + id));
        teacher.setSpecialization(request.getSpecialization());
        teacher.setBio(request.getBio());
        teacher.setExperienceYears(request.getExperienceYears());
        Teacher updated = teacherRepository.save(teacher);
        TeacherDto dto = toDto(updated);
        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        StatusApplication.SUCCESS.getMessage(),
                        dto
                )
        );
    }


    private TeacherDto toDto(Teacher teacher) {
        return TeacherDto.builder()
                .teacherId(teacher.getId())
                .userId(teacher.getUser() != null ? teacher.getUser().getId() : null)
                .bio(teacher.getBio())
                .specialization(teacher.getSpecialization())
                .experienceYears(teacher.getExperienceYears())
                .build();
    }
}
