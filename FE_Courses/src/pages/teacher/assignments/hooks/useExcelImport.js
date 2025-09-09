import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/toast/Toast';
import useAssignmentService from '@/services/hooks/useAssignmentService';
import { parseQuestionsExcel } from '@/lib/questionImportUtils.js';

export const useExcelImport = (examId, exam) => {
  const [importFile, setImportFile] = useState(null);
  const [parsingStatus, setParsingStatus] = useState('idle');
  const [previewRows, setPreviewRows] = useState([]);
  const [rowErrors, setRowErrors] = useState([]);
  const [validItems, setValidItems] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [validMeta, setValidMeta] = useState([]);
  const [importMode, setImportMode] = useState('VALID_ONLY');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ total: 0, done: 0, success: 0, failed: 0 });
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const { addToast } = useToast();
  const { useCreateQuestion } = useAssignmentService();
  const { mutate: addQuestion } = useCreateQuestion();

  const parseExcelFile = useCallback(async (file) => {
    setParsingStatus('parsing');
    setRowErrors([]);
    setPreviewRows([]);
    setValidItems([]);
    setDuplicates([]);
    setValidMeta([]);

    try {
      const { previewRows, rowErrors, validItems, validMeta, duplicates } = await parseQuestionsExcel(file);
      setPreviewRows(previewRows);
      setRowErrors(rowErrors);
      setValidItems(validItems);
      setValidMeta(validMeta || []);
      setDuplicates(duplicates || []);
      setParsingStatus('done');
    } catch (e) {
      console.error(e);
      setParsingStatus('error');
      setRowErrors([{ row: 0, field: 'file', message: 'Lỗi đọc file' }]);
    }
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const fileInput = e.target;
    const file = fileInput.files?.[0];
    if (!file) return;

    setImportFile(file);
    await parseExcelFile(file);
    fileInput.value = '';
  }, [parseExcelFile]);

  const handleImportQuestions = useCallback(async () => {
    if (parsingStatus !== 'done') return;

    if (importMode === 'STRICT' && rowErrors.length > 0) {
      addToast('Chế độ STRICT: cần sửa hết lỗi trước khi import', 'error');
      return;
    }

    if (validItems.length === 0) {
      addToast('Không có câu hỏi hợp lệ để import', 'error');
      return;
    }

    // Lọc bỏ duplicates nếu chọn skip
    let itemsToImport = [...validItems];
    if (skipDuplicates && duplicates.length) {
      const seen = new Set();
      itemsToImport = itemsToImport.filter(it => {
        const key = it.content.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    // Đồng bộ theo exam.type
    if (exam?.type === 'WRITING') {
      itemsToImport = itemsToImport.map(it => ({
        content: it.content,
        type: 'ESSAY',
        options: [],
        correctAnswer: '',
        isShufflable: false,
        maxScore: it.maxScore
      }));
    } else if (exam?.type === 'MULTIPLE_CHOICE') {
      const before = itemsToImport.length;
      itemsToImport = itemsToImport.filter(it => it.type === 'MULTIPLE_CHOICE');
      const removed = before - itemsToImport.length;
      if (removed > 0) {
        addToast(`${removed} câu hỏi không phải Trắc nghiệm đã bị bỏ qua`, 'warning');
      }
    }

    if (!itemsToImport.length) {
      addToast('Không còn câu hỏi nào để import sau khi lọc', 'error');
      return;
    }

    setImporting(true);
    setImportProgress({ total: itemsToImport.length, done: 0, success: 0, failed: 0 });

    let success = 0;
    let failed = 0;
    let done = 0;

    for (const item of itemsToImport) {
      try {
        await new Promise((resolve, reject) => {
          addQuestion(
            { ...item, examId: Number(examId) },
            {
              onSuccess: () => {
                success++;
                resolve();
              },
              onError: (err) => {
                failed++;
                reject(err);
              },
            }
          );
        });
      } catch (e) {
        console.error('Import question error:', e);
      }

      done++;
      setImportProgress({ total: itemsToImport.length, done, success, failed });
    }

    setImporting(false);
    addToast(`Import hoàn tất: ${success} thành công, ${failed} lỗi`, success > 0 ? 'success' : 'error');
  }, [
    parsingStatus,
    importMode,
    rowErrors,
    validItems,
    skipDuplicates,
    duplicates,
    exam,
    examId,
    addQuestion,
    addToast
  ]);

  return {
    // State
    importFile,
    parsingStatus,
    previewRows,
    rowErrors,
    validItems,
    duplicates,
    validMeta,
    importMode,
    importing,
    importProgress,
    skipDuplicates,

    // Actions
    setImportMode,
    setSkipDuplicates,
    handleFileChange,
    handleImportQuestions,
  };
};
