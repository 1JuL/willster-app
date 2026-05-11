# 📚 Willster App - Frontend

Frontend móvil de **Willster**, una aplicación enfocada en mejorar el estudio mediante IA, OCR y gamificación.  
La app permite escanear apuntes físicos, generar resúmenes automáticos con IA y convertir el contenido en juegos interactivos para reforzar el aprendizaje.

---

## 🚀 Features

- 📷 Escaneo de notas mediante OCR
- 🤖 Generación automática de resúmenes usando IA (Gemini API)
- 📝 Gestión de notebooks y notas
- 🎮 Juegos interactivos basados en el contenido:
  - Memory Matching
  - Hangman
  - Quiz estilo Kahoot
- 🔐 Autenticación con Firebase
- ☁️ Integración con backend en NestJS
- 📱 Aplicación móvil desarrollada con React Native + Expo

---

## 🛠️ Tech Stack

### Frontend
- React Native
- Expo Go
- TypeScript
- React Navigation
- Axios

### Backend & Services
- NestJS API
- Firebase Authentication
- Firebase Storage
- Firebase Database
- Gemini API
- OCR API

---

## 📂 Project Structure

```bash
.
├── .vscode/            # VSCode configuration files
├── app/                # Main application screens and routing
├── assets/             # Images, icons, fonts, and static resources
├── components/         # Reusable UI components
├── config/             # App and service configurations
├── context/            # Global state management with Context API
├── hooks/              # Custom React hooks
├── interfaces/         # TypeScript interfaces and types
├── utils/              # Utility and helper functions
│
├── .gitignore
├── app.json            # Expo configuration
├── eas.json            # EAS Build configuration
├── eslint.config.js    # ESLint configuration
├── metro.config.js     # Metro bundler configuration
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-user/willster-frontend.git
cd willster-frontend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start the project

```bash
npx expo start
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory.

Example:

```env
EXPO_PUBLIC_API_URL=https://your-api-url.com
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 📡 API Integration

The frontend communicates with the backend API to manage:

- Users
- Notebooks
- Notes
- OCR processing
- AI summaries
- Interactive games

Backend repository:

```txt
willster-api.vercel.app
```

---

## 🎮 Core Functionalities

### 📷 OCR Note Scanner
Capture handwritten or printed notes and extract text automatically.

### 🤖 AI Summary Generator
Generate concise study summaries from notes using Gemini API.

### 🎲 Gamified Learning
Transform study material into interactive games to improve retention and engagement.

---

## 📱 Available Scripts

```bash
# Start Expo
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

---

## 🧪 Future Improvements

- 🔔 Smart study reminders
- 📊 Study progress analytics
- 👥 Collaborative notebooks
- 🌙 Dark mode
- 🧠 Adaptive learning system
- 🏆 Achievement and ranking system

---

## 👨‍💻 Contributors

- Samuel Acero García
- Diego Norberto Diaz Algarin

---

## 📄 License

This project is licensed under the MIT License.

---

## 📸 About Willster

Willster was created to help students optimize their study process through automation, artificial intelligence, and gamification.

The goal is to reduce the time students spend organizing notes while making studying more interactive and effective.
