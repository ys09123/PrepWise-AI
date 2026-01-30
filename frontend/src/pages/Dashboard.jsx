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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-[#84a98c] rounded-lg shadow-xl p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-[#cad2c5]">
              Welcome back, {user?.user_metadata?.name || user?.email}!
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full md:w-auto px-8 py-2 border-2 border-white rounded-md hover:bg-white hover:text-[#84a98c] transition-all font-semibold active:scale-95"
          >
            Sign Out
          </button>
        </div>
        {/* Upload Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/upload-resume")}
            className="w-full md:w-auto px-8 py-3 bg-[#84a98c] text-white rounded-md hover:bg-[#6b8e73] transition-all font-semibold shadow-md flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload New Resume
          </button>
        </div>

        {/* Resumes List */}
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-[#2f3e46] mb-6">
            Your Resumes
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#84a98c] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No resumes uploaded yet</p>
              <button
                onClick={() => navigate("/upload-resume")}
                className="px-6 py-2 bg-[#84a98c] text-white rounded-md hover:bg-[#6b8e73] transition-all"
              >
                Upload Your First Resume
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#84a98c] transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#2f3e46] mb-1">
                        {resume.parsed_data?.name || resume.file_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {resume.file_name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {resume.parsed_data?.skills
                          ?.slice(0, 3)
                          .map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-[#84a98c]/10 text-[#2f3e46] rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        {resume.parsed_data.skills?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{resume.parsed_data.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => navigate(`/resume/${resume.id}`)}
                        className="flex-1 md:flex-none px-4 py-2 bg-[#84a98c] text-white rounded hover:bg-[#6b8e73] transition-all text-sm font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(resume.id)}
                        className="flex-1 md:flex-none px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-all text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
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
