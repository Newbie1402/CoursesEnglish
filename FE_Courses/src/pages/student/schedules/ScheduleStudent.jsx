import React, { useEffect, useMemo, useState } from 'react';
import { getCourseOfStudent } from '@/services/hooks/courseService';
import { useAuth } from '@/contexts/AuthContext.jsx';
import {
  Calendar,
  Clock,
  BookOpen,
  Loader2,
  CalendarDays,
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Home,
  AlertCircle
} from 'lucide-react';

/* Mapping dayOfWeek backend -> readable & order */
const DAY_ORDER = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const DAY_LABEL = {
  MONDAY: 'Thứ 2',
  TUESDAY: 'Thứ 3',
  WEDNESDAY: 'Thứ 4',
  THURSDAY: 'Thứ 5',
  FRIDAY: 'Thứ 6',
  SATURDAY: 'Thứ 7',
  SUNDAY: 'Chủ nhật'
};

const DAY_SHORT = {
  MONDAY: 'T2',
  TUESDAY: 'T3',
  WEDNESDAY: 'T4',
  THURSDAY: 'T5',
  FRIDAY: 'T6',
  SATURDAY: 'T7',
  SUNDAY: 'CN'
};

/* Utility parse date string (YYYY-MM-DD) safely */
const toDate = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt;
};

const TIME_SLOT_MAP = {
  SLOT_1: '06:45 - 09:15',
  SLOT_2: '09:25 - 11:55',
  SLOT_3: '12:10 - 13:00',
  SLOT_4: '14:50 - 17:20',
  SLOT_5: '17:30 - 20:00',
  SLOT_6: '20:10 - 21:50',
};

const slotOrder = (slot) => {
  if (!slot) return 999;
  const m = /SLOT_(\d+)/.exec(slot.toUpperCase());
  return m ? parseInt(m[1], 10) : 500;
};

// Color themes for different courses
const courseColors = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-amber-100 text-amber-800 border-amber-200',
];

