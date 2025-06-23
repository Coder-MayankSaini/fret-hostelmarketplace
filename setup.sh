#!/bin/bash

# 🏠 Fretio Interhostel Marketplace - Development Setup Script
# This script helps set up the development environment

echo "🏠 Setting up Fretio Interhostel Marketplace..."
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version is too old. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies  
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Go back to root
cd ..

# Check if MongoDB is running
echo "🔍 Checking MongoDB connection..."
if ! curl -s http://localhost:27017 > /dev/null; then
    echo "⚠️  MongoDB doesn't seem to be running on localhost:27017"
    echo "   Please start MongoDB or configure your connection string"
else
    echo "✅ MongoDB connection available"
fi

# Create environment file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating example .env file..."
    cat > backend/.env << EOL
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fretio
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
EOL
    echo "✅ Created backend/.env file - please update with your settings"
else
    echo "✅ Environment file already exists"
fi

echo ""
echo "🎉 Setup complete! You can now start the application:"
echo "   Frontend: cd frontend && npm start"
echo "   Backend:  cd backend && npm start"
echo "   Or both:  npm run dev (from root directory)"
echo ""
echo "📝 Next steps:"
echo "   1. Update backend/.env with your MongoDB connection"
echo "   2. Run 'cd backend && npm run seed-hostels' to add sample data"
echo "   3. Start the development servers"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000" 