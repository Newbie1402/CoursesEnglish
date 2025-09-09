import React from 'react';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/select/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/Card';
import {
  FaUpload,
  FaDownload,
  FaFileExcel,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCloudUploadAlt
} from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { downloadQuestionTemplate } from '@/lib/questionImportUtils.js';

const ExcelImportTab = ({
  importFile,
  parsingStatus,
  previewRows,
  rowErrors,
  validItems,
  duplicates,
  importMode,
  setImportMode,
  skipDuplicates,
  setSkipDuplicates,
  importing,
  importProgress,
  onFileChange,
  onImportQuestions
}) => {
  const handleDownloadTemplate = () => {
    downloadQuestionTemplate();
  };

  const criticalErrorRowSet = new Set();
  rowErrors.forEach(err => {
    if (err.row !== undefined) criticalErrorRowSet.add(err.row);
  });

  const getStatusDisplay = () => {
    switch (parsingStatus) {
      case 'parsing':
        return {
          icon: FaSpinner,
          text: 'Đang phân tích file...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'done':
        return {
          icon: FaCheckCircle,
          text: 'Phân tích hoàn tất',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'error':
        return {
          icon: FaExclamationTriangle,
          text: 'Lỗi phân tích file',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FaFileExcel className="w-5 h-5" />
          Import từ Excel
        </CardTitle>
      </CardHeader>

      <CardContent className="p-8 space-y-6">
        {/* Download Template */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Tải file mẫu</h3>
              <p className="text-sm text-gray-600">
                Tải xuống file Excel mẫu để chuẩn bị dữ liệu câu hỏi
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <FaDownload className="w-4 h-4" />
              Tải file mẫu
            </Button>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-gray-700 mb-2 block">
              Chọn file Excel
            </span>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={onFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className={cn(
                "border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-all duration-200 hover:border-green-400 hover:bg-green-50",
                importFile && "border-green-400 bg-green-50"
              )}>
                <FaCloudUploadAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {importFile ? importFile.name : 'Kéo thả file hoặc click để chọn'}
                </p>
                <p className="text-sm text-gray-500">
                  Hỗ trợ định dạng .xlsx, .xls
                </p>
              </div>
            </div>
          </label>

          {/* Parsing Status */}
          {statusDisplay && (
            <div className={cn(
              "flex items-center gap-3 p-4 rounded-lg border",
              statusDisplay.bgColor,
              statusDisplay.color
            )}>
              <statusDisplay.icon className={cn(
                "w-5 h-5",
                parsingStatus === 'parsing' && "animate-spin"
              )} />
              <span className="font-medium">{statusDisplay.text}</span>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {parsingStatus === 'done' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaCheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Hợp lệ</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{validItems.length}</p>
              <p className="text-sm text-green-600">câu hỏi</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaExclamationTriangle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-900">Lỗi</span>
              </div>
              <p className="text-2xl font-bold text-red-900">{rowErrors.length}</p>
              <p className="text-sm text-red-600">dòng lỗi</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-900">Trùng lặp</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{duplicates.length}</p>
              <p className="text-sm text-yellow-600">câu hỏi</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {rowErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-3">Danh sách lỗi:</h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {rowErrors.slice(0, 10).map((err, idx) => (
                <div key={idx} className="text-sm text-red-700 bg-white p-2 rounded border">
                  <span className="font-medium">Dòng {err.row}:</span> {err.message}
                </div>
              ))}
              {rowErrors.length > 10 && (
                <p className="text-sm text-red-600 font-medium">
                  ... và {rowErrors.length - 10} lỗi khác
                </p>
              )}
            </div>
          </div>
        )}

        {/* Preview Table */}
        {previewRows.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Xem trước dữ liệu:</h4>
            <div className="overflow-x-auto max-h-80 border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {Object.keys(previewRows[0] || {}).map(key => (
                      <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewRows.slice(0, 10).map((row, i) => (
                    <tr key={i} className={cn(
                      "hover:bg-gray-50",
                      criticalErrorRowSet.has(i + 2) && "bg-red-50"
                    )}>
                      {Object.keys(previewRows[0]).map(key => (
                        <td key={key} className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                          {String(row[key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewRows.length > 10 && (
                <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 text-center">
                  Hiển thị 10/{previewRows.length} dòng đầu
                </div>
              )}
            </div>
          </div>
        )}

        {/* Import Settings & Actions */}
        {parsingStatus === 'done' && validItems.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Chế độ import
                </label>
                <Select
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value)}
                  className="w-full"
                >
                  <option value="VALID_ONLY">Chỉ import câu hỏi hợp lệ</option>
                  <option value="STRICT">Strict - Không có lỗi nào</option>
                </Select>
              </div>

              {duplicates.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Xử lý câu hỏi trùng lặp
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={skipDuplicates}
                      onChange={(e) => setSkipDuplicates(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Bỏ qua câu hỏi trùng lặp
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="button"
                disabled={importing || parsingStatus !== 'done'}
                onClick={onImportQuestions}
                className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {importing ? (
                  <div className="flex items-center gap-2">
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Đang import {importProgress.done}/{importProgress.total}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FaUpload className="w-4 h-4" />
                    Import câu hỏi ({validItems.length})
                  </div>
                )}
              </Button>

              {importing && (
                <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                  <div>Thành công: {importProgress.success}</div>
                  <div>Lỗi: {importProgress.failed}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExcelImportTab;
