import { useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/toast/Toast';
import useAssignmentService from '@/services/hooks/useAssignmentService';

const questionSchema = z.object({
  content: z.string().min(1, 'Nhập nội dung câu hỏi'),
  type: z.enum(['MULTIPLE_CHOICE', 'ESSAY']),
  correctAnswer: z.string().optional(),
  options: z.array(z.string()).optional(),
  isShufflable: z.boolean().optional(),
  maxScore: z.coerce.number().min(1, 'Nhập điểm tối đa'),
}).superRefine((data, ctx) => {
  if (data.type === 'MULTIPLE_CHOICE') {
    const rawOptions = data.options || [];
    const opts = rawOptions.map(o => (o || '').trim()).filter(o => o !== '');
    if (opts.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'Cần ít nhất 2 lựa chọn khác rỗng'
      });
    }

    // Kiểm tra trùng
    const seen = new Set();
    let dup = false;
    opts.forEach(o => {
      const k = o.toLowerCase();
      if (seen.has(k)) dup = true;
      else seen.add(k);
    });
    if (dup) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'Có lựa chọn bị trùng'
      });
    }

    if (data.correctAnswer) {
      const caNorm = data.correctAnswer.trim().toLowerCase();
      const matchIndex = opts.findIndex(o => o.trim().toLowerCase() === caNorm);
      if (matchIndex === -1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['correctAnswer'],
          message: 'Đáp án không khớp lựa chọn'
        });
      }
    } else {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctAnswer'],
        message: 'Chọn đáp án đúng'
      });
    }
  }
});

export const useQuestionForm = (examId) => {
  const { addToast } = useToast();
  const { useCreateQuestion } = useAssignmentService();
  const { mutate: addQuestion, isLoading: loading } = useCreateQuestion();

  const formMethods = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      content: '',
      type: 'MULTIPLE_CHOICE',
      correctAnswer: '',
      options: ['', ''],
      isShufflable: true,
      maxScore: 1,
    },
  });

  const { reset } = formMethods;

  const onSubmit = useCallback((data) => {
    let payload = { ...data };

    if (data.type === 'MULTIPLE_CHOICE') {
      const cleanOptions = (data.options || [])
        .map(o => (o || '').trim())
        .filter(o => o !== '');

      const idx = cleanOptions.findIndex(o =>
        o.trim().toLowerCase() === data.correctAnswer.trim().toLowerCase()
      );

      if (idx === -1) {
        addToast('Đáp án không nằm trong danh sách lựa chọn', 'error');
        return;
      }

      payload = {
        ...payload,
        options: cleanOptions,
        correctAnswer: cleanOptions[idx]
      };
    }

    addQuestion(
      { ...payload, examId: Number(examId) },
      {
        onSuccess: (response) => {
          addToast(response.message || 'Thêm câu hỏi thành công', 'success');
          reset(); // Reset form sau khi thêm thành công
        },
        onError: () => {
          addToast('Thêm câu hỏi thất bại!', 'error');
        },
      }
    );
  }, [addQuestion, examId, addToast, reset]);

  return {
    ...formMethods,
    onSubmit: formMethods.handleSubmit(onSubmit),
    loading
  };
};
