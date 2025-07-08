import "./App.css";
import { Routes, Route } from "react-router-dom";

import LoginCentral from "./Components/Auth/LoginCentral";
import Dashboard from "./Pages/Dashboard";
import Home from "./Components/Dashboard/Home";
import AddUsers from "./Components/Dashboard/User Management/AddUsers";
import ManageUsers from "./Components/Dashboard/User Management/ManageUsers";
// Import more components as needed...

function App() {
  return (
<Routes>
  <Route path="/" element={<LoginCentral />} />
  <Route path="/dashboard" element={<Dashboard />}>
    <Route index element={<Home />} />
    <Route path="users/add" element={<AddUsers />} />
    <Route path="users/manage" element={<ManageUsers/>} />
  </Route>
</Routes>
  );
}

export default App;
