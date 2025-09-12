import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { sendTeacherFeedback } from "@/services/hooks/studentService.js";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card/Card";
import { Button } from "@/components/ui/button/Button";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { Loader2, MessageCircle, Send, Star, FileText, AlertCircle } from "lucide-react";

const TeacherFeedbackForm = ({
                                 studentId: propStudentId,
                                 courseId: propCourseId,
                                 teacherName = "Giảng viên",
                                 teacherId, // optional, in case BE needs it later
                             }) => {
    const params = useParams(); // support paths like /student/courses/:courseId or .../:id
    const { studentId: authStudentId } = useAuth();

    // --- Resolve studentId robustly ---
    const effectiveStudentId = useMemo(() => {
        const fromLocal = localStorage.getItem("studentId");
        const raw =
            propStudentId ??
            authStudentId ??
            (fromLocal ? Number(fromLocal) : undefined);

        const n = Number(raw);
        return Number.isFinite(n) && n > 0 ? n : null;
    }, [propStudentId, authStudentId]);

    // --- Resolve courseId robustly ---
    const effectiveCourseId = useMemo(() => {
        // try prop, then /:courseId, then /:id
        const raw =
            propCourseId ??
            (params?.courseId !== undefined ? params.courseId : undefined) ??
            (params?.id !== undefined ? params.id : undefined);

        const n = Number(raw);
        return Number.isFinite(n) && n > 0 ? n : null;
    }, [propCourseId, params]);

    const [feedback, setFeedback] = useState("");
    const [rating, setRating] = useState(0);
    const [feedbackType, setFeedbackType] = useState("general");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);
    const [banner, setBanner] = useState(null); // { type: 'success'|'error', text: string }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBanner(null);

        if (!effectiveStudentId) {
            setBanner({ type: "error", text: "Không tìm thấy studentId. Vui lòng đăng nhập lại." });
            return;
        }
        if (!effectiveCourseId) {
            setBanner({ type: "error", text: "Thiếu courseId để gửi phản hồi." });
            return;
        }
        if (!feedback.trim()) {
            setBanner({ type: "error", text: "Vui lòng nhập nội dung phản hồi." });
            return;
        }

        // Gói thêm metadata vào content để hợp với API hiện tại (content-only)
        const payloadContent =
            `[type:${feedbackType}] [rating:${rating}] [anonymous:${isAnonymous}]` +
            (feedback.trim().startsWith("\n") ? feedback : `\n${feedback.trim()}`);

        setLoading(true);
        try {
            // If your backend later needs teacherId, you can extend the API call to include it.
            await sendTeacherFeedback(effectiveStudentId, effectiveCourseId, payloadContent);
            setBanner({ type: "success", text: "Phản hồi đã được gửi thành công! Cảm ơn bạn đã đóng góp ý kiến." });
            setFeedback("");
            setRating(0);
            setFeedbackType("general");
            setIsAnonymous(false);
        } catch (err) {
            console.error("Error sending feedback:", err);
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại sau.";
            setBanner({ type: "error", text: msg });
        } finally {
            setLoading(false);
        }
    };

    const feedbackTypes = [
        { value: "general", label: "Phản hồi chung", icon: <MessageCircle className="w-4 h-4" /> },
        { value: "content", label: "Nội dung bài giảng", icon: <FileText className="w-4 h-4" /> },
        { value: "method", label: "Phương pháp giảng dạy", icon: <AlertCircle className="w-4 h-4" /> },
        { value: "support", label: "Hỗ trợ học tập", icon: <Star className="w-4 h-4" /> },
    ];

    const buttonDisabled =
        loading || !feedback.trim() || !effectiveStudentId || !effectiveCourseId;

    return (
        <Card className="shadow-lg rounded-2xl border-0 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader className="pb-4 border-b border-purple-100">
                <CardTitle className="text-xl text-purple-700 flex items-center">
                    <MessageCircle className="mr-3 w-6 h-6 text-purple-600" />
                    Đánh giá & Phản hồi Giảng viên
                </CardTitle>
                <p className="text-sm text-purple-600 mt-2">
                    Chia sẻ ý kiến của bạn về {teacherName} để cùng cải thiện chất lượng giảng dạy
                </p>
            </CardHeader>

            <CardContent className="pt-5">
                {/* Small hint if disabled due to missing IDs */}
                {!effectiveStudentId || !effectiveCourseId ? (
                    <div className="mb-4 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                        {!effectiveStudentId && "Không xác định được học viên (studentId). "}
                        {!effectiveCourseId && "Không xác định được khóa học (courseId). "}
                        Vui lòng đăng nhập đúng tài khoản và mở form từ trang chi tiết khóa học.
                    </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Đánh giá sao */}
                    <div className="bg-white p-4 rounded-xl border border-purple-100">
                        <label className="block text-sm font-medium text-purple-700 mb-3">
                            Đánh giá của bạn về giảng viên:
                        </label>
                        <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${
                                            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                        }`}
                                    />
                                </button>
                            ))}
                            <span className="ml-3 text-sm text-gray-600">
                {rating === 0 ? "Chưa đánh giá" : `${rating}/5 sao`}
              </span>
                        </div>
                    </div>

                    {/* Loại phản hồi */}
                    <div className="bg-white p-4 rounded-xl border border-purple-100">
                        <label className="block text-sm font-medium text-purple-700 mb-3">
                            Loại phản hồi:
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {feedbackTypes.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFeedbackType(type.value)}
                                    className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                                        feedbackType === type.value
                                            ? "border-purple-500 bg-purple-50 text-purple-700 font-medium"
                                            : "border-gray-200 bg-white text-gray-600 hover:border-purple-300"
                                    }`}
                                >
                                    <span className="mr-2">{type.icon}</span>
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nội dung phản hồi */}
                    <div className="bg-white p-4 rounded-xl border border-purple-100">
                        <label className="block text-sm font-medium text-purple-700 mb-3">
                            Nội dung phản hồi chi tiết:
                        </label>
                        <div className="relative">
                            <Textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder={`Hãy chia sẻ cụ thể về ${feedbackTypes.find((t) => t.value === feedbackType)?.label.toLowerCase()}...`}
                                className="min-h-[120px] rounded-xl border-purple-200 bg-white focus:border-purple-400 focus:ring-purple-400 resize-none"
                                maxLength={500}
                            />
                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="anonymous"
                                        checked={isAnonymous}
                                        onChange={() => setIsAnonymous((v) => !v)}
                                        className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <label htmlFor="anonymous" className="ml-2 text-sm text-gray-600">
                                        Gửi ẩn danh
                                    </label>
                                </div>
                                <div className="text-xs text-gray-400">{feedback.length}/500 ký tự</div>
                            </div>
                        </div>
                    </div>

                    {/* Gợi ý phản hồi */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-yellow-700">Gợi ý phản hồi chất lượng:</p>
                                <ul className="text-xs text-yellow-600 mt-1 list-disc list-inside">
                                    <li>Nêu cụ thể điểm mạnh và điểm cần cải thiện</li>
                                    <li>Đưa ra đề xuất mang tính xây dựng</li>
                                    <li>Sử dụng ngôn từ tôn trọng và chuyên nghiệp</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Nút gửi */}
                    <Button
                        type="submit"
                        disabled={buttonDisabled}
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                                Đang gửi đánh giá...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5 mr-2" />
                                Gửi đánh giá & Phản hồi
                            </>
                        )}
                    </Button>
                </form>

                {banner && (
                    <div
                        className={`mt-4 p-4 rounded-lg text-center ${
                            banner.type === "success"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                    >
                        {banner.text}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TeacherFeedbackForm;
