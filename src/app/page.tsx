'use client';

import { useState } from 'react';
import ComplianceWorkspace from '@/components/compliance/workspace';
import { ComplianceReport } from '@/types/compliance';
import { PDFService } from '@/services/document/pdf-service';
import { GeminiAnalyzer } from '@/services/ai/gemini-analyzer';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      // Dynamically import services only when needed
      const { PDFService } = await import('@/services/document/pdf-service');
      const { GeminiAnalyzer } = await import('@/services/ai/gemini-analyzer');

      const pdfService = new PDFService();
      const documentAnalysis = await pdfService.analyzePDF(file);

      const geminiAnalyzer = new GeminiAnalyzer(
        process.env.NEXT_PUBLIC_GEMINI_API_KEY!
      );

      const complianceReport = await geminiAnalyzer.analyzeDocument(documentAnalysis);
      setReport(complianceReport);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <ComplianceWorkspace 
        onFileSelected={handleFileSelected}
        loading={loading}
        error={error}
        report={report}
      />
    </main>
  );
}