# Personal Finance Application v2.0

A full-stack personal finance management application with AI-powered financial advisor using Google Gemini API.

## Features

- **User Authentication** - Sign up and login with secure password hashing
- **Financial Data Collection** - Collect comprehensive financial information
- **Automatic Calculations** - Calculate 10 financial metrics
- **AI Financial Reports** - Generate personalized financial advice using Google Gemini AI
- **Export Options** - Download reports as .txt or print to PDF

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **AI:** Google Generative AI (Gemini)

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure .env file**
   ```env
   GEMINI_API_KEY=your_api_key_here
   PORT=3000
   ```
   No API key is included in this repository.  
   You must provide your own valid Google Gemini API key to enable AI features.

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## Usage

1. Sign Up - Create a new account
2. Log In - Authenticate with your credentials
3. Fill Financial Form - Enter your financial information
4. Calculate - Click "Save & Calculate" to compute metrics
5. View Report - See AI-powered financial advice
6. Export - Download or print your report

## Project Structure

```
├── app.js                 # Main Express server
├── package.json           # Project dependencies
├── .env                   # Environment variables
├── public/                # Frontend files
│   ├── index.html         # Homepage
│   ├── login.html         # Login page
│   ├── signup.html        # Registration page
│   ├── dashboard.html     # Financial form
│   ├── css/               # Stylesheets
│   └── js/                # Client-side JavaScript
├── models/                # Database models
├── services/              # Business logic
├── utilities/             # Helper functions
└── db_files/              # Database
```

## API Endpoints

- `POST /register` - Create new user
- `POST /login` - User login
- `POST /saverawdata` - Save financial input
- `POST /saveresultdata` - Save calculated metrics
- `POST /generatereport` - Generate AI report

## Commands

```bash
npm install    # Install dependencies
npm start      # Start the server
npm run dev    # Start with auto-reload
```

## Support

- Check browser console (F12) for frontend errors
- Check server terminal for backend logs
- Verify `.env` file is configured correctly

## Contributors

| Full Name              | GitHub ID      | MMU ID     |
|------------------------|----------------|------------|
| Artin Seyf             | ArtinSeyf      | 24784426   |
| Kiyarash Shirmohammadi | k-shirmohammadi| 23761919   |
