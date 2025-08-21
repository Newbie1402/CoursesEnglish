import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, FormField } from '@/components/ui/form/Form.jsx';
import { Input } from '@/components/ui/input/Input.jsx';
import { Select } from '@/components/ui/select/Select.jsx';
import { Button } from '@/components/ui/button/Button.jsx';
import { Card, CardContent } from '@/components/ui/card/Card.jsx';
import { FaSave, FaTimes } from 'react-icons/fa';
import useCourseService from '@/services/hooks/useCourseService';
import { useToast } from '@/components/ui/toast/Toast';

const teacherId = Number(localStorage.getItem('teacherId'));
const courseSchema = z.object({
  title: z.string().min(3, 'Tên khóa học phải có ít nhất 3 ký tự'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  online: z.boolean(),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  teacherId: z.number().min(1, 'Vui lòng nhập ID giảng viên')
});

const CourseCreate = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(courseId);

  const defaultValues = {
    title: '',
    description: '',
    online: true,
    startDate: '',
    endDate: '',
    teacherId: teacherId
  };

  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  const { createCourse } = useCourseService();
  const { addToast } = useToast();

  const { mutate: createCourseMutate, isLoading, isError, error } = createCourse;

  const onSubmit = (formData) => {
    const payload = {
      ...formData,
      teacherId: Number(formData.teacherId),
      online: Boolean(formData.online),
    };
    createCourseMutate(payload, {
      onSuccess: () => {
        addToast('Tạo khóa học thành công!', 'success');
        navigate('/teacher/courses');
      }
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
          </h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <Form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <FormField
                  label="Tên khóa học"
                  error={errors.title?.message}
                  required
                >
                  <Input
                    {...register('title')}
                    placeholder="Nhập tên khóa học..."
                  />
                </FormField>

                <FormField
                  label="Mô tả"
                  error={errors.description?.message}
                  required
                >
                  <textarea
                    {...register('description')}
                    className="w-full px-3 py-2 border rounded-md resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mô tả chi tiết về khóa học..."
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Học online"
                    error={errors.online?.message}
                  >
                    <input
                      type="checkbox"
                      {...register('online')}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      defaultChecked={defaultValues.online}
                    />
                    <span className="ml-2">Khóa học online</span>
                  </FormField>

                  <FormField
                    label="Ngày bắt đầu"
                    error={errors.startDate?.message}
                    required
                  >
                    <Input
                      type="date"
                      {...register('startDate')}
                    />
                  </FormField>

                  <FormField
                    label="Ngày kết thúc"
                    error={errors.endDate?.message}
                    required
                  >
                    <Input
                      type="date"
                      {...register('endDate')}
                    />
                  </FormField>

                  <FormField
                    label="ID Giảng viên"
                    error={errors.teacherId?.message}
                    required
                  >
                    <Input
                      type="number"
                      {...register('teacherId')}
                      disabled
                      value={teacherId}
                    />
                  </FormField>
                </div>

                {isError && (
                  <div className="text-red-500 text-sm">Đã có lỗi xảy ra: {error?.message || 'Không thể tạo khóa học'}</div>
                )}

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/teacher/courses')}
                    disabled={isLoading || isSubmitting}
                  >
                    <FaTimes className="mr-2" /> Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || isSubmitting}
                  >
                    <FaSave className="mr-2" />
                    {isLoading || isSubmitting ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseCreate;