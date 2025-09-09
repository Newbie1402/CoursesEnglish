import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAssignmentService from '../../../services/hooks/useAssignmentService';
import useCourseService from '../../../services/hooks/useCourseService';
import { useToast } from '@/components/ui/toast/Toast';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input/Input';
import { Select } from '@/components/ui/select/Select';
import { Button } from '@/components/ui/button/Button';
import { Textarea } from '@/components/ui/textarea/Textarea';
import LoadingSpinner from '@/components/ui/loading/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card/Card';
import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  CalendarClock,
  Timer,
  FileText,
  Shield,
  ArrowLeft,
  BookOpen,
  Users,
  Clock,
  Settings,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tên bài kiểm tra'),
  type: z.string().min(1, 'Vui lòng chọn loại bài kiểm tra'),
  courseId: z.string().min(1, 'Vui lòng chọn khóa học'),
  startTime: z.string().min(1, 'Vui lòng chọn thời gian bắt đầu'),
  endTime: z.string().min(1, 'Vui lòng chọn thời gian kết thúc'),
  durationMinutes: z.coerce.number().min(1, 'Vui lòng nhập thời lượng'),
  description: z.string().optional(),
  password: z.string().optional(),
});

const AssignmentCreate = () => {
  const { useCreateExam } = useAssignmentService();
  const createExamMutation = useCreateExam();
  const { getCourseList } = useCourseService();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const teacherId = localStorage.getItem('teacherId');
  const { data: courses = [], isLoading: coursesLoading, isError: coursesError } = getCourseList(teacherId);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const nowLocal = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0,16);
  }, []);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { startTime: '', endTime: '', description: '', password: '' }
  });

  const startTimeValue = watch('startTime');

  const onSubmit = async (data) => {
    try {
      const examData = { ...data, courseId: Number(data.courseId) };
      const response = await createExamMutation.mutateAsync(examData);
      addToast(response.message || 'Tạo bài kiểm tra thành công', 'success');
      navigate(`/teacher/assignments/${response.data.examId}/add-questions`);
    } catch (error) {
      addToast('Tạo bài kiểm tra thất bại!', 'error');
      console.log(error);
    }
  };

  const fieldWrapper = 'space-y-2';
  const labelStyle = 'flex items-center gap-2 text-sm font-semibold text-gray-700';
  const helpTextStyle = 'text-xs text-gray-500 leading-relaxed';
  const errorText = (err) => err && (
    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
      <AlertCircle className="w-3 h-3" />
      {err.message}
    </div>
  );

  // Steps for visual progress
  const steps = [
    { id: 1, name: 'Thông tin cơ bản', icon: BookOpen, completed: false },
    { id: 2, name: 'Thiết lập thời gian', icon: Clock, completed: false },
    { id: 3, name: 'Mô tả & Cài đặt', icon: Settings, completed: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header với breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Quay lại
              </Button>
              <div className="h-4 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">Tạo bài kiểm tra mới</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              Giảng viên
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'bg-white border-blue-300 text-blue-600 shadow-sm'
                  }`}>
                    {step.completed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-600 mt-2 text-center">
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-px bg-gray-300 mx-4 mt-6" />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
          {/* Bước 1: Thông tin cơ bản */}
          <Card className="overflow-hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Thông tin cơ bản</CardTitle>
                  <CardDescription className="text-blue-100">
                    Thiết lập thông tin chính cho bài kiểm tra
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={fieldWrapper}>
                  <label className={labelStyle}>
                    <FileText className="w-4 h-4 text-blue-600" />
                    Tên bài kiểm tra
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('title')}
                    placeholder="VD: Kiểm tra giữa kỳ môn Tiếng Anh"
                    error={!!errors.title}
                    className="h-12 text-base"
                  />
                  <p className={helpTextStyle}>Tên sẽ hiển thị cho học viên khi tham gia kiểm tra</p>
                  {errorText(errors.title)}
                </div>

                <div className={fieldWrapper}>
                  <label className={labelStyle}>
                    <Settings className="w-4 h-4 text-purple-600" />
                    Loại bài kiểm tra
                    <span className="text-red-500">*</span>
                  </label>
                  <Select {...register('type')} className={`h-12 text-base ${errors.type ? 'border-red-500' : ''}`}>
                    <option value="">-- Chọn loại bài kiểm tra --</option>
                    <option value="MULTIPLE_CHOICE">📝 Trắc nghiệm</option>
                    <option value="WRITING">✍️ Tự luận</option>
                  </Select>
                  <p className={helpTextStyle}>Chọn định dạng câu hỏi chính cho bài kiểm tra</p>
                  {errorText(errors.type)}
                </div>

                <div className={fieldWrapper}>
                  <label className={labelStyle}>
                    <BookOpen className="w-4 h-4 text-green-600" />
                    Khóa học
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    {...register('courseId')}
                    disabled={coursesLoading || coursesError}
                    className={`h-12 text-base ${errors.courseId ? 'border-red-500' : ''}`}
                  >
                    <option value="">{coursesLoading ? '🔄 Đang tải khóa học...' : '-- Chọn khóa học --'}</option>
                    {!coursesLoading && !coursesError && courses.map((course) => (
                      <option key={course.courseId} value={course.courseId}>
                        📚 {course.title}
                      </option>
                    ))}
                  </Select>
                  {coursesError && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      Lỗi tải danh sách khóa học. Vui lòng thử lại sau.
                    </div>
                  )}
                  {(!coursesLoading && !coursesError && courses.length === 0) && (
                    <div className="flex items-center gap-1 text-amber-600 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" />
                      Bạn chưa có khóa học nào. Hãy tạo khóa học trước.
                    </div>
                  )}
                  {errorText(errors.courseId)}
                </div>

                <div className={fieldWrapper}>
                  <label className={labelStyle}>
                    <Timer className="w-4 h-4 text-orange-600" />
                    Thời lượng làm bài (phút)
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    {...register('durationMinutes', { valueAsNumber: true })}
                    error={!!errors.durationMinutes}
                    placeholder="VD: 45"
                    className="h-12 text-base"
                  />
                  <p className={helpTextStyle}>Tổng thời gian học viên có để hoàn thành bài kiểm tra</p>
                  {errorText(errors.durationMinutes)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bước 2: Thiết lập thời gian */}
          <Card className="overflow-hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Thiết lập thời gian</CardTitle>
                  <CardDescription className="text-green-100">
                    Xác định khung thời gian mở bài kiểm tra
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={fieldWrapper}>
                  <label className={labelStyle}>
                    <CalendarClock className="w-4 h-4 text-blue-600" />
                    Thời gian bắt đầu
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    min={nowLocal}
                    {...register('startTime')}
                    error={!!errors.startTime}
                    className="h-12 text-base"
                  />
                  <p className={helpTextStyle}>Thời điểm học viên có thể bắt đầu làm bài kiểm tra</p>
                  {errorText(errors.startTime)}
                </div>

                <div className={fieldWrapper}>
                  <label className={labelStyle}>
                    <CalendarClock className="w-4 h-4 text-red-600" />
                    Thời gian kết thúc
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    min={startTimeValue || nowLocal}
                    {...register('endTime')}
                    error={!!errors.endTime}
                    className="h-12 text-base"
                  />
                  <p className={helpTextStyle}>Sau thời điểm này học viên không thể vào làm bài</p>
                  {errorText(errors.endTime)}
                </div>
              </div>

              {/* Time Visualization */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Khung thời gian</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Học viên có thể làm bài trong khoảng thời gian được thiết lập
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bước 3: Mô tả & Cài đặt nâng cao */}
          <Card className="overflow-hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Mô tả & Cài đặt</CardTitle>
                  <CardDescription className="text-purple-100">
                    Thêm hướng dẫn và tùy chọn bảo mật
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className={fieldWrapper}>
                <label className={labelStyle}>
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Mô tả / Hướng dẫn cho học viên
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <Textarea
                    className="pl-10 min-h-[120px] text-base leading-relaxed"
                    {...register('description')}
                    placeholder="Nhập hướng dẫn làm bài, phạm vi kiến thức, quy tắc, lưu ý đặc biệt..."
                  />
                </div>
                <p className={helpTextStyle}>
                  Thông tin này sẽ hiển thị cho học viên trước khi bắt đầu làm bài
                </p>
              </div>

              {/* Advanced Options */}
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(v => !v)}
                  className="group flex items-center gap-2 text-base font-semibold text-purple-700 hover:text-purple-900 transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span>Tùy chọn bảo mật nâng cao</span>
                  {showAdvanced ? (
                    <ChevronUp className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
                  ) : (
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-[2px] transition-transform" />
                  )}
                </button>

                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  showAdvanced ? 'mt-6 max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  {showAdvanced && (
                    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className={fieldWrapper}>
                          <label className={labelStyle}>
                            <Lock className="w-4 h-4 text-purple-600" />
                            Mật khẩu truy cập (tùy chọn)
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input
                              className="pl-10 h-12 text-base"
                              {...register('password')}
                              placeholder="Nhập mật khẩu nếu muốn kiểm soát truy cập"
                              type="password"
                            />
                          </div>
                          <p className={helpTextStyle}>
                            Chỉ những người có mật khẩu mới có thể tham gia bài kiểm tra
                          </p>
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="text-center p-6 bg-white/80 rounded-xl shadow-sm border border-purple-200">
                            <Shield className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-gray-900 mb-1">Bảo mật cao</p>
                            <p className="text-xs text-gray-600">
                              Kiểm soát truy cập với mật khẩu
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="shadow-xl border-0 bg-gradient-to-r from-gray-50 to-gray-100">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-3 order-2 sm:order-1">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    disabled={createExamMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Hủy bỏ
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                    disabled={createExamMutation.isPending}
                  >
                    🔄 Làm mới
                  </Button>
                </div>

                <div className="order-1 sm:order-2">
                  <Button
                    type="submit"
                    disabled={createExamMutation.isPending}
                    className="min-w-[200px] h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {createExamMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" color="text-white" />
                        Đang tạo...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <PlusCircle className="w-5 h-5" />
                        Tạo bài kiểm tra
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default AssignmentCreate;

