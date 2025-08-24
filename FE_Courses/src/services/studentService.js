import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL_STUDENT;

// Lấy danh sách khóa học
export const getMyCourses = async (studentId) => {
  try {
    const res = await axios.get(`${API_URL}/${studentId}/courses`);
    return res.data;
  } catch (err) {
    console.error("Error fetching courses:", err);
    throw err;
  }
};

// Lấy chi tiết 1 khóa học
export const getCourseDetail = async (courseId) => {
  try {
    const res = await axios.get(`${API_URL}/courses/${courseId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching course detail:", err);
    throw err;
  }
};

// Lấy danh sách bài kiểm tra
export const getMyExams = async (studentId) => {
  try {
    const res = await axios.get(`${API_URL}/${studentId}/exams`);
    return res.data;
  } catch (err) {
    console.error("Error fetching exams:", err);
    throw err;
  }
};

// Lấy chi tiết 1 bài kiểm tra
export const getExamDetail = async (examId) => {
  try {
    const res = await axios.get(`${API_URL}/exams/${examId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching exam detail:", err);
    throw err;
  }
};

// Gửi bài làm
export const submitExam = async (examId, studentId, answers) => {
  try {
    const res = await axios.post(`${API_URL}/exams/${examId}/submit`, {
      studentId,
      answers,
    });
    return res.data;
  } catch (err) {
    console.error("Error submitting exam:", err);
    throw err;
  }
};

// Lấy kết quả các bài kiểm tra đã làm
export const getMyResults = async (studentId) => {
  try {
    const res = await axios.get(`${API_URL}/${studentId}/results`);
    return res.data;
  } catch (err) {
    console.error("Error fetching results:", err);
    throw err;
  }
};

// Lấy chi tiết 1 kết quả kiểm tra
export const getResultDetail = async (resultId) => {
  try {
    const res = await axios.get(`${API_URL}/results/${resultId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching result detail:", err);
    throw err;
  }
};

// Cập nhật thông tin profile học viên
export const updateProfile = async (studentId, profileData) => {
  try {
    const res = await axios.put(`${API_URL}/${studentId}/profile`, profileData);
    return res.data;
  } catch (err) {
    console.error("Error updating profile:", err);
    throw err;
  }
};

// Lấy thông tin profile học viên
export const getProfile = async (studentId) => {
  try {
    const res = await axios.get(`${API_URL}/${studentId}/profile`);
    return res.data;
  } catch (err) {
    console.error("Error fetching profile:", err);
    throw err;
  }
};

// Lấy lịch sử điểm danh
export const getAttendance = async (studentId) => {
  try {
    const res = await axios.get(`${API_URL}/${studentId}/attendance`);
    return res.data;
  } catch (err) {
    console.error("Error fetching attendance:", err);
    throw err;
  }
};

// Lấy chi tiết điểm danh của 1 khóa học
export const getCourseAttendance = async (studentId, courseId) => {
  try {
    const res = await axios.get(`${API_URL}/${studentId}/attendance/${courseId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching course attendance:", err);
    throw err;
  }
};

// Lấy bảng điểm
export const getMyGrades = async (studentId) => {
  try {
    const res = await axios.get(`${API_URL}/${studentId}/grades`);
    return res.data;
  } catch (err) {
    console.error("Error fetching grades:", err);
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
export const getNotifications = async () => {
  try {
    // Giả lập dữ liệu (sau này thay bằng API)
    return Promise.resolve([
      {
        id: 1,
        title: "Thông báo kiểm tra giữa kỳ",
        message: "Môn Toán sẽ có kiểm tra giữa kỳ vào ngày 20/08/2025.",
        date: "2025-08-15T09:00:00",
      },
      {
        id: 2,
        title: "Điểm danh",
        message: "Bạn đã được điểm danh trong buổi học Lập trình Web.",
        date: "2025-08-14T08:30:00",
      },
      {
        id: 3,
        title: "Cập nhật lịch học",
        message: "Lịch học môn Cơ sở dữ liệu đã thay đổi sang thứ 5.",
        date: "2025-08-13T15:00:00",
      },
    ]);
  } catch (error) {
    console.error("Lỗi khi lấy thông báo:", error);
    return [];
  }
};

// Lấy kết quả của một bài kiểm tra cụ thể
export const getExamResult = async (studentId, examId) => {
  try {
    const res = await axios.get(`${API_URL}/${studentId}/exams/${examId}/result`);
    return res.data;
  } catch (err) {
    console.error("Error fetching exam result:", err);
    throw err;
  }
};
