import React, { useState, useEffect } from 'react';
import { FaTimes, FaUserPlus, FaSearch, FaUsers } from 'react-icons/fa';
import { getAllStudent } from '@/services/hooks/studentService';
import { addStudentToCourse } from '@/services/hooks/adminService';

const AddStudentModal = ({ isOpen, onClose, courseId, onSuccess }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudent();
      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = async () => {
    if (!selectedStudent) return;

    try {
      setAdding(true);
      await addStudentToCourse(courseId, selectedStudent.studentId);
      onSuccess('Thêm học viên vào khóa học thành công!');
      onClose();
      setSelectedStudent(null);
      setSearchTerm('');
    } catch (err) {
      onSuccess('Thêm học viên thất bại! Học viên có thể đã tồn tại trong khóa học.', 'error');
      console.error('Error adding student:', err);
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FaUserPlus className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Thêm học viên vào khóa học</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search */}
          <div className="relative mb-6">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm học viên theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Student List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Đang tải danh sách học viên...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaUsers className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  {searchTerm ? 'Không tìm thấy học viên nào' : 'Chưa có học viên nào'}
                </p>
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.studentId}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedStudent?.studentId === student.studentId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {student.fullName?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{student.fullName}</h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                      {student.phoneNumber && (
                        <p className="text-sm text-gray-400">{student.phoneNumber}</p>
                      )}
                    </div>
                    {selectedStudent?.studentId === student.studentId && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleAddStudent}
              disabled={!selectedStudent || adding}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
            >
              {adding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Đang thêm...</span>
                </>
              ) : (
                <>
                  <FaUserPlus className="w-4 h-4" />
                  <span>Thêm học viên</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;
