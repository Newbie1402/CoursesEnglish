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

/**
 * Lấy danh sách khóa học mà một học viên đang tham gia.
 * Backend có thể trả về 1 trong 2 dạng:
 *  - Dạng A: Array trực tiếp: [ { title, description, ... } ]
 *  - Dạng B (wrapped): { statusCode, message, data: [ ... ] }
 * Hàm sẽ chuẩn hóa và luôn trả về mảng.
 * @param {number} studentId
 * @returns {Array<{title:string,description:string,online:boolean,startDate:string,endDate:string,teacherId:number,active:boolean,schedules:Array<{id:number,dayOfWeek:string,timeSlot:string,timeRange:string}>,courseId:number}>}
 */
export const getCourseOfStudent = async (studentId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/courses/student/${studentId}`);
        const raw = res?.data;
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        return list;
    } catch (err) {
        console.error(`Error fetching course for studentID ${studentId}:`, err);
        return [];// luôn trả về mảng để tránh phải check null phía UI
    }
}