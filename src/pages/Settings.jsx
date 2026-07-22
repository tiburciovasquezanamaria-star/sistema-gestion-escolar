import { useState, useEffect } from "react";
import Layout from "../Layout";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getSettings, updateSettings, changePassword } from "../services/authApi";
import { getUser } from "../services/authApi";

const ANIOS = ["2023-2024", "2024-2025", "2025-2026", "2026-2027"];

function Settings() {
  const navigate = useNavigate();
  const currentUser = getUser();

  const [tab, setTab] = useState("centro");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Centro data
  const [centro, setCentro] = useState({
    nombre_centro: "",
    direccion: "",
    telefono: "",
    codigo_minerd: "",
    anio_escolar: "2025-2026",
    nombre_director: "",
    cargo_director: "Directora",
    lema: "",
  });

  // Password change
  const [passData, setPassData] = useState({ passwordActual: "", passwordNuevo: "", passwordConfirm: "" });
  const [showPass, setShowPass] = useState({ actual: false, nuevo: false, confirm: false });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await getSettings();
      if (res.success && res.settings) {
        setCentro(res.settings);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSaveCentro = async () => {
    if (!centro.nombre_centro.trim()) {
      return Swal.fire("Campo requerido", "El nombre del centro educativo es obligatorio.", "warning");
    }
    if (!centro.anio_escolar) {
      return Swal.fire("Campo requerido", "Seleccione el año escolar activo.", "warning");
    }
    // Phone format validation (optional but if filled, validate)
    if (centro.telefono && !/^\d{3}-\d{3}-\d{4}$/.test(centro.telefono)) {
      return Swal.fire("Formato incorrecto", "El teléfono debe tener el formato: 809-555-1234", "warning");
    }

    setSaving(true);
    try {
      const res = await updateSettings(centro);
      if (res.success) {
        Swal.fire({ title: "¡Guardado!", text: "La configuración del centro fue actualizada.", icon: "success", timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire("Error", res.message, "error");
      }
    } catch (e) {
      Swal.fire("Error", "No se pudo guardar la configuración.", "error");
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!passData.passwordActual || !passData.passwordNuevo || !passData.passwordConfirm) {
      return Swal.fire("Campos incompletos", "Complete todos los campos de contraseña.", "warning");
    }
    if (passData.passwordNuevo.length < 6) {
      return Swal.fire("Contraseña débil", "La nueva contraseña debe tener al menos 6 caracteres.", "warning");
    }
    if (passData.passwordNuevo !== passData.passwordConfirm) {
      return Swal.fire("No coinciden", "La confirmación de contraseña no coincide con la nueva contraseña.", "error");
    }
    // Strength check: at least one uppercase
    if (!/[A-Z]/.test(passData.passwordNuevo)) {
      return Swal.fire("Contraseña débil", "La contraseña debe contener al menos una letra mayúscula.", "warning");
    }

    setSaving(true);
    try {
      const res = await changePassword(passData.passwordActual, passData.passwordNuevo);
      if (res.success) {
        Swal.fire({ title: "¡Contraseña actualizada!", text: "Su contraseña fue cambiada correctamente. Por seguridad, inicie sesión nuevamente.", icon: "success" })
          .then(() => {
            sessionStorage.clear();
            navigate("/");
          });
      } else {
        Swal.fire("Error", res.message, "error");
      }
    } catch (e) {
      Swal.fire("Error", "No se pudo cambiar la contraseña.", "error");
    }
    setSaving(false);
  };

  const tabs = [
    { key: "centro", label: "🏫 Centro Educativo" },
    { key: "seguridad", label: "🔐 Seguridad" },
    { key: "perfil", label: "👤 Perfil del Sistema" },
  ];

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1.5px solid hsl(280, 20%, 87%)",
    outline: "none",
    fontSize: "14px",
    background: "#fff",
    boxSizing: "border-box",
    fontFamily: "inherit",
    color: "hsl(260,28%,15%)",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontSize: "11px",
    fontWeight: "700",
    color: "hsl(260,25%,40%)",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: "5px",
    display: "block",
  };

  const fieldStyle = { display: "flex", flexDirection: "column", gap: "5px" };

  return (
    <Layout>
      <div className="mod-shell">
        {/* Hero */}
        <section className="mod-hero mod-hero--mauve">
          <div className="mod-hero__bg" style={{ backgroundImage: "url('/hero_reports.png')" }} />
          <div className="mod-hero__overlay" />
          <div className="mod-hero__content">
            <span className="mod-eyebrow">⚙️ Configuración</span>
            <h1>Configuración del Sistema</h1>
            <p>Administra los datos institucionales del centro, seguridad de acceso y parámetros del sistema escolar.</p>
          </div>
          <div className="mod-hero__actions">
            <button className="mod-btn mod-btn--ghost" onClick={() => navigate("/dashboard")}>← Inicio</button>
          </div>
        </section>

        {/* Tabs */}
        <div className="rp-tabs">
          {tabs.map((t) => (
            <button key={t.key} className={`rp-tab-btn ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Centro Educativo ── */}
        {tab === "centro" && (
          <div className="rp-chart-card">
            <div style={{ borderBottom: "1px solid hsl(280,20%,91%)", paddingBottom: "16px", marginBottom: "24px" }}>
              <h3 style={{ margin: 0 }}>Datos del Centro Educativo</h3>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "hsl(260,15%,55%)" }}>
                Esta información aparece en los reportes y documentos generados por el sistema.
              </p>
            </div>

            {loading ? (
              <p style={{ textAlign: "center", color: "hsl(260,15%,55%)" }}>Cargando configuración...</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Nombre del Centro *</label>
                  <input
                    style={inputStyle}
                    placeholder="Ej. Escuela Primaria San José"
                    value={centro.nombre_centro}
                    onChange={(e) => setCentro({ ...centro, nombre_centro: e.target.value })}
                    onFocus={(e) => (e.target.style.borderColor = "hsl(280,60%,65%)")}
                    onBlur={(e) => (e.target.style.borderColor = "hsl(280, 20%, 87%)")}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Código MINERD</label>
                  <input
                    style={inputStyle}
                    placeholder="Ej. 10-01-0001"
                    value={centro.codigo_minerd}
                    onChange={(e) => setCentro({ ...centro, codigo_minerd: e.target.value })}
                    onFocus={(e) => (e.target.style.borderColor = "hsl(280,60%,65%)")}
                    onBlur={(e) => (e.target.style.borderColor = "hsl(280, 20%, 87%)")}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Año Escolar Activo *</label>
                  <select
                    style={inputStyle}
                    value={centro.anio_escolar}
                    onChange={(e) => setCentro({ ...centro, anio_escolar: e.target.value })}
                  >
                    {ANIOS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Teléfono del Centro</label>
                  <input
                    style={inputStyle}
                    placeholder="809-555-1234"
                    value={centro.telefono}
                    onChange={(e) => setCentro({ ...centro, telefono: e.target.value })}
                    onFocus={(e) => (e.target.style.borderColor = "hsl(280,60%,65%)")}
                    onBlur={(e) => (e.target.style.borderColor = "hsl(280, 20%, 87%)")}
                  />
                </div>

                <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Dirección del Centro</label>
                  <input
                    style={inputStyle}
                    placeholder="Calle, Sector, Municipio, Provincia"
                    value={centro.direccion}
                    onChange={(e) => setCentro({ ...centro, direccion: e.target.value })}
                    onFocus={(e) => (e.target.style.borderColor = "hsl(280,60%,65%)")}
                    onBlur={(e) => (e.target.style.borderColor = "hsl(280, 20%, 87%)")}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Nombre del Director/a</label>
                  <input
                    style={inputStyle}
                    placeholder="Ej. Dra. Ana María Vásquez"
                    value={centro.nombre_director}
                    onChange={(e) => setCentro({ ...centro, nombre_director: e.target.value })}
                    onFocus={(e) => (e.target.style.borderColor = "hsl(280,60%,65%)")}
                    onBlur={(e) => (e.target.style.borderColor = "hsl(280, 20%, 87%)")}
                  />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Cargo del Director/a</label>
                  <input
                    style={inputStyle}
                    placeholder="Ej. Directora Académica"
                    value={centro.cargo_director}
                    onChange={(e) => setCentro({ ...centro, cargo_director: e.target.value })}
                    onFocus={(e) => (e.target.style.borderColor = "hsl(280,60%,65%)")}
                    onBlur={(e) => (e.target.style.borderColor = "hsl(280, 20%, 87%)")}
                  />
                </div>

                <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Lema Institucional</label>
                  <input
                    style={inputStyle}
                    placeholder="Ej. Educando con excelencia y vocación"
                    value={centro.lema}
                    onChange={(e) => setCentro({ ...centro, lema: e.target.value })}
                    onFocus={(e) => (e.target.style.borderColor = "hsl(280,60%,65%)")}
                    onBlur={(e) => (e.target.style.borderColor = "hsl(280, 20%, 87%)")}
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: "28px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleSaveCentro}
                disabled={saving}
                style={{
                  background: saving ? "hsl(280,20%,75%)" : "linear-gradient(135deg, hsl(280,65%,52%), hsl(330,65%,48%))",
                  color: "#fff",
                  border: "none",
                  padding: "12px 28px",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(124,58,237,0.2)",
                  transition: "all 0.2s",
                }}
              >
                {saving ? "Guardando..." : "💾 Guardar Configuración"}
              </button>
            </div>
          </div>
        )}

        {/* ── Tab: Seguridad ── */}
        {tab === "seguridad" && (
          <div className="rp-chart-card">
            <div style={{ borderBottom: "1px solid hsl(280,20%,91%)", paddingBottom: "16px", marginBottom: "24px" }}>
              <h3 style={{ margin: 0 }}>Cambio de Contraseña</h3>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "hsl(260,15%,55%)" }}>
                Use una contraseña fuerte con mayúsculas, números y símbolos. Mínimo 6 caracteres.
              </p>
            </div>

            <div style={{ maxWidth: "480px", display: "flex", flexDirection: "column", gap: "18px" }}>
              {[
                { key: "passwordActual", label: "Contraseña Actual", showKey: "actual" },
                { key: "passwordNuevo", label: "Nueva Contraseña", showKey: "nuevo" },
                { key: "passwordConfirm", label: "Confirmar Nueva Contraseña", showKey: "confirm" },
              ].map((field) => (
                <div key={field.key} style={fieldStyle}>
                  <label style={labelStyle}>{field.label}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPass[field.showKey] ? "text" : "password"}
                      placeholder={`Ingrese ${field.label.toLowerCase()}`}
                      value={passData[field.key]}
                      onChange={(e) => setPassData({ ...passData, [field.key]: e.target.value })}
                      style={{ ...inputStyle, paddingRight: "44px" }}
                      onFocus={(e) => (e.target.style.borderColor = "hsl(330,60%,65%)")}
                      onBlur={(e) => (e.target.style.borderColor = "hsl(280, 20%, 87%)")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => ({ ...p, [field.showKey]: !p[field.showKey] }))}
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "hsl(260,15%,55%)", padding: "4px" }}
                    >
                      {showPass[field.showKey] ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              ))}

              {/* Strength hint */}
              {passData.passwordNuevo && (
                <div style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: passData.passwordNuevo.length >= 8 && /[A-Z]/.test(passData.passwordNuevo) && /[0-9]/.test(passData.passwordNuevo)
                    ? "hsl(165,65%,95%)" : "hsl(38,80%,95%)",
                  border: `1px solid ${passData.passwordNuevo.length >= 8 && /[A-Z]/.test(passData.passwordNuevo) && /[0-9]/.test(passData.passwordNuevo) ? "hsl(165,65%,85%)" : "hsl(38,80%,85%)"}`,
                  fontSize: "12px",
                  color: passData.passwordNuevo.length >= 8 && /[A-Z]/.test(passData.passwordNuevo) && /[0-9]/.test(passData.passwordNuevo) ? "hsl(165,60%,30%)" : "hsl(38,70%,35%)",
                }}>
                  {passData.passwordNuevo.length < 6 ? "⚠️ Mínimo 6 caracteres" :
                    !(/[A-Z]/.test(passData.passwordNuevo)) ? "⚠️ Incluye al menos una letra mayúscula" :
                    !(/[0-9]/.test(passData.passwordNuevo)) ? "💡 Agrega un número para mayor seguridad" :
                    "✅ Contraseña fuerte"}
                </div>
              )}

              <button
                onClick={handleChangePassword}
                disabled={saving}
                style={{
                  background: saving ? "hsl(330,20%,75%)" : "linear-gradient(135deg, hsl(330,70%,48%), hsl(280,60%,50%))",
                  color: "#fff",
                  border: "none",
                  padding: "13px 28px",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(190,24,93,0.18)",
                  marginTop: "4px",
                }}
              >
                {saving ? "Actualizando..." : "🔐 Actualizar Contraseña"}
              </button>
            </div>
          </div>
        )}

        {/* ── Tab: Perfil del Sistema ── */}
        {tab === "perfil" && (
          <div className="rp-chart-card">
            <div style={{ borderBottom: "1px solid hsl(280,20%,91%)", paddingBottom: "16px", marginBottom: "24px" }}>
              <h3 style={{ margin: 0 }}>Perfil del Administrador</h3>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "hsl(260,15%,55%)" }}>
                Información del usuario con sesión activa en el sistema.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "500px" }}>
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{
                  width: "70px", height: "70px", borderRadius: "50%",
                  background: "linear-gradient(135deg, hsl(330,70%,88%), hsl(280,60%,88%))",
                  color: "hsl(330,65%,42%)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "28px", fontWeight: "800",
                  flexShrink: 0,
                }}>
                  {currentUser?.nombre ? currentUser.nombre.charAt(0).toUpperCase() : "A"}
                </div>
                <div>
                  <h4 style={{ margin: 0, color: "hsl(260,30%,18%)", fontSize: "18px" }}>{currentUser?.nombre || "Administrador"}</h4>
                  <span style={{ fontSize: "12px", color: "hsl(260,15%,55%)" }}>{currentUser?.cargo || "Administrador del Sistema"}</span><br />
                  <span style={{
                    display: "inline-block", marginTop: "4px", padding: "3px 10px",
                    background: "hsl(280,55%,92%)", color: "hsl(280,55%,40%)",
                    borderRadius: "999px", fontSize: "11px", fontWeight: "700"
                  }}>
                    {currentUser?.rol?.toUpperCase() || "ADMIN"}
                  </span>
                </div>
              </div>

              {/* Info rows */}
              {[
                { label: "Usuario de acceso", value: currentUser?.usuario || "—" },
                { label: "Rol en el sistema", value: currentUser?.rol || "admin" },
                { label: "Cargo", value: currentUser?.cargo || "Administradora" },
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid hsl(280,20%,95%)" }}>
                  <span style={{ fontSize: "13px", color: "hsl(260,15%,50%)", fontWeight: "500" }}>{r.label}</span>
                  <strong style={{ fontSize: "13px", color: "hsl(260,30%,18%)" }}>{r.value}</strong>
                </div>
              ))}

              <div style={{ padding: "14px", borderRadius: "12px", background: "hsl(165,60%,96%)", border: "1px solid hsl(165,55%,88%)" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "hsl(165,60%,28%)", fontWeight: "600" }}>
                  🔒 Sesión cifrada con JWT. La sesión expira automáticamente en 8 horas de inactividad.
                </p>
              </div>

              <button
                onClick={() => {
                  Swal.fire({ title: "¿Cerrar sesión?", text: "Se cerrará la sesión actual del sistema.", icon: "question", showCancelButton: true, confirmButtonColor: "hsl(0,60%,48%)", cancelButtonText: "Cancelar", confirmButtonText: "Sí, cerrar sesión" })
                    .then((r) => { if (r.isConfirmed) { sessionStorage.clear(); navigate("/"); } });
                }}
                style={{
                  background: "hsl(0,65%,95%)", color: "hsl(0,65%,42%)",
                  border: "1px solid hsl(0,65%,85%)", padding: "12px 20px",
                  borderRadius: "12px", fontWeight: "700", fontSize: "13px",
                  cursor: "pointer", alignSelf: "flex-start",
                }}
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default Settings;
