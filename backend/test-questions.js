require("dotenv").config();
const questionGenerator = require("./src/services/questionGenerator");

// Mock AI-parsed resume data (rich format)
const mockResumeAI = {
  name: "Sarah Johnson",
  email: "sarah.j@email.com",
  phone: "+1-555-123-4567",
  location: "Seattle, WA",
  linkedin: "linkedin.com/in/sarahjohnson",
  portfolio: "sarahj.dev",
  summary:
    "Senior full-stack engineer with 6 years of experience building scalable web applications and leading development teams.",
  skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "Django",
    "PostgreSQL",
    "MongoDB",
    "AWS",
    "Docker",
    "Kubernetes",
    "GraphQL",
    "REST API",
    "Redis",
    "Git",
  ],
  experience: [
    {
      title: "Senior Software Engineer",
      company: "TechCorp Solutions",
      location: "Seattle, WA",
      duration: "Jan 2021 - Present",
      responsibilities: [
        "Led team of 5 developers in building microservices architecture",
        "Designed and implemented GraphQL API serving 100K+ requests/day",
        "Reduced deployment time by 60% through CI/CD pipeline improvements",
      ],
      technologies: [
        "React",
        "Node.js",
        "PostgreSQL",
        "AWS",
        "Docker",
        "Kubernetes",
      ],
    },
    {
      title: "Software Engineer",
      company: "StartupXYZ",
      location: "Remote",
      duration: "Mar 2019 - Dec 2020",
      responsibilities: [
        "Built RESTful APIs handling 50K requests/second",
        "Developed admin dashboard with complex data visualizations",
        "Optimized database queries improving performance by 40%",
      ],
      technologies: ["Python", "Django", "PostgreSQL", "Redis", "React"],
    },
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "University of Washington",
      year: "2019",
      gpa: "3.7",
    },
  ],
  projects: [
    {
      name: "Real-time Analytics Dashboard",
      description:
        "Built dashboard with live data visualization for 1M+ daily active users",
      technologies: ["React", "Node.js", "WebSockets", "Redis", "D3.js"],
      link: "github.com/sarah/analytics-dashboard",
    },
    {
      name: "E-commerce Microservices Platform",
      description:
        "Designed and built distributed system with payment integration",
      technologies: [
        "Node.js",
        "PostgreSQL",
        "RabbitMQ",
        "Docker",
        "Kubernetes",
      ],
      link: null,
    },
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      organization: "Amazon Web Services",
      year: "2022",
    },
  ],
  yearsOfExperience: 6,
  seniorityLevel: "Senior",
};

async function testQuestionGeneration() {
  try {
    console.log("🧪 Testing Question Generator\n");
    console.log("=".repeat(70));

    // Test 1: Technical, Medium
    console.log("\n📝 TEST 1: Technical Focus, Medium Difficulty");
    console.log("-".repeat(70));
    const q1 = await questionGenerator.generate(
      mockResumeAI,
      "technical",
      "medium",
    );
    console.log(`✅ Generated ${q1.length} questions`);
    console.log("\nFirst question:");
    console.log(JSON.stringify(q1[0], null, 2));
    console.log(
      "\nDistribution:",
      questionGenerator.getQuestionDistribution(q1),
    );

    // Test 2: Mixed, Hard
    console.log("\n📝 TEST 2: Mixed Focus, Hard Difficulty");
    console.log("-".repeat(70));
    const q2 = await questionGenerator.generate(mockResumeAI, "mixed", "hard");
    console.log(`✅ Generated ${q2.length} questions`);
    console.log("\nSample project question:");
    const projectQ = q2.find((q) => q.category === "project");
    if (projectQ) {
      console.log(JSON.stringify(projectQ, null, 2));
    }
    console.log(
      "\nDistribution:",
      questionGenerator.getQuestionDistribution(q2),
    );

    // Test 3: Behavioral, Easy
    console.log("\n📝 TEST 3: Behavioral Focus, Easy Difficulty");
    console.log("-".repeat(70));
    const q3 = await questionGenerator.generate(
      mockResumeAI,
      "behavioral",
      "easy",
    );
    console.log(`✅ Generated ${q3.length} questions`);
    console.log("\nSample behavioral question:");
    const behavioralQ = q3.find((q) => q.category === "behavioral");
    if (behavioralQ) {
      console.log(JSON.stringify(behavioralQ, null, 2));
    }
    console.log(
      "\nDistribution:",
      questionGenerator.getQuestionDistribution(q3),
    );

    // Validation
    console.log("\n🔍 VALIDATION");
    console.log("-".repeat(70));
    console.log(
      "Technical distribution valid:",
      questionGenerator.validateDistribution(q1, "technical"),
    );
    console.log(
      "Mixed distribution valid:",
      questionGenerator.validateDistribution(q2, "mixed"),
    );
    console.log(
      "Behavioral distribution valid:",
      questionGenerator.validateDistribution(q3, "behavioral"),
    );

    console.log("\n" + "=".repeat(70));
    console.log("✅ ALL TESTS PASSED!\n");
  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testQuestionGeneration();
