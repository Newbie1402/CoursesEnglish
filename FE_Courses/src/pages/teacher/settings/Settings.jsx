import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/Card';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Form, FormField } from '@/components/ui/form/Form';
import { FaSave, FaLock, FaUser } from 'react-icons/fa';
import { useToast } from '@/components/ui/toast/Toast';
import useTeacherService from '@/services/hooks/useTeacherService.js';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, validatePhoneNumber } from '@/lib/utils';
import axios from 'axios';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { auth } = useAuth();
  const [form, setForm] = useState({
    specialization: '',
    bio: '',
    experienceYears: ''
  });
  const [teacherProfile, setTeacherProfile] = useState({ fullName: '', email: '' });
  const [accountForm, setAccountForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);
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
              address: data.address || ''
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
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: FaUser },
    { id: 'account', label: 'Tài khoản', icon: FaLock }
  ];

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt tài khoản</h1>
          <p className="mt-1 text-gray-500">Quản lý thông tin cá nhân và tùy chọn tài khoản</p>
        </div>
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2 py-4 px-1 text-sm font-medium border-b-2 transition-colors",
                  activeTab === id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
        {/* Tab Content */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>Hồ sơ giảng viên</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <FormField label="Chuyên môn">
                  <Input
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    placeholder="VD: IELTS Speaking, TOEIC, ..."
                  />
                </FormField>
                <FormField label="Giới thiệu bản thân">
                  <Input
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Tóm tắt kinh nghiệm, thành tích..."
                  />
                </FormField>
                <FormField label="Số năm kinh nghiệm">
                  <Input
                    name="experienceYears"
                    type="number"
                    min={0}
                    value={form.experienceYears}
                    onChange={handleChange}
                    placeholder="Nhập số năm kinh nghiệm"
                  />
                </FormField>
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    <FaSave className="mr-2" />
                    {teacherId ? 'Cập nhật hồ sơ' : 'Tạo hồ sơ'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        {activeTab === 'account' && (
          <Card>
            <CardHeader>
              <CardTitle>Tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="block text-gray-500 text-sm">Họ và tên</span>
                  {editMode ? (
                    <Input
                      name="fullName"
                      value={accountForm.fullName}
                      onChange={handleAccountChange}
                      placeholder="Nhập họ và tên"
                      className="mt-1"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">{accountForm.fullName || '---'}</span>
                  )}
                </div>
                <div>
                  <span className="block text-gray-500 text-sm">Email</span>
                  <span className="font-medium text-gray-900">{accountForm.email || '---'}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-sm">Số điện thoại</span>
                  {editMode ? (
                    <Input
                      name="phoneNumber"
                      value={accountForm.phoneNumber}
                      onChange={handleAccountChange}
                      placeholder="Nhập số điện thoại"
                      className="mt-1"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">{accountForm.phoneNumber || '---'}</span>
                  )}
                </div>
                <div>
                  <span className="block text-gray-500 text-sm">Ngày sinh</span>
                  {editMode ? (
                    <Input
                      name="dateOfBirth"
                      type="date"
                      value={accountForm.dateOfBirth}
                      onChange={handleAccountChange}
                      className="mt-1"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">{accountForm.dateOfBirth ? formatDate(accountForm.dateOfBirth) : '---'}</span>
                  )}
                </div>
                <div>
                  <span className="block text-gray-500 text-sm">Giới tính</span>
                  {editMode ? (
                    <select
                      name="gender"
                      value={accountForm.gender}
                      onChange={handleAccountChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                    </select>
                  ) : (
                    <span className="font-medium text-gray-900">
                      {accountForm.gender === 'MALE' ? 'Nam' : accountForm.gender === 'FEMALE' ? 'Nữ' : accountForm.gender === 'other' ? 'Khác' : '---'}
                    </span>
                  )}
                </div>
                <div>
                  <span className="block text-gray-500 text-sm">Địa chỉ</span>
                  {editMode ? (
                    <Input
                      name="address"
                      value={accountForm.address}
                      onChange={handleAccountChange}
                      placeholder="Nhập địa chỉ"
                      className="mt-1"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">{accountForm.address || '---'}</span>
                  )}
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  {editMode ? (
                    <>
                      <Button type="button" onClick={handleAccountSave} disabled={loadingAccount}>
                        Lưu
                      </Button>
                      <Button type="button" variant="outline" onClick={handleAccountCancel}>
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={handleAccountEdit}>
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Settings;
