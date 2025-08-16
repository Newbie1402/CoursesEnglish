import React from 'react'
import TestTailwind from './components/TestTailwind'
import AppRoutes from './routes'
import PageTeacherDashboard from './pages/teacher/TeacherDashboard'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
        <PageTeacherDashboard/>
      <AppRoutes />
    </div>
  )
}

export default App
