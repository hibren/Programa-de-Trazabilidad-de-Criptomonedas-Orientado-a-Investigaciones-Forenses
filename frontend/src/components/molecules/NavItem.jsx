"use client"

import Icon from "../atoms/Icon"
import { cn } from "../../lib/utils"

const NavItem = ({ icon, label, active = false, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-colors",
        active ? "bg-green-900 text-white" : "text-green-200 hover:bg-green-900 hover:text-white",
        className,
      )}
    >
      <Icon name={icon} size={20} />
      <span className="font-medium">{label}</span>
    </button>
  )
}

export default NavItem
