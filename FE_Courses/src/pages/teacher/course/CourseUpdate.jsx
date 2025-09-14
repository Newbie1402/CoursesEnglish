import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  FaBook,
  FaFileAlt,
  FaLaptop,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaSave,
  FaTimes,
  FaEdit,
  FaExclamationCircle,
  FaSpinner
} from 'react-icons/fa';
import { updateCourse as updateCourseApi } from '@/services/hooks/courseService.js';
import Modal from '@/components/ui/modal/Modal.jsx';
import { useToast } from '@/components/ui/toast/Toast.jsx';

const courseSchema = z.object({
  title: z.string().min(3, 'Tên khóa học phải có ít nhất 3 ký tự'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  online: z.boolean(),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  teacherId: z.number().min(1, 'Vui lòng nhập ID giảng viên')
});

const CourseUpdate = ({ open, onClose, course, onSuccess }) => {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: course ? {
      title: course.title,
      description: course.description,
      online: course.online,
      startDate: course.startDate,
      endDate: course.endDate,
      teacherId: course.teacherId
    } : undefined
  });

  React.useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        description: course.description,
        online: course.online,
        startDate: course.startDate,
        endDate: course.endDate,
        teacherId: course.teacherId
      });
    }
  }, [course]);

  const handleSubmit = async (data) => {
    try {
      setIsLoading(true);
      const payload = { ...data, teacherId: Number(data.teacherId), online: Boolean(data.online) };
      const res = await updateCourseApi({ courseId: course.courseId, data: payload });
      const statusCode = res?.statusCode ?? res?.status ?? 200;
      if (res && (statusCode === 200 || statusCode === 0)) {
        addToast('Cập nhật khóa học thành công!', 'success');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        addToast('Cập nhật thất bại!', 'error');
      }
    } catch (e) {
      addToast('Cập nhật thất bại!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl mx-auto overflow-hidden">
        {/* Header với gradient background */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaEdit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Cập nhật khóa học</h2>
                  <p className="text-blue-100 text-sm">Chỉnh sửa thông tin khóa học của bạn</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...form.register('title')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder="Nhập tên khóa học..."
                    />
                    {form.formState.errors.title && (
                      <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                        <FaExclamationCircle className="w-4 h-4" />
                        <span>{form.formState.errors.title.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <FaFileAlt className="w-4 h-4 text-blue-500" />
                    Mô tả khóa học
                  </label>
                  <div className="relative">
                    <textarea
                      {...form.register('description')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm resize-none"
                      placeholder="Nhập mô tả chi ti��t về khóa học..."
                    />
                    {form.formState.errors.description && (
                      <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                        <FaExclamationCircle className="w-4 h-4" />
                        <span>{form.formState.errors.description.message}</span>
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
                      {...form.register('online')}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      form.watch('online') 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                        : 'bg-gray-300'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-200 ${
                        form.watch('online') ? 'translate-x-6' : 'translate-x-0.5'
                      } translate-y-0.5`}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {form.watch('online') ? <FaLaptop className="w-4 h-4 text-blue-500" /> : <FaMapMarkerAlt className="w-4 h-4 text-gray-500" />}
                    <span className="text-sm font-medium text-gray-700">
                      {form.watch('online') ? 'Học trực tuyến' : 'Học tại lớp'}
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
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...form.register('startDate')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    />
                    {form.formState.errors.startDate && (
                      <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                        <FaExclamationCircle className="w-4 h-4" />
                        <span>{form.formState.errors.startDate.message}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <FaCalendarAlt className="w-4 h-4 text-green-500" />
                    Ngày kết thúc
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...form.register('endDate')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    />
                    {form.formState.errors.endDate && (
                      <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                        <FaExclamationCircle className="w-4 h-4" />
                        <span>{form.formState.errors.endDate.message}</span>
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

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <FaUser className="w-4 h-4 text-purple-500" />
                  ID Giảng viên
                </label>
                <input
                  type="number"
                  {...form.register('teacherId')}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <FaExclamationCircle className="w-3 h-3" />
                  ID giảng viên không thể thay đổi
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                disabled={isLoading}
              >
                <FaTimes className="w-4 h-4" />
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium shadow-lg"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default CourseUpdate;
