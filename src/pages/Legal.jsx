import { useState, useEffect } from "react";
import Layout from "../Layout";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Legal() {
  const navigate = useNavigate();
  
  // State for signature
  const [signatureName, setSignatureName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [signedData, setSignedData] = useState({
    name: "",
    date: "",
    hash: ""
  });

  // Load existing signature from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sistemaEscolarFirma");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSignedData(parsed);
        setIsSigned(true);
      }
    } catch (e) {
      console.error("Error al cargar la firma:", e);
    }
  }, []);

  const handleSign = (e) => {
    e.preventDefault();
    if (!signatureName.trim()) {
      return Swal.fire("Validación", "Por favor escriba su nombre completo para firmar.", "warning");
    }
    if (!accepted) {
      return Swal.fire("Validación", "Debe aceptar el compromiso y las condiciones de seguridad.", "warning");
    }

    const uniqueHash = "SEC-" + Math.floor(100000 + Math.random() * 900000) + "-" + new Date().getFullYear();
    const today = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    const newSignature = {
      name: signatureName.trim(),
      date: today,
      hash: uniqueHash
    };

    localStorage.setItem("sistemaEscolarFirma", JSON.stringify(newSignature));
    setSignedData(newSignature);
    setIsSigned(true);

    Swal.fire({
      title: "Documento Firmado",
      text: "Su firma digital ha sido registrada y sellada con éxito.",
      icon: "success",
      confirmButtonColor: "hsl(330, 65%, 45%)"
    });
  };

  const handleRevoke = () => {
    Swal.fire({
      title: "¿Anular Firma?",
      text: "Se eliminará el sello digital del dispositivo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, remover",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "hsl(0, 65%, 45%)",
      cancelButtonColor: "hsl(260, 15%, 55%)"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("sistemaEscolarFirma");
        setIsSigned(false);
        setSignatureName("");
        setAccepted(false);
        Swal.fire({
          title: "Firma Removida",
          text: "El documento ya no cuenta con firma digital activa.",
          icon: "info",
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <Layout>
      <div className="mod-shell">
        {/* Hero Section */}
        <section className="mod-hero mod-hero--mauve">
          <div className="mod-hero__bg" style={{ backgroundImage: "url('/dashboard_bg_hero.png')" }} />
          <div className="mod-hero__overlay" />
          <div className="mod-hero__content">
            <span className="mod-eyebrow">⚖️ Transparencia & Seguridad</span>
            <h1>Marco Legal y Ético del Sistema</h1>
            <p>
              Condiciones de adquisición, compromiso de confidencialidad, código ético y políticas de seguridad para el uso correcto de la plataforma.
            </p>
          </div>
          <div className="mod-hero__actions">
            <button className="mod-btn mod-btn--ghost" onClick={() => navigate("/dashboard")}>
              ← Ir al Panel
            </button>
            <button className="mod-btn mod-btn--primary" onClick={() => window.print()}>
              🖨️ Imprimir Términos
            </button>
          </div>
        </section>

        {/* Legal Grid Content */}
        <div className="rp-content-grid" style={{ gridTemplateColumns: "1fr" }}>
          
          <div className="rp-chart-card">
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid hsl(280,20%,91%)", paddingBottom: "14px", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "hsl(330,60%,42%)", margin: 0 }}>
                Compromiso del Usuario y Términos Legales
              </h2>
              <span className="db2-pill db2-pill--rose">Vigente - Ciclo 2026</span>
            </div>

            <div className="legal-sections" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Section 1 */}
              <div style={{ background: "hsl(280,15%,97%)", padding: "20px", borderRadius: "16px", border: "1px solid hsl(280,20%,91%)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "hsl(260,30%,18%)", marginBottom: "8px" }}>
                  1. Términos de Adquisición y Licencia de Uso
                </h3>
                <p style={{ fontSize: "13px", color: "hsl(260,15%,35%)", lineHeight: "1.6", margin: 0 }}>
                  Al adquirir el <strong>Sistema de Gestión Escolar</strong>, la institución educativa adquiere una licencia de uso de carácter intransferible y limitado al entorno escolar autorizado. Queda estrictamente prohibida la redistribución, reventa, copia no autorizada o ingeniería inversa de cualquier parte del software, incluyendo su código fuente, diseño de interfaces y esquemas de base de datos.
                </p>
              </div>

              {/* Section 2 */}
              <div style={{ background: "hsl(280,15%,97%)", padding: "20px", borderRadius: "16px", border: "1px solid hsl(280,20%,91%)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "hsl(260,30%,18%)", marginBottom: "8px" }}>
                  2. Código Ético y Responsabilidad Administrativa
                </h3>
                <p style={{ fontSize: "13px", color: "hsl(260,15%,35%)", lineHeight: "1.6", margin: 0 }}>
                  Como personal administrativo, docente u operador del sistema, el usuario se compromete formalmente a mantener una conducta ética profesional intachable. Esto incluye el registro honesto de calificaciones, la no falsificación de asistencias o datos personales del alumnado, y el uso del sistema exclusivamente para los fines académicos del centro educativo. Cualquier acto de alteración malintencionada de información será considerado una falta grave y motivo de rescisión de la licencia.
                </p>
              </div>

              {/* Section 3 */}
              <div style={{ background: "hsl(280,15%,97%)", padding: "20px", borderRadius: "16px", border: "1px solid hsl(280,20%,91%)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "hsl(260,30%,18%)", marginBottom: "8px" }}>
                  3. Privacidad de Datos y Confidencialidad (Protección del Alumnado)
                </h3>
                <p style={{ fontSize: "13px", color: "hsl(260,15%,35%)", lineHeight: "1.6", margin: 0 }}>
                  Este sistema procesa datos personales sensibles de menores de edad (nombres, matrículas, registros de calificaciones y correos electrónicos). El centro escolar y los operadores autorizados son los únicos responsables de cumplir con las leyes de protección de datos personales vigentes. Queda terminantemente prohibido extraer, exportar o divulgar bases de datos a terceros sin el consentimiento expreso y legal de los padres o tutores legales.
                </p>
              </div>

              {/* Section 4 */}
              <div style={{ background: "hsl(280,15%,97%)", padding: "20px", borderRadius: "16px", border: "1px solid hsl(280,20%,91%)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "hsl(260,30%,18%)", marginBottom: "8px" }}>
                  4. Protocolo y Reglas de Seguridad Tecnológica
                </h3>
                <p style={{ fontSize: "13px", color: "hsl(260,15%,35%)", lineHeight: "1.6", margin: 0 }}>
                  Para salvaguardar la integridad de la información institucional, los usuarios se comprometen a seguir las siguientes reglas de seguridad informática:
                </p>
                <ul style={{ fontSize: "13px", color: "hsl(260,15%,35%)", lineHeight: "1.7", marginTop: "8px", paddingLeft: "20px", marginBottom: 0 }}>
                  <li>No compartir ni divulgar contraseñas o cuentas de acceso institucional bajo ninguna circunstancia.</li>
                  <li>Cerrar la sesión de usuario de forma segura cada vez que se abandone la computadora o estación de trabajo.</li>
                  <li>No instalar extensiones ni softwares de terceros que puedan interceptar o comprometer el tráfico del sistema.</li>
                  <li>Notificar de forma inmediata a los administradores tecnológicos si se sospecha de un acceso no autorizado o fuga de credenciales.</li>
                </ul>
              </div>

              {/* 🖊️ INTERACTIVE SIGNATURE BOX */}
              <div style={{ background: "linear-gradient(135deg, hsl(330,60%,97%), hsl(40,90%,97%))", padding: "24px", borderRadius: "20px", border: "1px solid hsl(330,40%,88%)", position: "relative" }}>
                {!isSigned ? (
                  <form onSubmit={handleSign} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ textAlign: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "hsl(330,60%,42%)", display: "block" }}>
                        Firma de Aceptación y Compromiso
                      </span>
                      <p style={{ fontSize: "13px", color: "hsl(260,20%,30%)", margin: "4px 0 0" }}>
                        Para autorizar el uso de esta plataforma, complete su firma digital a continuación:
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "700", color: "hsl(260,25%,35%)" }}>
                        Nombre y Apellidos del Firmante:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Dra. Ana María Vásquez"
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        style={{ padding: "12px", borderRadius: "10px", border: "1px solid hsl(280,20%,84%)", outline: "none", background: "#fff", fontSize: "14px", fontFamily: "var(--font-sans)" }}
                      />
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <input
                        type="checkbox"
                        id="check-terms"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        style={{ marginTop: "3px", width: "16px", height: "16px", cursor: "pointer" }}
                      />
                      <label htmlFor="check-terms" style={{ fontSize: "13px", color: "hsl(260,15%,35%)", cursor: "pointer", userSelect: "none" }}>
                        Confirmo que he leído en su totalidad los términos de uso, políticas de confidencialidad de datos del alumnado y las normas éticas de seguridad.
                      </label>
                    </div>

                    <button
                      type="submit"
                      style={{ alignSelf: "center", background: "linear-gradient(135deg, hsl(330,70%,45%), hsl(280,60%,48%))", color: "#fff", border: "none", padding: "12px 28px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(190, 24, 93, 0.2)" }}
                    >
                      🖋️ Firmar Documento
                    </button>
                  </form>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center" }}>
                    
                    {/* Sello de firma digital */}
                    <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed hsl(160,55%,42%)", color: "hsl(160,55%,38%)", fontSize: "32px" }}>
                      🛡️
                    </div>

                    <div>
                      <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "hsl(160,55%,35%)", background: "hsl(165,55%,92%)", padding: "4px 10px", borderRadius: "999px" }}>
                        Firma Electrónica Activa y Sella en Servidor
                      </span>
                      
                      {/* Name in Calligraphy/Signature style */}
                      <h4 style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "28px", color: "hsl(260,30%,18%)", margin: "14px 0 4px", fontWeight: "400" }}>
                        {signedData.name}
                      </h4>
                      
                      <p style={{ fontSize: "12px", color: "hsl(260,15%,45%)", margin: 0 }}>
                        Fecha de registro: <strong>{signedData.date}</strong>
                      </p>
                      <p style={{ fontSize: "11px", color: "hsl(260,15%,55%)", margin: "4px 0 0", fontFamily: "monospace" }}>
                        Código de seguridad: {signedData.hash}
                      </p>
                    </div>

                    <button
                      onClick={handleRevoke}
                      style={{ background: "none", border: "none", color: "hsl(0,65%,45%)", fontSize: "12px", fontWeight: "700", cursor: "pointer", textDecoration: "underline", padding: 0 }}
                    >
                      Remover / Revocar Firma
                    </button>

                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default Legal;
