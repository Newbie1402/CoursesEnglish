import api from '../api';

export const getLessonOfCourse = async (courseId) => {
    try {
        const res = await api.get(`/api/lessons/course/${courseId}`);
        return res?.data || []; // Đảm bảo trả về một mảng
    } catch (err) {
        console.error(`Error fetching lessons for course ID ${courseId}:`, err);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
}

// Lay chi tiet mot lesson
export const getLessonDetails = async (lessonId) => {
    try {
        const res = await api.get(`/api/lessons/view/${lessonId}`);
        return res?.data || null; // Trả về null nếu không có dữ liệu
    } catch (err) {
        console.error(`Error fetching details for lesson ID ${lessonId}:`, err);
        return null; // Trả về null nếu có lỗi
    }
};

// Ham dem so luong lesson trong mot khoa hoc
export const countLessonsInCourse = async (courseId) => {
    try {
        const lessons = await getLessonOfCourse(courseId);
        // Lọc các bài học có trạng thái active = true
        const activeLessons = lessons.filter(lesson => lesson.active);
        return activeLessons.length;
    } catch (err) {
        console.error(`Error counting lessons for course ID ${courseId}:`, err);
        return 0; // Trả về 0 nếu có lỗi
    }
};
