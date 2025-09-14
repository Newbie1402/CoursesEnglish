import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/Card';
import { useToast } from '@/components/ui/toast/Toast';
import useAssignmentService from '@/services/hooks/useAssignmentService';
import ManualQuestionForm from './components/ManualQuestionForm';
import ExcelImportTab from './components/ExcelImportTab';
import { useQuestionForm } from './hooks/useQuestionForm';
import { useExcelImport } from './hooks/useExcelImport';
import {
  FaArrowLeft,
  FaEdit,
  FaFileExcel,
  FaCheckCircle,
  FaTasks
} from 'react-icons/fa';
import { cn } from '@/lib/utils';

const TABS = [
  {
    key: 'manual',
    label: 'Thêm thủ công',
    icon: FaEdit,
    description: 'Tạo từng câu hỏi một cách thủ công'
  },
  {
    key: 'import',
    label: 'Import Excel',
    icon: FaFileExcel,
    description: 'Import nhiều câu hỏi từ file Excel'
  },
];

const AssignmentAddQuestions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manual');
  const { addToast } = useToast();

  // Hooks
  const { getExamById } = useAssignmentService();
  const { data: exam } = getExamById(examId);
  const questionForm = useQuestionForm(examId);
  const excelImport = useExcelImport(examId, exam);

  const handleConfirm = () => {
    addToast('Hoàn tất thêm câu hỏi!', 'success');
    navigate(`/teacher/assignments/${examId}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGoBack}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <FaArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Thêm câu hỏi cho bài kiểm tra
                  </h1>
                  {exam && (
                    <p className="text-gray-600">
                      <FaTasks className="inline w-4 h-4 mr-1" />
                      {exam.title}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <FaCheckCircle className="w-4 h-4" />
                Hoàn tất
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all duration-200 text-left",
                    activeTab === tab.key
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      activeTab === tab.key
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    )}>
                      <tab.icon className="w-5 h-5" />
                    </div>
                    <h3 className={cn(
                      "text-lg font-semibold",
                      activeTab === tab.key ? "text-blue-900" : "text-gray-900"
                    )}>
                      {tab.label}
                    </h3>
                  </div>
                  <p className={cn(
                    "text-sm",
                    activeTab === tab.key ? "text-blue-700" : "text-gray-600"
                  )}>
                    {tab.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'manual' && (
            <ManualQuestionForm
              register={questionForm.register}
              control={questionForm.control}
              errors={questionForm.formState.errors}
              watch={questionForm.watch}
              onSubmit={questionForm.onSubmit}
              loading={questionForm.loading}
            />
          )}

          {activeTab === 'import' && (
            <ExcelImportTab
              importFile={excelImport.importFile}
              parsingStatus={excelImport.parsingStatus}
              previewRows={excelImport.previewRows}
              rowErrors={excelImport.rowErrors}
              validItems={excelImport.validItems}
              duplicates={excelImport.duplicates}
              importMode={excelImport.importMode}
              setImportMode={excelImport.setImportMode}
              skipDuplicates={excelImport.skipDuplicates}
              setSkipDuplicates={excelImport.setSkipDuplicates}
              importing={excelImport.importing}
              importProgress={excelImport.importProgress}
              onFileChange={excelImport.handleFileChange}
              onImportQuestions={excelImport.handleImportQuestions}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentAddQuestions;

