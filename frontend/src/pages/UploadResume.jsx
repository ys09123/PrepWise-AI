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
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#999999] hover:text-[#111111] transition-colors mb-6">
          ← Back
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">Upload resume</h1>
          <p className="text-sm text-[#999999] mt-1">
            Upload your resume to generate personalized interview questions
          </p>
        </div>

        <div className="border border-[#E5E5E5] rounded-lg p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
              dragActive
                ? "border-[#18181B] bg-[#F7F7F7]"
                : "border-[#E5E5E5] hover:border-[#D1D1D1]"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-3">
              <span className="text-2xl text-[#999999]">📄</span>

              {file ? (
                <div>
                  <p className="text-sm font-medium text-[#111111]">{file.name}</p>
                  <p className="text-xs text-[#999999] mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-[#111111]">Drag and drop your resume here</p>
                  <p className="text-xs text-[#999999] mt-1">or click to browse</p>
                </div>
              )}

              <label className="cursor-pointer mt-2">
                <span className="px-4 py-2 border border-[#E5E5E5] text-[#111111] text-sm font-medium rounded-md hover:border-[#D1D1D1] hover:bg-[#F7F7F7] transition-colors inline-block">
                  {file ? "Change file" : "Browse files"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf, .docx, .txt"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>

              <p className="text-xs text-[#999999] mt-2">
                Supported formats: PDF, DOCX, TXT (Max 5MB)
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-[#DC2626] mt-4">{error}</p>}

          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full mt-6 px-4 py-2 bg-[#18181B] text-white text-sm font-medium rounded-md hover:bg-[#27272A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#E5E5E5] border-t-[#18181B] rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                "Upload and parse"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
