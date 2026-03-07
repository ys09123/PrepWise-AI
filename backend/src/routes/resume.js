const express = require("express");
const multer = require("multer");
const { supabase } = require("../lib/supabase");
const resumeParser = require("../services/resumeParser");

const router = express.Router();

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const ext = '.' + file.originalname.split('.').pop().toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    }
  }
});

// Middleware: authenticate user
async function authenticateUser(req, res, next) {
  if (req.method === "OPTIONS") {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");
  
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    res.status(401).json({ error: "Authentication failed" });
  }
}

// POST: upload resume
router.post(
  "/upload",
  authenticateUser,
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // console.log("Processing resume:", req.file.originalname);

      const rawText = await resumeParser.extractText(req.file);
      const parsedData = resumeParser.simpleParser(rawText);

      const { data: resume, error } = await supabase
        .from("resumes")
        .insert({
          user_id: req.user.id,
          file_name: req.file.originalname,
          raw_text: rawText,
          parsed_data: parsedData,
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // console.log("Resume saved successfully:", resume.id);

      // Consistent response format
      res.json({ 
        success: true,
        resume: {
          id: resume.id,
          file_name: resume.file_name,
          parsed_data: resume.parsed_data,
          created_at: resume.created_at
        }
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ 
        error: err.message || "Failed to process resume" 
      });
    }
  }
);

// GET: all resumes for current user
router.get("/", authenticateUser, async (req, res) => {
  try {
    // console.log("Fetching resumes for user:", req.user.id);

    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("id, file_name, parsed_data, created_at")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    // console.log(`Found ${resumes?.length || 0} resumes`);

    // Consistent response format
    res.json({ 
      success: true,
      resumes: resumes || []
    });
  } catch (err) {
    console.error("Fetch resumes error:", err);
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
});

// GET: single resume by ID
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    // console.log("Fetching resume:", req.params.id);

    const { data: resume, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single();

    if (error || !resume) {
      console.error("Resume not found or error:", error);
      return res.status(404).json({ error: "Resume not found" });
    }

    // console.log("Resume found:", resume.id);

    // Consistent response format
    res.json({ 
      success: true,
      resume 
    });
  } catch (err) {
    console.error("Fetch single resume error:", err);
    res.status(500).json({ error: "Failed to fetch resume details" });
  }
});

// DELETE: resume by ID
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    console.log("Deleting resume:", req.params.id);

    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user.id);

    if (error) {
      console.error("Delete error:", error);
      throw error;
    }

    console.log("Resume deleted successfully");

    res.json({ 
      success: true,
      message: "Resume deleted successfully"
    });
  } catch (err) {
    console.error("Delete resume error:", err);
    res.status(500).json({ error: "Failed to delete resume" });
  }
});

module.exports = router;