import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Dashboard from "./pages/dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
}
