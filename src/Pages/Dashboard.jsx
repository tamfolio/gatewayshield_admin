import React from "react";
import Sidebar from "../Components/Dashboard/Sidebar";
import Home from "../Components/Dashboard/Home";
import { Outlet } from "react-router-dom";

function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 overflow-y-auto h-screen">
        <Outlet />
      </div>
    </div>
  );
}

export default Dashboard;
