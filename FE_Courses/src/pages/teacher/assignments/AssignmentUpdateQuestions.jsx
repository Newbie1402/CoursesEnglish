import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input/Input';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/select/Select';
import { useToast } from '@/components/ui/toast/Toast';
import useAssignmentService from '@/services/hooks/useAssignmentService';
import { FaPlus, FaMinus, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

// Schema validation được cải thiện
const questionSchema = z.object({
  id: z.number(),
  content: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
  type: z.enum(['MULTIPLE_CHOICE', 'ESSAY', 'WRITING', 'MIXED']),
  correctAnswer: z.string().optional(),
  options: z.array(z.string()).optional(), // Làm optional vì essay không cần options
  isShufflable: z.boolean().optional(),
  maxScore: z.coerce.number().min(0.1, 'Điểm tối đa phải lớn hơn 0'),
  examId: z.number(),
}).refine((data) => {
  // Validation tùy chỉnh: nếu là MULTIPLE_CHOICE thì phải có ít nhất 2 options
  if (data.type === 'MULTIPLE_CHOICE') {
    return data.options && data.options.length >= 2;
  }
  return true;
}, {
  message: 'Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn',
  path: ['options']
}).refine((data) => {
  // Validation: nếu là MULTIPLE_CHOICE thì phải có correctAnswer
  if (data.type === 'MULTIPLE_CHOICE') {
    return data.correctAnswer && data.correctAnswer.length > 0;
  }
  return true;
}, {
  message: 'Câu hỏi trắc nghiệm phải có đáp án đúng',
  path: ['correctAnswer']
});

const AssignmentUpdateQuestions = ({ question, onClose, examId }) => {
  const { useUpdateQuestion } = useAssignmentService();
  const updateQuestionMutation = useUpdateQuestion();
  const { addToast } = useToast();
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khởi tạo default values tốt hơn
  const getDefaultValues = () => {
    const defaultOptions = question?.options || ['', ''];
    // Đảm bảo có ít nhất 2 options cho multiple choice
    if (question?.type === 'MULTIPLE_CHOICE' && defaultOptions.length < 2) {
      defaultOptions.push('', '');
    }

    return {
      id: question?.id || 0,
      content: question?.content || '',
      type: question?.type || 'MULTIPLE_CHOICE',
      correctAnswer: question?.correctAnswer || '',
      options: defaultOptions,
      isShufflable: question?.isShufflable || false,
      maxScore: question?.maxScore || 1,
      examId: question?.examId || examId || 0,
    };
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  // Watch để theo dõi thay đổi type
  const questionType = watch('type');

  // Reset form khi question thay đổi
  useEffect(() => {
    if (question) {
      reset(getDefaultValues());
    }
  }, [question, reset]);

  // Xử lý khi thay đổi loại câu hỏi
  useEffect(() => {
    if (questionType === 'MULTIPLE_CHOICE' && fields.length < 2) {
      // Thêm options nếu chưa đủ cho multiple choice
      while (fields.length < 4) {
        append('');
      }
    }
  }, [questionType, fields.length, append]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Lọc bỏ options trống cho multiple choice
      if (data.type === 'MULTIPLE_CHOICE') {
        data.options = data.options.filter(option => option.trim() !== '');

        // Kiểm tra lại sau khi lọc
        if (data.options.length < 2) {
          addToast('C��u hỏi trắc nghiệm phải có ít nhất 2 lựa chọn!', 'error');
          return;
        }
      } else {
        // Đối với essay, không cần options
        data.options = [];
        data.correctAnswer = '';
        data.isShufflable = false;
      }

      await updateQuestionMutation.mutateAsync(
        { questionId: data.id, data },
        {
          onSuccess: () => {
            addToast('Cập nhật câu hỏi thành công!', 'success');
            onClose();
          },
          onError: (error) => {
            console.error('Error updating question:', error);
            addToast('Cập nhật câu hỏi thất bại! Vui lòng thử lại.', 'error');
          },
        }
      );
    } catch (error) {
      console.error('Error in onSubmit:', error);
      addToast('Có lỗi xảy ra khi cập nhật câu hỏi!', 'error');
    } finally {
      setIsSubmitting(false);
      setConfirmModalOpen(false);
    }
  };

  const handleAddOption = () => {
    if (fields.length < 6) { // Giới hạn tối đa 6 options
      append('');
    }
  };

  const handleRemoveOption = (index) => {
    if (fields.length > 2) { // Ít nhất 2 options
      remove(index);
    }
  };

  const openConfirmModal = () => {
    setConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setConfirmModalOpen(false);
  };

  const confirmUpdateQuestion = () => {
    handleSubmit(onSubmit)();
  };

  if (!question) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Form chính */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Nội dung câu hỏi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung câu hỏi <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('content')}
            placeholder="Nhập nội dung câu hỏi..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <FaExclamationTriangle className="w-3 h-3" />
              {errors.content.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Loại câu hỏi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại câu hỏi <span className="text-red-500">*</span>
            </label>
            <Select
              {...register('type')}
              className="w-full"
            >
              <option value="MULTIPLE_CHOICE">📝 Trắc nghiệm</option>
              <option value="ESSAY">✍️ Tự luận</option>
              <option value="WRITING">📄 Viết</option>
              <option value="MIXED">🔀 Hỗn hợp</option>
            </Select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <FaExclamationTriangle className="w-3 h-3" />
                {errors.type.message}
              </p>
            )}
          </div>

          {/* Điểm tối đa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Điểm tối đa <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              {...register('maxScore')}
              placeholder="1.0"
            />
            {errors.maxScore && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <FaExclamationTriangle className="w-3 h-3" />
                {errors.maxScore.message}
              </p>
            )}
          </div>
        </div>

        {/* Options cho multiple choice */}
        {questionType === 'MULTIPLE_CHOICE' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Danh sách lựa chọn <span className="text-red-500">*</span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                disabled={fields.length >= 6}
                className="flex items-center gap-1"
              >
                <FaPlus className="w-3 h-3" />
                Thêm lựa chọn
              </Button>
            </div>

            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <Input
                    {...register(`options.${idx}`)}
                    placeholder={`Lựa chọn ${String.fromCharCode(65 + idx)}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveOption(idx)}
                    disabled={fields.length <= 2}
                    className="text-red-600 hover:bg-red-50 flex-shrink-0"
                  >
                    <FaMinus className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>

            {errors.options && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <FaExclamationTriangle className="w-3 h-3" />
                {errors.options.message}
              </p>
            )}

            {/* Đáp án đúng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đáp án đúng <span className="text-red-500">*</span>
              </label>
              <Select {...register('correctAnswer')} className="w-full">
                <option value="">Chọn đáp án đúng</option>
                {fields.map((field, idx) => {
                  const optionContent = watch(`options.${idx}`);
                  return (
                    <option
                      key={field.id}
                      value={optionContent || ''} // Gửi nội dung thay vì letter
                    >
                      {String.fromCharCode(65 + idx)} - {optionContent || `Lựa chọn ${String.fromCharCode(65 + idx)}`}
                    </option>
                  );
                })}
              </Select>
              {errors.correctAnswer && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <FaExclamationTriangle className="w-3 h-3" />
                  {errors.correctAnswer.message}
                </p>
              )}
            </div>

            {/* Trộn đáp án */}
            <div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isShufflable')}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="text-sm text-gray-700">Trộn thứ tự đáp án khi l��m bài</span>
              </label>
            </div>
          </div>
        )}
      </form>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Hủy bỏ
        </Button>
        <Button
          type="button"
          onClick={openConfirmModal}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật câu hỏi'}
        </Button>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Xác nhận cập nhật
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn cập nhật câu hỏi này không? Thao tác này sẽ thay đổi nội dung câu hỏi hiện tại.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={closeConfirmModal}
                disabled={isSubmitting}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={confirmUpdateQuestion}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentUpdateQuestions;
