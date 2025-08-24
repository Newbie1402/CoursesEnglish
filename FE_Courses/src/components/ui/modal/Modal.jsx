import React from 'react';
import { cn } from '@/lib/utils';
import { FaTimes } from 'react-icons/fa';

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  className,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-40 flex items-center justify-center"
        onClick={onClose}
        aria-label="Đóng modal"
      />
      {/* Modal content */}
      <div
        className={cn(
          `fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full sm:w-auto p-4 sm:p-6 rounded-lg bg-white shadow-lg border border-gray-200 flex flex-col ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`,
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Đóng"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
};

export default Modal;
