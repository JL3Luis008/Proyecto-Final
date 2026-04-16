import "./Input.css";

export default function Input({
  id,
  label,
  value,
  type = "text",
  placeholder = "",
  error,
  showError,
  className = "",
  ...rest
}) {
  const errorId = `${id}-error`;
  const invalid = Boolean(showError && error);

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input
        {...rest}
        id={id}
        className={`input-field ${invalid ? "isInvalid" : ""}`}
        type={type}
        value={value}
        placeholder={placeholder}
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
