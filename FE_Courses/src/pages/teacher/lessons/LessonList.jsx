import React from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table/Table';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Select } from '@/components/ui/select/Select';
import { FaPlus, FaSearch } from 'react-icons/fa';

const LessonList = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCourse, setSelectedCourse] = React.useState('all');

  const lessons = [
    {
      id: 1,
      title: 'Giới thiệu về ngữ pháp cơ bản',
      course: 'Tiếng Anh Giao Tiếp Cơ Bản',
      duration: '45 phút',
      status: 'published',
      lastUpdated: '2024-03-15'
    },
    {
      id: 2,
      title: 'Thì hiện tại đơn',
      course: 'Tiếng Anh Giao Tiếp Cơ Bản',
      duration: '60 phút',
      status: 'draft',
      lastUpdated: '2024-03-14'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý bài học</h1>
        <Button>
          <FaPlus className="mr-2" />
          Thêm bài học
        </Button>
      </div>

      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm bài học..."
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên bài học</TableHead>
              <TableHead>Khóa học</TableHead>
              <TableHead>Thời lượng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Cập nhật</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.map((lesson) => (
              <TableRow key={lesson.id}>
                <TableCell className="font-medium">{lesson.title}</TableCell>
                <TableCell>{lesson.course}</TableCell>
                <TableCell>{lesson.duration}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    lesson.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lesson.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(lesson.lastUpdated).toLocaleDateString('vi-VN')}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Chỉnh sửa
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

export default LessonList;
