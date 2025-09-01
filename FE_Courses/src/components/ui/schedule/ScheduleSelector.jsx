import React, { useState, useMemo } from 'react';
import { FaClock, FaCheck, FaTimes, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';

const ScheduleSelector = ({ schedules, setSchedules, errors }) => {
  // Định nghĩa các ngày trong tuần
  const daysOfWeek = [
    { key: 'MONDAY', label: 'Thứ 2', shortLabel: 'T2' },
    { key: 'TUESDAY', label: 'Thứ 3', shortLabel: 'T3' },
    { key: 'WEDNESDAY', label: 'Thứ 4', shortLabel: 'T4' },
    { key: 'THURSDAY', label: 'Thứ 5', shortLabel: 'T5' },
    { key: 'FRIDAY', label: 'Thứ 6', shortLabel: 'T6' },
    { key: 'SATURDAY', label: 'Thứ 7', shortLabel: 'T7' },
    { key: 'SUNDAY', label: 'CN', shortLabel: 'CN' }
  ];

  // Định nghĩa các ca học
  const timeSlots = [
    { key: 'SLOT_1', label: 'Ca 1', time: '06:45 - 09:15', period: 'Sáng sớm' },
    { key: 'SLOT_2', label: 'Ca 2', time: '09:25 - 11:55', period: 'Sáng' },
    { key: 'SLOT_3', label: 'Ca 3', time: '12:10 - 13:00', period: 'Trưa' },
    { key: 'SLOT_4', label: 'Ca 4', time: '14:50 - 17:20', period: 'Chiều' },
    { key: 'SLOT_5', label: 'Ca 5', time: '17:30 - 20:00', period: 'Tối' }
  ];

  // Kiểm tra xem một lịch học đã được chọn chưa
  const isScheduleSelected = (dayOfWeek, timeSlot) => {
    return schedules.some(schedule =>
      schedule.dayOfWeek === dayOfWeek && schedule.timeSlot === timeSlot
    );
  };

  // Xử lý toggle lịch học
  const handleToggleSchedule = (dayOfWeek, timeSlot) => {
    const isSelected = isScheduleSelected(dayOfWeek, timeSlot);

    if (isSelected) {
      // Bỏ chọn - xóa khỏi danh sách
      const updatedSchedules = schedules.filter(schedule =>
        !(schedule.dayOfWeek === dayOfWeek && schedule.timeSlot === timeSlot)
      );
      setSchedules(updatedSchedules);
    } else {
      // Chọn - thêm vào danh sách
      const newSchedule = {
        dayOfWeek,
        timeSlot,
        timeRange: timeSlots.find(slot => slot.key === timeSlot)?.time
      };
      setSchedules([...schedules, newSchedule]);
    }
  };

  // Tính toán thống kê
  const stats = useMemo(() => {
    const totalSlots = schedules.length;
    const dayCount = new Set(schedules.map(s => s.dayOfWeek)).size;
    return { totalSlots, dayCount };
  }, [schedules]);

  return (
    <div className="space-y-6">
      {/* Header với thông tin */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <FaCalendarAlt className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Chọn lịch học</h4>
            <p className="text-sm text-gray-500">Chọn các ca học phù hợp trong tuần</p>
          </div>
        </div>

        {/* Thống kê */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <FaClock className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 font-medium">{stats.totalSlots} ca đã chọn</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
            <FaCalendarAlt className="w-4 h-4 text-green-600" />
            <span className="text-green-700 font-medium">{stats.dayCount} ngày/tuần</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Đã chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white rounded border-2 border-gray-300"></div>
          <span className="text-sm text-gray-600">Chưa chọn</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <FaInfoCircle className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-600">Click để chọn/bỏ chọn ca học</span>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header với các ngày */}
          <div className="grid grid-cols-8 gap-2 mb-4">
            <div className="p-3"></div> {/* Ô trống cho cột thời gian */}
            {daysOfWeek.map(day => (
              <div key={day.key} className="text-center p-3">
                <div className="font-semibold text-gray-900 text-sm md:text-base">
                  <span className="hidden sm:inline">{day.label}</span>
                  <span className="sm:hidden">{day.shortLabel}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Grid các ca học */}
          <div className="space-y-2">
            {timeSlots.map(slot => (
              <div key={slot.key} className="grid grid-cols-8 gap-2 items-center">
                {/* Cột thông tin ca học */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="text-sm font-semibold text-gray-900">{slot.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <div className="hidden sm:block">{slot.time}</div>
                    <div className="text-blue-600 font-medium">{slot.period}</div>
                  </div>
                </div>

                {/* Các ô chọn theo ngày */}
                {daysOfWeek.map(day => {
                  const isSelected = isScheduleSelected(day.key, slot.key);
                  return (
                    <button
                      key={`${day.key}-${slot.key}`}
                      type="button"
                      onClick={() => handleToggleSchedule(day.key, slot.key)}
                      className={`
                        relative p-4 h-16 rounded-lg border-2 transition-all duration-200 
                        hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        ${isSelected 
                          ? 'bg-blue-500 border-blue-600 text-white shadow-lg' 
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaCheck className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {!isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Danh sách lịch đã chọn */}
      {schedules.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaCheck className="w-4 h-4 text-green-600" />
            <h5 className="font-semibold text-gray-900">Lịch học đã chọn ({schedules.length})</h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {schedules.map((schedule, index) => {
              const day = daysOfWeek.find(d => d.key === schedule.dayOfWeek);
              const slot = timeSlots.find(s => s.key === schedule.timeSlot);

              return (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <FaClock className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-blue-900">
                        {day?.label} - {slot?.label}
                      </div>
                      <div className="text-xs text-blue-700">{slot?.time}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSchedule(schedule.dayOfWeek, schedule.timeSlot)}
                    className="w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Thông báo lỗi */}
      {errors?.schedules && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-600">
            <FaTimes className="w-4 h-4" />
            <span className="text-sm font-medium">Lỗi lịch học</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{errors.schedules.message}</p>
        </div>
      )}

      {/* Hướng dẫn */}
      {schedules.length === 0 && (
        <div className="text-center py-8 px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCalendarAlt className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Chưa có lịch học nào</h4>
          <p className="text-gray-500 text-sm">
            Hãy chọn các ca học phù hợp bằng cách click vào các ô trong bảng trên
          </p>
        </div>
      )}
    </div>
  );
};

export default ScheduleSelector;
