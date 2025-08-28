import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/Card';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Form, FormField } from '@/components/ui/form/Form';
import {
  FaSave,
  FaUser,
  FaEdit,
  FaTimes,
  FaCheck,
  FaGraduationCap,
  FaArrowRight,
  FaUserCircle,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaVenus,
  FaMars,
  FaUpload,
  FaSpinner
} from 'react-icons/fa';
import { useToast } from '@/components/ui/toast/Toast';
import useTeacherService from '@/services/hooks/useTeacherService.js';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, validatePhoneNumber } from '@/lib/utils';
import axios from 'axios';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { addToast } = useToast();
  const { auth } = useAuth();

  const [form, setForm] = useState({
    specialization: '',
    bio: '',
    experienceYears: ''
  });

  const [accountForm, setAccountForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    avatarUrl: ''
  });

  const teacherId = localStorage.getItem('teacherId');
  const userId = localStorage.getItem('userId');
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const {
    teacherInfo,
    loading: teacherLoading,
    createTeacher,
    getTeacherInfo,
    updateTeacherInfo,
    setTeacherInfo,
    updateUserProfile
  } = useTeacherService(BASE_URL);

  useEffect(() => {
    // Nếu chưa có teacherId, tự động tạo hồ sơ giảng viên rỗng
    if (!teacherId || teacherId === 'null') {
      if (userId) {
        setLoading(true);
        createTeacher({ userId })
          .then((data) => {
            if (data) {
              localStorage.setItem('teacherId', data.teacherId);
              setForm({
                specialization: data.specialization || '',
                bio: data.bio || '',
                experienceYears: data.experienceYears?.toString() || ''
              });
              addToast('Đã tạo hồ sơ giảng viên mặc định. Vui lòng cập nhật thông tin!', 'success');
            }
          })
          .catch(() => addToast('Không thể tạo hồ sơ giảng viên mặc định', 'error'))
          .finally(() => setLoading(false));
      }
      return;
    }
    // Nếu đã có teacherId, load thông tin như cũ
    setLoading(true);
    getTeacherInfo(teacherId)
      .then((data) => {
        if (data) {
          setTeacherInfo(data);
          setForm({
            specialization: data.specialization || '',
            bio: data.bio || '',
            experienceYears: data.experienceYears?.toString() || ''
          });
          setAccountForm(prev => ({
            ...prev,
            avatarUrl: data.avatarUrl || ''
          }));
        }
      })
      .catch(() => addToast('Không thể tải thông tin giảng viên', 'error'))
      .finally(() => setLoading(false));
  }, [teacherId, userId]);

  useEffect(() => {
    // Lấy thông tin tài khoản khi vào tab account bằng getTeacherInfo
    if (activeTab === 'account' && teacherId) {
      setLoadingAccount(true);
      getTeacherInfo(teacherId)
        .then((data) => {
          if (data) {
            setAccountForm({
              fullName: data.fullName || '',
              email: data.email || '',
              phoneNumber: data.phoneNumber || '',
              dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : '',
              gender: data.gender || '',
              address: data.address || '',
              avatarUrl: data.avatarUrl || ''
            });
          }
        })
        .catch(() => addToast('Không thể tải thông tin tài khoản', 'error'))
        .finally(() => setLoadingAccount(false));
    }
  }, [teacherId, activeTab]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAccountChange = e => {
    setAccountForm({ ...accountForm, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !(file instanceof File)) {
      addToast('Vui lòng chọn một tệp hợp lệ để tải lên.', 'error');
      console.error('Invalid file:', file);
      return;
    }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${BASE_URL}/api/upload/avatar/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.statusCode === 200) {
        setAccountForm((prev) => ({ ...prev, avatarUrl: response.data.data }));
        addToast('Tải lên avatar thành công! (reload lại trang để cập nhật)', 'success');
      } else {
        addToast(response.data?.message || 'Đã xảy ra lỗi khi tải lên avatar.', 'error');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      addToast('Đã xảy ra lỗi khi tải lên avatar.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.specialization || !form.bio || !form.experienceYears) {
      addToast('Vui lòng nhập đầy đủ thông tin', 'warning');
      return;
    }
    setLoading(true);
    try {
      if (teacherId === 'null' || !teacherId) {
        const data = await createTeacher({
          userId,
          specialization: form.specialization,
          bio: form.bio,
          experienceYears: form.experienceYears
        });
        if (data) {
          localStorage.setItem('teacherId', data.teacherId);
          setTeacherInfo(data);
          addToast('Tạo hồ sơ giảng viên thành công!', 'success');
        }
      } else {
        const data = await updateTeacherInfo(teacherId, {
          specialization: form.specialization,
          bio: form.bio,
          experienceYears: form.experienceYears
        });
        if (data) {
          setTeacherInfo(data);
          addToast('Cập nhật hồ sơ thành công!', 'success');
        }
      }
    } catch (err) {
      addToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountEdit = () => setEditMode(true);
  const handleAccountCancel = () => setEditMode(false);

  const handleAccountSave = async () => {
    // Validate
    if (!accountForm.fullName || !accountForm.phoneNumber || !accountForm.dateOfBirth || !accountForm.gender) {
      addToast('Vui lòng nhập đầy đủ thông tin bắt buộc', 'warning');
      return;
    }
    if (!validatePhoneNumber(accountForm.phoneNumber)) {
      addToast('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng!', 'warning');
      return;
    }
    setLoadingAccount(true);
    try {
      const res = await updateUserProfile(userId, {
        fullName: accountForm.fullName,
        phoneNumber: accountForm.phoneNumber,
        dateOfBirth: accountForm.dateOfBirth,
        gender: accountForm.gender,
        address: accountForm.address
      });
      if (res && res.statusCode === 200) {
        setEditMode(false);
        addToast('Cập nhật thông tin tài khoản thành công!', 'success');
      } else {
        addToast('Cập nhật thất bại!', 'error');
      }
    } catch (err) {
      addToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
    } finally {
      setLoadingAccount(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: FaUser, color: 'blue' },
    { id: 'account', label: 'Thông tin tài khoản', icon: FaUserCircle, color: 'green' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center overflow-hidden">
                  {accountForm.avatarUrl ? (
                    <img
                      src={accountForm.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaGraduationCap className="text-white text-2xl" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span>Dashboard</span>
                  <FaArrowRight className="text-xs" />
                  <span className="text-gray-700 font-medium">Cài đặt</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Cài đặt tài khoản
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý thông tin cá nhân và tùy chọn hệ thống
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex-1 lg:ml-auto">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">
                    {form.experienceYears || '0'}
                  </p>
                  <p className="text-xs text-gray-600">Năm kinh nghiệm</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">12</p>
                  <p className="text-xs text-gray-600">Khóa học</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl col-span-2 lg:col-span-1">
                  <p className="text-2xl font-bold text-purple-600">4.8/5</p>
                  <p className="text-xs text-gray-600">Đánh giá</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex items-center gap-3 py-4 px-6 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap relative overflow-hidden group",
                    activeTab === id
                      ? `border-${color}-500 text-${color}-600 bg-${color}-50`
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {/* Background animation */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 transition-opacity duration-300",
                    `bg-gradient-to-r from-${color}-500 to-${color}-600`,
                    activeTab !== id && "group-hover:opacity-5"
                  )} />

                  <Icon className={cn(
                    "w-5 h-5 z-10 transition-transform duration-200",
                    activeTab === id && "scale-110"
                  )} />
                  <span className="z-10">{label}</span>

                  {/* Active indicator */}
                  {activeTab === id && (
                    <div className={cn(
                      "absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full",
                      `bg-${color}-500`
                    )} />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Hồ sơ giảng viên</h2>
                  <p className="text-gray-600">Cập nhật thông tin chuyên môn và kinh nghiệm của bạn</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FormField label="Chuyên môn *">
                      <div className="relative">
                        <FaGraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          name="specialization"
                          value={form.specialization}
                          onChange={handleChange}
                          placeholder="VD: IELTS Speaking, TOEIC, ..."
                          className="pl-10"
                        />
                      </div>
                    </FormField>

                    <FormField label="Số năm kinh nghiệm *">
                      <Input
                        name="experienceYears"
                        type="number"
                        min={0}
                        max={50}
                        value={form.experienceYears}
                        onChange={handleChange}
                        placeholder="Nhập số năm kinh nghiệm"
                      />
                    </FormField>
                  </div>

                  <FormField label="Giới thiệu bản thân *">
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Tóm tắt kinh nghiệm, thành tích, phương pháp giảng dạy..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {form.bio.length}/500 ký tự
                    </p>
                  </FormField>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          {teacherId ? 'Cập nhật hồ sơ' : 'Tạo hồ sơ'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Thông tin tài khoản</h2>
                    <p className="text-gray-600">Quản lý thông tin cá nhân và liên hệ</p>
                  </div>
                  {!editMode && (
                    <Button onClick={handleAccountEdit} className="flex items-center gap-2">
                      <FaEdit className="w-4 h-4" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>

                {/* Avatar Upload Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ảnh đại diện</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        {accountForm.avatarUrl ? (
                          <img
                            src={accountForm.avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaUserCircle className="text-white text-4xl" />
                        )}
                      </div>
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                          <FaSpinner className="text-white text-xl animate-spin" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-3">
                        Tải lên ảnh đại diện mới. Chỉ chấp nhận file JPG, PNG dưới 5MB.
                      </p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <FaUpload className="w-4 h-4" />
                        <span>Chọn ảnh</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={uploadingAvatar}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FaUser className="text-blue-500" />
                      Thông tin cơ bản
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                      {editMode ? (
                        <Input
                          name="fullName"
                          value={accountForm.fullName}
                          onChange={handleAccountChange}
                          placeholder="Nhập họ và tên"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{accountForm.fullName || '---'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaEnvelope className="inline mr-1" /> Email
                      </label>
                      <p className="text-gray-900 font-medium">{accountForm.email || '---'}</p>
                      <p className="text-xs text-gray-500">Email không thể thay đổi</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaPhone className="inline mr-1" /> Số điện thoại *
                      </label>
                      {editMode ? (
                        <Input
                          name="phoneNumber"
                          value={accountForm.phoneNumber}
                          onChange={handleAccountChange}
                          placeholder="Nhập số điện thoại"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{accountForm.phoneNumber || '---'}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-green-500" />
                      Thông tin cá nhân
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaCalendarAlt className="inline mr-1" /> Ngày sinh *
                      </label>
                      {editMode ? (
                        <Input
                          name="dateOfBirth"
                          type="date"
                          value={accountForm.dateOfBirth}
                          onChange={handleAccountChange}
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">
                          {accountForm.dateOfBirth ? formatDate(accountForm.dateOfBirth) : '---'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính *</label>
                      {editMode ? (
                        <select
                          name="gender"
                          value={accountForm.gender}
                          onChange={handleAccountChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="MALE">
                            <FaMars className="inline mr-1" /> Nam
                          </option>
                          <option value="FEMALE">
                            <FaVenus className="inline mr-1" /> Nữ
                          </option>
                        </select>
                      ) : (
                        <p className="text-gray-900 font-medium flex items-center gap-1">
                          {accountForm.gender === 'MALE' && <><FaMars className="text-blue-500" /> Nam</>}
                          {accountForm.gender === 'FEMALE' && <><FaVenus className="text-pink-500" /> Nữ</>}
                          {!accountForm.gender && '---'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaMapMarkerAlt className="inline mr-1" /> Địa chỉ
                      </label>
                      {editMode ? (
                        <Input
                          name="address"
                          value={accountForm.address}
                          onChange={handleAccountChange}
                          placeholder="Nhập địa chỉ"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{accountForm.address || '---'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {editMode && (
                  <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAccountCancel}
                      className="flex items-center gap-2"
                    >
                      <FaTimes className="w-4 h-4" />
                      Hủy
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAccountSave}
                      disabled={loadingAccount}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                    >
                      {loadingAccount ? (
                        <>
                          <FaSpinner className="w-4 h-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <FaCheck className="w-4 h-4" />
                          Lưu thay đổi
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
