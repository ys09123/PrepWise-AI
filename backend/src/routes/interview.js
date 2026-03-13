const express = require("express");
const { supabase } = require("../lib/supabase");
const questionGenerator = require("../services/questionGenerator");
const answerEvaluator = require("../services/answerEvaluator");

const router = express.Router();

// Authenticate user
async function authenticateUser(req, res, next) {
  if (req.method === "OPTIONS") return next();

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      error: "No authorization header",
    });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({
        error: "Invalid token",
      });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      error: "Authentication failed",
    });
  }
}

// Fetch resume
async function getResume(resumeId, userId) {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .single();

  if (error || !data) throw new Error("Resume not found");
  return data;
}

// Start new interview (generate questions)
router.post("/start", authenticateUser, async (req, res) => {
  try {
    const { resumeId, focusArea = "mixed", difficulty = "medium" } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        error: "Resume ID is required",
      });
    }

    const validFocus = ["technical", "behavioral", "mixed"];
    const validDifficulty = ["easy", "medium", "hard"];

    if (!validFocus.includes(focusArea)) {
      return res.status(400).json({
        error: "Invalid focus area",
      });
    }
    if (!validDifficulty.includes(difficulty)) {
      return res.status(400).json({
        error: "Invalid difficulty",
      });
    }

    console.log("Starting interview for resume: ", resumeId);

    const resume = await getResume(resumeId, req.user.id);

    let parsedData = resume.parsed_data;
    if (typeof parsedData === "string") {
      parsedData = JSON.parse(parsedData);
    }

    const questions = await questionGenerator.generate(
      parsedData,
      focusArea,
      difficulty,
    );

    console.log(`Generated ${questions.length} questions`);

    const { data: session, error } = await supabase
      .from("interview_sessions")
      .insert({
        user_id: req.user.id,
        resume_id: resumeId,
        focus_area: focusArea,
        difficulty: difficulty,
        status: "in_progress",
        questions: questions,
        answers: [],
      })
      .select()
      .single();

    if (error) {
      console.error("Database error: ", error);
      throw error;
    }

    console.log("Interview session created: ", session.id);

    res.json({
      success: true,
      session: {
        id: session.id,
        focusArea: session.focus_area,
        difficulty: session.difficulty,
        totalQuestions: questions.length,
        firstQuestion: questions[0],
        currentIndex: 0,
      },
    });
  } catch (err) {
    console.error("Start interview error: ", err);
    res.status(500).json({
      error: err.message || "Failed to start interview",
    });
  }
});

router.post("/:sessionId/answer", authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionIndex, answer } = req.body;

    if (!answer || answer.trim() === "") {
      return res.status(400).json({
        error: "Answer cannot be empty",
      });
    }

    const { data: session, error: fetchError } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", req.user.id)
      .single();

    if (fetchError || !session) {
      return res.status(404).json({
        error: "Session not found",
      });
    }

    if (session.status != "in_progress") {
      return res.status(400).json({
        error: "Interview is not in progress",
      });
    }

    const answers = session.answers || [];
    answers[questionIndex] = {
      text: answer.trim(),
      submittedAt: new Date().toISOString(),
    };

    const nextIndex = questionIndex + 1;
    const isLastQuestion = nextIndex >= session.questions.length;

    const { erro: updateError } = await supabase
      .from("interview_sessions")
      .update({
        answers: answers,
      })
      .eq("id", sessionId);

    if (updateError) throw updateError;

    console.log(
      `Answer ${questionIndex + 1}/${session.questions.length} saved for session ${sessionId}`,
    );

    if (isLastQuestion) {
      res.json({
        success: true,
        answered: nextIndex,
        total: session.questions.length,
        completed: true,
      });
    } else {
      res.json({
        success: true,
        answered: nextIndex,
        total: session.questions.length,
        completed: false,
        nextQuestion: session.questions[nextIndex],
        currentIndex: nextIndex,
      });
    }
  } catch (err) {
    console.error("Submit answer error: ", err);
    res.status(500).json({
      error: err.message || "Failed to submit answer",
    });
  }
});

router.post("/:sessionId/complete", authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log("Completing interview session: ", sessionId);

    const { data: session, error: fetchError } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", req.user.id)
      .single();

    if (fetchError || !session) {
      return res.status(404).json({
        error: "Session not found",
      });
    }

    if (session.status !== "in_progress") {
      return res.status(400).json({
        error: "Interview already completed",
      });
    }

    const resume = await getResume(session.resume_id, req.user.id);
    let parsedData = resume.parsed_data;
    if (typeof parsedData === "string") {
      parsedData = JSON.parse(parsedData);
    }
    console.log(
      `Evaluating ${session.answers?.length || 0} answers with AI...`,
    );

    const { evaluations, overallScore } = await answerEvaluator.evaluateAll(
      session.questions,
      session.answers,
      parsedData,
    );

    const dimesionAverages = answerEvaluator.getDimensionsAverages(evaluations);

    console.log("Evaluation complete. Overall score: ", overallScore);

    const { error: updateError } = await supabase
      .from("interview_sessions")
      .update({
        status: "completed",
        scores: {
          overall: overallScore,
          dimesions: dimesionAverages,
          evaluations: evaluations,
        },
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (updateError) throw updateError;

    res.json({
      success: true,
      results: {
        sessionId: sessionId,
        overallScore: overallScore,
        dimesionAverages: dimesionAverages,
        totalQuestions: session.questions.length,
        answeredQuestions: evaluations.length,
        evaluations: evaluations,
      },
    });
  } catch (err) {
    console.error("Complete interview error: ", err);
    res.status(500).json({
      error: err.message || "Failed to evaluate interview",
    });
  }
});

router.get("/history", authenticateUser, async (req, res) => {
  try {
    const { data: sessions, error } = await supabase
      .from("interview_sessions")
      .select(
        "id, focus_area, difficulty, status, scores, created_at, completed_at",
      )
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      sessions: sessions || [],
    });
  } catch (err) {
    console.error("Fetch history error:", err);
    res.status(500).json({ error: "Failed to fetch interview history" });
  }
});

router.get("/:sessionId/results", authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { data: session, error } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", req.user.id)
      .single();

    if (error || !session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({
      success: true,
      session: session,
    });
  } catch (err) {
    console.error("Fetch results error:", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

module.exports = router;