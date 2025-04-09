'use client';

import Link from "next/link";
import { useUserContext } from "@/contexts/UserContext";
import { useState, useEffect  } from "react";
import { ProfileDropdown } from "@/components/Layout/Navbar/ProfileDropdown";
import { Bell, ShoppingCart, Moon, Sun } from "lucide-react";
import { usePathname , useSearchParams } from "next/navigation";
import { NotificationsButton } from "@/components/Notif/Notif_button";


export function Navbar() {
  const { user, isAuthenticated, theme, toggleTheme, fetchWithAuth } = useUserContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  // const searchParams = useSearchParams();
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string | null>(null);


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



  const fetchUnreadCount = async () => {
    try {
      const res = await fetchWithAuth("/api/notifications/view?limit=20&page=1");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
        console.log(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [pathname, isAuthenticated]);
  
  // Check if we're on the landing page to apply transparency
  const isLandingPage = pathname === '/';
  
  return (
    <header className={`${isLandingPage ? 'bg-transparent' : 'bg-background border-b border-border/50 shadow-sm'} relative z-50 py-2`}>
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="bg-primary text-primary-foreground font-bold py-1 px-3 rounded mr-2 text-center">
              FlyNext
            </div>
          </Link>
        </div>
        
        {/* Right side controls */}
        <div className="flex items-center gap-x-2 pr-0">
          {/* Dark/Light mode toggle */}
          <button
            className="p-2 rounded-full hover:bg-secondary/80 text-foreground"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          
          {/* Notification button */}
          {/* <button className="p-2 rounded-full hover:bg-secondary/80 text-foreground" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button> */}
          <NotificationsButton unreadCount={unreadCount}  />
          
          {/* Cart button */}
          <button className="p-2 rounded-full hover:bg-secondary/80 text-foreground" aria-label="Shopping cart">
            <ShoppingCart className="h-5 w-5" />
          </button>
          
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                className="p-1 rounded-full hover:bg-secondary/80"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                {currentProfilePicture? (
                  <img
                    src={currentProfilePicture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {user.firstName?.charAt(0)}
                    {user.lastName?.charAt(0)}
                  </div>
                )}
              </button>
              <ProfileDropdown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                user={user}
              />
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`px-4 py-2 ${isLandingPage ? 'text-foreground hover:bg-secondary/40' : 'text-foreground hover:bg-secondary'} rounded-md transition-colors`}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className={`px-4 py-2 border border-border ${isLandingPage ? 'text-foreground hover:bg-secondary/40' : 'text-foreground hover:bg-secondary'} rounded-md transition-colors`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}