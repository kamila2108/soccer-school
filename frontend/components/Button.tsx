'use client'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline'
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const baseClass =
    'inline-flex items-center justify-center rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition'

  const variantClass =
    variant === 'primary'
      ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
      : variant === 'outline'
      ? 'bg-white text-green-600 border border-green-600 hover:bg-green-50 focus:ring-green-500'
      : 'bg-white text-green-600 border border-green-600 hover:bg-green-50 focus:ring-green-500'

  return (
    <button
      className={`${baseClass} ${variantClass} px-4 py-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}