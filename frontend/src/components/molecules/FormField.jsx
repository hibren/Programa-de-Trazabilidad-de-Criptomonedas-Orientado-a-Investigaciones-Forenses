export default function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  required,
  error,
  helperText,
  children,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {children || (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          className={`w-full border border-gray-300 rounded-md focus:outline-none ${
            error ? 'border-red-500' : ''
          } ${inputClassName}`}
          {...props}
        />
      )}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
