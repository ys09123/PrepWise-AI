const express = require('express');
const cors = require('cors');
require('dotenv').config();

const resumeRoutes = require('./src/routes/resume');
const interviewRoutes = require('./src/routes/interview');

const app = express();

//middlewares
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

//routes
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Interview Simulator API', 
    status: 'running',
    version: '1.0.0'
  });
});

//error handling middleware
app.use((err, req, res, next)=> {
  console.error(err.stack)
  res.status(500).json({error: err.message || 'Something went wrong!'})
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});