const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// console.log('--- Debugging PDF-Parse ---');
// console.log('Type of pdfParse:', typeof pdfParse);
// console.log('Is pdfParse a function?:', typeof pdfParse === 'function');
// console.log('Available keys:', Object.keys(pdfParse));

class ResumeParser {
    // Extract raw text from uploaded file buffer based on extension
    async extractText(file) {
        const ext = file.originalname.split('.').pop().toLowerCase(); //identifying the file extension
        /*takes the name, split them from . and the pop the extension*/

        try {
            if (ext === 'pdf') {
                // The standard library is a direct function call
                const data = await pdfParse(file.buffer); 
                
                console.log("PDF extraction successful");
                return data.text;
            } else if (ext === 'docx') {
                const result = await mammoth.extractRawText({ buffer: file.buffer });  //convert xml based word format into raw text
                return result.value;
            } else if (ext === 'txt') {
                return file.buffer.toString('utf8');
            } else {
                throw new Error('Unsupported file format. Use PDF, DOCX, or TXT');
            }
        } catch (error) {
            throw new Error(`Failed to extract text: ${error.message}`);
        }
    }

    /* It takes all the messy data from the resume and returns the important info like name, experience etc etc*/
    simpleParser(text) {
        // Extract email
        const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);

        // Extract phone (Improved regex for better matching)
        const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

        // Extract common skills
        const skillKeywords = [
            'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
            'Angular', 'Vue', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS',
            'Docker', 'Kubernetes', 'Git', 'TypeScript', 'HTML', 'CSS',
            'Express', 'Django', 'Flask', 'Spring', 'Machine Learning',
            'Data Science', 'AI', 'DevOps', 'REST API', 'GraphQL'
        ];

        const skills = skillKeywords.filter(skill =>
            text.toLowerCase().includes(skill.toLowerCase())
        );

        // Extract name (Assuming it's the first non-empty line)
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        const name = lines[0] || 'Unknown';

        // Extract summary (first 200 chars)
        const summary = text.substring(0, 200).trim() + '...';

        // Extract years of experience (Corrected capture group to index [1])
        const expMatch = text.match(/(\d+)\+?\s*s*(years?|yrs)\s*(of\s*)?(experience|exp)/i);
        const yearsOfExperience = expMatch ? parseInt(expMatch[1]) : null;

        console.log("parsing done")
        return {
            name,
            email: emailMatch ? emailMatch[0] : null,
            phone: phoneMatch ? phoneMatch[0] : null,
            skills: [...new Set(skills)], // Remove duplicates
            summary,
            yearsOfExperience,
            rawSections: this.extractSections(text)
        };
    }

    /*Splits the text into common resume sections*/
    extractSections(text) {
        const sections = {};
        const headers = [
            'experience', 'education', 'skills', 'projects',
            'certifications', 'achievements', 'summary', 'objective'
        ];

        headers.forEach(header => {
            // Regex looks for the header followed by a newline or colon and grabs text until double newline
            const regex = new RegExp(`${header}[:\\s]*([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
            const match = text.match(regex);
            if (match && match[1]) {
                sections[header] = match[1].trim().substring(0, 500); // Increased limit for readability
            }
        });

        console.log("features extraction done")

        return sections;
    }

    /* AI-powered parsing placeholder (to be implemented)*/
    async parseWithAI(text) {
        // Currently falling back to simple parser
        return this.simpleParser(text);
    }
}

module.exports = new ResumeParser();