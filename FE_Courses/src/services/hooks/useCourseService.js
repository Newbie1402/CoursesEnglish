import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Lấy danh sách khóa học của giảng viên
const fetchCourses = async (teacherId) => {
  const response = await axios.get(`${BASE_URL}/api/courses/teacher/${teacherId}`);
  return response.data;
};

// Lấy chi tiết khóa học
const fetchCourseDetail = async (courseId) => {
  if (!courseId) throw new Error('Thiếu courseId');
  const response = await axios.get(`${BASE_URL}/api/courses/view/${courseId}`);
  return response.data;
};

// Tạo mới khóa học
const createCourseApi = async (courseData) => {
  const response = await axios.post(`${BASE_URL}/api/courses/create`, courseData);
  return response.data;
};

// Cập nhật khóa học
const updateCourseApi = async ({ courseId, data }) => {
  const response = await axios.put(`${BASE_URL}/api/courses/update/${courseId}`, data);
  return response.data;
};

// Xóa (inactive) khóa học
const deleteCourseApi = async (courseId) => {
  const response = await axios.delete(`${BASE_URL}/api/courses/inactive/${courseId}?active=false`);
  return response.data;
};

// Fetch danh sách học viên theo khóa học
const fetchStudentsByCourse = async (courseId) => {
  const response = await axios.get(`${BASE_URL}/api/enrollments/course/${courseId}/students`);
  return Array.isArray(response.data.data) ? response.data.data : [];
};

const useCourseService = () => {
  const queryClient = useQueryClient();

  // Danh sách khóa học
  const getCourseList = (teacherId) =>
    useQuery({
      queryKey: ['courses', teacherId],
      queryFn: () => fetchCourses(teacherId),
      enabled: !!teacherId,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    });

  // Chi tiết khóa học
  const getCourseDetail = (courseId) =>
    useQuery({
      queryKey: ['course-detail', courseId],
      queryFn: () => fetchCourseDetail(courseId),
      enabled: !!courseId,
      retry: 1,
    });

  // Danh sách học viên theo khóa học
  const getStudentListByCourse = (courseId) =>
    useQuery({
      queryKey: ['students', courseId],
      queryFn: () => fetchStudentsByCourse(courseId),
      enabled: !!courseId,
    });

  // Tạo mới khóa học
  const createCourse = useMutation({
    mutationFn: createCourseApi,
    onSuccess: () => {
      queryClient.invalidateQueries(['courses']);
    },
  });

  // Cập nhật khóa học
  const updateCourse = useMutation({
    mutationFn: updateCourseApi,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['course-detail', variables.courseId]);
      queryClient.invalidateQueries(['courses']);
    },
  });

  // Xóa khóa học
  const deleteCourse = useMutation({
    mutationFn: deleteCourseApi,
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries(['courses']);
      queryClient.invalidateQueries(['course-detail', courseId]);
    },
  });

  return {
    getCourseList,
    getCourseDetail,
    createCourse,
    updateCourse,
    deleteCourse,
    getStudentListByCourse,
  };
};

export default useCourseService;