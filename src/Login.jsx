import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { login, saveSession } from "./services/authApi";
import "./styles.css";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Client-side validation
    if (!usuario.trim()) {
      return Swal.fire({
        title: "Usuario requerido",
        text: "Por favor ingrese su nombre de usuario.",
        icon: "warning",
        confirmButtonColor: "hsl(330, 65%, 45%)",
      });
    }
    if (!password) {
      return Swal.fire({
        title: "Contraseña requerida",
        text: "Por favor ingrese su contraseña de acceso.",
        icon: "warning",
        confirmButtonColor: "hsl(330, 65%, 45%)",
      });
    }

    setLoading(true);
    try {
      const result = await login(usuario.trim(), password);

      if (result.success) {
        saveSession(result.token, result.user);
        Swal.fire({
          title: `¡Bienvenida, ${result.user.nombre}!`,
          text: "Acceso concedido al panel central.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => navigate("/dashboard"));
      } else {
        Swal.fire({
          title: "Acceso Denegado",
          text: result.message || "Credenciales incorrectas.",
          icon: "error",
          confirmButtonColor: "hsl(330, 65%, 45%)",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error de Conexión",
        text: "No se pudo conectar con el servidor. Verifique que el servidor esté ejecutándose en el puerto 3001.",
        icon: "error",
        confirmButtonColor: "hsl(330, 65%, 45%)",
      });
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div
        className="login-box"
        style={{ background: "rgba(255, 255, 255, 0.97)", borderRight: "1px solid hsl(330, 45%, 90%)" }}
      >
        {/* Logo and title */}
        <div className="login-header">
          <div
            className="login-logo"
            style={{
              background: "linear-gradient(135deg, hsl(330, 70%, 92%), hsl(280, 60%, 92%))",
              color: "hsl(330, 65%, 45%)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill="currentColor" />
              <path
                d="M17 14.18V19C17 20.1 14.76 21 12 21C9.24 21 7 20.1 7 19V14.18L12 16.9L17 14.18Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div>
            <h1
              className="login-title"
              style={{
                fontFamily: "var(--font-heading)",
                color: "hsl(260, 30%, 18%)",
                fontWeight: "800",
                fontSize: "26px",
              }}
            >
              Sistema de Gestión Escolar
            </h1>
            <p className="login-subtitle" style={{ color: "hsl(260, 20%, 42%)", marginTop: "4px", fontSize: "13px" }}>
              Panel de Control Administrativo — Acceso Seguro
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "14px" }}>
          {/* Usuario field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "hsl(260,25%,38%)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Usuario
            </label>
            <input
              id="login-usuario"
              type="text"
              placeholder="Ingrese su usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              disabled={loading}
              style={{
                padding: "13px 16px",
                borderRadius: "12px",
                border: "1.5px solid hsl(280, 20%, 86%)",
                outline: "none",
                fontSize: "14px",
                transition: "border-color 0.2s",
                background: "#fff",
              }}
              onFocus={(e) => (e.target.style.borderColor = "hsl(330, 60%, 65%)")}
              onBlur={(e) => (e.target.style.borderColor = "hsl(280, 20%, 86%)")}
            />
          </div>

          {/* Password field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "hsl(260,25%,38%)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Contraseña
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                type={showPass ? "text" : "password"}
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px 44px 13px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid hsl(280, 20%, 86%)",
                  outline: "none",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                  background: "#fff",
                }}
                onFocus={(e) => (e.target.style.borderColor = "hsl(330, 60%, 65%)")}
                onBlur={(e) => (e.target.style.borderColor = "hsl(280, 20%, 86%)")}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "hsl(260, 15%, 55%)",
                  padding: "4px",
                }}
                title={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPass ? (
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>


          {/* Nota: El Marco Legal está disponible dentro del sistema una vez iniciada la sesión */}

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px" }}>
            <button
              id="login-submit"
              onClick={handleLogin}
              disabled={loading}
              style={{
                background: loading
                  ? "hsl(330, 30%, 72%)"
                  : "linear-gradient(135deg, hsl(330, 70%, 48%), hsl(280, 60%, 50%))",
                color: "#fff",
                border: "none",
                padding: "14px",
                borderRadius: "12px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "15px",
                boxShadow: "0 4px 12px rgba(190, 24, 93, 0.18)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Verificando...
                </>
              ) : (
                "🔐 Iniciar Sesión"
              )}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "2px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "hsl(280,20%,88%)" }} />
              <span style={{ fontSize: "11px", color: "hsl(260,15%,60%)", whiteSpace: "nowrap" }}>¿No tienes cuenta?</span>
              <div style={{ flex: 1, height: "1px", background: "hsl(280,20%,88%)" }} />
            </div>

            {/* Register Button */}
            <button
              id="login-register"
              type="button"
              onClick={() => navigate("/register")}
              disabled={loading}
              style={{
                background: "none",
                border: "1.5px solid hsl(280, 30%, 82%)",
                color: "hsl(280, 50%, 45%)",
                padding: "12px",
                borderRadius: "12px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "hsl(280,60%,97%)";
                e.currentTarget.style.borderColor = "hsl(280,55%,65%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.borderColor = "hsl(280,30%,82%)";
              }}
            >
              👤 Registrar Nuevo Usuario
            </button>
          </div>

          {/* Version badge */}
          <p style={{ textAlign: "center", fontSize: "11px", color: "hsl(260, 12%, 62%)", marginTop: "4px" }}>
            Sistema de Gestión Escolar v2.0 · Sesión segura con JWT
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;