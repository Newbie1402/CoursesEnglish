import { useState } from 'react';
import axios from 'axios';

const useTeacherService = (BASE_URL = import.meta.env.VITE_API_BASE_URL) => {
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [loading, setLoading] = useState(false);

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
    try {
      const res = await axios.post(`${BASE_URL}/api/teacher/create`, {
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
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lấy thông tin hồ sơ giảng viên
   * @param {string} teacherId - ID của giảng viên
   * @returns {Promise<object|null>} - Thông tin hồ sơ giảng viên hoặc null nếu thất bại
   */
  const getTeacherInfo = async (teacherId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/teacher/view/${teacherId}`);
      if (res.data?.statusCode === 200) {
        setTeacherInfo(res.data.data);
        return res.data.data;
      }
      return null;
    } catch (err) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật hồ sơ giảng viên
   * @param {string} teacherId - ID của giảng viên
   * @param {object} params - Thông tin cập nhật
   * @param {string} params.specialization - Chuyên môn
   * @param {string} params.bio - Tiểu sử
   * @param {number} params.experienceYears - Số năm kinh nghiệm
   * @returns {Promise<object|null>} - Thông tin hồ sơ giảng viên hoặc null nếu thất bại
   */
  const updateTeacherInfo = async (teacherId, { specialization, bio, experienceYears }) => {
    setLoading(true);
    try {
      const res = await axios.put(`${BASE_URL}/api/teacher/update/${teacherId}`, {
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
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật thông tin tài khoản người dùng
   * @param {string} userId - ID người dùng
   * @param {object} data - Dữ liệu cập nhật
   * @returns {Promise<object|null>} - Thông tin tài khoản hoặc null nếu thất bại
   */
  const updateUserProfile = async (userId, data) => {
    setLoading(true);
    try {
      const res = await axios.put(`${BASE_URL}/api/users/${userId}/profile`, data);
      if (res.data?.statusCode === 200) {
        return res.data;
      }
      return null;
    } catch (err) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lấy danh sách tất cả giảng viên
   * @returns {Promise<object|null>} - Danh sách giảng viên hoặc null nếu thất bại
   */
  const getAllTeacher = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/teacher/view/all`);
      if (res.data?.statusCode === 200) {
        return res.data.data;
      }
      return null;
    } catch (err) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    teacherInfo,
    loading,
    createTeacher,
    getTeacherInfo,
    updateTeacherInfo,
    setTeacherInfo,
    setLoading,
    updateUserProfile,
    getAllTeacher
  };
};

export default useTeacherService;

export class getAllTeacher {
}