import {
    FaGraduationCap,
    FaBook,
    FaClipboardList,
    FaFileAlt,
    FaUserPlus,
    FaComments,
    FaTrophy,
    FaTrash
} from 'react-icons/fa';

// Mapping các loại thông báo với icon và màu sắc
export const NOTIFICATION_TYPES = {
    COURSE_CREATED: {
        icon: FaGraduationCap,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Khóa học mới'
    },
    COURSE_UPDATED: {
        icon: FaGraduationCap,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'Cập nhật khóa học'
    },
    COURSE_DELETED: {
        icon: FaTrash,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Xóa khóa học'
    },
    STUDENT_ENROLLED: {
        icon: FaUserPlus,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        label: 'Học viên mới'
    },
    COURSE_FEEDBACK: {
        icon: FaComments,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        label: 'Phản hồi khóa học'
    },
    LESSON_CREATED: {
        icon: FaBook,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        label: 'Bài học mới'
    },
    ASSIGNMENT_CREATED: {
        icon: FaClipboardList,
        color: 'text-teal-500',
        bgColor: 'bg-teal-50',
        borderColor: 'border-teal-200',
        label: 'Bài tập mới'
    },
    ASSIGNMENT_UPDATED: {
        icon: FaClipboardList,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'Cập nhật bài tập'
    },
    ASSIGNMENT_SUBMITTED: {
        icon: FaFileAlt,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Nộp bài tập'
    },
    EXAM_CREATED: {
        icon: FaTrophy,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Bài kiểm tra mới'
    },
    EXAM_UPDATED: {
        icon: FaTrophy,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'Cập nhật bài kiểm tra'
    },
    EXAM_DELETED: {
        icon: FaTrash,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Xóa bài kiểm tra'
    },
    EXAM_RESULT: {
        icon: FaTrophy,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        label: 'Kết quả bài kiểm tra'
    }
};