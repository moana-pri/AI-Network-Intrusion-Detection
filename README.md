# AI-Assisted Network Intrusion Detection & Threat Monitoring System

NetGuard AI is a full-stack network security monitoring project that captures network traffic, detects suspicious activity, stores alerts, and presents the results in a React dashboard.

## Features

- Live network traffic monitoring
- Security alert management
- Rule-based intrusion detection
- Machine-learning anomaly detection support
- Dashboard statistics and visual analytics
- Search, filtering, pagination, and refresh controls
- Automatic frontend refresh every 10 seconds
- Django REST Framework backend
- React and Vite frontend

## Project Structure

```text
backend/     Django REST API and SQLite database
detector/    Packet capture and intrusion detection modules
ml/          Data preparation and anomaly detection modules
logs/        Alert and traffic logging modules
frontend/    React + Vite monitoring dashboard
data/        Project data files
```

## Requirements

- Python 3.10 or newer
- Node.js and npm
- Django and the Python packages used by the backend

## Backend Setup

Open PowerShell in the project root:

```powershell
cd backend
..\venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

The backend runs at:

```text
http://127.0.0.1:8000
```

If the virtual environment does not exist, create one and install the backend dependencies used by the project:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install django djangorestframework django-cors-headers pandas scikit-learn scapy
```

## Frontend Setup

Open another PowerShell window in the project root:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

Useful frontend commands:

```powershell
npm run build
npm run lint
npm run preview
```

## API Endpoints

The frontend uses these existing Django REST endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/traffic/` | Captured network traffic |
| GET | `/api/alerts/` | Detected security alerts |
| GET | `/api/dashboard/stats/` | Dashboard totals and severity counts |

The frontend expects the backend to be available at `http://127.0.0.1:8000`.

## Frontend Routes

| Route | Page |
| --- | --- |
| `/` | Security Dashboard |
| `/traffic` | Network Traffic |
| `/alerts` | Security Alerts |
| `/analytics` | Analytics |
| `/settings` | Settings |

## Data Fields

Traffic records include:

- `id`
- `source_ip`
- `destination_ip`
- `protocol`
- `source_port`
- `destination_port`
- `packet_size`
- `tcp_flags`
- `timestamp`

Alert records include:

- `id`
- `alert_type`
- `source_ip`
- `protocol`
- `severity`
- `detection_method`
- `timestamp`

## Notes

- The dashboard displays data returned by the Django API; it does not create mock network records.
- Machine-learning detection is currently represented as paused in the frontend settings view.
- Local databases, virtual environments, build output, logs, and generated ML files are excluded by the root `.gitignore`.
- Start Django before opening the frontend if you want live data instead of the backend connection error state.
