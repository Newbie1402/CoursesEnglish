import React from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table/Table';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Select } from '@/components/ui/select/Select';
import { FaSearch, FaUserPlus, FaGraduationCap } from 'react-icons/fa';

const StudentList = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCourse, setSelectedCourse] = React.useState('all');

  const students = [
    {
      id: 1,
      name: 'Nguyễn Văn An',
      email: 'nguyenvanan@example.com',
      courses: ['Tiếng Anh Giao Tiếp Cơ Bản', 'Luyện Thi IELTS 6.5+'],
      progress: 75,
      joinDate: '2024-01-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Trần Thị Bình',
      email: 'tranthib@example.com',
      courses: ['Tiếng Anh Giao Tiếp Cơ Bản'],
      progress: 45,
      joinDate: '2024-02-01',
      status: 'active'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách học viên</h1>
          <p className="mt-1 text-gray-500">Quản lý thông tin và tiến độ học tập của học viên</p>
        </div>
        <Button>
          <FaUserPlus className="mr-2" />
          Thêm học viên
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm học viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="all">Tất cả khóa học</option>
          <option value="1">Tiếng Anh Giao Tiếp Cơ Bản</option>
          <option value="2">Luyện Thi IELTS 6.5+</option>
        </Select>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Học viên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Khóa học</TableHead>
              <TableHead>Tiến độ</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaGraduationCap className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">ID: {student.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {student.courses.map((course, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{student.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(student.joinDate).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Đang học
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StudentList;
