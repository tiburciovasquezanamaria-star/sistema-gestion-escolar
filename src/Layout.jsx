import { useNavigate } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>🎓 Escuela</h2>

        <button onClick={() => navigate("/dashboard")}>🏠 Inicio</button>
        <button onClick={() => navigate("/students")}>👩‍🎓 Estudiantes</button>
        <button onClick={() => navigate("/courses")}>📚 Cursos</button>
        <button onClick={() => navigate("/grades")}>📝 Notas</button>
        <button onClick={() => navigate("/")}>🚪 Salir</button>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}

export default Layout;
