import * as z from 'zod';

// Schema validate một dòng câu hỏi trong file Excel
const questionRowSchema = z.object({
  order: z.coerce.number().optional().or(z.literal('')).optional(),
  type: z.string(),
  content: z.string().min(1, 'Thiếu nội dung'),
  optionA: z.string().optional(),
  optionB: z.string().optional(),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
  optionE: z.string().optional(),
  optionF: z.string().optional(),
  correctAnswer: z.string().optional(),
  maxScore: z.coerce.number().positive('Điểm > 0'),
  shuffle: z.string().optional(),
});

/**
 * Parse file Excel thành các câu hỏi hợp lệ + lỗi
 * @param {File} file
 * @returns {Promise<{previewRows: any[], rowErrors: {row:number, field:string, message:string}[], validItems: any[]}>}
 */
export const parseQuestionsExcel = async (file) => {
  const XLSX = await import('xlsx');
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  if (!json.length) {
    return { previewRows: [], rowErrors: [{ row: 0, field: 'file', message: 'File rỗng' }], validItems: [] };
  }
  const errorsAcc = [];
  const validAcc = [];
  const metaAcc = [];
  // NEW: giữ lại mapping raw row -> valid item index để hỗ trợ duplicate filter
  const rawRowToItemIndex = [];
  json.forEach((row, idx) => {
    // Bỏ dòng trống nếu không có content
    if (!row.content && !row.Content && !row['Nội dung'] && !row['content']) return;
    const normalized = {
      order: row.order ?? row.Order ?? row['#'] ?? '',
      type: String(row.type || row.Type || '').trim().toUpperCase(),
      content: row.content || row.Content || row['Nội dung'] || '',
      optionA: row.optionA || row.A || row.a || '',
      optionB: row.optionB || row.B || row.b || '',
      optionC: row.optionC || row.C || row.c || '',
      optionD: row.optionD || row.D || row.d || '',
      optionE: row.optionE || row.E || row.e || '',
      optionF: row.optionF || row.F || row.f || '',
      correctAnswer: row.correctAnswer || row.Answer || row.answer || '',
      maxScore: row.maxScore || row.score || row.Score || 1,
      shuffle: row.shuffle || row.Shuffle || row.shuffleFlag || ''
    };
    const result = questionRowSchema.safeParse(normalized);
    if (!result.success) {
      result.error.issues.forEach(issue => {
        errorsAcc.push({ row: idx + 2, field: issue.path.join('.'), message: issue.message });
      });
      return;
    }
    if (normalized.type === 'MULTIPLE_CHOICE') {
      const options = [normalized.optionA, normalized.optionB, normalized.optionC, normalized.optionD, normalized.optionE, normalized.optionF]
        .filter(o => o !== undefined && o !== null && String(o).trim() !== '');
      if (options.length < 2) {
        errorsAcc.push({ row: idx + 2, field: 'options', message: 'Ít nhất 2 lựa chọn' });
        return;
      }
      // Kiểm tra trùng lựa chọn trong cùng câu hỏi
      const lowerSet = new Set();
      let hasDupOption = false;
      options.forEach(opt => {
        const key = opt.trim().toLowerCase();
        if (lowerSet.has(key)) hasDupOption = true; else lowerSet.add(key);
      });
      if (hasDupOption) {
        // Sử dụng idx + 2 để đồng bộ (1 header + index bắt đầu 0)
        errorsAcc.push({ row: idx + 2, field: 'options', message: 'Trùng nội dung lựa chọn' });
        return;
      }
      if (!normalized.correctAnswer) {
        errorsAcc.push({ row: idx + 2, field: 'correctAnswer', message: 'Thiếu đáp án đúng' });
        return;
      }
      const letter = normalized.correctAnswer.trim().toUpperCase();
      const letterIndex = letter.charCodeAt(0) - 65;
      if (letterIndex < 0 || letterIndex >= options.length) {
        errorsAcc.push({ row: idx + 2, field: 'correctAnswer', message: 'Đáp án không khớp lựa chọn' });
        return;
      }
      validAcc.push({
        content: normalized.content,
        type: 'MULTIPLE_CHOICE',
        options,
        correctAnswer: letter,
        isShufflable: /^Y(es)?$/i.test(normalized.shuffle || '') || false,
        maxScore: Number(normalized.maxScore) || 1,
      });
      metaAcc.push({ rowNumber: idx + 2, content: normalized.content });
      rawRowToItemIndex.push(validAcc.length - 1);
    } else if (['ESSAY', 'WRITING'].includes(normalized.type)) {
      validAcc.push({
        content: normalized.content,
        type: normalized.type,
        options: [],
        correctAnswer: '',
        isShufflable: false,
        maxScore: Number(normalized.maxScore) || 1,
      });
      metaAcc.push({ rowNumber: idx + 2, content: normalized.content });
      rawRowToItemIndex.push(validAcc.length - 1);
    } else {
      errorsAcc.push({ row: idx + 2, field: 'type', message: 'Loại không hỗ trợ' });
    }
  });
  // Phát hiện câu hỏi trùng lặp (không tính các dòng đã lỗi)
  const contentMap = new Map();
  metaAcc.forEach((m, idx) => {
    const key = m.content.trim().toLowerCase();
    if (!contentMap.has(key)) contentMap.set(key, []);
    contentMap.get(key).push(m.rowNumber);
  });
  const duplicates = [];
  contentMap.forEach((rows, key) => {
    if (rows.length > 1) {
      duplicates.push({ content: metaAcc.find(m => m.content.trim().toLowerCase() === key).content, rows });
    }
  });
  return { previewRows: json.slice(0, 20), rowErrors: errorsAcc, validItems: validAcc, validMeta: metaAcc, duplicates };
};

/**
 * Tạo và tải file template Excel câu hỏi.
 */
export const downloadQuestionTemplate = async () => {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet([
    { order: 1, type: 'MULTIPLE_CHOICE', content: 'Ví dụ: Thủ đô Việt Nam?', optionA: 'Hà Nội', optionB: 'TP.HCM', optionC: 'Đà Nẵng', optionD: 'Huế', correctAnswer: 'A', maxScore: 1, shuffle: 'Y' },
    { order: 2, type: 'ESSAY', content: 'Trình bày lợi ích của việc học ngoại ngữ', maxScore: 2 }
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Questions');
  const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'question_template.xlsx';
  a.click();
  URL.revokeObjectURL(url);
};
