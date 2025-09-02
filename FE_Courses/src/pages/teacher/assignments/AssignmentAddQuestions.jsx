import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input/Input';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/select/Select';
import { useToast } from '@/components/ui/toast/Toast';
import useAssignmentService from '@/services/hooks/useAssignmentService';
import { parseQuestionsExcel, downloadQuestionTemplate } from '@/utils/questionImportUtils';

const questionSchema = z.object({
  content: z.string().min(1, 'Nhập nội dung câu hỏi'),
  type: z.enum(['MULTIPLE_CHOICE', 'ESSAY']),
  correctAnswer: z.string().optional(),
  options: z.array(z.string()).optional(),
  isShufflable: z.boolean().optional(),
  maxScore: z.coerce.number().min(1, 'Nhập điểm tối đa'),
}).superRefine((data, ctx) => {
  if (data.type === 'MULTIPLE_CHOICE') {
    const opts = (data.options || []).map(o => (o || '').trim()).filter(o => o !== '');
    if (opts.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: 'Cần ít nhất 2 lựa chọn khác rỗng' });
    }
    const seen = new Map();
    opts.forEach((o, idx) => {
      const key = o.toLowerCase();
      if (seen.has(key)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: 'Có lựa chọn bị trùng' });
      } else {
        seen.set(key, idx);
      }
    });
    if (data.correctAnswer) {
      const letterIndex = data.correctAnswer.charCodeAt(0) - 65;
      if (letterIndex < 0 || letterIndex >= (data.options?.length || 0) || !((data.options || [])[letterIndex] || '').trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['correctAnswer'], message: 'Đáp án không hợp lệ' });
      }
    }
  }
});

const TABS = [
  { key: 'manual', label: 'Thêm thủ công' },
  { key: 'import', label: 'Import Excel' },
];

