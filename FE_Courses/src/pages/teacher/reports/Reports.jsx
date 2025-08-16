import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/Card';
import { Select } from '@/components/ui/select/Select';
import { FaChartLine, FaUsers, FaBook, FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import { cn } from '@/lib/utils';

const Reports = () => {
  const [timeRange, setTimeRange] = React.useState('this-month');
  const [isLoading, setIsLoading] = React.useState(false);

  const stats = [
    {
      title: 'Tổng học viên hoạt động',
      value: '245',
      change: '+12%',
      trend: 'up',
      icon: <FaUsers className="w-5 h-5 text-blue-500" />
    },
    {
      title: 'Tỉ lệ hoàn thành',
      value: '85%',
      change: '+5%',
      trend: 'up',
      icon: <FaCheckCircle className="w-5 h-5 text-green-500" />
    },
    {
      title: 'Khóa học đang diễn ra',
      value: '12',
      change: '0%',
      trend: 'neutral',
      icon: <FaBook className="w-5 h-5 text-purple-500" />
    },
    {
      title: 'Tăng trưởng học viên',
      value: '24%',
      change: '+2.5%',
      trend: 'up',
      icon: <FaChartLine className="w-5 h-5 text-yellow-500" />
    }
  ];

  const handleTimeRangeChange = (e) => {
    setIsLoading(true);
    setTimeRange(e.target.value);
    // Giả lập loading state
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <span>Dashboard</span>
              <FaChevronRight className="w-3 h-3" />
              <span className="font-medium text-gray-900">Báo cáo thống kê</span>
            </nav>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Báo cáo thống kê
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Xem tổng quan về hiệu quả giảng dạy và học tập
              </p>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              className="w-44 shadow-sm"
            >
              <option value="today">Hôm nay</option>
              <option value="this-week">Tuần này</option>
              <option value="this-month">Tháng này</option>
              <option value="last-month">Tháng trước</option>
              <option value="last-3-months">3 tháng gần đây</option>
              <option value="this-year">Năm nay</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={cn(
              "group hover:shadow-lg transition-all duration-300",
              "hover:-translate-y-1 active:translate-y-0",
              isLoading && "animate-pulse"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "p-2 rounded-lg transition-colors duration-300",
                  "group-hover:bg-gray-50"
                )}>
                  {stat.icon}
                </div>
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  stat.trend === 'up' && "text-green-600",
                  stat.trend === 'down' && "text-red-600",
                  stat.trend === 'neutral' && "text-gray-600",
                  "group-hover:scale-110 duration-300"
                )}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                  {stat.title}
                </h3>
                <p className="mt-2 text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tiến độ học tập theo khóa học</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-gray-500">
              Chart component sẽ được tích hợp sau
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bố điểm số học viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-gray-500">
              Chart component sẽ được tích hợp sau
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
