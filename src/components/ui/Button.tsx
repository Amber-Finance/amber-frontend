import Link from "next/link";
import React, { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The variant of the button
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "gradient" | "plain";

  /**
   * The size of the button
   * @default "medium"
   */
  size?: "xs" | "small" | "medium" | "large";

  /**
   * Optional icon to display before the button text
   */
  startIcon?: ReactNode;

  /**
   * Optional icon to display after the button text
   */
  endIcon?: ReactNode;

  /**
   * Whether the button should fill its container width
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Button children/content
   */
  children: ReactNode;

  /**
   * Enable hover animation effect
   * @default false
   */
  hoverEffect?: boolean;

  /**
   * URL to navigate to when button is clicked
   * If provided, renders as a Link instead of button
   */
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  startIcon,
  endIcon,
  fullWidth = false,
  children,
  className = "",
  hoverEffect = false,
  disabled,
  href,
  ...rest
}) => {
  // Base classes that are common to all button variants
  const baseClasses =
    "font-medium rounded-md border-none cursor-pointer transition-all duration-200 flex items-center justify-center";

  // Size classes
  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    small: "px-3 py-2 text-xs",
    medium: "px-4 py-3 text-sm",
    large: "px-5 py-4 text-base",
  };

  // Variant classes
  const variantClasses = {
    primary: "bg-yellow-500 hover:bg-yellow-600 text-white",
    secondary: "bg-orange-600 hover:bg-orange-500 text-white",
    gradient:
      "bg-gradient-to-r from-orange-600 to-yellow-400 text-white hover:from-orange-700 hover:to-yellow-500",
    plain:
      "bg-orange-600 text-white dark:bg-orange-900 hover:bg-orange-300 dark:hover:bg-orange-600",
  };

  // Width class
  const widthClass = fullWidth ? "w-full" : "";

  // Hover effect class
  const hoverEffectClass = hoverEffect ? "hover:shadow-lg" : "";

  // Disabled class
  const disabledClass = disabled ? "opacity-70 pointer-events-none" : "";

  const buttonClasses = `
    ${baseClasses} 
    ${sizeClasses[size]} 
    ${variantClasses[variant]} 
    ${widthClass} 
    ${hoverEffectClass}
    ${disabledClass}
    ${className}
  `;

  const content = (
    <>
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2">{endIcon}</span>}
    </>
  );

  // If href is provided, render as a Link
  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {content}
      </Link>
    );
  }

  // Otherwise render as a regular button
  return (
    <button className={buttonClasses} disabled={disabled} {...rest}>
      {content}
    </button>
  );
};

export default Button;
