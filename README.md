# Delta Project - Local Development Setup

This project consists of a React frontend and Node.js backend. Follow these instructions to run both on localhost.

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- MongoDB connection string

## Backend Setup

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Backend directory with your MongoDB connection string:
```env
MONGODB_URI=your_mongodb_connection_string_here
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on: **http://localhost:5000**

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on: **http://localhost:3000**

## API Configuration

The frontend is configured to connect to the backend at `http://localhost:5000`. The API configuration is in:
- `Frontend/src/config/api.js`

## Available Endpoints

Once both servers are running, you can access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## Admin Panel

Access the admin panel at: http://localhost:3000/admin

## Troubleshooting

1. **CORS Issues**: Make sure the backend is running on port 5000 and frontend on port 3000
2. **Database Connection**: Ensure your MongoDB connection string is correct in the `.env` file
3. **Port Conflicts**: If ports are in use, you can change them in the respective configuration files

## Development URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Base: http://localhost:5000/api 