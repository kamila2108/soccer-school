'use client'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        className={`
          block w-full rounded-md border px-3 py-2 shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}