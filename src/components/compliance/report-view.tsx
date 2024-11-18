import { ComplianceReport } from '@/types/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Info, CheckCircle2 } from 'lucide-react';

interface ReportViewProps {
  report: ComplianceReport;
}

export function ReportView({ report }: ReportViewProps) {
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow">
        <TabsContent value="summary" className="p-6 m-0">
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Issues</p>
                    <p className="text-3xl font-bold">{report.summary.total_issues}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">High Severity</p>
                    <p className="text-3xl font-bold text-red-600">{report.summary.high_severity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Info className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Compliance Score</p>
                    <p className="text-3xl font-bold text-blue-600">{report.summary.compliance_score}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Categories</p>
                    <p className="text-3xl font-bold">{report.categories.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="p-6 m-0 space-y-6">
          {report.issues.map((issue, index) => (
            <Card key={index} className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium">{issue.description}</h3>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    issue.severity === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : issue.severity === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {issue.severity.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-900">Category:</span> {issue.category}</p>
                  <p><span className="font-medium text-gray-900">Regulation:</span> {issue.regulation_reference}</p>
                  <p><span className="font-medium text-gray-900">Location:</span> Page {issue.location.pageNumber}</p>
                  <p className="italic bg-gray-50 p-3 rounded-lg">{issue.location.excerpt}</p>
                  <p><span className="font-medium text-gray-900">Suggested Fix:</span> {issue.suggested_fix}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="p-6 m-0">
          <Card className="bg-white">
            <CardContent className="p-6">
              <h4 className="text-lg font-medium mb-4">Suggested Improvements</h4>
              <ul className="space-y-4">
                {report.issues.map((issue, index) => (
                  <li key={index} className="flex gap-3 text-sm text-gray-600">
                    <span className="text-blue-500">•</span>
                    {issue.suggested_fix}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </ScrollArea>
    </div>
  );
}