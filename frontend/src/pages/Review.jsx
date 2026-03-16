import Slider from "react-slick";
import { useLocation, useNavigate } from "react-router-dom";

const Review = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const evaluations = location.state?.evaluations || [];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  if (!evaluations.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2 bg-[#84a98c] text-white rounded"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Question Review</h1>
        <div className="slider-container">
          <Slider {...settings}>
            {evaluations.map((item, index) => {
              const question = item.question || {};
              const evaluation = item.evaluation || {};
              const scores = evaluation.scores || {};

              return (
                <div key={index}>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-3">
                      Question {index + 1}
                    </h2>

                    <p className="font-medium mb-4">{question.question}</p>

                    <div className="bg-gray-100 p-4 rounded mb-4">
                      <p className="text-xs text-gray-500 mb-1">Your Answer</p>
                      <p>{item.answer}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-blue-50 rounded">
                        Clarity: {scores.clarity || 0}
                      </div>
                      <div className="p-3 bg-purple-50 rounded">
                        Tech Depth: {scores.technicalDepth || 0}
                      </div>
                      <div className="p-3 bg-orange-50 rounded">
                        Relevance: {scores.relevance || 0}
                      </div>
                      <div className="p-3 bg-green-50 rounded">
                        Confidence: {scores.confidence || 0}
                      </div>
                    </div>

                    {evaluation.detailedFeedback && (
                      <div className="bg-blue-50 p-4 rounded">
                        <p className="text-sm text-blue-700">
                          {evaluation.detailedFeedback}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 w-full py-3 bg-[#84a98c] text-white rounded"
        >
          Back to Results
        </button>
      </div>
    </div>
  );
};

export default Review;