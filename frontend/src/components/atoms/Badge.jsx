import { cn } from "../../lib/utils"

const Badge = ({ children, variant = "default", className, ...props }) => {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    success: "bg-green-100 text-green-800 hover:bg-green-200",
    danger: "bg-red-100 text-red-800 hover:bg-red-200",
    warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    outline: "text-foreground border border-input",
  }

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </div>
  )
}

export default Badge
