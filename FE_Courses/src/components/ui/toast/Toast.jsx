import React from 'react';
import { createPortal } from 'react-dom';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { cn } from '@/lib/utils';

const ToastContext = React.createContext();

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const toast = { id, message, type };
    setToasts((prev) => [...prev, toast]);

    if (duration) {
      setTimeout(() => removeToast(id), duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

const Toast = ({ toast, onRemove }) => {
  const { id, message, type } = toast;

  const icons = {
    success: <FaCheckCircle className="w-5 h-5 text-green-500" />,
    error: <FaExclamationCircle className="w-5 h-5 text-red-500" />,
    info: <FaInfoCircle className="w-5 h-5 text-blue-500" />,
    warning: <FaExclamationCircle className="w-5 h-5 text-yellow-500" />,
  };

  const styles = {
    success: 'border-green-500 bg-green-50',
    error: 'border-red-500 bg-red-50',
    info: 'border-blue-500 bg-blue-50',
    warning: 'border-yellow-500 bg-yellow-50',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 min-w-[320px] rounded-lg border shadow-lg',
        'animate-in slide-in-from-right-full duration-300',
        styles[type]
      )}
    >
      {icons[type]}
      <p className="flex-1 text-sm text-gray-700">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <FaTimes />
      </button>
    </div>
  );
};
