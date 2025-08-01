# Champions Arena Tournament App - Docker Setup

This project consists of three main components:
- **Web Frontend** (React/Vite) - Port 3000
- **Backend API** (Node.js/Express) - Port 8000  
- **Mobile App** (React Native/Expo) - Port 8081
- **Database** (MongoDB) - Port 27017

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed on your system
- Git (to clone the repository)

### 1. Environment Setup

Copy the environment template and configure your variables:

```bash
cp .env.example .env
```

Edit the `.env` file and fill in your actual configuration values:
- Database credentials
- JWT secrets
- Cloudinary API keys (for image uploads)
- Email service credentials
- PhonePe payment gateway credentials

### 2. Development Setup

Start all services in development mode:

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

This will start:
- MongoDB database on `localhost:27017`
- Backend API on `localhost:8000`
- Web frontend on `localhost:3000`
- Mobile app (Expo web) on `localhost:8081`

### 3. Production Setup

For production deployment:

```bash
# Use the production docker-compose file
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. Individual Service Management

Start specific services:

```bash
# Start only database and backend
docker-compose up mongodb server

# Start only web frontend
docker-compose up web

# Start only mobile app
docker-compose up app
```

### 5. Useful Docker Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs
docker-compose logs server  # Specific service logs

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This will delete database data)
docker-compose down -v

# Rebuild specific service
docker-compose build server
docker-compose up -d server

# Access container shell
docker-compose exec server sh
docker-compose exec mongodb mongo
```

## Service URLs

- **Web Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/v1/docs (if implemented)
- **Mobile App (Web)**: http://localhost:8081
- **MongoDB**: mongodb://localhost:27017

## File Structure

```
├── web/                    # React/Vite frontend
│   ├── Dockerfile         # Web frontend Docker config
│   ├── nginx.conf         # Nginx configuration
│   └── .dockerignore
├── server/                # Node.js backend
│   ├── Dockerfile         # Backend Docker config
│   └── .dockerignore
├── app/                   # React Native/Expo mobile app
│   ├── Dockerfile         # Mobile app Docker config
│   └── .dockerignore
├── docker-compose.yml     # Development configuration
├── docker-compose.prod.yml # Production configuration
└── .env.example          # Environment variables template
```

## Environment Variables

Key environment variables you need to configure:

### Database
- `MONGO_ROOT_USERNAME`: MongoDB admin username
- `MONGO_ROOT_PASSWORD`: MongoDB admin password
- `MONGO_DATABASE`: Database name

### Authentication
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens

### File Storage (Cloudinary)
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### Email Service
- `EMAIL_HOST`: SMTP host (e.g., smtp.gmail.com)
- `EMAIL_PORT`: SMTP port (e.g., 587)
- `EMAIL_USER`: Your email address
- `EMAIL_PASS`: Your email app password

### Payment Gateway (PhonePe)
- `PHONEPE_MERCHANT_ID`: Your PhonePe merchant ID
- `PHONEPE_SALT_KEY`: Your PhonePe salt key
- `PHONEPE_SALT_INDEX`: Salt index (usually 1)
- `PHONEPE_ENVIRONMENT`: SANDBOX or PRODUCTION

## Development Workflow

1. **Make changes to your code**
2. **Rebuild the affected service**:
   ```bash
   docker-compose build service-name
   docker-compose up -d service-name
   ```
3. **View logs for debugging**:
   ```bash
   docker-compose logs -f service-name
   ```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 8000, 8081, and 27017 are not in use
2. **Permission errors**: On Linux/Mac, you might need to run with `sudo`
3. **Build failures**: Clear Docker cache with `docker system prune`
4. **Database connection issues**: Ensure MongoDB is fully started before backend

### Reset Everything

If you encounter issues, you can reset the entire setup:

```bash
# Stop all containers
docker-compose down

# Remove all containers, networks, and volumes
docker-compose down -v --remove-orphans

# Remove all images (optional)
docker system prune -a

# Rebuild everything
docker-compose up --build
```

## Production Deployment

For production deployment:

1. Use `docker-compose.prod.yml`
2. Set strong passwords and secrets in `.env`
3. Configure SSL certificates
4. Set up proper reverse proxy (Nginx)
5. Configure firewall rules
6. Set up monitoring and logging

## Mobile App Development

The mobile app runs in Expo web mode by default. For full React Native development:

1. Install Expo CLI on your local machine
2. Use the app code directory directly
3. Run `expo start` for development with device testing

## Support

For issues and questions:
- Check the logs: `docker-compose logs`
- Verify environment variables are set correctly
- Ensure all required external services (Cloudinary, email, payment gateway) are configured