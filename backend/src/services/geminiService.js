require("dotenv").config();

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { JsonOutputParser } = require("@langchain/core/output_parsers");
const { RunnableSequence } = require("@langchain/core/runnables");

class GeminiService {
  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-3.1-flash",
      apiKey: process.env.GEMINI_API_KEY,
      temperature: 0.7,
      maxOutputTokens: 2048,
    });
  }

  async generate(prompt) {
    try {
      const result = await this.model.invoke(prompt);
      return result?.content ?? result;
    } catch (error) {
      console.error("Gemini error:", error.message);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  async generateJSON(prompt, outputDescription) {
    try {
      const parser = new JsonOutputParser();
      const formatInstructions = parser.getFormatInstructions();

      const promptTemplate = ChatPromptTemplate.fromMessages([
        [
          "system",
          `Return ONLY valid JSON.\n${formatInstructions}\n${outputDescription}`,
        ],
        ["human", "{input}"],
      ]);

      const chain = RunnableSequence.from([promptTemplate, this.model, parser]);

      const result = await chain.invoke({ input: prompt });
      return result;
    } catch (error) {
      console.error("Gemini JSON error:", error.message);
      throw new Error(`AI JSON generation failed: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();
