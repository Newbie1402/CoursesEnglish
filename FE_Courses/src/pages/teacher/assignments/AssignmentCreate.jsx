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
import React from 'react';

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
  const { data: courses = [] } = getCourseList(teacherId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const examData = {
        ...data,
        courseId: Number(data.courseId),
      };
      const response = await createExamMutation.mutateAsync(examData);
      addToast(response.message, 'success');
      navigate(`/teacher/assignments/${response.data.examId}/add-questions`);
    } catch (error) {
      addToast('Tạo bài kiểm tra thất bại!', 'error');
      console.log(error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tạo bài kiểm tra</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Tên bài kiểm tra</label>
          <Input {...register('title')} placeholder="Nhập tên bài kiểm tra" />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Loại bài kiểm tra</label>
          <Select {...register('type')}>
            <option value="">-- Chọn loại --</option>
            <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
            <option value="WRITING">Tự luận</option>
          </Select>
          {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Khóa học</label>
          <Select {...register('courseId')}>
            <option value="">-- Chọn khóa học --</option>
            {courses.map((course, index) => (
              <option key={index} value={course.courseId}>{course.title}</option>
            ))}
          </Select>
          {errors.courseId && <p className="text-red-500 text-sm mt-1">{errors.courseId.message}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Thời gian bắt đầu</label>
          <Input type="datetime-local" {...register('startTime')} />
          {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Thời gian kết thúc</label>
          <Input type="datetime-local" {...register('endTime')} />
          {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Thời lượng (phút)</label>
          <Input type="number" {...register('durationMinutes', { valueAsNumber: true })} />
          {errors.durationMinutes && <p className="text-red-500 text-sm mt-1">{errors.durationMinutes.message}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Mô tả</label>
          <Input {...register('description')} placeholder="Nhập mô tả (tùy chọn)" />
        </div>
        <div>
          <label className="block font-medium mb-1">Mật khẩu</label>
          <Input {...register('password')} placeholder="Nhập mật khẩu (tùy chọn)" />
        </div>
        <Button type="submit">Tạo bài kiểm tra</Button>
      </form>
    </div>
  );
};

export default AssignmentCreate;
