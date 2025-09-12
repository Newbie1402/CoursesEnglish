import React, { useEffect, useMemo, useState } from "react";
import { getMyGrades } from "@/services/hooks/studentService";
import { getAssignmentDetails } from "@/services/hooks/assignmentService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card/Card";
import {Table, TableHead, TableRow, TableCell, TableBody, TableHeader} from "@/components/ui/table/Table";
import { Loader2, Trophy, Clock, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const StatusBadge = ({ status }) => {
    const statusConfig = {
        GRADED: {
            label: "Đã chấm",
            color: "bg-green-100 text-green-800 border-green-200",
            icon: CheckCircle2
        },
        SUBMITTED: {
            label: "Đã nộp",
            color: "bg-blue-100 text-blue-800 border-blue-200",
            icon: Clock
        },
        IN_PROGRESS: {
            label: "Đang làm",
            color: "bg-orange-100 text-orange-800 border-orange-200",
            icon: AlertCircle
        },
        NOT_STARTED: {
            label: "Chưa bắt đầu",
            color: "bg-gray-100 text-gray-800 border-gray-200",
            icon: BookOpen
        }
    };

    const config = statusConfig[status] || statusConfig.NOT_STARTED;
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.color}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
};

const formatDate = (dateString) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const now = new Date();

    // Tính số ngày chênh lệch (âm = trong quá khứ, dương = trong tương lai)
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === -1) return 'Hôm qua';
    if (diffDays < 0 && Math.abs(diffDays) <= 7) {
        return `${Math.abs(diffDays)} ngày trước`;
    }
    if (diffDays > 0 && diffDays <= 7) {
        return `Còn ${diffDays} ngày`;
    }

    // Nếu quá xa hiện tại thì hiển thị ngày đầy đủ
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
    const colorClasses = {
        blue: "from-blue-500 to-blue-600",
        green: "from-green-500 to-green-600",
        orange: "from-orange-500 to-orange-600",
        purple: "from-purple-500 to-purple-600"
    };

    return (
        <div className="relative overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} opacity-5`} />
            <div className="relative p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 font-medium">{title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoadingSkeleton = () => (
    <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>
            ))}
        </div>

        {/* Table skeleton */}
        <Card className="shadow-sm">
            <CardHeader>
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="animate-pulse flex space-x-4">
                            <div className="h-4 bg-gray-200 rounded flex-1"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
);

const EmptyState = () => (
    <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có kết quả điểm</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Bạn chưa hoàn thành bài kiểm tra nào. Hãy tham gia các bài kiểm tra để xem kết quả tại đây.
        </p>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <BookOpen className="w-4 h-4 mr-2" />
            Xem bài kiểm tra
        </button>
    </div>
);

