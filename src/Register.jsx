import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function Register() {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const register = () => {
    if (!user || !email || !pass) {
      alert("Por favor completa todos los campos.");
      return;
    }

    alert(`Usuario \"${user}\" registrado correctamente.`);
    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1 className="login-title">Registrar nuevo usuario</h1>

        <input
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        <button onClick={register}>Crear usuario</button>
        <button className="secondary" onClick={() => navigate("/")}>Volver al login</button>
      </div>
    </div>
  );
}

export default Register;
