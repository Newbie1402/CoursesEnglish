import React from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table/Table';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Select } from '@/components/ui/select/Select';
import { FaSearch, FaCheck, FaClock } from 'react-icons/fa';
import useAssignmentService from '../../../services/hooks/useAssignmentService';
import useCourseService from '../../../services/hooks/useCourseService';
import { useNavigate } from 'react-router-dom';

const AssignmentList = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [courseDetails, setCourseDetails] = React.useState({});
  const navigate = useNavigate();
  const { getActiveExamsByTeacher } = useAssignmentService();
  const { getCourseDetail } = useCourseService();
  const teacherId = localStorage.getItem('teacherId');
  const { data: activeExams = [] } = getActiveExamsByTeacher(teacherId);

  React.useEffect(() => {
    const fetchCourseDetails = async () => {
      const details = {};
      for (const exam of activeExams) {
        const courseDetail = await getCourseDetail(exam.courseId);
        details[exam.courseId] = courseDetail?.data?.title || `Khóa học ID: ${exam.courseId}`;
      }
      setCourseDetails(details);
    };

    fetchCourseDetails();
  }, [activeExams, getCourseDetail]);

  const assignments = activeExams.map((exam) => ({
    id: exam.examId,
    title: exam.title,
    course: courseDetails[exam.courseId] || `Khóa học ID: ${exam.courseId}`,
    dueDate: exam.endTime,
    submissions: 0,
    totalStudents: 0,
    status: exam.active ? 'active' : 'inactive',
  }));

  const handleViewDetails = (examId) => {
    navigate(`/teacher/assignments/${examId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý bài tập</h1>
        <Button onClick={() => navigate('/teacher/assignments/new')}>
          Tạo bài tập mới
        </Button>
      </div>

      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang diễn ra</option>
          <option value="completed">Đã hoàn thành</option>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên bài tập</TableHead>
              <TableHead>Khóa học</TableHead>
              <TableHead>Hạn nộp</TableHead>
              <TableHead>Số bài nộp</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">{assignment.title}</TableCell>
                <TableCell>{assignment.course}</TableCell>
                <TableCell>{new Date(assignment.dueDate).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{assignment.submissions}/{assignment.totalStudents}</span>
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(assignment.submissions / assignment.totalStudents) * 100}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    assignment.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {assignment.status === 'completed' ? (
                      <>
                        <FaCheck className="w-3 h-3" />
                        Đã hoàn thành
                      </>
                    ) : (
                      <>
                        <FaClock className="w-3 h-3" />
                        Đang diễn ra
                      </>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(assignment.id)}
                    >
                      Chi tiết
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AssignmentList;