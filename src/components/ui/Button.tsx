// src/components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
  }
  
  export const Button: React.FC<ButtonProps> = ({ 
    children, 
    variant = 'primary', 
    className = '',
    ...props 
  }) => {
    return (
      <button
        className={`
          px-4 py-2 rounded-md transition-colors
          ${variant === 'primary' 
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  };