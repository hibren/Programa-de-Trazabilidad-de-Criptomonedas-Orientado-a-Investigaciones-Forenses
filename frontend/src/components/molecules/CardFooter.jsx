import React from 'react'

export default function CardFooter({ children, className = '' }) {
  return (
    <div className={`pt-4 border-t border-gray-200 mt-4 ${className}`}>
      {children}
    </div>
  )
}