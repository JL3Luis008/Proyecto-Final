import React from "react";
import "./Button.css";

export default function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  size = "base",
  className = "",
  "data-cy": dataCy,
}) {
  const buttonClasses = [
    "btn",
    `btn-${variant}`,
    size !== "base" ? `btn-${size}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      data-cy={dataCy}
    >
      {children}
    </button>
  );
}
