import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';

const Form = ({ className, children, onSubmit, schema, defaultValues, ...props }) => {
  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-6', className)} {...props}>
      {typeof children === 'function' ? children(form) : children}
    </form>
  );
};

const FormField = ({
  name,
  label,
  error,
  children,
  className,
  labelClassName,
  required,
  ...props
}) => {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {label && (
        <label className={cn('block text-sm font-medium text-gray-700', labelClassName)}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

const FormMessage = ({ children, className, ...props }) => {
  return (
    <p className={cn('text-sm font-medium text-red-500', className)} {...props}>
      {children}
    </p>
  );
};

const FormDescription = ({ children, className, ...props }) => {
  return (
    <p className={cn('text-sm text-gray-500', className)} {...props}>
      {children}
    </p>
  );
};

export { Form, FormField, FormMessage, FormDescription };
