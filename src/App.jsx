import "./App.css";
import { Routes, Route } from "react-router-dom";

import LoginCentral from "./Components/Auth/LoginCentral";
import Dashboard from "./Pages/Dashboard";
import Home from "./Components/Dashboard/Home";
import AddUsers from "./Components/Dashboard/User Management/AddUsers";
import ManageUsers from "./Components/Dashboard/User Management/ManageUsers";
import Sos from "./Components/Dashboard/Report Management/Sos";
import General from "./Components/Dashboard/Report Management/General";
import SosDetails from "./Components/Dashboard/Report Management/SosDetails";
import { ToastContainer } from "react-toastify";
import ForgotPasswordFlow from "./Components/Auth/ForgotPassword";
import { ActivateAccount } from "./Components/Auth/ActivateAccount";
import CreateNewsArticle from "./Components/Dashboard/Admin Tools/CreateNewsArticle";
// Import more components as needed...

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route path="/" element={<LoginCentral />} />
        <Route path="/forgot-password" element={<ForgotPasswordFlow />} />
        <Route path="/activate-account" element={<ActivateAccount />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Home />} />
          <Route path="users/add" element={<AddUsers />} />
          <Route path="users/manage" element={<ManageUsers />} />
          <Route path="reports/sos" element={<Sos />} />
          <Route path="reports/sos/:id" element={<SosDetails />} />
          <Route path="reports/general" element={<General />} />
          <Route path="admin/news" element={<CreateNewsArticle />} />
          <Route path="admin/new-broadcast" element={<CreateNewBroadcast />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
