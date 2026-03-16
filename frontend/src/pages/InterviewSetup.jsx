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
      icon: "💻",
    },
    {
      value: "behavioral",
      label: "Behavioral",
      desc: "Teamwork, leadership, and problem-solving situations",
      icon: "🤝",
    },
    {
      value: "mixed",
      label: "Mixed",
      desc: "Balanced mix of technical and behavioral questions",
      icon: "⚖️",
    },
  ];

  const difficultyOptions = [
    {
      value: "easy",
      label: "Easy",
      desc: "Foundational concepts",
      color: "green",
    },
    {
      value: "medium",
      label: "Medium",
      desc: "Applied scenarios",
      color: "yellow",
    },
    {
      value: "hard",
      label: "Hard",
      desc: "System design & deep-dive",
      color: "red",
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-[#84a98c] hover:text-[#6b8e73] font-medium mb-4"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-[#2f3e46] mb-2">
            Interview Setup
          </h1>
          <p className="text-gray-600">
            Customize your mock interview experience
          </p>
        </div>

        {/* Focus Area */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-[#2f3e46] mb-4">Focus Area</h2>
          <div className="space-y-3">
            {focusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFocusArea(opt.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  focusArea === opt.value
                    ? "border-[#84a98c] bg-[#84a98c]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <p
                      className={`font-semibold ${
                        focusArea === opt.value
                          ? "text-[#84a98c]"
                          : "text-[#2f3e46]"
                      }`}
                    >
                      {opt.label}
                    </p>
                    <p className="text-sm text-gray-500">{opt.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-[#2f3e46] mb-4">Difficulty</h2>
          <div className="grid grid-cols-3 gap-3">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDifficulty(opt.value)}
                className={`text-center p-4 rounded-lg border-2 transition-all ${
                  difficulty === opt.value
                    ? "border-[#84a98c] bg-[#84a98c]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p
                  className={`font-semibold text-lg mb-1 ${
                    difficulty === opt.value
                      ? "text-[#84a98c]"
                      : "text-[#2f3e46]"
                  }`}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Start Button */}
        <div className="flex gap-4">
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex-1 py-3 bg-[#84a98c] text-white rounded-lg font-semibold hover:bg-[#6b8e73] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            {loading ? (
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
                Generating Questions...
              </span>
            ) : (
              "Start Interview →"
            )}
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
