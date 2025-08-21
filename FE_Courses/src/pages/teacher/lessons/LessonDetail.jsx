import React, { useState } from 'react';
import Modal from '@/components/ui/modal/Modal';
import useLessonService from "@/services/hooks/useLessonService.js";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/toast/Toast';
import LoadingSpinner from '@/components/ui/loading/LoadingSpinner';

const lessonEditSchema = z.object({
  title: z.string().min(3, 'Tên bài học phải có ít nhất 3 ký tự'),
  file: z.any().optional(),
  courseId: z.union([z.string(), z.number()]).optional(),
});

const LessonDetail = ({ open, onClose, lesson, onSuccess }) => {
  const { updateLesson , deleteLesson } = useLessonService();
  const { mutate: updateLessonMutate } = updateLesson;
  const { mutate: deleteLessonMutate, isLoading: isDeleting } = deleteLesson;
  const { addToast } = useToast();
  const [editMode, setEditMode] = React.useState(false);
  const [showEditSpinner, setShowEditSpinner] = React.useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
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

  // Hàm lấy tên file từ URL (sau dấu _)
  const getFileNameFromUrl = (url) => {
    if (!url) return '';
    const afterUnderscore = url.split('_').pop();
    return decodeURIComponent(afterUnderscore);
  };

  // Hàm xác định loại file
  const getFileType = (url) => {
    if (!url) return '';
    const ext = url.split('.').pop().toLowerCase();
    return ext;
  };

  if (!lesson) {
    return (
      <Modal isOpen={open} onClose={onClose} title="Chi tiết bài học">
        <div className="p-6 text-center text-gray-500">Không tìm thấy bài học hoặc dữ liệu đang tải...</div>
        <div className="flex gap-2 justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700">Đóng</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Chi tiết bài học">
      {!editMode ? (
        <div className="space-y-4">
          <div>
            <div className="font-semibold">Tên bài học:</div>
            <div>{lesson.title}</div>
          </div>
          <div>
            <div className="font-semibold">Ngày tải lên:</div>
            <div>{lesson.uploadedAt ? new Date(lesson.uploadedAt).toLocaleDateString('vi-VN') : '-'}</div>
          </div>
          <div>
            <div className="font-semibold">Trạng thái:</div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${lesson.active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {lesson.active ? 'Đang hoạt động' : 'Ẩn'}
            </span>
          </div>
          <div>
            <div className="font-semibold">File bài học:</div>
            {lesson.contentUrl ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-700 font-medium">Tên file: {getFileNameFromUrl(lesson.contentUrl)}</div>
                {(() => {
                  const ext = getFileType(lesson.contentUrl);
                  if (['pdf'].includes(ext)) {
                    return (
                      <iframe
                        src={lesson.contentUrl}
                        title="Xem file PDF"
                        className="w-full h-96 border rounded"
                        allowFullScreen
                      />
                    );
                  }
                  if ([
                    'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'
                  ].includes(ext)) {
                    const googleViewer = `https://docs.google.com/gview?url=${encodeURIComponent(lesson.contentUrl)}&embedded=true`;
                    return (
                      <iframe
                        src={googleViewer}
                        title="Xem file Office"
                        className="w-full h-96 border rounded"
                        allowFullScreen
                      />
                    );
                  }
                  if ([
                    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'
                  ].includes(ext)) {
                    return (
                      <img
                        src={lesson.contentUrl}
                        alt={getFileNameFromUrl(lesson.contentUrl)}
                        className="max-h-96 rounded border"
                      />
                    );
                  }
                  // File khác: chỉ hiển thị link tải về
                  return (
                    <a href={lesson.contentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Tải về/Xem file</a>
                  );
                })()}
              </div>
            ) : (
              <span className="text-gray-400">Không có file</span>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditMode(true)} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Chỉnh sửa</button>
            <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">{isDeleting ? 'Đang xóa...' : 'Xóa'}</button>
            <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700">Đóng</button>
          </div>
          {showConfirmDelete && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs space-y-4">
                <div className="text-base font-semibold text-gray-800">Bạn có chắc chắn muốn xóa bài học này?</div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowConfirmDelete(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-700">Hủy</button>
                  <button onClick={handleConfirmDelete} disabled={isDeleting} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">{isDeleting ? 'Đang xóa...' : 'Xác nhận'}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên bài học</label>
              <input type="text" {...form.register('title')} className="mt-1 block w-full border rounded px-3 py-2" disabled={showEditSpinner} />
              {form.formState.errors.title && <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">File mới (nếu muốn thay đổi)</label>
              <input type="file" {...form.register('file')} className="mt-1 block w-full" disabled={showEditSpinner} />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-700" disabled={showEditSpinner}>Hủy</button>
              <button type="submit" disabled={showEditSpinner} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">{showEditSpinner ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </form>
          {showEditSpinner && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
              <LoadingSpinner className="w-10 h-10 text-blue-600" />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default LessonDetail;

