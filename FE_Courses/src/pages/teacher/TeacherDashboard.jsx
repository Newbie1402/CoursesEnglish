import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaPlusCircle,
  FaBook,
  FaClipboardList,
  FaUserGraduate
} from "react-icons/fa";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentCourses from "@/components/dashboard/RecentCourses";
import NotificationList from "@/components/dashboard/NotificationList";
import useTeacherService from '@/services/hooks/useTeacherService.js';
import useCourseService, { fetchStudentsByCourse } from '@/services/hooks/useCourseService';
import useLessonService, { fetchLessons } from '@/services/hooks/useLessonService';
import useAssignmentService from '@/services/hooks/useAssignmentService';
import {getProgress} from "@/lib/utils.js";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const teacherId = localStorage.getItem('teacherId');
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { getTeacherInfo, teacherInfo, loading } = useTeacherService(BASE_URL);
  const { getCourseList } = useCourseService();
  const { getLessonList } = useLessonService();
  const { getQuestionsByExam, getActiveExamsByTeacher } = useAssignmentService();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    specialization: ''
  });
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [recentCoursesWithStudents, setRecentCoursesWithStudents] = useState([]);
  const [recentCoursesWithDetails, setRecentCoursesWithDetails] = useState([]);

  const { data: courses = [] } = getCourseList(teacherId);
  const { data: activeExams = [] } = getActiveExamsByTeacher(teacherId);

  useEffect(() => {
    if (teacherId) {
      getTeacherInfo(teacherId).then((data) => {
        if (data) {
          setProfile({
            fullName: data.fullName || '',
          });
        }
      });
    }
  }, [teacherId]);

  useEffect(() => {
    if (courses.length > 0) {
      const fetchLessonsForCourses = async () => {
        try {
          const allLessons = await Promise.all(
            courses.map(async (course) => {
              const lessons = await fetchLessons({ courseId: course.courseId });
              return lessons;
            })
          );

          // Loại bỏ các bài học bị trùng lặp dựa trên ID
          const uniqueLessons = new Set();
          allLessons.flat().forEach((lesson) => {
            if (lesson.lessonId) {
              uniqueLessons.add(lesson.lessonId);
            } else {
              console.warn("Lesson without ID detected:", lesson); // Debug log
            }
          });

          setTotalLessons(uniqueLessons.size);
        } catch (error) {
          console.error("Error fetching lessons for courses:", error);
        }
      };
      fetchLessonsForCourses();
    }
  }, [courses]);

  useEffect(() => {
    if (courses.length > 0) {
      const fetchStudentsForCourses = async () => {
        try {
          const studentCounts = await Promise.all(
            courses.map(async (course) => {
              const students = await fetchStudentsByCourse(course.courseId);
              return students.length;
            })
          );
          setTotalStudents(studentCounts.reduce((acc, count) => acc + count, 0));
        } catch (error) {
          console.error("Error fetching students for courses:", error);
        }
      };
      fetchStudentsForCourses();
    }
  }, [courses]);

  useEffect(() => {
    if (courses.length > 0) {
      const fetchStudentsForCourses = async () => {
        try {
          const updatedCourses = await Promise.all(
            courses.map(async (course) => {
              const students = await fetchStudentsByCourse(course.courseId).then((data) => data.length).catch(() => 0);
              return {
                ...course,
                students,
              };
            })
          );
          setRecentCoursesWithStudents(updatedCourses);
        } catch (error) {
          console.error("Error fetching students for courses:", error);
        }
      };
      fetchStudentsForCourses();
    }
  }, [courses]);

  useEffect(() => {
    if (courses.length > 0) {
      const fetchDetailsForCourses = async () => {
        try {
          const updatedCourses = await Promise.all(
            courses.map(async (course) => {
              const students = await fetchStudentsByCourse(course.courseId).then((data) => data.length).catch(() => 0);
              const lessons = await fetchLessons({ courseId: course.courseId }).then((data) => data.length).catch(() => 0);
              return {
                ...course,
                students,
                lessons,
              };
            })
          );
          setRecentCoursesWithDetails(updatedCourses);
        } catch (error) {
          console.error("Error fetching details for courses:", error);
        }
      };
      fetchDetailsForCourses();
    }
  }, [courses]);

  const handleCreateCourse = () => {
    navigate('/teacher/courses/new');
  };

  const { data: lessons = [] } = getLessonList();

  const stats = useMemo(() => {
    return [
      {
        label: "Khóa học",
        value: courses.length,
        icon: <FaBook className="text-blue-500 text-2xl" />,
        bg: "bg-blue-100",
      },
      {
        label: "Bài học",
        value: totalLessons,
        icon: <FaClipboardList className="text-green-500 text-2xl" />,
        bg: "bg-green-100",
      },
      {
        label: "Bài tập",
        value: activeExams.length,
        icon: <FaClipboardList className="text-yellow-500 text-2xl" />,
        bg: "bg-yellow-100",
      },
      {
        label: "Học viên",
        value: totalStudents,
        icon: <FaUserGraduate className="text-purple-500 text-2xl" />,
        bg: "bg-purple-100",
      },
    ];
  }, [courses, totalLessons, activeExams, totalStudents]);

  const recentCourses = useMemo(() => {
    return recentCoursesWithDetails
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((course) => ({
        id: course.courseId,
        name: course.title,
        lessons: course.lessons || 0,
        students: course.students || 0,
        progress: getProgress(course.startDate, course.endDate),
        status: course.status || "Đang diễn ra",
      }));
  }, [recentCoursesWithDetails]);

  const mockNotifications = [
    {
      id: 1,
      message: "Bạn có 2 bài tập cần chấm điểm",
      time: "2 giờ trước",
      type: "task"
    },
    {
      id: 2,
      message: "Khóa học mới đã được tạo thành công!",
      time: "1 ngày trước",
      type: "success"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">
            {loading ? 'Đang tải...' : `Xin chào, ${profile.fullName || 'Giảng viên'}!`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Thông báo"
            >
              <FaBell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </button>
          </div>
          <button
            onClick={handleCreateCourse}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <FaPlusCircle className="w-4 h-4" />
            <span>Tạo khóa học</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <DashboardStats stats={stats} />

      {/* Recent Courses */}
      <RecentCourses courses={recentCourses} />

      {/* Notifications */}
      <NotificationList notifications={mockNotifications} />
    </div>
  );
};

export default TeacherDashboard;
