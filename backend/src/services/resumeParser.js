const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const aiResumeParser = require("./aiResumeParser");


// function cleanResumeText(text) {
//   return text
//     .replace(/\s+/g, " ") // collapse whitespace
//     .replace(/[^\x20-\x7E\n]/g, "") // remove weird unicode
//     .replace(/\n{3,}/g, "\n\n") // remove huge gaps
//     .trim();
// }

class ResumeParser {
  async extractText(file) {
    const ext = file.originalname.split(".").pop().toLowerCase();

    try {
      if (ext === "pdf") {
        const data = await pdfParse(file.buffer);
        return data.text;
      } else if (ext === "docx") {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        return result.value;
      } else if (ext === "txt") {
        return file.buffer.toString("utf-8");
      } else {
        throw new Error("Unsupported file format. Use PDF, DOCX, or TXT");
      }
    } catch (error) {
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  async parseWithAI(rawText) {
    try {
      const parsedData = await aiResumeParser.parseWithAI(rawText);
      return parsedData;
    } catch (error) {
      console.error(
        "AI parsing failed, falling back to simple parser:",
        error.message,
      );
      return aiResumeParser.simpleParse(rawText);
    }
  }

  simpleParser(rawText) {
    return aiResumeParser.simpleParse(rawText);
  }
}

module.exports = new ResumeParser();