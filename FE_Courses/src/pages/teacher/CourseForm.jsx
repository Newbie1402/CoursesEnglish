import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, FormField, FormMessage } from '@/components/ui/form/Form';
import { Input } from '@/components/ui/input/Input';
import { Select, SelectItem } from '@/components/ui/select/Select';
import { Button } from '@/components/ui/button/Button';
import { Card, CardContent } from '@/components/ui/card/Card';
import { FaSave, FaTimes } from 'react-icons/fa';

const courseSchema = z.object({
  name: z.string().min(3, 'Tên khóa học phải có ít nhất 3 ký tự'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  level: z.string(),
  duration: z.string(),
  maxStudents: z.string().transform(Number).pipe(
    z.number().min(1, 'Số lượng học viên phải lớn hơn 0')
  ),
  price: z.string().transform(Number).pipe(
    z.number().min(0, 'Giá không được âm')
  )
});

const CourseForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(courseId);

  const defaultValues = {
    name: '',
    description: '',
    level: 'beginner',
    duration: '3-months',
    maxStudents: '30',
    price: '0'
  };

  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  const onSubmit = async (data) => {
    try {
      console.log('Form data:', data);
      // TODO: Implement API call
      // if (isEditing) {
      //   await updateCourse(courseId, data);
      // } else {
      //   await createCourse(data);
      // }
      navigate('/teacher/courses');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
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
                  error={errors.name?.message}
                  required
                >
                  <Input
                    {...register('name')}
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
                    label="Cấp độ"
                    error={errors.level?.message}
                    required
                  >
                    <Select {...register('level')}>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </Select>
                  </FormField>

                  <FormField
                    label="Thời lượng"
                    error={errors.duration?.message}
                    required
                  >
                    <Select {...register('duration')}>
                      <SelectItem value="1-month">1 tháng</SelectItem>
                      <SelectItem value="3-months">3 tháng</SelectItem>
                      <SelectItem value="6-months">6 tháng</SelectItem>
                    </Select>
                  </FormField>

                  <FormField
                    label="Số lượng học viên tối đa"
                    error={errors.maxStudents?.message}
                    required
                  >
                    <Input
                      type="number"
                      {...register('maxStudents')}
                      min="1"
                    />
                  </FormField>

                  <FormField
                    label="Học phí"
                    error={errors.price?.message}
                    required
                  >
                    <Input
                      type="number"
                      {...register('price')}
                      min="0"
                      step="100000"
                    />
                  </FormField>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/teacher/courses')}
                  >
                    <FaTimes className="mr-2" />
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <FaSave className="mr-2" />
                    {isSubmitting ? 'Đang lưu...' : 'Lưu khóa học'}
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

export default CourseForm;
