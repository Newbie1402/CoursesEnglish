import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

// Lấy danh sách bài học (theo courseId hoặc tất cả bài học active)
const fetchLessons = async ({ courseId }) => {
  let response;
  if (courseId) {
    response = await api.get(`/api/lessons/course/${courseId}`);
  } else {
    response = await api.get(`/api/lessons/view/active`);
  }
  const lessons = Array.isArray(response.data) ? response.data : [];
  return lessons.filter(lesson => lesson.active === true); // Chỉ lấy các bài học có active = true
};

// Tạo mới bài học
const createLessonApi = async (formData) => {
  const data = new FormData();
  data.append('title', formData.title);
  const file = Array.isArray(formData.file) ? formData.file[0] : formData.file;
  data.append('file', file);
  data.append('courseId', formData.courseId);
  const response = await api.post(`/api/lessons/upload`, data, {
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
  const response = await api.put(
    `/api/lessons/update/${lessonId}`,
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
  const response = await api.patch(`/api/lessons/update/${lessonId}/active?active=false`);
  return response.data;
};

const useLessonService = () => {
  const queryClient = useQueryClient();

  /**
   * Hook lấy danh sách bài học
   * @param {string} courseId - ID của khóa học (tùy chọn)
   * @returns {object} - Query object chứa danh sách bài học
   */
  const getLessonList = (courseId) =>
    useQuery({
      queryKey: ['lessons', { courseId }],
      queryFn: () => fetchLessons({ courseId }),
    });

  /**
   * Hook tạo mới bài học
   * @returns {object} - Mutation object để tạo bài học
   */
  const createLesson = useMutation({
    mutationFn: createLessonApi,
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons']);
    },
  });

  /**
   * Hook cập nhật bài học
   * @returns {object} - Mutation object để cập nhật bài học
   */
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

  /**
   * Hook xóa bài học
   * @returns {object} - Mutation object để xóa bài học
   */
  const deleteLesson = useMutation({
    mutationFn: deleteLessonApi,
    onSuccess: () => {
      queryClient.invalidateQueries(['lessons']); // Làm mới danh sách bài học sau khi xóa
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
