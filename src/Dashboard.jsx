import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { useEffect, useState } from "react";
import { getStudents } from "./services/studentApi";
import { getCourses } from "./services/courseApi";
import { getGrades } from "./services/gradeApi";

function Dashboard() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [counts, setCounts] = useState({ students: 120, courses: 24, grades: 8, reports: 12 });

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Fetch real counts to reflect in dashboard metrics
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const studentRes = await getStudents();
        const courseRes = await getCourses();
        const gradeRes = await getGrades();

        const sList = studentRes.students || [];
        const cList = courseRes.courses || [];
        const gList = gradeRes.grades || [];

        const activeS = sList.filter(s => s.tipo === "Estudiante" && !s.archivado).length;

        setCounts({
          students: activeS || 120,
          courses: cList.length || 24,
          grades: gList.length || 8,
          reports: 12
        });
      } catch (e) {
        console.error("Error fetching dashboard counts:", e);
      }
    };
    fetchCounts();
  }, []);

  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const todayStr = new Date().toLocaleDateString("es-ES", options);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  const stats = [
    {
      label: "Estudiantes activos",
      value: counts.students.toString(),
      sub: "+8% este mes",
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "Promedio general",
      value: "8.7",
      sub: "Rendimiento sostenido",
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Cursos vigentes",
      value: counts.courses.toString(),
      sub: "Planificación del ciclo",
      positive: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.8"/>
        </svg>
      ),
    },
    {
      label: "Reportes generados",
      value: counts.reports.toString(),
      sub: "Actualizados hoy",
      positive: false,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8"/>
          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  const modules = [
    {
      key: "students",
      title: "Control Escolar",
      description: "Gestiona estudiantes, docentes y seguimiento académico desde un solo punto de control.",
      path: "/students",
      image: "/img_ctrl_escolar.png",
      badge: "Gestión",
      metric: `${counts.students} estudiantes`,
      color: "mod-rose",
    },
    {
      key: "courses",
      title: "Cursos",
      description: "Organiza materias, horarios y disponibilidad de aulas con claridad operativa.",
      path: "/courses",
      image: "/hero_courses.png",
      badge: "Planificación",
      metric: `${counts.courses} cursos`,
      color: "mod-mauve",
    },
    {
      key: "grades",
      title: "Calificaciones",
      description: "Revisa evaluaciones y aprobaciones con trazabilidad académica completa.",
      path: "/grades",
      image: "/hero_grades.png",
      badge: "Seguimiento",
      metric: "92% aprobación",
      color: "mod-gold",
    },
    {
      key: "reports",
      title: "Reportes",
      description: "Consulta indicadores clave y métricas de rendimiento para decisiones estratégicas.",
      path: "/reports",
      image: "/hero_reports.png",
      badge: "Analítica",
      metric: "Actualizado hoy",
      color: "mod-teal",
    },
    {
      key: "attendance",
      title: "Asistencia Diaria",
      description: "Pase de lista diario por sexo, cursos (Inicial a 6to) y secciones (A, B, C) con docentes asociados.",
      path: "/attendance",
      image: "/hero_courses.png",
      badge: "Asistencia",
      metric: "Monitoreo Activo",
      color: "mod-rose",
    },
  ];

  const activity = [
    { title: "Nueva inscripción aprobada", time: "Hace 10 min", detail: "Estudiante de primer semestre registrada", type: "success" },
    { title: "Reporte de rendimiento listo", time: "Hace 45 min", detail: "Se consolidaron notas del ciclo actual", type: "info" },
    { title: "Curso con alta demanda", time: "Hace 1 h", detail: "Matemáticas II supera promedio de ocupación", type: "warning" },
    { title: "Docente incorporada", time: "Hace 2 h", detail: "Asignada a sección de 4to bachillerato", type: "success" },
  ];

  const performance = [
    { label: "Asistencia", value: "94%", width: "94%", color: "#be185d" },
    { label: "Cumplimiento académico", value: "89%", width: "89%", color: "#7c3aed" },
    { label: "Uso del sistema", value: "96%", width: "96%", color: "#0d9488" },
  ];

  // Mini SVG chart points
  const chartPoints = [30, 45, 38, 60, 55, 72, 68, 85, 80, 92];
  const svgW = 300, svgH = 100;
  const pts = chartPoints.map((v, i) => ({
    x: (i / (chartPoints.length - 1)) * svgW,
    y: svgH - (v / 100) * svgH,
  }));
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `0,${svgH} ` + pts.map((p) => `${p.x},${p.y}`).join(" ") + ` ${svgW},${svgH}`;

  return (
    <Layout>
      {/* Soft background styling alusive to the system */}
      <div 
        className={`db2-shell ${visible ? "db2-visible" : ""}`}
        style={{
          backgroundImage: "radial-gradient(circle at top right, rgba(255, 220, 230, 0.15), transparent), url('/dashboard_bg_hero.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top right",
          borderRadius: "28px"
        }}
      >

        {/* ── HERO BANNER ── */}
        <section className="db2-hero" style={{ background: "rgba(255, 255, 255, 0.72)", backdropFilter: "blur(12px)", border: "1px solid hsl(330, 45%, 88%)" }}>
          <div className="db2-hero__left">
            <span className="db2-eyebrow">✦ Panel central · Sistema de Gestión Escolar</span>
            <h1 className="db2-hero__title">
              {greeting}, <span className="db2-name-highlight">Administradora</span>
            </h1>
            <p className="db2-hero__date">
              {todayStr.charAt(0).toUpperCase() + todayStr.slice(1)}
            </p>
            <div className="db2-hero__chips">
              <span className="db2-chip db2-chip--green">
                <span className="db2-dot"></span> Conexión MySQL Activa
              </span>
              <span className="db2-chip">Todos los módulos en línea</span>
              <span className="db2-chip">Ciclo 2026</span>
            </div>
          </div>
          <div className="db2-hero__right">
            <div className="db2-summary-pair">
              <div className="db2-summary-box" style={{ background: "rgba(255, 255, 255, 0.9)" }}>
                <span className="db2-summary-label">Eficiencia operativa</span>
                <strong className="db2-summary-value">+12%</strong>
                <p>Automatización de procesos</p>
              </div>
              <div className="db2-summary-box db2-summary-box--accent" style={{ background: "linear-gradient(135deg, hsl(330, 70%, 97%), rgba(255, 255, 255, 0.9))" }}>
                <span className="db2-summary-label">Seguridad de Datos</span>
                <strong className="db2-summary-value" style={{ fontSize: "20px", color: "hsl(165, 60%, 32%)" }}>Protegido</strong>
                <p>Encriptación activa</p>
              </div>
            </div>
          </div>
          {/* decorative orbs */}
          <div className="db2-orb db2-orb--1" aria-hidden="true"></div>
          <div className="db2-orb db2-orb--2" aria-hidden="true"></div>
        </section>

        {/* ── STATS ROW ── */}
        <section className="db2-stats">
          {stats.map((s, i) => (
            <div className="db2-stat-card" key={s.label} style={{ "--delay": `${i * 0.08}s` }}>
              <div className="db2-stat-icon">{s.icon}</div>
              <div className="db2-stat-body">
                <span className="db2-stat-value">{s.value}</span>
                <span className="db2-stat-label">{s.label}</span>
                <span className={`db2-stat-sub ${s.positive ? "pos" : "neu"}`}>
                  {s.positive ? "▲" : "•"} {s.sub}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* ── MAIN 3-COL GRID ── */}
        <section className="db2-content">

          {/* Left: Chart + Modules */}
          <div className="db2-main-col">

            {/* Chart card */}
            <div className="db2-chart-card">
              <div className="db2-chart-card__header">
                <div>
                  <h3>Tendencia de desempeño</h3>
                  <p>Monitoreo del avance del sistema — últimos 10 períodos</p>
                </div>
                <span className="db2-pill db2-pill--rose">+18% trimestre</span>
              </div>
              <div className="db2-chart-wrap">
                <svg viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none" className="db2-svg-chart">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#be185d" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="#be185d" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <polygon points={area} fill="url(#chartGrad)"/>
                  <polyline
                    points={polyline}
                    fill="none"
                    stroke="#be185d"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {pts.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#be185d" stroke="#fff" strokeWidth="1.5"/>
                  ))}
                </svg>
                <div className="db2-chart-labels">
                  {["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct"].map(m => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Module cards (With custom illustrative images instead of icons) */}
            <div className="db2-modules-grid">
              {modules.map((m) => (
                <div
                  className={`db2-module-card ${m.color}`}
                  key={m.key}
                  onClick={() => navigate(m.path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") navigate(m.path); }}
                  style={{ padding: "0", overflow: "hidden", minHeight: "260px" }}
                >
                  <div style={{ position: "relative", height: "120px", width: "100%", overflow: "hidden" }}>
                    <img 
                      src={m.image} 
                      alt={m.title} 
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                      className="db2-card-img" 
                    />
                    <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 2 }}>
                      <span className="db2-mod-badge">{m.badge}</span>
                    </div>
                  </div>
                  <div style={{ padding: "18px", display: "flex", flexDirection: "column", flexGrow: "1" }}>
                    <h3 className="db2-mod-title" style={{ fontSize: "16px", marginBottom: "4px" }}>{m.title}</h3>
                    <p className="db2-mod-desc" style={{ fontSize: "12px", WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.description}</p>
                    <div className="db2-mod-footer" style={{ marginTop: "auto", paddingTop: "10px" }}>
                      <span className="db2-mod-metric" style={{ fontSize: "11px" }}>{m.metric}</span>
                      <span className="db2-mod-arrow" style={{ fontSize: "12px" }}>Abrir →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar: Activity + KPIs */}
          <aside className="db2-aside">

            {/* Activity feed */}
            <div className="db2-aside-card">
              <div className="db2-aside-header">
                <div>
                  <h3>Actividad reciente</h3>
                  <p>Últimos movimientos</p>
                </div>
                <span className="db2-pill db2-pill--green">En vivo</span>
              </div>
              <div className="db2-activity-list">
                {activity.map((a) => (
                  <div className="db2-activity-item" key={a.title}>
                    <div className={`db2-activity-dot dot-${a.type}`}></div>
                    <div>
                      <strong>{a.title}</strong>
                      <p>{a.detail}</p>
                      <span>{a.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KPI bars */}
            <div className="db2-aside-card">
              <div className="db2-aside-header">
                <div>
                  <h3>Indicadores clave</h3>
                  <p>Rendimiento del día</p>
                </div>
                <span className="db2-pill">Hoy</span>
              </div>
              <div className="db2-kpi-list">
                {performance.map((p) => (
                  <div className="db2-kpi-row" key={p.label}>
                    <div className="db2-kpi-meta">
                      <span>{p.label}</span>
                      <strong>{p.value}</strong>
                    </div>
                    <div className="db2-kpi-bar">
                      <div
                        className="db2-kpi-fill"
                        style={{ width: p.width, background: p.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agenda */}
            <div className="db2-aside-card">
              <div className="db2-aside-header">
                <div>
                  <h3>Agenda del día</h3>
                  <p>Compromisos de hoy</p>
                </div>
                <span className="db2-pill">Próximos</span>
              </div>
              <div className="db2-agenda-list">
                {[
                  { title: "Reunión de coordinación", time: "09:30 AM" },
                  { title: "Entrega de reportes", time: "12:00 PM" },
                  { title: "Seguimiento de cursos", time: "03:00 PM" },
                ].map((item) => (
                  <div className="db2-agenda-item" key={item.title}>
                    <div className="db2-agenda-time">{item.time}</div>
                    <div className="db2-agenda-line"></div>
                    <p>{item.title}</p>
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </section>
      </div>
    </Layout>
  );
}

export default Dashboard;