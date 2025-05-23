import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

interface UploadDocumentDialogProps {
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
  onUpload: (file: File, title: string) => Promise<void>;
}

const UploadDocumentDialog = ({
  isVisible,
  setVisible,
  onUpload,
}: UploadDocumentDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Set default title as filename without extension
      const fileName = file.name;
      const nameWithoutExt =
        fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
      setTitle(nameWithoutExt);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Set default title as filename without extension
      const fileName = file.name;
      const nameWithoutExt =
        fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
      setTitle(nameWithoutExt);
    }
  };

  const handleUpload = async () => {
    if (selectedFile && title.trim()) {
      await onUpload(selectedFile, title.trim());
      setSelectedFile(null);
      setTitle("");
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setTitle("");
    setVisible(false);
  };

  const isFormValid = selectedFile && title.trim();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Tải lên tài liệu
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Title Input */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tiêu đề tài liệu
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề tài liệu..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-700">{selectedFile.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setTitle("");
                  }}
                  className="p-1 text-red-600 hover:bg-red-100 rounded-md"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={32} className="text-gray-400" />
                <p className="text-gray-600">
                  Kéo và thả tài liệu vào đây hoặc click để chọn tài liệu
                </p>
                <p className="text-sm text-gray-500">
                  Hỗ trợ: PDF, DOC, DOCX, TXT
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleUpload}
              disabled={!isFormValid}
              className={`px-4 py-2 rounded-md transition-colors ${
                isFormValid
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Tải lên
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentDialog;
