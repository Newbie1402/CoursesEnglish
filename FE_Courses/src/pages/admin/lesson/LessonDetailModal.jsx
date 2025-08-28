import React, { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaCalendarAlt, FaFileAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { getLessonDetails } from '@/services/hooks/lessonService';

const LessonDetailModal = ({ isOpen, onClose, lessonId }) => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && lessonId) {
      fetchLessonDetails();
    }
  }, [isOpen, lessonId]);

  const fetchLessonDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLessonDetails(lessonId);
      setLesson(data);
    } catch (err) {
      setError('Không thể tải thông tin bài học');
      console.error('Error fetching lesson details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (lesson?.contentUrl) {
      window.open(lesson.contentUrl, '_blank');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileExtension = (url) => {
    if (!url) return '';
    const extension = url.split('.').pop()?.toLowerCase();
    return extension || '';
  };

  const getFileTypeIcon = (url) => {
    const extension = getFileExtension(url);
    const iconClass = "w-8 h-8";

    switch (extension) {
      case 'pdf':
        return <div className={`${iconClass} bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold text-xs`}>PDF</div>;
      case 'xlsx':
      case 'xls':
        return <div className={`${iconClass} bg-green-100 text-green-600 rounded-lg flex items-center justify-center font-bold text-xs`}>XLS</div>;
      case 'docx':
      case 'doc':
        return <div className={`${iconClass} bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs`}>DOC</div>;
      case 'pptx':
      case 'ppt':
        return <div className={`${iconClass} bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold text-xs`}>PPT</div>;
      default:
        return <FaFileAlt className={`${iconClass} text-gray-400`} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FaFileAlt className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Chi tiết bài học</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Đang tải thông tin bài học...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaTimesCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 text-center">{error}</p>
              <button
                onClick={fetchLessonDetails}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : lesson ? (
            <div className="space-y-6">
              {/* Lesson Title */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h3>
                <div className="flex items-center space-x-2">
                  {lesson.active ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <FaCheckCircle className="w-3 h-3 mr-1" />
                      Đang hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      <FaTimesCircle className="w-3 h-3 mr-1" />
                      Đã ẩn
                    </span>
                  )}
                </div>
              </div>

              {/* Lesson Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload Date */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaCalendarAlt className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ngày tải lên</p>
                      <p className="text-gray-900">{formatDate(lesson.uploadedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Course ID */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">#{lesson.courseId}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Mã khóa học</p>
                      <p className="text-gray-900">Khóa học #{lesson.courseId}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content File */}
              {lesson.contentUrl && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Tài liệu bài học</h4>
                  <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-4">
                      {getFileTypeIcon(lesson.contentUrl)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {lesson.title}.{getFileExtension(lesson.contentUrl)}
                        </p>
                        <p className="text-sm text-gray-500">
                          File {getFileExtension(lesson.contentUrl).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors space-x-2"
                    >
                      <FaDownload className="w-4 h-4" />
                      <span>Tải xuống</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaFileAlt className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Không tìm thấy thông tin bài học</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetailModal;
