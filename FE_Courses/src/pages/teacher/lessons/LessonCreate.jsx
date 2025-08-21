import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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

  return (
    <Modal isOpen={open} onClose={onClose} title="Thêm bài học mới">
      <div className="relative">
        {showSpinner && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80">
            <LoadingSpinner size="lg" label="Đang tạo bài học..." />
          </div>
        )}
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" aria-disabled={showSpinner}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên bài học</label>
            <input type="text" {...form.register('title')} className="mt-1 block w-full border rounded px-3 py-2" disabled={showSpinner} />
            {form.formState.errors.title && <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">File bài học</label>
            <Controller
              control={form.control}
              name="file"
              render={({ field }) => (
                <input
                  type="file"
                  className="mt-1 block w-full"
                  disabled={showSpinner}
                  onChange={e => field.onChange(e.target.files)}
                />
              )}
            />
            {form.formState.errors.file && <p className="text-red-500 text-xs mt-1">{form.formState.errors.file.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Chọn khóa học</label>
            <select
              {...form.register('courseId')}
              className="mt-1 block w-full border rounded px-3 py-2"
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
            {form.formState.errors.courseId && <p className="text-red-500 text-xs mt-1">{form.formState.errors.courseId.message}</p>}
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700" disabled={showSpinner}>Hủy</button>
            <button type="submit" disabled={showSpinner} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              {showSpinner ? 'Đang lưu...' : 'Thêm bài học'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default LessonCreate;
