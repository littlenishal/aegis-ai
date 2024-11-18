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
  summary: {
    total_issues: number;
    high_severity: number;
    medium_severity: number;
    low_severity: number;
    compliance_score: number;
  };
  categories: string[];
  issues: {
    severity: 'high' | 'medium' | 'low';
    description: string;
    category: string;
    regulation_reference: string;
    suggested_fix: string;
    location: {
      pageNumber: number;
      excerpt: string;
    };
  }[];
}
