import Layout from "../Layout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getGrades, createGrade, updateGrade, deleteGrade } from "../services/gradeApi";
import { getStudents } from "../services/studentApi";
import { getCourses } from "../services/courseApi";
import Swal from "sweetalert2";

const DEFAULT_SUBJECTS = [
  "Lengua Española",
  "Matemáticas",
  "Ciencias Naturales",
  "Ciencias Sociales",
  "Inglés",
  "Educación Física",
  "Formación Humana y Religiosa",
  "Educación Artística",
  "Informática",
];

function getGradeStyle(g) {
  const score = parseFloat(g);
  if (score >= 90) return { label: "Sobresaliente", cls: "grade-excellent" };
  if (score >= 80) return { label: "Notable", cls: "grade-good" };
  if (score >= 70) return { label: "Aprobado", cls: "grade-pass" };
  return { label: "Por revisar", cls: "grade-review" };
}

function GradeRing({ value }) {
  const score = parseFloat(value);
  const pct = Math.min(100, Math.max(0, score));
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" className="grade-ring-svg">
      <circle cx="34" cy="34" r={r} fill="none" stroke="hsl(40,60%,92%)" strokeWidth="5"/>
      <circle
        cx="34" cy="34" r={r} fill="none"
        stroke={score >= 90 ? "hsl(165,65%,38%)" : score >= 70 ? "hsl(38,75%,48%)" : "hsl(0,65%,55%)"}
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 34 34)"
      />
      <text x="34" y="38" textAnchor="middle" fontSize="13" fontWeight="800" fill="hsl(260,30%,18%)">{score.toFixed(0)}</text>
    </svg>
  );
}

