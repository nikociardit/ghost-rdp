# ghost-rdp

**Secure Remote Desktop & Management Platform**

This repository contains all code for ghost-rdp: a Flask‐powered backend, React Admin Panel frontend, and an Electron launcher.  
It supports full user/task/alert/support management, VPN (WireGuard) integration, RDP Gateway, real‐time logs, and more.

---

## Features

- **Backend (Flask + SQLAlchemy)**
  - SQLite database (`ghost_rdp.db`)
  - User CRUD with enable/disable
  - Task CRUD with status updates
  - Alert rules (create, update, delete) + evaluation endpoint
  - Support tickets (create, list, update, close)
  - WireGuard server & peer management (create/delete/list)
  - Windows user management (create, enable/disable, delete)
  - Logs collection & retrieval
  - Setup status reporting

- **Frontend (React)**
  - Dark, cyber‐themed admin panel
  - Sidebar navigation
  - Pages: Dashboard, Users, Tasks, Alerts, Support, VPN (WireGuard), Windows Users, Logs, Setup
  - Full CRUD UI, real‐time polling for logs
  - Axios for API calls, React Router for navigation

- **Electron Launcher**
  - Launches frontend (`http://localhost:3000`) in a desktop window
  - Fetches VPN/WireGuard config, starts WG tunnel
  - Fetches RDP `.rdp` file and launches `mstsc.exe` to connect through RDP Gateway

---

## Prerequisites

- **Python 3.11+**  
- **Node.js 18+** & **npm**  
- **WireGuard** installed on client machine for VPN  
- **Windows** for Electron (for RDP launcher)

---

## Installation & Setup

1. **Clone the repo**
   git clone https://github.com/<your-username>/ghost-rdp.git
cd ghost-rdp
2. **Backend Setup**  
cd backend
python -m venv venv

Windows:
venv\Scripts\activate

Linux/macOS:
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt

Rename .env.example to .env and adjust if needed (e.g., for secrets)

3. **Start Backend Server**  
python app.py
This creates `ghost_rdp.db` automatically and listens on `http://localhost:5000`.

4. **Frontend Setup**  
Open a new terminal:
cd frontend
npm install
npm start
React dev server runs on `http://localhost:3000` and proxies `/api/*` to `http://localhost:5000`.

5. **Electron Launcher (Optional)**  
In another terminal:
cd electron-launcher
npm install
npm start
This opens a desktop window pointing to `http://localhost:3000`.

6. **WireGuard Configuration (Basic)**  
- Place your `wg0.conf` or peer configs in `backend/wireguard/` if needed.  
- The frontend’s VPN page can fetch/generate peer configs via API.

7. **Accessing**  
- Visit `http://localhost:3000` for the admin panel.  
- API endpoints live under `http://localhost:5000/api/...`.

---

## File Overview

- **backend/**  
- `app.py`: Main Flask app with all API routes and SQLAlchemy models  
- `requirements.txt`: Python dependencies  
- `ghost_rdp.db`: SQLite file (auto‐created)

- **frontend/**  
- `package.json`, `package-lock.json`: npm configs  
- `public/index.html`: HTML entrypoint  
- `src/`: React source files  
 - `index.js`, `App.js`, `components/`, `pages/`

- **electron-launcher/**  
- `package.json`, `package-lock.json`: npm configs  
- `main.js`: Electron main process (creates window)  
- `preload.js`: Electron preload script

- **.env.example**  
- Example environment variables (e.g., for production secrets, WG endpoints, RDP gateway address)

---

## Next Steps

- Customize your WireGuard server and peer settings.  
- Hook up your RDP Gateway (e.g., Windows Server RD Gateway) settings in `.env`.  
- Extend alert rule conditions, email notifications, SMS integration, etc.  
- Deploy to a real server or containerize with Docker for production.

Enjoy building secure remote management with ghost-rdp! 🚀


