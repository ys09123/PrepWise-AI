const geminiService = require("./geminiService");

function cleanResumeText(text) {
  return text
    .replace(/[^\x20-\x7E\n]/g, " ")  // remove weird unicode
    .replace(/-\n/g, "")              // fix broken words
    .replace(/\n{2,}/g, "\n")         // normalize spacing
    .replace(/\s+/g, " ")
    .trim();
}

class AIResumeParser {
  async parseWithAI(rawText) {
    const cleanedText = cleanResumeText(rawText);
    const textToProcess = cleanedText.substring(0, 8000);

    const prompt = `You are an expert resume parser. Extract structured information from this resume text.

RESUME TEXT:
${textToProcess}

EXTRACTION RULES:
1. Extract EXACTLY what's written - don't invent or assume information
2. If a field is not found in the resume, use null or empty array []
3. For skills: extract ALL technical skills, programming languages, frameworks, tools mentioned
4. For experience: extract complete job history with responsibilities
5. For dates: keep original format from resume
6. Estimate years of experience by calculating from work history dates
7. Determine seniority level based on job titles and experience:
   - "Junior": 0-2 years, junior/entry-level titles
   - "Mid-level": 2-5 years, mid-level/regular titles  
   - "Senior": 5+ years, senior/lead/principal titles
8. For the PROJECTS section:
  - Project names appear immediately after the PROJECTS heading
  - Each project starts with a title followed by a date
  - Extract the title, description, technologies, and link
REQUIRED OUTPUT STRUCTURE:
{
  "name": "Full name from resume",
  "email": "email@example.com or null",
  "phone": "phone number or null",
  "location": "City, State/Country or null",
  "linkedin": "LinkedIn URL or null",
  "portfolio": "Portfolio/website URL or null",
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "location": "Job location or null",
      "duration": "Start date - End date or Present",
      "responsibilities": ["responsibility1", "responsibility2"],
      "technologies": ["tech1", "tech2"]
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "University/College name",
      "year": "Graduation year",
      "gpa": "GPA if mentioned, else null",
      "coursework": ["course1", "course2"] or null
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Brief description",
      "technologies": ["tech1", "tech2"],
      "link": "Project URL or null"
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "organization": "Issuing organization",
      "year": "Year obtained"
    }
  ],
  "yearsOfExperience": 5,
  "seniorityLevel": "Junior" or "Mid-level" or "Senior"
}

Return ONLY valid JSON. No markdown, no code blocks, no explanations.`;

    const outputDescription = `A single JSON object with the complete resume data structure as specified above`;

    try {
      console.log("🤖 Parsing resume with Gemini AI...");

      const parsedData = await geminiService.generateJSON(
        prompt,
        outputDescription,
      );

      console.log("✅ AI parsing successful!");

      // Validate and normalize the parsed data
      const normalized = {
        name: parsedData.name || null,
        email: parsedData.email || null,
        phone: parsedData.phone || null,
        location: parsedData.location || null,
        linkedin: parsedData.linkedin || null,
        portfolio: parsedData.portfolio || null,
        summary: parsedData.summary || "No summary provided",
        skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
        experience: Array.isArray(parsedData.experience)
          ? parsedData.experience.map((exp) => ({
              title: exp.title || "Unknown",
              company: exp.company || "Unknown",
              location: exp.location || null,
              duration: exp.duration || "Unknown",
              responsibilities: Array.isArray(exp.responsibilities)
                ? exp.responsibilities
                : [],
              technologies: Array.isArray(exp.technologies)
                ? exp.technologies
                : [],
            }))
          : [],
        education: Array.isArray(parsedData.education)
          ? parsedData.education.map((edu) => ({
              degree: edu.degree || "Unknown",
              institution: edu.institution || "Unknown",
              year: edu.year || null,
              gpa: edu.gpa || null,
              coursework: Array.isArray(edu.coursework) ? edu.coursework : null,
            }))
          : [],
        projects: Array.isArray(parsedData.projects)
          ? parsedData.projects.map((proj) => ({
              name: proj.name || "Unnamed Project",
              description: proj.description || "",
              technologies: Array.isArray(proj.technologies)
                ? proj.technologies
                : [],
              link: proj.link || null,
            }))
          : [],
        certifications: Array.isArray(parsedData.certifications)
          ? parsedData.certifications.map((cert) => ({
              name: cert.name || "Unknown",
              organization: cert.organization || "Unknown",
              year: cert.year || null,
            }))
          : [],
        yearsOfExperience: parsedData.yearsOfExperience || null,
        seniorityLevel: parsedData.seniorityLevel || null,
      };
      if (!normalized.projects.length) {
        const projectSection = rawText.match(
          /PROJECTS([\s\S]*?)TECHNICAL SKILLS/i,
        );

        if (projectSection) {
          const lines = projectSection[1]
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);

          const detectedProjects = lines
            .filter((line) =>
              /^[A-Za-z].*(System|App|Application|Dashboard|Platform)/i.test(
                line,
              ),
            )
            .map((title) => ({
              name: title,
              description: "",
              technologies: [],
              link: null,
            }));

          normalized.projects = detectedProjects;
        }
      }
      return normalized;
    } catch (error) {
      console.error("❌ AI parsing failed:", error.message);
      throw new Error(`Failed to parse resume with AI: ${error.message}`);
    }
  }

  simpleParse(rawText) {
    console.log("⚠️ Using simple regex parser (fallback)");

    const emailMatch = rawText.match(/[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = rawText.match(
      /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    );

    const skillKeywords = [
      "JavaScript",
      "Python",
      "Java",
      "C++",
      "React",
      "Node.js",
      "Angular",
      "Vue",
      "SQL",
      "MongoDB",
      "PostgreSQL",
      "AWS",
      "Docker",
      "Kubernetes",
      "Git",
      "TypeScript",
      "HTML",
      "CSS",
    ];

    const skills = skillKeywords.filter((skill) =>
      rawText.toLowerCase().includes(skill.toLowerCase()),
    );

    const lines = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const name = lines[0] || "Unknown";

    return {
      name,
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null,
      location: null,
      linkedin: null,
      portfolio: null,
      summary: rawText.substring(0, 200) + "...",
      skills: [...new Set(skills)],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      yearsOfExperience: null,
      seniorityLevel: null,
    };
  }
}

module.exports = new AIResumeParser();
