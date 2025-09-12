import React, { useEffect, useState, useMemo } from "react";
import {
    FaUser,
    FaSave,
    FaBirthdayCake,
    FaMapMarkerAlt,
    FaPhone,
} from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { getProfile, updateProfile, updateStudentProfile, createStudent } from "@/services/hooks/studentService";
import Modal from "@/components/ui/modal/Modal.jsx";
import { useNavigate } from "react-router-dom";

const StudentSettings = () => {
    const navigate = useNavigate();
    const auth = useAuth() || {};
    const { studentId: ctxStudentId, userId, token, roles, role, teacherId, setAuth } = auth;

    const studentId = useMemo(() => {
        const raw = ctxStudentId ?? localStorage.getItem("studentId");
        if (!raw || raw === "null" || raw === "undefined" || raw === "") return null;
        const n = Number(raw);
        return Number.isNaN(n) ? null : n;
    }, [ctxStudentId]);

    // Account info (user profile)
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");
    const [address, setAddress] = useState("");

    // Extended student profile (family info + application)
    const [fatherName, setFatherName] = useState("");
    const [fatherPhone, setFatherPhone] = useState("");
    const [motherName, setMotherName] = useState("");
    const [motherPhone, setMotherPhone] = useState("");
    const [application, setApplication] = useState("Học sinh");

    // UI state
    const [activeTab, setActiveTab] = useState("personal"); // personal | account
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [showMissingIdModal, setShowMissingIdModal] = useState(false);

    // Check missing studentId to show modal
    useEffect(() => {
        if (!studentId) {
            setShowMissingIdModal(true);
            setLoading(false);
        } else {
            setShowMissingIdModal(false); // hide if now available
        }
    }, [studentId]);
    console.log("Current studentId:", userId);

    // Load profile from API
    useEffect(() => {
        const run = async () => {
            if (!studentId) return;
            setLoading(true);
            setMessage("");
            try {
                const stu = await getProfile(studentId);
                setName(stu?.fullName || "");
                setEmail(stu?.email || "");
                setPhone(stu?.phoneNumber || "");
                setGender(stu?.gender || "");
                setDob(stu?.dateOfBirth || "");
                setAddress(stu?.address || "");
                // extended
                setFatherName(stu?.fatherName || "");
                setFatherPhone(stu?.fatherPhone || "");
                setMotherName(stu?.motherName || "");
                setMotherPhone(stu?.motherPhone || "");
                setApplication(stu?.application || "");
            } catch (err) {
                console.error("Load profile failed:", err);
                setMessage("❌ Lỗi khi tải hồ sơ học viên");
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [studentId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setSaving(true);
        try {
            // First-time creation
            if (!studentId) {
                if (!userId) throw new Error("Không tìm thấy userId để tạo học viên");
                const createPayload = {
                    userId: Number(userId),
                    fatherName: fatherName || null,
                    fatherPhone: fatherPhone || null,
                    motherName: motherName || null,
                    motherPhone: motherPhone || null,
                    application: application || "Học sinh",
                };
                const created = await createStudent(createPayload);
                const newSid = created?.studentId || created?.id;
                if (!newSid) throw new Error("API không trả về studentId sau khi tạo");

                setAuth({ token, userId, roles, role, studentId: newSid, teacherId });
                localStorage.setItem("studentId", newSid);

                // Optional: update account info if provided
                if (name || email || phone || gender || dob || address) {
                    const accountPayload = {
                        fullName: name,
                        email,
                        phoneNumber: phone,
                        gender: gender || null,
                        dateOfBirth: dob || null,
                        address,
                    };
                    await updateProfile(newSid, accountPayload);
                }

                setMessage("✅ Tạo hồ sơ học viên thành công!");
                setShowMissingIdModal(false);
                return;
            }

            // Update existing
            const accountPayload = {
                fullName: name,
                email,
                phoneNumber: phone,
                gender: gender || null,
                dateOfBirth: dob || null,
                address,
            };
            await updateProfile(studentId, accountPayload);

            const extendedPayload = {
                fatherName: fatherName || null,
                fatherPhone: fatherPhone || null,
                motherName: motherName || null,
                motherPhone: motherPhone || null,
                application: application || "Học sinh",
            };
            await updateStudentProfile(studentId, extendedPayload);
            setMessage("✅ Cập nhật hồ sơ thành công!");
        } catch (err) {
            console.error("Profile save failed:", err);
            setMessage(`❌ ${err?.message || "Có lỗi xảy ra khi lưu hồ sơ"}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaUser className="mr-3 text-blue-500" />
                Cài Đặt Học Viên
            </h1>

            {/* Tabs */}
            <div className="flex flex-wrap border-b border-gray-200 mb-6">
                <button
                    className={`py-3 px-6 font-medium rounded-t-lg transition-colors ${
                        activeTab === "personal"
                            ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("personal")}
                >
                    Hồ Sơ Cá Nhân
                </button>
                <button
                    className={`py-3 px-6 font-medium rounded-t-lg transition-colors ${
                        activeTab === "account"
                            ? "bg-blue-50 text-blue-600 border-b-2 border-blue-500"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("account")}
                >
                    Thông Tin Tài Khoản
                </button>
            </div>

            {loading ? (
                <div className="p-6 bg-white rounded-xl shadow-sm text-gray-600">
                    Đang tải hồ sơ...
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal extended profile */}
                    {activeTab === "personal" && (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm p-6 border border-purple-100">
                            <h2 className="text-lg font-semibold text-purple-700 mb-4 flex items-center">
                                <FaUser className="mr-2 text-purple-500" />
                                Thông Tin Gia Đình & Ứng Tuyển
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Tên Cha</label>
                                    <input
                                        type="text"
                                        value={fatherName}
                                        onChange={(e) => setFatherName(e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-purple-200 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Số Điện Thoại Cha</label>
                                    <input
                                        type="tel"
                                        value={fatherPhone}
                                        onChange={(e) => setFatherPhone(e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-purple-200 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Tên Mẹ</label>
                                    <input
                                        type="text"
                                        value={motherName}
                                        onChange={(e) => setMotherName(e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-purple-200 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Số Điện Thoại Mẹ</label>
                                    <input
                                        type="tel"
                                        value={motherPhone}
                                        onChange={(e) => setMotherPhone(e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-purple-200 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Application</label>
                                    <textarea
                                        value={application}
                                        onChange={(e) => setApplication(e.target.value)}
                                        rows={4}
                                        className="mt-1 block w-full rounded-lg border-purple-200 bg-white py-2 px-3 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                        placeholder="Mô tả ngắn gọn đơn / lý do đăng ký..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account info */}
                    {activeTab === "account" && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-100">
                            <h2 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
                                <FaUser className="mr-2 text-blue-500" />
                                Thông Tin Tài Khoản
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Họ và Tên</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-blue-200 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-blue-200 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Số điện thoại</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaPhone className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="pl-10 mt-1 block w-full rounded-lg border-blue-200 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Giới tính</label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-blue-200 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    >
                                        <option value="">-- Chọn --</option>
                                        <option value="MALE">Nam</option>
                                        <option value="FEMALE">Nữ</option>
                                        <option value="OTHER">Khác</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Ngày sinh</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaBirthdayCake className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <input
                                            type="date"
                                            value={dob || ""}
                                            onChange={(e) => setDob(e.target.value)}
                                            className="pl-10 mt-1 block w-full rounded-lg border-blue-200 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Địa chỉ</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaMapMarkerAlt className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="pl-10 mt-1 block w-full rounded-lg border-blue-200 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save */}
                    <div className="flex flex-col items-center pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-200 flex items-center justify-center w-full md:w-auto"
                        >
                            {saving ? (
                                <>Đang lưu...</>
                            ) : (
                                <>
                                    <FaSave className="mr-2" />
                                    Lưu Thay Đổi
                                </>
                            )}
                        </button>

                        {message && (
                            <div
                                className={`mt-4 p-3 rounded-lg text-center w-full ${
                                    message.includes("✅")
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {message}
                            </div>
                        )}
                    </div>
                </form>
            )}

            {/* Modal when missing studentId */}
            <Modal
                isOpen={showMissingIdModal}
                onClose={() => setShowMissingIdModal(false)}
                title="Thiếu Mã Học Viên"
            >
                <p className="text-sm text-gray-700 mb-4">
                    Bạn chưa có mã học viên. Vui lòng điền đầy đủ thông tin và nhấn Lưu để tạo hồ sơ học viên lần đầu.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setShowMissingIdModal(false)}
                        className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Đã hiểu
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default StudentSettings;