import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { DocumentAnalysis, DocumentSection } from '@/types/document';

// Initialize PDF.js worker only on client side
if (typeof window !== 'undefined') {
  const pdfjsVersion = '3.11.174'; // Use the version that matches your pdfjs-dist version
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
          y: item.transform[5], // Vertical position
          x: item.transform[4], // Horizontal position
          fontSize: content.styles?.[item.fontName]?.fontSize || 12,
        }));

        // Group text into sections based on vertical spacing and font size
        let currentSection: DocumentSection = {
          type: 'paragraph',
          content: '',
          pageNumber: pageNum,
          boundingBox: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
          }
        };

        let lastY: number | null = null;
        let lastFontSize: number | null = null;

        textItems.forEach((item) => {
          // Detect section type based on font size and position
          const isNewSection = lastY !== null && 
            (Math.abs(item.y - lastY) > 20 || // New line
             (lastFontSize && item.fontSize > lastFontSize * 1.2)); // Larger font

          if (isNewSection && currentSection.content) {
            sections.push({
              ...currentSection,
              type: this.detectSectionType(currentSection.content, item.fontSize)
            });

            currentSection = {
              type: 'paragraph',
              content: '',
              pageNumber: pageNum,
              boundingBox: {
                x: item.x,
                y: item.y,
                width: 0,
                height: 0,
              }
            };
          }

          // Add text to current section
          if (currentSection.content) {
            currentSection.content += ' ';
          }
          currentSection.content += item.text.trim();

          // Update bounding box
          if (currentSection.boundingBox) {
            currentSection.boundingBox.width = Math.max(
              currentSection.boundingBox.width,
              item.x + (item.text.length * item.fontSize * 0.6) - currentSection.boundingBox.x
            );
            currentSection.boundingBox.height = Math.max(
              currentSection.boundingBox.height,
              item.y - currentSection.boundingBox.y
            );
          }

          lastY = item.y;
          lastFontSize = item.fontSize;
        });

        // Add last section of the page
        if (currentSection.content) {
          sections.push(currentSection);
        }
      }

      const metadata = await pdf.getMetadata().catch(() => ({}));

      return {
        documentId: crypto.randomUUID(),
        filename: file.name,
        totalPages,
        sections: sections.filter(section => section.content.trim().length > 0),
        metadata: {
          title: metadata.info?.Title || file.name,
          author: metadata.info?.Author,
          creationDate: metadata.info?.CreationDate,
          modificationDate: metadata.info?.ModDate,
        }
      };
    } catch (error) {
      console.error('Error analyzing PDF:', error);
      throw new Error('Failed to analyze PDF document. Please ensure it is a valid PDF file.');
    }
  }

  private detectSectionType(content: string, fontSize: number): 'heading' | 'paragraph' | 'list' {
    if (content.length < 50 && fontSize > 14) {
      return 'heading';
    }
    if (content.trim().startsWith('•') || content.trim().match(/^\d+\./)) {
      return 'list';
    }
    return 'paragraph';
  }
}