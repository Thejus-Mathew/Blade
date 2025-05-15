import LoadingSpinner from "./loading-spinner"

export default function Button({
  children,
  variant = "primary",
  size = "medium",
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50"

  const variantClasses = {
    primary: "bg-purple-600 text-white hover:bg-purple-700 focus-visible:ring-purple-600",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
    outline: "border border-gray-300 bg-transparent focus-visible:ring-gray-500",
  }

  const sizeClasses = {
    small: "text-xs px-2.5 py-1.5",
    medium: "text-sm px-4 py-2",
    large: "text-base px-6 py-3",
  }

  const widthClass = fullWidth ? "w-full" : ""

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="small" />
        </>
      ) : (
        children
      )}
    </button>
  )
}
