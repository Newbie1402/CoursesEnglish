import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const verifyAccount = async (email, roles) => {
    try{
        const res = await axios.post(`${BASE_URL}/api/accepted-accounts/create`, { email, roles });
        return res.data.data;
    } catch (err) {
        console.error('Error verifying account:', err);
        throw err;
    }
}

export const sendMail = async (email) => {
    try{
        const res = await axios.post(`${BASE_URL}/api/accepted-accounts/send-email?email=${email}`);
        return res.data;
    } catch (err) {
        console.error('Error sending mail:', err);
        throw err;
    }
}

export const getAllCourses = async () => {
    try{
        const res = await axios.get(`${BASE_URL}/api/courses/view/full`);
        return res?.data || [];
    } catch (err) {
        console.error('Error fetching courses:', err);
        throw err;
    }
}

export const getAllExams = async () => {
    try{
        const res = await axios.get(`${BASE_URL}/api/exams`);
        return res.data?.data || [];
    } catch (err) {
        console.error('Error fetching teachers:', err);
        throw err;
    }
}

// Fetch danh sách học viên theo khóa học
export const getStudentOfCourse = async (courseId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/enrollments/course/${courseId}/students`)
        return res.data?.data || null;
    } catch (err) {
        console.error("Error fetching students by course:", err);
        throw err;
    }
}

// Them hoc vien vao khoa hoc
export const addStudentToCourse = async (courseId, studentId) => {
    try {
        const res = await axios.post(`${BASE_URL}/api/enrollments/enroll`, { courseId, studentId });
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
