const PrimaryButton = ({
  label,
  type = "button",
  variant = "primary", // primary, secondary, danger, success, ghost
  size = "md", // sm, md, lg
  icon: Icon, // Pass the icon component itself
  iconPosition = "left",
  isLoading = false,
  disabled = false,
  className = "",
  onClick,
  ...props
}) => {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/70 shadow-md",
    secondary: "bg-white/10 text-white border border-white/10 hover:bg-white/20",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-md",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  const baseStyles =
    "inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 gap-2";

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin size-5 text-current" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon className="text-xl" />}
          {label}
          {Icon && iconPosition === "right" && <Icon className="text-xl" />}
        </>
      )}
    </button>
  );
};

export default PrimaryButton;
