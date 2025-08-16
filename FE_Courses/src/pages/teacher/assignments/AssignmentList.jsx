import React from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table/Table';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Select } from '@/components/ui/select/Select';
import { FaPlus, FaSearch, FaCheck, FaClock } from 'react-icons/fa';

const AssignmentList = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');

  const assignments = [
    {
      id: 1,
      title: 'Bài tập về thì hiện tại đơn',
      course: 'Tiếng Anh Giao Tiếp Cơ Bản',
      dueDate: '2024-03-20',
      submissions: 15,
      totalStudents: 30,
      status: 'active'
    },
    {
      id: 2,
      title: 'Practice IELTS Reading',
      course: 'Luyện Thi IELTS 6.5+',
      dueDate: '2024-03-18',
      submissions: 25,
      totalStudents: 25,
      status: 'completed'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý bài tập</h1>
        <Button>
          <FaPlus className="mr-2" />
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
                    <Button variant="ghost" size="sm">
                      Chấm điểm
                    </Button>
                    <Button variant="ghost" size="sm">
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
