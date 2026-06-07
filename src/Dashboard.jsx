import { useNavigate } from "react-router-dom";
import Layout from "./Layout";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <Layout>
      <h1>Dashboard</h1>

      <div className="grid">

        <div className="card" onClick={() => navigate("/students")}>
          👩‍🎓 Estudiantes
        </div>

        <div className="card" onClick={() => navigate("/courses")}>
          📚 Cursos
        </div>

        <div className="card" onClick={() => navigate("/grades")}>
          📝 Notas
        </div>

        <div className="card">
          📊 Reportes
        </div>

      </div>
    </Layout>
  );
}

export default Dashboard;