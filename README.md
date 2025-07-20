# Dots to Squares - A Modern Web Game

This is a classic Dots and Squares game built with a modern web stack, featuring real-time multiplayer, a challenging AI opponent, and a sleek, responsive user interface.

## ✨ Features

- **Real-time Multiplayer**: Play against friends in real-time by sharing a simple invite link.
- **Challenging AI**: Test your skills against a smart AI that strategically tries to complete squares.
- **Selectable Grid Sizes**: Choose from 6x6, 8x8, or 10x10 boards for varied gameplay.
- **Persistent Player Stats**: Track your wins, losses, and ties across all games. Your record is saved and displayed on the game-over screen.
- **Modern & Responsive UI**: A clean, dark-themed, and responsive interface built with Tailwind CSS, ensuring a great experience on any device.
- **Turn Timer**: A 30-second turn timer keeps the game moving at a brisk pace.

## 🛠️ Tech Stack

- **Frontend**: [Vue 3](https://vuejs.org/) (with Composition API and `<script setup>`)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Backend & Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) for real-time data synchronization.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

This project uses Firebase for its backend. You will need to create your own Firebase project to get the necessary credentials.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project.
3.  In your project, create a new Web App.
4.  You will be given a Firebase configuration object. Copy these credentials.
5.  In the project's source code, navigate to `src/firebase/index.ts`.
6.  Replace the placeholder `firebaseConfig` object with your own credentials.

**Note**: For production, it is highly recommended to store these credentials in environment variables rather than hard-coding them.

### 4. Run the Development Server

```bash
npm run dev
```

The application should now be running on [http://localhost:5173](http://localhost:5173).

## 🎮 How to Play

- **Start a Game**: On the home screen, choose a grid size and decide whether to play against the AI or a friend.
- **Invite a Friend**: If you choose to play against a friend, a lobby will be created. Copy the invite link and share it with them.
- **Take Your Turn**: Click between two adjacent dots to draw a line.
- **Complete a Square**: If your line is the fourth side of a 1x1 box, you score a point and get to take another turn.
- **Win the Game**: The game ends when all possible lines have been drawn. The player with the most completed squares wins!
