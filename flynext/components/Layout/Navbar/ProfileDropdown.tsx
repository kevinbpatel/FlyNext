"use client";

import Link from "next/link";
import { useUserContext } from "@/contexts/UserContext";
import { User, CalendarCheck, Hotel, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export const ProfileDropdown = ({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string; 
  };
}) => {
  const { logout } = useUserContext();

  // 1. Local state for final image URL
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string | null>(null);

  // 2. Convert user.profilePicture => query param approach
  useEffect(() => {
    if (!user || !user.profilePicture) {
      setCurrentProfilePicture(null);
      return;
    }

    if (user.profilePicture.includes("default-profile.png")) {
      setCurrentProfilePicture("/images/default-profile.png");
      return;
    }

    // e.g. user.profilePicture = "upload/user_pictures/abc.png"
    const routePath = `/api/images?p=${encodeURIComponent(user.profilePicture)}`;
    setCurrentProfilePicture(routePath);
  }, [user]);

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-64 bg-card rounded-md shadow-lg z-50 border border-border">

      {/* Top section with profile pic, name, email */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          {currentProfilePicture ? (
            <img
              src={currentProfilePicture}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {user.firstName?.charAt(0)}
              {user.lastName?.charAt(0)}
            </div>
          )}

          <div>
            <h3 className="font-medium text-base text-foreground">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Dropdown links */}
      <div className="py-2">
        <Link
          href="/profile"
          className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
          onClick={onClose}
        >
          <User className="w-4 h-4 mr-2 text-primary" /> Profile
        </Link>

        <Link
          href="/bookings"
          className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
          onClick={onClose}
        >
          <CalendarCheck className="w-4 h-4 mr-2 text-primary" /> My Bookings
        </Link>

        <Link
          href="/manage"
          className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
          onClick={onClose}
        >
          <Hotel className="w-4 h-4 mr-2 text-primary" /> Manage Hotels
        </Link>

        <button
          className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-muted text-destructive"
          onClick={() => {
            logout();
            onClose();
          }}
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </button>
      </div>
    </div>
  );
};
