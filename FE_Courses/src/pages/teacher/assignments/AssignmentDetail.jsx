import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAssignmentService from '@/services/hooks/useAssignmentService';
import LoadingSpinner from '@/components/ui/loading/LoadingSpinner';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Select } from '@/components/ui/select/Select';
import AssignmentUpdateQuestions from './AssignmentUpdateQuestions';
import { useToast } from '@/components/ui/toast/Toast';
import Modal from '@/components/ui/modal/Modal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card/Card';
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaPlus,
  FaQuestionCircle,
  FaClock,
  FaCalendarAlt,
  FaUsers,
  FaClipboardList,
  FaPlay,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaSort,
  FaEye,
  FaFileAlt,
  FaChartBar,
  FaTasks,
  FaGraduationCap,
  FaBookOpen,
  FaLayerGroup
} from 'react-icons/fa';
import { cn } from '@/lib/utils';

const AssignmentDetail = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { getExamById, getQuestionsByExam, useDeleteQuestion } = useAssignmentService();
  const { addToast } = useToast();

  const { data: exam, isLoading: loadingExam } = getExamById(examId);
  const { data: questions = [], isLoading: loadingQuestions } = getQuestionsByExam(examId);

  const deleteQuestionMutation = useDeleteQuestion();
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [questionToUpdate, setQuestionToUpdate] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isBulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // New UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('order');

  // Get assignment status based on current time
  const getAssignmentStatus = (startDate, dueDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const due = new Date(dueDate);

    if (now < start) return 'upcoming';
    if (now >= start && now <= due) return 'active';
    return 'ended';
  };

  // Get status display info
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'upcoming':
        return {
          label: 'Sắp diễn ra',
          icon: FaClock,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      case 'active':
        return {
          label: 'Đang diễn ra',
          icon: FaPlay,
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'ended':
        return {
          label: 'Kết thúc',
          icon: FaCheckCircle,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          label: 'Không xác định',
          icon: FaExclamationTriangle,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions.filter(question => {
      const matchesSearch = question.content?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || question.type === filterType;
      return matchesSearch && matchesType;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'order':
          return (a.id || 0) - (b.id || 0);
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        case 'score':
          return (b.maxScore || 0) - (a.maxScore || 0);
        default:
          return 0;
      }
    });
  }, [questions, searchTerm, filterType, sortBy]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = questions.length;
    const multipleChoice = questions.filter(q => q.type === 'MULTIPLE_CHOICE').length;
    const writing = questions.filter(q => q.type === 'ESSAY').length;
    const totalScore = questions.reduce((sum, q) => sum + (q.maxScore || 0), 0);

    return { total, multipleChoice, writing, totalScore };
  }, [questions]);

  // Event handlers
  const openUpdateModal = (question) => {
    setQuestionToUpdate(question);
    setUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setQuestionToUpdate(null);
  };

  const openDeleteModal = (question) => {
    setQuestionToDelete(question);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setQuestionToDelete(null);
  };

  const confirmDeleteQuestion = () => {
    if (questionToDelete) {
      handleDeleteQuestion(questionToDelete.id);
      closeDeleteModal();
    }
  };

  const handleDeleteQuestion = (questionId) => {
    deleteQuestionMutation.mutate(questionId, {
      onSuccess: () => {
        addToast('Xóa câu hỏi thành công!', 'success');
      },
      onError: () => {
        addToast('Xóa câu hỏi thất bại!', 'error');
      },
    });
  };

  const openBulkDeleteModal = () => {
    if (!questions || questions.length === 0) return;
    addToast('Cảnh báo: Hành động sẽ xóa TẤT CẢ câu hỏi. Vui lòng xác nhận!', 'warning');
    setBulkDeleteModalOpen(true);
  };

  const closeBulkDeleteModal = () => setBulkDeleteModalOpen(false);

  const handleBulkDelete = async () => {
    if (!questions || questions.length === 0) return;
    setBulkDeleting(true);
    try {
      for (const q of questions) {
        await new Promise((resolve, reject) => {
          deleteQuestionMutation.mutate(q.id, {
            onSuccess: () => resolve(),
            onError: (e) => reject(e)
          });
        });
      }
      addToast(`Đã xóa ${questions.length} câu hỏi thành công`, 'success');
    } catch (e) {
      console.error(e);
      addToast('Có lỗi khi xóa hàng loạt', 'error');
    } finally {
      setBulkDeleting(false);
      closeBulkDeleteModal();
    }
  };

  // Loading states
  if (loadingExam || loadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-pulse">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
              <div className="h-8 bg-gray-300 rounded w-48"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="h-8 bg-gray-300 rounded w-12"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <FaExclamationTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy bài kiểm tra
            </h3>
            <p className="text-gray-600 mb-6">
              Bài kiểm tra này có thể đã bị xóa hoặc bạn không có quyền truy cập.
            </p>
            <Button onClick={() => navigate(-1)} className="w-full">
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getAssignmentStatus(exam.startTime, exam.endTime);
  const statusInfo = getStatusDisplay(status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Assignment Info */}
        <Card className="overflow-hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-0">
            {/* Top Bar */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="text-white hover:bg-white/10 border border-white/20"
                  >
                    <FaArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                  <div className="h-6 w-px bg-white/30" />
                  <h1 className="text-2xl font-bold">Chi tiết bài kiểm tra</h1>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border",
                  statusInfo.bgColor.replace('bg-', 'bg-white/20 '),
                  "text-white border-white/30"
                )}>
                  <statusInfo.icon className="w-4 h-4" />
                  {statusInfo.label}
                </div>
              </div>
            </div>

            {/* Main Info */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {exam.title}
                  </h2>
                  {exam.description && (
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                      {exam.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FaClipboardList className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Loại bài kiểm tra</p>
                          <p className="font-medium">
                            {exam.type === 'MULTIPLE_CHOICE' ? '📝 Trắc nghiệm' : '✍️ Tự luận'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FaClock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Thời lượng</p>
                          <p className="font-medium">{exam.durationMinutes || 60} phút</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FaCalendarAlt className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Thời gian bắt đầu</p>
                          <p className="font-medium">
                            {new Date(exam.startTime).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <FaCalendarAlt className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Hạn kết thúc</p>
                          <p className="font-medium">
                            {new Date(exam.endTime).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:border-l lg:border-gray-200 lg:pl-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={() => navigate(`/teacher/assignments/${examId}/add-questions`)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <FaPlus className="w-4 h-4" />
                      Thêm câu hỏi
                    </Button>

                    <Button
                      onClick={() => navigate(`/teacher/assignments/${examId}/submissions`)}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <FaEye className="w-4 h-4" />
                      Xem bài nộp
                    </Button>

                    {questions.length > 0 && (
                      <Button
                        onClick={openBulkDeleteModal}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <FaTrash className="w-4 h-4" />
                        Xóa tất cả câu hỏi
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Tổng câu hỏi</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                  <FaQuestionCircle className="text-blue-700 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Trắc nghiệm</p>
                  <p className="text-3xl font-bold text-green-900">{stats.multipleChoice}</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                  <FaLayerGroup className="text-green-700 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Tự luận</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.writing}</p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
                  <FaFileAlt className="text-purple-700 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Điểm số tối đa</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {stats.totalScore}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center">
                  <FaChartBar className="text-orange-700 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions Management */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FaTasks className="w-5 h-5 text-indigo-600" />
                  Danh sách câu hỏi
                </CardTitle>
                <CardDescription>
                  Quản lý và chỉnh sửa các câu hỏi trong bài kiểm tra
                </CardDescription>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm câu hỏi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="min-w-[140px]"
                >
                  <option value="all">Tất cả loại</option>
                  <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                  <option value="WRITING">Tự luận</option>
                </Select>

                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="min-w-[140px]"
                >
                  <option value="order">Thứ tự</option>
                  <option value="type">Loại câu hỏi</option>
                  <option value="score">Điểm số tối đa</option>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {filteredAndSortedQuestions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaQuestionCircle className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {questions.length === 0 ? 'Chưa có câu hỏi nào' : 'Không tìm thấy câu hỏi'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {questions.length === 0
                    ? 'Hãy thêm câu hỏi đầu tiên cho bài kiểm tra của bạn.'
                    : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                  }
                </p>
                {questions.length === 0 && (
                  <Button
                    onClick={() => navigate(`/teacher/assignments/${examId}/add-questions`)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Thêm câu hỏi đầu tiên
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredAndSortedQuestions.map((question, index) => (
                  <Card
                    key={question.id}
                    className="border border-gray-200 hover:shadow-md transition-all duration-200 group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              question.type === 'MULTIPLE_CHOICE'
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            )}>
                              {question.type === 'MULTIPLE_CHOICE' ? '📝 Trắc nghiệm' : '✍️ Tự luận'}
                            </div>

                            {/* Hiển thị điểm số tối đa */}
                            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                              <FaChartBar className="w-3 h-3" />
                              {question.maxScore || 0} điểm
                            </div>

                            {question.difficulty && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <FaChartBar className="w-3 h-3" />
                                Độ khó: {question.difficulty}/5
                              </div>
                            )}
                          </div>

                          <p className="text-gray-900 leading-relaxed mb-4">
                            {question.content}
                          </p>

                          {question.type === 'MULTIPLE_CHOICE' && question.options && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {question.options.map((option, idx) => {
                                const isCorrect = option === question.correctAnswer;
                                return (
                                  <div
                                    key={idx}
                                    className={cn(
                                      "p-2 rounded-lg text-sm border",
                                      isCorrect
                                        ? "bg-green-50 border-green-200 text-green-800"
                                        : "bg-gray-50 border-gray-200 text-gray-700"
                                    )}
                                  >
                                    <span className="font-medium">
                                      {String.fromCharCode(65 + idx)}.
                                    </span>{' '}
                                    {option}
                                    {isCorrect && (
                                      <FaCheckCircle className="inline w-3 h-3 ml-1 text-green-600" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUpdateModal(question)}
                            className="flex items-center gap-1"
                          >
                            <FaEdit className="w-3 h-3" />
                            Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDeleteModal(question)}
                            className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <FaTrash className="w-3 h-3" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update Modal */}
        {isUpdateModalOpen && questionToUpdate && (
          <Modal
            isOpen={isUpdateModalOpen}
            onClose={closeUpdateModal}
            title="Cập nhật câu hỏi"
            size="lg"
          >
            <AssignmentUpdateQuestions
              examId={examId}
              question={questionToUpdate}
              onClose={closeUpdateModal}
            />
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={closeDeleteModal}
            title="Xác nhận xóa câu hỏi"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <FaExclamationTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Bạn chắc chắn muốn xóa câu hỏi này?
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Hành động này không thể hoàn tác.
                  </p>
                </div>
              </div>

              {questionToDelete && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900 font-medium mb-2">Nội dung câu hỏi:</p>
                  <p className="text-sm text-gray-700">
                    {questionToDelete.content}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={closeDeleteModal}>
                  Hủy bỏ
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteQuestion}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <FaTrash className="w-4 h-4 mr-2" />
                  Xóa câu hỏi
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {isBulkDeleteModalOpen && (
          <Modal
            isOpen={isBulkDeleteModalOpen}
            onClose={bulkDeleting ? () => {} : closeBulkDeleteModal}
            title="Xác nhận xóa tất cả câu hỏi"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <FaExclamationTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Bạn chắc chắn muốn xóa <strong>tất cả {questions?.length || 0} câu hỏi</strong>?
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Thao tác này không thể hoàn tác.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Hậu quả:</h4>
                <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
                  <li>Mọi dữ liệu câu hỏi sẽ bị xóa vĩnh viễn</li>
                  <li>Điểm số liên quan (nếu có) có thể bị ảnh hưởng</li>
                  <li>Bài kiểm tra sẽ trở thành bài kiểm tra trống</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={closeBulkDeleteModal}
                  disabled={bulkDeleting}
                >
                  Hủy bỏ
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {bulkDeleting ? (
                    <>
                      <LoadingSpinner size="sm" color="text-white" />
                      <span className="ml-2">Đang xóa...</span>
                    </>
                  ) : (
                    <>
                      <FaTrash className="w-4 h-4 mr-2" />
                      Xóa tất cả
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetail;
