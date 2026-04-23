#!/bin/bash

# Photography Marketplace - Development Startup Script
# This script helps you start the application correctly

echo "🎨 Photography Marketplace - Development Startup"
echo "================================================"
echo ""

# Resolve DB connection settings (env -> backend/.env -> defaults)
DB_HOST="${PGHOST:-localhost}"
DB_PORT="${PGPORT:-5432}"
DB_USER="${PGUSER:-postgres}"
DB_NAME="${PGDATABASE:-photomarket}"
DB_PASS="${PGPASSWORD:-}"

DB_URL="${DATABASE_URL:-}"
if [[ -z "$DB_URL" && -f "backend/.env" ]]; then
    DB_URL=$(grep -E '^DATABASE_URL=' backend/.env | head -n 1 | cut -d= -f2-)
fi

# Strip surrounding quotes if present
DB_URL="${DB_URL%\"}"
DB_URL="${DB_URL#\"}"

# Parse DATABASE_URL if available
if [[ -n "$DB_URL" ]]; then
    proto_removed="${DB_URL#*://}"
    host_and_db="${proto_removed#*@}"

    if [[ "$proto_removed" == *"@"* ]]; then
        creds="${proto_removed%@*}"
        if [[ "$creds" == *":"* ]]; then
            db_user="${creds%%:*}"
            db_pass="${creds#*:}"
        else
            db_user="$creds"
        fi
    fi

    hostport="${host_and_db%%/*}"
    db_name="${host_and_db#*/}"
    db_name="${db_name%%\?*}"

    if [[ -n "${db_user:-}" ]]; then DB_USER="$db_user"; fi
    if [[ -n "${db_pass:-}" ]]; then DB_PASS="$db_pass"; fi
    if [[ -n "$db_name" ]]; then DB_NAME="$db_name"; fi

    if [[ "$hostport" == *":"* ]]; then
        DB_HOST="${hostport%%:*}"
        DB_PORT="${hostport#*:}"
    elif [[ -n "$hostport" ]]; then
        DB_HOST="$hostport"
    fi
fi

REMOTE_DB=false
if [[ "$DB_HOST" != "localhost" && "$DB_HOST" != "127.0.0.1" ]]; then
    REMOTE_DB=true
fi

echo "ℹ️  Using DB connection: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo ""

# Check if PostgreSQL is running
echo "📊 Step 1: Checking PostgreSQL..."
if [[ "$REMOTE_DB" == true ]]; then
    echo "ℹ️  Remote PostgreSQL detected (${DB_HOST})"
    echo "   Skipping local service checks and database creation steps"
elif command -v pg_isready &> /dev/null; then
    if PGPASSWORD="$DB_PASS" pg_isready -q -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; then
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
if [[ "$REMOTE_DB" == true ]]; then
    echo "ℹ️  Remote database detected"
    echo "   Skipping local database existence checks"
elif command -v psql &> /dev/null; then
    PSQL_BASE=(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER")
    if PGPASSWORD="$DB_PASS" "${PSQL_BASE[@]}" -d postgres -lqt | cut -d \| -f 1 | tr -d ' ' | grep -qw "$DB_NAME"; then
        echo "✅ Database '${DB_NAME}' exists"
    else
        echo "⚠️  Database '${DB_NAME}' does not exist"
        echo ""
        read -p "Create database now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            PGPASSWORD="$DB_PASS" "${PSQL_BASE[@]}" -d postgres -c "CREATE DATABASE \"${DB_NAME}\";"
            echo "✅ Database created"
        else
            echo "❌ Database required. Please create manually:"
            echo "   psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d postgres"
            echo "   CREATE DATABASE ${DB_NAME};"
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
        npm run prisma:setup
        cd ..
        echo "✅ Prisma setup complete"
    else
        echo "❌ Prisma setup required"
        exit 1
    fi
else
    echo "✅ Prisma is setup"
    echo "🔄 Applying migrations and seeding backend..."
    cd backend
    if npm run prisma:setup; then
        echo "✅ Prisma migrations and seed complete"
    else
        echo "❌ Prisma setup failed"
        exit 1
    fi
    cd ..
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
        gnome-terminal -- bash -c "cd \"$PWD/backend\" && npm run dev; exec bash"
        gnome-terminal -- bash -c "cd \"$PWD\" && npm run dev; exec bash"
    elif command -v konsole &> /dev/null; then
        konsole -e bash -c "cd \"$PWD/backend\" && npm run dev"
        konsole -e bash -c "cd \"$PWD\" && npm run dev"
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
echo "3. Login with: admin@gmail.com / admin123"
echo ""
echo "Seeded credentials:"
echo "  Admin: admin@gmail.com / admin123"
echo ""
echo "📚 Documentation:"
echo "  - STARTUP_CHECKLIST.md - Detailed setup guide"
echo "  - QUICKSTART.md - Quick start guide"
echo "  - ERROR_FIXES.md - Troubleshooting"
echo "  - README.md - Full documentation"
echo ""
echo "🎉 Happy coding!"
echo ""