function Grades() {
  const navigate = useNavigate();
  const [gradesList, setGradesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [subjectList, setSubjectList] = useState(DEFAULT_SUBJECTS);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    estudiante_id: "",
    materia: "",
    calificacion: "",
    periodo: "",
  });

  const fetchData = async () => {
    try {
      const [gradesRes, studentsRes, coursesRes] = await Promise.allSettled([
        getGrades(),
        getStudents(),
        getCourses(),
      ]);

      if (gradesRes.status === "fulfilled") {
        setGradesList(gradesRes.value.grades || []);
      }

      if (studentsRes.status === "fulfilled") {
        const allS = studentsRes.value.students || [];
        const activeS = allS.filter((s) => s.tipo === "Estudiante" && !s.archivado);
        setStudentsList(activeS);
      }

      const subjectsSet = new Set(DEFAULT_SUBJECTS);
      if (coursesRes.status === "fulfilled" && coursesRes.value.courses) {
        coursesRes.value.courses.forEach((c) => {
          if (c.nombre && c.nombre.trim()) subjectsSet.add(c.nombre.trim());
        });
      }
      setSubjectList(Array.from(subjectsSet));
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Swal.fire("Error", "No se pudieron obtener los datos de la base de datos.", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    if (studentsList.length === 0) {
      return Swal.fire("Sin Estudiantes", "No hay estudiantes activos en el sistema para calificar.", "warning");
    }
    setEditingId(null);
    setFormData({
      estudiante_id: studentsList[0].id.toString(),
      materia: subjectList[0] || "Lengua Española",
      calificacion: "",
      periodo: new Date().getFullYear().toString() + "-1",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (g) => {
    setEditingId(g.id);
    setFormData({
      estudiante_id: g.estudiante_id ? g.estudiante_id.toString() : "",
      materia: g.materia || "",
      calificacion: g.calificacion ? g.calificacion.toString() : "",
      periodo: g.periodo || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const score = parseFloat(formData.calificacion);
    if (!formData.estudiante_id) {
      return Swal.fire("Validación", "Debe seleccionar un estudiante.", "warning");
    }
    if (!formData.materia.trim()) {
      return Swal.fire("Validación", "El nombre de la materia es obligatorio.", "warning");
    }
    if (isNaN(score) || score < 0 || score > 100) {
      return Swal.fire("Validación", "La calificación debe ser un número entre 0 y 100.", "warning");
    }
    if (!formData.periodo.trim()) {
      return Swal.fire("Validación", "El periodo escolar es obligatorio.", "warning");
    }

    try {
      if (editingId) {
        await updateGrade(editingId, formData);
        Swal.fire({ title: "Actualizado", text: "Calificación modificada con éxito.", icon: "success", timer: 1500, showConfirmButton: false });
      } else {
        await createGrade(formData);
        Swal.fire({ title: "Registrado", text: "Calificación registrada con éxito.", icon: "success", timer: 1500, showConfirmButton: false });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo registrar la calificación.", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Está segura?",
      text: "Se eliminará permanentemente la calificación del registro académico.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "hsl(330, 65%, 45%)",
      cancelButtonColor: "hsl(260, 15%, 55%)",
    });

    if (result.isConfirmed) {
      try {
        await deleteGrade(id);
        Swal.fire({ title: "Eliminado", text: "Calificación eliminada correctamente.", icon: "success", timer: 1500, showConfirmButton: false });
        fetchData();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo eliminar la calificación.", "error");
      }
    }
  };

  // Math helper
  const allGradesNum = gradesList.map(g => parseFloat(g.calificacion)).filter(n => !isNaN(n));
  const avg = allGradesNum.length ? (allGradesNum.reduce((s, c) => s + c, 0) / allGradesNum.length).toFixed(1) : "0.0";
  const top = allGradesNum.filter(g => g >= 90).length;
  const pending = allGradesNum.filter(g => g < 70).length;

  const visible = gradesList
    .filter((g) => {
      const score = parseFloat(g.calificacion);
      if (filter === "excellent") return score >= 90;
      if (filter === "pass") return score >= 70 && score < 90;
      if (filter === "review") return score < 70;
      return true;
    })
    .filter((g) => {
      const name = g.estudiante_nombre ? g.estudiante_nombre.toLowerCase() : "";
      const mat = g.materia ? g.materia.toLowerCase() : "";
      return name.includes(search.toLowerCase()) || mat.includes(search.toLowerCase());
    });

  return (
    <Layout>
      <div className="mod-shell">
        {/* Hero */}
        <section className="mod-hero mod-hero--gold">
          <div className="mod-hero__bg" style={{ backgroundImage: "url('/hero_grades.png')" }} />
          <div className="mod-hero__overlay" />
          <div className="mod-hero__content">
            <span className="mod-eyebrow">⭐ Registro Evaluativo</span>
            <h1>Calificaciones Académicas</h1>
            <p>Control y trazabilidad de notas institucionales, rendimiento del alumnado y alertas académicas.</p>
            
            <div className="mod-hero__stats">
              <div className="mod-hero-stat">
                <strong>{avg}</strong>
                <span>Promedio general</span>
              </div>
              <div className="mod-hero-stat">
                <strong>{top}</strong>
                <span>Excelencias (≥90)</span>
              </div>
              <div className="mod-hero-stat">
                <strong>{gradesList.length}</strong>
                <span>Calificaciones</span>
              </div>
            </div>
          </div>
          <div className="mod-hero__actions">
            <button className="mod-btn mod-btn--ghost" onClick={() => navigate("/dashboard")}>← Inicio</button>
            <button className="mod-btn mod-btn--primary" onClick={handleOpenAdd}>➕ Registrar Nota</button>
            <button className="mod-btn mod-btn--ghost" onClick={() => window.print()}>🖨️ Imprimir</button>
          </div>
        </section>

        {/* Toolbar */}
        <div className="mod-toolbar">
          <div className="mod-search">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" className="mod-search__icon">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar estudiante o materia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="mod-filter-pills">
            {[
              { key: "all", label: "Todos" },
              { key: "excellent", label: "✦ Sobresaliente (≥90)" },
              { key: "pass", label: "✓ Aprobado (70-89)" },
              { key: "review", label: "⚠ Por revisar (<70)" },
            ].map((f) => (
              <button
                key={f.key}
                className={`mod-filter-pill ${filter === f.key ? "active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary kpi strip */}
        <div className="gd-kpi-strip">
          <div className="gd-kpi">
            <span className="gd-kpi-val" style={{ color: "hsl(38,75%,42%)" }}>{avg}</span>
            <span className="gd-kpi-label">Promedio general</span>
          </div>
          <div className="gd-kpi-divider"/>
          <div className="gd-kpi">
            <span className="gd-kpi-val" style={{ color: "hsl(165,65%,38%)" }}>{top}</span>
            <span className="gd-kpi-label">Calificaciones Excelentes</span>
          </div>
          <div className="gd-kpi-divider"/>
          <div className="gd-kpi">
            <span className="gd-kpi-val" style={{ color: "hsl(0,65%,52%)" }}>{pending}</span>
            <span className="gd-kpi-label">Calificaciones Bajas</span>
          </div>
          <div className="gd-kpi-divider"/>
          <div className="gd-kpi">
            <span className="gd-kpi-val">{gradesList.length}</span>
            <span className="gd-kpi-label">Registros en MySQL</span>
          </div>
        </div>

        {/* Grade cards */}
        <div className="mod-grid">
          {visible.map((item) => {
            const style = getGradeStyle(item.calificacion);
            const initials = item.estudiante_nombre ? item.estudiante_nombre.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "ES";
            return (
              <div className="gd-card" key={item.id}>
                <div className="gd-card__top">
                  <div className="gd-avatar">{initials}</div>
                  <div className="gd-info">
                    <h3>{item.estudiante_nombre || "Estudiante no asociado"}</h3>
                    <span className="gd-course">{item.materia}</span>
                    <span className="gd-period">Periodo: {item.periodo}</span>
                  </div>
                  <GradeRing value={item.calificacion} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                  <span className={`gd-status ${style.cls}`}>{style.label}</span>
                  
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button 
                      onClick={() => handleOpenEdit(item)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {visible.length === 0 && (
            <div className="mod-empty" style={{ gridColumn: "1/-1" }}>
              <span>No se encontraron registros de calificaciones con los filtros actuales.</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="legal-sections" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="rp-chart-card" style={{ width: "100%", maxWidth: "480px", background: "#fff", padding: "28px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "hsl(330,60%,42%)", marginBottom: "16px", borderBottom: "1px solid hsl(280,20%,91%)", paddingBottom: "10px" }}>
              {editingId ? "✏️ Editar Calificación" : "➕ Registrar Calificación"}
            </h2>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "hsl(260,25%,35%)" }}>Estudiante *</label>
                {editingId ? (
                  <input
                    type="text"
                    disabled
                    value={gradesList.find(g => g.id === editingId)?.estudiante_nombre || ""}
                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid hsl(280,20%,85%)", background: "hsl(280,10%,95%)", fontSize: "14px", color: "hsl(260,10%,40%)" }}
                  />
                ) : (
                  <select
                    required
                    value={formData.estudiante_id}
                    onChange={(e) => setFormData({ ...formData, estudiante_id: e.target.value })}
                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid hsl(280,20%,85%)", outline: "none", fontSize: "14px" }}
                  >
                    {studentsList.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre} ({s.matricula})</option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "hsl(260,25%,35%)" }}>Materia / Asignatura *</label>
                <select
                  required
                  value={formData.materia}
                  onChange={(e) => setFormData({ ...formData, materia: e.target.value })}
                  style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid hsl(280,20%,85%)", outline: "none", fontSize: "14px", background: "#fff", cursor: "pointer" }}
                >
                  <option value="">— Seleccionar Materia —</option>
                  {subjectList.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "hsl(260,25%,35%)" }}>Calificación (0 - 100) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  placeholder="Ej. 95"
                  value={formData.calificacion}
                  onChange={(e) => setFormData({ ...formData, calificacion: e.target.value })}
                  style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid hsl(280,20%,85%)", outline: "none", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "hsl(260,25%,35%)" }}>Periodo Escolar *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 2026-1"
                  value={formData.periodo}
                  onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                  style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid hsl(280,20%,85%)", outline: "none", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: "hsl(280,15%,90%)", color: "hsl(260,20%,40%)", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ background: "linear-gradient(135deg, hsl(330,70%,45%), hsl(280,60%,48%))", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Grades;
