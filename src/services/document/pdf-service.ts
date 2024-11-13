import { DocumentAnalysis, DocumentSection } from "@/types/document";
import * as pdfjs from "pdfjs-dist";

export class PDFService {
  async analyzePDF(file: File): Promise<DocumentAnalysis> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    const sections: DocumentSection[] = [];
    const totalPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      // Process text content into structured sections
      const textItems = content.items.map((item: any) => ({
        text: item.str,
        y: item.transform[5], // Vertical position
      }));

      // Group text into sections based on positioning and content
      let currentSection: DocumentSection = {
        type: "paragraph",
        content: "",
        pageNumber: pageNum,
      };

      textItems.forEach((item: any) => {
        if (item.text.trim()) {
          if (currentSection.content) {
            currentSection.content += " ";
          }
          currentSection.content += item.text;
        } else if (currentSection.content) {
          sections.push(currentSection);
          currentSection = {
            type: "paragraph",
            content: "",
            pageNumber: pageNum,
          };
        }
      });

      if (currentSection.content) {
        sections.push(currentSection);
      }
    }

    return {
      documentId: crypto.randomUUID(),
      filename: file.name,
      totalPages,
      sections,
      metadata: {
        creationDate: new Date().toISOString(),
      },
    };
  }
}
