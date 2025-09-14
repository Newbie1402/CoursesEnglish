import api from '../api';

export const verifyAccount = async (email, roles) => {
    try{
        const res = await api.post(`/api/accepted-accounts/create`, { email, roles });
        return res.data.data;
    } catch (err) {
        console.error('Error verifying account:', err);
        throw err;
    }
}

export const sendMail = async (email) => {
    try{
        const res = await api.post(`/api/accepted-accounts/send-email?email=${email}`);
        return res.data;
    } catch (err) {
        console.error('Error sending mail:', err);
        throw err;
    }
}

export const getAllUsers = async () => {
    try{
        const res = await api.get(`/api/users`);
        return res.data?.data || [];
    } catch (err) {
        console.error('Error fetching users:', err);
        throw err;
    }
}

export const getAllCourses = async () => {
    try{
        const res = await api.get(`/api/courses/view/full`);
        return res?.data || [];
    } catch (err) {
        console.error('Error fetching courses:', err);
        throw err;
    }
}

export const getAllCourseActive = async () => {
    try{
        const res = await api.get(`/api/courses/view/all`);
        return res?.data || [];
    } catch (err) {
        console.error('Error fetching active courses:', err);
        throw err;
    }
}

export const getAllExams = async () => {
    try{
        const res = await api.get(`/api/exams`);
        return res.data?.data || [];
    } catch (err) {
        console.error('Error fetching exams:', err);
        throw err;
    }
}

// Fetch danh sách học viên theo khóa học
export const getStudentOfCourse = async (courseId) => {
    try {
        const res = await api.get(`/api/enrollments/course/${courseId}/students`)
        return res.data?.data || null;
    } catch (err) {
        console.error("Error fetching students by course:", err);
        throw err;
    }
}

// Them hoc vien vao khoa hoc
export const addStudentToCourse = async (courseId, studentId) => {
    try {
        const res = await api.post(`/api/enrollments/enroll`, { courseId, studentId });
        return res.data?.data || null;
    } catch (err) {
        console.error("Error adding student to course:", err);
        throw err;
    }
}

// Dem so luong hoc vien theo khoa hoc
export const countStudentsInCourse = async (courseId) => {
    try {
        const students = await getStudentOfCourse(courseId);
        return Array.isArray(students) ? students.length : 0;
    } catch (err) {
        console.error("Error counting students in course:", err);
        throw err;
    }
}

// Inactive user
export const inactiveUser = async (userId, reason, deactivatedByUsername) => {
    try {
        const res = await api.put(`/api/users/${userId}/deactivate`, { reason, deactivatedByUsername});
        return res.data || null;
    } catch (err) {
        console.error("Error inactivating user:", err);
        throw err;
    }
}

// Active user
export const activeUser = async (userId) => {
    try {
        const res = await api.put(`/api/users/${userId}/activate`, {activatedByUsername: "admin"});
        return res.data || null;
    } catch (err) {
        console.error("Error activating user:", err);
        throw err;
    }
}
