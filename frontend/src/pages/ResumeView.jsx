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
      <div className="min-h-screen bg-white flex items-center justify-center py-16">
        <div className="w-5 h-5 border-2 border-[#E5E5E5] border-t-[#18181B] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center py-16">
          <p className="text-sm text-[#DC2626] mb-4">{error || "Resume not found"}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-[#18181B] text-white text-sm font-medium rounded-md hover:bg-[#27272A] transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const parsedData = getParsedData(resume.parsed_data) || {};
  const isProcessing = !getParsedData(resume.parsed_data);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-sm text-[#999999] hover:text-[#111111] transition-colors mb-6">
          ← Back
        </button>

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">
                {parsedData.name || "Untitled Resume"}
              </h1>
              {parsedData.seniorityLevel && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#F7F7F7] text-[#555555]">
                  {parsedData.seniorityLevel}
                </span>
              )}
            </div>
            <p className="text-sm text-[#999999] mt-1">{resume.file_name}</p>
          </div>

          <button
            onClick={() => navigate("/interview/setup", { state: { resumeId: resume.id } })}
            disabled={isProcessing}
            className="px-4 py-2 bg-[#18181B] text-white text-sm font-medium rounded-md hover:bg-[#27272A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] w-full sm:w-auto shrink-0"
          >
            {isProcessing ? "Processing..." : "Start interview →"}
          </button>
        </div>

        {isProcessing && (
          <div className="border border-[#E5E5E5] bg-[#F7F7F7] rounded-lg p-4 mb-6">
            <p className="text-sm text-[#555555]">
              This resume is still being analyzed by AI. Some data may be missing.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Contact & Summary */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-[#E5E5E5] rounded-lg p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-[#999999] mb-3">Contact</p>
              <div className="space-y-2 text-sm text-[#555555]">
                <div className="flex justify-between"><span className="text-[#999999]">Email</span><span className="text-right">{parsedData.email || "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-[#999999]">Phone</span><span className="text-right">{parsedData.phone || "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-[#999999]">Location</span><span className="text-right">{parsedData.location || "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-[#999999]">Experience</span><span className="text-right">{parsedData.yearsOfExperience ? `${parsedData.yearsOfExperience} years` : "N/A"}</span></div>
              </div>
            </div>

            <div className="border border-[#E5E5E5] rounded-lg p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-[#999999] mb-3">Summary</p>
              <p className="text-sm text-[#555555] leading-relaxed">
                {parsedData.summary || "No summary provided."}
              </p>
            </div>
          </div>

          {/* Skills */}
          <div className="border border-[#E5E5E5] rounded-lg p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-[#999999] mb-3">Skills</p>
            <div className="flex flex-wrap gap-2">
              {parsedData.skills?.length > 0 ? (
                parsedData.skills.map((skill, index) => (
                  <span key={index} className="px-2.5 py-1 border border-[#E5E5E5] rounded-md text-xs text-[#555555]">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[#999999]">No skills detected.</p>
              )}
            </div>
          </div>

          {/* Work Experience */}
          {parsedData.experience?.length > 0 && (
            <div className="border border-[#E5E5E5] rounded-lg p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-[#999999] mb-3">Work Experience</p>
              <div className="space-y-6">
                {parsedData.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-[#E5E5E5] pl-4">
                    <h3 className="text-sm font-medium text-[#111111]">{exp.title}</h3>
                    <p className="text-xs text-[#999999] mt-0.5">{exp.company} • {exp.duration}</p>
                    {exp.responsibilities?.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {exp.responsibilities.map((resp, i) => (
                          <li key={i} className="text-sm text-[#555555] leading-relaxed relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-[#999999]">
                            {resp}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {parsedData.projects?.length > 0 && (
            <div className="border border-[#E5E5E5] rounded-lg p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-[#999999] mb-3">Projects</p>
              <div className="space-y-6">
                {parsedData.projects.map((project, index) => (
                  <div key={index} className="border-l-2 border-[#E5E5E5] pl-4">
                    <h3 className="text-sm font-medium text-[#111111]">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-[#555555] mt-1 leading-relaxed">{project.description}</p>
                    )}
                    {project.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.technologies.map((tech, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-xs font-medium bg-[#FFF7ED] text-[#C2410C]">
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
            <div className="border border-[#E5E5E5] rounded-lg p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-[#999999] mb-3">Education</p>
              <div className="space-y-4">
                {parsedData.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-[#E5E5E5] pl-4">
                    <h3 className="text-sm font-medium text-[#111111]">{edu.degree}</h3>
                    <p className="text-sm text-[#555555] mt-0.5">{edu.institution}</p>
                    {edu.year && <p className="text-xs text-[#999999] mt-0.5">{edu.year}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {parsedData.certifications?.length > 0 && (
            <div className="border border-[#E5E5E5] rounded-lg p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-[#999999] mb-3">Certifications</p>
              <div className="space-y-4">
                {parsedData.certifications.map((cert, index) => (
                  <div key={index} className="border-l-2 border-[#E5E5E5] pl-4">
                    <h3 className="text-sm font-medium text-[#111111]">{cert.name}</h3>
                    <p className="text-sm text-[#555555] mt-0.5">{cert.organization}</p>
                    {cert.year && <p className="text-xs text-[#999999] mt-0.5">{cert.year}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResumeView;
