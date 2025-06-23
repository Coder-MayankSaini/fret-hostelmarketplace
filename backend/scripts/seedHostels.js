const mongoose = require('mongoose');
const Hostel = require('../models/Hostel');

// Load environment variables
require('dotenv').config();

const sampleHostels = [
  {
    name: "Sunrise Hostel",
    address: {
      street: "123 College Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      country: "India"
    },
    contactInfo: {
      phone: "+91-22-12345678",
      email: "contact@sunrisehostel.com"
    },
    totalRooms: 100,
    facilities: ["WiFi", "Laundry", "Common Kitchen", "Study Room", "Gym"],
    description: "A modern hostel for students with all essential amenities",
    university: "Mumbai University",
    isActive: true
  },
  {
    name: "Green Valley Hostel",
    address: {
      street: "456 University Road",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India"
    },
    contactInfo: {
      phone: "+91-11-87654321",
      email: "info@greenvalleyhostel.com"
    },
    totalRooms: 150,
    facilities: ["WiFi", "Laundry", "Common Kitchen", "Library", "Recreation Room"],
    description: "Eco-friendly hostel with green spaces and modern facilities",
    university: "Delhi University",
    isActive: true
  },
  {
    name: "Tech Hub Hostel",
    address: {
      street: "789 Innovation Drive",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560001",
      country: "India"
    },
    contactInfo: {
      phone: "+91-80-11223344",
      email: "contact@techhubhostel.com"
    },
    totalRooms: 200,
    facilities: ["High-Speed WiFi", "Co-working Space", "Laundry", "Cafeteria", "24/7 Security"],
    description: "Perfect for tech students and professionals",
    university: "Bangalore Institute of Technology",
    isActive: true
  },
  {
    name: "Moonlight Girls Hostel",
    address: {
      street: "321 Women's Campus",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400002",
      country: "India"
    },
    contactInfo: {
      phone: "+91-22-98765432",
      email: "contact@moonlighthostel.com"
    },
    totalRooms: 80,
    facilities: ["WiFi", "Security", "Common Room", "Study Hall", "Garden"],
    description: "Safe and secure hostel for female students",
    university: "Mumbai University",
    isActive: true
  },
  {
    name: "Phoenix Engineering Hostel",
    address: {
      street: "654 Tech Campus",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560002",
      country: "India"
    },
    contactInfo: {
      phone: "+91-80-55443322",
      email: "contact@phoenixhostel.com"
    },
    totalRooms: 250,
    facilities: ["High-Speed WiFi", "Labs", "Workshop", "Cafeteria", "Sports Complex"],
    description: "State-of-the-art hostel for engineering students",
    university: "Bangalore Institute of Technology",
    isActive: true
  }
];

async function seedHostels() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fretio');
    console.log('Connected to MongoDB');

    // Clear existing hostels (optional - remove this line to keep existing data)
    await Hostel.deleteMany({});
    console.log('Cleared existing hostels');

    // Insert sample hostels
    const insertedHostels = await Hostel.insertMany(sampleHostels);
    console.log(`${insertedHostels.length} hostels inserted successfully`);

    insertedHostels.forEach((hostel, index) => {
      console.log(`${index + 1}. ${hostel.name} (ID: ${hostel._id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding hostels:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedHostels();