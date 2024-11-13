import { ComplianceReport } from '@/types/compliance';

interface ReportViewProps {
  report: ComplianceReport;
}

export function ReportView({ report }: ReportViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Issues</h3>
          <p className="text-2xl font-bold">{report.summary.total_issues}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">High Severity</h3>
          <p className="text-2xl font-bold text-red-600">
            {report.summary.high_severity}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Compliance Score</h3>
          <p className="text-2xl font-bold text-blue-600">
            {report.summary.compliance_score}%
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Categories</h3>
          <p className="text-2xl font-bold">{report.categories.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Detailed Findings</h2>
        </div>
        <div className="p-4 space-y-4">
          {report.issues.map((issue, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                issue.severity === 'high' 
                  ? 'bg-red-50' 
                  : issue.severity === 'medium'
                  ? 'bg-yellow-50'
                  : 'bg-blue-50'
              }`}
            >
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
                <p className="text-gray-600 italic">"{issue.location.excerpt}"</p>
                <p><strong>Suggested Fix:</strong> {issue.suggested_fix}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}