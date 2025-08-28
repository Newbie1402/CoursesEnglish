import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAllTeacher = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/api/teacher/view/all`);
        return res.data?.data || []; // Đảm bảo trả về một mảng
    } catch (err) {
        console.error("Error fetching teacher list:", err);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
};

export const getTeacherDetails = async (teacherId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/teacher/view/${teacherId}`);
        return res.data?.data || null; // Trả về null nếu không có dữ liệu
    } catch (err) {
        console.error(`Error fetching details for teacher ID ${teacherId}:`, err);
        return null; // Trả về null nếu có lỗi
    }
};