const ScheduleStudent = () => {
  const { studentId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // Fetch courses when studentId ready
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!studentId) { setLoading(false); return; }
      setLoading(true);
      try {
        const list = await getCourseOfStudent(studentId);
        if (!mounted) return;
        setCourses(Array.isArray(list) ? list : []);
      } catch (e) {
        if (mounted) {
          console.error(e);
            setError('Không tải được lịch học.');
            setCourses([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [studentId]);

  // Determine global date range across all courses
  const { minDate, maxDate } = useMemo(() => {
    let min = null, max = null;
    courses.forEach(c => {
      const s = toDate(c.startDate);
      const e = toDate(c.endDate);
      if (s && (!min || s < min)) min = s;
      if (e && (!max || e > max)) max = e;
    });
    return { minDate: min, maxDate: max };
  }, [courses]);

  // Clamp selectedDate if goes outside after data load
  useEffect(() => {
    if (!minDate || !maxDate) return; // nothing to clamp
    if (selectedDate < minDate) setSelectedDate(minDate);
    else if (selectedDate > maxDate) setSelectedDate(maxDate);
  }, [minDate, maxDate]);

  // Tính weekStart trước khi sử dụng trong timetable
  const weekStart = useMemo(() => {
    const d = new Date(selectedDate);
    // JS getDay: 0=Sun..6=Sat, we want Monday as start
    const jsDow = d.getDay();
    const offset = jsDow === 0 ? -6 : 1 - jsDow; // if Sunday move back 6, else back to Monday
    const start = new Date(d);
    start.setDate(d.getDate() + offset);
    start.setHours(0,0,0,0);
    return start;
  }, [selectedDate]);

  const weekEnd = useMemo(() => {
    const e = new Date(weekStart);
    e.setDate(weekStart.getDate() + 6);
    return e;
  }, [weekStart]);

  // Build timetable map: { MONDAY: [ {courseId,title,timeRange,startDate,endDate,isActive} ] }
  const timetable = useMemo(() => {
    const map = {};
    DAY_ORDER.forEach(d => { map[d] = []; });

    courses.forEach(course => {
      if (!course?.schedules) return;

      const courseStartDate = toDate(course.startDate);
      const courseEndDate = toDate(course.endDate);

      course.schedules.forEach(s => {
        const day = s.dayOfWeek?.toUpperCase();
        if (!DAY_ORDER.includes(day)) return;

        // Tính ngày cụ thể trong tuần cho lịch học này
        const dayIndex = DAY_ORDER.indexOf(day);
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + dayIndex);
        dayDate.setHours(0, 0, 0, 0);

        // Kiểm tra ngày cụ thể này có trong khoảng thời gian khóa học không
        const isInDateRange = (!courseStartDate || dayDate >= courseStartDate) &&
                             (!courseEndDate || dayDate <= courseEndDate);

        if (!isInDateRange) return; // Bỏ qua lịch học ngoài khoảng thời gian

        const rawSlot = s.timeSlot || s.slot || s.slotCode;
        const derivedRange = s.timeRange || TIME_SLOT_MAP[rawSlot?.toUpperCase?.()] || '';

        // Determine course status based on current date
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const isActive = (!courseStartDate || now >= courseStartDate) &&
                        (!courseEndDate || now <= courseEndDate);
        const isUpcoming = courseStartDate && now < courseStartDate;
        const isCompleted = courseEndDate && now > courseEndDate;

        map[day].push({
          courseId: course.courseId ?? course.id,
          title: course.title ?? course.name ?? 'Khoá học',
          timeRange: derivedRange || rawSlot || '',
          slotIndex: slotOrder(rawSlot),
          startDate: courseStartDate,
          endDate: courseEndDate,
          isActive,
          isUpcoming,
          isCompleted,
          courseCode: course.code || course.courseCode || '',
          // Thêm thông tin ngày cụ thể cho debug
          specificDate: dayDate.toDateString(),
        });
      });
    });

    DAY_ORDER.forEach(d => {
      map[d].sort((a,b)=> a.slotIndex === b.slotIndex ? a.timeRange.localeCompare(b.timeRange) : a.slotIndex - b.slotIndex);
    });
    return map;
  }, [courses, weekStart]); // Bây giờ có thể sử dụng weekStart an toàn

  // Filter displayed sessions for selectedDate (only highlight column, not filtering out others)
  const selectedDow = useMemo(() => DAY_ORDER[(selectedDate.getDay()+6)%7], [selectedDate]); // convert JS Sunday=0 -> index 6 mapping

  const handleDateChange = (e) => {
    const v = e.target.value;
    if (!v) return;
    const d = toDate(v);
    if (!d) return;
    // enforce within range
    if (minDate && d < minDate) return;
    if (maxDate && d > maxDate) return;
    setSelectedDate(d);
  };


  const formatDateSelect = (d) => d ? d.toISOString().slice(0,10) : '';

    const formatDate = (date) => {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d)) return '';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

  const clampDate = (d) => {
    if (minDate && d < minDate) return new Date(minDate);
    if (maxDate && d > maxDate) return new Date(maxDate);
    return d;
  };

  const shiftWeek = (delta) => {
    const target = new Date(weekStart);
    target.setDate(weekStart.getDate() + delta * 7);
    const clamped = clampDate(target);
    setSelectedDate(clamped);
  };

  const goToday = () => {
    const today = clampDate(new Date());
    setSelectedDate(today);
  };

  // Tính toán tuần chứa maxDate để xác định giới hạn điều hướng
  const maxDateWeekStart = useMemo(() => {
    if (!maxDate) return null;
    const d = new Date(maxDate);
    const jsDow = d.getDay();
    const offset = jsDow === 0 ? -6 : 1 - jsDow;
    const start = new Date(d);
    start.setDate(d.getDate() + offset);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [maxDate]);

  const canPrevWeek = useMemo(() => {
    if (!minDate) return false;
    const prevStart = new Date(weekStart);
    prevStart.setDate(weekStart.getDate() - 7);
    return prevStart >= minDate;
  }, [weekStart, minDate]);

  const canNextWeek = useMemo(() => {
    if (!maxDate || !maxDateWeekStart) return false;
    // Cho phép điều hướng đến tuần chứa maxDate
    return weekStart < maxDateWeekStart;
  }, [weekStart, maxDate, maxDateWeekStart]);

  const rangeLabel = useMemo(() => {
    if (!minDate || !maxDate) return 'Chưa có dữ liệu thời gian';
    return `${formatDate(minDate)} → ${formatDate(maxDate)}`;
  }, [minDate,maxDate]);

  const currentWeekLabel = useMemo(() => {
    return `${formatDate(weekStart)} → ${formatDate(weekEnd)}`;
  }, [weekStart, weekEnd]);

  // Create color mapping for courses
  const courseColorMap = useMemo(() => {
    const map = {};
    courses.forEach((course, index) => {
      const courseId = course.courseId ?? course.id;
      map[courseId] = courseColors[index % courseColors.length];
    });
    return map;
  }, [courses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Modern Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative backdrop-blur-sm bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
                  <CalendarDays className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-2">Lịch học của tôi</h1>
                  <p className="text-blue-100 text-lg">
                    Xem thời khóa biểu các khóa học bạn đã đăng ký
                  </p>
                </div>
              </div>

              <div className="hidden md:block text-right text-white">
                <div className="text-sm text-blue-100 mb-1">Khoảng thời gian khóa học</div>
                <div className="text-lg font-medium">{rangeLabel}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Date Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                Chọn ngày
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formatDateSelect(selectedDate)}
                  min={formatDateSelect(minDate)}
                  max={formatDateSelect(maxDate)}
                  onChange={handleDateChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur disabled:opacity-50"
                  disabled={!minDate || !maxDate}
                />
              </div>
            </div>

            {/* Week Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4" />
                Tuần hiện tại
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="text-blue-800 font-semibold">{currentWeekLabel}</div>
                {loading && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm mt-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tải dữ liệu...
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex gap-3">
              <button
                onClick={() => shiftWeek(-1)}
                disabled={!canPrevWeek}
                className="group flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl transition-all duration-200 font-medium"
              >
                <ArrowLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Tuần trước
              </button>

              <button
                onClick={goToday}
                className="group flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-all duration-200 font-medium"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Hôm nay
              </button>

              <button
                onClick={() => shiftWeek(1)}
                disabled={!canNextWeek}
                className="group flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl transition-all duration-200 font-medium"
              >
                Tuần sau
                <ArrowRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Timetable */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                  {DAY_ORDER.map(day => {
                    const dayDate = new Date(weekStart);
                    dayDate.setDate(weekStart.getDate() + DAY_ORDER.indexOf(day));
                    const isToday = dayDate.toDateString() === new Date().toDateString();
                    const isSelected = selectedDow === day;

                    return (
                      <th
                        key={day}
                        onClick={() => {
                          const idx = DAY_ORDER.indexOf(day);
                          const newDate = new Date(weekStart);
                          newDate.setDate(weekStart.getDate() + idx);
                          setSelectedDate(clampDate(newDate));
                        }}
                        className={`group px-6 py-4 font-semibold text-center cursor-pointer transition-all duration-200 relative ${
                          isSelected 
                            ? 'bg-blue-500 text-white shadow-lg' 
                            : isToday
                              ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                              : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="text-lg">{DAY_LABEL[day]}</div>
                          <div className="text-xs opacity-75">
                            {dayDate.getDate()}/{dayDate.getMonth() + 1}
                          </div>
                        </div>
                        {isToday && !isSelected && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                        {isSelected && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50"></div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {DAY_ORDER.map(day => (
                    <td
                      key={day}
                      className={`align-top px-4 py-6 border-t transition-colors duration-200 ${
                        selectedDow === day ? 'bg-blue-50/60' : 'bg-white/50'
                      }`}
                      style={{ width: '14.28%' }}
                    >
                      {timetable[day].length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                          <BookOpen className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-sm">Không có lịch</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {timetable[day].map((s, idx) => {
                            const colorClass = courseColorMap[s.courseId] || courseColors[0];
                            return (
                              <div
                                key={idx}
                                className={`group p-4 rounded-2xl border-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-105 ${colorClass} ${
                                  s.isCompleted ? 'opacity-75' : s.isUpcoming ? 'ring-2 ring-yellow-300' : ''
                                }`}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 opacity-75" />
                                      <span className="text-xs font-semibold">
                                        {s.timeRange || 'Thời gian chưa xác đ���nh'}
                                      </span>
                                    </div>
                                    {s.isUpcoming && (
                                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                                        Sắp diễn ra
                                      </span>
                                    )}
                                    {s.isCompleted && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                        Đã kết thúc
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-medium leading-tight">
                                    {s.title}
                                    {s.courseCode && (
                                      <span className="text-xs opacity-75 ml-2">({s.courseCode})</span>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="text-xs opacity-75 space-y-1">
                                    {s.startDate && s.endDate && (
                                      <div>
                                        Thời gian: {formatDate(s.startDate)} - {formatDate(s.endDate)}
                                      </div>
                                    )}
                                    <div>Click để xem chi tiết</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Lịch học trong tuần</h3>
              </div>

              {/* Mobile Day Selector */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {DAY_ORDER.map(day => {
                  const dayDate = new Date(weekStart);
                  dayDate.setDate(weekStart.getDate() + DAY_ORDER.indexOf(day));
                  const isToday = dayDate.toDateString() === new Date().toDateString();
                  const isSelected = selectedDow === day;

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        const idx = DAY_ORDER.indexOf(day);
                        const newDate = new Date(weekStart);
                        newDate.setDate(weekStart.getDate() + idx);
                        setSelectedDate(clampDate(newDate));
                      }}
                      className={`group flex-shrink-0 px-4 py-3 rounded-2xl transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-500 text-white shadow-lg scale-105'
                          : isToday
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-sm font-medium">{DAY_SHORT[day]}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {dayDate.getDate()}/{dayDate.getMonth() + 1}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Schedule Cards */}
              <div className="space-y-4">
                {DAY_ORDER.filter(day => selectedDow === day).map(day => (
                  <div key={day}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <h4 className="font-semibold text-gray-800">{DAY_LABEL[day]}</h4>
                    </div>

                    {timetable[day].length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-2xl">
                        <BookOpen className="w-12 h-12 mb-3 opacity-50" />
                        <span className="text-lg font-medium">Không có lịch học</span>
                        <span className="text-sm">Hãy nghỉ ngơi và tái tạo năng lượng</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {timetable[day].map((s, idx) => {
                          const colorClass = courseColorMap[s.courseId] || courseColors[0];
                          return (
                            <div
                              key={idx}
                              className={`p-5 rounded-2xl border-2 shadow-sm hover:shadow-md transition-all duration-200 ${colorClass}`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 opacity-75" />
                                  <span className="text-sm font-semibold">
                                    {s.timeRange || 'Thời gian chưa xác định'}
                                  </span>
                                </div>
                                <GraduationCap className="w-5 h-5 opacity-50" />
                              </div>
                              <div className="font-semibold text-lg leading-tight">
                                {s.title}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Empty State */}
          {!loading && courses.length === 0 && (
            <div className="text-center py-16 px-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CalendarDays className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                Chưa có khóa học nào
              </h3>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                Bạn chưa đăng ký khóa học nào để hiển thị lịch học. Hãy đăng ký khóa học để xem thời khóa biểu.
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Footer Note */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Hướng dẫn sử dụng:</strong> Click vào tên ngày để chọn ngày cụ thể.
              Cột được tô sáng ứng với ngày bạn đang chọn. Lịch học hiển thị dựa trên
              thông tin lịch trình của các khóa học bạn đã đăng ký.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleStudent;
