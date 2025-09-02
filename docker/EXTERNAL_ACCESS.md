# External Access Configuration

This document describes the changes made to enable external access to your NextAI Finance App deployment.

## Changes Made

### 1. Frontend Configuration
- **Environment Variable**: Set `VITE_API_URL=http://76.94.218.158:5001` during build
- **API Calls**: All frontend API calls now point to your server IP instead of localhost
- **Build Process**: Updated Dockerfile to inject the server IP during the build process

### 2. Nginx Configuration
- **Server Name**: Changed from `localhost` to `76.94.218.158`
- **Static Assets**: Properly configured to serve CSS, JS, and image files
- **SPA Routing**: Configured to handle React Router navigation

### 3. Docker Configuration
- **Frontend Service**: Updated to build with server IP configuration
- **Health Checks**: Maintained for monitoring service status
- **Dependencies**: Frontend depends on backend service

### 4. Test Scripts
- **Updated URLs**: All test scripts now use `76.94.218.158` instead of localhost
- **Dynamic CSS Detection**: Tests automatically detect the correct CSS file names
- **Comprehensive Testing**: Full validation of both frontend and backend services

## Access URLs

Your application is now accessible at:

- **Frontend**: http://76.94.218.158:8080
- **Backend API**: http://76.94.218.158:5001
- **Health Check**: http://76.94.218.158:5001/health

## Port Forwarding Required

Make sure you have port forwarding set up for:
- Port 8080 (Frontend)
- Port 5001 (Backend API)

## Testing

Run the comprehensive test suite:
```bash
./docker/test-frontend-deployment.sh
```

This will verify:
- Backend health and API endpoints
- Frontend accessibility and content
- Static asset serving (CSS, JS, images)
- Container orchestration
- Service dependencies

## Configuration Files Modified

1. `docker/Dockerfile.frontend` - Added VITE_API_URL environment variable
2. `docker/default.conf` - Updated nginx server_name
3. `docker/docker-compose.yml` - Frontend service configuration
4. `docker/test-frontend-deployment.sh` - Updated test URLs

## Notes

- The frontend is built with the server IP baked into the bundle
- All API requests from the browser will go directly to your server
- Static assets are served efficiently with proper caching headers
- The application supports both development and production environments

## Troubleshooting

If you can't access the application:
1. Verify port forwarding is active for ports 8080 and 5001
2. Check that both containers are running: `docker-compose -f docker/docker-compose.yml ps`
3. Review container logs: `docker logs nextai-frontend` and `docker logs nextai-server`
4. Test local access first: `curl http://localhost:8080` and `curl http://localhost:5001/health`
