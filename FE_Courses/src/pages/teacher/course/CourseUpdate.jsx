import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useCourseService from '@/services/hooks/useCourseService';
import Modal from '@/components/ui/modal/Modal.jsx';
import { useToast } from '@/components/ui/toast/Toast.jsx';
import { formatDate } from "@/lib/utils.js";

const courseSchema = z.object({
  title: z.string().min(3, 'Tên khóa học phải có ít nhất 3 ký tự'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  online: z.boolean(),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  teacherId: z.number().min(1, 'Vui lòng nhập ID giảng viên')
});

const CourseUpdate = ({ open, onClose, course, onSuccess }) => {
  const { updateCourse } = useCourseService();
  const { mutate: updateCourseMutate, isLoading } = updateCourse;
  const { addToast } = useToast();
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

  const handleSubmit = (data) => {
    updateCourseMutate(
      { courseId: course.courseId, data: { ...data, teacherId: Number(data.teacherId), online: Boolean(data.online) } },
      {
        onSuccess: () => {
          addToast('Cập nhật khóa học thành công!', 'success');
          onClose();
          if (onSuccess) onSuccess();
        },
        onError: (err) => {
          addToast('Cập nhật thất bại!', 'error');
        }
      }
    );
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Cập nhật khóa học">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên khóa học</label>
          <input type="text" {...form.register('title')} className="mt-1 block w-full border rounded px-3 py-2" />
          {form.formState.errors.title && <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea {...form.register('description')} className="mt-1 block w-full border rounded px-3 py-2" rows={3} />
          {form.formState.errors.description && <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Học online</label>
          <input type="checkbox" {...form.register('online')} className="ml-2" defaultChecked={form.getValues('online')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
            <input type="date" {...form.register('startDate')} className="mt-1 block w-full border rounded px-3 py-2" />
            {form.formState.errors.startDate && <p className="text-red-500 text-xs mt-1">{form.formState.errors.startDate.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
            <input type="date" {...form.register('endDate')} className="mt-1 block w-full border rounded px-3 py-2" />
            {form.formState.errors.endDate && <p className="text-red-500 text-xs mt-1">{form.formState.errors.endDate.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ID Giảng viên</label>
          <input type="number" {...form.register('teacherId')} className="mt-1 block w-full border rounded px-3 py-2" disabled />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700">Hủy</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CourseUpdate;
