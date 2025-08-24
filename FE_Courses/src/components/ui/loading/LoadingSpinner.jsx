import React from "react";
import { cn } from "@/lib/utils";

/**
 * LoadingSpinner - Spinner loading chuẩn Tailwind, dễ tái sử dụng
 * @param {string} size - md (mặc định), sm, lg, hoặc số pixel
 * @param {string} className - custom class Tailwind
 * @param {string} color - màu sắc, vd: text-blue-600
 * @param {string} label - text hiển thị dưới spinner
 */
const sizeMap = {
  sm: "w-5 h-5 border-2",
  md: "w-8 h-8 border-4",
  lg: "w-12 h-12 border-4",
};

const LoadingSpinner = ({ size = "md", className = "", color = "text-blue-600", label = "" }) => {
  const sizeClass = sizeMap[size] || `w-${size} h-${size} border-4`;
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div
        className={cn(
          "rounded-full border-b-transparent border-solid animate-spin",
          sizeClass,
          color,
          "border-current"
        )}
        style={{ borderRightColor: "transparent" }}
      />
      {label && <span className="mt-2 text-sm text-gray-600">{label}</span>}
    </div>
  );
};

export default LoadingSpinner;

