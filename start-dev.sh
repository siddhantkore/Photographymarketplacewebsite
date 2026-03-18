#!/bin/bash

# Photography Marketplace - Development Startup Script
# This script helps you start the application correctly

echo "🎨 Photography Marketplace - Development Startup"
echo "================================================"
echo ""

# Check if PostgreSQL is running
echo "📊 Step 1: Checking PostgreSQL..."
if command -v pg_isready &> /dev/null; then
    if pg_isready -q; then
        echo "✅ PostgreSQL is running"
    else
        echo "❌ PostgreSQL is not running"
        echo ""
        echo "Please start PostgreSQL first:"
        echo "  macOS:   brew services start postgresql"
        echo "  Linux:   sudo systemctl start postgresql"
        echo "  Windows: Start PostgreSQL service from Services app"
        exit 1
    fi
else
    echo "⚠️  Cannot check PostgreSQL status (pg_isready not found)"
    echo "   Please make sure PostgreSQL is running manually"
fi

echo ""

# Check if database exists
echo "🗄️  Step 2: Checking database..."
if command -v psql &> /dev/null; then
    if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw photomarket; then
        echo "✅ Database 'photomarket' exists"
    else
        echo "⚠️  Database 'photomarket' does not exist"
        echo ""
        read -p "Create database now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            psql -U postgres -c "CREATE DATABASE photomarket;"
            echo "✅ Database created"
        else
            echo "❌ Database required. Please create manually:"
            echo "   psql -U postgres"
            echo "   CREATE DATABASE photomarket;"
            exit 1
        fi
    fi
else
    echo "⚠️  Cannot check database (psql not found)"
    echo "   Please make sure database 'photomarket' exists"
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
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd $PWD/backend && npm run dev; exec bash"
        gnome-terminal -- bash -c "cd $PWD && npm run dev; exec bash"
    elif command -v konsole &> /dev/null; then
        konsole -e "cd $PWD/backend && npm run dev"
        konsole -e "cd $PWD && npm run dev"
    else
        echo "⚠️  Could not detect terminal emulator"
        echo ""
        echo "Please open 2 terminals manually and run:"
        echo ""
        echo "Terminal 1:"
        echo "  cd backend && npm run dev"
        echo ""
        echo "Terminal 2:"
        echo "  npm run dev"
    fi
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
