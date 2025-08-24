import React, { useEffect, useState } from "react";
import { getNotifications } from "@/services/studentService.js";
import NotificationItem from "../../../components/student/NotificationItem";

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Đang tải thông báo...</p>;
  }

  if (notifications.length === 0) {
    return <p className="text-center text-gray-500">Không có thông báo nào.</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Trung tâm thông báo</h2>
      <ul className="space-y-4">
        {notifications.map((noti) => (
          <li key={noti.id}>
            <NotificationItem
              notification={noti}
              onClick={(id) => console.log("Clicked notification:", id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationCenter;
