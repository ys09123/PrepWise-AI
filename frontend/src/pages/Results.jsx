import { useNavigate, useLocation } from "react-router-dom";

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const results = location.state?.results;

  // Debug: log the actual structure
  console.log("Results data:", results);

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">No results found</p>
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

  // Safe data extraction with defaults
  const overallScore = results.overallScore || 0;
  const dimensionAverages = results.dimensionAverages || {
    clarity: 0,
    technicalDepth: 0,
    relevance: 0,
    confidence: 0,
  };
  const evaluations = results.evaluations || [];
  const totalQuestions = results.totalQuestions || 0;
  const answeredQuestions = results.answeredQuestions || evaluations.length;

  // Score color logic
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getPerformanceLabel = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  const dimensionLabels = {
    clarity: "Clarity",
    technicalDepth: "Technical Depth",
    relevance: "Relevance",
    confidence: "Confidence",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6 text-center">
          <h1 className="text-3xl font-bold text-[#2f3e46] mb-2">
            Interview Complete! 🎉
          </h1>
          <p className="text-gray-500 mb-6">Here's how you performed</p>

          {/* Overall Score Circle */}
          <div
            className={`inline-flex items-center justify-center w-40 h-40 rounded-full ${getScoreBg(overallScore)} mb-4`}
          >
            <div className="text-center">
              <p
                className={`text-6xl font-bold ${getScoreColor(overallScore)}`}
              >
                {overallScore}
              </p>
              <p className="text-xs text-gray-500">/ 100</p>
            </div>
          </div>

          <p
            className={`text-2xl font-semibold ${getScoreColor(overallScore)} mb-2`}
          >
            {getPerformanceLabel(overallScore)}
          </p>
          <p className="text-sm text-gray-500">
            {answeredQuestions} of {totalQuestions} questions answered
          </p>
        </div>

        {/* Dimension Breakdown */}
        {dimensionAverages && Object.keys(dimensionAverages).length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-[#2f3e46] mb-6">
              Score Breakdown
            </h2>
            <div className="space-y-5">
              {Object.entries(dimensionAverages).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {dimensionLabels[key] || key}
                    </span>
                    <span
                      className={`text-sm font-bold ${getScoreColor(value || 0)}`}
                    >
                      {value || 0}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${
                        (value || 0) >= 80
                          ? "bg-green-500"
                          : (value || 0) >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${value || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 py-3 bg-[#84a98c] text-white rounded-lg font-semibold hover:bg-[#6b8e73]"
          >
            Back to Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/review", {
                state: { evaluations },
              })
            }
            className="flex-1 py-3 border-2 border-[#84a98c] text-[#84a98c] rounded-lg font-semibold"
          >
            Review Answers
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
