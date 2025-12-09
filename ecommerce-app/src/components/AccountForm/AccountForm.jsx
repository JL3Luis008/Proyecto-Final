import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import "./AccountForm.css";

const AccountForm = ({
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    alias: "",
    email: "",
    password: "",
    isDefault: false,

  });


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);

    // Resetear formulario solo si es nuevo (no edición)
    if (!isEdit) {
      setFormData({
        alias: "",
        email: "",
        password: "",
        isDefault: false,
      });
    }
  };

  return (
    <div className="account-container">
      <div className="account-card">
        <form className="account-form" onSubmit={handleSubmit}>
          <div className="">
            <h3>Crear cuenta de usuario</h3>
            <div className="">
              <div className="form-group">
                <Input
                  label="Alias de usuario"
                  name="alias"
                  placeholder="Agrega tu nombre de usuario"
                  value={formData.alias}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <Input
                  id="email"
                  label="Email: "
                  type="email"
                  placeholder="Ingresa tu email"
                  required
                />
              </div>
              <div className="form-group">
                <Input
                  id="password"
                  label="Contraseña: "
                  type="password"
                  placeholder="Crea una contraseña"
                  required
                />

                <Input
                  label="Confirmar contraseña"
                  name="placeHolder"
                  placeholder="Confirma tu contraseña"
                  value={formData.placeHolder}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="account-footer">
                <Button type="submit">
                  Crear cuenta
                </Button>
              </div>

              <div className="account-footer">
                <Link to="/">Volver al inicio</Link>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;
