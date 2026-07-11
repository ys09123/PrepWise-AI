import { useNavigate, useLocation } from "react-router-dom";

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const results = location.state?.results;



  if (!results) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center py-16">
          <p className="text-sm text-[#DC2626] mb-4">No results found</p>
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

  // Safe data extraction with defaults
  const overallScore = results.overallScore || 0;
  const dimensionAverages = results.dimensionAverages || {
    clarity: 0,
    technicalDepth: 0,
    relevance: 0,
    confidence: 0,
  };
  const evaluations = results.evaluations || [];

  const dimensionLabels = {
    clarity: "Clarity",
    technicalDepth: "Technical depth",
    relevance: "Relevance",
    confidence: "Confidence",
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111111]">Interview complete!</h1>
          <p className="text-sm text-[#999999] mt-1 mb-8">Here's how you performed</p>
          
          <div>
            <h2 className="text-6xl font-medium tracking-tight text-[#111111] mb-2">{overallScore}</h2>
            <p className="text-sm text-[#999999]">Overall score</p>
          </div>
        </div>

        {/* Dimension Breakdown */}
        {dimensionAverages && Object.keys(dimensionAverages).length > 0 && (
          <div className="mb-12">
            <h3 className="text-sm font-medium text-[#111111] mb-4">Score breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(dimensionAverages).map(([key, value]) => (
                <div key={key} className="border border-[#E5E5E5] rounded-md p-4 text-center">
                  <p className="text-2xl font-medium text-[#111111] mb-1">{value || 0}</p>
                  <p className="text-xs text-[#999999]">{dimensionLabels[key] || key}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Review */}
        <div className="mb-10">
          <h3 className="text-sm font-medium text-[#111111] mb-4">Detailed review</h3>
          <div className="space-y-6">
            {evaluations.map((item, index) => {
              const question = item.question || {};
              const evaluation = item.evaluation || {};
              const scores = evaluation.scores || {};

              return (
                <div key={index} className="border border-[#E5E5E5] rounded-lg p-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#999999] mb-3">Question {index + 1}</p>
                  <p className="text-base font-medium text-[#111111] mb-6">{question.question}</p>

                  <div className="mb-6">
                    <p className="text-xs font-medium text-[#111111] mb-2">Your answer</p>
                    <div className="bg-[#F7F7F7] p-4 rounded-md text-sm text-[#555555]">
                      {item.answer}
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
                      <span className="text-xs text-[#999999]">Clarity: {scores.clarity || 0}</span>
                      <span className="text-xs text-[#999999]">Tech depth: {scores.technicalDepth || 0}</span>
                      <span className="text-xs text-[#999999]">Relevance: {scores.relevance || 0}</span>
                      <span className="text-xs text-[#999999]">Confidence: {scores.confidence || 0}</span>
                    </div>
                    {evaluation.detailedFeedback && (
                      <div className="bg-[#18181B] text-white p-4 rounded-md text-sm leading-relaxed">
                        {evaluation.detailedFeedback}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 border-t border-[#E5E5E5]">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full px-4 py-3 bg-[#18181B] text-white text-sm font-medium rounded-md hover:bg-[#27272A] transition-colors active:scale-[0.98]"
          >
            Back to dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default Results;
