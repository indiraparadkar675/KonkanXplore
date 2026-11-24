# KonkanXplore – Explore the Beauty of Malvan

**KonkanXplore** is a smart tourism website designed specifically for Malvan, Maharashtra, to help travellers explore local destinations, discover authentic experiences, and plan personalized trips according to their budget and preferences.

## Features

- **Destination Discovery:** Explore popular places like Tarkarli, Devbag and Malvan.
- **AI-Based Trip Planning:** Generate personalized travel itineraries.
- **Budget Management:** Plan trips based on available budgets.
- **Accommodation & Food:** Discover local stays and food options.
- **Local Experiences:** Explore beaches, water sports and cultural activities.
- **Interactive User Interface:** Simple and responsive travel-planning experience.

## Technology Stack

**Frontend:** React.js, Tailwind CSS, Vite

**Backend:** Python, Flask, REST API

**AI & Data:** AI-based planning agents, FAISS Vector Store

## Project Structure

```text
KonkanXplore/
├── agents/
├── data/
├── frontend/
├── models/
├── tools/
├── utils/
├── vectorstore/
├── api.py
├── app.py
├── requirements.txt
├── README.md
└── .env.example
```

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/indiraparadkar675/KonkanXplore.git
cd KonkanXplore
```

### 2. Backend Setup

```bash
python -m venv venv
```

Activate the environment on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables using `.env.example`.

Start the backend:

```bash
python app.py
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal.

## Project Objective

The main objective of KonkanXplore is to promote Malvan tourism through a technology-driven platform that simplifies travel discovery and personalized trip planning.

## Future Scope

- Online hotel and activity booking
- Live weather and location updates
- Multilingual support
- Enhanced AI-powered recommendations

## Developer

**Indira Paradkar**

B.Tech Final Year Student

GitHub: https://github.com/indiraparadkar675

---

**KonkanXplore – Discover Malvan, Experience Konkan!** 🌴
