import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge multiple class names with Tailwind classes
 * @param  {...string} inputs - Class names to merge
 * @returns {string} - Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Định dạng ngày về dạng dd/MM/yyyy
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d)) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Kiểm tra số điện thoại Việt Nam hợp lệ
 * @param {string} phone
 * @returns {boolean}
 */
export function validatePhoneNumber(phone) {
  return /^0[0-9]{9}$/.test(phone);
}

/**
 * Tính toán tiến độ dựa trên ngày bắt đầu và ngày kết thúc
 * @param {string|Date} start - Ngày bắt đầu
 * @param {string|Date} end - Ngày kết thúc
 * @returns {number} - Tiến độ (0-100)
 */
export function getProgress(start, end) {
  if (!start || !end) return 0;
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (now < startDate) return 0;
  if (now >= endDate) return 100;
  // Số ngày đã qua kể từ startDate
  const daysPassed = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
  // Tổng số ngày từ startDate đến endDate
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  // Tiến độ = (ngày hiện tại / ngày kết thúc) * 100
  const progress = Math.floor((daysPassed / totalDays) * 100);
  return Math.max(0, Math.min(progress, 100));
}
