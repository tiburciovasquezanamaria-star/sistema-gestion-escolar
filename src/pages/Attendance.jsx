import { useState, useEffect } from "react";
import Layout from "../Layout";
import { getAttendance, saveAttendance } from "../services/attendanceApi";
import { getCourses, updateMaestro } from "../services/courseApi";
import { getStudents } from "../services/studentApi";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const CURSOS_GRADO = [
  { label: "Inicial",    value: "Inicial"   },
  { label: "1er Grado",  value: "1er Grado" },
  { label: "2do Grado",  value: "2do Grado" },
  { label: "3er Grado",  value: "3er Grado" },
  { label: "4to Grado",  value: "4to Grado" },
  { label: "5to Grado",  value: "5to Grado" },
  { label: "6to Grado",  value: "6to Grado" },
];

const NIVEL_KEY = {
  "Inicial":"Inicial","1er Grado":"1ro","2do Grado":"2do",
  "3er Grado":"3ro","4to Grado":"4to","5to Grado":"5to","6to Grado":"6to",
};

const SECCIONES = ["A","B"];

export default function Attendance() {
  const navigate = useNavigate();

  const [fecha,   setFecha  ] = useState(new Date().toISOString().split("T")[0]);
  const [curso,   setCurso  ] = useState("Inicial");
  const [seccion, setSeccion] = useState("A");

  // Maestro encargado
  const [maestroActual,  setMaestroActual ] = useState("");
  const [editandoMaestro,setEditandoMaestro] = useState(false);
  const [maestroInput,   setMaestroInput  ] = useState("");
  const [profesoresList, setProfesoresList] = useState([]);
  const [cursoIdAula,    setCursoIdAula   ] = useState(null);

  // Lista interna de estudiantes de la sección
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProf = async () => {
      try {
        const res = await getStudents();
        const profs = (res.students || []).filter(p => p.tipo === "Profesor" && !p.archivado);
        setProfesoresList(profs);
      } catch { setProfesoresList([]); }
    };
    fetchProf();
  }, []);

  // Inputs numéricos de asistencia
  const [asistenciaFem, setAsistenciaFem] = useState({ presente: 0, ausente: 0, tardanza: 0, excusa: 0 });
  const [asistenciaMasc, setAsistenciaMasc] = useState({ presente: 0, ausente: 0, tardanza: 0, excusa: 0 });

  // ── Cargar maestro encargado ──────────────────────────────────
  useEffect(() => {
    const loadMaestro = async () => {
      try {
        const res = await getCourses();
        const nivelKey = NIVEL_KEY[curso] || curso;
        const aulaStr  = `${nivelKey} ${seccion}`;
        const cursoDeAula = (res.courses || []).find(c => (c.aula||"").toLowerCase() === aulaStr.toLowerCase());
        if (cursoDeAula) {
          setMaestroActual(cursoDeAula.profesor || "");
          setCursoIdAula(cursoDeAula.id);
        } else {
          setMaestroActual(""); setCursoIdAula(null);
        }
      } catch { setMaestroActual(""); }
    };
    loadMaestro();
  }, [curso, seccion]);

  // ── Cargar estudiantes y sus estados de asistencia ─────────────
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAttendance(fecha, curso, seccion);
      const list = res.attendance || [];
      setStudentsList(list);

      // Filtrar estudiantes por sexo
      const femStudents  = list.filter(r => r.sexo === "Femenino");
      const mascStudents = list.filter(r => r.sexo === "Masculino");

      // Verificar si ya hay asistencia grabada en la base de datos
      const tieneGrabadaFem = femStudents.some(r => r.estado !== null);
      const tieneGrabadaMasc = mascStudents.some(r => r.estado !== null);

      if (tieneGrabadaFem) {
        setAsistenciaFem({
          presente: femStudents.filter(r => r.estado === "Presente").length,
          ausente: femStudents.filter(r => r.estado === "Ausente").length,
          tardanza: femStudents.filter(r => r.estado === "Tardanza").length,
          excusa: femStudents.filter(r => r.estado === "Excusa").length,
        });
      } else {
        // Por defecto, todos presentes si no hay registro previo
        setAsistenciaFem({ presente: femStudents.length, ausente: 0, tardanza: 0, excusa: 0 });
      }

      if (tieneGrabadaMasc) {
        setAsistenciaMasc({
          presente: mascStudents.filter(r => r.estado === "Presente").length,
          ausente: mascStudents.filter(r => r.estado === "Ausente").length,
          tardanza: mascStudents.filter(r => r.estado === "Tardanza").length,
          excusa: mascStudents.filter(r => r.estado === "Excusa").length,
        });
      } else {
        setAsistenciaMasc({ presente: mascStudents.length, ausente: 0, tardanza: 0, excusa: 0 });
      }

    } catch {
      Swal.fire("Error", "No se pudo cargar la asistencia.", "error");
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [fecha, curso, seccion]);

  // Totales de estudiantes en la sección
  const totalFem  = studentsList.filter(r => r.sexo === "Femenino").length;
  const totalMasc = studentsList.filter(r => r.sexo === "Masculino").length;
  const totalAula = totalFem + totalMasc;

  // ── Guardar asistencia consolidada ────────────────────────────────
  const handleSave = async () => {
    if (totalAula === 0) {
      return Swal.fire("Sin estudiantes", "No hay estudiantes en este curso y sección.", "warning");
    }

    // Validar que la suma de asistencia femenina coincida con el total de mujeres
    const sumaFem = Object.values(asistenciaFem).reduce((a,b) => a+b, 0);
    if (sumaFem !== totalFem) {
      return Swal.fire(
        "Falta completar Femenino",
        `La suma de la asistencia femenina (${sumaFem}) debe ser igual al total de alumnas (${totalFem}).`,
        "warning"
      );
    }

    // Validar que la suma de asistencia masculina coincida con el total de varones
    const sumaMasc = Object.values(asistenciaMasc).reduce((a,b) => a+b, 0);
    if (sumaMasc !== totalMasc) {
      return Swal.fire(
        "Falta completar Masculino",
        `La suma de la asistencia masculina (${sumaMasc}) debe ser igual al total de alumnos (${totalMasc}).`,
        "warning"
      );
    }

    // Distribuir los estados en la lista de estudiantes para guardarlos individualmente en la BD
    const femStudents  = studentsList.filter(r => r.sexo === "Femenino");
    const mascStudents = studentsList.filter(r => r.sexo === "Masculino");

    const distribuirEstados = (students, counts) => {
      const result = [];
      let idx = 0;
      // Asignar "Presente"
      for (let i = 0; i < counts.presente; i++) {
        if (students[idx]) result.push({ ...students[idx++], estado: "Presente" });
      }
      // Asignar "Ausente"
      for (let i = 0; i < counts.ausente; i++) {
        if (students[idx]) result.push({ ...students[idx++], estado: "Ausente" });
      }
      // Asignar "Tardanza"
      for (let i = 0; i < counts.tardanza; i++) {
        if (students[idx]) result.push({ ...students[idx++], estado: "Tardanza" });
      }
      // Asignar "Excusa"
      for (let i = 0; i < counts.excusa; i++) {
        if (students[idx]) result.push({ ...students[idx++], estado: "Excusa" });
      }
      return result;
    };

    const finalFem  = distribuirEstados(femStudents, asistenciaFem);
    const finalMasc = distribuirEstados(mascStudents, asistenciaMasc);
    const allRecords = [...finalFem, ...finalMasc];

    const payload = allRecords.map(r => ({
      estudiante_id: r.estudiante_id,
      fecha,
      estado: r.estado,
      curso,
      seccion,
      maestro_id: null,
    }));

    try {
      await saveAttendance(payload);
      Swal.fire({ title: "¡Guardado!", text: "Asistencia registrada con éxito.", icon: "success", timer: 1500, showConfirmButton: false });
      loadData();
    } catch {
      Swal.fire("Error", "No se pudo guardar la asistencia.", "error");
    }
  };

  // ── Guardar maestro encargado ───────────────────────────────────
  const handleSaveMaestro = async () => {
    if (!maestroInput.trim()) return;
    if (!cursoIdAula) return Swal.fire("Sin curso", "No se encontró el curso de esta sección.", "warning");
    try {
      const nivelKey = NIVEL_KEY[curso] || curso;
      const aulaStr  = `${nivelKey} ${seccion}`;
      const res = await getCourses();
      const cursosDeSec = (res.courses||[]).filter(c => (c.aula||"").toLowerCase() === aulaStr.toLowerCase());
      await Promise.all(cursosDeSec.map(c => updateMaestro(c.id, maestroInput.trim())));
      setMaestroActual(maestroInput.trim());
      setEditandoMaestro(false);
      Swal.fire({ title: "Maestro actualizado", icon: "success", timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire("Error", "No se pudo actualizar el maestro.", "error");
    }
  };

  const lbl = { fontSize: "11px", fontWeight: "700", color: "hsl(260,25%,45%)", textTransform: "uppercase" };
  const sel = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid hsl(280,20%,85%)", outline: "none", fontSize: "13px", marginTop: "4px", fontFamily: "inherit" };
  
  const inpNum = {
    width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid hsl(280,20%,85%)",
    outline: "none", fontSize: "14px", fontWeight: "700", textAlign: "center", marginTop: "4px"
  };

  return (
    <Layout>
      <div className="mod-shell">

        {/* ── Hero ──────────────────────── */}
        <section className="mod-hero mod-hero--teal">
          <div className="mod-hero__bg" style={{ backgroundImage: "url('/hero_reports.png')" }} />
          <div className="mod-hero__overlay" style={{ background: "linear-gradient(135deg,hsl(165,60%,20%,0.85),hsl(280,50%,25%,0.65),hsl(165,40%,18%,0.55))" }} />
          <div className="mod-hero__content">
            <span className="mod-eyebrow">📅 Control de Asistencia</span>
            <h1>Pase de Asistencia Diaria</h1>
            <p>Registro de asistencia consolidado por género (Femenino y Masculino) sin nombres de estudiantes.</p>
            <div className="mod-hero__stats">
              <div className="mod-hero-stat"><strong>{totalAula}</strong><span>Total Alumnos</span></div>
              <div className="mod-hero-stat"><strong>{totalFem}</strong><span>♀ Femenino</span></div>
              <div className="mod-hero-stat"><strong>{totalMasc}</strong><span>♂ Masculino</span></div>
              <div className="mod-hero-stat">
                <strong>
                  {totalAula ? Math.round(((asistenciaFem.presente + asistenciaMasc.presente) / totalAula) * 100) : 0}%
                </strong>
                <span>Presentes hoy</span>
              </div>
            </div>
          </div>
          <div className="mod-hero__actions">
            <button className="mod-btn mod-btn--ghost" onClick={() => navigate("/dashboard")}>← Inicio</button>
            <button className="mod-btn mod-btn--primary" onClick={handleSave}>💾 Guardar Asistencia</button>
          </div>
        </section>

        {/* ── Filtros ───────────────────── */}
        <div className="mod-toolbar" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "12px", marginBottom: "24px" }}>
          <div>
            <label style={lbl}>Fecha del día</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={sel} />
          </div>
          <div>
            <label style={lbl}>Curso / Grado</label>
            <select value={curso} onChange={e => setCurso(e.target.value)} style={sel}>
              {CURSOS_GRADO.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Sección</label>
            <select value={seccion} onChange={e => setSeccion(e.target.value)} style={sel}>
              {SECCIONES.map(s => <option key={s} value={s}>Sección {s}</option>)}
            </select>
          </div>
          {/* Docente Encargado */}
          <div>
            <label style={lbl}>Docente Encargado</label>
            {editandoMaestro ? (
              <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                <select
                  autoFocus
                  value={maestroInput}
                  onChange={e => setMaestroInput(e.target.value)}
                  style={{ ...sel, marginTop: 0, flex: 1, cursor: "pointer", background: "#fff" }}
                >
                  <option value="">— Seleccionar Docente —</option>
                  {profesoresList.length > 0 ? (
                    profesoresList.map(p => (
                      <option key={p.id} value={p.nombre}>{p.nombre}</option>
                    ))
                  ) : (
                    <>
                      <option value="Prof. Carlos Artemio Mendoza">Prof. Carlos Artemio Mendoza</option>
                      <option value="Prof. Rafael Almonte">Prof. Rafael Almonte</option>
                      <option value="Dra. María Fernández">Dra. María Fernández</option>
                    </>
                  )}
                </select>
                <button onClick={handleSaveMaestro} style={{ background: "hsl(145,55%,38%)", color: "#fff", border: "none", borderRadius: "8px", padding: "0 12px", fontWeight: "700", cursor: "pointer" }}>✓</button>
                <button onClick={() => setEditandoMaestro(false)} style={{ background: "hsl(280,15%,85%)", border: "none", borderRadius: "8px", padding: "0 10px", fontWeight: "700", cursor: "pointer" }}>✕</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", padding: "9px 12px", borderRadius: "8px", border: "1px solid hsl(280,20%,85%)", background: "#fff" }}>
                <span style={{ flex: 1, fontSize: "13px", color: maestroActual ? "hsl(260,30%,25%)" : "hsl(260,10%,60%)", fontStyle: maestroActual ? "normal" : "italic" }}>
                  {maestroActual || "Sin asignar"}
                </span>
                <button
                  onClick={() => { setMaestroInput(maestroActual); setEditandoMaestro(true); }}
                  title="Cambiar maestro encargado"
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}
                >✏️</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Formulario de Totales por Género (Sin Nombres) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "24px" }}>
          
          {/* Tarjeta Femenino */}
          <div className="rp-chart-card" style={{ borderTop: "4px solid hsl(330,65%,45%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "hsl(330,60%,42%)", margin: 0 }}>♀ Asistencia Femenina</h3>
              <span style={{ background: "hsl(330,65%,95%)", color: "hsl(330,65%,45%)", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
                Total Alumnas: {totalFem}
              </span>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={lbl}>✅ Presentes</label>
                <input
                  type="number" min="0" max={totalFem}
                  value={asistenciaFem.presente}
                  onChange={e => setAsistenciaFem({ ...asistenciaFem, presente: parseInt(e.target.value, 10) || 0 })}
                  style={inpNum}
                />
              </div>
              <div>
                <label style={lbl}>❌ Ausentes</label>
                <input
                  type="number" min="0" max={totalFem}
                  value={asistenciaFem.ausente}
                  onChange={e => setAsistenciaFem({ ...asistenciaFem, ausente: parseInt(e.target.value, 10) || 0 })}
                  style={inpNum}
                />
              </div>
              <div>
                <label style={lbl}>⏰ Tardanzas</label>
                <input
                  type="number" min="0" max={totalFem}
                  value={asistenciaFem.tardanza}
                  onChange={e => setAsistenciaFem({ ...asistenciaFem, tardanza: parseInt(e.target.value, 10) || 0 })}
                  style={inpNum}
                />
              </div>
              <div>
                <label style={lbl}>📋 Excusas</label>
                <input
                  type="number" min="0" max={totalFem}
                  value={asistenciaFem.excusa}
                  onChange={e => setAsistenciaFem({ ...asistenciaFem, excusa: parseInt(e.target.value, 10) || 0 })}
                  style={inpNum}
                />
              </div>
            </div>
            <div style={{ marginTop: "16px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "hsl(260,20%,50%)" }}>
              Suma Femenina: {Object.values(asistenciaFem).reduce((a,b) => a+b, 0)} / {totalFem}
            </div>
          </div>

          {/* Tarjeta Masculino */}
          <div className="rp-chart-card" style={{ borderTop: "4px solid hsl(210,70%,45%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "hsl(210,65%,40%)", margin: 0 }}>♂ Asistencia Masculina</h3>
              <span style={{ background: "hsl(210,65%,95%)", color: "hsl(210,65%,45%)", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>
                Total Alumnos: {totalMasc}
              </span>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={lbl}>✅ Presentes</label>
                <input
                  type="number" min="0" max={totalMasc}
                  value={asistenciaMasc.presente}
                  onChange={e => setAsistenciaMasc({ ...asistenciaMasc, presente: parseInt(e.target.value, 10) || 0 })}
                  style={inpNum}
                />
              </div>
              <div>
                <label style={lbl}>❌ Ausentes</label>
                <input
                  type="number" min="0" max={totalMasc}
                  value={asistenciaMasc.ausente}
                  onChange={e => setAsistenciaMasc({ ...asistenciaMasc, ausente: parseInt(e.target.value, 10) || 0 })}
                  style={inpNum}
                />
              </div>
              <div>
                <label style={lbl}>⏰ Tardanzas</label>
                <input
                  type="number" min="0" max={totalMasc}
                  value={asistenciaMasc.tardanza}
                  onChange={e => setAsistenciaMasc({ ...asistenciaMasc, tardanza: parseInt(e.target.value, 10) || 0 })}
                  style={inpNum}
                />
              </div>
              <div>
                <label style={lbl}>📋 Excusas</label>
                <input
                  type="number" min="0" max={totalMasc}
                  value={asistenciaMasc.excusa}
                  onChange={e => setAsistenciaMasc({ ...asistenciaMasc, excusa: parseInt(e.target.value, 10) || 0 })}
                  style={inpNum}
                />
              </div>
            </div>
            <div style={{ marginTop: "16px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "hsl(260,20%,50%)" }}>
              Suma Masculina: {Object.values(asistenciaMasc).reduce((a,b) => a+b, 0)} / {totalMasc}
            </div>
          </div>

        </div>

        {/* ── Botón Guardar Centrado ── */}
        {totalAula > 0 && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
            <button
              onClick={handleSave}
              style={{
                background: "linear-gradient(135deg, hsl(165,60%,35%), hsl(260,55%,48%))",
                color: "#fff", border: "none", padding: "14px 40px", borderRadius: "10px",
                fontWeight: "700", cursor: "pointer", fontSize: "15px", boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                transition: "transform 0.15s ease"
              }}
            >
              💾 Registrar Asistencia Consolidada
            </button>
          </div>
        )}

      </div>
    </Layout>
  );
}
