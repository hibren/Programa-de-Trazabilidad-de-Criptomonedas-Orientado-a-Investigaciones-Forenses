import React from 'react'
import Label from '../atoms/Label'
import Input from '../atoms/Input'

export default function FormField({
  id,
  label,
  type = 'text',
  placeholder,
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
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        className={`w-full ${error ? 'border-red-500 focus:ring-red-500' : ''} ${inputClassName}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}