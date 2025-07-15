
import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out overflow-x-hidden",
        "p-2 sm:p-4 md:p-6 lg:p-8",
        "ml-0 md:ml-64 lg:ml-[20%]", // margen lateral solo en desktop
        "bg-gradient-to-b from-background to-background/95",
        className
      )}>
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
