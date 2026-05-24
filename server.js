const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// File path for storing messages
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Load messages from file
let messages = [];
if (fs.existsSync(MESSAGES_FILE)) {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
    messages = JSON.parse(data);
    console.log(`📂 Loaded ${messages.length} messages from storage`);
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

// Save messages to file
function saveMessagesToFile() {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    console.log(`💾 Saved ${messages.length} messages`);
  } catch (error) {
    console.error('Error saving messages:', error);
  }
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Data
const projects = [
  {
    id: 1,
    title: "HR Analytics & Employee Attrition Prediction",
    description: "Developed an interactive HR Analytics dashboard using Power BI to analyse 1,470 employee records. Built Random Forest ML model to predict attrition with 86% accuracy.",
    technologies: ["Python", "Pandas", "Scikit-learn", "Power BI", "DAX"],
    githubLink: "https://github.com/shalini/hr-analytics",
    featured: true
  },
  {
    id: 2,
    title: "Blinkit Sales Analysis Dashboard",
    description: "Designed interactive dashboards using Pivot Tables, Charts, and Excel functions to analyze sales performance across multiple outlets.",
    technologies: ["Excel", "Pivot Tables", "VLOOKUP", "XLOOKUP"],
    githubLink: "https://github.com/shalini/blinkit-sales",
    featured: true
  },
  {
    id: 3,
    title: "Zepto Inventory Analysis",
    description: "Wrote 20+ SQL queries to analyze inventory, pricing, discounts, and product availability.",
    technologies: ["PostgreSQL", "SQL", "Window Functions", "CTEs"],
    githubLink: "https://github.com/shalini/zepto-inventory",
    featured: true
  }
];

const skills = [
  { id: 1, name: "Python (Pandas, NumPy, Matplotlib, Seaborn)", percentage: 90 },
  { id: 2, name: "SQL & PostgreSQL (Joins, Window Functions, CTEs)", percentage: 88 },
  { id: 3, name: "Power BI (DAX, Power Query, KPI Dashboards)", percentage: 85 },
  { id: 4, name: "Excel (Pivot Tables, VLOOKUP, XLOOKUP)", percentage: 87 },
  { id: 5, name: "Machine Learning (Random Forest, XGBoost)", percentage: 75 },
  { id: 6, name: "ETL & Data Cleaning", percentage: 85 },
  { id: 7, name: "Tableau (Basic)", percentage: 70 }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'healthy', message: 'Server is running!' });
});

app.get('/api/projects', (req, res) => {
  res.json({ success: true, data: projects, count: projects.length });
});

app.get('/api/skills', (req, res) => {
  res.json({ success: true, data: skills, count: skills.length });
});

app.post('/api/contact', (req, res) => {
  console.log('📥 Received:', req.body);
  
  const { name, email, message } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, error: 'Name is required' });
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email is required' });
  }
  if (!message || message.trim() === '') {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }
  
  const newMessage = {
    id: messages.length + 1,
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    date: new Date().toISOString(),
    ip: req.ip
  };
  
  messages.push(newMessage);
  saveMessagesToFile();
  
  console.log(`✅ Message from ${name} (${email})`);
  
  res.json({ 
    success: true, 
    message: 'Message sent successfully! I will get back to you soon.',
    data: { id: newMessage.id }
  });
});

app.get('/api/messages', (req, res) => {
  res.json({ success: true, data: messages, count: messages.length });
});

app.delete('/api/messages/:id', (req, res) => {
  const id = parseInt(req.params.id);
  messages = messages.filter(m => m.id !== id);
  saveMessagesToFile();
  res.json({ success: true, message: 'Message deleted' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found',
    available: ['/api/health', '/api/projects', '/api/skills', '/api/contact', '/api/messages']
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ =========================================`);
  console.log(`   🚀 Server RUNNING on port ${PORT}`);
  console.log(`   📡 http://localhost:${PORT}`);
  console.log(`   =========================================`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/projects`);
  console.log(`   GET  /api/skills`);
  console.log(`   POST /api/contact`);
  console.log(`   GET  /api/messages`);
  console.log(`\n💾 Messages saved to: ${MESSAGES_FILE}\n`);
});