import { ArrowLeft, ArrowRight } from 'lucide-react';
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
        <ArrowLeft className="w-7 h-7" color="#000000ff"/>
      </div>

      {/* Texto del Botón */}
      <p className={`translate-x-2 transition-all duration-500 group-hover:text-black ${!textColor ? 'text-black' : ''}`}>
        {children}
      </p>
    </button>
  );
};

interface SparkleButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  // Nuevas props de personalización
  hoverFrom?: string;   // Color inicio degradado (ej: "#A47CF3")
  hoverTo?: string;     // Color fin degradado (ej: "#683FEA")
  shadowColor?: string; // Color del resplandor (ej: "#9917FF")
}

export const SparkleButton: React.FC<SparkleButtonProps> = ({
  onClick,
  children = "Generate",
  disabled = false,
  className = "",
  hoverFrom = "#A47CF3",
  hoverTo = "#683FEA",
  shadowColor = "#9917FF",
}) => {
  // Definimos las variables de CSS para usarlas dentro de las clases de Tailwind
  const dynamicStyles = {
    '--hover-from': hoverFrom,
    '--hover-to': hoverTo,
    '--shadow-color': shadowColor,
  } as React.CSSProperties;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={dynamicStyles}
      className={`
        group relative flex items-center justify-center gap-[12px]
        w-[15em] h-[5em] border-none rounded-[3em]
        bg-[#1C1A1C] cursor-pointer transition-all duration-[450ms] ease-in-out
        
        /* Degradado dinámico usando las variables */
        hover:bg-[linear-gradient(0deg,var(--hover-from),var(--hover-to))]
        hover:-translate-y-0.5
        
        /* Sombra dinámica usando la variable --shadow-color */
        hover:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.4),inset_0px_-4px_0px_0px_rgba(0,0,0,0.2),0px_0px_28px_0px_var(--shadow-color)]
        
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <svg
        height="24"
        width="24"
        viewBox="0 0 24 24"
        className="fill-[#AAAAAA] transition-all duration-[800ms] ease-in-out group-hover:fill-white group-hover:scale-[1.2]"
      >
        <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
      </svg>

      <span className="text-[#ffffff] font-semibold text-base transition-colors duration-[450ms] group-hover:text-white">
        {children}
      </span>
    </button>
  );
};

export default ShineButton;