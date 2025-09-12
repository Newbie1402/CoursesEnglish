import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card/Card";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import { Badge } from "@/components/ui/badge/Badge";
import {
    Search,
    BookOpen,
    ArrowLeft,
    Loader2,
    Calendar,
    Clock,
    User,
    CreditCard,
    AlertTriangle,
    AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
    getAllCourses,
    getMyEnrolledCourses,
    enrollCourse,
    // cancelEnrollment, // backend chưa hỗ trợ
    checkScheduleConflicts,
} from "@/services/hooks/studentService";
import { useAuth } from "@/contexts/AuthContext.jsx";

/* ---- Helpers: normalize backend DTOs into a consistent shape for the UI ---- */
function normalizeSchedules(raw) {
    const list = Array.isArray(raw) ? raw : (raw?.courseSchedules || raw?.schedule || []);
    return Array.isArray(list)
        ? list.map((s) => {
            const dayOfWeek = s?.dayOfWeek ?? s?.day ?? s?.day_of_week ?? "";
            const timeRange = s?.timeRange ?? s?.timeSlot ?? s?.time ?? "";
            const timeSlot = s?.timeSlot ?? timeRange; // for checkScheduleConflicts()
            return { dayOfWeek, timeRange, timeSlot };
        })
        : [];
}

function normalizeCourse(c) {
    return {
        id: c?.courseId ?? c?.id,
        name: c?.name ?? c?.title ?? c?.courseName ?? "",
        code: c?.code ?? c?.courseCode ?? "",
        description: c?.description ?? "",
        teacherName: c?.teacherName ?? c?.teacher?.fullName ?? c?.teacher?.name ?? "",
        creditCount: c?.creditCount ?? c?.credits ?? c?.credit ?? 0,
        capacity: c?.capacity ?? c?.maxStudents ?? 0, // 0 = unknown
        enrolledCount: c?.enrolledCount ?? c?.currentStudents ?? c?.enrollmentCount ?? 0,
        location: c?.location ?? c?.room ?? "",
        registerDate: c?.registerDate ?? c?.enrolledAt ?? c?.createdAt ?? null,
        status: c?.status ?? c?.state ?? "",
        schedules: normalizeSchedules(c?.schedules),
    };
}

