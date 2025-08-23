import React, { useState } from "react";
import { sendTeacherFeedback } from "@/services/studentService.js";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card/Card";
import { Button } from "@/components/ui/button/Button";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { Loader2 } from "lucide-react";

const TeacherFeedbackForm = ({ studentId, courseId }) => {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setLoading(true);
    setSuccess(null);
    try {
      await sendTeacherFeedback(studentId, courseId, feedback);
      setSuccess("Phản hồi đã được gửi thành công!");
      setFeedback("");
    } catch (err) {
      console.error("Error sending feedback:", err);
      setSuccess("Có lỗi xảy ra khi gửi phản hồi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>Gửi phản hồi đến giáo viên</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Nhập nội dung phản hồi..."
            className="min-h-[120px]"
          />
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Gửi phản hồi"}
          </Button>
        </form>

        {success && (
          <p
            className={`mt-2 text-sm ${
              success.includes("thành công") ? "text-green-600" : "text-red-600"
            }`}
          >
            {success}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherFeedbackForm;
