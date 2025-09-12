import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL_STUDENT;
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        const bearer = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        config.headers = { ...(config.headers || {}) };
        if (!config.headers.Authorization) config.headers.Authorization = bearer;
    }
    return config;
});

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;
const getToken = () => localStorage.getItem("token") || "";
const authHeader = (explicitToken) => {
    const t = explicitToken ?? getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
};
const resolveStudentId = (maybe) =>
    (maybe ?? localStorage.getItem("studentId") ?? undefined);

// Lấy tất cả học viên
export const get1AllStudent = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/student/view/all`);
    return res.data?.data || [];
  } catch (err) {
    console.error("Error fetching all students:", err);
    throw err;
  }
};

// Lấy chi tiết học viên
export const getStudentDetail1 = async (studentId) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/student/view/${studentId}`);
    return res.data?.data || null;
  } catch (err) {
    console.error(`Error fetching student detail for ID ${studentId}:`, err);
    throw err;
  }
};

// Lấy danh sách khóa học
export const getMyCourses1 = async (studentId) => {
  try {
    const res = await axios.get(`${API_URL}/${studentId}/courses`);
    return res.data;
  } catch (err) {
    console.error("Error fetching courses:", err);
    throw err;
  }
};

// Lấy chi tiết 1 khóa học
export const getCourseDetail1 = async (courseId) => {
  try {
    const res = await axios.get(`${API_URL}/courses/${courseId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching course detail:", err);
    throw err;
  }
};

// Lấy danh sách bài kiểm tra
export const getMyExams1 = async (studentId) => {
  try {
    const res = await axios.get(`${API_URL}/${studentId}/exams`);
    return res.data;
  } catch (err) {
    console.error("Error fetching exams:", err);
    throw err;
  }
};


// Gửi feedback đến giáo viên
export const sendTeacherFeedback = async (studentId, courseId, feedback) => {
  try {
    const res = await axios.post(`${API_URL}/${studentId}/courses/${courseId}/feedback`, {
      feedback,
    });
    return res.data;
  } catch (err) {
    console.error("Error sending feedback:", err);
    throw err;
  }
};

// Lấy danh sách thông báo
export const getNotifications = async (token, page = 0, size = 10) => {
    const t = token || getToken();
    try {
        const res = await api.get(`/api/notifications`, {
            params: { page, size },
            headers: authHeader(t),
        });
        const pg = unwrap(res);
        // Trả về mảng cho UI: ưu tiên pg.content nếu có, nếu không thì pg (một số BE trả về mảng thẳng)
        if (Array.isArray(pg?.content)) return pg.content;
        if (Array.isArray(pg)) return pg;
        return [];
    } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
        return [];
    }
};

// Lấy số lượng thông báo chưa đọc
export const getUnreadNotificationCount = async (token) => {
    const t = token || getToken();
    try {
        const res = await api.get(`/api/notifications/unread-count`, {
            headers: authHeader(t),
        });
        const data = unwrap(res);
        return typeof data === "number" ? data : data?.count || 0;
    } catch (error) {
        console.error("Lỗi khi lấy số thông báo chưa đọc:", error);
        return 0;
    }
};

// Đánh dấu tất cả đã đọc
export const markAllNotificationsAsRead = async (token) => {
    const t = token || getToken();
    try {
        await api.put(`/api/notifications/read-all`, null, {
            headers: authHeader(t),
        });
        return true;
    } catch (error) {
        console.error("Lỗi khi đánh dấu tất cả thông báo đã đọc:", error);
        return false;
    }
};

export const getAllCourses = async () => {
    try {
        const res = await api.get(`/api/courses/view/all`);
        return unwrap(res) || [];
    } catch (error) {
        console.error("Lỗi khi tải danh sách khóa học:", error);
        toast.error("Có lỗi xảy ra khi tải danh sách khóa học");
        throw error;
    }
};

// Lấy danh sách khóa học đã đăng ký (theo studentId)
export const getMyEnrolledCourses = async (studentId) => {
    const sid = resolveStudentId(studentId);
    if (!sid) throw new Error("Missing studentId");
    try {
        const res = await api.get(`/api/courses/student/${sid}`);
        return unwrap(res) || [];
    } catch (error) {
        console.error("Lỗi khi tải khóa học đã đăng ký:", error);
        toast.error("Có lỗi xảy ra khi tải khóa học đã đăng ký");
        throw error;
    }
};

// Đăng ký khóa học
export const enrollCourse = async (studentId, courseId) => {
    try {
        const res = await api.post(`/api/enrollments/enroll`, { studentId, courseId });
        return unwrap(res);
    } catch (error) {
        console.error("Lỗi khi đăng ký khóa học:", error);
        const msg = error?.response?.data?.message || "Đăng ký thất bại";
        toast.error(msg);
        throw error;
    }
};

// Hủy đăng ký khóa học (KHÔNG có endpoint trong spec hiện tại)
export const cancelEnrollment = async () => {
    const err = new Error("API chưa hỗ trợ hủy đăng ký khóa học");
    console.error(err);
    throw err;
};

// Kiểm tra xung đột lịch học (client-side)
export const checkScheduleConflicts = async (studentId, newCourse, myCourses) => {
    try {
        const conflicts = [];
        myCourses.forEach((course) => {
            if (course.schedules && newCourse.schedules) {
                course.schedules.forEach((existingSchedule) => {
                    newCourse.schedules.forEach((newSchedule) => {
                        if (
                            existingSchedule.dayOfWeek === newSchedule.dayOfWeek &&
                            existingSchedule.timeSlot === newSchedule.timeSlot
                        ) {
                            conflicts.push({
                                dayOfWeek: newSchedule.dayOfWeek,
                                timeRange: newSchedule.timeRange,
                                existingCourseTitle: course.name,
                                newCourseTitle: newCourse.name,
                            });
                        }
                    });
                });
            }
        });
        return conflicts;
    } catch (error) {
        console.error("Lỗi khi kiểm tra xung đột lịch học:", error);
        return [];
    }
};

/* =========================
   Students
   ========================= */

// Lấy tất cả học viên
export const getAllStudent = async () => {
    try {
        const res = await api.get(`/api/student/view/all`);
        return unwrap(res) || [];
    } catch (err) {
        console.error("Error fetching all students:", err);
        throw err;
    }
};

// Lấy chi tiết học viên
export const getStudentDetail = async (studentId) => {
    const id = resolveStudentId(studentId);
    if (!id) throw new Error("Missing studentId");
    try {
        const res = await api.get(`/api/student/view/${id}`);
        return unwrap(res) || null;
    } catch (err) {
        console.error(`Error fetching student detail for ID ${id}:`, err);
        throw err;
    }
};


// Lấy danh sách khóa học của học viên (alias cho getMyEnrolledCourses)
export const getMyCourses = async (studentId) => {
    const sid = resolveStudentId(studentId);
    if (!sid) throw new Error("Missing studentId");
    try {
        const res = await api.get(`/api/courses/student/${sid}`);
        return unwrap(res) || [];
    } catch (err) {
        console.error("Error fetching courses:", err);
        throw err;
    }
};

// Lấy chi tiết 1 khóa học
export const getCourseDetail = async (courseId) => {
    try {
        const res = await api.get(`/api/courses/view/${courseId}`);
        return unwrap(res);
    } catch (err) {
        console.error("Error fetching course detail:", err);
        throw err;
    }
};

/* =========================
   Exams & Submissions
   ========================= */

// Lấy danh sách bài kiểm tra (theo student)
// Chiến lược: lấy courses của student → lấy exams active theo từng course → gộp & khử trùng lặp.
export const getMyExams = async (studentId) => {
    const sid = resolveStudentId(studentId);
    if (!sid) throw new Error("Missing studentId");
    try {
        const coursesRes = await api.get(`/api/courses/student/${sid}`);
        const courses = unwrap(coursesRes) || [];
        const courseIds = (courses || []).map((c) => c.courseId || c.id).filter(Boolean);
        if (!courseIds.length) return [];

        const examsArrays = await Promise.all(
            courseIds.map(async (cid) => {
                try {
                    const r = await api.get(`/api/exams/course/${cid}/active`);
                    return unwrap(r) || [];
                } catch {
                    return [];
                }
            })
        );

        // flatten + dedupe by examId
        const map = new Map();
        examsArrays.flat().forEach((ex) => {
            const key = ex.examId || ex.id;
            if (key && !map.has(key)) map.set(key, ex);
        });
        return Array.from(map.values());
    } catch (err) {
        console.error("Error fetching exams:", err);
        throw err;
    }
};

// Lấy chi tiết 1 bài kiểm tra
export const getExamDetail = async (examId) => {
    try {
        const res = await api.get(`/api/exams/${examId}`);
        return unwrap(res);
    } catch (err) {
        console.error("Error fetching exam detail:", err);
        throw err;
    }
};

// Gửi bài làm: chuyển sang flow submissions (start → answers → finish)
export const submitExam = async (examId, studentId, answers) => {
    const sid = resolveStudentId(studentId);
    if (!sid) throw new Error("Missing studentId");
    try {
        // 1) start exam -> submissionId (use query params per spec)
        const startRes = await api.post(
            `/api/submissions/start-exam`,
            null,
            { params: { examId, studentId: sid } }
        );
        const submission = unwrap(startRes) || {};
        const submissionId = submission.submissionId || submission.id;
        if (!submissionId) throw new Error("Không tạo được submission");

        // 2) post answers (implementation may vary in your BE)
        if (Array.isArray(answers) && answers.length) {
            await api.post(`/api/submissions/${submissionId}/answers`, { answers });
        }

        // 3) finish exam
        const finishRes = await api.post(`/api/submissions/${submissionId}/finish`);
        return unwrap(finishRes) || { submissionId };
    } catch (err) {
        console.error("Error submitting exam:", err);
        throw err;
    }
};

// Lấy kết quả các bài kiểm tra đã làm (submissions by student)
export const getMyResults = async (studentId) => {
    const sid = resolveStudentId(studentId);
    if (!sid) throw new Error("Missing studentId");
    try {
        const res = await api.get(`/api/submissions/student/${sid}`);
        return unwrap(res) || [];
    } catch (err) {
        console.error("Error fetching results:", err);
        throw err;
    }
};

// Lấy chi tiết 1 kết quả kiểm tra (submission + answers)
export const getResultDetail = async (resultId) => {
    try {
        const [subRes, ansRes] = await Promise.all([
            api.get(`/api/submissions/${resultId}`),
            api.get(`/api/submissions/${resultId}/answers`),
        ]);
        return {
            submission: unwrap(subRes),
            answers: unwrap(ansRes) || [],
        };
    } catch (err) {
        console.error("Error fetching result detail:", err);
        throw err;
    }
};

// Lấy kết quả của một bài kiểm tra cụ thể (theo studentId & examId)
export const getExamResult = async (studentId, examId) => {
    try {
        // Cách 1: lấy theo exam → lọc theo student
        const byExamRes = await api.get(`/api/submissions/exam/${examId}`);
        const byExam = unwrap(byExamRes) || [];
        const found = byExam.find(
            (s) => (s.studentId || s.student?.studentId) === Number(studentId)
        );
        if (found) {
            const detail = await getResultDetail(found.submissionId || found.id);
            return detail;
        }

        // Cách 2: fallback lấy theo student → lọc theo exam
        const byStuRes = await api.get(`/api/submissions/student/${studentId}`);
        const byStu = unwrap(byStuRes) || [];
        const found2 = byStu.find((s) => (s.examId || s.exam?.examId) === Number(examId));
        if (found2) {
            const detail = await getResultDetail(found2.submissionId || found2.id);
            return detail;
        }

        return null;
    } catch (err) {
        console.error("Error fetching exam result:", err);
        throw err;
    }
};

/* =========================
   Profile
   ========================= */

// Tạo học viên mới (lần đầu user có vai trò student nhưng chưa có studentId)
export const createStudent = async (data) => {
    try {
        const res = await api.post('/api/student/create', data);
        return unwrap(res);
    } catch (err) {
        console.error('Error creating student:', err);
        throw err;
    }
};

// Cập nhật thông tin profile học viên
// Lưu ý: endpoint cập nhật ở /api/users/{userId}/profile, không phải /student/{id}/profile
export const updateProfile = async (studentId, profileData) => {
    try {
        // Lấy userId từ student detail
        const stu = await getStudentDetail(studentId);
        const userId = stu?.userId;
        if (!userId) throw new Error("Không tìm thấy userId từ hồ sơ học viên");

        const res = await api.put(`/api/users/${userId}/profile`, profileData);
        return unwrap(res);
    } catch (err) {
        console.error("Error updating profile:", err);
        throw err;
    }
};

// Cập nhật phần hồ sơ bổ sung của học viên (cha/mẹ, application)
export const updateStudentProfile = async (studentId, data) => {
    try {
        if (!studentId) throw new Error("Missing studentId");
        const res = await api.put(`/api/student/update/${studentId}`, data);
        return unwrap(res);
    } catch (err) {
        console.error("Error updating student extended profile:", err);
        throw err;
    }
};

// Lấy thông tin profile học viên (dùng student detail vì không có GET /api/users/{id} trong spec)
export const getProfile = async (studentId) => {
    try {
        const stu = await getStudentDetail(studentId);
        return stu || null;
    } catch (err) {
        console.error("Error fetching profile:", err);
        throw err;
    }
};

/* =========================
   Attendance (chưa có trong spec)
   ========================= */

// Tạo dữ liệu điểm danh từ lessons của các khóa học đã đăng ký
export const getAttendance = async (studentId) => {
    const sid = resolveStudentId(studentId);
    if (!sid) throw new Error("Missing studentId");

    try {
        const courses = await getMyCourses(sid);
        const idOf = (c) => c.courseId ?? c.id;
        const titleOf = (c) => c.title ?? c.name ?? `Course #${idOf(c)}`;
        const byId = new Map(courses.map((c) => [idOf(c), titleOf(c)]));

        const lessonsArrays = await Promise.all(
            courses.map(async (c) => {
                const cid = idOf(c);
                try {
                    const r = await api.get(`/api/lessons/course/${cid}`);
                    const lessons = unwrap(r) || [];
                    return lessons.map((ls) => ({
                        date: (ls.uploadedAt || "").slice(0, 10),
                        courseName: byId.get(cid) || "",
                        // không có API điểm danh -> để undefined => UI hiển thị "Không rõ"
                        present: undefined,
                    }));
                } catch {
                    return [];
                }
            })
        );

        return lessonsArrays.flat();
    } catch (err) {
        console.error("Error building attendance from lessons:", err);
        // Đừng throw để UI vẫn chạy được
        return [];
    }
};

export const getCourseAttendance = async () => {
    const err = new Error("API chưa hỗ trợ điểm danh theo khóa học");
    console.error(err);
    throw err;
};

/* =========================
   Grades (dựa trên submissions)
   ========================= */

export const getMyGrades = async (studentId) => {
    try {
        const submissions = await getMyResults(studentId);
        return submissions;
    } catch (err) {
        console.error("Error fetching grades:", err);
        throw err;
    }
};