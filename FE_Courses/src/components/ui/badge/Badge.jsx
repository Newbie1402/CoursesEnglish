import React from "react";

export const Badge = ({ children, variant, className }) => {
  let baseStyle = "inline-block px-2 py-1 text-xs rounded ";
  let variantStyle = "";

  switch (variant) {
    case "destructive":
      variantStyle = "bg-red-100 text-red-800";
      break;
    case "outline":
      variantStyle = "border border-gray-300 text-gray-800";
      break;
    default:
      variantStyle = "bg-gray-100 text-gray-800";
  }

  return <span className={`${baseStyle} ${variantStyle} ${className || ""}`}>{children}</span>;
};
