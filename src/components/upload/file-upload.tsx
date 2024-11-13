import { useState } from "react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  loading: boolean;
}

export function FileUpload({ onFileSelected, loading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        onFileSelected(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        className="hidden"
        id="file-upload"
        disabled={loading}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">📄</div>
          <div className="text-gray-600">
            <span className="font-medium text-blue-600">Click to upload</span>{" "}
            or drag and drop a PDF file
          </div>
        </div>
      </label>
    </div>
  );
}