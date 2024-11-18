"use client"

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUpload } from '../upload/file-upload';
import { ReportView } from './report-view';
import { ComplianceReport } from '@/types/compliance';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
    setInputValue('');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-1/2 p-4 border-r">
        <Card className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Aegis Compliance Agent</h2>
          </div>

          <div className="p-4 border-b">
            <FileUpload 
              onFileSelected={onFileSelected}
              loading={loading}
              error={error}
            />
          </div>

          <ScrollArea className="flex-grow px-4">
            <div className="space-y-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-gray-100' 
                      : 'bg-blue-50 ml-8'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about compliance issues..."
              className="w-full p-2 border rounded-md"
              aria-label="Message input"
            />
          </form>
        </Card>
      </div>

      <div className="w-1/2 p-4">
        {report && <ReportView report={report} />}
      </div>
    </div>
  );
}