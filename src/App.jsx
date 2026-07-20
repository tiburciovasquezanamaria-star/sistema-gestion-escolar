import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Grades from "./pages/Grades";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/grades" element={<Grades />} />
    
      </Routes>
      <SpeedInsights />
    </BrowserRouter>
  );
}

export default App;