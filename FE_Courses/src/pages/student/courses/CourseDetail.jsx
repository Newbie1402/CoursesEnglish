import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseDetail } from "@/services/hooks/studentService";
import { getTeacherDetails } from "@/services/hooks/teacherService";
import ExamCard from "@/components/student/ExamCard";
import { formatDate } from "@/lib/utils.js";
import {
    BookOpen,
    Clock,
    Calendar,
    User,
    PlayCircle,
    FileText,
    Download,
    ChevronDown,
    CheckCircle2,
    ExternalLink,
    Loader2,
    GraduationCap,
    Globe,
} from "lucide-react";

/* Use the same BASE_URL + bearer token as the rest of the app */
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ---------- Normalizers (no fake data added) ---------- */
const normalizeSchedules = (raw) => {
    const list = Array.isArray(raw)
        ? raw
        : raw?.courseSchedules || raw?.schedule || [];
    return Array.isArray(list)
        ? list.map((s) => {
            const dayOfWeek = s?.dayOfWeek ?? s?.day ?? s?.day_of_week ?? "";
            const timeRange =
                s?.timeRange ??
                s?.timeSlot ??
                (s?.startTime && s?.endTime ? `${s.startTime}-${s.endTime}` : "") ??
                "";
            return { dayOfWeek, timeRange };
        })
        : [];
};

const normalizeCourse = (c) => ({
    id: c?.courseId ?? c?.id,
    name: c?.name ?? c?.title ?? c?.courseName ?? "Khoá học",
    code: c?.code ?? c?.courseCode ?? "",
    description: c?.description ?? "",
    teacherId: (c?.teacherId ?? c?.teacher?.teacherId ?? c?.teacher?.id),
    teacherName: c?.teacherName ?? c?.teacher?.fullName ?? c?.teacher?.name ?? "",
    schedules: normalizeSchedules(c?.schedules),
    startDate: c?.startDate || null,
    endDate: c?.endDate || null,
    online: c?.online ?? false,
    active: c?.active ?? true,
});

const normalizeLesson = (l) => ({
    id: l?.lessonId ?? l?.id,
    title: l?.title ?? l?.name ?? "Bài học",
    date:
        l?.date ??
        l?.lessonDate ??
        (typeof l?.createdAt === "string" ? l.createdAt.slice(0, 10) : "") ??
        "",
    completed: Boolean(l?.completed ?? false),
    contentUrl: l?.contentUrl ?? l?.fileUrl ?? l?.materialUrl ?? null,
});

const normalizeExam = (e) => ({
  examId: e?.examId ?? e?.id,
  title: e?.title ?? e?.name ?? "Bài kiểm tra",
  startTime: e?.startTime ?? e?.startAt ?? "",
  endTime: e?.endTime ?? e?.endAt ?? "",
  durationMinutes: e?.durationMinutes ?? e?.duration ?? null,
  type: e?.type ?? e?.examType ?? '',
  description: e?.description ?? '',
  password: e?.password ?? null,
  active: e?.active ?? true,
  submittedAt: e?.submittedAt ?? e?.studentSubmittedAt ?? e?.studentSubmission?.submittedAt ?? null,
});

/* Join schedules as a readable string for the small header line */
// (formatDay removed because unused)

// Hàm chuẩn hóa tên file hiển thị: bỏ tiền tố UUID hoặc chuỗi hash dài trước dấu '_'
const extractDisplayFileName = (rawUrl) => {
    if (!rawUrl) return '';
    let rawFile = (rawUrl.split('/').pop() || '').split('?')[0];
    try { rawFile = decodeURIComponent(rawFile); } catch (_) {}
    // Remove repeated prefix patterns (loop up to 3 times to be safe)
    for (let i = 0; i < 3; i++) {
        const before = rawFile;
        rawFile = rawFile
            // UUID v4 + '_'
            .replace(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}_/, '')
            // 32 hex + '_'
            .replace(/^[0-9a-fA-F]{32}_/, '')
            // timestamp 10-14 digits + '_'
            .replace(/^[0-9]{10,14}_/, '')
            // long hash/dash >=20 + '_'
            .replace(/^[0-9a-fA-F-]{20,}_/, '');
        if (before === rawFile) break; // no more changes
    }
    // Return as-is (keep underscores per requirement: e.g., CPU_Scheduling.xlsx)
    return rawFile;
};

