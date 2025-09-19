import React from 'react'
import Label from '../atoms/Label'
import PasswordInput from '../atoms/PasswordInput'

export default function PasswordField({
  id,
  label,
  placeholder = '••••••••',
  required,
  error,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <PasswordInput
        id={id}
        placeholder={placeholder}
        className={`w-full border border-gray-300 rounded-md focus:outline-none ${error ? 'border-red-500' : ''} ${inputClassName}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
