import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { checkEmail } from "../../services/auth";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage/ErrorMessage";
import Input from "../common/Input";
import "./RegisterForm.css";

export default function RegisterForm({ onSuccess }) {
  // =========================
  // State del formulario
  // =========================
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setverifyPassword] = useState("");

  // UX state
  const [error, setError] = useState("");
  const [emailCheck, setEmailCheck] = useState({ status: "idle", message: "" });

  // Navegación
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  // =========================
  // Helpers de validación
  // =========================
  const isValidEmail = (value) => {
    const v = value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };

  const validateForm = () => {
    // Limpiar el error
    setError("");
    if (!displayName.trim()) {
      setError("Tu nombre es obligatorio");
      return false;
    }
    if (!isValidEmail(email)) {
      setError("Parece que el email que capturaste cono es correcto");
      return false;
    }
    if (password.length < 8) {
      setError("La contraseña debe de tener al menos 8 caracteres.");
      return false;
    }
    if (password !== verifyPassword) {
      setError("Tus contraseñas no coinciden.");
      return false;
    }
    if (emailCheck.status === "taken") {
      setError("Ese email ya está registrado");
      return false;
    }
    return true;
  };

  const setCustomMessage = (e, messages) => {
    const input = e.target;
    const { validity } = input;

    if (validity.valueMissing && messages.valueMissing) {
      input.setCustomValidity(messages.valueMissing);
      return;
    }

    if (validity.typeMismatch && messages.typeMismatch) {
      input.setCustomValidity(messages.typeMismatch);
      return;
    }

    if (validity.tooShort && messages.tooShort) {
      input.setCustomValidity(messages.tooShort);
      return;
    }

    input.setCustomValidity(messages.default ?? "Campo inválido");
  };

  const clearCustomMessage = (e) => {
    e.target.setCustomValidity("");
  };

  const runEmailAvailabilityCheck = async (emailValue, inputEl) => {
    console.log(emailValue, inputEl);
    console.log(emailCheck);
    const value = emailValue.trim();
    if (!isValidEmail(value)) {
      setEmailCheck({ status: "idle", message: "" });
      inputEl?.setCustomValidity("Invalid mail");
      return;
    }
    setEmailCheck({ status: "checking", message: "Validando email..." });
    console.log(emailCheck);
    const taken = await checkEmail(value);
    if (taken === null) {
      setEmailCheck({ status: "idle", message: "" });
      inputEl?.setCustomValidity("");
      return;
    } else if (taken) {
      console.log(taken);
      setEmailCheck({
        status: "taken",
        message: "Ese mail ya está registrado.",
      });
      inputEl?.setCustomValidity("Ese mail ya está registrado.");
      console.log(emailCheck);
    } else {
      setEmailCheck({ status: "available", message: "Email disponible." });
      inputEl?.setCustomValidity("");
      console.log(emailCheck);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }

    if (!validateForm()) return;

    const userData = {
      displayName: displayName.trim(),
      email: email.trim().toLowerCase(),
      password,
    };

    const result = await register(userData);

    if (result.success) {
      navigate("/login", {
        state: {
          message: "Registro exitoso. Por favor inicia sesión.",
          email: userData.email,
        },
      });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Registrar usuario</h2>
        <form className="register-form" onSubmit={onSubmit}>
          {/* Display name */}
          <div className="form-group">
            <Input
              id="displayName"
              label="Display Name: "
              type="text"
              value={displayName}
              onChange={(e) => {
                clearCustomMessage(e);
                setDisplayName(e.target.value);
              }}
              placeholder="Ingresa tu nombre completo"
              required
              onInvalid={(e) =>
                setCustomMessage(e, {
                  valueMissing: "El nombre es obligatorio",
                  default: "Captura un nombre válido.",
                })
              }
              onInput={clearCustomMessage}
            />
          </div>
          {/* Email */}
          <div className="form-group">
            <Input
              id="email"
              label="Email: "
              type="email"
              value={email}
              onChange={(e) => {
                clearCustomMessage(e);
                setEmail(e.target.value);
              }}
              placeholder="Ingresa tu email"
              required
              onBlur={(e) => {
                //Aqui vamos a validar con la API
                runEmailAvailabilityCheck(e.target.value, e.target);
              }}
              onFocus={() => {
                // SOlo UX: limpiamos estado y mensajes anteriores
                setEmailCheck({ status: "idle", message: "" });
              }}
              onInvalid={(e) =>
                setCustomMessage(e, {
                  valueMissing: "El email es obligatorio",
                  typeMismatch:
                    "Ese email no parece válido. Ej: nombre@dominio.com",
                  default: "Captura un email válido",
                })
              }
            />
          </div>
          {/* Password */}
          <div className="form-group">
            <Input
              id="password"
              label="Contraseña: "
              type="password"
              value={password}
              onChange={(e) => {
                clearCustomMessage(e);
                setPassword(e.target.value);
              }}
              placeholder="Ingresa tu contraseña"
              required
              minLength={8}
              onInvalid={(e) =>
                setCustomMessage(e, {
                  valueMissing: "La contraseña es obligatoria.",
                  tooShort: "La contraseña debe tener al menos 8 caracteres.",
                  default: "Captura una contraseña válida",
                })
              }
              onInput={clearCustomMessage}
            />
          </div>
          {/* Verify Password*/}
          <div className="form-group">
            <Input
              id="verifyPassword"
              label="Repite tu contraseña: "
              type="password"
              value={verifyPassword}
              onChange={(e) => {
                clearCustomMessage(e);
                setverifyPassword(e.target.value);
              }}
              placeholder="Ingresa nuevamente tu contraseña"
              required
              minLength={8}
              onInvalid={(e) => {
                setCustomMessage(e, {
                  valueMissing: "Repite tu contraseña.",
                  tooShort: "La contraseña debe tener al menos 8 caracteres.",
                  default: "Confirma tu contraseña correctamente.",
                });
              }}
              onInput={clearCustomMessage}
            />
          </div>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button disabled={loading} type="submit" variant="primary">
            {loading ? "Registrando..." : "Registrar"}
          </Button>
        </form>
        <div className="register-footer">
          <Link to="/">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
