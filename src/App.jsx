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
import CrimeMap from "./Components/Dashboard/Crime-Map/CrimeMap";
import GeneralDetails from "./Components/Dashboard/Report Management/GeneralDetails";
import EditUser from "./Components/Dashboard/User Management/EditUser";
import NewsPage from "./Components/Dashboard/admin-tools/news/CreateNewsArticle";
import EmergencyBroadcastForm from "./Components/Dashboard/admin-tools/emergency-broadcast/EmergencyBroadcastForm";
import FeedbackHub from './Components/Dashboard/feedbackhub/FeedbackHub';
import AuditLogs from "./Components/Dashboard/audit-logs/AuditLogs";
import SLAHub from "./Components/Dashboard/system-settings/SLAHub";
import ResourcesHub from "./Components/Dashboard/help/ResourcesHub";
import CreateIncident from "./Components/Dashboard/IncidentReporting/CreateIncident";
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
          <Route path="users/edit/:id" element={<EditUser />} />
          <Route path="users/manage" element={<ManageUsers />} />
          <Route path="reports/sos" element={<Sos />} />
          <Route path="incident" element={<CreateIncident />} />
          <Route path="reports/sos/:id" element={<SosDetails />} />
          <Route path="reports/general" element={<General />} />
          <Route path="reports/general/:id" element={<GeneralDetails />} />
          <Route path="feedback" element={<FeedbackHub />} />
          <Route path="crime-map" element={<CrimeMap />} />
          <Route path="admin/news" element={<NewsPage />} />
          <Route path="admin/emergency-broadcast" element={<EmergencyBroadcastForm />} />
          <Route path="feedback" element={<FeedbackHub />} /> 
          <Route path="audit" element={<AuditLogs />} /> 
          <Route path="settings" element={<SLAHub />} /> 
          <Route path="help" element={<ResourcesHub />} /> 
        </Route>
      </Routes>
    </>
  );
}

export default App;