import api from "../api";

export const getAllTeacher = async () => {
    try {
        // Kiểm tra xem có token không trước khi gọi API
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
            return { error: true, message: "Phiên đăng nhập đã hết hạn", data: [] };
        }

        const res = await api.get(`/api/teacher/view/all`);
        return { error: false, data: res.data?.data || [] };
    } catch (err) {
        console.error("Error fetching teacher list:", err);

        // Xử lý lỗi CORS hoặc lỗi xác thực
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
            console.warn("Lỗi CORS hoặc xác thực: Token có thể đã hết hạn");

            // Kiểm tra nếu bị chuyển hướng đến trang đăng nhập OAuth
            if (err.request && err.request.responseURL && err.request.responseURL.includes('accounts.google.com')) {
                // Xóa token không hợp lệ
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                return {
                    error: true,
                    message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
                    redirectToLogin: true,
                    data: []
                };
            }
        }

        return {
            error: true,
            message: "Không thể tải danh sách giảng viên. Vui lòng thử lại sau.",
            data: []
        };
    }
};

export const getTeacherDetails = async (teacherId) => {
    try {
        // Kiểm tra xem có token không trước khi gọi API
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
            return { error: true, message: "Phiên đăng nhập đã hết hạn", data: null };
        }

        const res = await api.get(`/api/teacher/view/${teacherId}`);
        return { error: false, data: res.data?.data || null };
    } catch (err) {
        console.error(`Error fetching details for teacher ID ${teacherId}:`, err);

        // Xử lý lỗi CORS hoặc lỗi xác thực
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
            console.warn("Lỗi CORS hoặc xác thực: Token có thể đã hết hạn");

            // Kiểm tra nếu bị chuyển hướng đến trang đăng nhập OAuth
            if (err.request && err.request.responseURL && err.request.responseURL.includes('accounts.google.com')) {
                // Xóa token không hợp lệ
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                return {
                    error: true,
                    message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
                    redirectToLogin: true,
                    data: null
                };
            }
        }

        return {
            error: true,
            message: `Không thể tải thông tin giảng viên ID: ${teacherId}. Vui lòng thử lại sau.`,
            data: null
        };
    }
};

export const countStudents = async (teacherId) => {
    try {
        const res = await api.get(`/api/student/teacher/${teacherId}/count`);
        return res.data?.data || 0;
    } catch (err) {
        console.error(`Error counting students for teacher ID ${teacherId}:`, err);
        throw err;
    }
}