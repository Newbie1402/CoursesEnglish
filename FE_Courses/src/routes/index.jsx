import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import CourseDetail from "../pages/teacher/CourseDetail";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/teacher" element={<TeacherDashboard />} />
      <Route path="/teacher/courses/:id" element={<CourseDetail />} />
    </Routes>
  </Router>
);

export default AppRoutes;

