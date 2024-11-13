export interface DocumentSection {
  type: "heading" | "paragraph" | "list" | "table";
  content: string;
  pageNumber: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DocumentAnalysis {
  documentId: string;
  filename: string;
  totalPages: number;
  sections: DocumentSection[];
  metadata: {
    title?: string;
    author?: string;
    creationDate?: string;
    modificationDate?: string;
  };
}