const CourseDetail = () => {
    const { id } = useParams(); // courseId from URL
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [exams, setExams] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingExtra, setLoadingExtra] = useState(true);
    const [openLessons, setOpenLessons] = useState({}); // id -> boolean mở dropdown tài liệu

    /* 1) Load main course detail via studentService */
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            try {
                const raw = await getCourseDetail(id); // may already be unwrapped OR wrapped
                if (!mounted) return;
                // Defensive unwrap if backend returns {statusCode, message, data:{...}}
                const courseObj = raw && raw.courseId ? raw : (raw?.data?.courseId ? raw.data : raw?.data?.data?.courseId ? raw.data.data : raw);
                if (!courseObj || (!courseObj.courseId && !courseObj.id)) {
                    console.warn('[CourseDetail] Dữ liệu khóa học không hợp lệ:', raw);
                }
                const normalized = normalizeCourse(courseObj || {});
                setCourse(normalized);
            } catch (e) {
                console.error("Failed to load course detail:", e);
                setCourse(null);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    // Fetch teacher fullName if missing and we have teacherId
    useEffect(() => {
        let cancel = false;
        (async () => {
            if (!course) return;
            // teacherId = 0 coi như chưa phân công → bỏ qua fetch
            if (course.teacherId === 0) return null;
            if (course.teacherName && course.teacherName.trim().length) return;
            if (!course.teacherId) return;
            try {
                const detail = await getTeacherDetails(course.teacherId);
                if (cancel) return;
                if (detail.data?.fullName || detail?.name) {
                    setCourse((prev) => prev ? { ...prev, teacherName: detail.data.fullName || detail.name } : prev);
                }
            } catch (e) {
                // silent
            }
        })();
        return () => { cancel = true; };
    }, [course?.teacherId, course?.teacherName]);

    /* 2) Load related lessons & active exams using documented APIs */
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoadingExtra(true);
            try {
                const [lessonsRes, examsRes] = await Promise.all([
                    fetch(`${BASE_URL}/api/lessons/course/${id}/active`, {
                        headers: { "Content-Type": "application/json", ...authHeaders() },
                    }).then((r) => (r.ok ? r.json() : Promise.reject(r))),
                    fetch(`${BASE_URL}/api/exams/course/${id}/active`, {
                        headers: { "Content-Type": "application/json", ...authHeaders() },
                    }).then((r) => (r.ok ? r.json() : Promise.reject(r))),
                ]);

                // unwrap {statusCode, message, data} if present
                const lessonsData = lessonsRes?.data ?? lessonsRes ?? [];
                const examsData = examsRes?.data ?? examsRes ?? [];

                if (!mounted) return;
                setLessons(Array.isArray(lessonsData) ? lessonsData.map(normalizeLesson) : []);
                setExams(Array.isArray(examsData) ? examsData.map(normalizeExam) : []);
            } catch (e) {
                console.warn("Extra course data (lessons/exams) not fully available:", e);
                if (mounted) {
                    setLessons([]);
                    setExams([]);
                }
            } finally {
                if (mounted) setLoadingExtra(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [id]);

    const handleStartExam = (examId) => {
        if (!examId) return;
        navigate(`/student/exams/${examId}`);
    };

    const toggleLesson = (lessonId) => {
        setOpenLessons((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
    };

    const computeExamStatus = (exam) => {
        const start = exam.startTime ? new Date(exam.startTime).getTime() : null;
        const end = exam.endTime ? new Date(exam.endTime).getTime() : null;
        const now = Date.now();
        if (!start) return 'unknown';
        if (now < start) return 'upcoming';
        if (end) {
            if (now > end) return 'completed';
            if (now >= start && now <= end) return 'ongoing';
        } else {
            return 'ongoing';
        }
        return 'completed';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-6xl mx-auto p-6">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="relative mb-6">
                                <div className="w-16 h-16 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                </div>
                                <div className="absolute -inset-2 bg-blue-100 rounded-full animate-pulse opacity-50"></div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Đang tải chi tiết khóa học</h3>
                            <p className="text-gray-500">Vui lòng chờ trong giây lát...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
                        <BookOpen className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Không tìm thấy khóa học</h3>
                    <p className="text-gray-500 mb-6">Khóa học này có thể đã bị xóa hoặc bạn không có quyền truy cập.</p>
                    <button
                        onClick={() => navigate('/student/courses')}
                        className="px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors"
                    >
                        Quay lại danh sách khóa học
                    </button>
                </div>
            </div>
        );
    }

    const completedLessons = lessons.filter((l) => l.completed).length;
    const progressPercent = lessons.length ? Math.round((completedLessons / lessons.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Modern Hero Header */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"></div>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative backdrop-blur-sm bg-white/10 rounded-3xl border border-white/20 shadow-2xl">
                        <div className="p-8 md:p-10">
                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                {/* Course Info */}
                                <div className="flex-1 text-white">
                                    <div className="mb-4">
                                        <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                                            {course.name}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-4 text-blue-100">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span>{course.teacherName || "Chưa phân công"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(course.startDate) || "?"} → {formatDate(course.endDate) || "?"}</span>
                                            </div>
                                            {course.online && (
                                                <div className="flex items-center gap-2">
                                                    <Globe className="w-4 h-4" />
                                                    <span>Online</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {course.description && (
                                        <p className="text-blue-100 text-lg mb-6 leading-relaxed max-w-3xl">
                                            {course.description}
                                        </p>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-4">
                                        <button className="group flex items-center px-6 py-3 bg-white/90 backdrop-blur text-blue-600 rounded-2xl hover:bg-white hover:scale-105 transition-all duration-200 font-medium shadow-lg">
                                            <PlayCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                            Vào lớp học
                                        </button>
                                        <button
                                            onClick={() => navigate(`/student/courses/${course.id}/exams`)}
                                            className="group flex items-center px-6 py-3 bg-white/20 backdrop-blur text-white border border-white/30 rounded-2xl hover:bg-white/30 hover:scale-105 transition-all duration-200 font-medium"
                                        >
                                            <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                            Xem bài kiểm tra
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modern Exam Section */}
                {!loadingExtra && Array.isArray(exams) && exams.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Bài kiểm tra sắp diễn ra</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exams.map((exam) => {
                                const status = computeExamStatus(exam);
                                if (!(status === 'upcoming' || status === 'ongoing')) return null;
                                return (
                                    <div key={exam.examId} className="transform transition-all duration-300 hover:scale-105">
                                        <ExamCard
                                            exam={exam}
                                            onStart={handleStartExam}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Enhanced Lessons Section */}
                {!loadingExtra && Array.isArray(lessons) && lessons.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Danh sách bài học</h2>
                            <div className="ml-auto text-sm text-gray-500">
                                {lessons.length} bài học
                            </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden">
                            <div className="divide-y divide-gray-100/50">
                                {lessons.slice(0, 50).map((lesson, index) => {
                                    const isOpen = !!openLessons[lesson.id];
                                    const hasFile = !!lesson.contentUrl;
                                    const displayFileName = extractDisplayFileName(lesson.contentUrl);

                                    return (
                                        <div key={lesson.id} className="group hover:bg-white/60 transition-all duration-200">
                                            <div
                                                className={`p-6 ${hasFile ? 'cursor-pointer' : ''}`}
                                                onClick={hasFile ? () => toggleLesson(lesson.id) : undefined}
                                                role={hasFile ? "button" : undefined}
                                                tabIndex={hasFile ? 0 : undefined}
                                                onKeyDown={hasFile ? (e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        toggleLesson(lesson.id);
                                                    }
                                                } : undefined}
                                                aria-label={hasFile ? (isOpen ? 'Ẩn tài liệu bài học' : 'Hiện tài liệu bài học') : undefined}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        {/* Lesson Number */}
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-sm font-bold text-blue-600 group-hover:scale-110 transition-transform">
                                                            {index + 1}
                                                        </div>

                                                        {/* File Toggle - Visual Indicator Only */}
                                                        {hasFile ? (
                                                            <div className="mt-1 p-2 text-gray-500 group-hover:text-blue-600 group-hover:bg-blue-50 rounded-lg transition-all duration-200">
                                                                <ChevronDown
                                                                    className={`w-4 h-4 transform transition-all duration-300 ease-in-out ${isOpen ? 'rotate-180 text-blue-600' : 'rotate-0'}`}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-8" />
                                                        )}

                                                        {/* Lesson Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className={`font-semibold text-gray-800 text-lg leading-tight ${hasFile ? 'group-hover:text-blue-700' : ''} transition-colors duration-200`}>
                                                                    {lesson.title}
                                                                </h3>
                                                                {hasFile && (
                                                                    <FileText className={`w-4 h-4 transition-colors duration-200 ${isOpen ? 'text-blue-600' : 'text-blue-500 group-hover:text-blue-600'}`} />
                                                                )}
                                                            </div>
                                                            {lesson.date && (
                                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>{lesson.date}</span>
                                                                </div>
                                                            )}
                                                            {hasFile && (
                                                                <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                    Click để {isOpen ? 'ẩn' : 'xem'} tài liệu
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Enhanced File Download Section with Smooth Animation */}
                                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                                    hasFile && isOpen 
                                                        ? 'max-h-32 opacity-100 mt-6' 
                                                        : 'max-h-0 opacity-0 mt-0'
                                                }`}>
                                                    <div className={`ml-14 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100 transform transition-all duration-300 ease-out ${
                                                        hasFile && isOpen 
                                                            ? 'translate-y-0 scale-100' 
                                                            : 'translate-y-2 scale-95'
                                                    }`}>
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center transform transition-all duration-200 ${
                                                                    isOpen ? 'scale-100' : 'scale-90'
                                                                }`}>
                                                                    <Download className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${
                                                                        isOpen ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
                                                                    }`} />
                                                                </div>
                                                                <div className={`transform transition-all duration-300 delay-75 ${
                                                                    isOpen ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-70'
                                                                }`}>
                                                                    <p className="font-medium text-gray-800 truncate max-w-xs" title={displayFileName}>
                                                                        {displayFileName}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500">Tài liệu bài học</p>
                                                                </div>
                                                            </div>
                                                            <a
                                                                href={lesson.contentUrl}
                                                                download
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()} // Prevent triggering lesson toggle
                                                                className={`group flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 font-medium transform ${
                                                                    isOpen 
                                                                        ? 'translate-x-0 opacity-100 scale-100 delay-100' 
                                                                        : 'translate-x-4 opacity-0 scale-95'
                                                                } hover:scale-105 hover:shadow-lg`}
                                                            >
                                                                <Download className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                                                Tải xuống
                                                                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* Empty States */}
                {!loadingExtra && (!lessons.length && !exams.length) && (
                    <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 shadow-lg">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <BookOpen className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                            Chưa có nội dung học tập
                        </h3>
                        <p className="text-gray-500 text-lg mb-8 max-w-2xl mx-auto">
                            Khóa học này chưa có bài học hoặc bài kiểm tra nào. Hãy quay lại sau khi giảng viên cập nhật nội dung.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseDetail;

