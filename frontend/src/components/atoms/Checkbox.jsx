import React from 'react'

export default function Checkbox({ 
  label, 
  variant = 'default', 
  className = '', 
  ...props 
}) {
  const variantClasses = {
    default: 'text-blue-600 focus:ring-blue-500',
    success: 'text-green-600 focus:ring-green-500',
    danger: 'text-red-600 focus:ring-red-500'
  }

  const checkboxClasses = `h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2 ${variantClasses[variant]} ${className}`

  if (label) {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className={checkboxClasses}
          {...props}
        />
        <label htmlFor={props.id} className="text-sm text-gray-700 select-none cursor-pointer">
          {label}
        </label>
      </div>
    )
  }

  return (
    <input
      type="checkbox"
      className={checkboxClasses}
      {...props}
    />
  )
}