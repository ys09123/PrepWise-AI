const { geminiService } = require("../services/geminiService");

class AnswerEvaluator {
  /**
   * Evaluate a single answer
   * @param {Object} question - The question object
   * @param {string} answer - The candidate's answer text
   * @param {Object} resumeData - Resume context for evaluation
   * @returns {Promise<Object>} - Evaluation with scores and feedback
   */
  async evaluate(question, answer, resumeData) {
    const prompt = `You are an expert interviewer evaluating a candidate's answer.
    QUESTION DETAILS:
    - Question: ${question.question}
    - Category: ${question.category}
    - Difficulty: ${question.difficulty}
    - Expected Keywords: ${question.expectedKeywords?.join(", ") || "N/A"}

    CANDIDATE CONTEXT:
    - Skills: ${resumeData.skills?.join(", ") || "N/A"}
    - Experience Level: ${resumeData.seniorityLevel || "Unknown"} (${resumeData.yearsOfExperience || "Unknown"} years)

    CANDIDATE'S ANSWER:
    "${answer}"

    EVALUATION INSTRUCTIONS:
    Score each dimension from 0 to 100.

    1. CLARITY (weight: 25%)
      - Is the answer well-structured and easy to follow?
      - Is the language clear and professional?
      - 90-100: Exceptionally clear and organized
      - 70-89: Mostly clear with minor issues
      - 50-69: Somewhat unclear or disorganized
      - 0-49: Confusing or very poorly structured

    2. TECHNICAL_DEPTH (weight: 35%)
      - Is the information technically accurate?
      - Does it show deep understanding or surface-level knowledge?
      - Are specific examples or implementation details provided?
      - 90-100: Deep expertise with specific examples
      - 70-89: Solid knowledge with some examples
      - 50-69: Basic understanding, lacks depth
      - 0-49: Incorrect or very vague

    3. RELEVANCE (weight: 25%)
      - Does it directly address what was asked?
      - Are all parts of the question covered?
      - 90-100: Fully answers every aspect
      - 70-89: Addresses most parts
      - 50-69: Partially answers
      - 0-49: Off-topic or incomplete
    4. CONFIDENCE (weight: 15%)
      - Does the candidate sound decisive?
      - Do they acknowledge gaps honestly?
      - 90-100: Very confident and honest
      - 70-89: Generally confident
      - 50-69: Some hesitation
      - 0-49: Very uncertain
    
    Calculate overall as:
    overall = (clarity * 0.25) + (technicalDepth * 0.35) + (relevance * 0.25) + (confidence * 0.15)
    Round to nearest integer.

    Return a single JSON object with the evaluation.`;

    const outputDescription = `A single JSON object with this structure: scores object containing clarity, technicalDepth, relevance, confidence, overall (all numbers 0-100), strengths array, weaknesses array, suggestions array, keywordsCovered array, missedKeywords array, detailedFeedback string`;

    try {
      const evaluation = await geminiService.generateJSON(
        prompt,
        outputDescription,
      );
      if (!evaluation.scores) {
        throw new Error("AI did not return valid evaluation scores");
      }

      const clamp = (n) => Math.min(100, Math.max(0, Math.round(n || 0)));

      evaluation.scores = {
        clarity: clamp(evaluation.scores.clarity),
        technicalDepth: clamp(evaluation.scores.technicalDepth),
        relevance: clamp(evaluation.scores.relevance),
        confidence: clamp(evaluation.scores.confidence),
        overall: clamp(evaluation.scores.overall),
      };

      evaluation.strengths = Array.isArray(evaluation.strengths)
        ? evaluation.strengths
        : [];
      evaluation.weaknesses = Array.isArray(evaluation.weaknesses)
        ? evaluation.weaknesses
        : [];
      evaluation.suggestions = Array.isArray(evaluation.suggestions)
        ? evaluation.suggestions
        : [];
      evaluation.keywordsCovered = Array.isArray(evaluation.keywordsCovered)
        ? evaluation.keywordsCovered
        : [];
      evaluation.missedKeywords = Array.isArray(evaluation.missedKeywords)
        ? evaluation.missedKeywords
        : [];
      evaluation.detailedFeedback =
        evaluation.detailedFeedback || "No detailed feedback provided.";

      return evaluation;
    } catch (error) {
      console.error("Answer evaluation failed: ", error.message);
      throw new Error(`Failed to evaluate answer: ${error.message}`);
    }
  }
  /**
   * Evaluate all answers in an interview session
   * @param {Array} questions - Array of question objects
   * @param {Array} answers - Array of answer objects with text
   * @param {Object} resumeData - Resume context
   * @returns {Promise<Object>} - Evaluations and overall score
   */
  async evaluateAll(questions, answers, resumeData) {
    const evaluations = [];

    console.log(`Starting evaluation of ${answers.length} answers...`);

    for (let i = 0; i < answers.length; i++) {
      const question = questions[i];
      const answer = answers[i];

      if (!answer || !answer.text || answer.text.trim().length === 0) {
        console.log(`Skipping answer ${i + 1} - no text provided`);
        continue;
      }
      try {
        console.log(`Evaluating answer ${i + 1}/${answers.length}...`);
        const evaluation = await this.evaluate(
          question,
          answer.text,
          resumeData,
        );

        evaluations.push({
          questionIndex: i,
          question: question,
          answer: answer.text,
          evaluation: evaluation,
        });

        if (i < answers.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (err) {
        console.error(`Failed to evaluate answer ${i + 1}: `, err.message);
      }
    }
    console.log(`✅ Successfully evaluated ${evaluations.length} answers`);

    const overallScore = this.calculateOverallScore(evaluations);

    return { evaluations, overallScore };
  }

  /**
   * Calculate overall interview score from all evaluations
   * @param {Array} evaluations - Array of evaluation objects
   * @returns {number} - Overall score 0-100
   */
  calculateOverallScore(evaluations) {
    if (evaluations.length === 0) return 0;

    const total = evaluation.reduce(
      (sum, e) => sum + (e.evaluation?.scores?.overall || 0),
      0,
    );

    return Math.round(total / evaluations.length);
  }

  /**
   * Get average scores for each dimension
   * @param {Array} evaluations - Array of evaluation objects
   * @returns {Object} - Average scores per dimension
   */
  getDimensionsAverages(evaluations) {
    if (evaluations.length === 0) {
      return {
        clarity: 0,
        technicalDepth: 0,
        relevance: 0,
        confidence: 0,
      };
    }

    const dimensions = ["clarity", "technicalDepth", "relevance", "confidence"];
    const averages = {};

    dimensions.forEach((dim) => {
      const scores = evaluations.map((e) => e.evaluation?.scores?.[dim] || 0);
      averages[dim] = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length,
      );
    });
  }
}

module.exports = new AnswerEvaluator();
