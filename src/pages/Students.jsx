import { useEffect, useState } from "react";
import { getStudents, registerStudent, deleteStudent, archiveStudent, unarchiveStudent } from "../services/studentApi";
import Layout from "../Layout";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";

function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  
  // Form fields
  const [nombre, setNombre] = useState("");
  const [matricula, setMatricula] = useState("");
  const [correo, setCorreo] = useState("");
  const [horasPlanificadas, setHorasPlanificadas] = useState("");
  
  // UI States
  const [activeTab, setActiveTab] = useState("estudiantes"); // estudiantes, profesores, archivo
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const result = await getStudents();
      setStudents(result.students || []);
    } catch (error) {
      console.error("Error al obtener personas:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los registros de la base de datos.",
        icon: "error",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRegister = async (tipo) => {
    if (!nombre || !matricula || !correo) {
      return Swal.fire({
        title: "Campos Incompletos",
        text: "Completa todos los campos obligatorios antes de registrar.",
        icon: "warning",
        confirmButtonColor: "hsl(250, 75%, 59%)",
      });
    }

    if (tipo === "Profesor" && (!horasPlanificadas || isNaN(Number(horasPlanificadas)) || Number(horasPlanificadas) <= 0)) {
      return Swal.fire({
        title: "Horas Planificadas Inválidas",
        text: "Ingresa un número de horas planificadas válido para el profesor.",
        icon: "warning",
        confirmButtonColor: "hsl(250, 75%, 59%)",
      });
    }

    setLoading(true);
    try {
      const result = await registerStudent({
        nombre,
        matricula,
        correo,
        tipo,
        horasPlanificadas: tipo === "Profesor" ? Number(horasPlanificadas) : null,
      });

      if (result.success) {
        Swal.fire({
          title: "Registro Exitoso",
          text: result.message,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        setNombre("");
        setMatricula("");
        setCorreo("");
        setHorasPlanificadas("");
        fetchStudents();
      } else {
        Swal.fire({
          title: "Error al Registrar",
          text: result.message,
          icon: "error",
          confirmButtonColor: "hsl(250, 75%, 59%)",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error en el servidor al guardar el registro.",
        icon: "error",
      });
    }
    setLoading(false);
  };

  const handleArchive = async (id, nombre, tipo) => {
    Swal.fire({
      title: `¿Archivar a ${nombre}?`,
      text: `El ${tipo.toLowerCase()} se moverá a la pestaña de Archivo General y no aparecerá en las listas activas.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, archivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "hsl(38, 92%, 50%)",
      cancelButtonColor: "hsl(215, 16%, 47%)",
    }).then(async (res) => {
      if (res.isConfirmed) {
        setLoading(true);
        try {
          const result = await archiveStudent(id);
          if (result.success) {
            Swal.fire({
              title: "Archivado",
              text: result.message,
              icon: "success",
              timer: 1200,
              showConfirmButton: false,
            });
            fetchStudents();
          } else {
            Swal.fire("Error", result.message, "error");
          }
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
        }
        setLoading(false);
      }
    });
  };

  const handleUnarchive = async (id, nombre) => {
    Swal.fire({
      title: `¿Restaurar a ${nombre}?`,
      text: "El registro volverá a estar activo y aparecerá en las listas correspondientes.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, restaurar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "hsl(250, 75%, 59%)",
      cancelButtonColor: "hsl(215, 16%, 47%)",
    }).then(async (res) => {
      if (res.isConfirmed) {
        setLoading(true);
        try {
          const result = await unarchiveStudent(id);
          if (result.success) {
            Swal.fire({
              title: "Restaurado",
              text: result.message,
              icon: "success",
              timer: 1200,
              showConfirmButton: false,
            });
            fetchStudents();
          } else {
            Swal.fire("Error", result.message, "error");
          }
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
        }
        setLoading(false);
      }
    });
  };

  const handleDeletePermanent = async (id, nombre) => {
    Swal.fire({
      title: `¿Eliminar a ${nombre}?`,
      text: "¡Esta acción es irreversible y se borrará definitivamente de la base de datos XAMPP!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "hsl(350, 89%, 60%)",
      cancelButtonColor: "hsl(215, 16%, 47%)",
    }).then(async (res) => {
      if (res.isConfirmed) {
        setLoading(true);
        try {
          const result = await deleteStudent(id);
          if (result.success) {
            Swal.fire({
              title: "Eliminado",
              text: "Registro eliminado permanentemente de la base de datos.",
              icon: "success",
              timer: 1200,
              showConfirmButton: false,
            });
            fetchStudents();
          } else {
            Swal.fire("Error", result.message, "error");
          }
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
        }
        setLoading(false);
      }
    });
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header Background
      doc.setFillColor(79, 70, 229); // Indigo HSL equivalent
      doc.rect(0, 0, 210, 38, "F");
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("SISTEMA DE GESTIÓN ESCOLAR", 15, 16);
      
      // Subtitle
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Reporte Oficial de Alumnos y Docentes • Generado el: ${new Date().toLocaleDateString()}`, 15, 24);
      
      // Counters
      const estActivos = students.filter(s => s.tipo === "Estudiante" && !s.archivado);
      const profActivos = students.filter(s => s.tipo === "Profesor" && !s.archivado);
      const archivados = students.filter(s => s.archivado);
      
      doc.setFontSize(9);
      doc.text(`Total Activos: ${estActivos.length + profActivos.length} | Estudiantes: ${estActivos.length} | Profesores: ${profActivos.length} | Archivados: ${archivados.length}`, 15, 31);

      // Body setup
      doc.setTextColor(15, 23, 42); // Slate text
      let y = 48;

      // 1. Estudiantes Activos Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("1. Estudiantes Activos", 15, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      if (estActivos.length === 0) {
        doc.text("No hay estudiantes activos registrados en este momento.", 15, y);
        y += 10;
      } else {
        estActivos.forEach((item, index) => {
          if (y > 275) { doc.addPage(); y = 20; }
          doc.text(`${index + 1}. Nombre: ${item.nombre} | Matrícula: ${item.matricula} | Correo: ${item.correo}`, 15, y);
          y += 7;
        });
        y += 6;
      }

      // 2. Profesores Activos Section
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("2. Profesores Activos", 15, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      if (profActivos.length === 0) {
        doc.text("No hay profesores activos registrados en este momento.", 15, y);
        y += 10;
      } else {
        profActivos.forEach((item, index) => {
          if (y > 275) { doc.addPage(); y = 20; }
          doc.text(`${index + 1}. Nombre: ${item.nombre} | Matrícula: ${item.matricula} | Correo: ${item.correo} | Horas Planificadas: ${item.horasPlanificadas} hrs`, 15, y);
          y += 7;
        });
        y += 6;
      }

      // 3. Archivados Section
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("3. Registros Archivados", 15, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      if (archivados.length === 0) {
        doc.text("No hay registros archivados en el sistema.", 15, y);
      } else {
        archivados.forEach((item, index) => {
          if (y > 275) { doc.addPage(); y = 20; }
          doc.text(`${index + 1}. [${item.tipo}] Nombre: ${item.nombre} | Matrícula: ${item.matricula} | Correo: ${item.correo}`, 15, y);
          y += 7;
        });
      }

      doc.save(`Reporte_Escolar_${new Date().toISOString().split('T')[0]}.pdf`);
      
      Swal.fire({
        title: "Archivo PDF Creado",
        text: "El archivo ha sido generado y descargado exitosamente.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Ocurrió un error al intentar generar el archivo PDF.", "error");
    }
  };

  // Filtering data logic
  const searchFilter = (item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.nombre.toLowerCase().includes(query) ||
      item.matricula.toLowerCase().includes(query) ||
      item.correo.toLowerCase().includes(query)
    );
  };

  // Categorize lists
  const activeStudents = students.filter((item) => item.tipo === "Estudiante" && !item.archivado).filter(searchFilter);
  const activeTeachers = students.filter((item) => item.tipo === "Profesor" && !item.archivado).filter(searchFilter);
  const archivedRecords = students.filter((item) => item.archivado).filter(searchFilter);

  // Global counts (independent of search query)
  const studentCount = students.filter((item) => item.tipo === "Estudiante" && !item.archivado).length;
  const teacherCount = students.filter((item) => item.tipo === "Profesor" && !item.archivado).length;
  const archivedCount = students.filter((item) => item.archivado).length;
  const totalPlannedHours = students
    .filter((item) => item.tipo === "Profesor" && !item.archivado)
    .reduce((sum, item) => sum + (item.horasPlanificadas || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="mod-shell">
        {/* Hero Banner with img_ctrl_escolar background */}
        <section className="mod-hero mod-hero--rose">
          <div className="mod-hero__bg" style={{ backgroundImage: "url('/img_ctrl_escolar.png')" }} />
          <div className="mod-hero__overlay" style={{ background: "linear-gradient(135deg, hsl(330, 60%, 20%, 0.82) 0%, hsl(280, 50%, 25%, 0.65) 50%, hsl(330, 40%, 18%, 0.55) 100%)" }} />
          <div className="mod-hero__content">
            <span className="mod-eyebrow">👩‍🎓 Panel de Control</span>
            <h1>Control Escolar</h1>
            <p>Administra y consulta los registros oficiales de estudiantes y docentes activos, horas planificadas y archivo general.</p>
            
            <div className="mod-hero__stats">
              <div className="mod-hero-stat">
                <strong>{studentCount}</strong>
                <span>Estudiantes Activos</span>
              </div>
              <div className="mod-hero-stat">
                <strong>{teacherCount}</strong>
                <span>Profesores Activos</span>
              </div>
              <div className="mod-hero-stat">
                <strong>{totalPlannedHours} hrs</strong>
                <span>Carga Horaria Docente</span>
              </div>
              <div className="mod-hero-stat">
                <strong>{archivedCount}</strong>
                <span>Archivados</span>
              </div>
            </div>
          </div>
          <div className="mod-hero__actions">
            <button className="mod-btn mod-btn--ghost" onClick={() => navigate("/dashboard")}>
              ← Inicio
            </button>
            <button className="mod-btn mod-btn--ghost" onClick={handleExportPDF}>
              📄 Exportar PDF
            </button>
            <button className="mod-btn mod-btn--ghost" onClick={handlePrint}>
              🖨️ Imprimir
            </button>
          </div>
        </section>

        {/* Modern Horizontal Controls and Filtering Bar */}
        <div className="mod-toolbar">
          <div className="mod-search">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" className="mod-search__icon">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, matrícula o correo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="mod-filter-pills">
            <button
              className={`mod-filter-pill ${activeTab === "estudiantes" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("estudiantes");
                setSearchQuery("");
              }}
            >
              👩‍🎓 Estudiantes ({studentCount})
            </button>
            <button
              className={`mod-filter-pill ${activeTab === "profesores" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("profesores");
                setSearchQuery("");
              }}
            >
              👨‍🏫 Profesores ({teacherCount})
            </button>
            <button
              className={`mod-filter-pill ${activeTab === "archivo" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("archivo");
                setSearchQuery("");
              }}
            >
              📁 Archivo General ({archivedCount})
            </button>
          </div>
        </div>

        {/* Dedicated Contextual Registration Form */}
        {activeTab !== "archivo" && (
          <div className="form-card">
            <h2>Registrar Nuevo {activeTab === "estudiantes" ? "Estudiante" : "Profesor"}</h2>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Nombre Completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <input
                type="text"
                placeholder="Matrícula Académica"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
              />
              <input
                type="email"
                placeholder="Correo Electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
              {activeTab === "profesores" && (
                <input
                  type="number"
                  min="1"
                  placeholder="Horas Planificadas"
                  value={horasPlanificadas}
                  onChange={(e) => setHorasPlanificadas(e.target.value)}
                />
              )}
            </div>
            <button
              className="primary-button"
              style={{ width: "auto", minWidth: "180px" }}
              onClick={() => handleRegister(activeTab === "estudiantes" ? "Estudiante" : "Profesor")}
              disabled={loading}
            >
              Registrar {activeTab === "estudiantes" ? "Estudiante" : "Profesor"}
            </button>
          </div>
        )}

        {/* Results Lists */}
        {loading && students.length === 0 ? (
          <div className="card info-card">
            <h3>Cargando registros...</h3>
            <p>Por favor espera un momento mientras sincronizamos los datos.</p>
          </div>
        ) : (
          <div>
            {activeTab === "estudiantes" && (
              <div className="grid">
                {activeStudents.length === 0 ? (
                  <div className="card info-card" style={{ gridColumn: "1 / -1" }}>
                    <h3>Sin estudiantes activos</h3>
                    <p>{searchQuery ? "No se encontraron estudiantes que coincidan con la búsqueda." : "Registra un estudiante para comenzar."}</p>
                  </div>
                ) : (
                  activeStudents.map((item) => (
                    <div className="card" key={item.id}>
                      <div className="card-header">
                        <div>
                          <h3 style={{ color: "var(--primary)" }}>{item.nombre}</h3>
                          <span className="tiny-text">Matrícula: {item.matricula}</span>
                        </div>
                        <span className="badge badge-active">Activo</span>
                      </div>
                      <p><strong>Correo:</strong> {item.correo}</p>
                      
                      <div style={{ display: "flex", gap: "10px", marginTop: "16px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                        <button
                          className="secondary-button"
                          style={{ flex: 1, padding: "8px" }}
                          onClick={() => handleArchive(item.id, item.nombre, "Estudiante")}
                        >
                          📦 Archivar
                        </button>
                        <button
                          className="delete-button"
                          style={{ flex: 1 }}
                          onClick={() => handleDeletePermanent(item.id, item.nombre)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "profesores" && (
              <div className="grid">
                {activeTeachers.length === 0 ? (
                  <div className="card info-card" style={{ gridColumn: "1 / -1" }}>
                    <h3>Sin profesores activos</h3>
                    <p>{searchQuery ? "No se encontraron profesores que coincidan con la búsqueda." : "Registra un profesor para comenzar."}</p>
                  </div>
                ) : (
                  activeTeachers.map((item) => (
                    <div className="card" key={item.id}>
                      <div className="card-header">
                        <div>
                          <h3 style={{ color: "var(--primary)" }}>{item.nombre}</h3>
                          <span className="tiny-text">ID Matrícula: {item.matricula}</span>
                        </div>
                        <span className="badge badge-active">Activo</span>
                      </div>
                      <p><strong>Correo:</strong> {item.correo}</p>
                      <p style={{ marginTop: "6px" }}>
                        <strong>Carga Horaria:</strong> <span style={{ fontWeight: 600, color: "var(--primary)" }}>{item.horasPlanificadas} horas</span>
                      </p>
                      
                      <div style={{ display: "flex", gap: "10px", marginTop: "16px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                        <button
                          className="secondary-button"
                          style={{ flex: 1, padding: "8px" }}
                          onClick={() => handleArchive(item.id, item.nombre, "Profesor")}
                        >
                          📦 Archivar
                        </button>
                        <button
                          className="delete-button"
                          style={{ flex: 1 }}
                          onClick={() => handleDeletePermanent(item.id, item.nombre)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "archivo" && (
              <div className="grid">
                {archivedRecords.length === 0 ? (
                  <div className="card info-card" style={{ gridColumn: "1 / -1" }}>
                    <h3>Archivo vacío</h3>
                    <p>{searchQuery ? "No se encontraron registros archivados que coincidan con la búsqueda." : "No hay estudiantes o profesores archivados."}</p>
                  </div>
                ) : (
                  archivedRecords.map((item) => (
                    <div className="card" key={item.id} style={{ opacity: 0.85 }}>
                      <div className="card-header">
                        <div>
                          <h3 style={{ color: "var(--text-muted)" }}>{item.nombre}</h3>
                          <span className="tiny-text">Matrícula: {item.matricula}</span>
                        </div>
                        <span className="badge badge-archived">{item.tipo}</span>
                      </div>
                      <p><strong>Correo:</strong> {item.correo}</p>
                      {item.tipo === "Profesor" && (
                        <p style={{ marginTop: "6px" }}><strong>Horas:</strong> {item.horasPlanificadas} hrs</p>
                      )}
                      
                      <div style={{ display: "flex", gap: "10px", marginTop: "16px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                        <button
                          className="secondary-button"
                          style={{ flex: 1, padding: "8px", borderColor: "var(--primary-light)", color: "var(--primary)" }}
                          onClick={() => handleUnarchive(item.id, item.nombre)}
                        >
                          ♻️ Restaurar
                        </button>
                        <button
                          className="delete-button"
                          style={{ flex: 1 }}
                          onClick={() => handleDeletePermanent(item.id, item.nombre)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Students;
