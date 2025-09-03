import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getCourseDetails = async (courseId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/courses/view/${courseId}`);
        return res?.data || null; // Trả về null nếu không có dữ liệu
    } catch (err) {
        console.error(`Error fetching details for course ID ${courseId}:`, err);
        return null; // Trả về null nếu có lỗi
    }
};

export const deleteCourse = async (courseId) => {
    try {
        const res = await axios.delete(`${BASE_URL}/api/courses/inactive/${courseId}?active=false`);
        return res?.data || null; // Trả về null nếu không có dữ liệu
    } catch (err) {
        console.error(`Error deleting course ID ${courseId}:`, err);
        return null; // Trả về null nếu có lỗi
    }
}

export const getStudentsCourse = async (courseId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/enrollments/course/${courseId}/students`);
        return res?.data?.data || []; // Trả về mảng rỗng nếu không có dữ liệu
    } catch (err) {
        console.error(`Error fetching students for course ID ${courseId}:`, err);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
}