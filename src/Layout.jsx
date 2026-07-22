import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getUser, clearSession } from "./services/authApi";
import Swal from "sweetalert2";

function Layout({ children }) {
  const navigate = useNavigate();
  const currentUser = getUser();

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("sidebarCollapsed") === "true"; }
    catch (e) { return false; }
  });
  const [profileOpen, setProfileOpen] = useState(false);

  const toggle = () => {
    const next = !collapsed;
    try { localStorage.setItem("sidebarCollapsed", next); } catch (e) {}
    setCollapsed(next);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Se cerrará la sesión actual del sistema.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "hsl(0,60%,48%)",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sí, cerrar sesión",
    }).then((r) => {
      if (r.isConfirmed) {
        clearSession();
        navigate("/");
      }
    });
  };

  const currentPath = window.location.pathname;

  return (
    <div className="layout">
      <aside className={"sidebar " + (collapsed ? "collapsed" : "")}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "24px", height: "24px" }}>
              <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill="currentColor" />
              <path d="M17 14.18V19C17 20.1 14.76 21 12 21C9.24 21 7 20.1 7 19V14.18L12 16.9L17 14.18Z" fill="currentColor" />
            </svg>
          </div>
          <div className="sidebar-text">
            <h2>Escuela Control</h2>
          </div>
          <button
            className="sidebar-toggle"
            title={collapsed ? "Abrir menú" : "Cerrar menú"}
            aria-label={collapsed ? "Abrir menú" : "Cerrar menú"}
            onClick={toggle}
            style={{
              width: "32px", height: "32px",
              background: "linear-gradient(135deg, hsl(330, 70%, 98%), hsl(280, 60%, 98%))",
              border: "1px solid hsl(330, 45%, 86%)",
              boxShadow: "0 4px 10px rgba(190, 24, 93, 0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "50%", cursor: "pointer",
            }}
          >
            <svg
              className="toggle-icon" viewBox="0 0 24 24"
              width="14" height="14" fill="none"
              stroke="hsl(330, 65%, 45%)" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
              style={{
                transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: collapsed ? "rotate(180deg)" : "none",
              }}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Admin profile strip (only when expanded) */}
        {!collapsed && currentUser && (
          <div style={{
            padding: "10px 14px",
            margin: "0 8px 4px",
            background: "linear-gradient(135deg, hsl(330,70%,97%), hsl(280,55%,96%))",
            borderRadius: "12px",
            border: "1px solid hsl(330,40%,91%)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "linear-gradient(135deg, hsl(330,65%,82%), hsl(280,55%,82%))",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", fontWeight: "800", flexShrink: 0,
            }}>
              {currentUser.nombre ? currentUser.nombre.charAt(0).toUpperCase() : "A"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "hsl(260,30%,18%)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentUser.nombre}
              </div>
              <div style={{ fontSize: "10px", color: "hsl(260,15%,55%)" }}>{currentUser.cargo || "Administradora"}</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav" role="navigation" aria-label="Menú principal">
          <button className={currentPath === "/dashboard" ? "active" : ""} title="Inicio" onClick={() => navigate("/dashboard")}>
            <span className="icon" style={{ display: "inline-flex", alignItems: "center", color: "hsl(330, 80%, 45%)" }}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <span className="label">Inicio</span>
          </button>

          <button className={currentPath === "/students" ? "active" : ""} title="Control Escolar" onClick={() => navigate("/students")}>
            <span className="icon" style={{ display: "inline-flex", alignItems: "center", color: "hsl(280, 70%, 50%)" }}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span className="label">Control Escolar</span>
          </button>

          <button className={currentPath === "/courses" ? "active" : ""} title="Cursos" onClick={() => navigate("/courses")}>
            <span className="icon" style={{ display: "inline-flex", alignItems: "center", color: "hsl(215, 80%, 45%)" }}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </span>
            <span className="label">Cursos</span>
          </button>

          <button className={currentPath === "/grades" ? "active" : ""} title="Calificaciones" onClick={() => navigate("/grades")}>
            <span className="icon" style={{ display: "inline-flex", alignItems: "center", color: "hsl(38, 85%, 45%)" }}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </span>
            <span className="label">Calificaciones</span>
          </button>

          <button className={currentPath === "/attendance" ? "active" : ""} title="Asistencia Diaria" onClick={() => navigate("/attendance")}>
            <span className="icon" style={{ display: "inline-flex", alignItems: "center", color: "hsl(165, 75%, 36%)" }}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <span className="label">Asistencia Diaria</span>
          </button>

          <button className={currentPath === "/reports" ? "active" : ""} title="Reportes" onClick={() => navigate("/reports")}>
            <span className="icon" style={{ display: "inline-flex", alignItems: "center", color: "hsl(200, 80%, 45%)" }}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </span>
            <span className="label">Reportes</span>
          </button>

          <button className={currentPath === "/settings" ? "active" : ""} title="Configuración" onClick={() => navigate("/settings")}>
            <span className="icon" style={{ display: "inline-flex", alignItems: "center", color: "hsl(250, 55%, 50%)" }}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span className="label">Configuración</span>
          </button>

          <button className={currentPath === "/legal" ? "active" : ""} title="Marco Legal" onClick={() => navigate("/legal")}>
            <span className="icon" style={{ display: "inline-flex", alignItems: "center", color: "hsl(245, 25%, 45%)" }}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <span className="label">Marco Legal</span>
          </button>

          {/* Spacer */}
          <div style={{ flexGrow: 1, minHeight: "16px" }} />

          {/* Logout */}
          <button title="Cerrar sesión" onClick={handleLogout}>
            <span className="icon" style={{ display: "inline-flex", alignItems: "center", color: "hsl(0, 60%, 50%)" }}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span className="label">Cerrar sesión</span>
          </button>
        </nav>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}

export default Layout;
