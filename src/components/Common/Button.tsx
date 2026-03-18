// components/Common/Button.tsx

import React from 'react';
import '../../styles/components/button.css';

export interface ButtonProps {
  label?: string;
  text?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  text,
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  style
}) => {
  const content = children || label || text || 'Button';

  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {content}
    </button>
  );
};

export default Button;
