# ImpactLens - Luxury Partnership Analysis Platform

An AI-powered platform for analyzing luxury brand partnerships, providing sophisticated insights on brand alignment, audience overlap, and ROI projections.

## 🏗️ Architecture

- **Frontend**: React.js with Tailwind CSS and shadcn/ui components
- **Backend**: Flask with OpenAI GPT-4 integration
- **Database**: SQLite (development) / PostgreSQL (production)
- **AI**: OpenAI GPT-4 for partnership analysis
- **Authentication**: JWT-based authentication

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.11+
- OpenAI API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd impactlens-platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   
   # Run the backend
   python src/main.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   pnpm install
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env if needed
   
   # Run the frontend
   pnpm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🌐 Deployment

### Deploy to Heroku (Backend)

1. **Create Heroku app**
   ```bash
   cd backend
   heroku create impactlens-backend
   ```

2. **Set environment variables**
   ```bash
   heroku config:set OPENAI_API_KEY=your_openai_api_key
   heroku config:set JWT_SECRET_KEY=your_jwt_secret_key
   heroku config:set SECRET_KEY=your_flask_secret_key
   ```

3. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

### Deploy to Vercel (Frontend)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard**
   - `REACT_APP_API_URL`: Your Heroku backend URL

### Deploy Full-Stack to Heroku

For a single deployment with both frontend and backend:

1. **Build frontend**
   ```bash
   cd frontend
   pnpm run build
   cp -r dist/* ../backend/src/static/
   ```

2. **Deploy backend with static files**
   ```bash
   cd backend
   git add .
   git commit -m "Deploy full-stack app"
   git push heroku main
   ```

## 📁 Project Structure

```
impactlens-platform/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── assets/         # Static assets (logo, images)
│   │   ├── App.jsx         # Main application component
│   │   └── App.css         # Luxury styling and themes
│   ├── package.json
│   ├── vercel.json         # Vercel deployment config
│   └── .env                # Environment variables
├── backend/                 # Flask backend
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic (OpenAI, Jobs)
│   │   ├── static/         # Frontend build files (for full-stack)
│   │   └── main.py         # Flask application entry point
│   ├── requirements.txt    # Python dependencies
│   ├── Procfile           # Heroku deployment config
│   ├── runtime.txt        # Python version specification
│   └── .env               # Environment variables
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
JWT_SECRET_KEY=your_jwt_secret_key
SECRET_KEY=your_flask_secret_key
FLASK_ENV=development
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_APP_NAME=ImpactLens
REACT_APP_VERSION=1.0.0
```

## 🎨 Features

### Core Features
- **Partnership Analysis**: AI-powered analysis of brand partnerships
- **Luxury UI/UX**: Sophisticated design matching luxury brand standards
- **Real-time Processing**: Async job processing with progress tracking
- **Interactive Dashboard**: KPI cards, charts, and analytics
- **Scenario Management**: Save, organize, and compare partnership scenarios

### Technical Features
- **Responsive Design**: Mobile-first approach with luxury aesthetics
- **JWT Authentication**: Secure user authentication
- **OpenAI Integration**: GPT-4 powered partnership insights
- **Modern Stack**: React, Flask, Tailwind CSS, shadcn/ui
- **Production Ready**: Configured for Heroku and Vercel deployment

## 🔐 Security

- JWT-based authentication
- Environment variable configuration
- CORS protection
- Input validation and sanitization
- Secure API endpoints

## 📊 API Endpoints

### Authentication
- `POST /api/auth/demo-login` - Demo login (development)

### Scenarios
- `GET /api/scenarios` - Get user scenarios
- `POST /api/scenarios` - Create new scenario
- `GET /api/scenarios/{id}` - Get specific scenario
- `POST /api/scenarios/{id}/analyze` - Start analysis

### Jobs
- `GET /api/jobs/{job_id}` - Get job status and results

### Utilities
- `GET /api/health` - Health check
- `GET /api/dashboard/stats` - Dashboard statistics
- `POST /api/partner-suggestions` - AI partner suggestions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions, please contact the development team.

---

**ImpactLens** - Transforming luxury brand partnerships through AI-powered insights.
