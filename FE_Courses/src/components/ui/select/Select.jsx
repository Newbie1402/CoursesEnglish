import React from 'react';
import { cn } from '@/lib/utils';
import { FaChevronDown } from 'react-icons/fa';

const Select = React.forwardRef(({
  className,
  children,
  error,
  icon: Icon,
  hideNativeArrow = true,
  ...props
}, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full h-10 pl-3 pr-10 text-sm rounded-md border border-gray-300",
          "bg-white text-gray-900 appearance-none",
          hideNativeArrow && "[&::-ms-expand]:hidden [background-image:none]", // remove native + plugin arrow
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        style={hideNativeArrow ? { WebkitAppearance: 'none', MozAppearance: 'none' } : undefined}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      {hideNativeArrow && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {Icon ? (
            <Icon className="w-4 h-4 text-gray-400" />
          ) : (
            <FaChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      )}
    </div>
  );
});

Select.displayName = "Select";

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <option
      ref={ref}
      className={cn("relative flex w-full cursor-default select-none py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)}
      {...props}
    >
      {children}
    </option>
  );
});

SelectItem.displayName = "SelectItem";

export { Select, SelectItem };
