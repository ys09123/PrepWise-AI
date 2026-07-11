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

  const progress = (currentIndex / totalQuestions) * 100;

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
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-[#111111]">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-[#999999]">{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-[#F7F7F7] h-1 rounded-full overflow-hidden">
            <div
              className="bg-[#111111] h-1 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Area */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="border border-[#E5E5E5] px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wide text-[#555555]">
              {currentQuestion?.category}
            </span>
            <span className="border border-[#E5E5E5] px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wide text-[#555555]">
              {currentQuestion?.difficulty}
            </span>
          </div>

          <h2 className="text-2xl font-medium tracking-tight text-[#111111] leading-tight mb-6">
            {currentQuestion?.question}
          </h2>

          {currentQuestion?.category === "behavioral" && (
            <div className="border border-[#E5E5E5] bg-[#F7F7F7] text-[#555555] text-sm p-4 rounded-lg">
              Tip: Use the STAR method (Situation, Task, Action, Result) to structure your response.
            </div>
          )}
        </div>

        {/* Answer Area */}
        <div className="mb-6">
          <textarea
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setError("");
            }}
            placeholder="Type your answer here. Take your time and think before answering..."
            className="w-full min-h-[240px] p-4 border border-[#E5E5E5] rounded-lg text-sm text-[#111111] focus:border-[#111111] focus:ring-0 outline-none resize-y transition-colors placeholder:text-[#999999]"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-[#999999]">{answer.length} characters</p>
            <p className="text-xs text-[#999999]">
              {answer.length < 50 && "Aim for at least 50 characters"}
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-[#DC2626] mb-6">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting || completing || !answer.trim()}
          className="w-full px-4 py-3 bg-[#18181B] text-white text-sm font-medium rounded-md hover:bg-[#27272A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {completing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#E5E5E5] border-t-[#18181B] rounded-full animate-spin" />
              <span>Evaluating your answers with AI...</span>
            </div>
          ) : submitting ? (
            "Submitting..."
          ) : currentIndex === totalQuestions - 1 ? (
            "Submit final answer & get results →"
          ) : (
            "Submit answer →"
          )}
        </button>
      </div>
    </div>
  );
};

export default Interview;
