import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTeacher } from '@/services/hooks/teacherService';
import {
  FaSearch,
  FaFilter,
  FaUsers,
  FaChalkboardTeacher,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaEye,
  FaMapMarkerAlt,
  FaChevronRight,
  FaGraduationCap,
  FaChevronDown
} from 'react-icons/fa';

const AdminTeacherList = () => {
  const navigate = useNavigate();

  // State với giá trị mặc định an toàn
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('all');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAllTeacher();

        // Defensive programming - kiểm tra kiểu dữ liệu
        if (Array.isArray(response)) {
          setTeachers(response);
        } else if (response && Array.isArray(response.data)) {
          setTeachers(response.data);
        } else {
          console.warn('API response is not an array:', response);
          setTeachers([]);
        }
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError('Không thể tải danh sách giảng viên. Vui lòng thử lại.');
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const handleRowClick = (teacherId) => {
    navigate(`/admin/teachers/${teacherId}`);
  };

  // Filter teachers với kiểm tra an toàn
  const filteredTeachers = Array.isArray(teachers) ? teachers.filter(teacher => {
    const matchesSearch = teacher?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher?.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = filterSpecialization === 'all' ||
                                  teacher?.specialization?.toLowerCase().includes(filterSpecialization.toLowerCase());
    return matchesSearch && matchesSpecialization;
  }) : [];

  // Get unique specializations for filter
  const specializations = [...new Set(teachers.map(teacher => teacher.specialization).filter(Boolean))];

  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getExperienceText = (years) => {
    if (!years) return 'Chưa xác định';
    return `${years} năm kinh nghiệm`;
  };

  const TeacherCard = ({ teacher }) => (
    <div
      onClick={() => handleRowClick(teacher.teacherId)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {teacher.fullName?.charAt(0) || 'T'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {teacher.fullName || 'Không có tên'}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <FaChalkboardTeacher className="w-3 h-3 text-purple-600" />
                <span className="text-sm text-gray-600">Giảng viên</span>
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
            ID: {teacher.teacherId}
          </span>
        </div>

        {/* Specialization Badge */}
        {teacher.specialization && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              <FaGraduationCap className="w-3 h-3 mr-1" />
              {teacher.specialization}
            </span>
          </div>
        )}

        {/* Bio */}
        {teacher.bio && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">{teacher.bio}</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FaEnvelope className="w-3 h-3 text-gray-400" />
            <span className="truncate">{teacher.email || 'Không có email'}</span>
          </div>
          {teacher.phoneNumber && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaPhone className="w-3 h-3 text-gray-400" />
              <span>{teacher.phoneNumber}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            <span>{getExperienceText(teacher.experienceYears)}</span>
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
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-32 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
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
        {searchTerm || filterSpecialization !== 'all' ? 'Không tìm thấy giảng viên' : 'Chưa có giảng viên nào'}
      </h3>
      <p className="text-gray-500">
        {searchTerm || filterSpecialization !== 'all'
          ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
          : 'Danh sách giảng viên sẽ xuất hiện ở đây khi có dữ liệu'
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

  // Calculate stats
  const stats = {
    total: teachers.length,
    withExperience: teachers.filter(t => t.experienceYears && t.experienceYears > 0).length,
    specializations: specializations.length,
    avgExperience: teachers.length > 0 ? Math.round(
      teachers.reduce((sum, t) => sum + (t.experienceYears || 0), 0) / teachers.length
    ) : 0
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách giảng viên</h1>
          <p className="text-gray-600 mt-1">
            Tổng cộng {stats.total} giảng viên • {filteredTeachers.length} đang hiển thị
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
              placeholder="Tìm kiếm giảng viên theo tên, email hoặc chuyên môn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Specialization Filter */}
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400 w-4 h-4" />
            <div className="relative">
              <select
                value={filterSpecialization}
                onChange={(e) => setFilterSpecialization(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[160px] cursor-pointer"
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: 'none',
                  outline: 'none'
                }}
              >
                <option value="all">Tất cả chuyên môn</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none z-10" />
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || filterSpecialization !== 'all') && (
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
            {filterSpecialization !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Chuyên môn: {filterSpecialization}
                <button
                  onClick={() => setFilterSpecialization('all')}
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
      ) : filteredTeachers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <TeacherCard key={teacher.teacherId} teacher={teacher} />
          ))}
        </div>
      )}

      {/* Results Info */}
      {!error && filteredTeachers.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-6 py-3">
            <p className="text-sm text-gray-600">
              Hiển thị {filteredTeachers.length} trong tổng số {teachers.length} giảng viên
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeacherList;
