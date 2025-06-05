# AreoVizN AI ✈️

Advanced Aviation Dashboard with Real-time Flight Data Monitoring, AI-Powered Anomaly Detection, and Natural Language Interaction.

![Next.js](https://img.shields.io/badge/Next.js-14.1-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?style=flat-square&logo=mongodb)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-Pro-purple?style=flat-square&logo=google)

## 🚀 Features

### Core Functionality
- **Real-time Flight Data Monitoring** - Live streaming of 20+ flight parameters
- **AI-Powered Anomaly Detection** - Automatic detection of system anomalies
- **Role-Based Dashboards** - Customized views for Pilots, Technicians, and Managers
- **Interactive System Visualization** - Graph-based parameter relationships

### AI & Natural Language
- **Gemini AI Integration** - Advanced anomaly analysis and insights
- **Interactive Chat Assistant** - Natural language queries about flight data
- **Voice Interaction** - Speech-to-text input and text-to-speech output
- **Smart Recommendations** - Context-aware suggestions based on role

### Technical Features
- **MongoDB Integration** - Persistent data storage
- **Responsive Design** - Fully responsive with resizable panels
- **Dark/Light Mode** - Theme toggle support
- **Export Capabilities** - Download chat history and reports

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Modern component library
- **React Flow** - Graph visualization

### Backend
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Next.js API Routes** - Backend endpoints

### AI & ML
- **Google Gemini AI Pro** - Natural language processing
- **Web Speech API** - Voice capabilities

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB connection (provided in setup)
- Modern web browser (Chrome/Edge recommended for voice features)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/areovizn-ai.git
cd areovizn-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
Create a `.env.local` file with your database connection and Gemini key:
```env
MONGODB_URI=mongodb+srv://ozlevy9:Qq63415355@cluster0.9crpo4m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDtvD5fyQ-qL-5xV5fMpDAjlo2ujwEQ-_g
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

## 📖 Usage

### Dashboard Navigation
1. Select your role from the home page (Pilot/Technician/Manager)
2. View real-time flight data in the left panel
3. Monitor system connections in the center graph
4. Check active anomalies in the list
5. Get AI insights in the advisor panel
6. Chat with AI assistant in the bottom-right panel

### Voice Commands
- Click the microphone button to speak
- Try commands like:
  - "What's our current altitude?"
  - "Explain the active anomalies"
  - "Generate a maintenance report"

### AI Chat
- Type questions about flight data
- Use quick action buttons for common queries
- Export chat history as JSON
- Voice output available for all responses

## 🏗️ Project Structure

```
areovizn-ai/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── dashboard/    # Dashboard components
│   │   └── ui/          # Shadcn UI components
│   ├── contexts/        # React contexts
│   ├── lib/            # Utilities and configurations
│   ├── models/         # Mongoose models
│   └── types/          # TypeScript types
├── public/             # Static assets
└── ...config files
```

## 🔐 API Endpoints

- `GET /api/flight-data` - Fetch flight records
- `POST /api/flight-data` - Create new flight record
- `GET /api/flight-data/anomalies` - Fetch anomalies

## 🎯 Anomaly Detection Rules

1. **Sensor Mismatch** - Cabin altitude sensors differ by >200ft
2. **High Cabin VS** - Vertical speed exceeds 1000 fpm
3. **Pressure Limits** - Differential pressure out of safe range
4. **Landing Gear** - Gear not down during approach
5. **Valve Mismatch** - Outflow valve sensors differ by >10%

## 🚧 Roadmap

### Phase 1 (Current)
- ✅ Real-time monitoring
- ✅ AI integration
- ✅ Voice interaction
- ✅ Role-based views

### Phase 2 (3-6 months)
- [ ] WebSocket real-time updates
- [ ] Predictive maintenance ML
- [ ] Multi-aircraft support
- [ ] Mobile app

### Phase 3 (6-12 months)
- [ ] AR/VR visualization
- [ ] Fleet analytics
- [ ] Regulatory compliance
- [ ] Training simulations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Team

- Aviation Systems Design
- AI Integration
- Full-Stack Development

## 📞 Support

For questions or support, please open an issue in the GitHub repository.

---

Built with ❤️ for the aviation industry
