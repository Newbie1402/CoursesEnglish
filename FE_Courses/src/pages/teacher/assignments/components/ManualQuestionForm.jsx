import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input/Input';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/select/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/Card';
import {
  FaPlus,
  FaTrash,
  FaQuestionCircle,
  FaListOl,
  FaEdit,
  FaCheckCircle
} from 'react-icons/fa';
import { cn } from '@/lib/utils';

const ManualQuestionForm = ({
  register,
  control,
  errors,
  watch,
  onSubmit,
  loading
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const type = watch('type');

  const handleAddOption = () => {
    append('');
  };

  const handleRemoveOption = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FaEdit className="w-5 h-5" />
          Thêm câu hỏi thủ công
        </CardTitle>
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Question Content */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FaQuestionCircle className="w-4 h-4 text-blue-600" />
              Nội dung câu hỏi
              <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('content')}
              rows={4}
              className={cn(
                "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none",
                errors.content && "border-red-500"
              )}
              placeholder="Nhập nội dung câu hỏi..."
            />
            {errors.content && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <span>⚠️</span>
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Question Type & Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaListOl className="w-4 h-4 text-purple-600" />
                Loại câu hỏi
                <span className="text-red-500">*</span>
              </label>
              <Select
                {...register('type')}
                className={cn(
                  "h-12 text-base",
                  errors.type && "border-red-500"
                )}
              >
                <option value="MULTIPLE_CHOICE">📝 Trắc nghiệm</option>
                <option value="ESSAY">✍️ Tự luận</option>
              </Select>
              {errors.type && (
                <p className="text-red-500 text-sm">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaCheckCircle className="w-4 h-4 text-green-600" />
                Điểm tối đa
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                {...register('maxScore')}
                className={cn(
                  "h-12 text-base",
                  errors.maxScore && "border-red-500"
                )}
                placeholder="Ví dụ: 10"
              />
              {errors.maxScore && (
                <p className="text-red-500 text-sm">{errors.maxScore.message}</p>
              )}
            </div>
          </div>

          {/* Multiple Choice Options */}
          {type === 'MULTIPLE_CHOICE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FaListOl className="w-4 h-4 text-indigo-600" />
                  Các lựa chọn
                  <span className="text-red-500">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="flex items-center gap-1"
                >
                  <FaPlus className="w-3 h-3" />
                  Thêm lựa chọn
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-semibold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <Input
                      {...register(`options.${index}`)}
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <FaTrash className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {errors.options && (
                <p className="text-red-500 text-sm">{errors.options.message}</p>
              )}

              {/* Correct Answer */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FaCheckCircle className="w-4 h-4 text-green-600" />
                  Đáp án đúng
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('correctAnswer')}
                  placeholder="Nhập nội dung đáp án đúng"
                  className={cn(
                    "h-12",
                    errors.correctAnswer && "border-red-500"
                  )}
                />
                <p className="text-xs text-gray-500">
                  Nhập chính xác nội dung của một trong các lựa chọn ở trên
                </p>
                {errors.correctAnswer && (
                  <p className="text-red-500 text-sm">{errors.correctAnswer.message}</p>
                )}
              </div>

              {/* Shufflable Option */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  {...register('isShufflable')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">
                  Cho phép xáo trộn thứ tự các lựa chọn khi thi
                </label>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang thêm...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FaPlus className="w-4 h-4" />
                  Thêm câu hỏi
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualQuestionForm;
