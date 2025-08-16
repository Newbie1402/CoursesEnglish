import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/Card';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Form, FormField } from '@/components/ui/form/Form';
import { FaSave, FaBell, FaLock, FaUser, FaCamera } from 'react-icons/fa';

const Settings = () => {
  const [activeTab, setActiveTab] = React.useState('profile');

  const tabs = [
    { id: 'profile', label: 'Hồ sơ', icon: FaUser },
    { id: 'security', label: 'Bảo mật', icon: FaLock },
    { id: 'notifications', label: 'Thông báo', icon: FaBell }
  ];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
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
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
              <Form className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src="https://ui-avatars.com/api/?name=Teacher+Name"
                        alt="Profile"
                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                      />
                      <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                        <FaCamera className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-gray-900">Ảnh đại diện</h4>
                    <p className="text-sm text-gray-500">
                      Nên là ảnh vuông, định dạng JPG hoặc PNG
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Họ và tên">
                    <Input defaultValue="Nguyễn Văn A" />
                  </FormField>

                  <FormField label="Email">
                    <Input defaultValue="teacher@example.com" type="email" />
                  </FormField>

                  <FormField label="Số điện thoại">
                    <Input defaultValue="+84 123 456 789" type="tel" />
                  </FormField>

                  <FormField label="Chức danh">
                    <Input defaultValue="Giảng viên tiếng Anh" />
                  </FormField>
                </div>

                <FormField label="Giới thiệu">
                  <textarea
                    className={cn(
                      "w-full px-3 py-2 border rounded-md h-32 resize-none",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      "placeholder:text-gray-400"
                    )}
                    defaultValue="Giảng viên có 5 năm kinh nghiệm giảng dạy tiếng Anh..."
                  />
                </FormField>

                <div className="flex justify-end">
                  <Button type="submit">
                    <FaSave className="mr-2" />
                    Lưu thay đổi
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle>Bảo mật tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <Form className="space-y-6">
                <FormField label="Mật khẩu hiện tại">
                  <Input type="password" />
                </FormField>

                <FormField label="Mật khẩu mới">
                  <Input type="password" />
                </FormField>

                <FormField label="Xác nhận mật khẩu mới">
                  <Input type="password" />
                </FormField>

                <div className="flex justify-end">
                  <Button type="submit">
                    <FaSave className="mr-2" />
                    Cập nhật mật khẩu
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Tùy chọn thông báo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Thông báo email</h4>
                    <p className="text-sm text-gray-500">Nhận thông báo qua email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className={cn(
                      "w-11 h-6 bg-gray-200 rounded-full peer",
                      "peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300",
                      "peer-checked:after:translate-x-full peer-checked:after:border-white",
                      "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                      "after:bg-white after:border-gray-300 after:border after:rounded-full",
                      "after:h-5 after:w-5 after:transition-all",
                      "peer-checked:bg-blue-600"
                    )}></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Thông báo trình duyệt</h4>
                    <p className="text-sm text-gray-500">Hiển thị thông báo trên trình duyệt</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className={cn(
                      "w-11 h-6 bg-gray-200 rounded-full peer",
                      "peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300",
                      "peer-checked:after:translate-x-full peer-checked:after:border-white",
                      "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                      "after:bg-white after:border-gray-300 after:border after:rounded-full",
                      "after:h-5 after:w-5 after:transition-all",
                      "peer-checked:bg-blue-600"
                    )}></div>
                  </label>
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

