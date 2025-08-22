import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input/Input';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/select/Select';
import { useToast } from '@/components/ui/toast/Toast';
import useAssignmentService from '@/services/hooks/useAssignmentService';
import Modal from '@/components/ui/modal/Modal';

const questionSchema = z.object({
  id: z.number(),
  content: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  type: z.enum(['MULTIPLE_CHOICE', 'ESSAY', 'MIXED', 'WRITING']),
  correctAnswer: z.string().optional(),
  options: z.array(z.string()).min(1, 'Phải có ít nhất một lựa chọn'),
  isShufflable: z.boolean(),
  maxScore: z.coerce.number().min(0.1, 'Điểm tối đa phải lớn hơn 0'),
  examId: z.number(),
});

const AssignmentUpdateQuestions = ({ question, onClose }) => {
  const { useUpdateQuestion } = useAssignmentService();
  const updateQuestionMutation = useUpdateQuestion();
  const { addToast } = useToast();
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      ...question,
      options: question.options || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const onSubmit = (data) => {
    updateQuestionMutation.mutate(
      { questionId: data.id, data },
      {
        onSuccess: () => {
          addToast('Cập nhật câu hỏi thành công!', 'success');
          onClose();
        },
        onError: () => {
          addToast('Cập nhật câu hỏi thất bại!', 'error');
        },
      }
    );
  };

  const openConfirmModal = () => {
    setConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setConfirmModalOpen(false);
  };

  const confirmUpdateQuestion = () => {
    handleSubmit(onSubmit)();
    closeConfirmModal();
  };

  return (
    <Modal isOpen={!!question} onClose={onClose} title="Cập nhật câu hỏi">
      <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Cập nhật câu hỏi</h2>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Nội dung câu hỏi</label>
            <Input {...register('content')} placeholder="Nhập nội dung câu hỏi" />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
          </div>
          <div>
            <label className="block font-medium mb-1">Loại câu hỏi</label>
            <Select {...register('type')}>
              <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
              <option value="ESSAY">Tự luận</option>
              <option value="MIXED">Hỗn hợp</option>
              <option value="WRITING">Viết</option>
            </Select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
          </div>
          <div>
            <label className="block font-medium mb-1">Điểm tối đa</label>
            <Input type="number" {...register('maxScore')} />
            {errors.maxScore && <p className="text-red-500 text-sm mt-1">{errors.maxScore.message}</p>}
          </div>
          <div>
            <label className="block font-medium mb-1">Danh sách lựa chọn</label>
            {fields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 mb-2">
                <Input {...register(`options.${idx}`)} placeholder={`Lựa chọn ${String.fromCharCode(65 + idx)}`} />
                <Button type="button" variant="ghost" onClick={() => remove(idx)} disabled={fields.length <= 2}>-</Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => append('')}>Thêm lựa chọn</Button>
            {errors.options && <p className="text-red-500 text-sm mt-1">{errors.options.message}</p>}
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
            {errors.correctAnswer && <p className="text-red-500 text-sm mt-1">{errors.correctAnswer.message}</p>}
          </div>
          <div>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" {...register('isShufflable')} />
              Trộn đáp án khi làm bài
            </label>
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="button" className="ml-2" onClick={openConfirmModal}>
              Xác nhận
            </Button>
          </div>
        </form>
      </div>

      {isConfirmModalOpen && (
        <Modal isOpen={isConfirmModalOpen} onClose={closeConfirmModal} title="Xác nhận cập nhật">
          <p>Bạn có chắc chắn muốn cập nhật câu hỏi này không?</p>
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={closeConfirmModal}>
              Hủy
            </Button>
            <Button variant="success" onClick={confirmUpdateQuestion}>
              Xác nhận
            </Button>
          </div>
        </Modal>
      )}
    </Modal>
  );
};

export default AssignmentUpdateQuestions;
