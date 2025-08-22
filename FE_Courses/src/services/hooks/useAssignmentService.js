import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// API tạo bài kiểm tra
const createExamApi = async (examData) => {
  const response = await axios.post(`${BASE_URL}/api/exams/create`, examData);
  return response.data;
};

// API tạo câu hỏi
const createQuestionApi = async (data) => {
  const response = await axios.post(`${BASE_URL}/api/questions`, data);
  return response.data;
};

// API lấy danh sách bài kiểm tra đang hoạt động của giáo viên
const fetchActiveExamsByTeacher = async (teacherId) => {
  const response = await axios.get(`${BASE_URL}/api/exams/teacher/${teacherId}/active`);
  return response.data.data; // Trả về danh sách bài kiểm tra
};

// API lấy danh sách bài kiểm tra dang active của một khóa học
const fetchExamsByCourse = async (courseId) => {
  const response = await axios.get(`${BASE_URL}/api/exams/course/${courseId}/active`);
  return response.data.data; // Trả về danh sách bài kiểm tra
};

// API lấy danh sách câu hỏi của một bài kiểm tra
const fetchQuestionsByExam = async (examId) => {
    const response = await axios.get(`${BASE_URL}/api/questions/exam/${examId}`);
    return response.data.data; // Trả về danh sách câu hỏi
};

// API lấy thông tin chi tiết của một bài kiểm tra
const fetchExamById = async (examId) => {
  const response = await axios.get(`${BASE_URL}/api/exams/${examId}`);
  return response.data.data; // Trả về thông tin chi tiết bài kiểm tra
};

// API cập nhật câu hỏi
const updateQuestionApi = async ({ questionId, data }) => {
  const response = await axios.put(`${BASE_URL}/api/questions/${questionId}`, data);
  return response.data;
};

// API xóa câu hỏi
const deleteQuestionApi = async (questionId) => {
  const response = await axios.delete(`${BASE_URL}/api/questions/${questionId}`);
  return response.data;
};

const useAssignmentService = () => {
  const queryClient = useQueryClient();

  /**
 * Hook tạo bài kiểm tra
 * @returns {object} - Mutation object để tạo bài kiểm tra
 */
  const useCreateExam = () => {
    return useMutation({
      mutationFn: createExamApi,
      onSuccess: () => {
        queryClient.invalidateQueries(['exams']);
      },
    });
  };

  /**
 * Hook tạo câu hỏi
 * @returns {object} - Mutation object để tạo câu hỏi
 */
  const useCreateQuestion = () => {
    return useMutation({
      mutationFn: createQuestionApi,
      onSuccess: () => {
        queryClient.invalidateQueries(['questions']);
      },
    });
  };

  /**
 * Hook cập nhật câu hỏi
 * @returns {object} - Mutation object để cập nhật câu hỏi
 */
  const useUpdateQuestion = () => {
    return useMutation({
      mutationFn: updateQuestionApi,
      onSuccess: () => {
        queryClient.invalidateQueries(['questions']);
      },
    });
  };

  /**
 * Hook xóa câu hỏi
 * @returns {object} - Mutation object để xóa câu hỏi
 */
  const useDeleteQuestion = () => {
    return useMutation({
      mutationFn: deleteQuestionApi,
      onSuccess: () => {
        queryClient.invalidateQueries(['questions']);
      },
    });
  };

  /**
   * Hook lấy danh sách bài kiểm tra đang hoạt động của giáo viên
   * @param {string} teacherId - ID của giáo viên
   * @returns {object} - Query object chứa danh sách bài kiểm tra
   */
  const getActiveExamsByTeacher = (teacherId) =>
    useQuery({
      queryKey: ['activeExams', teacherId],
      queryFn: () => fetchActiveExamsByTeacher(teacherId),
      enabled: !!teacherId,
    });

  /**
   * Hook lấy danh sách bài kiểm tra của một khóa học
   * @param {string} courseId - ID của khóa học
   * @returns {object} - Query object chứa danh sách bài kiểm tra
   */
  const getExamsByCourse = (courseId) =>
    useQuery({
      queryKey: ['examsByCourse', courseId],
      queryFn: () => fetchExamsByCourse(courseId),
      enabled: !!courseId,
    });

  /**
   * Hook lấy danh sách câu hỏi của một bài kiểm tra
   * @param {string} examId - ID của bài kiểm tra
   * @returns {object} - Query object chứa danh sách câu hỏi
   */
  const getQuestionsByExam = (examId) =>
    useQuery({
      queryKey: ['questionsByExam', examId],
      queryFn: async () => fetchQuestionsByExam(examId),
      enabled: !!examId,
    });

  /**
   * Hook lấy thông tin chi tiết của một bài kiểm tra
   * @param {string} examId - ID của bài kiểm tra
   * @returns {object} - Query object chứa thông tin chi tiết bài kiểm tra
   */
  const getExamById = (examId) =>
    useQuery({
      queryKey: ['examById', examId],
      queryFn: () => fetchExamById(examId),
      enabled: !!examId,
    });

  return { useCreateExam,
      useCreateQuestion,
      useUpdateQuestion, 
      useDeleteQuestion,
      getActiveExamsByTeacher,
      getExamsByCourse,
      getQuestionsByExam,
      getExamById };
};

export default useAssignmentService;
