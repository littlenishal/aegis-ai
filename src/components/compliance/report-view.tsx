import { ComplianceReport } from '@/types/compliance';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Info, CheckCircle2 } from 'lucide-react';

interface ReportViewProps {
  report: ComplianceReport;
}

export function ReportView({ report }: ReportViewProps) {
  return (
    <Card className="h-full">
      <Tabs defaultValue="summary" className="h-full flex flex-col">
        <div className="p-4 border-b">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-grow">
          <TabsContent value="summary" className="p-4 m-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Total Issues</p>
                    <p className="text-2xl font-bold">{report.summary.total_issues}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="text-red-500" />
                  <div>
                    <p className="text-sm font-medium">High Severity</p>
                    <p className="text-2xl font-bold text-red-600">
                      {report.summary.high_severity}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Info className="text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Compliance Score</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {report.summary.compliance_score}%
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Categories</p>
                    <p className="text-2xl font-bold">{report.categories.length}</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="p-4 m-0">
            <div className="space-y-4">
              {report.issues.map((issue, index) => (
                <Card key={index} className={`border-l-4 ${
                  issue.severity === 'high' 
                    ? 'border-l-red-500' 
                    : issue.severity === 'medium'
                    ? 'border-l-yellow-500'
                    : 'border-l-blue-500'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{issue.description}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${
                        issue.severity === 'high'
                          ? 'bg-red-100 text-red-800'
                          : issue.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {issue.severity}
                      </span>
                    </div>
                    <div className="text-sm space-y-2">
                      <p><strong>Category:</strong> {issue.category}</p>
                      <p><strong>Regulation:</strong> {issue.regulation_reference}</p>
                      <p><strong>Location:</strong> Page {issue.location.pageNumber}</p>
                      <p className="text-gray-600 italic">&ldquo;{issue.location.excerpt}&rdquo;</p>
                      <p><strong>Suggested Fix:</strong> {issue.suggested_fix}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="p-4 m-0">
            <Card className="p-4">
              <h4 className="font-semibold mb-4">Suggested Improvements</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {report.issues.map((issue, index) => (
                  <li key={index}>• {issue.suggested_fix}</li>
                ))}
              </ul>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
}