import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCourses } from "@/services/hooks/studentService";
import { getTeacherDetails } from "@/services/hooks/teacherService";
import { useAuth } from "@/contexts/AuthContext.jsx";
import {
    Card,
} from "@/components/ui/card/Card";
import { Button } from "@/components/ui/button/Button";
import {
    Loader2,
    BookOpen,
    PlusCircle,
    ArrowRight,
    GraduationCap,
    User,
    Calendar,
    ChevronRight,
    Star,
    Search,
    Filter,
    SortAsc,
    SortDesc,
    X,
    ChevronDown
} from "lucide-react";

// Normalize backend shapes without inventing data
const normalizeCourse = (c) => ({
    id: c?.courseId ?? c?.id,
    name: c?.name ?? c?.title ?? "Khóa học",
    teacherId: c?.teacherId ?? c?.teacher?.teacherId ?? c?.teacher?.id ?? null,
    teacherName: c?.teacherName ?? c?.teacher?.fullName ?? c?.teacher?.name ?? "",
});

const MyCourses = ({ studentId: propStudentId }) => {
    const navigate = useNavigate();
    const { studentId } = useAuth(); // { studentId, ... } được set trong LoginCallback
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBy, setFilterBy] = useState("all"); // all | teacher specific
    const [sortBy, setSortBy] = useState("name"); // name | id | teacher
    const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        let mounted = true;

        const fetchCourses = async () => {
            setLoading(true);
            try {
                if (!studentId) {
                    setCourses([]);
                    return;
                }
                const data = await getMyCourses(studentId);
                const list = Array.isArray(data) ? data : data?.data ?? [];
                let normalized = Array.isArray(list) ? list.map(normalizeCourse) : [];

                // Enrich with teacher details where missing name
                const needDetails = normalized.filter(c => !c.teacherName && c.teacherId);
                if (needDetails.length) {
                    const detailResults = await Promise.all(needDetails.map(async (c) => {
                        try {
                            const teacher = await getTeacherDetails(c.teacherId);
                            return {
                                id: c.id,
                                teacherName: teacher?.fullName || teacher?.name || "Chưa cập nhật",
                                teacherId: c.teacherId,
                            };
                        } catch {
                            return { id: c.id, teacherName: "Chưa cập nhật", teacherId: c.teacherId };
                        }
                    }));
                    const map = new Map(detailResults.map(r => [r.id, r]));
                    normalized = normalized.map(c => {
                        const add = map.get(c.id);
                        return add ? { ...c, ...add } : c;
                    });
                }

                if (mounted) setCourses(normalized);
            } catch (err) {
                console.error("Error fetching courses:", err);
                if (mounted) setCourses([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchCourses();
        return () => {
            mounted = false;
        };
    }, [studentId]);

    // Get unique teachers for filter dropdown
    const uniqueTeachers = useMemo(() => {
        const teachers = courses
            .filter(c => c.teacherName && c.teacherName !== "Chưa cập nhật")
            .map(c => ({ id: c.teacherId, name: c.teacherName }));

        // Remove duplicates
        const unique = teachers.filter((teacher, index, arr) =>
            arr.findIndex(t => t.id === teacher.id) === index
        );

        return unique.sort((a, b) => a.name.localeCompare(b.name));
    }, [courses]);

    // Filtered and sorted courses
    const filteredCourses = useMemo(() => {
        let filtered = courses;

        // Search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(course =>
                course.name.toLowerCase().includes(searchLower) ||
                course.teacherName.toLowerCase().includes(searchLower) ||
                course.id.toString().includes(searchLower)
            );
        }

        // Teacher filter
        if (filterBy !== "all") {
            filtered = filtered.filter(course => course.teacherId?.toString() === filterBy);
        }

        // Sort
        filtered.sort((a, b) => {
            let compareValue = 0;

            switch (sortBy) {
                case "name":
                    compareValue = a.name.localeCompare(b.name);
                    break;
                case "id":
                    compareValue = a.id - b.id;
                    break;
                case "teacher":
                    compareValue = a.teacherName.localeCompare(b.teacherName);
                    break;
                default:
                    compareValue = 0;
            }

            return sortOrder === "asc" ? compareValue : -compareValue;
        });

        return filtered;
    }, [courses, searchTerm, filterBy, sortBy, sortOrder]);

    const handleRegisterClick = () => {
        navigate("/student/course-registration");
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setFilterBy("all");
        setSortBy("name");
        setSortOrder("asc");
    };

    const hasActiveFilters = searchTerm.trim() || filterBy !== "all" || sortBy !== "name" || sortOrder !== "asc";

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Header Skeleton */}
                    <div className="mb-8">
                        <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                    </div>

                    {/* Loading Animation */}
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="relative mb-6">
                                <div className="w-16 h-16 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                </div>
                                <div className="absolute -inset-2 bg-blue-100 rounded-full animate-pulse opacity-50"></div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Đang tải khóa học của bạn</h3>
                            <p className="text-gray-500">Vui lòng chờ trong giây lát...</p>
                        </div>
                    </div>

                    {/* Course Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const missingId = !studentId;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Modern Header */}
                <div className="relative overflow-hidden mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700"></div>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative backdrop-blur-sm bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
                                        <GraduationCap className="w-8 h-8 text-blue-600" />
                                    </div>
                                    {courses.length > 0 && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {courses.length > 99 ? '99+' : courses.length}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">
                                        Khóa học của tôi
                                    </h1>
                                    <p className="text-blue-100 text-lg">
                                        {courses.length > 0
                                            ? `Bạn đang theo học ${courses.length} khóa học`
                                            : "Bắt đầu hành trình học tập của bạn"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                {courses.length > 0 && (
                    <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Search className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-lg font-semibold text-gray-800">Tìm kiếm và lọc</span>
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="md:hidden flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên khóa học, giảng viên..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Teacher Filter */}
                            <div className="relative">
                                <select
                                    value={filterBy}
                                    onChange={(e) => setFilterBy(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur appearance-none"
                                >
                                    <option value="all">Tất cả giảng viên</option>
                                    {uniqueTeachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Sort By */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur appearance-none"
                                >
                                    <option value="name">Sắp xếp theo tên</option>
                                    <option value="id">Sắp xếp theo ID</option>
                                    <option value="teacher">Sắp xếp theo giảng viên</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Sort Order & Clear */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
                                >
                                    {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                                    {sortOrder === "asc" ? "A-Z" : "Z-A"}
                                </button>
                                {hasActiveFilters && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Xóa
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results Counter */}
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                            <span>
                                Hiển thị <strong>{filteredCourses.length}</strong> trong tổng số <strong>{courses.length}</strong> khóa học
                            </span>
                            {hasActiveFilters && (
                                <span className="text-blue-600">
                                    Đang áp dụng bộ lọc
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                {missingId || courses.length === 0 ? (
                    <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 shadow-lg">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-inner">
                                <BookOpen className="w-12 h-12 text-blue-500" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-2xl"></div>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                            {missingId ? "Thiếu thông tin học viên" : "Chưa có khóa học nào"}
                        </h3>
                        <p className="text-gray-500 text-lg mb-8 max-w-2xl mx-auto">
                            {missingId
                                ? "Không xác định được thông tin học viên. Vui lòng đăng nhập lại hoặc liên hệ hỗ trợ để hoàn tất hồ sơ."
                                : "Bạn chưa đăng ký khóa học nào. Khám phá các khóa học thú vị và bắt đầu hành trình học tập ngay hôm nay!"}
                        </p>
                        <button
                            onClick={handleRegisterClick}
                            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:scale-105 transition-all duration-200 font-medium shadow-lg text-lg"
                        >
                            <PlusCircle className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                            Khám phá khóa học
                            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 shadow-lg">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
                                <Search className="w-12 h-12 text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                            Không tìm thấy khóa học nào
                        </h3>
                        <p className="text-gray-500 text-lg mb-8 max-w-2xl mx-auto">
                            Không có khóa học nào phù hợp với từ khóa tìm kiếm hoặc bộ lọc của bạn.
                        </p>
                        <button
                            onClick={handleClearFilters}
                            className="group inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-2xl hover:scale-105 transition-all duration-200 font-medium shadow-lg"
                        >
                            <X className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                            Xóa bộ lọc
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Course Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => (
                                <div
                                    key={course.id}
                                    onClick={() => navigate(`/student/courses/${course.id}`)}
                                    className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/50 hover:scale-105 hover:shadow-2xl transition-all duration-300"
                                >
                                    {/* Course Header */}
                                    <div className="relative p-6 pb-4 bg-gradient-to-br from-blue-50 to-purple-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                        ID: {course.id}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                                                    {course.name}
                                                </h3>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </div>

                                        {/* Teacher Info */}
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <User className="w-4 h-4" />
                                            <span className="text-sm">
                                                {course.teacherName || "Chưa cập nhật"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Course Body */}
                                    <div className="p-6 pt-4">
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                            <span className="flex items-center gap-1">
                                                <Star className="w-4 h-4" />
                                                Đang học
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Hoạt động
                                            </span>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">
                                                Xem chi tiết
                                            </span>
                                            <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-500 rounded-full flex items-center justify-center transition-all">
                                                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hover Effect Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Summary */}
                        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            Hiển thị: {filteredCourses.length}/{courses.length} khóa học
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Tiếp tục học tập để đạt được mục tiêu của bạn
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourses;
