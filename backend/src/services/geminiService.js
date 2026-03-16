const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: "application/json"
      },
    });
  }

  async generate(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini generate error:", error.message);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  async generateJSON(prompt, outputDescription = "JSON") {
    try {
      const fullPrompt = `${prompt}

  CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanations.
  Expected format: ${outputDescription}

  IMPORTANT:
  Ensure all strings use double quotes.
  Escape quotes inside text.
  `;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      let text = response.text();

      // Clean up response
      text = text.trim();

      // Remove markdown code blocks if present
      text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");

      // Remove any leading/trailing text
      const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }
      console.log("RAW GEMINI RESPONSE:\n", text);
      if (!text.endsWith("}") && !text.endsWith("]")) {
        throw new Error("AI response appears truncated");
      }
      const parsed = JSON.parse(text);
      return parsed;
    } catch (error) {
      console.error("Gemini JSON generation error:", error.message);
      throw new Error(`AI JSON generation failed: ${error.message}`);
    }
  }

  async generateJSONWithRetry(prompt, outputDescription, maxRetries = 2) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt}/${maxRetries}...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        return await this.generateJSON(prompt, outputDescription);
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error.message);
      }
    }

    throw new Error(
      `Failed after ${maxRetries + 1} attempts: ${lastError.message}`,
    );
  }
}

module.exports = new GeminiService();