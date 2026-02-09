import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
}

export default function Button({ 
  children, 
  onClick, 
  href, 
  variant = 'primary',
  className = '' 
}: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition duration-200'
  
  const variantClasses = {
    primary: 'bg-green-600 text-white hover:bg-green-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50'
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  )
}