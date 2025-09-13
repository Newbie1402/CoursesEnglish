import axios from 'axios';

// Lấy base URL từ biến môi trường
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Tạo một instance của Axios với cấu hình mặc định
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm một request interceptor
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (hoặc bất kỳ nơi nào bạn lưu trữ nó)
    const token = localStorage.getItem('token');

    // Nếu có token, thêm nó vào header Authorization
    if (token) {
      // Đảm bảo token có dạng "Bearer <token>"
      const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = bearerToken;
    }

    return config;
  },
  (error) => {
    // Xử lý lỗi request
    return Promise.reject(error);
  }
);

// Thêm một response interceptor
api.interceptors.response.use(
  (response) => {
    // Bất kỳ mã trạng thái nào nằm trong phạm vi 2xx đều kích hoạt hàm này
    // Trả về dữ liệu response để các hàm gọi API có thể xử lý
    return response;
  },
  (error) => {
    // Bất kỳ mã trạng thái nào nằm ngoài phạm vi 2xx đều kích hoạt hàm này
    // Đặc biệt xử lý lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Xóa token và thông tin người dùng khỏi localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('studentId');
      localStorage.removeItem('teacherId');

      // Điều hướng người dùng về trang đăng nhập
      // Dùng window.location.href để đảm bảo reload lại toàn bộ ứng dụng và xóa state cũ
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Trả về lỗi để các hàm gọi API có thể bắt và xử lý (ví dụ: hiển thị thông báo lỗi)
    return Promise.reject(error);
  }
);

export default api;

