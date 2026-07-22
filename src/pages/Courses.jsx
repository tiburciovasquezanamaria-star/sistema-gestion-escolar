import Layout from "../Layout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getCourses, getSeccionCupos, createCourse, updateCourse,
  updateMaestro, deleteCourse,
} from "../services/courseApi";
import { getStudents } from "../services/studentApi";
import Swal from "sweetalert2";

const SECCIONES_DEF = [
  { nivel: "Inicial", cupoTotal: 30, secciones: ["A","B"] },
  { nivel: "1ro",     cupoTotal: 38, secciones: ["A","B"] },
  { nivel: "2do",     cupoTotal: 38, secciones: ["A","B"] },
  { nivel: "3ro",     cupoTotal: 38, secciones: ["A","B"] },
  { nivel: "4to",     cupoTotal: 38, secciones: ["A","B"] },
  { nivel: "5to",     cupoTotal: 38, secciones: ["A","B"] },
  { nivel: "6to",     cupoTotal: 38, secciones: ["A","B"] },
];

function parsearSeccion(aula = "") {
  const t = aula.trim().toLowerCase();
  for (const d of SECCIONES_DEF)
    if (t.startsWith(d.nivel.toLowerCase())) return d;
  return null;
}

const thS = { padding:"10px 14px", textAlign:"left", fontWeight:"700", fontSize:"11.5px", letterSpacing:"0.04em", textTransform:"uppercase" };
const tdS = { padding:"9px 14px", borderBottom:"1px solid hsl(280,20%,91%)", fontSize:"13px" };
const lbl = { fontSize:"12px", fontWeight:"700", color:"hsl(260,25%,35%)" };
const inp = { padding:"10px 14px", borderRadius:"8px", border:"1px solid hsl(280,20%,85%)", outline:"none", fontSize:"14px", fontFamily:"inherit", width:"100%", boxSizing:"border-box" };

