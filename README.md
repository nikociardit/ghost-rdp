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
