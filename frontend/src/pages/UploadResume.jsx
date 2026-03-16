import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, DOCX, or TXT file");
      return;
    }

    if (selectedFile.size > maxSize) {
      setError("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0])
      validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const result = await api.uploadResume(file);
      console.log("Upload successful: ", result);

      // Navigate to resume view page
      navigate(`/resume/${result.resume.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2f3e46] mb-2">
            Upload Your Resume
          </h1>
          <p className="text-gray-600">
            Upload Your Resume to generate personalized interview questions
          </p>
        </div>

        {/* Upload card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Drag and drop zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              dragActive
                ? "border-[#84a98c]/5"
                : "border-gray-300 hover:border-[#84a98c]"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              {/* Icon */}
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>

              {file ? (
                <div className="text-center">
                  <p className="text-lg font-semibold text-[#2f3e46]">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-700">
                    Drag and drop your resume here
                  </p>
                  <p className="text-sm text-gray-500">or</p>
                </>
              )}

              {/* File input */}
              <label className="cursor-pointer">
                <span className="px-6 py-2 bg-[#84a98c] text-white rounded-md hover:bg-[#6b8e73] transition-all inline-block font-medium">
                  {file ? "Choose Different File" : "Browse Files"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf, .docx, .txt"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>

              <p className="text-xs text-gray-500 mt-2">
                Supported formats: PDF, DOCX, TXT (Max 5MB)
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Upload button */}
          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full mt-6 py-3 bg-[#84a98c] text-white rounded-md font-semibold hover:bg-[#6b8e73] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Upload and Parse Resume"
              )}
            </button>
          )}
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 text-[#84a98c] hover:text-[#6b8e73] font-medium"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default UploadResume;
