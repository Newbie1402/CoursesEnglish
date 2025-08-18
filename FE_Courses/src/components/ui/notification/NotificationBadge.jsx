import React from 'react';
import { FaBell } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';

const NotificationBadge = () => {
  const { unreadCount } = useNotifications();
  const hasUnread = unreadCount > 0;

  return (
    <button
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative group"
      aria-label={`Thông báo${hasUnread ? ` (${unreadCount} chưa đọc)` : ''}`}
    >
      <FaBell className={cn(
        "w-5 h-5 transition-colors",
        hasUnread ? "text-gray-700" : "text-gray-500"
      )} />
      {hasUnread && (
        <span className={cn(
          "absolute -top-1 -right-1 w-5 h-5",
          "bg-red-500 text-white text-xs",
          "rounded-full flex items-center justify-center",
          "group-hover:scale-110 transition-transform",
          "animate-in zoom-in duration-200"
        )}>
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBadge;
