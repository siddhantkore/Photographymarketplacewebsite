#!/bin/bash

# Photography Marketplace - Development Startup Script
# This script helps you start the application correctly

echo "🎨 Photography Marketplace - Development Startup"
echo "================================================"
echo ""

# Check if PostgreSQL is running
# Check if PostgreSQL is running in Docker
echo "📊 Step 1: Checking PostgreSQL (Docker)..."

MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec fleet-management-db pg_isready -U postgres &> /dev/null; then
        echo "✅ PostgreSQL is ready inside Docker!"
        break
    else
        echo "⏳ Waiting for fleet-management-db to initialize... ($((RETRY_COUNT + 1))/$MAX_RETRIES)"
        sleep 3
        RETRY_COUNT=$((RETRY_COUNT + 1))
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ PostgreSQL failed to start in time."
    echo "   Try: docker start fleet-management-db"
    exit 1
fi

echo ""

# Check if database exists
# Check if database exists (Using Docker Exec)
echo "🗄️  Step 2: Checking database..."

# We check inside the container if the 'photomarket' database exists
DB_EXISTS=$(docker exec fleet-management-db psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='photomarket'")

if [ "$DB_EXISTS" = "1" ]; then
    echo "✅ Database 'photomarket' exists"
else
    echo "⚠️  Database 'photomarket' does not exist"
    read -p "Create database now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker exec fleet-management-db psql -U postgres -c "CREATE DATABASE photomarket;"
        echo "✅ Database created"
    else
        echo "❌ Database required. Script stopped."
        exit 1
    fi
fi

echo ""

# Check backend dependencies
echo "📦 Step 3: Checking backend dependencies..."
if [ ! -d "backend/node_modules" ]; then
    echo "⚠️  Backend dependencies not installed"
    echo ""
    read -p "Install backend dependencies now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd backend
        npm install
        cd ..
        echo "✅ Backend dependencies installed"
    else
        echo "❌ Backend dependencies required"
        exit 1
    fi
else
    echo "✅ Backend dependencies installed"
fi

echo ""

# Check if Prisma is setup
echo "🔧 Step 4: Checking Prisma setup..."
if [ ! -d "backend/node_modules/.prisma" ]; then
    echo "⚠️  Prisma client not generated"
    echo ""
    read -p "Setup Prisma now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd backend
        npm run prisma:generate
        npm run prisma:migrate
        npm run prisma:seed
        cd ..
        echo "✅ Prisma setup complete"
    else
        echo "❌ Prisma setup required"
        exit 1
    fi
else
    echo "✅ Prisma is setup"
fi

echo ""

# Check frontend dependencies
echo "📦 Step 5: Checking frontend dependencies..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  Frontend dependencies not installed"
    echo ""
    read -p "Install frontend dependencies now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install
        echo "✅ Frontend dependencies installed"
    else
        echo "❌ Frontend dependencies required"
        exit 1
    fi
else
    echo "✅ Frontend dependencies installed"
fi

echo ""
echo "================================================"
echo "✅ All checks passed! Ready to start development servers"
echo "================================================"
echo ""
echo "🚀 Starting servers..."
echo ""
echo "This will open 2 terminal tabs/windows:"
echo "  1. Backend server (port 5000)"
echo "  2. Frontend server (port 5173)"
echo ""

# Detect OS for terminal opening
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Opening terminals on macOS..."
    osascript <<END
tell application "Terminal"
    do script "cd \"$PWD/backend\" && npm run dev"
    do script "cd \"$PWD\" && npm run dev"
    activate
end tell
END
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🚀 Starting servers in a tmux session..."
    tmux new-session -d -s photomarket 'cd backend && npm run dev'
    tmux split-window -h 'npm run dev'
    tmux attach-session -t photomarket
    # # Linux
    # if command -v gnome-terminal &> /dev/null; then
    #     gnome-terminal -- bash -c "cd $PWD/backend && npm run dev; exec bash"
    #     gnome-terminal -- bash -c "cd $PWD && npm run dev; exec bash"
    # elif command -v konsole &> /dev/null; then
    #     konsole -e "cd $PWD/backend && npm run dev"
    #     konsole -e "cd $PWD && npm run dev"
    # else
    #     echo "⚠️  Could not detect terminal emulator"
    #     echo ""
    #     echo "Please open 2 terminals manually and run:"
    #     echo ""
    #     echo "Terminal 1:"
    #     echo "  cd backend && npm run dev"
    #     echo ""
    #     echo "Terminal 2:"
    #     echo "  npm run dev"
    # fi
else
    # Windows or other
    echo "⚠️  Auto-start not available on this OS"
    echo ""
    echo "Please open 2 terminals manually and run:"
    echo ""
    echo "Terminal 1:"
    echo "  cd backend"
    echo "  npm run dev"
    echo ""
    echo "Terminal 2:"
    echo "  npm run dev"
fi

echo ""
echo "================================================"
echo "📝 Next Steps:"
echo "================================================"
echo ""
echo "1. Wait for both servers to start (10-30 seconds)"
echo "2. Open browser: http://localhost:5173"
echo "3. Login with: admin@photomarket.com / admin"
echo ""
echo "Default test credentials:"
echo "  Admin: admin@photomarket.com / admin"
echo "  User:  john.doe@example.com / password123"
echo ""
echo "📚 Documentation:"
echo "  - STARTUP_CHECKLIST.md - Detailed setup guide"
echo "  - QUICKSTART.md - Quick start guide"
echo "  - ERROR_FIXES.md - Troubleshooting"
echo "  - README.md - Full documentation"
echo ""
echo "🎉 Happy coding!"
echo ""
