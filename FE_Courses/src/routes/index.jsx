import { createBrowserRouter } from 'react-router-dom';
import React from "react";
import MainLayout from '@/layouts/MainLayout';
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import CourseList from '@/pages/teacher/course/CourseList.jsx';
import CourseDetail from '@/pages/teacher/course/CourseDetail.jsx';
import CourseCreate from '@/pages/teacher/course/CourseCreate.jsx';
import Login from '@/pages/login/Login.jsx';
import LoginCallback from '@/pages/login/LoginCallback.jsx';
import AssignmentCreate from '@/pages/teacher/assignments/AssignmentCreate.jsx';
import AssignmentAddQuestions from "@/pages/teacher/assignments/AssignmentAddQuestions.jsx";
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUserList from '@/pages/admin/AdminUserList';
import AdminUserDetail from '@/pages/admin/AdminUserDetail';
import AdminCourseList from '@/pages/admin/AdminCourseList';
import AdminCourseDetail from '@/pages/admin/AdminCourseDetail';
import AdminExamList from '@/pages/admin/AdminExamList';
import AdminExamDetail from '@/pages/admin/AdminExamDetail';
import AdminNotificationList from '@/pages/admin/AdminNotificationList';
import AdminReport from '@/pages/admin/AdminReport';
import PrivateRoute from '@/components/auth/PrivateRoute';
import AuthRedirect from '@/pages/login/AuthRedirect.jsx';
import Forbidden403 from '@/pages/login/Forbidden403.jsx';

// Tạo lazy loading cho các routes phụ
const AssignmentList = React.lazy(() => import('@/pages/teacher/assignments/AssignmentList'));
const StudentList = React.lazy(() => import('@/pages/teacher/students/StudentList'));
const Reports = React.lazy(() => import('@/pages/teacher/reports/Reports'));
const Settings = React.lazy(() => import('@/pages/teacher/settings/Settings'));
const AssignmentDetail = React.lazy(() => import('@/pages/teacher/assignments/AssignmentDetail'));

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
        path: 'courses',
        children: [
          {
            index: true,
            element: <CourseList />
          },
          {
            path: 'new',
            element: <CourseCreate />
          },
          {
            path: ':courseId',
            element: <CourseDetail />
          },
          {
            path: ':courseId/edit',
            element: <CourseCreate />
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
            path: 'assignments/:examId',
            element: (
                <React.Suspense fallback={<LoadingFallback />}>
                    <AssignmentDetail />
                </React.Suspense>
            ),
        },
      {
        path: 'students',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <StudentList />
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
      { path: 'exams', element: <AdminExamList /> },
      { path: 'exams/:examId', element: <AdminExamDetail /> },
      { path: 'notifications', element: <AdminNotificationList /> },
      { path: 'reports', element: <AdminReport /> },
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