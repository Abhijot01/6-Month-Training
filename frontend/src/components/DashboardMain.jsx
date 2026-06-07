import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import "../styles/dashboard.css";

export default function DashboardMain() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-root">
        <Outlet />
      </div>
    </div>
  );
}