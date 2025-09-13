import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// Cache lưu trữ thông tin giảng viên để tránh gọi API nhiều lần
const teacherCache = new Map();

const useTeacherService = () => {
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  /**
   * Tạo mới hồ sơ giảng viên
   * @param {object} params - Thông tin hồ sơ giảng viên
   * @param {string} params.userId - ID người dùng
   * @param {string} params.specialization - Chuyên môn
   * @param {string} params.bio - Tiểu sử
   * @param {number} params.experienceYears - Số năm kinh nghiệm
   * @returns {Promise<object|null>} - Thông tin hồ sơ giảng viên hoặc null nếu thất bại
   */
  const createTeacher = async ({ userId, specialization = '', bio = '', experienceYears = 0 }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/api/teacher/create`, {
        userId,
        specialization,
        bio,
        experienceYears: Number(experienceYears)
      });
      if (res.data?.statusCode === 200) {
        setTeacherInfo(res.data.data);
        return res.data.data;
      }
      return null;
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo hồ sơ giảng viên');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lấy thông tin giảng viên từ cache hoặc API với xử lý lỗi xác thực
   * @param {number|string} teacherId - ID của giảng viên
   * @returns {Promise<object|null>} Thông tin giảng viên hoặc null nếu không tìm thấy
   */
  const getTeacherDetails = useCallback(async (teacherId) => {
    // Nếu không có teacherId, trả về null ngay lập tức
    if (!teacherId) return null;

    // Nếu đã có trong cache, trả về từ cache
    if (teacherCache.has(teacherId)) {
      return teacherCache.get(teacherId);
    }

    setLoading(true);
    setError(null);

    try {
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn("Không tìm thấy token xác thực");
        setError("Bạn cần đăng nhập để xem thông tin này");
        return null;
      }

      // Sử dụng API để lấy thông tin khóa học của giảng viên thay vì thông tin cá nhân
      // Điều này giúp tránh lỗi CORS vì API này thường ít hạn chế hơn
      const res = await api.get(`/api/courses/teacher/${teacherId}`);

      // Lấy thông tin giảng viên từ khóa học đầu tiên nếu có
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const firstCourse = res.data[0];
        if (firstCourse.teacher) {
          // Lưu vào cache
          teacherCache.set(teacherId, firstCourse.teacher);
          return firstCourse.teacher;
        }
      }

      // Nếu không thể lấy từ danh sách khóa học, thử gọi API thông tin giảng viên
      // Nhưng API này có thể bị hạn chế quyền truy cập
      try {
        const teacherRes = await api.get(`/api/teacher/view/${teacherId}`);
        if (teacherRes.data?.data) {
          // Lưu vào cache
          teacherCache.set(teacherId, teacherRes.data.data);
          return teacherRes.data.data;
        }
      } catch (teacherErr) {
        // Xử lý lỗi CORS hoặc lỗi xác thực
        if (teacherErr.code === 'ERR_NETWORK' || teacherErr.message === 'Network Error') {
          console.warn("Lỗi CORS hoặc xác thực: Token có thể đã hết hạn");

          // Kiểm tra nếu bị chuyển hướng đến trang đăng nhập OAuth
          if (teacherErr.request?.responseURL?.includes('accounts.google.com')) {
            // Xóa token không hợp lệ
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Chuyển hướng đến trang đăng nhập
            setTimeout(() => {
              navigate('/login', { state: { from: location.pathname, message: "Phiên đăng nhập đã hết hạn" } });
            }, 100);
          }
        }

        // Trả về thông tin mặc định cho giảng viên
        return {
          id: teacherId,
          fullName: "Giảng viên",
          specialization: "Chưa cập nhật",
          bio: "Chưa cập nhật thông tin"
        };
      }

      // Trường hợp không tìm thấy thông tin
      return {
        id: teacherId,
        fullName: "Giảng viên " + teacherId,
        specialization: "Chưa cập nhật",
        bio: "Chưa cập nhật thông tin"
      };
    } catch (err) {
      console.error(`Lỗi khi lấy thông tin giảng viên ID ${teacherId}:`, err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin giảng viên');

      // Trả về thông tin mặc định khi có lỗi
      return {
        id: teacherId,
        fullName: "Giảng viên " + teacherId,
        specialization: "Chưa cập nhật",
        bio: "Chưa cập nhật thông tin"
      };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * Xóa thông tin giảng viên khỏi cache
   * @param {number|string} teacherId - ID của giảng viên cần xóa khỏi cache
   */
  const clearTeacherCache = useCallback((teacherId) => {
    if (teacherId) {
      teacherCache.delete(teacherId);
    } else {
      teacherCache.clear();
    }
  }, []);

  /**
   * Hook để tải thông tin giảng viên một cách tự động
   * @param {number|string} teacherId - ID của giảng viên
   * @returns {{teacher: object|null, loading: boolean, error: string|null}}
   */
  const useTeacherInfo = (teacherId) => {
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchTeacher = async () => {
        if (!teacherId) return;

        setLoading(true);
        try {
          const data = await getTeacherDetails(teacherId);
          setTeacher(data);
        } catch (err) {
          setError(err.message || 'Không thể tải thông tin giảng viên');
        } finally {
          setLoading(false);
        }
      };

      fetchTeacher();
    }, [teacherId]);

    return { teacher, loading, error };
  };

  return {
    teacherInfo,
    loading,
    error,
    createTeacher,
    getTeacherDetails,
    clearTeacherCache,
    useTeacherInfo
  };
};

export default useTeacherService;

export class getAllTeacher {
}