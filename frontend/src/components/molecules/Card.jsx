import React from 'react'

export default function Card({ 
  children, 
  className = '', 
  padding = 'md', 
  shadow = 'md' 
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`}
    >
      {children}
    </div>
  )
}