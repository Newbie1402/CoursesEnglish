import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  FaBook,
  FaFileUpload,
  FaGraduationCap,
  FaPlus,
  FaTimes,
  FaExclamationCircle,
  FaSpinner,
  FaCloudUploadAlt,
  FaFileAlt,
  FaCheck
} from 'react-icons/fa';
import Modal from '@/components/ui/modal/Modal';
import { useToast } from '@/components/ui/toast/Toast';
import useCourseService from '@/services/hooks/useCourseService';
import { createLessonApi } from '@/services/hooks/useLessonService';
import LoadingSpinner from '@/components/ui/loading/LoadingSpinner';

const lessonSchema = z.object({
  title: z.string().min(3, 'Tên bài học phải có ít nhất 3 ký tự'),
  file: z
    .any()
    .refine((file) => file && file.length === 1, 'Chỉ được chọn 1 file'),
  courseId: z.union([z.string(), z.number()]).refine(val => val && val !== '', 'Vui lòng chọn khóa học')
});

const LessonCreate = ({ open, onClose, courseId, onSuccess }) => {
  const [showSpinner, setShowSpinner] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const { addToast } = useToast();
  const { getCourseList } = useCourseService();
  const teacherId = localStorage.getItem('teacherId');
  const { data: courses = [], isLoading: isLoadingCourses } = getCourseList(teacherId);
  const form = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: { title: '', file: null, courseId: courseId || '' }
  });

  React.useEffect(() => {
    if (courseId) {
      form.setValue('courseId', courseId);
    }
  }, [courseId]);

  const handleSuccess = () => {
    setTimeout(() => {
      addToast('Thêm bài học thành công!', 'success');
      onClose();
      if (onSuccess) onSuccess();
    }, 400);
  };

  const handleError = () => {
    setTimeout(() => {
      addToast('Thêm bài học thất bại!', 'error');
      setShowSpinner(false);
    }, 400);
  };

  const handleCreateLesson = async (formData) => {
    setShowSpinner(true);
    try {
      await createLessonApi(formData);
      handleSuccess();
    } catch (error) {
      handleError();
    }
  };

  const handleSubmit = async (data) => {
    setShowSpinner(true);
    const file = data.file[0];
    try {
      await handleCreateLesson({ ...data, file, courseId: Number(data.courseId) });
    } finally {
      setTimeout(() => setShowSpinner(false), 400);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      form.setValue('file', e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      form.setValue('file', e.target.files);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl mx-auto overflow-hidden">
        {/* Header với gradient background */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Tạo bài học mới</h2>
                  <p className="text-emerald-100 text-sm">Thêm nội dung học tập cho khóa học của bạn</p>
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
        <div className="relative p-8">
          {showSpinner && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl">
              <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
                <LoadingSpinner size="lg" label="Đang tạo bài học..." />
                <div className="mt-4 text-center">
                  <p className="text-gray-600 text-sm">Vui lòng chờ trong giây lát...</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8" aria-disabled={showSpinner}>
            {/* Lesson Title Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FaBook className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Thông tin bài học</h3>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <FaBook className="w-4 h-4 text-blue-500" />
                  Tên bài học
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...form.register('title')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                    placeholder="Nhập tên bài học..."
                    disabled={showSpinner}
                  />
                  {form.formState.errors.title && (
                    <div className="flex items-center gap-2 mt-2 text-red-500 text-sm animate-shake">
                      <FaExclamationCircle className="w-4 h-4" />
                      <span>{form.formState.errors.title.message}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <FaFileUpload className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Tải lên file bài học</h3>
              </div>

              <Controller
                control={form.control}
                name="file"
                render={({ field }) => (
                  <div className="space-y-4">
                    {/* Drag & Drop Area */}
                    <div
                      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                        dragActive
                          ? 'border-emerald-500 bg-emerald-50 scale-105'
                          : selectedFile
                          ? 'border-emerald-400 bg-emerald-25'
                          : 'border-gray-300 bg-gray-50'
                      } ${showSpinner ? 'pointer-events-none opacity-50' : 'hover:border-emerald-400 hover:bg-emerald-25'}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={showSpinner}
                        onChange={handleFileSelect}
                      />

                      {selectedFile ? (
                        <div className="space-y-3">
                          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto">
                            <FaCheck className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-emerald-700 font-semibold">{selectedFile.name}</p>
                            <p className="text-emerald-600 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <p className="text-emerald-600 text-sm">File đã được chọn thành công!</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mx-auto">
                            <FaCloudUploadAlt className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-gray-700 font-semibold mb-1">Kéo thả file vào đây</p>
                            <p className="text-gray-500 text-sm">hoặc <span className="text-emerald-600 font-medium">nhấp để chọn file</span></p>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                            <FaFileAlt className="w-3 h-3" />
                            <span>PDF, DOC, DOCX, PPT, PPTX</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {form.formState.errors.file && (
                      <div className="flex items-center gap-2 text-red-500 text-sm animate-shake">
                        <FaExclamationCircle className="w-4 h-4" />
                        <span>{form.formState.errors.file.message}</span>
                      </div>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Course Selection Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaGraduationCap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Chọn khóa học</h3>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <FaGraduationCap className="w-4 h-4 text-purple-500" />
                  Khóa học
                </label>
                <div className="relative">
                  <select
                    {...form.register('courseId')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm appearance-none"
                    disabled={!!courseId || showSpinner}
                  >
                    <option value="">-- Chọn khóa học --</option>
                    {isLoadingCourses ? (
                      <option disabled>Đang tải...</option>
                    ) : (
                      courses.map((course) => (
                        <option key={course.courseId} value={course.courseId}>
                          {course.title}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {!!courseId && (
                    <div className="absolute inset-y-0 right-8 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </div>
                {courseId && (
                  <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                    <FaExclamationCircle className="w-3 h-3" />
                    Khóa học đã được chọn trước
                  </p>
                )}
                {form.formState.errors.courseId && (
                  <div className="flex items-center gap-2 mt-2 text-red-500 text-sm animate-shake">
                    <FaExclamationCircle className="w-4 h-4" />
                    <span>{form.formState.errors.courseId.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                disabled={showSpinner}
              >
                <FaTimes className="w-4 h-4" />
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={showSpinner}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-medium shadow-lg"
              >
                {showSpinner ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <FaPlus className="w-4 h-4" />
                    Tạo bài học
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

export default LessonCreate;
