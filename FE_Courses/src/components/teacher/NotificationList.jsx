import React from 'react';
import { cn } from '@/lib/utils';
import { FaBell, FaCheck } from 'react-icons/fa';
import { useNotifications } from '@/contexts/NotificationContext';

const NotificationList = () => {
  const { notifications, markAllAsRead, markAsRead } = useNotifications();
  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
            Thông báo mới
          </h2>
          {hasUnread && (
            <button
              onClick={markAllAsRead}
              className={cn(
                "text-sm text-blue-600 hover:text-blue-700 font-medium",
                "active:scale-95 transition-transform"
              )}
            >
              Đánh dấu đã đọc tất cả
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex items-start gap-4 p-4 lg:p-6",
                "hover:bg-gray-50 active:bg-gray-100",
                "cursor-pointer transition-colors touch-manipulation",
                !notification.isRead && "bg-blue-50/50"
              )}
              onClick={() => markAsRead(notification.id)}
            >
              <div className={cn(
                "flex-shrink-0 p-2 rounded-lg",
                notification.type === "task"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              )}>
                {notification.type === "task" ? (
                  <FaBell className="w-5 h-5" />
                ) : (
                  <FaCheck className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm lg:text-base mb-1",
                  !notification.isRead ? "text-gray-900 font-medium" : "text-gray-600"
                )}>
                  {notification.message}
                </p>
                <p className="text-xs lg:text-sm text-gray-500">
                  {notification.time}
                </p>
              </div>
              {!notification.isRead && (
                <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" />
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FaBell className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">Chưa có thông báo nào</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 lg:p-6 border-t border-gray-100 text-center">
          <button className={cn(
            "text-sm text-blue-600 hover:text-blue-700 font-medium",
            "active:scale-95 transition-transform"
          )}>
            Xem tất cả thông báo
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