export default function Courses() {
  const navigate = useNavigate();
  const [coursesList, setCoursesList] = useState([]);
  const [secciones, setSecciones] = useState([]);   // datos reales de BD
  const [profesoresList, setProfesoresList] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Edición inline de maestro por sección
  const [editMaestroAula, setEditMaestroAula] = useState(null);
  const [maestroInput, setMaestroInput] = useState("");

  const [formData, setFormData] = useState({ nombre:"", profesor:"", aula:"", horario:"", inscritos:"" });

  const fetchAll = async () => {
    try {
      const [resC, resS, resP] = await Promise.allSettled([getCourses(), getSeccionCupos(), getStudents()]);
      if (resC.status === "fulfilled") setCoursesList(resC.value.courses || []);
      if (resS.status === "fulfilled") setSecciones(resS.value.secciones || []);
      if (resP.status === "fulfilled") {
        const all = resP.value.students || [];
        const profs = all.filter(p => p.tipo === "Profesor" && !p.archivado);
        setProfesoresList(profs);
      }
    } catch {
      Swal.fire("Error", "No se pudieron cargar los datos.", "error");
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd  = () => { setEditingId(null); setFormData({ nombre:"", profesor:"", aula:"", horario:"", inscritos:"" }); setShowModal(true); };
  const openEdit = (c) => { setEditingId(c.id); setFormData({ nombre:c.nombre||"", profesor:c.profesor||"", aula:c.aula||"", horario:c.horario||"", inscritos:c.inscritos??0 }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return Swal.fire("Validación","El nombre es obligatorio.","warning");
    const ins = parseInt(formData.inscritos,10);
    const sec = parsearSeccion(formData.aula);
    if (sec && !isNaN(ins) && ins > sec.cupoTotal)
      return Swal.fire("Cupo excedido",`La sección ${formData.aula} tiene máximo ${sec.cupoTotal} estudiantes.`,"warning");
    try {
      const payload = { ...formData, inscritos: isNaN(ins)?0:ins };
      if (editingId) { await updateCourse(editingId, payload); Swal.fire({ title:"Actualizado", icon:"success", timer:1500, showConfirmButton:false }); }
      else { await createCourse(payload); Swal.fire({ title:"Registrado", icon:"success", timer:1500, showConfirmButton:false }); }
      setShowModal(false); fetchAll();
    } catch (err) { Swal.fire("Error", err.message||"No se pudo guardar.","error"); }
  };

  const handleDelete = async (id) => {
    const r = await Swal.fire({ title:"¿Está segura?", text:"Esta acción no se puede deshacer.", icon:"warning", showCancelButton:true, confirmButtonText:"Sí, eliminar", cancelButtonText:"Cancelar", confirmButtonColor:"hsl(330,65%,45%)", cancelButtonColor:"hsl(260,15%,55%)" });
    if (r.isConfirmed) {
      try { await deleteCourse(id); Swal.fire({ title:"Eliminado", icon:"success", timer:1500, showConfirmButton:false }); fetchAll(); }
      catch { Swal.fire("Error","No se pudo eliminar.","error"); }
    }
  };

  // Guardar maestro encargado de una sección (actualiza todos los cursos de esa aula)
  const handleSaveMaestro = async (aula) => {
    if (!maestroInput.trim()) return;
    try {
      // Buscar todos los cursos de esa aula y actualizarlos
      const cursosDeSec = coursesList.filter(c => (c.aula||"").toLowerCase() === aula.toLowerCase());
      await Promise.all(cursosDeSec.map(c => updateMaestro(c.id, maestroInput.trim())));
      Swal.fire({ title:"Maestro actualizado", icon:"success", timer:1200, showConfirmButton:false });
      setEditMaestroAula(null); setMaestroInput(""); fetchAll();
    } catch { Swal.fire("Error","No se pudo actualizar el maestro.","error"); }
  };

  const filtered = coursesList.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.profesor && c.profesor.toLowerCase().includes(search.toLowerCase())) ||
    (c.aula && c.aula.toLowerCase().includes(search.toLowerCase()))
  );

  const totalCupos = SECCIONES_DEF.reduce((a,n) => a + n.cupoTotal * n.secciones.length, 0);
  const totalIns   = secciones.reduce((a,s) => a + s.inscritos, 0);

  return (
    <Layout>
      <div className="mod-shell">

        {/* ── Hero ─────────────────────────── */}
        <section className="mod-hero mod-hero--mauve">
          <div className="mod-hero__bg" style={{ backgroundImage:"url('/hero_courses.png')" }} />
          <div className="mod-hero__overlay" />
          <div className="mod-hero__content">
            <span className="mod-eyebrow">📚 Gestión Académica</span>
            <h1>Cursos y Secciones</h1>
            <p>Planificación de materias activas, asignación de docentes y control de cupos institucionales.</p>
            <div className="mod-hero__stats">
              <div className="mod-hero-stat"><strong>{coursesList.length}</strong><span>Materias</span></div>
              <div className="mod-hero-stat"><strong>{new Set(coursesList.map(c=>c.profesor).filter(Boolean)).size}</strong><span>Docentes</span></div>
              <div className="mod-hero-stat"><strong>{totalCupos}</strong><span>Cupos totales</span></div>
              <div className="mod-hero-stat">
                <strong style={{ color: totalIns > totalCupos ? "#ff6b6b" : "#a8ffcb" }}>{Math.max(0,totalCupos-totalIns)}</strong>
                <span>Disponibles</span>
              </div>
            </div>
          </div>
          <div className="mod-hero__actions">
            <button className="mod-btn mod-btn--ghost" onClick={() => navigate("/dashboard")}>← Inicio</button>
            <button className="mod-btn mod-btn--primary" onClick={openAdd}>➕ Crear Materia</button>
            <button className="mod-btn mod-btn--ghost" onClick={() => setShowPanel(true)}>🏫 Ver Secciones</button>
            <button className="mod-btn mod-btn--ghost" onClick={() => window.print()}>🖨️ Imprimir</button>
          </div>
        </section>

        {/* ── Tabla: Secciones y Cupos REALES ──────── */}
        <section style={{ background:"linear-gradient(135deg,hsl(260,25%,97%),hsl(330,25%,97%))", borderRadius:"18px", padding:"24px 28px", margin:"0 0 28px 0", border:"1px solid hsl(280,20%,88%)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px", flexWrap:"wrap", gap:"8px" }}>
            <h2 style={{ fontSize:"16px", fontWeight:"800", color:"hsl(330,60%,40%)", margin:0 }}>🏫 Secciones — Cupos y Maestro Encargado</h2>
            <span style={{ fontSize:"12px", color:"hsl(260,20%,50%)", background:"hsl(280,20%,93%)", padding:"4px 12px", borderRadius:"20px", fontWeight:"600" }}>
              Inicial: 30 cupos · 1ro–6to: 38 cupos por sección
            </span>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
              <thead>
                <tr style={{ background:"linear-gradient(90deg,hsl(330,65%,45%),hsl(280,55%,48%))", color:"#fff" }}>
                  <th style={thS}>Nivel</th>
                  <th style={thS}>Sección</th>
                  <th style={thS}>Cupo Total</th>
                  <th style={thS}>♀ Fem.</th>
                  <th style={thS}>♂ Masc.</th>
                  <th style={thS}>Cupos Reservados</th>
                  <th style={thS}>Cupos Disponibles</th>
                  <th style={thS}>Ocupación</th>
                  <th style={thS}>Maestro Encargado</th>
                </tr>
              </thead>
              <tbody>
                {secciones.map((s, i) => {
                  const pct = Math.min(100, Math.round((s.inscritos/s.cupoTotal)*100));
                  const isFirstOfLevel = i === 0 || secciones[i-1].nivel !== s.nivel;
                  const rowsInLevel = secciones.filter(x => x.nivel === s.nivel).length;
                  
                  const GRADE_DISPLAY = {
                    "Inicial": "🌱 Inicial",
                    "1ro": "📖 1er Grado",
                    "2do": "📖 2do Grado",
                    "3ro": "📖 3er Grado",
                    "4to": "📖 4to Grado",
                    "5to": "📖 5to Grado",
                    "6to": "📖 6to Grado"
                  };

                  return (
                    <tr key={s.aula} style={{ background: i%2===0 ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)" }}>
                      {isFirstOfLevel && (
                        <td rowSpan={rowsInLevel} style={{ ...tdS, fontWeight:"800", color:"hsl(330,60%,42%)", textAlign:"center", borderRight:"2px solid hsl(280,20%,88%)", background:"rgba(255,255,255,0.95)", fontSize:"14px" }}>
                          {GRADE_DISPLAY[s.nivel] || s.nivel}
                        </td>
                      )}
                      <td style={{ ...tdS, fontWeight:"700", color:"hsl(260,30%,40%)" }}>Sección {s.seccion}</td>
                      <td style={{ ...tdS, textAlign:"center", fontWeight:"700" }}>{s.cupoTotal}</td>
                      <td style={{ ...tdS, textAlign:"center", color:"hsl(330,60%,45%)", fontWeight:"600" }}>{s.femenino}</td>
                      <td style={{ ...tdS, textAlign:"center", color:"hsl(210,65%,45%)", fontWeight:"600" }}>{s.masculino}</td>
                      <td style={{ ...tdS, textAlign:"center", fontWeight:"700", color:"hsl(260,50%,45%)" }}>{s.inscritos} reservados</td>
                      <td style={{ ...tdS, textAlign:"center", fontWeight:"700", color: s.disponibles===0?"hsl(0,60%,50%)":s.disponibles<=5?"hsl(35,80%,45%)":"hsl(145,55%,38%)" }}>
                        {s.disponibles===0 ? "🔴 Lleno" : `✅ ${s.disponibles} disponibles`}
                      </td>
                      <td style={{ ...tdS, minWidth:"120px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <div style={{ flex:1, background:"hsl(280,20%,90%)", borderRadius:"99px", height:"8px", overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${pct}%`, background:pct>=100?"hsl(0,60%,50%)":pct>=80?"hsl(35,80%,50%)":"linear-gradient(90deg,hsl(145,55%,45%),hsl(260,55%,50%))", borderRadius:"99px", transition:"width .5s" }} />
                          </div>
                          <span style={{ fontSize:"11px", fontWeight:"700", color:"hsl(260,20%,45%)", minWidth:"34px" }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ ...tdS, minWidth:"200px" }}>
                        {editMaestroAula === s.aula ? (
                          <div style={{ display:"flex", gap:"6px" }}>
                            <input
                              autoFocus
                              value={maestroInput}
                              onChange={e => setMaestroInput(e.target.value)}
                              onKeyDown={e => { if(e.key==="Enter") handleSaveMaestro(s.aula); if(e.key==="Escape") { setEditMaestroAula(null); setMaestroInput(""); } }}
                              style={{ flex:1, padding:"6px 10px", borderRadius:"6px", border:"1px solid hsl(330,60%,65%)", outline:"none", fontSize:"12px" }}
                              placeholder="Nombre del maestro..."
                            />
                            <button onClick={() => handleSaveMaestro(s.aula)} style={{ background:"hsl(145,55%,38%)", color:"#fff", border:"none", borderRadius:"6px", padding:"6px 10px", fontWeight:"700", cursor:"pointer", fontSize:"12px" }}>✓</button>
                            <button onClick={() => { setEditMaestroAula(null); setMaestroInput(""); }} style={{ background:"hsl(280,15%,85%)", border:"none", borderRadius:"6px", padding:"6px 8px", fontWeight:"700", cursor:"pointer", fontSize:"12px" }}>✕</button>
                          </div>
                        ) : (
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"6px" }}>
                            <span style={{ fontSize:"12px", color: s.maestro ? "hsl(260,30%,30%)" : "hsl(260,10%,65%)", fontStyle: s.maestro ? "normal" : "italic" }}>
                              {s.maestro || "Sin asignar"}
                            </span>
                            <button
                              onClick={() => { setEditMaestroAula(s.aula); setMaestroInput(s.maestro||""); }}
                              title="Editar maestro encargado"
                              style={{ background:"rgba(0,0,0,0.06)", border:"none", borderRadius:"5px", padding:"3px 8px", cursor:"pointer", fontSize:"12px", color:"hsl(260,30%,45%)", fontWeight:"700" }}
                            >✏️</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background:"hsl(260,20%,93%)", fontWeight:"800" }}>
                  <td colSpan={2} style={{ ...tdS, color:"hsl(260,30%,35%)" }}>TOTALES GENERALES</td>
                  <td style={{ ...tdS, textAlign:"center", color:"hsl(260,40%,40%)" }}>{totalCupos}</td>
                  <td style={{ ...tdS, textAlign:"center", color:"hsl(330,60%,45%)" }}>{secciones.reduce((a,s)=>a+s.femenino,0)}</td>
                  <td style={{ ...tdS, textAlign:"center", color:"hsl(210,65%,45%)" }}>{secciones.reduce((a,s)=>a+s.masculino,0)}</td>
                  <td style={{ ...tdS, textAlign:"center", color:"hsl(260,50%,45%)" }}>{totalIns} reservados</td>
                  <td style={{ ...tdS, textAlign:"center", color: totalCupos-totalIns<=0?"hsl(0,60%,50%)":"hsl(145,55%,38%)" }}>{Math.max(0,totalCupos-totalIns)} disponibles</td>
                  <td style={tdS}><span style={{ fontSize:"12px", fontWeight:"700", color:"hsl(260,30%,40%)" }}>{Math.min(100,Math.round((totalIns/totalCupos)*100))}% ocupado</span></td>
                  <td style={tdS}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* ── Toolbar ─────────────────────── */}
        <div className="mod-toolbar">
          <div className="mod-search">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" className="mod-search__icon">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Buscar materia, docente o aula..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <span className="mod-count">{filtered.length} cursos listados</span>
        </div>

        {/* ── Cards ───────────────────────── */}
        <div className="mod-grid">
          {filtered.map((course, idx) => {
            const cc = ["cc-rose","cc-mauve","cc-gold","cc-teal"][idx%4];
            const secDef = parsearSeccion(course.aula);
            const secData = secciones.find(s => (s.aula||"").toLowerCase() === (course.aula||"").toLowerCase());
            const cap  = secDef ? secDef.cupoTotal : null;
            const ins  = secData ? secData.inscritos : (parseInt(course.inscritos,10)||0);
            const disp = cap !== null ? Math.max(0,cap-ins) : null;
            const pct  = cap ? Math.min(100,Math.round(ins/cap*100)) : 0;
            return (
              <div className={`cc-card ${cc}`} key={course.id}>
                <div className="cc-card__top">
                  <div className="cc-icon" style={{ background:"rgba(255,255,255,0.7)" }}>
                    <svg viewBox="0 0 24 24" fill="none" width="22" height="22" style={{ color:"hsl(330,65%,45%)" }}>
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.8"/>
                    </svg>
                  </div>
                  <span className="cc-room">{course.aula||"Sin sección"}</span>
                </div>
                <h3 className="cc-title">{course.nombre}</h3>
                <div className="cc-meta">
                  <div className="cc-meta-row"><span>👩‍🏫 <strong>Docente:</strong> {course.profesor||"No asignado"}</span></div>
                  <div className="cc-meta-row"><span>⏰ <strong>Horario:</strong> {course.horario||"No establecido"}</span></div>
                  {cap !== null && (
                    <div style={{ marginTop:"10px", padding:"10px 12px", background:"rgba(255,255,255,0.55)", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.7)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px", fontSize:"11px", fontWeight:"700", color:"hsl(260,25%,35%)" }}>
                        <span>👥 Cupos</span>
                        <span style={{ color:disp===0?"hsl(0,60%,45%)":disp<=5?"hsl(35,70%,45%)":"hsl(145,50%,38%)" }}>
                          {ins}/{cap} · {disp===0?"🔴 Lleno":`${disp} disponibles`}
                        </span>
                      </div>
                      <div style={{ background:"rgba(255,255,255,0.4)", borderRadius:"99px", height:"7px", overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:pct>=100?"hsl(0,60%,50%)":pct>=80?"hsl(35,80%,50%)":"linear-gradient(90deg,hsl(145,55%,45%),hsl(260,55%,55%))", borderRadius:"99px" }} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="cc-footer" style={{ borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:"12px", marginTop:"auto", display:"flex", gap:"8px", justifyContent:"flex-end" }}>
                  <button onClick={()=>openEdit(course)} style={{ background:"rgba(255,255,255,0.8)", border:"1px solid rgba(0,0,0,0.1)", borderRadius:"6px", padding:"6px 12px", fontSize:"11px", fontWeight:"700", cursor:"pointer", color:"hsl(260,25%,30%)" }}>✏️ Editar</button>
                  <button onClick={()=>handleDelete(course.id)} style={{ background:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,0,0,0.1)", borderRadius:"6px", padding:"6px 12px", fontSize:"11px", fontWeight:"700", cursor:"pointer", color:"hsl(0,65%,45%)" }}>🗑️ Eliminar</button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="mod-empty" style={{ gridColumn:"1/-1" }}><span>No se encontraron materias activas.</span></div>}
        </div>

        {/* ── Modal detalle secciones ─────── */}
        {showPanel && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(5px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
            <div style={{ background:"#fff", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"640px", maxHeight:"85vh", overflowY:"auto", boxShadow:"0 20px 50px rgba(0,0,0,0.2)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
                <h2 style={{ fontSize:"18px", fontWeight:"800", color:"hsl(330,60%,42%)", margin:0 }}>🏫 Detalle de Capacidad por Sección</h2>
                <button onClick={()=>setShowPanel(false)} style={{ background:"hsl(280,15%,90%)", border:"none", borderRadius:"8px", padding:"6px 14px", fontWeight:"700", cursor:"pointer" }}>✕ Cerrar</button>
              </div>
              {SECCIONES_DEF.map(n => (
                <div key={n.nivel} style={{ marginBottom:"18px" }}>
                  <h3 style={{ fontSize:"14px", fontWeight:"800", color:"hsl(260,30%,40%)", marginBottom:"8px" }}>{n.nivel==="Inicial"?"🌱":"📖"} {n.nivel}</h3>
                  <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
                    {n.secciones.map(s => {
                      const sd = secciones.find(x => x.aula === `${n.nivel} ${s}`);
                      const ins2 = sd?.inscritos||0, fem=sd?.femenino||0, masc=sd?.masculino||0;
                      const disp2 = Math.max(0,n.cupoTotal-ins2);
                      const p2 = Math.min(100,Math.round(ins2/n.cupoTotal*100));
                      return (
                        <div key={s} style={{ flex:"1", minWidth:"200px", background:"hsl(280,20%,97%)", borderRadius:"12px", padding:"14px", border:"1px solid hsl(280,20%,88%)" }}>
                          <div style={{ fontWeight:"800", fontSize:"14px", color:"hsl(330,60%,42%)", marginBottom:"8px" }}>Sección {s}</div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px", marginBottom:"10px" }}>
                            <div style={{ background:"hsl(330,65%,95%)", borderRadius:"8px", padding:"8px", textAlign:"center" }}>
                              <div style={{ fontSize:"18px", fontWeight:"800", color:"hsl(330,60%,42%)" }}>{fem}</div>
                              <div style={{ fontSize:"10px", fontWeight:"700", color:"hsl(330,50%,55%)" }}>♀ FEMENINO</div>
                            </div>
                            <div style={{ background:"hsl(210,65%,95%)", borderRadius:"8px", padding:"8px", textAlign:"center" }}>
                              <div style={{ fontSize:"18px", fontWeight:"800", color:"hsl(210,65%,40%)" }}>{masc}</div>
                              <div style={{ fontSize:"10px", fontWeight:"700", color:"hsl(210,55%,55%)" }}>♂ MASCULINO</div>
                            </div>
                          </div>
                          <div style={{ fontSize:"12px", color:"hsl(260,20%,45%)", marginBottom:"4px" }}>Cupo total: <strong>{n.cupoTotal}</strong> · Inscritos: <strong>{ins2}</strong></div>
                          <div style={{ fontSize:"12px", marginBottom:"8px" }}>Disponibles: <strong style={{ color:disp2===0?"hsl(0,60%,45%)":"hsl(145,50%,38%)" }}>{disp2}</strong></div>
                          <div style={{ background:"hsl(280,20%,88%)", borderRadius:"99px", height:"8px", overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${p2}%`, background:p2>=100?"hsl(0,60%,50%)":"linear-gradient(90deg,hsl(145,55%,45%),hsl(260,55%,50%))", borderRadius:"99px" }} />
                          </div>
                          <div style={{ fontSize:"11px", color:"hsl(260,20%,55%)", marginTop:"4px", textAlign:"right" }}>{p2}% ocupado</div>
                          {sd?.maestro && <div style={{ marginTop:"8px", fontSize:"11px", color:"hsl(260,25%,45%)" }}>👩‍🏫 {sd.maestro}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Modal crear/editar ──────────── */}
        {showModal && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
            <div style={{ width:"100%", maxWidth:"480px", background:"#fff", padding:"28px", borderRadius:"20px", boxShadow:"0 10px 30px rgba(0,0,0,0.15)", maxHeight:"90vh", overflowY:"auto" }}>
              <h2 style={{ fontSize:"18px", fontWeight:"800", color:"hsl(330,60%,42%)", marginBottom:"16px", borderBottom:"1px solid hsl(280,20%,91%)", paddingBottom:"10px" }}>
                {editingId ? "✏️ Editar Materia" : "➕ Crear Nueva Materia"}
              </h2>
              <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
                  <label style={lbl}>Nombre de la Materia *</label>
                  <input type="text" required value={formData.nombre} onChange={e=>setFormData({...formData,nombre:e.target.value})} style={inp} />
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
                  <label style={lbl}>Docente Encargado</label>
                  <select
                    value={formData.profesor}
                    onChange={e => setFormData({ ...formData, profesor: e.target.value })}
                    style={{ ...inp, cursor: "pointer", background: "#fff" }}
                  >
                    <option value="">— Seleccionar Docente —</option>
                    {profesoresList.length > 0 ? (
                      profesoresList.map(p => (
                        <option key={p.id} value={p.nombre}>{p.nombre} ({p.correo || p.matricula})</option>
                      ))
                    ) : (
                      <>
                        <option value="Prof. Carlos Artemio Mendoza">Prof. Carlos Artemio Mendoza</option>
                        <option value="Prof. Rafael Almonte">Prof. Rafael Almonte</option>
                        <option value="Dra. María Fernández">Dra. María Fernández</option>
                        <option value="Lic. Pedro Gómez">Lic. Pedro Gómez</option>
                      </>
                    )}
                  </select>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
                  <label style={lbl}>Aula / Sección</label>
                  <select value={formData.aula} onChange={e=>setFormData({...formData,aula:e.target.value})} style={{ ...inp, cursor:"pointer" }}>
                    <option value="">— Sin asignar —</option>
                    {SECCIONES_DEF.flatMap(n => n.secciones.map(s => {
                      const v = `${n.nivel} ${s}`;
                      return <option key={v} value={v}>{v} (cupo: {n.cupoTotal})</option>;
                    }))}
                  </select>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
                  <label style={lbl}>Horario de Clase</label>
                  <input type="text" placeholder="Ej. Lun - Vie 7:30 - 8:15 AM" value={formData.horario} onChange={e=>setFormData({...formData,horario:e.target.value})} style={inp} />
                </div>
                <div style={{ display:"flex", gap:"10px", marginTop:"16px", justifyContent:"flex-end" }}>
                  <button type="button" onClick={()=>setShowModal(false)} style={{ background:"hsl(280,15%,90%)", color:"hsl(260,20%,40%)", border:"none", padding:"10px 16px", borderRadius:"8px", fontWeight:"600", cursor:"pointer" }}>Cancelar</button>
                  <button type="submit" style={{ background:"linear-gradient(135deg,hsl(330,70%,45%),hsl(280,60%,48%))", color:"#fff", border:"none", padding:"10px 16px", borderRadius:"8px", fontWeight:"700", cursor:"pointer" }}>Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
