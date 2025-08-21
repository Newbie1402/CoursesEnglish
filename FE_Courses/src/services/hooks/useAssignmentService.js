import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

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

// API lấy danh sách bài kiểm tra của một khóa học
const fetchExamsByCourse = async (courseId) => {
  const response = await axios.get(`${BASE_URL}/api/exams/course/${courseId}`);
  return response.data.data; // Trả về danh sách bài kiểm tra
};

const useAssignmentService = () => {
  const queryClient = useQueryClient();

  // Hook tạo bài kiểm tra
  const useCreateExam = () => {
    return useMutation({
      mutationFn: createExamApi,
      onSuccess: () => {
        queryClient.invalidateQueries(['exams']);
      },
    });
  };

  // Hook tạo câu hỏi
  const useCreateQuestion = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createQuestion = async (data) => {
      setLoading(true);
      setError(null);
      try {
        const response = await createQuestionApi(data);
        setLoading(false);
        return response;
      } catch (err) {
        setError(err);
        setLoading(false);
        throw err;
      }
    };

    return { createQuestion, loading, error };
  };

  // Hook lấy danh sách bài kiểm tra đang hoạt động của giáo viên
  const getActiveExamsByTeacher = (teacherId) =>
    useQuery({
      queryKey: ['activeExams', teacherId],
      queryFn: () => fetchActiveExamsByTeacher(teacherId),
      enabled: !!teacherId,
    });

  // Hook lấy danh sách bài kiểm tra của một khóa học
  const getExamsByCourse = (courseId) =>
    useQuery({
      queryKey: ['examsByCourse', courseId],
      queryFn: () => fetchExamsByCourse(courseId),
      enabled: !!courseId,
    });

  return { useCreateExam, useCreateQuestion, getActiveExamsByTeacher, getExamsByCourse };
};

export default useAssignmentService;
