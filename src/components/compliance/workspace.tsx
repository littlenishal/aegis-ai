import React, { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUpload } from '../upload/file-upload';
import { ReportView } from './report-view';
import { ComplianceReport } from '@/types/compliance';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ComplianceWorkspaceProps {
  onFileSelected: (file: File) => void;
  loading: boolean;
  error: string | null;
  report: ComplianceReport | null;
}

export default function ComplianceWorkspace({ 
  onFileSelected, 
  loading, 
  error, 
  report 
}: ComplianceWorkspaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
    setInputValue('');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Side */}
      <div className="w-1/2 p-6">
        <Card className="h-full flex flex-col bg-white">
          <CardHeader className="border-b px-6 py-4">
            <h2 className="text-2xl font-semibold">Aegis Compliance Agent</h2>
          </CardHeader>

          <div className="p-6 border-b">
            <FileUpload 
              onFileSelected={onFileSelected}
              loading={loading}
              error={error}
            />
          </div>

          <ScrollArea className="flex-grow">
            <div className="p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-gray-100' 
                      : 'bg-blue-50 ml-8'
                  }`}
                >
                  <p className="text-sm text-gray-800">{message.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-6 border-t bg-white">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about compliance issues..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
          </div>
        </Card>
      </div>

      {/* Right Side */}
      <div className="w-1/2 p-6">
        <Card className="h-full bg-white">
          <CardHeader className="border-b px-6 py-4">
          {!report && (  
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 gap-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          </CardHeader>
          {report && <ReportView report={report} />}
        </Card>
      </div>
    </div>
  );
}