// components/Common/Button.tsx

import React from 'react';
import '../styles/Button.css';

export interface ButtonProps {
  label?: string;
  text?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  hover?: boolean;
  alpha?: number;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  text,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  hover = false,
  alpha = 1,
  className = '',
}) => {
  const displayText = label || text || 'Button';

  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        opacity: alpha,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.classList.add('btn-hover');
      }}
      onMouseLeave={(e) => {
        e.currentTarget.classList.remove('btn-hover');
      }}
    >
      {displayText}
    </button>
  );
};

export default Button;
