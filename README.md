# HackSim - Hackathon Simulator & Evaluation Platform

A comprehensive hackathon simulation and evaluation platform that uses AI to assess project ideas, analyze GitHub repositories, and generate detailed performance reports. Built with React, Node.js, and powered by Llama 3.2 (via Ollama) and Google Gemini AI.

## 🌟 Features

- **AI-Powered Idea Evaluation**: Submit your hackathon project ideas and get instant AI feedback on innovation, feasibility, and impact
- **GitHub Repository Analysis**: Analyze any GitHub repository with AI to assess code quality, architecture, and implementation
- **Intelligent Matching**: Compare your proposed idea against the actual implementation and get a comprehensive match score
- **Real-Time Collaboration**: Built-in code editor with real-time collaboration using Socket.IO
- **Comprehensive Reporting**: Generate detailed PDF reports with visualizations, scores, and actionable feedback
- **User Authentication**: Secure JWT-based authentication system
- **Modern UI**: Beautiful, responsive interface built with React, TypeScript, and Shadcn UI components

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Shadcn UI** components (built on Radix UI)
- **TailwindCSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Socket.IO Client** for real-time features
- **jsPDF** for PDF report generation

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **Ollama** integration for local Llama 3.2 AI model
- **Google Gemini AI** as fallback AI service
- **GitHub API** for repository analysis

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Either:
   - Local installation: [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud): [Create free account](https://www.mongodb.com/cloud/atlas/register)
3. **Ollama** (for local AI) - [Download and install](https://ollama.ai/)
4. **Git** - [Download](https://git-scm.com/downloads)

## 🚀 Quick Start Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/zoror2/Hackathon_Simulator_using_Lamma3.2.git
cd Hackathon_Simulator_using_Lamma3.2
```

### Step 2: Install Ollama and Download Llama Model

1. Install Ollama from [https://ollama.ai/](https://ollama.ai/)
2. Pull the Llama 3.2 model:
```bash
ollama pull llama3.2:3b
```
3. Verify Ollama is running:
```bash
ollama list
```

### Step 3: Set Up Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string_here

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Ollama Configuration (if not running on default)
OLLAMA_BASE_URL=http://localhost:11434

# Google Gemini API (fallback AI)
GEMINI_API_KEY=your_gemini_api_key_here

# GitHub Token (optional, for higher API rate limits)
GITHUB_TOKEN=your_github_personal_access_token_here
```

#### Getting Your API Keys:

**MongoDB URI:**
- For MongoDB Atlas: 
  1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  2. Create a cluster and click "Connect"
  3. Choose "Connect your application"
  4. Copy the connection string and replace `<password>` with your database user password
  5. Example: `mongodb+srv://username:password@cluster.mongodb.net/hacksim?retryWrites=true&w=majority`
- For Local MongoDB: `mongodb://localhost:27017/hacksim`

**JWT Secret:**
- Generate a random string (at least 32 characters)
- You can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

**GitHub Token (Optional but Recommended):**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name and select scopes: `repo` (for private repos) or `public_repo` (for public only)
4. Generate and copy the token

4. Start the backend server:
```bash
npm start
```

The backend should now be running on `http://localhost:5000`

### Step 4: Set Up Frontend

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend_2
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `frontend_2` directory (optional, for custom API URL):

```env
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The frontend should now be running on `http://localhost:8080` (or another port if 8080 is taken)

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:8080
```

## 📖 Usage Guide

### 1. Create an Account
- Click on "Sign Up" in the navigation
- Enter your name, email, and password
- Submit to create your account

### 2. Login
- Click on "Login"
- Enter your credentials
- You'll be redirected to the dashboard

### 3. Evaluate Your Idea
- Navigate to "Idea Evaluation" from the dashboard
- Fill in the form with your project details:
  - **Project Name**: Name of your hackathon project
  - **Problem Statement**: The problem you're solving
  - **Proposed Solution**: Your proposed solution approach
  - **Target Users**: Who will use your solution
  - **Key Features**: Main features (comma-separated)
  - **Tech Stack**: Technologies you plan to use (comma-separated)
  - **Innovation Level**: How innovative is your idea (1-10)
  - **Expected Impact**: Description of potential impact
- Submit for AI evaluation
- View your scores and feedback

### 4. Analyze GitHub Repository
- Navigate to "Repo Evaluation"
- Enter the GitHub repository URL (e.g., `https://github.com/username/repo-name`)
- Submit for analysis
- The AI will analyze:
  - Code quality and organization
  - Architecture patterns
  - Commit history and quality
  - Documentation
  - Technology stack implementation
  - Contributor activity

### 5. Generate Unified Report
- Navigate to "Reports" from the dashboard
- Click "Generate Report" to create a comprehensive analysis
- The report includes:
  - Idea evaluation scores
  - Repository analysis scores
  - Match score (how well the implementation matches the idea)
  - Detailed feedback and suggestions
  - Visual score breakdowns
- Download as PDF for sharing or future reference

### 6. Collaborate in Real-Time (Code Editor)
- Navigate to "Code Editor"
- Create or join a room
- Write code collaboratively with others
- Chat with team members in the sidebar

## 🏗️ Project Structure

```
Hackathon_Simulator_using_Lamma3.2/
├── backend/                      # Node.js backend
│   ├── config/                   # Database configuration
│   ├── controllers/              # Route controllers
│   │   ├── authController.js     # Authentication logic
│   │   ├── evaluationController.js  # Idea & repo evaluation
│   │   └── reportController.js   # Report generation
│   ├── middleware/               # Custom middleware
│   │   └── authMiddleware.js     # JWT verification
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js
│   │   ├── IdeaEvaluation.js
│   │   ├── RepoEvaluation.js
│   │   └── FinalReport.js
│   ├── routes/                   # API routes
│   │   ├── auth.js
│   │   ├── evaluation.js
│   │   ├── report.js
│   │   └── ai.js
│   ├── services/                 # Business logic
│   │   ├── geminiService.js      # Gemini AI integration
│   │   └── githubService.js      # GitHub API calls
│   ├── sockets/                  # Socket.IO handlers
│   ├── utils/                    # Utility functions
│   ├── server.js                 # Entry point
│   └── package.json
│
├── frontend_2/                   # React frontend
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── ui/               # Shadcn UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ...
│   │   ├── pages/                # Page components
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── IdeaEvaluation.tsx
│   │   │   ├── RepoEvaluation.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── CodeEditor.tsx
│   │   ├── lib/                  # Utilities
│   │   │   ├── api.ts            # API client
│   │   │   ├── auth.tsx          # Auth context
│   │   │   └── utils.ts
│   │   ├── App.tsx               # Main app component
│   │   └── main.tsx              # Entry point
│   └── package.json
│
└── frontend/                     # Legacy frontend (optional)
```

## 🔧 Configuration Details

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Backend server port | No | 5000 |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `OLLAMA_BASE_URL` | Ollama API endpoint | No | http://localhost:11434 |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | - |
| `GITHUB_TOKEN` | GitHub personal access token | No | - |

### Frontend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | No | http://localhost:5000 |

## 🐛 Troubleshooting

### Ollama Connection Issues
**Problem:** "Cannot connect to Ollama"
- Ensure Ollama is running: `ollama serve` or check if the Ollama desktop app is running
- Verify the model is installed: `ollama list`
- Check `OLLAMA_BASE_URL` in your `.env` file

### MongoDB Connection Errors
**Problem:** "MongoNetworkError" or "Authentication failed"
- Verify your `MONGODB_URI` is correct
- Check your MongoDB server is running (if local)
- Verify network access is allowed in MongoDB Atlas settings
- Ensure your IP address is whitelisted in MongoDB Atlas

### Port Already in Use
**Problem:** "Port 5000 is already in use"
- Change the `PORT` in backend `.env` file
- Kill the process using the port: `npx kill-port 5000`

### Frontend Cannot Connect to Backend
**Problem:** API calls failing with CORS or network errors
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Clear browser cache and reload

### GitHub API Rate Limiting
**Problem:** "API rate limit exceeded"
- Add a `GITHUB_TOKEN` to your backend `.env` file
- This increases the rate limit from 60 to 5,000 requests per hour

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Evaluation
- `POST /api/evaluation/idea` - Submit idea for evaluation (protected)
- `POST /api/evaluation/repo` - Submit GitHub repo for analysis (protected)
- `GET /api/evaluation/idea/latest` - Get latest idea evaluation (protected)
- `GET /api/evaluation/repo/latest` - Get latest repo evaluation (protected)

### Reports
- `GET /api/report/latest` - Generate unified report (protected)

## 🎯 AI Evaluation Criteria

### Idea Evaluation (100 points)
- **Innovation** (20 points): Uniqueness and creativity
- **Feasibility** (20 points): Technical viability
- **Impact** (20 points): Potential positive impact
- **Clarity** (15 points): How well-defined the idea is
- **Scalability** (15 points): Growth potential
- **User Value** (10 points): Value to target users

### Repository Evaluation (100 points)
- **Code Quality** (25 points): Clean code, best practices
- **Architecture** (20 points): Design patterns, organization
- **Documentation** (15 points): README, comments, docs
- **Commit Quality** (15 points): Commit messages, frequency
- **Testing** (10 points): Test coverage, quality
- **Contributor Balance** (15 points): Collaboration quality

### Match Analysis (100 points)
- Alignment between proposed features and implementation
- Technology stack adherence
- Problem-solution fit
- Overall execution quality

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

Created for hackathon evaluation and simulation purposes.

## 🙏 Acknowledgments

- Llama 3.2 by Meta AI
- Google Gemini AI
- Ollama for local AI inference
- Shadcn UI for beautiful components
- MongoDB for database
- All open-source contributors

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the GitHub issues page
3. Create a new issue with detailed description

---

**Happy Hacking! 🚀**
