import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStudent } from '@/services/hooks/studentService';
import LoadingSpinner from '@/components/ui/loading/LoadingSpinner';
import {
  FaSearch,
  FaFilter,
  FaUsers,
  FaUserGraduate,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaEye,
  FaMapMarkerAlt,
  FaChevronRight
} from 'react-icons/fa';

const AdminStudentList = () => {
  const navigate = useNavigate();

  // State với giá trị mặc định an toàn
  const [students, setStudents] = useState([]); // Khởi tạo với mảng rỗng thay vì undefined
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAllStudent();

        // Defensive programming - kiểm tra kiểu dữ liệu
        if (Array.isArray(response)) {
          setStudents(response);
        } else if (response && Array.isArray(response.data)) {
          setStudents(response.data);
        } else {
          console.warn('API response is not an array:', response);
          setStudents([]); // Fallback về mảng rỗng
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Không thể tải danh sách học viên. Vui lòng thử lại.');
        setStudents([]); // Đảm bảo students luôn là mảng
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleRowClick = (studentId) => {
    navigate(`/admin/students/${studentId}`);
  };

  // Filter students với kiểm tra an toàn
  const filteredStudents = Array.isArray(students) ? students.filter(student => {
    const matchesSearch = student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = filterGender === 'all' || student?.gender === filterGender;
    return matchesSearch && matchesGender;
  }) : [];

  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getGenderText = (gender) => {
    switch (gender) {
      case 'MALE': return 'Nam';
      case 'FEMALE': return 'Nữ';
      default: return 'Không xác định';
    }
  };

  const StudentCard = ({ student }) => (
    <div
      onClick={() => handleRowClick(student.studentId)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {student.fullName?.charAt(0) || 'S'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {student.fullName || 'Không có tên'}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <FaUserGraduate className="w-3 h-3 text-blue-600" />
                <span className="text-sm text-gray-600">Học viên</span>
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
            ID: {student.studentId}
          </span>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FaEnvelope className="w-3 h-3 text-gray-400" />
            <span className="truncate">{student.email || 'Không có email'}</span>
          </div>
          {student.phoneNumber && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaPhone className="w-3 h-3 text-gray-400" />
              <span>{student.phoneNumber}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FaCalendarAlt className="w-3 h-3 text-gray-400" />
            <span>Sinh ngày: {formatDate(student.dateOfBirth)}</span>
          </div>
          {student.address && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
              <span className="truncate">{student.address}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            <span>Giới tính: {getGenderText(student.gender)}</span>
          </div>
          <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
            <FaEye className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">Xem chi tiết</span>
            <FaChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaUsers className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {searchTerm || filterGender !== 'all' ? 'Không tìm thấy học viên' : 'Chưa có học viên nào'}
      </h3>
      <p className="text-gray-500">
        {searchTerm || filterGender !== 'all'
          ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
          : 'Danh sách học viên sẽ xuất hiện ở đây khi có dữ liệu'
        }
      </p>
    </div>
  );

  const ErrorState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaUsers className="w-12 h-12 text-red-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
      <p className="text-gray-500 mb-6">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Thử lại
      </button>
    </div>
  );

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách học viên</h1>
          <p className="text-gray-600 mt-1">
            Tổng cộng {students.length} học viên • {filteredStudents.length} đang hiển thị
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm học viên theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Gender Filter */}
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400 w-4 h-4" />
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả giới tính</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || filterGender !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Bộ lọc đang áp dụng:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Tìm kiếm: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filterGender !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Giới tính: {getGenderText(filterGender)}
                <button
                  onClick={() => setFilterGender('all')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {error ? (
        <ErrorState />
      ) : filteredStudents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <StudentCard key={student.studentId} student={student} />
          ))}
        </div>
      )}

      {/* Results Info */}
      {!error && filteredStudents.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-6 py-3">
            <p className="text-sm text-gray-600">
              Hiển thị {filteredStudents.length} trong tổng số {students.length} học viên
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentList;
