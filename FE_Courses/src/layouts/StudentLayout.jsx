import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    FaBars,
    FaUserCircle,
    FaTimes,
    FaHome,
    FaBook,
    FaClipboardList,
    FaBell,
    FaGraduationCap,
    FaCalendarCheck,
    FaCommentDots,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import NotificationBadge from "@/components/ui/notification/NotificationBadge";
import ProfileDropdownStudent from "@/components/ui/profile/ProfileDropdownStudent";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { getStudentDetail } from "@/services/hooks/studentService";

// Route display names (prefix match, longest wins)
const ROUTE_NAMES = {
    "/student/dashboard": "Dashboard",
    "/student/courses": "Khoá học của tôi",
    "/student/grades": "Kết quả học tập",
    "/student/notifications": "Thông báo",
    // "/student/feedback": "Góp ý giảng viên",
};

const MobileNavItem = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex flex-col items-center justify-center flex-1 py-2 px-3",
            "text-xs font-medium transition-colors",
            isActive
                ? "text-blue-600 font-semibold bg-blue-50 rounded-lg mx-1"
                : "text-gray-600 hover:text-blue-600"
        )}
    >
        <Icon className={cn("w-5 h-5 mb-1", isActive ? "text-blue-600" : "text-gray-600")} />
        <span>{label}</span>
    </button>
);

const SidebarItem = ({ label, path, icon: Icon, location, navigate }) => {
    const isActive =
        location.pathname === path || location.pathname.startsWith(path + "/");
    return (
        <button
            onClick={() => navigate(path)}
            className={cn(
                "flex items-center w-full px-4 py-3 rounded-xl text-left transition-all duration-200",
                "hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm",
                isActive
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-semibold border-l-4 border-blue-500"
                    : "text-gray-700"
            )}
        >
            {Icon && (
                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-500" : "text-gray-500")} />
            )}
            <span className="text-sm">{label}</span>
        </button>
    );
};

const StudentLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [profile, setProfile] = React.useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    // From AuthContext
    const { token, studentId: authStudentId, role, userId } = useAuth() || {};

    // Use studentId from context OR localStorage (handle "null"/"undefined" strings)
    const effectiveStudentId = React.useMemo(() => {
        const raw = (authStudentId ?? localStorage.getItem("studentId") ?? "").toString();
        if (!raw || raw === "null" || raw === "undefined") return null;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
    }, [authStudentId]);

    // Compute current page (longest matching prefix)
    const currentPageName = React.useMemo(() => {
        const keys = Object.keys(ROUTE_NAMES).sort((a, b) => b.length - a.length);
        const match = keys.find(
            (k) => location.pathname === k || location.pathname.startsWith(k + "/")
        );
        return ROUTE_NAMES[match || "/student/dashboard"] || "Dashboard";
    }, [location.pathname]);

    // Sidebar default open on desktop, closed on mobile
    React.useEffect(() => {
        const update = () => setIsSidebarOpen(window.innerWidth >= 1024);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    // Close sidebar on route change (mobile)
    React.useEffect(() => {
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
    }, [location]);

    // Load student profile when we have an id
    React.useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!effectiveStudentId) {
                setProfile(null);
                return;
            }
            try {
                const data = await getStudentDetail(effectiveStudentId);
                if (!mounted) return;
                setProfile(data || null);
            } catch {
                if (!mounted) return;
                setProfile(null);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [effectiveStudentId]);

    // Fallback display values
    const displayName =
        profile?.fullName ||
        profile?.name ||
        (effectiveStudentId ? `#${effectiveStudentId}` : role === "ROLE_STUDENT" ? "Học viên" : "Người dùng");

    const displayEmail = profile?.email || "";
    const avatarUrl =
        profile?.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff`;

    const mobileNavItems = [
        { path: "/student/dashboard", icon: FaHome, label: "Trang chủ" },
        { path: "/student/courses", icon: FaBook, label: "Khoá học" },
        { path: "/student/exams", icon: FaClipboardList, label: "Kỳ thi" },
        { path: "/student/notifications", icon: FaBell, label: "Thông báo" },
    ];

    const sidebarItems = [
        { label: "Dashboard", path: "/student/dashboard", icon: FaHome },
        { label: "Khoá học của tôi", path: "/student/courses", icon: FaBook },
        { label: "Kết quả học tập", path: "/student/grades", icon: FaGraduationCap },
        { label: "Thông báo", path: "/student/notifications", icon: FaBell },
        // { label: "Góp ý giảng viên", path: "/student/feedback", icon: FaCommentDots },
    ];

    return (
        <div className="min-h-screen bg-gray-50/95">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white z-40 border-b border-gray-200 shadow-sm">
                <div className="h-14 lg:h-16 flex items-center justify-between px-4 lg:px-6">
                    {/* Left */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen((v) => !v)}
                            className="lg:hidden p-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            {isSidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
                        </button>
                        <h1 className="text-lg lg:text-xl font-semibold text-gray-800">Student Portal</h1>
                        <span className="mx-2 text-gray-400 hidden sm:inline">/</span>
                        <span className="text-sm lg:text-base text-gray-600 font-medium hidden sm:inline">
              {currentPageName}
            </span>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-4">
                        {/* Pass token so unread-count doesn’t 400 */}
                        <NotificationBadge token={token} />
                        <ProfileDropdownStudent
                            student={{
                                id: effectiveStudentId || userId || 0,
                                name: displayName,
                                avatar: avatarUrl,
                                role: "Học viên",
                                email: displayEmail,
                            }}
                        />
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-14 lg:top-16 bottom-16 lg:bottom-0 w-[280px] bg-white border-r border-gray-200 z-30 transition-transform duration-300",
                    isSidebarOpen ? "translate-x-0 shadow-lg" : "-translate-x-full",
                    "lg:translate-x-0"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Avatar */}
                    <div className="p-6 border-b border-gray-100 flex flex-col items-center bg-gradient-to-b from-blue-50 to-white">
                        <div className="relative mb-4">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="avatar"
                                    className="w-20 h-20 rounded-full border-4 border-blue-100 shadow-sm"
                                />
                            ) : (
                                <FaUserCircle className="w-20 h-20 text-gray-300" />
                            )}
                            <span className="absolute bottom-1 right-1 block w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                        </div>

                        <div className="text-center">
                            <p className="font-semibold text-gray-800 text-lg">{displayName}</p>
                            <p className="text-blue-600 font-medium text-sm bg-blue-50 px-3 py-1 rounded-full mt-1 inline-block">
                                Học viên
                            </p>
                            {displayEmail && <p className="text-xs text-gray-500 mt-2">{displayEmail}</p>}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-5 space-y-2">
                        {sidebarItems.map((item) => (
                            <SidebarItem
                                key={item.path}
                                label={item.label}
                                path={item.path}
                                icon={item.icon}
                                location={location}
                                navigate={navigate}
                            />
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="pt-14 lg:pt-16 pb-16 lg:pb-0 min-h-screen lg:pl-[280px]">
                <div className="px-5 py-5 lg:py-6">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg py-2">
                <div className="flex items-center justify-around">
                    {[
                        { path: "/student/dashboard", icon: FaHome, label: "Trang chủ" },
                        { path: "/student/courses", icon: FaBook, label: "Khoá học" },
                        { path: "/student/exams", icon: FaClipboardList, label: "Kỳ thi" },
                        { path: "/student/notifications", icon: FaBell, label: "Thông báo" },
                    ].map((item) => (
                        <MobileNavItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            isActive={
                                location.pathname === item.path ||
                                location.pathname.startsWith(item.path + "/")
                            }
                            onClick={() => navigate(item.path)}
                        />
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default StudentLayout;
