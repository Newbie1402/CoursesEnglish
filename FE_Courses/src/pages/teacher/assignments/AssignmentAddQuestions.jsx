import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input/Input';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/select/Select';
import { Toast } from '@/components/ui/toast/Toast';

const questionSchema = z.object({
  content: z.string().min(1, 'Nhập nội dung câu hỏi'),
  type: z.enum(['MULTIPLE_CHOICE', 'ESSAY', 'MIXED', 'WRITING']),
  correctAnswer: z.string().optional(),
  options: z.array(z.string()).optional(),
  isShufflable: z.boolean().optional(),
  maxScore: z.coerce.number().min(1, 'Nhập điểm tối đa'),
});

const TABS = [
  { key: 'manual', label: 'Thêm thủ công' },
  { key: 'upload', label: 'Upload file Word' },
];

const AssignmentAddQuestions = () => {
  const { examId } = useParams();
  const [activeTab, setActiveTab] = useState('manual');
  const [toast, setToast] = useState(null);
  const { createQuestion, loading } = useCreateQuestion();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      content: '',
      type: 'MULTIPLE_CHOICE',
      correctAnswer: '',
      options: [''],
      isShufflable: true,
      maxScore: 1,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const type = watch('type');

  const onSubmit = async (data) => {
    try {
      await createQuestion({
        ...data,
        examId: Number(examId),
      });
      setToast({ type: 'success', message: 'Thêm câu hỏi thành công!' });
      reset();
    } catch (err) {
      setToast({ type: 'error', message: 'Thêm câu hỏi thất bại!' });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Thêm câu hỏi cho bài tập #{examId}</h2>
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      {activeTab === 'manual' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded shadow">
          <div>
            <label className="block font-medium mb-1">Nội dung câu hỏi</label>
            <Input {...register('content')} placeholder="Nhập nội dung câu hỏi" />
            {errors.content && <span className="text-red-500 text-xs">{errors.content.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Loại câu hỏi</label>
            <Select {...register('type')}>
              <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
              <option value="ESSAY">Tự luận</option>
              <option value="MIXED">Hỗn hợp</option>
              <option value="WRITING">Viết</option>
            </Select>
          </div>
          {type === 'MULTIPLE_CHOICE' && (
            <>
              <div>
                <label className="block font-medium mb-1">Các lựa chọn</label>
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 mb-2">
                    <Input {...register(`options.${idx}`)} placeholder={`Lựa chọn ${String.fromCharCode(65 + idx)}`} />
                    <Button type="button" variant="ghost" onClick={() => remove(idx)} disabled={fields.length <= 2}>-</Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => append('')}>Thêm lựa chọn</Button>
                {errors.options && <span className="text-red-500 text-xs">{errors.options.message}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Đáp án đúng</label>
                <Select {...register('correctAnswer')}>
                  <option value="">Chọn đáp án đúng</option>
                  {fields.map((field, idx) => (
                    <option key={field.id} value={String.fromCharCode(65 + idx)}>
                      {String.fromCharCode(65 + idx)}
                    </option>
                  ))}
                </Select>
                {errors.correctAnswer && <span className="text-red-500 text-xs">{errors.correctAnswer.message}</span>}
              </div>
              <div>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" {...register('isShufflable')} defaultChecked />
                  Trộn đáp án khi làm bài
                </label>
              </div>
            </>
          )}
          <div>
            <label className="block font-medium mb-1">Điểm tối đa</label>
            <Input type="number" min={1} {...register('maxScore')} />
            {errors.maxScore && <span className="text-red-500 text-xs">{errors.maxScore.message}</span>}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu câu hỏi'}
            </Button>
          </div>
        </form>
      )}
      {activeTab === 'upload' && (
        <div className="bg-white p-4 rounded shadow text-center text-gray-500">
          <p>Tính năng upload file Word sẽ sớm được bổ sung.</p>
        </div>
      )}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AssignmentAddQuestions;

