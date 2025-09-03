import { createBrowserRouter } from 'react-router-dom';
import React from "react";
import MainLayout from '@/layouts/MainLayout';
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import CourseList from '@/pages/teacher/course/CourseList.jsx';
import CourseDetail from '@/pages/teacher/course/CourseDetail.jsx';
import TeacherNotifications from '@/pages/teacher/TeacherNotifications';
import AdminCourseCreate from '@/pages/admin/course/AdminCourseCreate.jsx';
import Login from '@/pages/login/Login.jsx';
import LoginCallback from '@/pages/login/LoginCallback.jsx';
import AssignmentCreate from '@/pages/teacher/assignments/AssignmentCreate.jsx';
import AssignmentAddQuestions from "@/pages/teacher/assignments/AssignmentAddQuestions.jsx";
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUserList from '@/pages/admin/user/AdminUserList.jsx';
import AdminUserDetail from '@/pages/admin/user/AdminUserDetail.jsx';
import AdminCourseList from '@/pages/admin/course/AdminCourseList.jsx';
import AdminCourseDetail from '@/pages/admin/course/AdminCourseDetail.jsx';
import AdminExamList from '@/pages/admin/exam/AdminExamList.jsx';
import AdminExamDetail from '@/pages/admin/exam/AdminExamDetail.jsx';
import AdminNotificationList from '@/pages/admin/AdminNotificationList';
import AdminReport from '@/pages/admin/AdminReport';
import PrivateRoute from '@/components/auth/PrivateRoute';
import AuthRedirect from '@/pages/login/AuthRedirect.jsx';
import Forbidden403 from '@/pages/login/Forbidden403.jsx';
import StudentLayout from '@/layouts/StudentLayout';
import AttendanceList from '@/pages/student/attendance/AttendanceList';
import MyCourses from '@/pages/student/courses/MyCourses';
import StudentDashboard from '@/pages/student/dashboard/StudentDashboard';
import ExamList from '@/pages/student/exams/ExamList';
import ExamDetail from '@/pages/student/exams/ExamDetail';
import ExamResult from '@/pages/student/exams/ExamResult';
import TeacherFeedbackForm from '@/pages/student/feedback/TeacherFeedbackForm';
import GradeOverview from '@/pages/student/grades/GradeOverview';
import NotificationCenter from '@/pages/student/notifications/NotificationCenter';
import AdminTeacherList from '@/pages/admin/teacher/AdminTeacherList';
import AdminTeacherDetail from '@/pages/admin/teacher/AdminTeacherDetail';
import AdminStudentList from '@/pages/admin/student/AdminStudentList';
import AdminStudentDetail from '@/pages/admin/student/AdminStudentDetail';

// Tạo lazy loading cho các routes phụ
const AssignmentList = React.lazy(() => import('@/pages/teacher/assignments/AssignmentList'));
const Reports = React.lazy(() => import('@/pages/teacher/reports/Reports'));
const Settings = React.lazy(() => import('@/pages/teacher/settings/Settings'));
const AssignmentDetail = React.lazy(() => import('@/pages/teacher/assignments/AssignmentDetail'));
const SubmissionList = React.lazy(() => import('@/pages/teacher/submissions/SubmissionList.jsx'));
const SubmissionDetail = React.lazy(() => import('@/pages/teacher/submissions/SubmissionDetail.jsx'));
const SubmissionAnswers = React.lazy(() => import('@/pages/teacher/submissions/SubmissionAnswers.jsx'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/teacher',
    element: (
      <PrivateRoute allowedRoles={['ROLE_TEACHER']}>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <TeacherDashboard />
      },
      {
        path: 'dashboard',
        element: <TeacherDashboard />
      },
      {
        path: 'notifications',
        element: <TeacherNotifications />
      },
      {
        path: 'courses',
        children: [
          {
            index: true,
            element: <CourseList />
          },
          {
            path: ':courseId',
            element: <CourseDetail />
          }
        ]
      },
      {
        path: 'assignments',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <AssignmentList />
          </React.Suspense>
        ),
      },
        {
            path: 'assignments/new',
            element: (
                <React.Suspense fallback={<LoadingFallback />}>
                    <AssignmentCreate />
                </React.Suspense>
            ),
        },
        {
            path: 'assignments/:examId/add-questions',
            element: (
                <React.Suspense fallback={<LoadingFallback />}>
                    <AssignmentAddQuestions />
                </React.Suspense>
            ),
        },
        {
            path: 'assignments/:examId/submissions',
            element: (
                <React.Suspense fallback={<LoadingFallback />}>
                    <SubmissionList />
                </React.Suspense>
            ),
        },
        {
            path: 'assignments/:examId/submissions/:submissionId',
            element: (
                <React.Suspense fallback={<LoadingFallback />}>
                    <SubmissionDetail />
                </React.Suspense>
            ),
        },
        {
            path: 'assignments/:examId/submissions/:submissionId/answers',
            element: (
                <React.Suspense fallback={<LoadingFallback />}>
                    <SubmissionAnswers />
                </React.Suspense>
            ),
        },
        {
            path: 'assignments/:examId',
            element: (
                <React.Suspense fallback={<LoadingFallback />}>
                    <AssignmentDetail />
                </React.Suspense>
            ),
        },
      {
        path: 'reports',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <Reports />
          </React.Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <Settings />
          </React.Suspense>
        ),
      }
    ]
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/login/callback',
    element: <LoginCallback />,
  },
  {
    path: '/oauth2/redirect',
    element: <LoginCallback />,
  },
  {
    path: '/admin',
    element: (
      <PrivateRoute allowedRoles={['ROLE_ADMIN']}>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <AdminUserList /> },
      { path: 'users/:userId', element: <AdminUserDetail /> },
      { path: 'courses', element: <AdminCourseList /> },
      { path: 'courses/:courseId', element: <AdminCourseDetail /> },
      { path: 'courses/new', element: <AdminCourseCreate /> },
      { path: 'exams', element: <AdminExamList /> },
      { path: 'exams/:examId', element: <AdminExamDetail /> },
      { path: 'notifications', element: <AdminNotificationList /> },
      { path: 'reports', element: <AdminReport /> },
      { path: 'students', children: [
        { index: true, element: <AdminStudentList /> },
        { path: ':studentId', element: <AdminStudentDetail /> },
      ] },
      { path: 'teachers', children: [
        { index: true, element: <AdminTeacherList /> },
        { path: ':teacherId', element: <AdminTeacherDetail /> },
      ] },
    ]
  },
  {
    path: '/student',
    element: (
      <PrivateRoute allowedRoles={['ROLE_STUDENT']}>
        <StudentLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: 'dashboard', element: <StudentDashboard /> },
      { path: 'courses', element: <MyCourses /> },
      { path: 'attendance', element: <AttendanceList /> },
      { path: 'exams', children: [
        { index: true, element: <ExamList /> },
        { path: ':examId', element: <ExamDetail /> },
        { path: ':examId/result', element: <ExamResult /> },
      ] },
      { path: 'grades', element: <GradeOverview /> },
      { path: 'notifications', element: <NotificationCenter /> },
      { path: 'feedback', element: <TeacherFeedbackForm /> },
    ]
  },
  {
    path: '/',
    element: <AuthRedirect />,
  },
  {
    path: '*',
    element: <AuthRedirect />,
  },
  {
    path: '/user',
    element: (
      <PrivateRoute allowedRoles={['ROLE_USER']}>
        <div>User Home</div>
      </PrivateRoute>
    ),
  },
  {
    path: '/403',
    element: <Forbidden403 />,
  },
]);

export default router;