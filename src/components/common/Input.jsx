import { useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

const Input = ({
  label,
  icon: Icon,
  error,
  touched,
  className = "",
  id,
  type = "text", // Default type
  required = false,
  options = [], // for type="select": [{ value, label }]
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isError = touched && error;

  if (type === "checkbox") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          id={id}
          type="checkbox"
          className={`size-4 rounded-sm border-white/10 bg-white/5 text-primary focus:ring-primary/20 focus:ring-2 focus:ring-offset-0 outline-none transition-all cursor-pointer ${
            isError ? "border-red-500/50" : ""
          }`}
          {...props}
        />
        {label && (
          <label htmlFor={id} className="text-sm text-gray-300 cursor-pointer select-none">
            {label}
            {required && <span className="text-red-500 font-bold ms-1">*</span>}
          </label>
        )}
        {isError && <span className="text-xs text-red-400 ms-auto">{error}</span>}
      </div>
    );
  }

  const baseInputStyles = `
    w-full bg-white/5 border rounded-xl py-3 text-white transition-all outline-none scheme-dark
    ${Icon ? "pl-10" : "pl-4"} pr-12
    ${
      isError
        ? "border-red-500/50 focus:border-red-500 ring-1 ring-red-500/20"
        : "border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20"
    }
  `;

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <textarea id={id} className={`${baseInputStyles} min-h-30 resize-none`} {...props} />
        );

      case "password":
        return (
          <div className="relative w-full">
            <input
              id={id}
              // Toggle type between 'password' and 'text'
              type={showPassword ? "text" : "password"}
              className={baseInputStyles}
              {...props}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors z-20 p-1"
            >
              {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
            </button>
          </div>
        );

      case "select":
        return (
          <select id={id} className={baseInputStyles} {...props}>
            {options.map((opt) => (
              // The popup option list ignores the select's text color, so style
              // each option explicitly (dark bg + light text) for visibility.
              <option key={opt.value} value={opt.value} className="bg-elevated text-ink">
                {opt.label}
              </option>
            ))}
          </select>
        );

      default:
        return <input id={id} type={type} className={baseInputStyles} {...props} />;
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-300 ms-1 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div
            className={`absolute inset-s-3 top-1/2 -translate-y-1/2 transition-colors duration-200 z-10
              ${isError ? "text-red-400" : "text-gray-500"}`}
          >
            <Icon size={20} />
          </div>
        )}

        {renderInput()}
      </div>

      {isError && <span className="ms-1 text-xs text-red-400">{error}</span>}
    </div>
  );
};

export default Input;
