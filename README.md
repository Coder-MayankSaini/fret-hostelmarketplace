# Fretio - Interhostel Marketplace

Fretio is a marketplace platform designed specifically for hostel residents to buy and rent items directly from each other. Built with a focus on simplicity and community-driven transactions.

## 🏠 Key Features

- **Hostel-Specific**: Users can only see and interact with items from their own hostel
- **No Delivery System**: All transactions are handled in-person (buyers collect from seller's room)
- **No Payment Gateway**: Direct cash transactions between users
- **Buy & Rent**: Support for both selling and renting items
- **Seller Verification**: Multi-step seller application and approval process
- **Profile Management**: Custom availability hours and seller profiles
- **User Ratings**: Rate sellers/renters to build trust in the community
- **Real-time Search**: Find items quickly with category and price filters

## 🛠 Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation

### Frontend
- **React** with **TypeScript**
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or cloud instance)
- npm or yarn package manager

## 🚀 Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hostelmarketplace
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

Create a `.env` file in the `backend` directory with the following variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fretio
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Database Setup

Make sure MongoDB is running on your system. The application will automatically create the necessary collections.

#### Seed Sample Hostels
You can quickly add sample hostels to test the application:

```bash
# From the backend directory
cd backend
npm run seed-hostels
```

This will create three sample hostels:
- Sunrise Hostel (Mumbai)
- Green Valley Hostel (Delhi) 
- Tech Hub Hostel (Bangalore)

### 5. Run the Application

#### Development Mode (Both frontend and backend)
```bash
# From the root directory
npm run dev
```

#### Separately
```bash
# Backend only (from backend directory)
npm run dev

# Frontend only (from frontend directory)
npm start
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📱 Usage

### For Users

1. **Registration**: Sign up with your email, select your hostel, and provide room number
2. **Become a Seller**: Apply to become a verified seller by providing:
   - Availability hours for item pickup
   - Profile description (optional)
   - Profile photo (optional)
3. **Seller Approval**: For MVP, applications are auto-approved after submission
4. **Browse Items**: View items available in your hostel, filter by category, price, or search
5. **Create Listings**: Once approved as seller, list items for sale or rent with photos and descriptions
6. **Contact Sellers**: Express interest in items to get seller contact details
7. **Rate Users**: Rate your transaction partners to build community trust

### Seller Flow

1. **Application**: Click "Become a Seller" on the homepage
2. **Profile Setup**: Provide availability hours and optional description
3. **Mock Approval**: Application is automatically approved after 2 seconds (MVP feature)
4. **Start Selling**: Access to create item listings and seller dashboard
5. **Manage Listings**: View and manage your active/sold items

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/seller/apply` - Apply to become seller
- `GET /api/auth/seller/status` - Get seller application status
- `POST /api/auth/seller/mock-approve` - Mock approve seller (MVP)

#### Items
- `GET /api/items` - Get items in user's hostel
- `POST /api/items` - Create new item listing
- `GET /api/items/:id` - Get item details
- `PUT /api/items/:id` - Update item (owner only)
- `DELETE /api/items/:id` - Delete item (owner only)

#### Hostels
- `GET /api/hostels` - Get all active hostels
- `GET /api/hostels/:id` - Get hostel details

## 🏗 Project Structure

```
hostelmarketplace/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication & validation
│   └── server.js        # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── services/    # API services
│   │   └── types/       # TypeScript types
│   └── public/
└── package.json
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Hostel-based access control
- Protected routes

## 🚧 Development Notes

- The application is designed for hostel communities where users know each other
- No payment processing - all transactions are cash-based
- No delivery system - buyers must collect items in person
- Image storage can be configured with Cloudinary for production

## 🛣 Future Enhancements

- Push notifications for interested users
- Advanced search with more filters
- Item request system
- Admin panel for hostel management
- Mobile app development
- Integration with hostel management systems

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support or questions, please open an issue in the repository. 