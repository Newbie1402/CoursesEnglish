import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card/Card";
import {
    FaLaptop,
    FaHeadset,
    FaUniversity,
    FaClipboardList,
    FaCalendarAlt,
    FaBell,
    FaBookOpen,
} from "react-icons/fa";
import { Calendar } from "antd";

import { useAuth } from "@/contexts/AuthContext.jsx";
import {
    getMyCourses,
    getMyExams,
    getMyResults,
    getUnreadNotificationCount,
    getStudentDetail,
} from "@/services/hooks/studentService";

// Map MONDAY..SUNDAY -> 0..6 (Sun=0 like dayjs/AntD)
const DOW = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
};

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { studentId: authStudentId, token } = useAuth();

    const [courses, setCourses] = useState([]);
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [displayName, setDisplayName] = useState("");

    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingExams, setLoadingExams] = useState(true);
    const [loadingResults, setLoadingResults] = useState(true);
    const [loadingNotif, setLoadingNotif] = useState(true);

    // Use studentId from auth if available
    const effectiveStudentId = useMemo(() => {
        const n = Number(authStudentId);
        return Number.isFinite(n) && n > 0 ? n : null;
    }, [authStudentId]);

    // Shortcuts
    const shortcuts = useMemo(
        () => [
            { label: "Đào tạo trực tuyến", icon: <FaLaptop className="w-8 h-8 text-blue-600" />, path: "/student/courses" },
            { label: "Hỗ trợ trực tuyến", icon: <FaHeadset className="w-8 h-8 text-blue-600" />, path: "/student/support" },
            { label: "Thanh toán trực tuyến", icon: <FaUniversity className="w-8 h-8 text-blue-600" />, path: "/student/payment" },
            { label: "Kết quả học tập", icon: <FaClipboardList className="w-8 h-8 text-blue-600" />, path: "/student/grades" },
            { label: "Đăng ký khóa học", icon: <FaCalendarAlt className="w-8 h-8 text-blue-600" />, path: "/student/course-registration" },
        ],
        []
    );

    // Normalize helpers (no made-up fields)
    const normalizeSchedules = useCallback((raw) => {
        const list = Array.isArray(raw)
            ? raw
            : raw?.schedules || raw?.courseSchedules || [];
        if (!Array.isArray(list)) return [];
        return list.map((s) => {
            const dayOfWeek = (s?.dayOfWeek || s?.day || "").toUpperCase();
            const timeRange =
                s?.timeRange ??
                s?.timeSlot ??
                (s?.startTime && s?.endTime ? `${s.startTime}-${s.endTime}` : "") ??
                "";
            return { dayOfWeek, timeRange };
        });
    }, []);

    const normalizeCourse = useCallback(
        (c) => ({
            id: c?.courseId ?? c?.id,
            name: c?.title ?? c?.courseName ?? "Khóa học",
            code: c?.code ?? c?.courseCode ?? "",
            teacherName:
                c?.teacherName ?? c?.teacher?.fullName ?? c?.teacher?.name ?? "Chưa cập nhật",
            creditCount: c?.creditCount ?? c?.credits ?? c?.credit ?? null,
            schedules: normalizeSchedules(c),
        }),
        [normalizeSchedules]
    );

    const normalizeExam = useCallback((e) => {
        const id = e?.examId ?? e?.id;
        return {
            id,
            title: e?.title ?? e?.name ?? `Bài kiểm tra #${id ?? ""}`,
            startAt: e?.startAt ?? e?.startTime ?? "",
            endAt: e?.endAt ?? e?.endTime ?? "",
            status: e?.status ?? "",
            courseId: e?.courseId ?? e?.course?.courseId ?? e?.course?.id ?? null,
        };
    }, []);

    // Fetch profile (for greeting), courses, exams, results, notifications
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!effectiveStudentId) {
                setLoadingCourses(false);
                setLoadingExams(false);
                setLoadingResults(false);
                setLoadingNotif(false);
                return;
            }

            // Profile for greeting (optional)
            try {
                const profile = await getStudentDetail(effectiveStudentId);
                if (mounted) {
                    const fullName =
                        profile?.fullName || profile?.user?.fullName || profile?.user?.name || "";
                    setDisplayName(fullName || `Học viên #${effectiveStudentId}`);
                }
            } catch {
                if (mounted) setDisplayName(`Học viên #${effectiveStudentId}`);
            }

            // Courses
            setLoadingCourses(true);
            try {
                const data = await getMyCourses(effectiveStudentId);
                const arr = Array.isArray(data) ? data : data?.data ?? [];
                if (mounted) setCourses(arr.map(normalizeCourse));
            } catch (e) {
                if (mounted) setCourses([]);
            } finally {
                if (mounted) setLoadingCourses(false);
            }

            // Exams
            setLoadingExams(true);
            try {
                const ex = await getMyExams(effectiveStudentId);
                const arr = Array.isArray(ex) ? ex : ex?.data ?? [];
                if (mounted) setExams(arr.map(normalizeExam));
            } catch {
                if (mounted) setExams([]);
            } finally {
                if (mounted) setLoadingExams(false);
            }

            // Results
            setLoadingResults(true);
            try {
                const r = await getMyResults(effectiveStudentId);
                const arr = Array.isArray(r) ? r : r?.data ?? [];
                if (mounted) setResults(arr);
            } catch {
                if (mounted) setResults([]);
            } finally {
                if (mounted) setLoadingResults(false);
            }

            // Unread notifications
            setLoadingNotif(true);
            try {
                const count = await getUnreadNotificationCount(token);
                if (mounted) setUnreadCount(Number(count) || 0);
            } catch {
                if (mounted) setUnreadCount(0);
            } finally {
                if (mounted) setLoadingNotif(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [effectiveStudentId, token, normalizeCourse, normalizeExam]);

    // Progress: based on finished submissions vs available exams
    const progressPct = useMemo(() => {
        if (!exams.length && !results.length) return 0;
        if (!exams.length) return 100;
        const pct = Math.round((Math.min(results.length, exams.length) / exams.length) * 100);
        return Math.max(0, Math.min(100, pct));
    }, [exams.length, results.length]);

    // Weekly schedule count (next 7 days)
    const sessionsThisWeek = useMemo(() => {
        if (!courses.length) return 0;
        const today = new Date();
        let count = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dow = d.getDay(); // 0..6
            courses.forEach((c) => {
                (c.schedules || []).forEach((s) => {
                    const n = DOW[s.dayOfWeek] ?? -1;
                    if (n === dow) count++;
                });
            });
        }
        return count;
    }, [courses]);

    // Recent courses
    const recentCourses = useMemo(() => courses.slice(0, 3), [courses]);

    // Calendar date renderer from live data (exams + schedules)
    const dateCellRender = useCallback(
        (value) => {
            const dateKey = value.format("YYYY-MM-DD");

            const hasExam = exams.some((ex) => {
                if (!ex.startAt) return false;
                try {
                    const iso = new Date(ex.startAt).toISOString().slice(0, 10);
                    return iso === dateKey;
                } catch {
                    return false;
                }
            });

            const hasClass = courses.some((c) =>
                (c.schedules || []).some((s) => {
                    const targetDow = DOW[s.dayOfWeek] ?? -1;
                    return targetDow === value.day();
                })
            );

            if (hasExam || hasClass) {
                const color = hasExam && hasClass
                    ? "bg-yellow-100 text-yellow-700"
                    : hasExam
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700";

                return (
                    <div className={`flex items-center justify-center w-8 h-8 mx-auto rounded-full ${color}`}>
                        {value.date()}
                    </div>
                );
            }
            return <div className="text-gray-700">{value.date()}</div>;
        },
        [exams, courses]
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Xin chào{displayName ? `, ${displayName}` : ""} 👋
                </h1>
            </div>

            {/* Calendar + Progress + Recent Courses */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Calendar */}
                <Card className="p-5 rounded-xl shadow-sm border-0 bg-white">
                    <h3 className="text-lg font-semibold text-orange-500 mb-4 flex items-center">
                        <FaCalendarAlt className="mr-2" /> Lịch theo tháng
                    </h3>
                    <Calendar fullscreen={false} dateCellRender={dateCellRender} className="custom-calendar" />
                </Card>

                {/* Progress */}
                <Card className="p-5 rounded-xl shadow-sm border-0 bg-white flex flex-col">
                    <h3 className="text-lg font-semibold text-indigo-600 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Tiến độ học tập
                    </h3>
                    <div className="flex-1 flex flex-col items-center justify-center mb-4">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="96" cy="96" r="84" stroke="#e5e7eb" strokeWidth="14" fill="none" />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="84"
                                    stroke="#6366f1"
                                    strokeWidth="14"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 84}
                                    strokeDashoffset={2 * Math.PI * 84 * (1 - progressPct / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute text-center">
                                <span className="text-3xl font-bold text-gray-800">{progressPct}</span>
                                <span className="text-gray-500 text-lg">%</span>
                                <p className="text-sm text-gray-600 mt-1">
                                    {loadingResults || loadingExams
                                        ? "Đang tính..."
                                        : `${results.length} bài đã nộp / ${exams.length} bài`}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progressPct}%` }}></div>
                    </div>
                    <p className="mt-2 text-sm text-indigo-700 font-medium text-center">
                        {progressPct}% đã hoàn thành
                    </p>
                </Card>

                {/* Recent courses */}
                <Card className="p-5 rounded-xl shadow-sm border-0 bg-white">
                    <h3 className="text-lg font-semibold text-teal-600 mb-4 flex items-center">
                        <FaBookOpen className="w-5 h-5 mr-2 text-teal-600" />
                        Khóa học gần đây
                    </h3>
                    {loadingCourses ? (
                        <div className="py-6 text-gray-500">Đang tải...</div>
                    ) : recentCourses.length === 0 ? (
                        <div className="py-6 text-gray-500">Chưa có khóa học.</div>
                    ) : (
                        <ul className="space-y-3 mb-4">
                            {recentCourses.map((c) => (
                                <li key={c.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                        <span className="text-blue-600">📘</span>
                                    </div>
                                    <span className="text-gray-700">{c.name}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <p
                        className="text-sm text-blue-500 cursor-pointer hover:underline text-center"
                        onClick={() => navigate("/student/courses")}
                    >
                        Xem tất cả khóa học →
                    </p>
                </Card>
            </div>

            {/* Reminder & Weekly Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reminders (unread notifications) */}
                <Card className="p-4 flex justify-between items-center rounded-xl shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h3 className="font-semibold text-gray-700">Nhắc nhở</h3>
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                            {loadingNotif ? "…" : unreadCount}
                        </p>
                        <p
                            className="text-blue-500 text-sm cursor-pointer hover:underline mt-2"
                            onClick={() => navigate("/student/notifications")}
                        >
                            Xem chi tiết
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaBell className="text-blue-600 w-6 h-6" />
                    </div>
                </Card>

                {/* Weekly schedule count */}
                <Card className="p-4 flex justify-between items-center rounded-xl shadow-sm border-0 bg-gradient-to-r from-teal-50 to-cyan-50">
                    <div>
                        <h3 className="font-semibold text-gray-700">Lịch học trong tuần</h3>
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                            {loadingCourses ? "…" : sessionsThisWeek}
                        </p>
                        <p
                            className="text-blue-500 text-sm cursor-pointer hover:underline mt-2"
                            onClick={() => navigate("/student/schedule")}
                        >
                            Xem chi tiết
                        </p>
                    </div>
                    <div className="W-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                        <FaCalendarAlt className="text-teal-600 w-6 h-6" />
                    </div>
                </Card>
            </div>

            {/* Calendar CSS tweaks (kept from your version) */}
            <style >{`
        .ant-picker-calendar .ant-picker-content thead tr th {
          font-weight: 600;
          color: #4b5563;
          background-color: #f9fafb;
          padding: 8px 0;
          text-transform: uppercase;
          font-size: 0.75rem;
        }
        .ant-picker-calendar .ant-picker-content thead tr th:last-child {
          color: #ef4444 !important;
        }
        .ant-picker-calendar .ant-picker-content tbody tr td:last-child {
          color: #ef4444 !important;
        }
        .ant-picker-cell { padding: 4px !important; }
        .ant-picker-cell .ant-picker-cell-inner {
          height: 36px !important;
          display: flex; align-items: center; justify-content: center;
        }
        .ant-picker-calendar-date-content { display: none !important; }
        .ant-picker-calendar-mini { border-radius: 0.75rem; overflow: hidden; }
        .ant-picker-calendar-mini .ant-picker-panel { background: transparent; border: none; }
        .ant-picker-calendar-mini .ant-picker-content { height: auto; }
      `}</style>
        </div>
    );
};

export default StudentDashboard;
