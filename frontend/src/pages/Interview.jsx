import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";

const Interview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionData = location.state?.session;

  const [session, setSession] = useState(sessionData);
  const [currentQuestion, setCurrentQuestion] = useState(
    sessionData?.firstQuestion,
  );
  const [currentIndex, setCurrentIndex] = useState(
    sessionData?.currentIndex || 0,
  );
  const [totalQuestions, setTotalQuestions] = useState(
    sessionData?.totalQuestions || 8,
  );
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const categoryColors = {
    technical: "bg-blue-100 text-blue-700",
    behavioral: "bg-purple-100 text-purple-700",
    project: "bg-orange-100 text-orange-700",
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError("Please write your answer before submitting");
      return;
    }

    if (answer.trim().length < 10) {
      setError("Answer is too short. Please provide more details.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const data = await api.submitAnswer(session.id, currentIndex, answer);

      if (data.completed) {
        // All questions answered - evaluate
        setCompleting(true);
        const results = await api.completeInterview(session.id);
        navigate("/results", { state: { results: results.results } });
      } else {
        // Move to next question
        setCurrentQuestion(data.nextQuestion);
        setCurrentIndex(data.currentIndex);
        setAnswer("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-[#84a98c] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          {/* Category + Difficulty Badges */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                categoryColors[currentQuestion?.category] ||
                "bg-gray-100 text-gray-700"
              }`}
            >
              {currentQuestion?.category}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold capitalize">
              {currentQuestion?.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-xl md:text-2xl font-bold text-[#2f3e46] leading-relaxed">
            {currentQuestion?.question}
          </h2>

          {/* Hint for behavioral */}
          {currentQuestion?.category === "behavioral" && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-600 font-medium">
                💡 Tip: Use the STAR method — Situation, Task, Action, Result
              </p>
            </div>
          )}
        </div>

        {/* Answer Area */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Your Answer
          </label>
          <textarea
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setError("");
            }}
            placeholder="Type your answer here. Take your time and think before answering..."
            rows={8}
            className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#84a98c] focus:border-transparent text-gray-700"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">{answer.length} characters</p>
            <p className="text-xs text-gray-500">
              {answer.length < 50 && "Aim for at least 50 characters"}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting || completing || !answer.trim()}
          className="w-full py-3 bg-[#84a98c] text-white rounded-lg font-semibold hover:bg-[#6b8e73] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
        >
          {completing ? (
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
              Evaluating your answers with AI...
            </span>
          ) : submitting ? (
            "Submitting..."
          ) : currentIndex === totalQuestions - 1 ? (
            "Submit Final Answer & Get Results →"
          ) : (
            "Submit Answer → Next Question"
          )}
        </button>
      </div>
    </div>
  );
};

export default Interview;
