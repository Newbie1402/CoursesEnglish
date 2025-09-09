import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAssignmentOfCourses = async (courseId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/exams/course/${courseId}/active`);
        return res.data?.data || []; // Đảm bảo trả về một mảng
    } catch (err) {
        console.error("Error fetching assignments for course:", err);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
}

// lay thong tin chi tiet bai kiem tra
export const getAssignmentDetails = async (assignmentId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/exams/${assignmentId}`);
        return res.data?.data || null; // Trả về null nếu không có dữ liệu
    } catch (err) {
        console.error(`Error fetching details for assignment ID ${assignmentId}:`, err);
        return null; // Trả về null nếu có lỗi
    }
}

// dem so luong bai kiem tra trong khoa hoc
export const countAssignmentsInCourse = async (courseId) => {
    try {
        const assignments = await getAssignmentOfCourses(courseId);
        return assignments.length;
    } catch (err) {
        console.error("Error counting assignments in course:", err);
        return 0; // Trả về 0 nếu có lỗi
    }
}

export const getQuestions = async (examId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/questions/exam/${examId}`);
        return res.data?.data || []; // Đảm bảo trả về một mảng
    } catch (err) {
        console.error("Error fetching questions for assignment:", err);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
}