const GradeOverview = () => {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const { studentId } = useAuth();
    const [examTitles, setExamTitles] = useState({}); // examId -> title

    // Chuẩn hóa submission theo cấu trúc API mới
    const normalize = (s) => {
        const id = s?.id ?? s?.submissionId;
        const examId = s?.examId;
        const score = typeof s?.score === "number" ? s.score : null;
        const maxScore = typeof s?.maxScore === "number" ? s.maxScore : null;
        const teacherFeedback = s?.teacherFeedback || "";
        const submittedAt = s?.submittedAt || null;
        const startedAt = s?.startedAt || null;
        const deadline = s?.deadline || null;

        let status;
        if (submittedAt && score !== null) status = "GRADED";
        else if (submittedAt) status = "SUBMITTED";
        else if (startedAt) status = "IN_PROGRESS";
        else status = "NOT_STARTED";

        const percentage =
            typeof score === "number" && typeof maxScore === "number" && maxScore > 0
                ? (score / maxScore) * 100
                : null;

        return {
            id,
            examId,
            score,
            maxScore,
            percentage,
            status,
            submittedAt,
            startedAt,
            deadline,
            teacherFeedback,
        };
    };

    useEffect(() => {
        const run = async () => {
            if (!studentId) return;
            setLoading(true);
            try {
                const data = await getMyGrades(studentId);
                setRows((Array.isArray(data) ? data : []).map(normalize));
            } catch (err) {
                console.error("Error fetching grades:", err);
                setRows([]);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [studentId]);

    // Fetch exam titles for rows missing titles
    useEffect(() => {
        const ids = Array.from(new Set(rows.map(r => r.examId).filter(Boolean)));
        const missing = ids.filter(id => !examTitles[id]);
        if (!missing.length) return;
        let cancelled = false;
        (async () => {
            try {
                const results = await Promise.all(missing.map(async (id) => {
                    try {
                        const detail = await getAssignmentDetails(id);
                        const title = detail?.title || detail?.name || detail?.examTitle || '';
                        return { id, title };
                    } catch {
                        return { id, title: '' };
                    }
                }));
                if (cancelled) return;
                setExamTitles(prev => {
                    const next = { ...prev };
                    results.forEach(r => { if (r.title) next[r.id] = r.title; });
                    return next;
                });
            } catch (e) {
                console.warn('Fetch exam titles failed', e);
            }
        })();
        return () => { cancelled = true; };
    }, [rows, examTitles]);

    const stats = useMemo(() => {
        const graded = rows.filter((r) => r.status === "GRADED");
        const submitted = rows.filter((r) => r.status === "SUBMITTED");
        const inProgress = rows.filter((r) => r.status === "IN_PROGRESS");

        const avgScore = graded.length > 0
            ? graded.reduce((sum, r) => sum + (r.percentage || 0), 0) / graded.length
            : 0;

        return {
            total: rows.length,
            graded: graded.length,
            submitted: submitted.length,
            inProgress: inProgress.length,
            avgScore
        };
    }, [rows]);

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={BookOpen}
                    title="Tổng bài thi"
                    value={stats.total}
                    color="blue"
                />
                <StatCard
                    icon={CheckCircle2}
                    title="Đã chấm điểm"
                    value={stats.graded}
                    subtitle={`${stats.total > 0 ? Math.round((stats.graded/stats.total)*100) : 0}% hoàn thành`}
                    color="green"
                />
                <StatCard
                    icon={Trophy}
                    title="Điểm trung bình"
                    value={`${stats.avgScore.toFixed(1)}%`}
                    subtitle={stats.graded > 0 ? `Từ ${stats.graded} bài thi` : "Chưa có dữ liệu"}
                    color="purple"
                />
                <StatCard
                    icon={Clock}
                    title="Đang thực hiện"
                    value={stats.inProgress + stats.submitted}
                    subtitle="Bài thi chờ kết quả"
                    color="orange"
                />
            </div>

            {/* Grade Table */}
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-900">Bảng điểm chi tiết</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                                Theo dõi kết quả học tập của bạn
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {rows.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 border-b border-gray-200">
                                        <TableHead> Bài thi </TableHead>
                                        <TableHead> Điểm số </TableHead>
                                        <TableHead> Trạng thái </TableHead>
                                        <TableHead> Bắt đầu </TableHead>
                                        <TableHead> Hạn chót </TableHead>
                                        <TableHead> Nộp bài </TableHead>
                                        <TableHead> Nhận xét </TableHead>
                                        <TableHead> Thao tác </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((r, index) => (
                                        <TableRow
                                            key={r.id}
                                            className={`hover:bg-gray-50/50 transition-colors border-b border-gray-100 ${
                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/25'
                                            }`}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <BookOpen className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    {r.examId ? (examTitles[r.examId] || `Exam #${r.examId}`) : `Bài #${r.id}`}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div>
                                                    {typeof r.score === "number" && typeof r.maxScore === "number" ? (
                                                        <div>
                                                            <div className="font-bold text-lg text-gray-900">
                                                                {r.score} / {r.maxScore}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {r.percentage?.toFixed(1)}%
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">Chưa có điểm</span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <StatusBadge status={r.status} />
                                            </TableCell>

                                            <TableCell className="text-sm text-gray-600">
                                                {formatDate(r.startedAt)}
                                            </TableCell>

                                            <TableCell className="text-sm">
                                                {r.deadline ? (
                                                    <span className="text-red-600 font-medium">
                                                        {formatDate(r.deadline)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-sm text-gray-600">
                                                {formatDate(r.submittedAt)}
                                            </TableCell>

                                            <TableCell>
                                                {r.teacherFeedback ? (
                                                    <div className="max-w-[200px]">
                                                        <p className="text-sm text-gray-700 truncate" title={r.teacherFeedback}>
                                                            {r.teacherFeedback}
                                                        </p>
                                                        {r.teacherFeedback.length > 50 && (
                                                            <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                                                                Xem thêm
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">Chưa có nhận xét</span>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <button
                                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                                    onClick={() => navigate(`/student/submissions/${r.id}/detail`)}
                                                >
                                                    Xem chi tiết
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default GradeOverview;
