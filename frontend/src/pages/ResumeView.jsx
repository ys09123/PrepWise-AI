import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const ResumeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const data = await api.getResume(id);
        console.log("Resume API data:", data);
        setResume(data.resume || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  const getParsedData = (value) => {
    if (!value) return null;

    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }

    return value;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#84a98c] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error || "Resume not found"}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-[#84a98c] text-white rounded-md hover:bg-[#6b8e73]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const parsedData = getParsedData(resume.parsed_data) || {};
  const isProcessing = !getParsedData(resume.parsed_data);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl px-6 mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 text-[#84a98c] hover:text-[#6b8e73] font-medium"
        >
          ← Back to Dashboard
        </button>
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2f3e46]">
              {parsedData.name || "Untitled Resume"}
            </h1>
            <p className="text-gray-600 text-sm">
              Filename: {resume.file_name}
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/interview/start", { state: { resumeId: resume.id } })
            }
            disabled={isProcessing}
            className={`px-6 py-3 text-white rounded-md font-semibold shadow-md ${
              isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#84a98c] hover:bg-[#6b8e73]"
            }`}
          >
            {isProcessing ? "Processing..." : "Start Interview →"}
          </button>
        </div>

        {/* Processing Warning */}
        {isProcessing && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-sm text-yellow-700">
              This resume is still being analyzed by AI. Some data may be
              missing.
            </p>
          </div>
        )}

        {/* Profile Overview */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-[#2f3e46] mb-6">
            Profile Overview
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Contact</h3>
              <p className="text-sm">
                <b>Email:</b> {parsedData.email || "N/A"}
              </p>
              <p className="text-sm">
                <b>Phone:</b> {parsedData.phone || "N/A"}
              </p>
              <p className="text-sm">
                <b>Location:</b> {parsedData.location || "N/A"}
              </p>
              <p className="text-sm">
                <b>Experience:</b>{" "}
                {parsedData.yearsOfExperience
                  ? `${parsedData.yearsOfExperience} years`
                  : "N/A"}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Summary</h3>
              <p className="text-sm text-gray-600">
                {parsedData.summary || "No summary provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-[#2f3e46] mb-4">Skills</h2>

          <div className="flex flex-wrap gap-2">
            {parsedData.skills?.length > 0 ? (
              parsedData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#84a98c]/10 text-[#2f3e46] rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No skills detected</p>
            )}
          </div>
        </div>

        {/* Projects */}
        {parsedData.projects?.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <h2 className="text-xl font-bold text-[#2f3e46] mb-4">Projects</h2>

            <div className="space-y-4">
              {parsedData.projects.map((project, index) => (
                <div key={index} className="border-l-4 border-[#84a98c] pl-4">
                  <p className="font-semibold text-[#2f3e46]">{project.name}</p>

                  {project.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {project.description}
                    </p>
                  )}

                  {project.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs bg-gray-100 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {parsedData.education?.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <h2 className="text-xl font-bold text-[#2f3e46] mb-4">Education</h2>

            {parsedData.education.map((edu, index) => (
              <div
                key={index}
                className="border-l-4 border-[#84a98c] pl-4 mb-3"
              >
                <p className="font-semibold">{edu.degree}</p>
                <p className="text-sm text-gray-600">{edu.institution}</p>
                {edu.year && (
                  <p className="text-xs text-gray-500">{edu.year}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeView;
