import React from 'react'

export default function CardHeader({ children, className = '' }) {
  return (
    <div className={`pb-4 border-b border-gray-200 mb-4 ${className}`}>
      {children}
    </div>
  )
}