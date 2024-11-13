'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/upload/file-upload';
import { ReportView } from '@/components/compliance/report-view';
import { PDFService } from '@/services/document/pdf-service';
import { GeminiAnalyzer } from '@/services/ai/gemini-analyzer';
import { ComplianceReport } from '@/types/compliance';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      // Extract PDF content
      const pdfService = new PDFService();
      const documentAnalysis = await pdfService.analyzePDF(file);

      // Analyze with Gemini
      const geminiAnalyzer = new GeminiAnalyzer(
        process.env.NEXT_PUBLIC_GEMINI_API_KEY!
      );
      const complianceReport = await geminiAnalyzer.analyzeDocument(documentAnalysis);

      setReport(complianceReport);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError('Failed to analyze document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Loan Document Compliance Checker
          </h1>
          <p className="mt-2 text-gray-600">
            Upload a loan document PDF for AI-powered compliance analysis
          </p>
        </header>

        <div className="space-y-8">
          {!report && (
            <div className="bg-white rounded-lg shadow p-6">
              <FileUpload 
                onFileSelected={handleFileSelected}
                loading={loading}
              />
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Analyzing document...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {report && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Analysis Results</h2>
                <button
                  onClick={() => {
                    setReport(null);
                    setError(null);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Analyze Another Document
                </button>
              </div>
              <ReportView report={report} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}