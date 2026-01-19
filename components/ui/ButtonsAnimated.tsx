import React from 'react';

interface ShineButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string; // Permitimos extender estilos si es necesario
}
interface AnimatedButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  width?: string;
  height?: string;
  fontSize?: string;
  buttonColor?: string;
  containerColor?: string;
  borderColor?: string;
  iconColor?: string;
  textColor?: string;
}

export const ShineButton: React.FC<ShineButtonProps> = ({
  onClick,
  children,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        /* Layout y Texto */
        relative flex items-center justify-center px-4 py-2 text-base font-medium rounded-lg
        text-white cursor-pointer overflow-hidden z-0
        
        /* Bordes y Sombras */
        border-2 border-cyan-800 shadow-md
        
        /* Transiciones */
        transition-all duration-500 ease-in-out transform
        
        /* Hover y Focus */
        hover:scale-105 hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-500/50
        focus:outline-none
        
        /* Efecto Background (Pseudo-elemento before) */
        before:absolute before:top-0 before:-left-full before:w-full before:h-full 
        before:bg-gradient-to-r before:from-[#00A3E2] before:to-[#004d66] 
        before:transition-all before:duration-500 before:ease-in-out before:z-[-1]
        hover:before:left-0
        
        /* Estado Deshabilitado */
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        
        ${className}
      `}
      style={{
        background: '#00a2e2df',
      }}
    >
      {children}
    </button>
  );
};

export const ReturnButton: React.FC<AnimatedButtonProps> = ({
  onClick,
  children = "Go Back",
  disabled = false,
  type = "button",
  className = "",
  width = "w-48",
  height = "h-14",
  fontSize = "text-xl",
  buttonColor = "bg-white",
  containerColor = "bg-cyan-400",
  borderColor = "",
  iconColor = "#000000",
  textColor = "",
}) => {
  // Helper to determine if a value is a Tailwind class or a raw color
  const isTailwindClass = (val: string) => val.startsWith("bg-") || val.startsWith("text-") || val.startsWith("border-");

  const buttonStyle: React.CSSProperties = {};

  if (buttonColor && !isTailwindClass(buttonColor)) {
    buttonStyle.backgroundColor = buttonColor;
  }

  if (borderColor && !isTailwindClass(borderColor)) {
    buttonStyle.borderColor = borderColor;
  }

  if (textColor && !isTailwindClass(textColor)) {
    buttonStyle.color = textColor;
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
      className={`
        group relative text-center rounded-2xl 
        font-semibold overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        ${width} ${height} ${fontSize} 
        ${isTailwindClass(buttonColor) ? buttonColor : ""}
        ${borderColor ? 'border-1' : ''}
        ${isTailwindClass(borderColor) ? borderColor : ""}
        ${isTailwindClass(textColor) ? textColor : ""}
        ${className}
      `}
    >
      {/* Contenedor del Icono (El que se expande) */}
      <div className={`
        absolute left-1 top-1 z-10
        flex items-center justify-center 
        rounded-lg h-[calc(100%-8px)] w-1/4 
        duration-500 group-hover:w-[calc(100%-8px)]
        group-disabled:group-hover:w-1/4
        ${isTailwindClass(containerColor) ? containerColor : ""}
      `}
        style={!isTailwindClass(containerColor) ? { backgroundColor: containerColor } : {}}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1024 1024"
          height="25px"
          width="25px"
          className="transition-transform duration-500"
        >
          <path d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z" fill={iconColor} />
          <path d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z" fill={iconColor} />
        </svg>
      </div>

      {/* Texto del Botón */}
      <p className={`translate-x-2 transition-all duration-500 group-hover:text-black ${!textColor ? 'text-black' : ''}`}>
        {children}
      </p>
    </button>
  );
};

export default ShineButton;