const AssignmentAddQuestions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manual');
  // State cho tab import
  const [importFile, setImportFile] = useState(null);
  const [parsingStatus, setParsingStatus] = useState('idle'); // idle|parsing|done|error
  const [previewRows, setPreviewRows] = useState([]); // giữ raw dữ liệu hiển thị
  const [rowErrors, setRowErrors] = useState([]); // [{row, field, message}]
  const [validItems, setValidItems] = useState([]); // question hợp lệ
  const [importMode, setImportMode] = useState('VALID_ONLY'); // VALID_ONLY|STRICT
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ total: 0, done: 0, success: 0, failed: 0 });
  const [duplicates, setDuplicates] = useState([]); // [{content, rows}]
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [validMeta, setValidMeta] = useState([]); // [{rowNumber, content}]

  const { addToast } = useToast();
  const { useCreateQuestion, getExamById } = useAssignmentService();
  const { data: exam } = getExamById(examId);
  const { mutate: addQuestion, isLoading: loading } = useCreateQuestion();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      content: '',
      type: 'MULTIPLE_CHOICE',
      correctAnswer: '',
      options: [''],
      isShufflable: true,
      maxScore: 1,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const type = watch('type');

  const onSubmit = (data) => {
    console.log('Submitting question data:', data);
    addQuestion(
      { ...data, examId: Number(examId) },
      {
        onSuccess: (response) => {
          console.log('Question added successfully:', response);
          addToast(response.message, 'success');
        },
        onError: (error) => {
          console.error('Error adding question:', error);
          addToast('Thêm câu hỏi thất bại!', 'error');
        },
      }
    );
  };

  const handleConfirm = () => {
    addToast('Hoàn tất thêm câu hỏi!', 'success');
    navigate(`/teacher/assignments/${examId}`); // Điều hướng về danh sách bài kiểm tra
  };

  const handleFileChange = async (e) => {
    const fileInput = e.target;
    const file = fileInput.files?.[0];
    if (!file) return;
    setImportFile(file);
    await parseExcelFile(file);
    // Cho phép chọn lại cùng file lần sau
    fileInput.value = '';
  };

  // XÓA questionRowSchema và parseExcelFile cũ, thay bằng hàm gọi utils
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

  const handleImportQuestions = async () => {
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
      // Force tất cả thành ESSAY
      itemsToImport = itemsToImport.map(it => ({ content: it.content, type: 'ESSAY', options: [], correctAnswer: '', isShufflable: false, maxScore: it.maxScore }));
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
    let success = 0; let failed = 0; let done = 0;
    for (const item of itemsToImport) {
      try {
        await new Promise((res, rej) => {
          addQuestion({ ...item, examId: Number(examId) }, {
            onSuccess: () => res(),
            onError: () => rej(),
          });
        });
        success++;
      } catch (e) {
        failed++;
      } finally {
        done++;
        setImportProgress({ total: itemsToImport.length, done, success, failed });
      }
    }
    setImporting(false);
    if (failed === 0) {
      addToast(`Import thành công ${success} câu hỏi`, 'success');
    } else if (success > 0) {
      addToast(`Import xong: thành công ${success}, lỗi ${failed}`, 'warning');
    } else {
      addToast('Import thất bại', 'error');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadQuestionTemplate();
    } catch (e) {
      addToast('Không tạo được template', 'error');
    }
  };

  const errorCount = rowErrors.length;
  const infoBar = parsingStatus === 'done' ? `${validItems.length} hợp lệ | ${errorCount} lỗi` : '';

  // Bổ sung tính toán duplicate
  const duplicateRowSet = React.useMemo(() => {
    if (!duplicates.length) return new Set();
    return new Set(duplicates.flatMap(d => d.rows));
  }, [duplicates]);
  const duplicateCount = React.useMemo(() => duplicates.reduce((acc, d) => acc + (d.rows.length - 1), 0), [duplicates]);
  const itemsAfterSkipCount = React.useMemo(() => {
    if (!skipDuplicates) return validItems.length;
    const seen = new Set();
    let count = 0;
    validItems.forEach(it => { const k = it.content.trim().toLowerCase(); if (!seen.has(k)) { seen.add(k); count++; } });
    return count;
  }, [skipDuplicates, validItems]);
  // Row lỗi quan trọng để tô toàn hàng
  const criticalErrorMessages = ['Trùng nội dung lựa chọn', 'Thiếu đáp án đúng', 'Đáp án không khớp lựa chọn'];
  const criticalErrorRowSet = React.useMemo(() => new Set(rowErrors.filter(e => criticalErrorMessages.includes(e.message)).map(e => e.row)), [rowErrors]);

  React.useEffect(() => {
    if (exam?.type) {
      if (exam.type === 'WRITING') {
        setValue('type', 'ESSAY');
      } else if (exam.type === 'MULTIPLE_CHOICE') {
        setValue('type', 'MULTIPLE_CHOICE');
      }
    }
  }, [exam, setValue]);

  const manualOptions = watch('options');
  const duplicateOptionIndexes = React.useMemo(() => {
    if (type !== 'MULTIPLE_CHOICE') return [];
    const map = new Map();
    const dups = new Set();
    (manualOptions || []).forEach((val, i) => {
      const norm = (val || '').trim().toLowerCase();
      if (!norm) return;
      if (map.has(norm)) { dups.add(i); dups.add(map.get(norm)); } else { map.set(norm, i); }
    });
    return Array.from(dups.values());
  }, [manualOptions, type]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Thêm câu hỏi cho bài tập #{examId}</h2>
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      {activeTab === 'manual' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded shadow">
          <div>
            <label className="block font-medium mb-1">Nội dung câu hỏi</label>
            <Input {...register('content')} placeholder="Nhập nội dung câu hỏi" />
            {errors.content && <span className="text-red-500 text-xs">{errors.content.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Loại câu hỏi</label>
            <Select {...register('type')} disabled={exam?.type === 'WRITING'}>
              <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
              <option value="ESSAY">Tự luận</option>
            </Select>
            {exam?.type === 'WRITING' && (
              <p className="text-xs text-gray-500 mt-1">Bài kiểm tra dạng WRITING: mặc định câu hỏi tự luận.</p>
            )}
          </div>
          {type === 'MULTIPLE_CHOICE' && (
            <>
              <div>
                <label className="block font-medium mb-1">Các lựa chọn</label>
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 mb-2 items-start">
                    <div className="flex-1">
                      <Input
                        {...register(`options.${idx}`)}
                        placeholder={`Lựa chọn ${String.fromCharCode(65 + idx)}`}
                        error={duplicateOptionIndexes.includes(idx)}
                      />
                      {duplicateOptionIndexes.includes(idx) && (
                        <span className="text-xs text-amber-600">Trùng lựa chọn</span>
                      )}
                    </div>
                    <Button type="button" variant="ghost" onClick={() => remove(idx)} disabled={fields.length <= 2}>-</Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => append('')}>Thêm lựa chọn</Button>
                {errors.options && <span className="text-red-500 text-xs block mt-1">{errors.options.message}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Đáp án đúng</label>
                <Select {...register('correctAnswer')}>
                  <option value="">Chọn đáp án đúng</option>
                  {fields.map((field, idx) => (
                    <option key={field.id} value={String.fromCharCode(65 + idx)}>
                      {String.fromCharCode(65 + idx)}
                    </option>
                  ))}
                </Select>
                {errors.correctAnswer && <span className="text-red-500 text-xs">{errors.correctAnswer.message}</span>}
              </div>
              <div>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" {...register('isShufflable')} defaultChecked />
                  Trộn đáp án khi làm bài
                </label>
              </div>
            </>
          )}
          <div>
            <label className="block font-medium mb-1">Điểm tối đa</label>
            <Input type="number" min={1} {...register('maxScore')} />
            {errors.maxScore && <span className="text-red-500 text-xs">{errors.maxScore.message}</span>}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu câu hỏi'}
            </Button>
          </div>
        </form>
      )}
      {activeTab === 'import' && (
        <div className="bg-white p-4 rounded shadow space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div>
              <p className="font-medium">Import câu hỏi từ Excel</p>
              <p className="text-xs text-gray-500">Các cột: order, type, content, optionA..F, correctAnswer, maxScore, shuffle(Y/N)</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleDownloadTemplate}>Tải template</Button>
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded text-sm bg-gray-50 hover:bg-gray-100">
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
                Chọn file
              </label>
            </div>
          </div>
          {importFile && (
            <div className="text-sm text-gray-600">File: <span className="font-semibold">{importFile.name}</span></div>
          )}
          <div className="flex flex-wrap gap-4 items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Trạng thái:</span>
              {parsingStatus === 'idle' && <span className="text-gray-500">Chưa chọn file</span>}
              {parsingStatus === 'parsing' && <span className="text-blue-600 animate-pulse">Đang đọc...</span>}
              {parsingStatus === 'done' && <span className="text-green-600">Hoàn tất ({infoBar})</span>}
              {parsingStatus === 'error' && <span className="text-red-600">Lỗi đọc file</span>}
            </div>
            {parsingStatus === 'done' && (
              <div className="flex items-center gap-4 flex-wrap text-xs">
                <div className="flex items-center gap-1">
                  <input id="skipDup" type="checkbox" className="h-3 w-3" checked={skipDuplicates} onChange={()=>setSkipDuplicates(v=>!v)} />
                  <label htmlFor="skipDup">Bỏ qua câu hỏi trùng ({duplicateCount} dòng trùng)</label>
                </div>
                {duplicateCount>0 && <span className="text-amber-600">Sau lọc: {itemsAfterSkipCount} câu</span>}
              </div>
            )}
          </div>
          {parsingStatus === 'done' && duplicates.length>0 && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              <p className="font-medium mb-1">Câu hỏi trùng phát hiện:</p>
              <ul className="list-disc pl-4 space-y-0.5 max-h-24 overflow-auto">
                {duplicates.slice(0,10).map((d,i)=>(<li key={i}>{d.content} (Rows: {d.rows.join(', ')})</li>))}
              </ul>
              {duplicates.length>10 && <p className="italic">... {duplicates.length-10} nhóm nữa</p>}
            </div>
          )}
          {parsingStatus === 'done' && (
            <div className="border rounded p-3 max-h-80 overflow-auto text-xs">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    {Object.keys(previewRows[0] || {}).map(h => <th key={h} className="p-1 border text-[11px] uppercase">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((r,i)=>(
                    <tr key={i} className={`hover:bg-gray-50 ${criticalErrorRowSet.has(i+2)?'bg-red-50 ring-1 ring-red-200': (!criticalErrorRowSet.has(i+2) && duplicateRowSet.has(i+2)?'bg-amber-50':'')}`}>
                      {Object.keys(previewRows[0]||{}).map(k=>{
                        const err = rowErrors.find(er=>er.row===i+2 && er.field.toLowerCase().includes(k.toLowerCase()));
                        const cellBase = 'p-1 border align-top';
                        // Nếu hàng đã critical thì không cần đỏ từng ô nữa (giữ chữ đỏ nếu chính ô lỗi)
                        if (criticalErrorRowSet.has(i+2)) {
                          return <td key={k} className={`${cellBase} ${err?'text-red-700 font-medium':''}`}>{String(r[k] ?? '')}</td>;
                        }
                        const dup = duplicateRowSet.has(i+2);
                        return <td key={k} className={`${cellBase} ${err?'bg-red-50 text-red-600':''} ${dup && !err?'border-amber-400':''}`}>{String(r[k] ?? '')}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {errorCount>0 && <div className="mt-2 text-red-600">{errorCount} lỗi. Ví dụ: {rowErrors.slice(0,3).map(e=>`[Row ${e.row}] ${e.field}: ${e.message}`).join('; ')}{rowErrors.length>3?' ...':''}</div>}
              {duplicateCount>0 && <div className="mt-1 text-amber-600">Có {duplicateCount} dòng trùng nội dung (tô nền vàng nhạt).</div>}
              {criticalErrorRowSet.size>0 && <div className="mt-1 text-red-600">{criticalErrorRowSet.size} dòng có lỗi nghiêm trọng (tô nền đỏ nhạt).</div>}
            </div>
          )}
          {importing && (
            <div className="w-full bg-gray-100 rounded h-3 overflow-hidden">
              <div className="h-3 bg-blue-500 transition-all" style={{width: `${(importProgress.done/importProgress.total)*100}%`}} />
            </div>
          )}
          {importing && (
            <div className="text-xs text-gray-600">{importProgress.done}/{importProgress.total} | Thành công {importProgress.success} | Lỗi {importProgress.failed}</div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={()=>{setImportFile(null);setParsingStatus('idle');setPreviewRows([]);setRowErrors([]);setValidItems([]);}} disabled={importing}>Reset</Button>
            <Button type="button" onClick={handleImportQuestions} disabled={importing || parsingStatus!=='done' || validItems.length===0 || (importMode==='STRICT' && rowErrors.length>0)}>
              {importing? 'Đang import...' : `Import (${skipDuplicates?itemsAfterSkipCount:validItems.length})`}
            </Button>
          </div>
        </div>
      )}
      <div className="flex justify-end mt-6">
        <Button variant="primary" onClick={handleConfirm} disabled={importing}>Hoàn tất</Button>
      </div>
      {/* {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />} */}
    </div>
  );
};

export default AssignmentAddQuestions;

