import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuthState] = useState({
    token: null,
    userId: null,
    roles: [],
    role: null, // role chính (string)
    studentId: 'null',
    teacherId: 'null',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Load từ localStorage khi reload
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const roles = localStorage.getItem('roles');
    const role = localStorage.getItem('role');
    const studentId = localStorage.getItem('studentId');
    const teacherId = localStorage.getItem('teacherId');
    if (token && userId && roles) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp && decoded.exp * 1000 > Date.now()) {
          const rolesParsed = JSON.parse(roles);
          setAuthState({
            token,
            userId,
            roles: rolesParsed,
            role: role || (rolesParsed && rolesParsed[0]) || null,
            studentId: studentId || null,
            teacherId: teacherId || null,
          });
        } else {
          logout();
        }
      } catch (e) {
        logout();
      }
    } else {
      logout();
    }
    setIsLoading(false);
  }, []);

  const setAuth = ({ token, userId, roles, role, studentId, teacherId }) => {
    console.log('[AuthContext] setAuth called with:', { token, userId, roles, role, studentId, teacherId });
    setAuthState({ token, userId, roles, role, studentId, teacherId });
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('roles', JSON.stringify(roles));
    localStorage.setItem('role', role);
    if (studentId) localStorage.setItem('studentId', studentId);
    else localStorage.removeItem('studentId');
    if (teacherId) localStorage.setItem('teacherId', teacherId);
    else localStorage.removeItem('teacherId');
  };

  // Hàm cập nhật teacherId sau khi tạo thành công
  const updateTeacherId = (teacherId) => {
    setAuthState((prev) => {
      const newState = { ...prev, teacherId };
      localStorage.setItem('teacherId', teacherId);
      return newState;
    });
  };

  const logout = () => {
    setAuthState({ token: null, userId: null, roles: [], role: null, studentId: null, teacherId: null });
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('roles');
    localStorage.removeItem('role');
    localStorage.removeItem('studentId');
    localStorage.removeItem('teacherId');
  };

  return (
    <AuthContext.Provider value={{ ...auth, setAuth, updateTeacherId, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
