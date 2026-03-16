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

        {/* Per-Question Breakdown */}
        {evaluations.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-[#2f3e46] mb-6">
              Question-by-Question Review
            </h2>
            <div className="space-y-6">
              {evaluations.map((item, index) => {
                // Safe access to nested properties
                const question = item.question || {};
                const evaluation = item.evaluation || {};
                const scores = evaluation.scores || {};
                const answer = item.answer || "No answer provided";

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Question Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                            Q{index + 1}
                          </span>
                          {question.category && (
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                                question.category === "technical"
                                  ? "bg-blue-100 text-blue-700"
                                  : question.category === "behavioral"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {question.category}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-[#2f3e46]">
                          {question.question || "Question not available"}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-bold px-4 py-2 rounded-full ${getScoreBg(
                          scores.overall || 0,
                        )} ${getScoreColor(scores.overall || 0)} whitespace-nowrap`}
                      >
                        {scores.overall || 0}/100
                      </span>
                    </div>

                    {/* Your Answer */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2">
                        YOUR ANSWER
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {answer}
                      </p>
                    </div>

                    {/* Dimension Scores */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">Clarity</p>
                        <p className="text-lg font-bold text-blue-600">
                          {scores.clarity || 0}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">Tech Depth</p>
                        <p className="text-lg font-bold text-purple-600">
                          {scores.technicalDepth || 0}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">Relevance</p>
                        <p className="text-lg font-bold text-orange-600">
                          {scores.relevance || 0}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">Confidence</p>
                        <p className="text-lg font-bold text-green-600">
                          {scores.confidence || 0}
                        </p>
                      </div>
                    </div>

                    {/* Strengths */}
                    {evaluation.strengths?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-green-600 mb-2 flex items-center gap-1">
                          ✓ STRENGTHS
                        </p>
                        <ul className="space-y-1">
                          {evaluation.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-green-700 ml-4">
                              • {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {evaluation.weaknesses?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                          ⚠ AREAS TO IMPROVE
                        </p>
                        <ul className="space-y-1">
                          {evaluation.weaknesses.map((w, i) => (
                            <li key={i} className="text-sm text-red-700 ml-4">
                              • {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {evaluation.suggestions?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1">
                          💡 SUGGESTIONS
                        </p>
                        <ul className="space-y-1">
                          {evaluation.suggestions.map((suggestion, i) => (
                            <li key={i} className="text-sm text-blue-700 ml-4">
                              • {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Detailed Feedback */}
                    {evaluation.detailedFeedback && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-semibold text-blue-600 mb-2">
                          💬 DETAILED FEEDBACK
                        </p>
                        <p className="text-sm text-blue-800 leading-relaxed">
                          {evaluation.detailedFeedback}
                        </p>
                      </div>
                    )}

                    {/* Keywords Coverage */}
                    {(evaluation.keywordsCovered?.length > 0 ||
                      evaluation.missedKeywords?.length > 0) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                          {evaluation.keywordsCovered?.map((kw, i) => (
                            <span
                              key={`covered-${i}`}
                              className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                            >
                              ✓ {kw}
                            </span>
                          ))}
                          {evaluation.missedKeywords?.map((kw, i) => (
                            <span
                              key={`missed-${i}`}
                              className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs line-through"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 py-3 bg-[#84a98c] text-white rounded-lg font-semibold hover:bg-[#6b8e73] transition-all shadow-md active:scale-95"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 py-3 border-2 border-[#84a98c] text-[#84a98c] rounded-lg font-semibold hover:bg-[#84a98c]/5 transition-all"
          >
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
