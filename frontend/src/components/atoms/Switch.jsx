"use client"

import React from "react"
import { cn } from "../../lib/utils"

export default function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
  className = "",
}) {
  const handleToggle = () => {
    if (!disabled && typeof onCheckedChange === "function") {
      onCheckedChange(!checked)
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200",
        checked ? "bg-green-700" : "bg-gray-300",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-1"
        )}
      />
    </button>
  )
}
