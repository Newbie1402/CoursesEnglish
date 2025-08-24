import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAssignmentService from '@/services/hooks/useAssignmentService';
import LoadingSpinner  from '@/components/ui/loading/LoadingSpinner';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table/Table';
import { Button } from '@/components/ui/button/Button';
import AssignmentUpdateQuestions from './AssignmentUpdateQuestions';
import { useToast } from '@/components/ui/toast/Toast';
import Modal from '@/components/ui/modal/Modal';

const AssignmentDetail = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { getExamById, getQuestionsByExam, useDeleteQuestion } = useAssignmentService();
  const { addToast } = useToast();

  const { data: exam, isLoading: loadingExam } = getExamById(examId);
  const { data: questions, isLoading: loadingQuestions } = getQuestionsByExam(examId);

  const deleteQuestionMutation = useDeleteQuestion();
  const [isUpdateModalOpen, setUpdateModalOpen] = React.useState(false);
  const [questionToUpdate, setQuestionToUpdate] = React.useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [questionToDelete, setQuestionToDelete] = React.useState(null);

  const openUpdateModal = (question) => {
    setQuestionToUpdate(question);
    setUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setQuestionToUpdate(null);
  };

  const openDeleteModal = (question) => {
    setQuestionToDelete(question);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setQuestionToDelete(null);
  };

  const confirmDeleteQuestion = () => {
    if (questionToDelete) {
      handleDeleteQuestion(questionToDelete.id);
      closeDeleteModal();
    }
  };

  const handleDeleteQuestion = (questionId) => {
    deleteQuestionMutation.mutate(questionId, {
      onSuccess: () => {
        addToast('Xóa câu hỏi thành công!', 'success');
      },
      onError: () => {
        addToast('Xóa câu hỏi thất bại!', 'error');
      },
    });
  };

  if (loadingExam || loadingQuestions) {
    return <LoadingSpinner />;
  }

  if (!exam) {
    return <p>Bài kiểm tra không tồn tại.</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Chi tiết bài kiểm tra</h1>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold">Thông tin bài kiểm tra</h2>
        <p><strong>Tên:</strong> {exam.title}</p>
        <p><strong>Loại:</strong> {exam.type}</p>
        <p><strong>Thời gian:</strong> {new Date(exam.startTime).toLocaleString()} - {new Date(exam.endTime).toLocaleString()}</p>
        <p><strong>Thời lượng:</strong> {exam.durationMinutes} phút</p>
        <p><strong>Mô tả:</strong> {exam.description || 'Không có'}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/teacher/assignments/${examId}/add-questions`)}
          >
            Thêm câu hỏi
          </Button>
        </div>
        <h2 className="text-xl font-semibold">Danh sách câu hỏi</h2>
        {questions && questions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nội dung</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Đáp án đúng</TableHead>
                <TableHead>Điểm tối đa</TableHead>
                <TableHead>Danh sách lựa chọn</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>{question.content}</TableCell>
                  <TableCell>{question.type}</TableCell>
                  <TableCell>
                    {question.correctAnswer ? (
                      <span className="font-bold text-green-600">{question.correctAnswer}</span>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>{question.maxScore}</TableCell>
                  <TableCell>
                    <ul className="list-disc pl-5">
                      {question.options.map((option, index) => (
                        <li
                          key={index}
                          className={
                            question.correctAnswer && option.startsWith(question.correctAnswer)
                              ? 'text-green-600 font-semibold'
                              : ''
                          }
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUpdateModal(question)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteModal(question)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>Không có câu hỏi nào.</p>
        )}
      </div>

      {isUpdateModalOpen && (
        <AssignmentUpdateQuestions
          question={questionToUpdate}
          onClose={closeUpdateModal}
        />
      )}

      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          title="Xác nhận xóa"
        >
          <p>Bạn có chắc chắn muốn xóa câu hỏi này không?</p>
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={closeDeleteModal}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDeleteQuestion}>
              Xóa
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AssignmentDetail;
