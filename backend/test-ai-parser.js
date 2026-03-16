require("dotenv").config();
const resumeParser = require("./src/services/resumeParser");

const sampleResume = `
John Doe
john.doe@email.com | +1-234-567-8900 | San Francisco, CA
LinkedIn: linkedin.com/in/johndoe | Portfolio: johndoe.dev

PROFESSIONAL SUMMARY
Full-stack software engineer with 5 years of experience building scalable web applications.
Specialized in React, Node.js, and cloud infrastructure.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Java
Frontend: React, Redux, Next.js, Tailwind CSS
Backend: Node.js, Express, Django, REST APIs, GraphQL
Database: PostgreSQL, MongoDB, Redis
Cloud & DevOps: AWS (EC2, S3, Lambda), Docker, Kubernetes, CI/CD
Tools: Git, Jest, Webpack, Linux

WORK EXPERIENCE

Senior Software Engineer | Tech Corp Inc | San Francisco, CA | 2021 - Present
- Led team of 5 developers in building microservices architecture serving 1M+ users
- Implemented CI/CD pipeline reducing deployment time by 60%
- Designed and built real-time analytics dashboard using React and WebSockets
- Technologies: React, Node.js, PostgreSQL, AWS, Docker

Software Engineer | StartupXYZ | Remote | 2019 - 2021  
- Developed RESTful APIs handling 10K requests/second
- Built admin dashboard with complex data visualizations
- Optimized database queries improving performance by 40%
- Technologies: Python, Django, PostgreSQL, Redis

EDUCATION
Bachelor of Technology in Computer Science | MIT | 2019
GPA: 3.8/4.0
Relevant Coursework: Data Structures, Algorithms, Database Systems, Machine Learning

PROJECTS

E-commerce Platform | 2022
- Built full-stack online store with payment integration and inventory management
- Implemented JWT authentication and role-based access control
- Technologies: React, Node.js, MongoDB, Stripe API
- Link: github.com/johndoe/ecommerce

Real-time Chat Application | 2021
- Developed WebSocket-based chat with 1000+ concurrent users
- Implemented message encryption and file sharing
- Technologies: React, Socket.io, Express, Redis

CERTIFICATIONS
AWS Certified Solutions Architect | Amazon Web Services | 2022
`;

async function testAIParsing() {
  try {
    console.log("🧪 Testing AI Resume Parser\n");
    console.log("=".repeat(60));

    const result = await resumeParser.parseWithAI(sampleResume);

    console.log("\n✅ PARSING RESULTS:\n");
    console.log("📋 Personal Info:");
    console.log(`  Name: ${result.name}`);
    console.log(`  Email: ${result.email}`);
    console.log(`  Phone: ${result.phone}`);
    console.log(`  Location: ${result.location}`);
    console.log(`  LinkedIn: ${result.linkedin}`);
    console.log(`  Portfolio: ${result.portfolio}`);

    console.log("\n💼 Professional:");
    console.log(`  Years of Experience: ${result.yearsOfExperience}`);
    console.log(`  Seniority Level: ${result.seniorityLevel}`);

    console.log("\n💻 Skills (${result.skills?.length || 0} found):");
    console.log(`  ${result.skills?.slice(0, 10).join(", ")}...`);

    console.log(
      "\n👔 Work Experience (${result.experience?.length || 0} jobs):",
    );
    result.experience?.forEach((exp, i) => {
      console.log(`  ${i + 1}. ${exp.title} at ${exp.company}`);
      console.log(`     Duration: ${exp.duration}`);
      console.log(
        `     Responsibilities: ${exp.responsibilities?.length || 0}`,
      );
      console.log(`     Technologies: ${exp.technologies?.join(", ")}`);
    });

    console.log("\n🎓 Education (${result.education?.length || 0} degrees):");
    result.education?.forEach((edu, i) => {
      console.log(
        `  ${i + 1}. ${edu.degree} - ${edu.institution} (${edu.year})`,
      );
      if (edu.gpa) console.log(`     GPA: ${edu.gpa}`);
    });

    console.log("\n🚀 Projects (${result.projects?.length || 0} found):");
    result.projects?.forEach((proj, i) => {
      console.log(`  ${i + 1}. ${proj.name}`);
      console.log(`     Tech: ${proj.technologies?.join(", ")}`);
      if (proj.link) console.log(`     Link: ${proj.link}`);
    });

    console.log(
      "\n🏆 Certifications (${result.certifications?.length || 0} found):",
    );
    result.certifications?.forEach((cert, i) => {
      console.log(
        `  ${i + 1}. ${cert.name} - ${cert.organization} (${cert.year})`,
      );
    });

    console.log("\n" + "=".repeat(60));
    console.log("✅ TEST PASSED!\n");
  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error(error.message);
    process.exit(1);
  }
}

testAIParsing();
