import React, { useState } from 'react';
import Modal from '@/components/ui/modal/Modal';
import useLessonService from "@/services/hooks/useLessonService.js";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/toast/Toast';
import LoadingSpinner from '@/components/ui/loading/LoadingSpinner';
import {
  FaEdit,
  FaTrashAlt,
  FaTimes,
  FaCheck,
  FaFileAlt,
  FaCalendarAlt,
  FaEye,
  FaEyeSlash,
  FaCloudUploadAlt,
  FaExclamationTriangle,
  FaDownload,
  FaImage,
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaFileExcel,
  FaFile,
  FaSave
} from 'react-icons/fa';

const lessonEditSchema = z.object({
  title: z.string().min(3, 'Tên bài học phải có ít nhất 3 ký tự'),
  file: z.any().optional(),
  courseId: z.union([z.string(), z.number()]).optional(),
});

const LessonDetail = ({ open, onClose, lesson, onSuccess }) => {
  const { updateLesson, deleteLesson } = useLessonService();
  const { mutate: updateLessonMutate } = updateLesson;
  const { mutate: deleteLessonMutate, isLoading: isDeleting } = deleteLesson;
  const { addToast } = useToast();
  const [editMode, setEditMode] = React.useState(false);
  const [showEditSpinner, setShowEditSpinner] = React.useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const form = useForm({
    resolver: zodResolver(lessonEditSchema),
    defaultValues: {
      title: lesson?.title || '',
      file: null,
      courseId: lesson?.courseId || '',
    },
  });

  React.useEffect(() => {
    form.reset({
      title: lesson?.title || '',
      file: null,
      courseId: lesson?.courseId || '',
    });
  }, [lesson]);

  const handleEdit = (data) => {
    setShowEditSpinner(true);
    updateLessonMutate(
      { lessonId: lesson.lessonId, data: { ...data, file: data.file?.[0] } },
      {
        onSuccess: () => {
          addToast('Cập nhật bài học thành công!', 'success');
          setEditMode(false);
          setTimeout(() => setShowEditSpinner(false), 400);
          if (onSuccess) onSuccess();
        },
        onError: () => {
          addToast('Cập nhật thất bại!', 'error');
          setTimeout(() => setShowEditSpinner(false), 400);
        },
      }
    );
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    addToast('Đang xóa bài học...', 'info');
    deleteLessonMutate(lesson.lessonId, {
      onSuccess: () => {
        addToast('Đã xóa bài học!', 'success');
        setShowConfirmDelete(false);
        onClose();
        if (onSuccess) onSuccess();
      },
      onError: () => {
        addToast('Xóa thất bại!', 'error');
        setShowConfirmDelete(false);
      },
    });
  };

  // File handling functions
  const getFileNameFromUrl = (url) => {
    if (!url) return '';
    const afterUnderscore = url.split('_').pop();
    return decodeURIComponent(afterUnderscore);
  };

  const getFileType = (url) => {
    if (!url) return '';
    const ext = url.split('.').pop().toLowerCase();
    return ext;
  };

  const getFileIcon = (url) => {
    const ext = getFileType(url);
    const iconClass = "w-6 h-6";

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
      return <FaImage className={`${iconClass} text-purple-500`} />;
    }
    if (['pdf'].includes(ext)) {
      return <FaFilePdf className={`${iconClass} text-red-500`} />;
    }
    if (['doc', 'docx'].includes(ext)) {
      return <FaFileWord className={`${iconClass} text-blue-500`} />;
    }
    if (['ppt', 'pptx'].includes(ext)) {
      return <FaFilePowerpoint className={`${iconClass} text-orange-500`} />;
    }
    if (['xls', 'xlsx'].includes(ext)) {
      return <FaFileExcel className={`${iconClass} text-green-500`} />;
    }
    return <FaFile className={`${iconClass} text-gray-500`} />;
  };

  // Drag & Drop handlers
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
      form.setValue('file', [file]);
    }
  };

  if (!lesson) {
    return (
      <Modal isOpen={open} onClose={onClose} title="Chi tiết bài học">
        <div className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-gray-500 mt-4">Đang tải dữ liệu bài học...</p>
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105"
          >
            Đóng
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="">
      <div className="relative overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FaFileAlt className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Chi tiết bài học</h2>
                  <p className="text-blue-100 text-sm">Quản lý nội dung bài học</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {!editMode ? (
          <div className="p-6 space-y-6">
            {/* Lesson Info Cards */}
            <div className="grid gap-4">
              {/* Title Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FaFileAlt className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-blue-600 uppercase tracking-wide">Tên bài học</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{lesson.title}</p>
                  </div>
                </div>
              </div>

              {/* Status & Date Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      {lesson.active ? <FaEye className="w-5 h-5 text-green-600" /> : <FaEyeSlash className="w-5 h-5 text-yellow-600" />}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-green-600 uppercase tracking-wide">Trạng thái</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          lesson.active 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {lesson.active ? 'Đang hoạt động' : 'Ẩn'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FaCalendarAlt className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-purple-600 uppercase tracking-wide">Ngày tải lên</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {lesson.uploadedAt ? new Date(lesson.uploadedAt).toLocaleDateString('vi-VN') : 'Chưa rõ'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Content Card */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    {lesson.contentUrl ? getFileIcon(lesson.contentUrl) : <FaFile className="w-5 h-5 text-gray-500" />}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">File bài học</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {lesson.contentUrl ? getFileNameFromUrl(lesson.contentUrl) : 'Không có file'}
                    </p>
                  </div>
                  {lesson.contentUrl && (
                    <a
                      href={lesson.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                    >
                      <FaDownload className="w-4 h-4" />
                      Tải về
                    </a>
                  )}
                </div>

                {lesson.contentUrl ? (
                  <div className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-200">
                    {(() => {
                      const ext = getFileType(lesson.contentUrl);
                      if (['pdf'].includes(ext)) {
                        return (
                          <iframe
                            src={lesson.contentUrl}
                            title="Xem file PDF"
                            className="w-full h-96 border-0 rounded-lg"
                            allowFullScreen
                          />
                        );
                      }
                      if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
                        const googleViewer = `https://docs.google.com/gview?url=${encodeURIComponent(lesson.contentUrl)}&embedded=true`;
                        return (
                          <iframe
                            src={googleViewer}
                            title="Xem file Office"
                            className="w-full h-96 border-0 rounded-lg"
                            allowFullScreen
                          />
                        );
                      }
                      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
                        return (
                          <img
                            src={lesson.contentUrl}
                            alt={getFileNameFromUrl(lesson.contentUrl)}
                            className="max-h-96 rounded-lg mx-auto shadow-lg"
                          />
                        );
                      }
                      return (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            {getFileIcon(lesson.contentUrl)}
                          </div>
                          <p className="text-gray-600">File không thể xem trước</p>
                          <a
                            href={lesson.contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-2 text-blue-600 hover:text-blue-700"
                          >
                            <FaDownload className="w-4 h-4" />
                            Tải về để xem
                          </a>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-8 border-2 border-dashed border-gray-200 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaFile className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Chưa có file được tải lên</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <FaEdit className="w-4 h-4" />
                Chỉnh sửa
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTrashAlt className="w-4 h-4" />
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showConfirmDelete && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-all duration-300">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaExclamationTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa bài học</h3>
                    <p className="text-gray-600 mb-6">
                      Bạn có chắc chắn muốn xóa bài học "<span className="font-semibold">{lesson.title}</span>"?
                      <br />Hành động này không thể hoàn tác.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => setShowConfirmDelete(false)}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                        className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50"
                      >
                        {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative p-6">
            <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaFileAlt className="inline w-4 h-4 mr-2 text-blue-500" />
                  Tên bài học
                </label>
                <input
                  type="text"
                  {...form.register('title')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md disabled:bg-gray-50 disabled:cursor-not-allowed"
                  disabled={showEditSpinner}
                  placeholder="Nhập tên bài học..."
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <FaExclamationTriangle className="w-4 h-4" />
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaCloudUploadAlt className="inline w-4 h-4 mr-2 text-green-500" />
                  File mới (nếu muốn thay đổi)
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  } ${showEditSpinner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    {...form.register('file')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={showEditSpinner}
                  />
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaCloudUploadAlt className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">Kéo thả file vào đây hoặc click để chọn</p>
                    <p className="text-gray-400 text-sm mt-1">Hỗ trợ: PDF, DOC, PPT, XLS, IMG...</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                  disabled={showEditSpinner}
                >
                  <FaTimes className="w-4 h-4" />
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={showEditSpinner}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <FaSave className="w-4 h-4" />
                  {showEditSpinner ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>

            {/* Loading Overlay */}
            {showEditSpinner && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm z-10 rounded-xl">
                <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                  <LoadingSpinner className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium">Đang cập nhật bài học...</p>
                  <p className="text-gray-500 text-sm mt-1">Vui lòng đợi trong giây lát</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LessonDetail;