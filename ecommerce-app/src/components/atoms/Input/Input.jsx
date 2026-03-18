import "./Input.css";

export default function Input({
  id,
  label,
  name,
  value,
  type = "text",
  placeholder = "",
  onChange,
  onBlur,
  error,
  showError,
  autoComplete,
  "data-cy": dataCy,
}) {
  const errorId = `${id}-error`;
  const invalid = Boolean(showError && error);
  const className = "";

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input-field ${invalid ? "isInvalid" : ""}`}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        data-cy={dataCy}
        aria-invalid={invalid ? "true" : "false"}
        aria-describedby={invalid ? errorId : undefined}
      />
      {invalid ? (
        <p className="formError" errorId>
          {error}
        </p>
      ) : null}
    </div>
  );
}
