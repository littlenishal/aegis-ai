// src/services/document/pdf-service.ts
import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { DocumentAnalysis, DocumentSection } from '@/types/document';

// Initialize PDF.js worker only on client side
if (typeof window !== 'undefined') {
  const pdfjsVersion = '3.11.174';
  GlobalWorkerOptions.workerSrc = 
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
}

interface PDFTextItem extends TextItem {
  str: string;
  transform: number[];
}

interface PDFPageContent {
  items: PDFTextItem[];
  styles?: Record<string, any>;
}

interface PDFMetadata {
  info?: {
    Title?: string;
    Author?: string;
    CreationDate?: string;
    ModDate?: string;
  };
  metadata?: any;
}

export class PDFService {
  async analyzePDF(file: File): Promise<DocumentAnalysis> {
    if (typeof window === 'undefined') {
      throw new Error('PDF analysis is only available in browser environment');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;

      const sections: DocumentSection[] = [];
      const totalPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent() as PDFPageContent;

        // Process text content into structured sections
        const textItems = content.items.map((item: PDFTextItem) => ({
          text: item.str,
          y: item.transform[5],
          x: item.transform[4],
          fontSize: content.styles?.[item.fontName]?.fontSize || 12,
        }));

        let currentSection: DocumentSection = this.createNewSection(pageNum);
        let lastY: number | null = null;
        let lastFontSize: number | null = null;

        textItems.forEach((item) => {
          if (this.shouldCreateNewSection(lastY, lastFontSize, item.y, item.fontSize)) {
            if (currentSection.content) {
              sections.push(this.finalizeSection(currentSection, item.fontSize));
            }
            currentSection = this.createNewSection(pageNum, item);
          }

          this.addTextToSection(currentSection, item);
          lastY = item.y;
          lastFontSize = item.fontSize;
        });

        if (currentSection.content) {
          sections.push(currentSection);
        }
      }

      const metadata = await this.getDocumentMetadata(pdf);

      return {
        documentId: crypto.randomUUID(),
        filename: file.name,
        totalPages,
        sections: sections.filter(section => section.content.trim().length > 0),
        metadata: {
          title: metadata?.info?.Title || file.name,
          author: metadata?.info?.Author || undefined,
          creationDate: metadata?.info?.CreationDate,
          modificationDate: metadata?.info?.ModDate,
        }
      };
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      throw new Error('Failed to analyze PDF document. Please ensure it is a valid PDF file.');
    }
  }

  private createNewSection(pageNum: number, item?: { x: number; y: number }): DocumentSection {
    return {
      type: 'paragraph',
      content: '',
      pageNumber: pageNum,
      boundingBox: item ? {
        x: item.x,
        y: item.y,
        width: 0,
        height: 0,
      } : {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      }
    };
  }

  private shouldCreateNewSection(
    lastY: number | null,
    lastFontSize: number | null,
    itemY: number,
    itemFontSize: number
  ): boolean {
    if (lastY !== null) {
      // Explicitly check if lastFontSize is not null before using it.
      return (Math.abs(itemY - lastY) > 20 || (lastFontSize !== null && itemFontSize > lastFontSize * 1.2));
    } else {
      return false;
    }
  }

  private addTextToSection(
    section: DocumentSection,
    item: { text: string; x: number; y: number; fontSize: number }
  ): void {
    if (section.content) {
      section.content += ' ';
    }
    section.content += item.text.trim();

    if (section.boundingBox) {
      section.boundingBox.width = Math.max(
        section.boundingBox.width,
        item.x + (item.text.length * item.fontSize * 0.6) - section.boundingBox.x
      );
      section.boundingBox.height = Math.max(
        section.boundingBox.height,
        item.y - section.boundingBox.y
      );
    }
  }

  private finalizeSection(
    section: DocumentSection,
    fontSize: number
  ): DocumentSection {
    return {
      ...section,
      type: this.detectSectionType(section.content, fontSize)
    };
  }

  private async getDocumentMetadata(pdf: PDFDocumentProxy): Promise<PDFMetadata> {
    try {
      return await pdf.getMetadata();
    } catch {
      return {};
    }
  }

  private detectSectionType(
    content: string,
    fontSize: number
  ): 'heading' | 'paragraph' | 'list' {
    if (content.length < 50 && fontSize > 14) {
      return 'heading';
    }
    if (content.trim().startsWith('•') || content.trim().match(/^\d+\./)) {
      return 'list';
    }
    return 'paragraph';
  }
}