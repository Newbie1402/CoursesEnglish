import React, { useState, useEffect } from 'react';
import {
  FaUserPlus,
  FaSearch,
  FaFilter,
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaEye,
  FaUserCheck
} from 'react-icons/fa';
import AddUserModal from './AddUserModal';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers = [
      {
        id: 1,
        fullName: 'Nguyễn Văn An',
        email: 'nguyenvana@example.com',
        phoneNumber: '0901234567',
        role: 'STUDENT',
        status: 'verified',
        dateOfBirth: '1995-05-15',
        address: 'Hà Nội',
        createdAt: '2025-01-15'
      },
      {
        id: 2,
        fullName: 'Trần Thị Bình',
        email: 'tranthib@example.com',
        phoneNumber: '0987654321',
        role: 'TEACHER',
        status: 'pending',
        dateOfBirth: '1985-08-22',
        address: 'TP. Hồ Chí Minh',
        createdAt: '2025-02-10'
      },
      {
        id: 3,
        fullName: 'Lê Hoàng Cường',
        email: 'lehoangcuong@example.com',
        phoneNumber: '0912345678',
        role: 'STUDENT',
        status: 'verified',
        dateOfBirth: '1998-12-03',
        address: 'Đà Nẵng',
        createdAt: '2025-03-05'
      },
      {
        id: 4,
        fullName: 'Phạm Thị Dung',
        email: 'phamthidung@example.com',
        phoneNumber: '0976543210',
        role: 'TEACHER',
        status: 'rejected',
        dateOfBirth: '1980-03-18',
        address: 'Cần Thơ',
        createdAt: '2025-01-28'
      }
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  // Toast functions
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Handle add user success
  const handleAddUserSuccess = (message, type = 'success') => {
    showToast(message, type);
    setShowAddUserModal(false);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'STUDENT').length,
    teachers: users.filter(u => u.role === 'TEACHER').length,
    pending: users.filter(u => u.status === 'pending').length
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="w-3 h-3 mr-1" />
            Đã duyệt
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaClock className="w-3 h-3 mr-1" />
            Chờ duyệt
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="w-3 h-3 mr-1" />
            Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleIcon = (role) => {
    return role === 'STUDENT' ? (
      <FaUserGraduate className="w-4 h-4 text-blue-600" />
    ) : (
      <FaChalkboardTeacher className="w-4 h-4 text-purple-600" />
    );
  };

  const UserCard = ({ user }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
              <div className="flex items-center space-x-2 mt-1">
                {getRoleIcon(user.role)}
                <span className="text-sm text-gray-600">
                  {user.role === 'STUDENT' ? 'Học viên' : 'Giảng viên'}
                </span>
              </div>
            </div>
          </div>
          {getStatusBadge(user.status)}
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FaEnvelope className="w-3 h-3 text-gray-400" />
            <span>{user.email}</span>
          </div>
          {user.phoneNumber && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaPhone className="w-3 h-3 text-gray-400" />
              <span>{user.phoneNumber}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FaCalendarAlt className="w-3 h-3 text-gray-400" />
            <span>Đăng ký: {formatDate(user.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">ID: {user.id}</span>
          <button className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            <FaEye className="w-3 h-3 mr-1" />
            Xem chi tiết
          </button>
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
        {searchTerm || filterRole !== 'all' || filterStatus !== 'all' ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
      </h3>
      <p className="text-gray-500 mb-6">
        {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
          ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
          : 'Bắt đầu duyệt người dùng đầu tiên cho hệ thống'
        }
      </p>
      {(!searchTerm && filterRole === 'all' && filterStatus === 'all') && (
        <button
          onClick={() => setShowAddUserModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaUserPlus className="w-4 h-4 mr-2" />
          Duyệt người dùng đầu tiên
        </button>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <FaCheckCircle className="w-5 h-5" />
            ) : (
              <FaTimesCircle className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">
            Tổng cộng {stats.total} người dùng • {filteredUsers.length} đang hiển thị
          </p>
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
        >
          <FaUserCheck className="w-5 h-5 mr-2" />
          Duyệt người dùng
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaUsers className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Tổng người dùng</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaUserGraduate className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Học viên</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.students}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaChalkboardTeacher className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Giảng viên</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.teachers}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FaClock className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Chờ duyệt</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
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
              placeholder="Tìm kiếm người dùng theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400 w-4 h-4" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="STUDENT">Học viên</option>
                <option value="TEACHER">Giảng viên</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="verified">Đã duyệt</option>
                <option value="pending">Chờ duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
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
            {filterRole !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Vai trò: {filterRole === 'STUDENT' ? 'Học viên' : 'Giảng viên'}
                <button
                  onClick={() => setFilterRole('all')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                Trạng thái: {filterStatus === 'verified' ? 'Đã duyệt' : filterStatus === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                <button
                  onClick={() => setFilterStatus('all')}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* User Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredUsers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {/* Results Info */}
      {!loading && filteredUsers.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-6 py-3">
            <p className="text-sm text-gray-600">
              Hiển thị {filteredUsers.length} trong tổng số {users.length} người dùng
            </p>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSuccess={handleAddUserSuccess}
      />
    </div>
  );
};

export default AdminUserList;