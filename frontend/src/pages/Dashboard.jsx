import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { api } from "../services/api";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const data = await api.getResumes();
      setResumes(data.resumes || data);
      // const { resumes } = await api.getResumes();
      // setResumes(resumes);
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;

    try {
      await api.deleteResume(id);
      setResumes(resumes.filter((r) => r.id !== id));
    } catch (error) {
      alert("Failed to delete resume");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">Dashboard</h1>
            <p className="text-sm text-[#999999] mt-1">
              Welcome back, {user?.user_metadata?.name || user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 border border-[#E5E5E5] text-[#111111] text-sm font-medium rounded-md hover:border-[#D1D1D1] hover:bg-[#F7F7F7] transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Upload Button */}
        <div className="mb-10">
          <button
            onClick={() => navigate("/upload-resume")}
            className="px-4 py-2 bg-[#18181B] text-white text-sm font-medium rounded-md hover:bg-[#27272A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            Upload resume
          </button>
        </div>

        {/* Resumes List */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#999999] mb-3">Your Resumes</p>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-[#E5E5E5] border-t-[#18181B] rounded-full animate-spin" />
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-[#999999] mb-4">No resumes uploaded yet</p>
              <button
                onClick={() => navigate("/upload-resume")}
                className="px-4 py-2 bg-[#18181B] text-white text-sm font-medium rounded-md hover:bg-[#27272A] transition-colors"
              >
                Upload resume
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div key={resume.id} className="border border-[#E5E5E5] rounded-lg p-6 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-base font-medium text-[#111111] mb-1">
                      {resume.parsed_data?.name || resume.file_name}
                    </h3>
                    <p className="text-xs text-[#999999] mb-3">
                      {resume.file_name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {resume.parsed_data?.skills?.slice(0, 4).map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 border border-[#E5E5E5] rounded-md text-xs text-[#555555]">
                          {skill}
                        </span>
                      ))}
                      {resume.parsed_data?.skills?.length > 4 && (
                        <span className="px-2.5 py-1 border border-[#E5E5E5] rounded-md text-xs text-[#999999]">
                          +{resume.parsed_data.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/resume/${resume.id}`)}
                      className="px-4 py-2 border border-[#E5E5E5] text-[#111111] text-sm font-medium rounded-md hover:border-[#D1D1D1] hover:bg-[#F7F7F7] transition-colors w-full sm:w-auto"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="px-4 py-2 border border-[#FEE2E2] text-[#DC2626] text-sm font-medium rounded-md hover:bg-[#FEF2F2] transition-colors w-full sm:w-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
