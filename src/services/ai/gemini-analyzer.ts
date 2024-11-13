import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { DocumentAnalysis } from '@/types/document';
import { ComplianceReport, ComplianceIssue } from '@/types/compliance';

export class GeminiAnalyzer {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown code block syntax
    let cleaned = text.replace(/```json\s?/g, '').replace(/```\s?/g, '');

    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();

    // Attempt to find the first '{' and last '}' to extract just the JSON object
    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Invalid JSON structure in response');
    }

    return cleaned.slice(startIndex, endIndex + 1);
  }

  private async generatePrompt(doc: DocumentAnalysis): Promise<string> {
    return `Analyze this personal loan document for regulatory compliance:
Document: ${doc.filename}
Total Pages: ${doc.totalPages}
Content to analyze:
${doc.sections.map(section => 
  `Page ${section.pageNumber}: ${section.content.substring(0, 500)}`
).join('\n\n')}
Analyze for compliance with:
1. TILA (Truth in Lending Act)
2. ESIGN Act
3. UDAAP (Unfair, Deceptive, or Abusive Acts or Practices)
4. ECOA (Equal Credit Opportunity Act)
For each issue found, provide:
- Severity (high/medium/low)
- Category (TILA/ESIGN/UDAAP/ECOA)
- Description of the issue
- Specific regulation reference
- Suggested fix
- Location (page number and relevant text)
Provide the response as a valid JSON object (not in a code block) matching this structure:
{
  "issues": [{
    "severity": "high|medium|low",
    "category": "TILA|ESIGN|UDAAP|ECOA",
    "description": "string",
    "regulation_reference": "string",
    "suggested_fix": "string",
    "location": {
      "pageNumber": number,
      "section": "string",
      "excerpt": "string"
    }
  }]
}`;
  }

  async analyzeDocument(doc: DocumentAnalysis): Promise<ComplianceReport> {
    try {
      const prompt = await this.generatePrompt(doc);
      const result = await this.model.generateContent(prompt);
      const response = result.response;

      // Clean and parse the response
      let jsonString: string;
      let analysis: { issues: ComplianceIssue[] };

      try {
        jsonString = this.cleanJsonResponse(response.text());
        analysis = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.debug('Raw response:', response.text());
        console.debug('Cleaned JSON string:', jsonString);
        throw new Error('Failed to parse AI response format');
      }

      const issues: ComplianceIssue[] = analysis.issues;

      // Validate issues array
      if (!Array.isArray(issues)) {
        throw new Error('Invalid response format: issues is not an array');
      }

      // Calculate statistics
      const highSeverity = issues.filter(i => i.severity === 'high').length;
      const mediumSeverity = issues.filter(i => i.severity === 'medium').length;
      const lowSeverity = issues.filter(i => i.severity === 'low').length;

      // Group issues by category
      const categoryCount = issues.reduce((acc: Record<string, number>, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
      }, {});

      return {
        analysis_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        filename: doc.filename,
        document_type: 'Personal Loan Agreement',
        issues,
        summary: {
          total_issues: issues.length,
          high_severity: highSeverity,
          medium_severity: mediumSeverity,
          low_severity: lowSeverity,
          compliance_score: Math.max(100 - (highSeverity * 10 + mediumSeverity * 5 + lowSeverity * 2), 0)
        },
        categories: Object.entries(categoryCount).map(([category, count]) => ({
          category,
          issues: count
        }))
      };
    } catch (error) {
      console.error('AI analysis failed:', error);

      if (error instanceof Error) {
        if (error.message.includes('Request failed with status code')) {
          throw new Error('Network error: Unable to connect to the AI service.');
        } else if (error.message.includes('API rate limit exceeded')) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else if (error.message.includes('Invalid API key')) {
          throw new Error('Invalid API key. Please check your API key settings.');
        } else if (error.message.includes('Failed to parse AI response')) {
          throw new Error('Invalid response format from AI service. Please try again.');
        }
      }

      throw new Error('Failed to analyze document with AI. Please try again.');
    }
  }
}