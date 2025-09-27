# Docker Setup for NextAI Finance Server

This directory contains Docker configuration for running **only the backend server** in a container.

## Quick Start

```bash
# Make the script executable
chmod +x start-server.sh

# Start the server
./start-server.sh
```

## What's Included

- **Dockerfile**: Multi-stage build for the Node.js/Express server
- **docker-compose.yml**: Service configuration for the server only
- **start-server.sh**: Easy startup script
- **.dockerignore**: Optimized file exclusions for faster builds

## File Structure

```
docker/
├── Dockerfile              # Server container definition
├── docker-compose.yml      # Service orchestration
├── start-server.sh         # Quick start script
├── .dockerignore           # Build optimization
└── README.md              # This file
```

## Environment

The server uses your existing `.env` file from the project root, which should contain:

- `DATABASE_URL` (NeonDB connection)
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `PORT` (defaults to 5001)

## Service Details

- **Container Name**: `nextai-server`
- **Port**: `5001` (mapped to host:5555)
- **Health Check**: `/health` endpoint
- **Volumes**: 
  - `uploads/` - Persistent file uploads
  - `logs/` - Application logs
- **Restart Policy**: `unless-stopped`

## Commands

```bash
# Start server (with rebuild)
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop server
docker-compose down

# Check status
docker-compose ps

# Remove container and images
docker-compose down --rmi all
```

## Development Notes

- Server runs in development mode with hot reload
- Database migrations run automatically on startup
- Prisma client is generated during build
- File uploads and logs persist between container restarts

## Testing

After starting, verify the server is running:

```bash
# Health check
curl http://localhost:5555/health

# Should return:
# {"status":"OK","timestamp":"...","environment":"development","version":"1.0.1"}
```
