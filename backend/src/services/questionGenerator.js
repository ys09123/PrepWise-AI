const geminiService = require("./geminiService");

class QuestionGenerator {
  /**
   * Generate personalized interview questions based on resume data
   * @param {Object} resumeData - Parsed resume data from aiResumeParser
   * @param {string} focusArea - "technical", "behavioral", or "mixed"
   * @param {string} difficulty - "easy", "medium", or "hard"
   * @returns {Promise<Array>} - Array of 8 question objects
   */
  async generate(resumeData, focusArea = "mixed", difficulty = "medium") {
    const {
      skills,
      summary,
      experience,
      education,
      projects,
      certifications,
      yearsOfExperience,
      seniorityLevel,
    } = resumeData;

    // Build context from resume - handle both new (AI-parsed) and old (regex) formats
    const skillsList =
      Array.isArray(skills) && skills.length > 0
        ? skills.join(", ")
        : "general programming";

    // Build experience context
    const experienceText =
      Array.isArray(experience) && experience.length > 0
        ? experience
            .map((e) => {
              const resp = e.responsibilities?.slice(0, 2).join("; ") || "";
              const tech = e.technologies?.join(", ") || "";
              return `${e.title} at ${e.company} (${e.duration}): ${resp}. Technologies: ${tech}`;
            })
            .join("\n")
        : resumeData.rawSections?.experience ||
          "No detailed experience available";

    // Build projects context
    const projectsText =
      Array.isArray(projects) && projects.length > 0
        ? projects
            .map(
              (p) =>
                `${p.name}: ${p.description}. Built with ${p.technologies?.join(", ")}`,
            )
            .join("\n")
        : resumeData.rawSections?.projects || "No projects listed";

    // Build education context
    const educationText =
      Array.isArray(education) && education.length > 0
        ? education
            .map((e) => `${e.degree} from ${e.institution} (${e.year})`)
            .join("; ")
        : resumeData.rawSections?.education || "No education details";

    // Build certifications context
    const certText =
      Array.isArray(certifications) && certifications.length > 0
        ? certifications.map((c) => `${c.name} (${c.organization})`).join("; ")
        : "None";

    const prompt = `You are an expert technical interviewer. Generate personalized interview questions based on this candidate's resume.

CANDIDATE PROFILE:
- Skills: ${skillsList}
- Seniority: ${seniorityLevel || "Unknown"} (${yearsOfExperience || "Unknown"} years experience)
- Summary: ${summary || "Not provided"}

WORK EXPERIENCE:
${experienceText}

PROJECTS:
${projectsText}

EDUCATION:
${educationText}

CERTIFICATIONS: ${certText}

INTERVIEW CONFIGURATION:
- Focus Area: ${focusArea}
- Difficulty Level: ${difficulty}

INSTRUCTIONS:
Generate EXACTLY 8 interview questions following these rules:

1. FOCUS AREA DISTRIBUTION:
   - If "technical": 6 technical questions + 2 behavioral questions
   - If "behavioral": 2 technical questions + 6 behavioral questions
   - If "mixed": 4 technical + 2 behavioral + 2 project-based questions

2. DIFFICULTY LEVELS:
   - "easy": Foundational concepts, basic definitions, simple scenarios
     Example: "Explain what REST API is and why it's useful"
   - "medium": Applied knowledge, scenario-based problems, intermediate concepts
     Example: "How would you optimize database queries in a high-traffic application?"
   - "hard": System design, complex scenarios, deep technical knowledge, architecture decisions
     Example: "Design a distributed caching system for a global e-commerce platform"

3. PERSONALIZATION - THIS IS CRITICAL:
   - Reference their ACTUAL job titles, companies, and projects by name
   - Ask about SPECIFIC technologies they listed (not generic ones they didn't mention)
   - For experience questions, reference their real responsibilities
   - For project questions, reference their actual project names and tech stacks
   
   GOOD: "You mentioned building a microservices architecture at Tech Corp. Can you explain your API gateway design?"
   BAD: "Tell me about microservices" (too generic)

4. QUESTION REQUIREMENTS:
   - All questions must be open-ended (no yes/no answers)
   - Each question should require 2-4 minutes to answer properly
   - For behavioral questions, guide toward STAR format (Situation, Task, Action, Result)
   - Avoid questions about technologies they DON'T have on their resume

5. CATEGORIES:
   - "technical": About specific technologies, algorithms, system design, coding concepts, debugging
   - "behavioral": About teamwork, leadership, conflict resolution, learning experiences, failures
   - "project": Deep dive into their specific projects, architecture decisions, challenges, trade-offs

6. EXPECTED KEYWORDS:
   - List 3-5 keywords/concepts you'd expect in a strong answer
   - These help evaluate answer quality later
   - Be specific to the question topic

RETURN EXACTLY 8 QUESTIONS as a JSON array with no additional text.`;

    const outputDescription = `A JSON array with exactly 8 question objects. Each must have: id (number), category (string: technical/behavioral/project), question (string), followUp (string), expectedKeywords (array of strings), difficulty (string: easy/medium/hard)`;

    try {
      console.log(
        `Generating ${focusArea} interview questions at ${difficulty} difficulty...`,
      );

      const questions = await geminiService.generateJSONWithRetry(
        prompt,
        outputDescription,
      );

      // Validate response
      if (!Array.isArray(questions)) {
        console.error(
          "AI did not return an array. Received:",
          typeof questions,
        );
        throw new Error("AI did not return an array of questions");
      }
      if (questions.length !== 8) {
        console.warn(
          `Expected 8 questions, got ${questions.length}. Adjusting...`,
        );

        // If too few, pad with generic questions
        while (questions.length < 8) {
          questions.push({
            id: questions.length + 1,
            category: "technical",
            question:
              "Tell me about a challenging technical problem you solved recently.",
            followUp:
              "What would you do differently if you faced this problem again?",
            expectedKeywords: ["problem", "solution", "approach", "outcome"],
            difficulty: difficulty,
          });
        }

        // If too many, trim to 8
        if (questions.length > 8) {
          questions.length = 8;
        }
      }

      // Normalize and validate each question
      const normalizedQuestions = questions.map((q, index) => {
        // Validate category
        const validCategories = ["technical", "behavioral", "project"];
        const category = validCategories.includes(q.category)
          ? q.category
          : "technical";

        // Validate difficulty
        const validDifficulties = ["easy", "medium", "hard"];
        const questionDifficulty = validDifficulties.includes(q.difficulty)
          ? q.difficulty
          : difficulty;

        // Ensure expectedKeywords is an array
        const keywords = Array.isArray(q.expectedKeywords)
          ? q.expectedKeywords
          : [];

        return {
          id: index + 1,
          category: category,
          question: q.question || "Tell me about your experience.",
          followUp: q.followUp || "Can you elaborate on that?",
          expectedKeywords: keywords,
          difficulty: questionDifficulty,
        };
      });

      // Verify distribution matches focus area
      const distribution = this.getQuestionDistribution(normalizedQuestions);
      console.log(`✅ Generated questions distribution:`, distribution);

      console.log(
        `✅ Successfully generated ${normalizedQuestions.length} personalized questions`,
      );

      return normalizedQuestions;
    } catch (error) {
      console.error("❌ Question generation failed:", error.message);
      throw new Error(`Failed to generate questions: ${error.message}`);
    }
  }

  /**
   * Get distribution of question categories
   * @param {Array} questions - Array of question objects
   * @returns {Object} - Count of each category
   */
  getQuestionDistribution(questions) {
    return questions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Validate if question distribution matches focus area requirements
   * @param {Array} questions - Array of question objects
   * @param {string} focusArea - Expected focus area
   * @returns {boolean} - Whether distribution is valid
   */
  validateDistribution(questions, focusArea) {
    const dist = this.getQuestionDistribution(questions);

    const rules = {
      technical: { technical: 6, behavioral: 2 },
      behavioral: { technical: 2, behavioral: 6 },
      mixed: { technical: 4, behavioral: 2, project: 2 },
    };

    const expected = rules[focusArea];
    if (!expected) return false;

    // Allow some flexibility (±1 question per category)
    for (const [category, count] of Object.entries(expected)) {
      const actual = dist[category] || 0;
      if (Math.abs(actual - count) > 1) {
        console.warn(
          `Distribution mismatch for ${category}: expected ~${count}, got ${actual}`,
        );
        return false;
      }
    }

    return true;
  }
}

module.exports = new QuestionGenerator();
