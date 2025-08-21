import { useState } from 'react';
import axios from 'axios';

const useTeacherService = (BASE_URL) => {
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Tạo mới hồ sơ giảng viên
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

  // Lấy thông tin hồ sơ giảng viên
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

  // Cập nhật hồ sơ giảng viên
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

  // Cập nhật thông tin tài khoản người dùng
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

  return {
    teacherInfo,
    loading,
    createTeacher,
    getTeacherInfo,
    updateTeacherInfo,
    setTeacherInfo,
    setLoading,
    updateUserProfile
  };
};

export default useTeacherService;