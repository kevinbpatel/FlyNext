'use client';

import { usePathname } from "next/navigation";
import { useUserContext } from "@/contexts/UserContext";
import { Navbar } from "@/components/Layout/Navbar/Navbar";
import { Footer } from "@/components/Layout/Footer";
import { useEffect, useState } from "react";

export function LandingPageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme } = useUserContext();
  const isLandingPage = pathname === '/';
  
  // Track window width for responsive rendering
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const isMobile = windowWidth < 640;

  // Handle responsive detection
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Initial call and add listener
    handleResize();
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Background image - only shown on landing page */}
      {isLandingPage && (
        <>
          {!isMobile ? (
            // Desktop/tablet background (using background-image)
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url('/images/landing/${theme === 'dark' ? 'night' : 'day'}-cabin.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 45%',
                backgroundRepeat: 'no-repeat',
                filter: 'contrast(1.05) brightness(1.05)'
              }}
            />
          ) : (
            // Mobile background (using img element for more control)
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={`/images/landing/${theme === 'dark' ? 'night' : 'day'}-cabin.png`}
                alt="Background"
                className="absolute w-full min-w-[150%] min-h-screen max-w-none"
                style={{
                  left: '50%',
                  top: '-30%', // Move image up (adjust this value as needed)
                  transform: 'translateX(-50%) scale(1.5)', // Scale up the image to avoid white space
                  transformOrigin: 'center top', // Scale from the top center
                  objectFit: 'cover',
                  filter: 'contrast(1.05) brightness(1.05)'
                }}
              />
            </div>
          )}
          <div className="absolute inset-0 z-0 bg-background opacity-5"></div>
        </>
      )}
      
      <div className="flex flex-col min-h-screen relative z-10">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </div>
  );
}