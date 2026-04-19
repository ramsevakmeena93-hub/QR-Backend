# QR Code Based Attendance System

A modern, full-stack attendance management system for colleges using QR code technology. Built with React, Node.js, Express, and MongoDB.

## Features

### 🔐 Authentication
- JWT-based authentication
- Role-based access control (Admin, Teacher, Student)
- Secure login and registration

### 👨‍🏫 Teacher Features
- Create and manage classes
- Generate time-limited QR codes (60 seconds)
- Real-time attendance tracking
- View attendance history
- Download attendance reports

### 👨‍🎓 Student Features
- Join classes using class codes
- Scan QR codes to mark attendance
- View attendance history
- Track attendance percentage
- Prevent duplicate attendance

### 🛠 Admin Features
- Manage teachers and students
- Create subjects
- View all attendance records
- Analytics dashboard
- Low attendance alerts

### 🔳 QR Code System
- Secure token-based QR codes
- 60-second expiration
- Prevents screenshot cheating
- Prevents duplicate scans
- Real-time attendance updates

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- React Router
- Axios
- React QR Reader
- React Icons
- React Toastify

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- QRCode library
- bcryptjs

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup Instructions

1. Clone the repository
```bash
git clone <repository-url>
cd qr-attendance-system
```

2. Install backend dependencies
```bash
npm install
```

3. Install frontend dependencies
```bash
cd frontend
npm install
cd ..
```

4. Create environment file
```bash
cp .env.example .env
```

5. Configure environment variables in `.env`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/qr-attendance
JWT_SECRET=your_secret_key_here
NODE_ENV=development
QR_EXPIRY_SECONDS=60
```

6. Start MongoDB
```bash
# If using local MongoDB
mongod
```

7. Start the backend server
```bash
npm start
# or for development with auto-reload
npm run dev
```

8. Start the frontend (in a new terminal)
```bash
cd frontend
npm start
```

9. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Admin Setup

To create an admin user, you can either:

1. Register through the API directly:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@college.edu",
    "password": "admin123",
    "role": "admin"
  }'
```

2. Or modify the User model to allow admin registration through the UI

## Usage Guide

### For Admin
1. Login with admin credentials
2. Add teachers and students
3. Create subjects
4. Monitor attendance and analytics

### For Teachers
1. Register/Login as teacher
2. Create classes with unique codes
3. Generate QR codes during class
4. Monitor real-time attendance
5. View attendance reports

### For Students
1. Register/Login as student
2. Join classes using class codes
3. Scan QR codes to mark attendance
4. View attendance history and percentage

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Teacher
- GET `/api/teacher/dashboard` - Get dashboard stats
- POST `/api/teacher/class` - Create class
- GET `/api/teacher/classes` - Get all classes
- GET `/api/teacher/class/:classId` - Get class details

### Student
- GET `/api/student/dashboard` - Get dashboard stats
- POST `/api/student/join-class` - Join class
- GET `/api/student/classes` - Get enrolled classes
- GET `/api/student/attendance` - Get attendance history

### Admin
- GET `/api/admin/dashboard` - Get admin dashboard
- POST `/api/admin/teacher` - Add teacher
- POST `/api/admin/student` - Add student
- POST `/api/admin/subject` - Create subject
- GET `/api/admin/teachers` - Get all teachers
- GET `/api/admin/students` - Get all students

### QR & Attendance
- POST `/api/qr/generate` - Generate QR code
- POST `/api/attendance/mark` - Mark attendance
- GET `/api/attendance/live/:sessionId` - Get live attendance

## Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Role-based access control
- Time-limited QR codes
- Duplicate attendance prevention
- Secure token generation

## Project Structure

```
qr-attendance-system/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Class.js
│   │   ├── Subject.js
│   │   ├── Attendance.js
│   │   └── QRSession.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── teacher.js
│   │   ├── student.js
│   │   ├── admin.js
│   │   ├── qr.js
│   │   └── attendance.js
│   ├── middleware/
│   │   └── auth.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── .env.example
├── package.json
└── README.md
```

## Deployment

### Backend Deployment (Heroku/Railway)
1. Set environment variables
2. Deploy backend code
3. Ensure MongoDB connection

### Frontend Deployment (Vercel/Netlify)
1. Build frontend: `npm run build`
2. Deploy build folder
3. Configure API proxy

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License

## Support

For issues and questions, please create an issue in the repository.

## Future Enhancements

- Face verification with QR
- Geo-location verification
- Excel export functionality
- Email notifications
- Mobile app version
- Dark mode
- Multi-language support
