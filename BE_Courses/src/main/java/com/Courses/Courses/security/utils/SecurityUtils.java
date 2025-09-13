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

    /**
     * Kiểm tra xem người dùng hiện tại có phải là người dùng có ID cụ thể hay không
     * @param userId ID của người dùng cần kiểm tra
     * @return true nếu người dùng hiện tại là người dùng có ID cụ thể, ngược lại false
     */
    public boolean isCurrentUser(Long userId) {
        // Lấy thông tin người dùng hiện tại từ SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // Lấy email của người dùng từ thông tin xác thực
        String email = null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        // Tìm người dùng theo email
        Optional<Users> userOpt = usersRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return false;
        }

        // Kiểm tra xem ID của người dùng hiện tại có khớp với ID đã cho không
        Users currentUser = userOpt.get();
        if (currentUser.getId().equals(userId)) {
            return true;
        }

        // Kiểm tra xem người dùng hiện tại có phải là student với ID đã cho không
        Student student = studentRepository.findStudentByUser_Id(currentUser.getId());
        if (student != null && student.getId().equals(userId)) {
            return true;
        }

        // Kiểm tra xem người dùng hiện tại có phải là teacher với ID đã cho không
        Teacher teacher = teacherRepository.findTeacherByUser_Id(currentUser.getId());
        return teacher != null && teacher.getId().equals(userId);
    }
}
