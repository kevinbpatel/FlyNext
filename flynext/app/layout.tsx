import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { ReactLenis } from "lenis/react";
import { LandingPageWrapper } from "@/components/Layout/LandingPageWrapper";

// Load Quicksand as our primary font for the entire site
const quicksand = Quicksand({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-quicksand",
  weight: ["300", "400", "500", "600", "700"], // Load multiple weights for flexibility
});

export const metadata: Metadata = {
  title: "FlyNext - Your Travel Companion",
  description: "Book flights and hotels with ease using FlyNext",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // More subtle Lenis configuration
  const lenisOptions = {
    lerp: 0.07,           // Lower lerp value for more subtle interpolation
    duration: 1.0,        // Shorter duration
    smoothWheel: true,    // Enable smooth scrolling for mouse wheel
    smoothTouch: false,   // Disable for touch devices for native feel
    wheelMultiplier: 0.7, // Reduce wheel sensitivity
    touchMultiplier: 1.5, // Adjust touch sensitivity
    infinite: false,
    orientation: "vertical" as const,
    gestureOrientation: "vertical" as const,
  };
  
  return (
    <html lang="en" className={`scroll-smooth ${quicksand.variable}`}>
      <body className={quicksand.className}>
        <ReactLenis root options={lenisOptions}>
          <UserProvider>
            <LandingPageWrapper>
              {children}
            </LandingPageWrapper>
          </UserProvider>
        </ReactLenis>
      </body>
    </html>
  );
}