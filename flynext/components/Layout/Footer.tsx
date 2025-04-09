'use client';

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  
  // Check if we're on the landing page to apply transparency
  const isLandingPage = pathname === '/';
  
  return (
    <footer className={`${isLandingPage ? 'bg-transparent' : 'bg-background border-t border-border/50 shadow-sm'} py-6 text-foreground relative z-50`}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="font-bold text-xl">FlyNext</span>
            <span className="text-sm ml-2">
              © {new Date().getFullYear()} All rights reserved
            </span>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-sm">
            <a className="hover:underline cursor-pointer">About</a>
            <a className="hover:underline cursor-pointer">Terms</a>
            <a className="hover:underline cursor-pointer">Privacy</a>
            <a className="hover:underline cursor-pointer">Support</a>
            <a className="hover:underline cursor-pointer">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}