
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";

// Main Dashboard component that renders the dashboard layout
const Dashboard: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-4 w-full max-w-[1600px] mx-auto px-2 sm:space-y-6 sm:px-4">
        <DashboardHeader />
        <DashboardContent />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
