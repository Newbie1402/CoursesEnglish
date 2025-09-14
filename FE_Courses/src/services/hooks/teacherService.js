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

export const updateTeacherInfo = async (teacherId, payload) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
            return null;
        }
        const res = await api.put(`/api/teacher/update/${teacherId}`, payload);
        return res.data?.data || null;
    } catch (err) {
        console.error(`Error updating teacher ID ${teacherId}:`, err);
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
            console.warn("Lỗi CORS hoặc xác thực: Token có thể đã hết hạn");
            if (err.request && err.request.responseURL && err.request.responseURL.includes('accounts.google.com')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        return null;
    }
};

export const updateUserProfile = async (userId, payload) => {
    try {
        // Kiểm tra xem có token không trước khi gọi API
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
            return { error: true, message: "Phiên đăng nhập đã hết hạn", data: null };
        }

        const res = await api.put(`/api/users/${userId}/profile`, payload);
        // Trả nguyên res.data để dùng statusCode ở client nếu cần
        return res.data || null;
    } catch (err) {
        console.error(`Error updating profile for user ID ${userId}:`, err);

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
            message: `Không thể cập nhật hồ sơ người dùng ID: ${userId}. Vui lòng thử lại sau.`,
            data: null
        };
    }
};

export const getTeacherDetail = async (teacherId) => {
    try {
        const res = await api.get(`/api/teacher/view/${teacherId}`);
        return res.data?.data || null;
    } catch (err) {
        console.error(`Error fetching details for teacher ID ${teacherId}:`, err);
        throw err;
    }
};

export const createTeacher = async (teacher) => {
    try {
        const res = await api.post(`/api/teacher/create`, teacher);
        return res.data.data || null;
    } catch (err) {
        console.error('Error creating teacher:', err);
        throw err;
    }
};

export const uploadAvatar = async (userId, formData) => {
    try {
        const res = await api.post(`/api/upload/avatar/${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        const statusCode = res.data?.statusCode ?? res.status ?? 0;
        const payload = res.data?.data;
        let url = null;
        if (typeof payload === 'string') url = payload;
        else if (payload && typeof payload === 'object') {
            url = payload.url || payload.avatarUrl || null;
        }
        return { statusCode, url, message: res.data?.message || '' };
    } catch (err) {
        console.error(`Error uploading avatar for teacher ID ${userId}:`, err);
        // Return a normalized error-like object so callers can handle gracefully
        return { statusCode: err.response?.status ?? 500, url: null, message: err.response?.data?.message || 'Upload failed' };
    }
}

export const countStudents = async (teacherId) => {
    try {
        const res = await api.get(`/api/student/teacher/${teacherId}/count`);
        return res.data?.data || 0;
    } catch (err) {
        console.error(`Error counting students for teacher ID ${teacherId}:`, err);
        throw err;
    }
}