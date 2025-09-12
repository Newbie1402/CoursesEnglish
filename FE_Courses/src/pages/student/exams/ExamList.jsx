import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAssignmentOfCourses } from "@/services/hooks/assignmentService";
import { getSubmissionsList } from "@/services/hooks/submissionService";
import { useAuth } from "@/contexts/AuthContext.jsx";
import ExamCard from "../../../components/student/ExamCard";
import {
  BookOpen,
  PenTool,
  Loader2,
  AlertCircle,
  GraduationCap,
  Trophy,
  Target
} from 'lucide-react';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const courseId = id;
  const { studentId } = useAuth();
  const [examStatuses, setExamStatuses] = useState({}); // { [examId]: 'not_started' | 'in_progress' | 'submitted' }
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await getAssignmentOfCourses(courseId);
        setExams(data);
      } catch (err) {
        console.error("Failed to load exams", err);
        setError('Không thể tải danh sách bài kiểm tra');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [courseId]);

  useEffect(() => {
    if (!exams.length) return;
    if (!studentId) return; // chưa xác định sinh viên
    let ignore = false;
    const loadStatuses = async () => {
      setLoadingStatuses(true);
      const statusMap = {};
      try {
        // Duyệt từng exam -> gọi submissions (có thể tối ưu backend bằng 1 endpoint tổng hợp)
        await Promise.all(
          exams.map(async (ex) => {
            try {
              const subs = await getSubmissionsList(ex.examId);
              const mine = subs.filter((s) => String(s.studentId) === String(studentId));
              if (!mine.length) {
                statusMap[ex.examId] = "not_started";
                return;
              }
              const inProgress = mine.find((s) => !s.submittedAt);
              if (inProgress) {
                statusMap[ex.examId] = "in_progress";
                return;
              }
              // Có ít nhất 1 bài đã nộp
              statusMap[ex.examId] = "submitted";
            } catch (e) {
              console.error("Load submissions failed for exam", ex.examId, e);
              statusMap[ex.examId] = "not_started";
            }
          })
        );
      } finally {
        if (!ignore) {
          setExamStatuses(statusMap);
          setLoadingStatuses(false);
        }
      }
    };
    loadStatuses();
    return () => {
      ignore = true;
    };
  }, [exams, studentId]);

  const handleExamClick = (examId) => {
    navigate(`/student/exams/${examId}`);
  };

  // Skeleton Loading Component
  const SkeletonCard = () => (
    <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-6 animate-pulse shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-3 w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-2 w-1/2"></div>
        </div>
        <div className="h-6 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
      </div>
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
      </div>
      <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-full"></div>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="text-center py-16 px-6">
      <div className="relative mb-8">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 animate-pulse"></div>
          <BookOpen className="w-16 h-16 text-indigo-500 relative z-10" />
        </div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md mx-auto">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          Chưa có bài kiểm tra nào
        </h3>
        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          Hiện tại khóa học này chưa có bài kiểm tra nào được giao.
          Hãy kiểm tra lại sau hoặc liên hệ gi��ng viên để biết thêm thông tin.
        </p>

        <div className="flex items-center justify-center gap-2 text-indigo-600 bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-200">
          <GraduationCap className="w-5 h-5" />
          <span className="font-medium">Chờ cập nhật từ giảng viên</span>
        </div>
      </div>
    </div>
  );

  // Error State Component
  const ErrorState = () => (
    <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-8 text-center shadow-lg">
      <div className="relative mb-6">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-red-800 mb-3">Có lỗi xảy ra</h3>
      <p className="text-red-600 mb-6 leading-relaxed">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
      >
        <Loader2 className="w-4 h-4" />
        Thử lại
      </button>
    </div>
  );

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Header Skeleton */}
          <div className="animate-pulse">
            <div className="h-48 bg-gradient-to-r from-indigo-200/50 to-purple-200/50 rounded-3xl shadow-xl"></div>
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 backdrop-blur-sm"></div>

          <div className="relative backdrop-blur-sm bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="group relative">
                  <div className="w-20 h-20 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110">
                    <PenTool className="w-10 h-10 text-indigo-600 transition-transform duration-300 group-hover:rotate-12" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <Trophy className="w-3 h-3 text-white" />
                  </div>
                </div>

                <div className="text-white">
                  <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Danh sách bài kiểm tra
                  </h1>
                  <p className="text-blue-100/90 text-lg leading-relaxed max-w-md">
                    Thực hiện các bài kiểm tra và theo dõi kết quả học tập của bạn
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                      <Target className="w-4 h-4" />
                      <span>Tổng cộng: {exams.length} bài thi</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block text-right text-white">
                <div className="bg-white/20 backdrop-blur rounded-2xl p-6 border border-white/30">
                  <div className="text-sm text-blue-100 mb-2">Tiến độ hoàn thành</div>
                  <div className="text-3xl font-bold mb-2">{exams.length}</div>
                  <div className="text-sm text-blue-200">bài kiểm tra</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-200/20 to-indigo-200/20 rounded-full blur-3xl -z-10"></div>

          {/* Error State */}
          {error && <ErrorState />}

          {/* Empty State */}
          {!loading && !error && exams.length === 0 && <EmptyState />}

          {/* Exam Cards Grid */}
          {!error && exams.length > 0 && (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Bài kiểm tra khả dụng</h2>
                  <p className="text-gray-600">Nhấn vào bài kiểm tra để bắt đầu làm bài</p>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-transparent"></div>
              </div>

              {/* Cards Grid with enhanced spacing */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {exams.map((e) => (
                  <div
                    key={e.examId}
                    className="group relative transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Subtle glow effect on hover */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all duration-300"></div>

                    {/* Enhanced ExamCard wrapper */}
                    <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      <ExamCard
                        exam={e}
                        onStart={handleExamClick}
                        studentStatus={examStatuses[e.examId]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading Status Indicator */}
        {loadingStatuses && exams.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="text-gray-700 font-medium">Đang cập nhật trạng thái...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamList;
