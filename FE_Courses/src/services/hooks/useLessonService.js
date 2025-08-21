import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Lấy danh sách bài học (theo courseId hoặc tất cả bài học active)
const fetchLessons = async ({ courseId }) => {
  let response;
  if (courseId) {
    response = await axios.get(`${BASE_URL}/api/lessons/course/${courseId}`);
  } else {
    response = await axios.get(`${BASE_URL}/api/lessons/view/active`);
  }
  const lessons = Array.isArray(response.data) ? response.data : [];
  return lessons.filter(lesson => lesson.active === true);
};

// Tạo mới bài học
const createLessonApi = async (formData) => {
  const data = new FormData();
  data.append('title', formData.title);
  const file = Array.isArray(formData.file) ? formData.file[0] : formData.file;
  data.append('file', file);
  data.append('courseId', formData.courseId);
  const response = await axios.post(`${BASE_URL}/api/lessons/upload`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Cập nhật bài học
const updateLessonApi = async ({ lessonId, data }) => {
  const formData = new FormData();
  if (data.title) formData.append('title', data.title);
  if (data.file) formData.append('file', data.file);
  if (data.courseId) formData.append('courseId', data.courseId);
  const response = await axios.put(
    `${BASE_URL}/api/lessons/update/${lessonId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// Xóa (ẩn) bài học
const deleteLessonApi = async (lessonId) => {
  const response = await axios.patch(`${BASE_URL}/api/lessons/update/${lessonId}/active?active=false`);
  return response.data;
};

const useLessonService = () => {
  const queryClient = useQueryClient();

  // Danh sách bài học
  const getLessonList = (courseId) =>
    useQuery({
      queryKey: ['lessons', { courseId }],
      queryFn: () => fetchLessons({ courseId }),
    });

  // Tạo mới bài học
  const createLesson = useMutation({
    mutationFn: createLessonApi,
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons']);
    },
  });

  // Cập nhật bài học
  const updateLesson = useMutation({
    mutationFn: updateLessonApi,
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons']);
    },
    onError: (error) => {
      if (error.response) {
        console.error('Lỗi BE:', error.response.data || error.response);
      } else {
        console.error('Lỗi không xác định:', error);
      }
    },
  });

  // Xóa bài học
  const deleteLesson = useMutation({
    mutationFn: deleteLessonApi,
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons']);
    },
  });

  return {
    getLessonList,
    createLesson,
    updateLesson,
    deleteLesson,
  };
};

export { fetchLessons, createLessonApi, updateLessonApi, deleteLessonApi };
export default useLessonService;
