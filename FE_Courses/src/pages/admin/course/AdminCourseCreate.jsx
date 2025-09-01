import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaBook,
  FaFileAlt,
  FaLaptop,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaSave,
  FaTimes,
  FaPlus,
  FaExclamationCircle,
  FaSpinner,
  FaArrowLeft,
  FaGraduationCap
} from 'react-icons/fa';
import useCourseService from '@/services/hooks/useCourseService.js';
import { useToast } from '@/components/ui/toast/Toast.jsx';
import { getAllTeacher } from '@/services/hooks/teacherService.js';
import ScheduleSelector from '@/components/ui/schedule/ScheduleSelector';

const courseSchema = z.object({
  title: z.string().min(3, 'Tên khóa học phải có ít nhất 3 ký tự'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  online: z.boolean(),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  teacherId: z.number().min(1, 'Vui lòng chọn giảng viên'),
  schedules: z
    .array(
      z.object({
        dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
        timeSlot: z.enum(['SLOT_1', 'SLOT_2', 'SLOT_3', 'SLOT_4', 'SLOT_5', 'SLOT_6'])
      })
    )
    .min(1, 'Vui lòng chọn ít nhất 1 lịch học')
    .max(3, 'Chỉ được chọn tối đa 3 lịch học')
});

const AdminCourseCreate = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(courseId);

  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [schedules, setSchedules] = useState([]);

  const defaultValues = {
    title: '',
    description: '',
    online: true,
    startDate: '',
    endDate: '',
    teacherId: '',
    schedules: []
  };

  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      ...defaultValues,
      teacherId: Number(defaultValues.teacherId) // Đảm bảo teacherId luôn là kiểu number
    }
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = form;

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      const allTeachers = await getAllTeacher();
      setTeachers(allTeachers);
      setLoadingTeachers(false);
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    setValue('schedules', schedules);
  }, [schedules, setValue]);

  const { createCourse } = useCourseService();
  const { addToast } = useToast();

  const { mutate: createCourseMutate, isLoading, isError, error } = createCourse;

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      teacherId: Number(data.teacherId),
      schedules: data.schedules.map(schedule => ({
        dayOfWeek: schedule.dayOfWeek,
        timeSlot: schedule.timeSlot
      }))
    };
    createCourseMutate(payload, {
      onSuccess: () => {
        addToast('Tạo khóa học thành công!', 'success');
        navigate('/admin/courses');
      }
    });
  };

  const handleTeacherChange = (event) => {
    const selectedTeacherId = Number(event.target.value); // Chuyển đổi giá trị thành số
    setValue('teacherId', selectedTeacherId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Back button and breadcrumb */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/admin/courses')}
              className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors duration-200"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span className="font-medium">Quay lại</span>
            </button>
            <div className="flex items-center gap-2 text-blue-100">
              <FaGraduationCap className="w-4 h-4" />
              <span>Khóa học</span>
              <span>/</span>
              <span className="text-white font-medium">Tạo mới</span>
            </div>
          </div>

          {/* Header content */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FaPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {isEditing ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
              </h1>
              <p className="text-blue-100 text-lg">
                {isEditing ? 'Cập nhật thông tin khóa học của bạn' : 'Tạo một khóa học mới để chia sẻ kiến thức'}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            {/* Course Basic Info Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FaBook className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Thông tin cơ bản</h3>
              </div>

              <div className="space-y-6">
                {/* Course Title */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <FaBook className="w-4 h-4 text-blue-500" />
                    Tên khóa học
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('title')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="Nhập tên khóa học..."
                    />
                    {errors.title && (
                      <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                        <FaExclamationCircle className="w-4 h-4" />
                        <span>{errors.title.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <FaFileAlt className="w-4 h-4 text-blue-500" />
                    Mô tả khóa học
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      {...register('description')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none"
                      placeholder="Nhập mô tả chi tiết về khóa học..."
                    />
                    {errors.description && (
                      <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                        <FaExclamationCircle className="w-4 h-4" />
                        <span>{errors.description.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Course Settings Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <FaLaptop className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Cài đặt khóa học</h3>
              </div>

              {/* Online Mode Toggle */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      {...register('online')}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      watch('online') 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                        : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-200 ${
                        watch('online') ? 'translate-x-6' : 'translate-x-0.5'
                      } translate-y-0.5`}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {watch('online') ? <FaLaptop className="w-4 h-4 text-blue-500" /> : <FaMapMarkerAlt className="w-4 h-4 text-gray-500" />}
                    <span className="text-sm font-medium text-gray-700">
                      {watch('online') ? 'Học trực tuyến' : 'Học tại lớp'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <FaCalendarAlt className="w-4 h-4 text-green-500" />
                    Ngày bắt đầu
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...register('startDate')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    />
                    {errors.startDate && (
                      <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                        <FaExclamationCircle className="w-4 h-4" />
                        <span>{errors.startDate.message}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <FaCalendarAlt className="w-4 h-4 text-green-500" />
                    Ngày kết thúc
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...register('endDate')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    />
                    {errors.endDate && (
                      <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                        <FaExclamationCircle className="w-4 h-4" />
                        <span>{errors.endDate.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Info Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaUser className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Thông tin giảng viên</h3>
              </div>

              {/* Dropdown to select teacher */}
              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <FaUser className="w-4 h-4 text-purple-500" />
                  Chọn giảng viên
                  <span className="text-red-500">*</span>
                </label>
                {loadingTeachers ? (
                  <p className="text-sm text-gray-500">Đang tải danh sách giảng viên...</p>
                ) : (
                  <select
                    id="teacherId"
                    value={watch('teacherId')} // Đồng bộ giá trị với form
                    onChange={handleTeacherChange} // Xử lý sự kiện thay đổi
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">-- Chọn giảng viên --</option>
                    {teachers.map(teacher => (
                      <option key={teacher.teacherId} value={teacher.teacherId}>
                        {teacher.fullName}
                      </option>
                    ))}
                  </select>
                )}
                {errors.teacherId && (
                  <p className="mt-2 text-sm text-red-600">{errors.teacherId.message}</p>
                )}
              </div>
            </div>

            {/* Schedule Selector Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <FaCalendarAlt className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Chọn lịch học</h3>
              </div>

              <ScheduleSelector
                schedules={schedules}
                setSchedules={setSchedules}
                errors={errors}
              />
            </div>

            {/* Error Display */}
            {isError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-600">
                  <FaExclamationCircle className="w-5 h-5" />
                  <span className="font-medium">Có lỗi xảy ra</span>
                </div>
                <p className="text-red-600 text-sm mt-1">
                  {error?.message || 'Không thể tạo khóa học. Vui lòng thử lại sau.'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/admin/courses')}
                disabled={isLoading || isSubmitting}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTimes className="w-4 h-4" />
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium shadow-lg"
              >
                {isLoading || isSubmitting ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    {isEditing ? 'Cập nhật' : 'Tạo khóa học'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseCreate;