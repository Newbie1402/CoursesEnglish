package com.Courses.Courses.security.utils;

import com.Courses.Courses.model.entity.Student;
import com.Courses.Courses.model.entity.Teacher;
import com.Courses.Courses.model.entity.Users;
import com.Courses.Courses.repository.StudentRepository;
import com.Courses.Courses.repository.TeacherRepository;
import com.Courses.Courses.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("securityUtils")
public class SecurityUtils {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    /** ----------------- HÀM CŨ (wrapper, để code cũ không gãy) ----------------- */
    public boolean isCurrentUser(Long id) {
        // coi id là userId
        return isCurrentUserByUserId(id);
    }

    /** ----------------- HÀM MỚI ----------------- */

    // Check user theo userId
    public boolean isCurrentUserByUserId(Long userId) {
        String email = extractEmail();
        if (email == null) return false;

        return usersRepository.findByEmail(email)
                .map(user -> user.getId().equals(userId))
                .orElse(false);
    }

    // Check student theo studentId
    public boolean isCurrentUserByStudentId(Long studentId) {
        String email = extractEmail();
        if (email == null) return false;

        Optional<Users> userOpt = usersRepository.findByEmail(email);
        if (userOpt.isEmpty()) return false;

        Student student = studentRepository.findStudentByUser_Id(userOpt.get().getId());
        return student != null && student.getId().equals(studentId);
    }

    // Check teacher theo studentId (kiểm tra có dạy học sinh đó không)
    public boolean isAssignedTeacher(Long studentId) {
        String email = extractEmail();
        if (email == null) return false;

        Optional<Users> userOpt = usersRepository.findByEmail(email);
        if (userOpt.isEmpty()) return false;

        Teacher teacher = teacherRepository.findTeacherByUser_Id(userOpt.get().getId());
        if (teacher == null) return false;

        // TODO: thêm logic kiểm tra teacher có dạy student này không
        return true;
    }

    /** ----------------- Helper ----------------- */
    private String extractEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return null;

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return principal.toString();
    }

    public boolean canViewTeacher(Long teacherId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return false;

        String email;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        Optional<Users> userOpt = usersRepository.findByEmail(email);
        if (userOpt.isEmpty()) return false;
        Users currentUser = userOpt.get();

        Student student = studentRepository.findStudentByUser_Id(currentUser.getId());
        if (student == null) return false;

        // TODO: check xem student này có liên kết với teacherId không
        // Ví dụ: return teacherRepository.existsByIdAndStudentsContains(teacherId, student);

        return true; // tạm thời cho phép hết student
    }

}