const CourseRegistration = () => {
    const navigate = useNavigate();
    const { studentId: authStudentId } = useAuth();

    const studentId = useMemo(() => {
        if (authStudentId === null || authStudentId === undefined) return null;
        if (String(authStudentId).toLowerCase() === "null") return null;
        const n = Number(authStudentId);
        return Number.isFinite(n) ? n : null;
    }, [authStudentId]);

    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingMyCourses, setLoadingMyCourses] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [scheduleConflicts, setScheduleConflicts] = useState([]);

    // Fetch all courses
    useEffect(() => {
        let mounted = true;
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const coursesData = await getAllCourses();
                const normalized = (coursesData || []).map(normalizeCourse);
                if (mounted) {
                    setCourses(normalized);
                    setFilteredCourses(normalized);
                }
            } catch {
                // toast handled inside service (getAllCourses)
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchCourses();
        return () => {
            mounted = false;
        };
    }, []);

    // Fetch my courses (requires real studentId)
    useEffect(() => {
        let mounted = true;
        const fetchMine = async () => {
            if (!studentId) {
                setLoadingMyCourses(false);
                toast.warn("Thiếu studentId — vui lòng hoàn tất hồ sơ để đăng ký khóa học.");
                return;
            }
            try {
                setLoadingMyCourses(true);
                const data = await getMyEnrolledCourses(studentId);
                const normalized = (data || []).map(normalizeCourse);
                if (mounted) setMyCourses(normalized);
            } catch {
                // error handled in service
            } finally {
                if (mounted) setLoadingMyCourses(false);
            }
        };
        fetchMine();
        return () => {
            mounted = false;
        };
    }, [studentId]);

    // Search filter (defensive on missing fields)
    useEffect(() => {
        const q = (searchTerm || "").toLowerCase();
        const filtered = courses.filter((course) => {
            const name = (course.name || "").toLowerCase();
            const code = (course.code || "").toLowerCase();
            const teacher = (course.teacherName || "").toLowerCase();
            return name.includes(q) || code.includes(q) || teacher.includes(q);
        });
        setFilteredCourses(filtered);
    }, [searchTerm, courses]);

    const handleSearch = (e) => setSearchTerm(e.target.value || "");

    const getRemainingSlots = (course) =>
        (Number(course.capacity) || 0) - (Number(course.enrolledCount) || 0);

    // IMPORTANT: capacity <= 0 means "unknown", NOT full
    const isCourseFull = (course) => {
        const cap = Number(course.capacity) || 0;
        if (cap <= 0) return false; // unknown capacity -> don’t block registration
        return getRemainingSlots(course) <= 0;
    };

    const isCourseRegistered = (courseId) =>
        myCourses.some((course) => course.id === courseId);

    const formatDayOfWeek = (day) => {
        const days = {
            MONDAY: "Thứ 2",
            TUESDAY: "Thứ 3",
            WEDNESDAY: "Thứ 4",
            THURSDAY: "Thứ 5",
            FRIDAY: "Thứ 6",
            SATURDAY: "Thứ 7",
            SUNDAY: "Chủ nhật",
        };
        return days[day] || day || "-";
    };

    const handleRegister = async (course) => {
        if (!studentId) {
            toast.error("Không xác định được học viên. Vui lòng đăng nhập lại hoặc cập nhật hồ sơ.");
            return;
        }

        // Kiểm tra xung đột lịch học trước khi đăng ký
        const conflicts = await checkScheduleConflicts(studentId, course, myCourses);
        if (conflicts.length > 0) {
            setScheduleConflicts(conflicts);
            toast.error("Có xung đột lịch học. Vui lòng kiểm tra lại!");
            return;
        }

        setRegistering(true);
        try {
            await enrollCourse(studentId, course.id);
            toast.success(`Đã đăng ký thành công khóa học "${course.name}"!`);

            // refresh my courses
            const updated = await getMyEnrolledCourses(studentId);
            setMyCourses((updated || []).map(normalizeCourse));
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi đăng ký khóa học");
        } finally {
            setRegistering(false);
            setScheduleConflicts([]);
        }
    };

    // Backend chưa hỗ trợ hủy đăng ký → hiển thị thông điệp thay vì gọi API
    const handleCancelRegistration = () => {
        toast.warn("Tính năng hủy đăng ký hiện chưa được backend hỗ trợ.");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-500">Đang tải danh sách khóa học...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center mb-6">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/student/courses")}
                        className="flex items-center gap-2 mr-4"
                    >
                        <ArrowLeft size={16} />
                        Quay lại danh sách khóa học
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-800">Đăng ký khóa học</h1>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Danh sách khóa học */}
                    <Card className="shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <CardTitle className="text-xl text-gray-800 m-0">
                                    Danh sách khóa học
                                </CardTitle>
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Tìm kiếm khóa học, mã học phần, giảng viên..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-200">
                                {filteredCourses.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <p className="text-gray-500">Không tìm thấy khóa học nào.</p>
                                    </div>
                                ) : (
                                    filteredCourses.map((course) => (
                                        <div
                                            key={course.id}
                                            className={`p-6 hover:bg-gray-50 transition-colors ${
                                                isCourseFull(course) || isCourseRegistered(course.id) ? "opacity-70" : ""
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="bg-blue-100 p-3 rounded-full">
                                                    <BookOpen className="text-blue-600" size={20} />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        <h3 className="font-semibold text-gray-800 text-lg">{course.name}</h3>
                                                        <Badge
                                                            variant={
                                                                isCourseFull(course)
                                                                    ? "destructive"
                                                                    : isCourseRegistered(course.id)
                                                                        ? "secondary"
                                                                        : "default"
                                                            }
                                                            className="ml-auto"
                                                        >
                                                            {course.code || "NO-CODE"}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-gray-600 mb-4">
                                                        {course.description || "Khóa học không có mô tả."}
                                                    </p>

                                                    {/* Lịch học */}
                                                    {course.schedules && course.schedules.length > 0 && (
                                                        <div className="mb-4">
                                                            <p className="text-sm font-medium text-gray-700 mb-2">Lịch học:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {course.schedules.map((schedule, index) => (
                                                                    <Badge key={index} variant="outline" className="text-xs">
                                                                        {formatDayOfWeek(schedule.dayOfWeek)}: {schedule.timeRange}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <User size={14} />
                                                            <span>{course.teacherName || "Chưa phân công"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <CreditCard size={14} />
                                                            <span>{course.creditCount || 0} tín chỉ</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Calendar size={14} />
                                                            <span>{course.location || "Chưa xác định"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Clock size={14} />
                                                            <span>
                                {Number(course.capacity) > 0 ? (
                                    isCourseFull(course) ? (
                                        <span className="text-red-500 font-medium">Đã đầy</span>
                                    ) : (
                                        <span>
                                      Còn {getRemainingSlots(course)}/{course.capacity} chỗ
                                    </span>
                                    )
                                ) : (
                                    <span> Sức chứa: Chưa xác định </span>
                                )}
                              </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm text-gray-500">
                                                            {isCourseRegistered(course.id) ? (
                                                                <span className="text-green-600 font-medium">Đã đăng ký</span>
                                                            ) : null}
                                                        </div>

                                                        <Button
                                                            onClick={() => handleRegister(course)}
                                                            disabled={
                                                                !studentId ||
                                                                isCourseFull(course) ||
                                                                isCourseRegistered(course.id) ||
                                                                registering
                                                            }
                                                            variant={isCourseRegistered(course.id) ? "outline" : "default"}
                                                            size="sm"
                                                        >
                                                            {registering
                                                                ? <Loader2 className="animate-spin w-4 h-4" />
                                                                : isCourseRegistered(course.id)
                                                                    ? "Đã đăng ký"
                                                                    : "Đăng ký ngay"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Khóa học đã đăng ký */}
                    <Card className="shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                            <CardTitle className="text-xl text-gray-800 m-0">Khóa học đã đăng ký</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loadingMyCourses ? (
                                <div className="p-6 text-center">
                                    <Loader2 className="animate-spin w-6 h-6 mx-auto mb-2 text-green-500" />
                                    <p className="text-gray-500 text-sm">Đang tải danh sách...</p>
                                </div>
                            ) : myCourses.length === 0 ? (
                                <div className="p-6 text-center">
                                    <p className="text-gray-500">Bạn chưa đăng ký khóa học nào.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {myCourses.map((course) => (
                                        <div key={course.id} className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-medium text-gray-800">{course.name}</h4>
                                                        <Badge variant="secondary">{course.code || "NO-CODE"}</Badge>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                                                        <div>
                                                            <strong>Giảng viên:</strong> {course.teacherName || "Chưa phân công"}
                                                        </div>
                                                        <div>
                                                            <strong>Tín chỉ:</strong> {course.creditCount || 0}
                                                        </div>
                                                        <div>
                                                            <strong>Ngày đăng ký:</strong>{" "}
                                                            {course.registerDate ? new Date(course.registerDate).toLocaleDateString() : "-"}
                                                        </div>
                                                        <div>
                                                            <strong>Trạng thái:</strong> {course.status || "—"}
                                                        </div>
                                                    </div>
                                                    {course.schedules && course.schedules.length > 0 && (
                                                        <div className="mb-3">
                                                            <p className="text-sm font-medium text-gray-700 mb-1">Lịch học:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {course.schedules.map((schedule, index) => (
                                                                    <Badge key={index} variant="outline" className="text-xs">
                                                                        {formatDayOfWeek(schedule.dayOfWeek)}: {schedule.timeRange}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Cancel is NOT supported by backend; show message instead of calling API */}
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={handleCancelRegistration}
                                                    className="ml-4"
                                                >
                                                    Hủy đăng ký
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Hiển thị xung đột lịch học */}
                    {scheduleConflicts.length > 0 && (
                        <Card className="shadow-lg border-red-2 bg-red-50">
                            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="text-red-500" size={20} />
                                    <CardTitle className="text-xl text-red-800 m-0">Xung đột lịch học</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    {scheduleConflicts.map((conflict, index) => (
                                        <div key={index} className="p-3 bg-red-100 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <AlertTriangle className="text-red-500 mt-0.5" size={16} />
                                                <div>
                                                    <p className="font-medium text-red-800">
                                                        Trùng lịch: {formatDayOfWeek(conflict.dayOfWeek)} {conflict.timeRange}
                                                    </p>
                                                    <p className="text-sm text-red-700">
                                                        {conflict.existingCourseTitle} và {conflict.newCourseTitle}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-red-600 mt-3">
                                    Vui lòng chọn khóa học khác không bị trùng lịch.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseRegistration;
