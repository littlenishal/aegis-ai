export interface ComplianceIssue {
  severity: "high" | "medium" | "low";
  category: "TILA" | "ESIGN" | "UDAAP" | "ECOA";
  description: string;
  regulation_reference: string;
  suggested_fix: string;
  location: {
    pageNumber: number;
    section: string;
    excerpt: string;
  };
}

export interface ComplianceReport {
  analysis_id: string;
  timestamp: string;
  filename: string;
  document_type: string;
  issues: ComplianceIssue[];
  summary: {
    total_issues: number;
    high_severity: number;
    medium_severity: number;
    low_severity: number;
    compliance_score: number;
  };
  categories: {
    category: string;
    issues: number;
  }[];
}
