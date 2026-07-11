import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";

const InterviewSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resumeId = location.state?.resumeId;

  const [focusArea, setFocusArea] = useState("mixed");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!resumeId) {
    navigate("/dashboard");
    return null;
  }

  const focusOptions = [
    {
      value: "technical",
      label: "Technical",
      desc: "Deep dive into your technical skills and implementations",
    },
    {
      value: "behavioral",
      label: "Behavioral",
      desc: "Teamwork, leadership, and problem-solving situations",
    },
    {
      value: "mixed",
      label: "Mixed",
      desc: "Balanced mix of technical and behavioral questions",
    },
  ];

  const difficultyOptions = [
    {
      value: "easy",
      label: "Easy",
      desc: "Foundational concepts",
    },
    {
      value: "medium",
      label: "Medium",
      desc: "Applied scenarios",
    },
    {
      value: "hard",
      label: "Hard",
      desc: "System design & deep-dive",
    },
  ];

  const handleStart = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.startInterview(resumeId, focusArea, difficulty);
      console.log("Interview started:", data);
      navigate("/interview", { state: { session: data.session } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#999999] hover:text-[#111111] transition-colors mb-6">
          ← Back
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">Interview setup</h1>
          <p className="text-sm text-[#999999] mt-1">
            Customize your mock interview experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Focus Area */}
          <div className="border border-[#E5E5E5] rounded-lg p-6">
            <h2 className="text-base font-medium text-[#111111] mb-4">Focus area</h2>
            <div className="space-y-3">
              {focusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFocusArea(opt.value)}
                  className={`w-full text-left px-4 py-3 border rounded-md text-sm transition-colors ${
                    focusArea === opt.value
                      ? "border-[#18181B] bg-[#F7F7F7] text-[#111111]"
                      : "border-[#E5E5E5] text-[#555555] hover:border-[#D1D1D1]"
                  }`}
                >
                  <span className="font-medium text-[#111111]">{opt.label}</span>
                  <span className="block text-xs text-[#999999] mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="border border-[#E5E5E5] rounded-lg p-6">
            <h2 className="text-base font-medium text-[#111111] mb-4">Difficulty</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {difficultyOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDifficulty(opt.value)}
                  className={`w-full text-left px-4 py-3 border rounded-md text-sm transition-colors ${
                    difficulty === opt.value
                      ? "border-[#18181B] bg-[#F7F7F7] text-[#111111]"
                      : "border-[#E5E5E5] text-[#555555] hover:border-[#D1D1D1]"
                  }`}
                >
                  <span className="font-medium text-[#111111]">{opt.label}</span>
                  <span className="block text-xs text-[#999999] mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-[#DC2626]">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleStart}
              disabled={loading}
              className="px-4 py-2 bg-[#18181B] text-white text-sm font-medium rounded-md hover:bg-[#27272A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] w-full sm:w-auto"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#E5E5E5] border-t-[#18181B] rounded-full animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                "Start interview →"
              )}
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-[#E5E5E5] text-[#111111] text-sm font-medium rounded-md hover:border-[#D1D1D1] hover:bg-[#F7F7F7] transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
