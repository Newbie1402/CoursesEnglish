import React, { useMemo, useState, useEffect } from "react";

// Tách style trạng thái ra ngoài để tránh tạo lại mỗi lần render và dễ tái sử dụng / test
const STATUS_STYLES = {
  upcoming: "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
  ongoing: "bg-green-50 text-green-600 ring-1 ring-green-200 animate-pulse",
  completed: "bg-gray-100 text-gray-600 ring-1 ring-gray-300",
  unknown: "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-300",
};

const STUDENT_STATUS_STYLES = {
  not_started: 'bg-slate-100 text-slate-600 ring-1 ring-slate-300',
  in_progress: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300',
  submitted: 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'upcoming': return 'Sắp diễn ra';
    case 'ongoing': return 'Đang diễn ra';
    case 'completed': return 'Đã kết thúc';
    default: return 'Không rõ';
  }
};

const ExamCard = ({ exam, onStart, studentStatus }) => {
  const [now, setNow] = useState(Date.now());

  // Cập nhật thời gian hiện tại định kỳ để status thay đổi (mặc định 60s)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const parsedStart = exam?.startTime ? new Date(exam.startTime).getTime() : null;
  const parsedEnd = exam?.endTime ? new Date(exam.endTime).getTime() : null;
  // Fallback endTime nếu backend chưa trả về endTime nhưng có duration
  const fallbackEnd = useMemo(() => {
    if (!parsedEnd && parsedStart && exam?.durationMinutes) {
      return parsedStart + exam.durationMinutes * 60 * 1000;
    }
    return parsedEnd;
  }, [parsedEnd, parsedStart, exam?.durationMinutes]);

  // Status ưu tiên so sánh trực tiếp endTime (hoặc fallbackEnd) với thời gian máy
  const status = useMemo(() => {
    if (!parsedStart) return 'unknown';
    if (now < parsedStart) return 'upcoming';
    if (fallbackEnd) {
      if (now > fallbackEnd) return 'completed';
      if (now >= parsedStart && now <= fallbackEnd) return 'ongoing';
    } else {
      // Không có endTime -> coi như đang diễn ra sau khi bắt đầu
      return 'ongoing';
    }
    return 'completed';
  }, [now, parsedStart, fallbackEnd]);

  const formatDateTime = (isoOrMs) => {
    if (!isoOrMs) return "--";
    const d = new Date(isoOrMs);
    if (isNaN(d.getTime())) return "--";
    return d.toLocaleString(undefined, {
      hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="border rounded-2xl p-4 shadow-sm bg-white flex flex-col gap-3 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold leading-snug line-clamp-2">{exam.title}</h3>
        <span className={`px-3 py-1 text-xs font-medium rounded-full shrink-0 ${STATUS_STYLES[status] || STATUS_STYLES.unknown}`}>{getStatusLabel(status)}</span>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <p><span className="font-medium">Bắt đầu:</span> {formatDateTime(exam.startTime)}</p>
        {fallbackEnd && <p><span className="font-medium">Kết thúc:</span> {formatDateTime(fallbackEnd)}</p>}
        {exam.durationMinutes !== null && exam.durationMinutes !== undefined && (
          <p><span className="font-medium">Thời lượng:</span> {exam.durationMinutes} phút</p>
        )}
        <p><span className="font-medium">Loại:</span> {exam.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : exam.type === 'WRITING' ? 'Tự luận' : exam.type || '--'}</p>
      </div>
      {exam.description && (
        <p className="text-sm text-gray-500 line-clamp-3">{exam.description}</p>
      )}
      <div className="mt-1 flex items-center gap-2">
        <button
          disabled={status !== 'ongoing'}
          onClick={() => onStart && onStart(exam.examId)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${status === 'ongoing' ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' : 'bg-gray-200 text-gray-600'}`}
        >
          {status === 'upcoming' ? 'Chưa mở' : status === 'ongoing' ? (studentStatus === 'in_progress' ? 'Tiếp tục' : 'Vào làm') : 'Đã kết thúc'}
        </button>
        {exam.password && (
          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md">Yêu cầu mật khẩu</span>
        )}
        {!exam.active && (
          <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-md">Đã vô hiệu</span>
        )}
      </div>
    </div>
  );
};

export default ExamCard;
