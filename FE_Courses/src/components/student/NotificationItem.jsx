import React from "react";

const NotificationItem = ({ notification, onClick }) => {
  return (
    <div
      onClick={() => onClick && onClick(notification.id)}
      className="p-4 border rounded-lg shadow-sm hover:shadow-md transition bg-white cursor-pointer"
    >
      <h3 className="font-semibold">{notification.title}</h3>
      <p className="text-gray-700">{notification.message}</p>
      <span className="text-sm text-gray-500">
        📅 {new Date(notification.date).toLocaleString()}
      </span>
    </div>
  );
};

export default NotificationItem;
