export default function Card({ children, title, className = "",titleDescription }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {titleDescription && <p className="text-xs text-muted-foreground mt-2">{titleDescription}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
