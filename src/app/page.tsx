'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ComplianceReport } from '@/types/compliance';

// Dynamic imports to prevent SSR issues
const ComplianceWorkspace = dynamic(
  () => import('@/components/compliance/workspace'),
  { ssr: false }
);

const PDFAnalyzerComponent: React.FC<{ file: File }> = ({ file }) => {
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzePdf = async () => {
      try {
        const pdfService = new PDFService();
        const result = await pdfService.analyzePDF(file);
        setAnalysisResult(result);
      } catch (err) {
        console.error('Error analyzing PDF:', err);
        setError('Error analyzing PDF');
      }
    };
    if (file) {
      analyzePdf();
    }
  }, [file]);

  return (
    <div>
      {error && <p>{error}</p>}
      {analysisResult && <p>Analysis Result: {JSON.stringify(analysisResult)}</p>}
    </div>
  );
};

const PDFService = dynamic(
  () => import('@/services/document/pdf-service').then(mod => mod.PDFService),
  { ssr: false }
);

const GeminiAnalyzer = dynamic(
  () => {
    const Analyzer = new (import('@/services/ai/gemini-analyzer').then(mod => mod.GeminiAnalyzer))();
    return Analyzer;
  },
  { ssr: false }
);

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State for selected file

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file); // Update the selected file state
    setLoading(true);
    setError(null);

    try {
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
      {selectedFile && <PDFAnalyzerComponent file={selectedFile} />} {/* Render PDFAnalyzerComponent if a file is selected */}
    </main>
  );
}