import { useEffect, useState } from "react";
import axios from "axios";
import { registerStudent } from "../services/studentApi";
import Layout from "../Layout";

function Students() {
  const [students, setStudents] = useState([]);
  const [nombre, setNombre] = useState("");
  const [matricula, setMatricula] = useState("");
  const [correo, setCorreo] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost/api-escolar/estudiantes.php")
      .then((res) => {
        setStudents(res.data);
      })
      .catch(() => {
        setStudents([]);
      });
  }, []);
  const handleRegister = async () => {
  const result = await registerStudent({
    nombre,
    matricula,
    correo
  });

  if (result.success) {
    alert(result.message);

    setStudents([
      ...students,
      {
        id: students.length + 1,
        nombre,
        matricula,
        email: correo
      }
    ]);

    setNombre("");
    setMatricula("");
    setCorreo("");
  } else {
    alert(result.message);
  }
};

  return (
    <Layout>
      <h1>👩‍🎓 Estudiantes</h1>
      <div className="card">
  <h2>Registrar Estudiante</h2>

  <input
    type="text"
    placeholder="Nombre"
    value={nombre}
    onChange={(e) => setNombre(e.target.value)}
  />

  <input
    type="text"
    placeholder="Matrícula"
    value={matricula}
    onChange={(e) => setMatricula(e.target.value)}
  />

  <input
    type="email"
    placeholder="Correo"
    value={correo}
    onChange={(e) => setCorreo(e.target.value)}
  />

  <button onClick={handleRegister}>
    Registrar
  </button>
</div>

      <div className="grid">
        {students.length === 0 ? (
          <p style={{ color: "#d63384" }}>
            No hay datos cargados. Verifica la API o la conexión.
          </p>
        ) : (
          students.map((student) => (
            <div className="card" key={student.id}>
              <h3>{student.nombre}</h3>
              <p>Edad: {student.edad}</p>
              <p>Curso: {student.curso}</p>
              <p>Teléfono: {student.telefono}</p>
              <p>Correo: {student.email ?? "No disponible"}</p>
              <p>Grado: {student.grado ?? "No disponible"}</p>
            </div>
          ))) }
      </div>
    </Layout>
  );
}

export default Students;
