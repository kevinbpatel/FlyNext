// NotificationsButton.tsx
import { Bell } from "lucide-react";

interface NotificationsButtonProps {
  unreadCount: number;
//   onMarkAllAsRead: () => void;
}

export function NotificationsButton({ unreadCount }: NotificationsButtonProps) {
  return (
    <button
      className="p-2 rounded-full hover:bg-secondary/80 text-foreground relative"
      aria-label="Notifications"
    //   onClick={onMarkAllAsRead}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-4 w-4 text-xs font-bold flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
