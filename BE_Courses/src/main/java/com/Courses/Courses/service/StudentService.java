package com.Courses.Courses.service;

import com.Courses.Courses.enums.StatusApplication;
import com.Courses.Courses.model.dto.StudentDto;
import com.Courses.Courses.model.entity.Student;
import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.model.request.StudentCreateRequest;
import com.Courses.Courses.model.request.StudentUpdateRequest;
import com.Courses.Courses.model.response.ResponseData;
import com.Courses.Courses.repository.StudentRepository;
import com.Courses.Courses.repository.UsersRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StudentService {
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UsersRepository usersRepository;

    /**
     * Lấy danh sách toàn bộ học sinh
     */
    public ResponseEntity<ResponseData<List<StudentDto>>> getAllStudents() {
        List<Student> students = studentRepository.findAll();
        List<StudentDto> dtos = students.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        StatusApplication.SUCCESS.getMessage(),
                        dtos
                )
        );
    }

    /**
     * Lấy thông tin chi tiết học sinh theo id
     */
    public ResponseEntity<ResponseData<StudentDto>> getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với id: " + id));
        StudentDto dto = toDto(student);
        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        StatusApplication.SUCCESS.getMessage(),
                        dto
                )
        );
    }

    /**
     * Thêm mới học sinh
     */
    @Transactional
    public ResponseEntity<ResponseData<StudentDto>> createStudent(StudentCreateRequest request) {
        Users user = usersRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + request.getUserId()));
        Student student = new Student();
        student.setUser(user);
        student.setFatherName(request.getFatherName());
        student.setFatherPhone(request.getFatherPhone());
        student.setMotherName(request.getMotherName());
        student.setMotherPhone(request.getMotherPhone());
        student.setApplication(request.getApplication());
        Student saved = studentRepository.save(student);
        StudentDto studentDto = toDto(saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        StatusApplication.SUCCESS.getMessage(),
                        studentDto
                )
        );
    }

    /**
     * Sửa thông tin học sinh theo id
     */
    @Transactional
    public ResponseEntity<ResponseData<StudentDto>> updateStudent(Long id, StudentUpdateRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với id: " + id));
        student.setFatherName(request.getFatherName());
        student.setFatherPhone(request.getFatherPhone());
        student.setMotherName(request.getMotherName());
        student.setMotherPhone(request.getMotherPhone());
        student.setApplication(request.getApplication());
        Student updated = studentRepository.save(student);
        StudentDto dto = toDto(updated);
        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        StatusApplication.SUCCESS.getMessage(),
                        dto
                )
        );
    }

    public ResponseEntity<ResponseData<Map<String, Object>>> getStudentsStatsByTeacherId(Long teacherId) {
        List<Student> students = studentRepository.findAllByTeacherId(teacherId);
        List<StudentDto> studentDtos = students.stream().map(this::toDto).collect(Collectors.toList());
        Long count = studentRepository.countByTeacherId(teacherId);
        Map<String, Object> result = new HashMap<>();
        result.put("students", studentDtos);
        result.put("studentCount", count);
        result.put("teacherId", teacherId);

        return ResponseEntity.status(HttpStatus.OK).body(
                new ResponseData<>(
                        StatusApplication.SUCCESS.getCode(),
                        StatusApplication.SUCCESS.getMessage(),
                        result
                )
        );
    }

    private StudentDto toDto(Student student) {
        Users user = student.getUser();
        return StudentDto.builder()
                .studentId(student.getId())
                .userId(user != null ? user.getId() : null)
                .fatherName(student.getFatherName())
                .fatherPhone(student.getFatherPhone())
                .motherName(student.getMotherName())
                .motherPhone(student.getMotherPhone())
                .application(student.getApplication())
                .fullName(user != null ? user.getFullName() : null)
                .email(user != null ? user.getEmail() : null)
                .phoneNumber(user != null ? user.getPhoneNumber() : null)
                .gender(user != null ? user.getGender() : null)
                .dateOfBirth(user != null ? user.getDateOfBirth() : null)
                .address(user != null ? user.getAddress() : null)
                .avatarUrl(user != null ? user.getAvatarUrl() : null)
                .build();
    }
}
