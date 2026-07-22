import { useEffect, useState, useRef } from "react";
import Layout from "../Layout";
import { useNavigate } from "react-router-dom";
import { getStudents } from "../services/studentApi";
import Chart from "chart.js/auto";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";

// Mini sparkline data
const MONTHLY = [18, 22, 20, 25, 24, 28, 26, 30, 29, 22, 25, 27];
const MONTHS  = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function Sparkline({ data, color }) {
  const w = 200, h = 50;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / (max - min || 1)) * (h - 8) - 4,
  }));
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `0,${h} ` + pts.map((p) => `${p.x},${p.y}`).join(" ") + ` ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: "50px" }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color})`}/>
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

function Reports() {
  const [students, setStudents] = useState([]);
  const chartRef    = useRef(null);
  const barRef      = useRef(null);
  const navigate    = useNavigate();
  const [tab, setTab] = useState("overview");

  const fetchStudents = async () => {
    try {
      const res = await getStudents();
      setStudents(res.students || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchStudents(); }, []);

  const activeStudents  = students.filter((s) => s.tipo === "Estudiante" && !s.archivado);
  const activeTeachers  = students.filter((s) => s.tipo === "Profesor"   && !s.archivado);
  const archivedRecords = students.filter((s) => s.archivado);
  const totalHours      = activeTeachers.reduce((s, t) => s + (t.horasPlanificadas || 0), 0);
  const avgHours        = activeTeachers.length ? (totalHours / activeTeachers.length).toFixed(1) : 0;

  // Animated counters
  const [cnt, setCnt] = useState({ s: 0, t: 0, a: 0 });
  useEffect(() => {
    const target = { s: activeStudents.length, t: activeTeachers.length, a: archivedRecords.length };
    let start = performance.now();
    const dur = 900;
    const from = { ...cnt };
    const raf = (now) => {
      const ease = 1 - Math.pow(1 - Math.min(1, (now - start) / dur), 3);
      setCnt({
        s: Math.round(from.s + (target.s - from.s) * ease),
        t: Math.round(from.t + (target.t - from.t) * ease),
        a: Math.round(from.a + (target.a - from.a) * ease),
      });
      if (ease < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStudents.length, activeTeachers.length, archivedRecords.length]);

  // Doughnut
  useEffect(() => {
    if (!chartRef.current || tab !== "overview") return;
    const ctx = chartRef.current.getContext("2d");
    const gA = ctx.createLinearGradient(0,0,0,300); gA.addColorStop(0,"hsl(330,65%,52%)"); gA.addColorStop(1,"hsl(280,55%,60%)");
    const gB = ctx.createLinearGradient(0,0,0,300); gB.addColorStop(0,"hsl(165,55%,42%)"); gB.addColorStop(1,"hsl(165,65%,56%)");
    const gC = ctx.createLinearGradient(0,0,0,300); gC.addColorStop(0,"hsl(38,80%,50%)"); gC.addColorStop(1,"hsl(38,70%,65%)");
    const center = {
      id: "centerText",
      beforeDraw(chart) {
        const { width, height, ctx } = chart;
        ctx.restore();
        ctx.font = `700 ${Math.min(14, Math.max(10, Math.floor(height/15)))}px Inter, sans-serif`;
        ctx.fillStyle = "hsl(260,30%,18%)";
        ctx.textBaseline = "middle";
        const text = `${students.length} total`;
        ctx.fillText(text, (width - ctx.measureText(text).width) / 2, height / 2);
        ctx.save();
      },
    };
    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Estudiantes", "Profesores", "Archivados"],
        datasets: [{ data: [activeStudents.length, activeTeachers.length, archivedRecords.length], backgroundColor: [gA, gB, gC], borderColor: "#fff", borderWidth: 3, hoverOffset: 10 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "70%",
        animation: { duration: 1000, easing: "easeOutCubic" },
        plugins: {
          legend: { position: "bottom", labels: { usePointStyle: true, padding: 18, font: { family: "Inter", size: 12 } } },
          tooltip: { padding: 10, callbacks: { label(c) { return ` ${c.label}: ${c.parsed} (${((c.parsed / Math.max(1, students.length)) * 100).toFixed(1)}%)`; } } },
        },
      },
      plugins: [center],
    });
    return () => chart.destroy();
  }, [activeStudents.length, activeTeachers.length, archivedRecords.length, students.length, tab]);

  // Bar chart for teachers' hours
  useEffect(() => {
    if (!barRef.current || tab !== "teachers" || !activeTeachers.length) return;
    const ctx = barRef.current.getContext("2d");
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: activeTeachers.map((t) => t.nombre.split(" ")[0]),
        datasets: [{
          label: "Horas planificadas",
          data: activeTeachers.map((t) => t.horasPlanificadas || 0),
          backgroundColor: activeTeachers.map((_, i) =>
            i % 3 === 0 ? "hsl(330,60%,70%)" : i % 3 === 1 ? "hsl(280,50%,68%)" : "hsl(165,50%,58%)"
          ),
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { grid: { color: "hsl(280,15%,94%)" }, ticks: { font: { size: 11 } } },
        },
      },
    });
    return () => chart.destroy();
  }, [activeTeachers, tab]);

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(190, 24, 93);
      doc.rect(0, 0, 210, 42, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold"); doc.setFontSize(20);
      doc.text("REPORTE ESTADÍSTICO ACADÉMICO", 15, 18);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.text(`Generado el ${new Date().toLocaleDateString()} • Sistema de Gestión Escolar`, 15, 28);
      doc.text(`Administradora del Sistema`, 15, 34);

      doc.setTextColor(15, 23, 42);
      let y = 54;

      doc.setFont("helvetica", "bold"); doc.setFontSize(13);
      doc.text("1. Resumen General", 15, y); y += 9;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.text(`• Total registros en base de datos: ${students.length}`, 20, y); y += 6;
      doc.text(`• Estudiantes activos: ${activeStudents.length}`, 20, y); y += 6;
      doc.text(`• Docentes activos: ${activeTeachers.length}`, 20, y); y += 6;
      doc.text(`• Registros archivados: ${archivedRecords.length}`, 20, y); y += 6;
      doc.text(`• Carga horaria total activa: ${totalHours} hrs`, 20, y); y += 6;
      doc.text(`• Promedio de horas por docente: ${avgHours} hrs`, 20, y); y += 12;

      if (activeTeachers.length) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(13);
        doc.text("2. Carga Horaria por Docente", 15, y); y += 9;
        doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        doc.text("Nombre", 20, y); doc.text("Matrícula", 90, y); doc.text("Correo", 130, y); doc.text("Horas", 185, y);
        doc.line(15, y + 2, 195, y + 2); y += 7;
        doc.setFont("helvetica", "normal");
        activeTeachers.forEach((t) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(t.nombre, 20, y); doc.text(t.matricula, 90, y);
          doc.text(t.correo.substring(0, 28), 130, y); doc.text(`${t.horasPlanificadas || 0}`, 185, y);
          y += 7;
        });
        y += 8;
      }

      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(13);
      doc.text("3. Conclusiones", 15, y); y += 9;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.text(`• Promedio de carga horaria por docente activo: ${avgHours} horas.`, 20, y); y += 6;
      doc.text(`• Los ${archivedRecords.length} registros archivados están excluidos de los cálculos.`, 20, y); y += 6;
      doc.setFontSize(8); doc.setTextColor(100, 116, 139);
      doc.text("Documento generado por el Sistema de Gestión Escolar.", 15, 287);
      doc.save(`Reporte_Academico_${new Date().toISOString().split("T")[0]}.pdf`);
      Swal.fire({ title: "Reporte descargado", icon: "success", timer: 1500, showConfirmButton: false });
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo generar el PDF.", "error");
    }
  };

  return (
    <Layout>
      <div className="mod-shell">
        {/* Hero */}
        <section className="mod-hero mod-hero--teal">
          <div className="mod-hero__bg" style={{ backgroundImage: "url('/hero_reports.png')" }} />
          <div className="mod-hero__overlay" />
          <div className="mod-hero__content">
            <span className="mod-eyebrow">📊 Módulo de Reportes</span>
            <h1>Reportes Académicos</h1>
            <p>Monitoreo, análisis y exportación de indicadores de la gestión escolar.</p>
            <div className="mod-hero__stats">
              <div className="mod-hero-stat">
                <strong>{students.length}</strong>
                <span>Total registros</span>
              </div>
              <div className="mod-hero-stat">
                <strong>{totalHours}</strong>
                <span>Horas planificadas</span>
              </div>
              <div className="mod-hero-stat">
                <strong>{avgHours}</strong>
                <span>Promedio hrs/docente</span>
              </div>
            </div>
          </div>
          <div className="mod-hero__actions">
            <button className="mod-btn mod-btn--ghost" onClick={() => navigate("/dashboard")}>← Inicio</button>
            <button className="mod-btn mod-btn--primary" onClick={handleExportPDF}>📄 Exportar PDF</button>
            <button className="mod-btn mod-btn--ghost" onClick={() => window.print()}>🖨️ Imprimir</button>
          </div>
        </section>

        {/* KPI Strip */}
        <div className="rp-kpi-strip">
          {[
            { label: "Total registros", val: students.length, color: "hsl(330,65%,48%)", icon: "📋" },
            { label: "Estudiantes activos", val: cnt.s, color: "hsl(280,55%,52%)", icon: "👩‍🎓" },
            { label: "Profesores activos", val: cnt.t, color: "hsl(165,55%,40%)", icon: "👨‍🏫" },
            { label: "Archivados", val: cnt.a, color: "hsl(38,70%,46%)", icon: "📁" },
          ].map((k) => (
            <div className="rp-kpi-card" key={k.label}>
              <span className="rp-kpi-icon">{k.icon}</span>
              <span className="rp-kpi-val" style={{ color: k.color }}>{k.val}</span>
              <span className="rp-kpi-label">{k.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="rp-tabs">
          {[
            { key: "overview", label: "📊 Vista general" },
            { key: "teachers", label: "👩‍🏫 Carga docente" },
            { key: "trend", label: "📈 Tendencia mensual" },
          ].map((t) => (
            <button
              key={t.key}
              className={`rp-tab-btn ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >{t.label}</button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "overview" && (
          <div className="rp-content-grid">
            <div className="rp-chart-card">
              <h3>Distribución general de registros</h3>
              <p>Composición del total de personas en la base de datos</p>
              <div style={{ height: "300px", position: "relative" }}>
                <canvas ref={chartRef} />
              </div>
            </div>
            <div className="rp-summary-card">
              <h3>Resumen ejecutivo</h3>
              <div className="rp-summary-list">
                {[
                  { label: "Total en sistema", val: students.length, pct: "100%" },
                  { label: "Estudiantes activos", val: activeStudents.length, pct: students.length ? `${((activeStudents.length / students.length) * 100).toFixed(0)}%` : "0%" },
                  { label: "Docentes activos", val: activeTeachers.length, pct: students.length ? `${((activeTeachers.length / students.length) * 100).toFixed(0)}%` : "0%" },
                  { label: "Archivados", val: archivedRecords.length, pct: students.length ? `${((archivedRecords.length / students.length) * 100).toFixed(0)}%` : "0%" },
                ].map((r) => (
                  <div className="rp-summary-row" key={r.label}>
                    <span>{r.label}</span>
                    <div className="rp-summary-right">
                      <strong>{r.val}</strong>
                      <span className="rp-pct">{r.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rp-insight">
                <strong>💡 Insight</strong>
                <p>La carga horaria total de {totalHours} hrs se distribuye entre {activeTeachers.length} docentes activos, con un promedio de {avgHours} hrs por educador.</p>
              </div>
            </div>
          </div>
        )}

        {tab === "teachers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="rp-content-grid">
              <div className="rp-chart-card">
                <h3>Horas planificadas por docente</h3>
                <p>Distribución de carga académica activa</p>
                <div style={{ height: "280px", position: "relative" }}>
                  {activeTeachers.length > 0 ? (
                    <canvas ref={barRef} />
                  ) : (
                    <div className="mod-empty"><span>No hay docentes activos registrados.</span></div>
                  )}
                </div>
              </div>
              <div className="rp-teacher-list-card">
                <h3>Detalle de docentes</h3>
                {activeTeachers.length === 0 ? (
                  <p style={{ color: "hsl(260,15%,55%)", fontStyle: "italic" }}>Sin docentes activos.</p>
                ) : (
                  <div className="rp-teacher-list">
                    {activeTeachers.map((t, i) => (
                      <div className="rp-teacher-row" key={t.id}>
                        <div className="rp-teacher-avatar" style={{ background: i % 3 === 0 ? "hsl(330,60%,92%)" : i % 3 === 1 ? "hsl(280,50%,92%)" : "hsl(165,50%,90%)", color: i % 3 === 0 ? "hsl(330,65%,42%)" : i % 3 === 1 ? "hsl(280,55%,42%)" : "hsl(165,65%,32%)" }}>
                          {t.nombre.charAt(0)}
                        </div>
                        <div className="rp-teacher-info">
                          <strong>{t.nombre}</strong>
                          <span>{t.matricula}</span>
                        </div>
                        <span className="rp-hours-badge">{t.horasPlanificadas || 0} hrs</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="rp-total-row">
                  <span>Total carga horaria</span>
                  <strong>{totalHours} hrs</strong>
                </div>
              </div>
            </div>

            {/* NEW ADDITION: Teacher load data & analytical information */}
            <div className="rp-chart-card" style={{ gridColumn: "1/-1" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid hsl(280,20%,92%)", paddingBottom: "12px", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ margin: 0 }}>Análisis de Distribución de Carga y Capacidad</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "hsl(260,15%,55%)" }}>Monitoreo de horas contratadas para prevención de sobrecarga académica</p>
                </div>
                <span className="db2-pill db2-pill--rose" style={{ background: "hsl(330,65%,95%)", color: "hsl(330,65%,45%)", fontWeight: "700" }}>Ciclo Académico Activo</span>
              </div>

              <div className="rp-sparkline-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                
                {/* Metric 1 */}
                <div style={{ background: "hsl(280,15%,97%)", padding: "18px", borderRadius: "16px", border: "1px solid hsl(280,20%,91%)" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "hsl(260,15%,45%)" }}>Carga Promedio</span>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "hsl(280,55%,45%)", margin: "8px 0" }}>{avgHours} hrs</div>
                  <p style={{ fontSize: "12px", color: "hsl(260,10%,35%)", margin: 0 }}>
                    La carga óptima recomendada es de <strong>20 a 35 horas</strong> semanales por educador.
                  </p>
                </div>

                {/* Metric 2 (Overload warning list) */}
                <div style={{ background: "hsl(350,60%,98%)", padding: "18px", borderRadius: "16px", border: "1px solid hsl(350,50%,92%)" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "hsl(350,75%,42%)" }}>🚨 Alerta de Sobrecarga (&gt;40 hrs)</span>
                  <div style={{ marginTop: "10px" }}>
                    {activeTeachers.filter(t => (t.horasPlanificadas || 0) > 40).length > 0 ? (
                      activeTeachers.filter(t => (t.horasPlanificadas || 0) > 40).map(t => (
                        <div key={t.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0", borderBottom: "1px dashed rgba(239,68,68,0.15)", color: "hsl(350,60%,32%)" }}>
                          <span>{t.nombre.split(" ")[0]}</span>
                          <strong>{t.horasPlanificadas} hrs</strong>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: "12px", color: "hsl(165,60%,32%)", margin: 0 }}>✓ Ningún docente supera las 40 horas semanales.</p>
                    )}
                  </div>
                </div>

                {/* Metric 3 (Available Capacity list) */}
                <div style={{ background: "hsl(165,65%,98%)", padding: "18px", borderRadius: "16px", border: "1px solid hsl(165,55%,92%)" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "hsl(165,65%,32%)" }}>💡 Disponibilidad de Horas (&lt;30 hrs)</span>
                  <div style={{ marginTop: "10px" }}>
                    {activeTeachers.filter(t => (t.horasPlanificadas || 0) < 30).length > 0 ? (
                      activeTeachers.filter(t => (t.horasPlanificadas || 0) < 30).map(t => (
                        <div key={t.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0", borderBottom: "1px dashed rgba(16,185,129,0.15)", color: "hsl(165,60%,32%)" }}>
                          <span>{t.nombre.split(" ")[0]}</span>
                          <strong>{30 - (t.horasPlanificadas || 0)} hrs disp.</strong>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: "12px", color: "hsl(260,10%,45%)", margin: 0 }}>Todos los docentes tienen carga completa.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {tab === "trend" && (
          <div className="rp-content-grid">
            <div className="rp-chart-card rp-chart-card--full">
              <div className="rp-trend-header">
                <div>
                  <h3>Tendencia de inscripciones mensuales</h3>
                  <p>Proyección histórica del ciclo 2026</p>
                </div>
                <span className="rp-trend-badge">+32% vs año anterior</span>
              </div>

              {/* Custom SVG line chart */}
              <div className="rp-trend-chart">
                {(() => {
                  const w = 800, h = 200;
                  const max = Math.max(...MONTHLY), min = Math.min(...MONTHLY);
                  const pts = MONTHLY.map((v, i) => ({
                    x: 40 + (i / (MONTHLY.length - 1)) * (w - 60),
                    y: h - 20 - ((v - min) / (max - min || 1)) * (h - 40),
                  }));
                  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
                  const area = `40,${h - 20} ` + pts.map((p) => `${p.x},${p.y}`).join(" ") + ` ${w - 20},${h - 20}`;
                  return (
                    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: "200px" }}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(330,65%,52%)" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="hsl(330,65%,52%)" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <polygon points={area} fill="url(#trendGrad)"/>
                      <polyline points={line} fill="none" stroke="hsl(330,65%,52%)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
                      {pts.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="5" fill="hsl(330,65%,52%)" stroke="#fff" strokeWidth="2"/>
                          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fill="hsl(260,25%,35%)" fontWeight="600">{MONTHLY[i]}</text>
                        </g>
                      ))}
                      {MONTHS.map((m, i) => (
                        <text key={m} x={40 + (i / (MONTHS.length - 1)) * (w - 60)} y={h - 4} textAnchor="middle" fontSize="10" fill="hsl(260,15%,60%)">{m}</text>
                      ))}
                    </svg>
                  );
                })()}
              </div>

              {/* Monthly sparkline cards */}
              <div className="rp-sparkline-grid">
                {[
                  { label: "Estudiantes activos", val: activeStudents.length, sub: "vs. 18 anterior", color: "hsl(330,65%,52%)" },
                  { label: "Docentes activos", val: activeTeachers.length, sub: `${totalHours} hrs totales`, color: "hsl(280,55%,52%)" },
                  { label: "Tasa de retención", val: "94%", sub: "+2% este ciclo", color: "hsl(165,55%,40%)" },
                  { label: "Cursos activos", val: 6, sub: "4 con alta demanda", color: "hsl(38,70%,46%)" },
                ].map((s) => (
                  <div className="rp-spark-card" key={s.label}>
                    <div className="rp-spark-top">
                      <span className="rp-spark-val" style={{ color: s.color }}>{s.val}</span>
                      <span className="rp-spark-label">{s.label}</span>
                    </div>
                    <Sparkline data={MONTHLY} color={s.color} />
                    <span className="rp-spark-sub">{s.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Reports;
