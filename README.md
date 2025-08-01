# 🏆 Champions Arena Tournament Management Platform

A comprehensive tournament management system that streamlines organizer-player collaboration for creating and monetizing gaming competitions with real-time tracking, secure payments, and cross-platform accessibility.

## 🚀 Features

- **🎮 Tournament Management**: Create, organize, and manage gaming tournaments with ease
- **💳 Payment Integration**: Secure PhonePe payment gateway for monetization
- **📱 Cross-Platform**: Web application and React Native mobile app
- **🔒 Secure Authentication**: JWT-based auth with email verification and 2FA for admins
- **👥 Role-Based Access**: Separate interfaces for players, organizers, and administrators
- **📊 Real-time Tracking**: Live tournament progress and participant management
- **☁️ Cloud Storage**: Cloudinary integration for image/media uploads
- **📈 Admin Dashboard**: Comprehensive panel for tournament oversight

## 📱 Screenshots

### Mobile App (React Native)

<div align="center">

| Login Screen | Home Screen | Matches Screen |
|:---:|:---:|:---:|
| ![Login Screen](ReadMe%20Assets/app/LoginScreen.jpg) | ![Home Screen](ReadMe%20Assets/app/HomeScreen.jpg) | ![Matches Screen](ReadMe%20Assets/app/matchesScreen.jpg) |

| Profile Screen | Leaderboard | Payment Gateway |
|:---:|:---:|:---:|
| ![Profile Screen](ReadMe%20Assets/app/ProfileScreen.jpg) | ![Leaderboard](ReadMe%20Assets/app/LeaderBoardScreen.jpg) | ![Payment Gateway](ReadMe%20Assets/app/payment%20gateway.png) |

</div>

### Admin Panel

<div align="center">

| Login Screen | Dashboard | Tournament Section |
|:---:|:---:|:---:|
| ![Admin Login](ReadMe%20Assets/admin%20panel/login%20screen.png) | ![Dashboard](ReadMe%20Assets/admin%20panel/dashboard.png) | ![Tournament Section](ReadMe%20Assets/admin%20panel/tornament%20section.png) |

</div>

## 🛠️ Tech Stack

### Frontend
- **Web**: React.js with Vite, TailwindCSS
- **Mobile**: React Native
- **UI/UX**: Modern responsive design with smooth animations

### Backend
- **Server**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with refresh token mechanism
- **File Storage**: Cloudinary for media management
- **Email**: SMTP integration for notifications

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx reverse proxy
- **Security**: SSL/TLS encryption, CORS configuration
- **Environment**: Development, Staging, Production configurations

### Payment & Services
- **Payment Gateway**: PhonePe integration
- **Cloud Storage**: Cloudinary
- **Email Service**: SMTP
- **API Documentation**: Postman collections included

## 🏗️ Project Structure

```
📦 Champions Arena Tournament App
├── 📱 app/                    # React Native mobile application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── screens/          # App screens (Auth, Profile, etc.)
│   │   ├── services/         # API services
│   │   ├── contexts/         # React contexts
│   │   └── config/           # App configuration
│   └── assets/               # Images and static files
├── 🖥️ web/                   # React web application
│   ├── src/
│   │   ├── components/       # Web components
│   │   ├── pages/           # Web pages
│   │   └── contexts/        # React contexts
│   └── public/              # Static assets
├── 🔧 server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Custom middlewares
│   │   └── services/       # Business logic
│   └── scripts/            # Utility scripts
└── 📊 ReadMe Assets/         # Screenshots and documentation
    ├── app/                 # Mobile app screenshots
    └── admin panel/         # Admin panel screenshots
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- Docker & Docker Compose (optional)
- React Native CLI (for mobile development)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/champions-arena-tournament-app.git
cd champions-arena-tournament-app
```

### 2. Environment Setup

Create `.env` files in each directory:

**Server (.env)**
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/champions_arena
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PHONEPE_MERCHANT_ID=your_phonepe_merchant_id
PHONEPE_SALT_KEY=your_phonepe_salt_key
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

**Web (.env)**
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Champions Arena
```

**App (no .env needed - configuration in constants.js)**

### 3. Installation & Development

#### Using Docker (Recommended)
```bash
# Development environment
docker-compose up -d

# Production environment
docker-compose -f docker-compose.prod.yml up -d
```

#### Manual Setup

**Backend Server**
```bash
cd server
npm install
npm run dev
```

**Web Application**
```bash
cd web
npm install
npm run dev
```

**Mobile App**
```bash
cd app
npm install

# For iOS
npx react-native run-ios

# For Android
npx react-native run-android
```

## 📚 API Documentation

The project includes comprehensive Postman collections:
- `champions_arena_complete_api.postman_collection.json` - Complete API documentation
- `champions_arena_player_auth.postman_collection.json` - Player authentication flows

### Key API Endpoints

#### Authentication
- `POST /api/v1/player-auth/register` - Player registration
- `POST /api/v1/player-auth/login` - Player login
- `POST /api/v1/auth/organizer/initiate-otp-auth` - Organizer OTP auth

#### Tournaments
- `GET /api/v1/tournaments` - Get all tournaments
- `POST /api/v1/tournaments` - Create tournament (Organizer)
- `GET /api/v1/tournaments/:id` - Get tournament details

#### Payments
- `POST /api/v1/payments/initiate` - Initiate PhonePe payment
- `POST /api/v1/payments/verify` - Verify payment status

## 🔐 Security Features

- **JWT Authentication** with access and refresh tokens
- **Email Verification** for account activation
- **Two-Factor Authentication** for admin accounts
- **Role-Based Access Control** (Player, Organizer, Admin)
- **Input Validation** and sanitization
- **Rate Limiting** on API endpoints
- **CORS Configuration** for secure cross-origin requests
- **File Upload Security** with type validation

## 🎯 User Roles

### 👤 Players
- Register and participate in tournaments
- View tournament schedules and results
- Track performance and rankings
- Secure payment processing

### 🎪 Organizers
- Create and manage tournaments
- Set entry fees and prize pools
- Monitor participant registration
- Access revenue analytics

### 👨‍💼 Administrators
- Platform-wide tournament oversight
- User management and moderation
- System configuration and settings
- Advanced analytics and reporting

## 🌐 Deployment

### Production Deployment with Docker
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Manual Production Setup
1. Set up MongoDB cluster
2. Configure environment variables
3. Build React applications
4. Deploy Node.js server with PM2
5. Configure Nginx reverse proxy
6. Set up SSL certificates

## 📋 Testing

### API Testing
```bash
cd server
npm test
```

### Authentication Testing
Refer to the included testing guides:
- `player_auth_testing_guide.md`
- `passwordless_auth_testing_guide.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@championsarena.com
- Documentation: [Wiki](https://github.com/yourusername/champions-arena-tournament-app/wiki)

## 🚧 Roadmap

- [ ] Live streaming integration
- [ ] Advanced tournament brackets
- [ ] Social features and chat
- [ ] Mobile push notifications
- [ ] Multi-language support
- [ ] AI-powered match predictions

---

<div align="center">

**Made with ❤️ by the Champions Arena Team**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/champions-arena-tournament-app?style=social)](https://github.com/yourusername/champions-arena-tournament-app)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/champions-arena-tournament-app?style=social)](https://github.com/yourusername/champions-arena-tournament-app)

</div>


