import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { register } from "./services/authApi";
import "./styles.css";

const ROLES = [
  { value: "docente",    label: "Docente / Maestro/a",   icon: "🎓", desc: "Acceso a notas, asistencia y sus cursos" },
  { value: "secretaria", label: "Secretaria",             icon: "📋", desc: "Gestión administrativa y reportes"        },
  { value: "admin",      label: "Administrador/a",        icon: "🛡️", desc: "Acceso completo al sistema"              },
];

const inputStyle = {
  padding: "12px 16px",
  borderRadius: "11px",
  border: "1.5px solid hsl(280, 20%, 86%)",
  outline: "none",
  fontSize: "14px",
  background: "#fff",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  fontFamily: "inherit",
};

const labelStyle = {
  fontSize: "11.5px",
  fontWeight: "700",
  color: "hsl(260,25%,38%)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "5px",
  display: "block",
};

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState("docente");

  const [form, setForm] = useState({
    nombre_completo: "",
    usuario: "",
    correo: "",
    cargo: "",
    password: "",
    confirmPassword: "",
    codigoAdmin: "",
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const focus = (e) => (e.target.style.borderColor = "hsl(330, 60%, 65%)");
  const blur  = (e) => (e.target.style.borderColor = "hsl(280, 20%, 86%)");

  const handleSubmit = async () => {
    if (!form.nombre_completo.trim() || !form.usuario.trim() || !form.password) {
      return Swal.fire({ title: "Campos incompletos", text: "Nombre, usuario y contraseña son obligatorios.", icon: "warning", confirmButtonColor: "hsl(330,65%,45%)" });
    }
    if (form.password.length < 6) {
      return Swal.fire({ title: "Contraseña corta", text: "La contraseña debe tener al menos 6 caracteres.", icon: "warning", confirmButtonColor: "hsl(330,65%,45%)" });
    }
    if (form.password !== form.confirmPassword) {
      return Swal.fire({ title: "Contraseñas no coinciden", text: "La contraseña y su confirmación deben ser iguales.", icon: "warning", confirmButtonColor: "hsl(330,65%,45%)" });
    }
    if (rolSeleccionado === "admin" && !form.codigoAdmin.trim()) {
      return Swal.fire({ title: "Código requerido", text: "El rol Administrador requiere un código de autorización.", icon: "warning", confirmButtonColor: "hsl(330,65%,45%)" });
    }

    setLoading(true);
    try {
      const result = await register({
        usuario: form.usuario.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        nombre_completo: form.nombre_completo.trim(),
        rol: rolSeleccionado,
        cargo: form.cargo.trim() || undefined,
        correo: form.correo.trim() || undefined,
        codigoAdmin: form.codigoAdmin.trim() || undefined,
      });

      if (result.success) {
        await Swal.fire({
          title: "¡Cuenta creada!",
          html: `El usuario <b>${form.usuario}</b> fue registrado correctamente.<br/>Ya puede iniciar sesión.`,
          icon: "success",
          confirmButtonColor: "hsl(330,65%,45%)",
        });
        navigate("/");
      } else {
        Swal.fire({ title: "Error al registrar", text: result.message || "No se pudo crear la cuenta.", icon: "error", confirmButtonColor: "hsl(330,65%,45%)" });
      }
    } catch {
      Swal.fire({ title: "Error de conexión", text: "No se pudo conectar con el servidor.", icon: "error", confirmButtonColor: "hsl(330,65%,45%)" });
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Panel izquierdo decorativo */}
      <div className="login-banner" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px", background: "linear-gradient(145deg, hsl(330,70%,30%), hsl(280,60%,28%))", color: "#fff" }}>
        <div style={{ fontSize: "56px", marginBottom: "20px" }}>🏫</div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: "800", marginBottom: "10px", textAlign: "center" }}>
          Sistema de Gestión Escolar
        </h2>
        <p style={{ fontSize: "13px", opacity: 0.8, textAlign: "center", lineHeight: "1.6", maxWidth: "240px" }}>
          Crea tu cuenta de acceso según tu rol en la institución educativa.
        </p>
        <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          {ROLES.map((r) => (
            <div key={r.value} style={{ background: "rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 16px", fontSize: "13px" }}>
              <span style={{ marginRight: "8px" }}>{r.icon}</span>
              <b>{r.label}</b>
              <p style={{ margin: "4px 0 0", fontSize: "11px", opacity: 0.7 }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario */}
      <div className="login-box" style={{ background: "rgba(255,255,255,0.98)", overflowY: "auto", maxHeight: "100vh", padding: "36px 40px" }}>
        {/* Header */}
        <div className="login-header" style={{ marginBottom: "20px" }}>
          <div className="login-logo" style={{ background: "linear-gradient(135deg,hsl(330,70%,92%),hsl(280,60%,92%))", color: "hsl(330,65%,45%)" }}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill="currentColor"/><path d="M17 14.18V19C17 20.1 14.76 21 12 21C9.24 21 7 20.1 7 19V14.18L12 16.9L17 14.18Z" fill="currentColor"/></svg>
          </div>
          <div>
            <h1 className="login-title" style={{ fontFamily: "var(--font-heading)", color: "hsl(260,30%,18%)", fontWeight: "800", fontSize: "22px" }}>
              Registrar Nuevo Usuario
            </h1>
            <p style={{ color: "hsl(260,20%,48%)", fontSize: "13px", marginTop: "3px" }}>
              Completa todos los datos para crear tu acceso
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Selección de Rol */}
          <div>
            <label style={labelStyle}>Tipo de cuenta / Rol *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRolSeleccionado(r.value)}
                  style={{
                    padding: "10px 8px",
                    borderRadius: "10px",
                    border: rolSeleccionado === r.value ? "2px solid hsl(330,65%,45%)" : "1.5px solid hsl(280,20%,86%)",
                    background: rolSeleccionado === r.value ? "hsl(330,70%,97%)" : "#fff",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: rolSeleccionado === r.value ? "700" : "500",
                    color: rolSeleccionado === r.value ? "hsl(330,65%,40%)" : "hsl(260,20%,40%)",
                    transition: "all 0.2s",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "20px", marginBottom: "3px" }}>{r.icon}</div>
                  <div style={{ lineHeight: "1.2" }}>{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Nombre completo */}
          <div>
            <label style={labelStyle}>Nombre Completo *</label>
            <input id="reg-nombre" type="text" placeholder="Ej: Ana María García" value={form.nombre_completo}
              onChange={set("nombre_completo")} onFocus={focus} onBlur={blur} style={inputStyle} />
          </div>

          {/* Usuario + Correo en fila */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Nombre de Usuario *</label>
              <input id="reg-usuario" type="text" placeholder="Ej: ana.garcia" value={form.usuario}
                onChange={set("usuario")} onFocus={focus} onBlur={blur} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Correo Electrónico</label>
              <input id="reg-correo" type="email" placeholder="correo@escuela.edu" value={form.correo}
                onChange={set("correo")} onFocus={focus} onBlur={blur} style={inputStyle} />
            </div>
          </div>

          {/* Cargo personalizado */}
          <div>
            <label style={labelStyle}>Cargo / Título (opcional)</label>
            <input id="reg-cargo" type="text" placeholder={`Ej: ${ROLES.find(r=>r.value===rolSeleccionado)?.label}`}
              value={form.cargo} onChange={set("cargo")} onFocus={focus} onBlur={blur} style={inputStyle} />
          </div>

          {/* Contraseña */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Contraseña * (mín. 6 caracteres)</label>
              <div style={{ position: "relative" }}>
                <input id="reg-password" type={showPass ? "text" : "password"} placeholder="Contraseña segura"
                  value={form.password} onChange={set("password")} onFocus={focus} onBlur={blur}
                  style={{ ...inputStyle, paddingRight: "42px" }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "hsl(260,15%,55%)", padding: "4px" }}>
                  {showPass
                    ? <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" width="17" height="17" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Confirmar Contraseña *</label>
              <input id="reg-confirm" type={showPass ? "text" : "password"} placeholder="Repite la contraseña"
                value={form.confirmPassword} onChange={set("confirmPassword")} onFocus={focus} onBlur={blur}
                style={{ ...inputStyle, borderColor: form.confirmPassword && form.password !== form.confirmPassword ? "hsl(0,70%,60%)" : undefined }} />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p style={{ fontSize: "11px", color: "hsl(0,70%,55%)", marginTop: "4px" }}>⚠ Las contraseñas no coinciden</p>
              )}
            </div>
          </div>

          {/* Código admin solo si rol = admin */}
          {rolSeleccionado === "admin" && (
            <div style={{ background: "hsl(330,70%,97%)", border: "1.5px solid hsl(330,60%,88%)", borderRadius: "11px", padding: "14px" }}>
              <label style={{ ...labelStyle, color: "hsl(330,60%,40%)" }}>🛡️ Código de Autorización de Administrador *</label>
              <input id="reg-codigo-admin" type="password" placeholder="Código proporcionado por el administrador principal"
                value={form.codigoAdmin} onChange={set("codigoAdmin")} onFocus={focus} onBlur={blur} style={inputStyle} />
              <p style={{ fontSize: "11px", color: "hsl(330,50%,50%)", marginTop: "6px" }}>
                Solo el administrador principal puede otorgar este código. Por defecto: <b>SGE2026</b>
              </p>
            </div>
          )}

          {/* Botones */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
            <button id="reg-submit" onClick={handleSubmit} disabled={loading}
              style={{
                background: loading ? "hsl(330,30%,72%)" : "linear-gradient(135deg,hsl(330,70%,48%),hsl(280,60%,50%))",
                color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer", fontSize: "15px",
                boxShadow: "0 4px 14px rgba(190,24,93,0.18)", transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}>
              {loading
                ? <><span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Registrando...</>
                : "✅ Crear Cuenta"}
            </button>

            <button type="button" onClick={() => navigate("/")}
              style={{ background: "none", border: "1.5px solid hsl(280,20%,86%)", color: "hsl(260,25%,45%)", padding: "12px", borderRadius: "12px", fontWeight: "600", cursor: "pointer", fontSize: "14px", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "hsl(330,60%,65%)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "hsl(280,20%,86%)"}>
              ← Volver al inicio de sesión
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: "11px", color: "hsl(260,12%,62%)", marginTop: "2px" }}>
            Sistema de Gestión Escolar v2.0 · Registro seguro
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
