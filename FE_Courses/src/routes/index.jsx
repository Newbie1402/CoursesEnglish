import { createBrowserRouter } from 'react-router-dom';
import React from "react";
import MainLayout from '@/layouts/MainLayout';
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import CourseList from '@/pages/teacher/CourseList';
import CourseDetail from '@/pages/teacher/CourseDetail';
import CourseForm from '@/pages/teacher/CourseForm';

// Tạo lazy loading cho các routes phụ
const LessonList = React.lazy(() => import('@/pages/teacher/lessons/LessonList'));
const AssignmentList = React.lazy(() => import('@/pages/teacher/assignments/AssignmentList'));
const StudentList = React.lazy(() => import('@/pages/teacher/students/StudentList'));
const Reports = React.lazy(() => import('@/pages/teacher/reports/Reports'));
const Settings = React.lazy(() => import('@/pages/teacher/settings/Settings'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/teacher',
    element: <MainLayout />,
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
            element: <CourseForm />
          },
          {
            path: ':courseId',
            element: <CourseDetail />
          },
          {
            path: ':courseId/edit',
            element: <CourseForm />
          }
        ]
      },
      {
        path: 'lessons',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <LessonList />
          </React.Suspense>
        ),
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
  }
]);

export default router;
