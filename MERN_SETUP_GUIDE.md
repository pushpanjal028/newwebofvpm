# Vishwa Patrakar Mahasangh - MERN Stack Setup Guide

This guide provides the complete MERN stack structure for deploying on external platforms.

## Project Structure

```
vishwa-patrakar-mahasangh/
├── client/                    # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Gallery.jsx
│   │   │   ├── Registration.jsx
│   │   │   ├── MemberList.jsx
│   │   │   ├── Success.jsx
│   │   │   └── Cancel.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                    # Express Backend
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── Member.js
│   ├── routes/
│   │   ├── registration.js
│   │   └── webhook.js
│   ├── controllers/
│   │   ├── registrationController.js
│   │   └── emailController.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── emailService.js
│   ├── server.js
│   └── package.json
│
├── .env.example
└── README.md
```

## Environment Variables

### Server (.env in /server)
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vishwa-patrakar
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@vishwapatrakar.org
```

### Client (.env in /client)
```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## Backend Code (Server)

### server/package.json
```json
{
  "name": "vishwa-patrakar-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "stripe": "^14.0.0",
    "nodemailer": "^6.9.7",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### server/server.js
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import registrationRoutes from './routes/registration.js';
import webhookRoutes from './routes/webhook.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Webhook route BEFORE express.json() - Stripe needs raw body
app.use('/api/webhook', webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/registration', registrationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### server/config/db.js
```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
```

### server/models/Member.js
```javascript
import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  organization: {
    type: String,
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  stripeSessionId: {
    type: String
  },
  stripePaymentIntentId: {
    type: String
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Member', memberSchema);
```

### server/routes/registration.js
```javascript
import express from 'express';
import { body } from 'express-validator';
import {
  createRegistration,
  createCheckoutSession,
  getAllMembers
} from '../controllers/registrationController.js';

const router = express.Router();

router.post(
  '/create',
  [
    body('fullName').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('phone').notEmpty().trim()
  ],
  createRegistration
);

router.post('/checkout-session', createCheckoutSession);

router.get('/members', getAllMembers);

export default router;
```

### server/routes/webhook.js
```javascript
import express from 'express';
import Stripe from 'stripe';
import Member from '../models/Member.js';
import { sendConfirmationEmail } from '../utils/emailService.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const member = await Member.findOne({ stripeSessionId: session.id });

      if (member) {
        member.paymentStatus = 'completed';
        member.stripePaymentIntentId = session.payment_intent;
        await member.save();

        await sendConfirmationEmail(member);

        console.log(`Payment completed for: ${member.email}`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  res.json({ received: true });
});

export default router;
```

### server/controllers/registrationController.js
```javascript
import { validationResult } from 'express-validator';
import Stripe from 'stripe';
import Member from '../models/Member.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createRegistration = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { fullName, email, phone, organization } = req.body;

    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return res.status(400).json({
        message: 'This email is already registered'
      });
    }

    const member = await Member.create({
      fullName,
      email,
      phone,
      organization,
      paymentStatus: 'pending'
    });

    res.status(201).json({
      message: 'Registration created successfully',
      memberId: member._id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { memberId } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Vishwa Patrakar Mahasangh Membership',
              description: 'Annual membership registration fee',
            },
            unit_amount: 50000, // 500 INR
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: member.email,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        memberId: member._id.toString()
      }
    });

    member.stripeSessionId = session.id;
    await member.save();

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
};

export const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find({ paymentStatus: 'completed' })
      .select('fullName email phone organization registrationDate')
      .sort({ registrationDate: -1 });

    res.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Error fetching members' });
  }
};
```

### server/utils/emailService.js
```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendConfirmationEmail = async (member) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: member.email,
    subject: 'Welcome to Vishwa Patrakar Mahasangh - Registration Confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Registration Confirmed!</h2>
        <p>Dear ${member.fullName},</p>
        <p>Thank you for registering with <strong>Vishwa Patrakar Mahasangh</strong>.</p>
        <p>Your payment has been successfully processed and your membership is now active.</p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Registration Details:</h3>
          <p><strong>Name:</strong> ${member.fullName}</p>
          <p><strong>Email:</strong> ${member.email}</p>
          <p><strong>Phone:</strong> ${member.phone}</p>
          <p><strong>Registration Date:</strong> ${new Date(member.registrationDate).toLocaleDateString()}</p>
        </div>

        <p>If you have any questions, please contact us.</p>
        <p>Best regards,<br>Vishwa Patrakar Mahasangh Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${member.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
```

### server/middleware/errorHandler.js
```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
```

## Frontend Code (Client)

### client/package.json
```json
{
  "name": "vishwa-patrakar-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.20.0",
    "@stripe/stripe-js": "^2.2.0",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.4.2"
  }
}
```

### client/vite.config.js
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

### client/tailwind.config.js
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### client/postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### client/src/main.jsx
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### client/src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### client/src/App.jsx
```javascript
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Registration from './pages/Registration';
import MemberList from './pages/MemberList';
import Success from './pages/Success';
import Cancel from './pages/Cancel';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/members" element={<MemberList />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
      </Routes>
    </Layout>
  );
}

export default App;
```

### client/src/components/Navbar.jsx
```javascript
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Newspaper } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/registration', label: 'Registration' },
    { path: '/members', label: 'Members' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Newspaper className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Vishwa Patrakar Mahasangh
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${
                  isActive(link.path)
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                } px-3 py-2 text-sm font-medium transition-colors`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`${
                  isActive(link.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                } block px-3 py-2 rounded-md text-base font-medium`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
```

### client/src/components/Footer.jsx
```javascript
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Vishwa Patrakar Mahasangh</h3>
            <p className="text-gray-400">
              Empowering journalists and media professionals worldwide.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@vishwapatrakar.org</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+91 1234567890</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-gray-400">
              <p className="hover:text-white cursor-pointer">Privacy Policy</p>
              <p className="hover:text-white cursor-pointer">Terms of Service</p>
              <p className="hover:text-white cursor-pointer">FAQs</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Vishwa Patrakar Mahasangh. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

### client/src/components/Layout.jsx
```javascript
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

### client/src/pages/Home.jsx
```javascript
import { Link } from 'react-router-dom';
import { Users, Award, Globe, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to Vishwa Patrakar Mahasangh
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              A global community of journalists committed to excellence and integrity
            </p>
            <Link
              to="/registration"
              className="inline-flex items-center bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Join Us Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Global Network</h3>
              <p className="text-gray-600">
                Connect with journalists from around the world
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Professional Growth</h3>
              <p className="text-gray-600">
                Access resources and training opportunities
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Global Impact</h3>
              <p className="text-gray-600">
                Make a difference through quality journalism
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                We are dedicated to supporting journalists worldwide by providing
                a platform for collaboration, professional development, and advocacy
                for press freedom and ethical journalism.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Member Benefits</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Access to exclusive resources and training
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Networking opportunities with global journalists
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Professional certification programs
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Legal and ethical guidance support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

### client/src/pages/About.jsx
```javascript
import { Heart, Target, Eye } from 'lucide-react';

export default function About() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vishwa Patrakar Mahasangh is a global organization dedicated to
            supporting journalists and promoting ethical journalism worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <Eye className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-3">Our Vision</h3>
            <p className="text-gray-600">
              To create a world where journalism thrives as a pillar of democracy,
              truth, and social justice.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <Target className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-3">Our Mission</h3>
            <p className="text-gray-600">
              Empower journalists with resources, training, and support to excel
              in their profession and uphold the highest ethical standards.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <Heart className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-3">Our Values</h3>
            <p className="text-gray-600">
              Integrity, transparency, excellence, and commitment to press freedom
              and ethical journalism.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="mb-4">
              Founded with the vision of creating a unified global community of
              journalists, Vishwa Patrakar Mahasangh has grown to become a leading
              organization in the field of journalism and media.
            </p>
            <p className="mb-4">
              We believe in the power of journalism to shape society, hold power
              accountable, and give voice to the voiceless. Our organization provides
              a platform for journalists to connect, learn, and grow together.
            </p>
            <p>
              Through our programs, resources, and advocacy efforts, we continue to
              support journalists worldwide in their mission to deliver accurate,
              fair, and impactful news to their communities.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-8 text-center">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="text-lg font-semibold mb-2">Training Programs</h3>
              <p className="text-gray-600">
                Comprehensive workshops and courses on modern journalism techniques,
                digital media, and investigative reporting.
              </p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="text-lg font-semibold mb-2">Networking Events</h3>
              <p className="text-gray-600">
                Regular conferences, seminars, and meetups to connect with fellow
                journalists and industry leaders.
              </p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="text-lg font-semibold mb-2">Legal Support</h3>
              <p className="text-gray-600">
                Guidance on media law, press freedom issues, and ethical dilemmas
                faced by journalists.
              </p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="text-lg font-semibold mb-2">Resource Library</h3>
              <p className="text-gray-600">
                Access to extensive resources including research papers, style guides,
                and industry reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### client/src/pages/Gallery.jsx
```javascript
export default function Gallery() {
  const images = [
    {
      url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
      title: 'Annual Conference 2023',
    },
    {
      url: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
      title: 'Workshop on Digital Journalism',
    },
    {
      url: 'https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg',
      title: 'Press Freedom Rally',
    },
    {
      url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
      title: 'Member Networking Event',
    },
    {
      url: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg',
      title: 'Awards Ceremony',
    },
    {
      url: 'https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg',
      title: 'Training Session',
    },
  ];

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Gallery</h1>
          <p className="text-xl text-gray-600">
            Capturing moments from our events and activities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <p className="text-white font-semibold p-4">{image.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### client/src/pages/Registration.jsx
```javascript
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function Registration() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/registration/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const checkoutResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/registration/checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ memberId: data.memberId }),
        }
      );

      const checkoutData = await checkoutResponse.json();

      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.message || 'Checkout session creation failed');
      }

      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: checkoutData.sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Member Registration</h1>
          <p className="text-gray-600 text-center mb-8">
            Join Vishwa Patrakar Mahasangh and become part of a global journalist community
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+91 1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization (Optional)
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your organization name"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Membership Fee:</strong> ₹500 per year
              </p>
              <p className="text-xs text-gray-600 mt-1">
                You will be redirected to a secure payment page after registration
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

### client/src/pages/MemberList.jsx
```javascript
import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

export default function MemberList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/registration/members`);
      const data = await response.json();
      setMembers(data.members);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Our Members</h1>
          <p className="text-xl text-gray-600">
            Meet our community of dedicated journalists
          </p>
        </div>

        {members.length === 0 ? (
          <div className="text-center text-gray-500">
            No registered members yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {member.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">
                  {member.fullName}
                </h3>
                {member.organization && (
                  <p className="text-sm text-gray-600 text-center mb-2">
                    {member.organization}
                  </p>
                )}
                <p className="text-xs text-gray-500 text-center">
                  Member since {new Date(member.registrationDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### client/src/pages/Success.jsx
```javascript
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Registration Successful!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Thank you for joining Vishwa Patrakar Mahasangh. Your payment has been
          processed successfully.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <p className="text-gray-700 mb-2">
            A confirmation email has been sent to your registered email address.
          </p>
          {sessionId && (
            <p className="text-sm text-gray-600">
              Session ID: {sessionId}
            </p>
          )}
        </div>

        <div className="space-x-4">
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            to="/members"
            className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            View Members
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### client/src/pages/Cancel.jsx
```javascript
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function Cancel() {
  return (
    <div className="py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <XCircle className="h-24 w-24 text-red-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your registration was not completed. No charges have been made to your account.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <p className="text-gray-700">
            If you encountered any issues during the registration process, please contact
            our support team for assistance.
          </p>
        </div>

        <div className="space-x-4">
          <Link
            to="/registration"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
          <Link
            to="/"
            className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
```

## Setup Instructions

### 1. Initial Setup

```bash
# Clone or create project directory
mkdir vishwa-patrakar-mahasangh
cd vishwa-patrakar-mahasangh

# Create server and client directories
mkdir server client
```

### 2. Server Setup

```bash
cd server
npm init -y
npm install express mongoose cors dotenv stripe nodemailer express-validator
npm install --save-dev nodemon

# Create .env file with your credentials
# Copy all server files from this guide
```

### 3. Client Setup

```bash
cd ../client
npm create vite@latest . -- --template react
npm install react-router-dom @stripe/stripe-js lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Create .env file with your credentials
# Copy all client files from this guide
```

### 4. Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string
6. Add it to server/.env as MONGO_URI

### 5. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from Developers > API keys
3. Add to .env files
4. Set up webhook endpoint pointing to your deployed server `/api/webhook`
5. Add webhook secret to server/.env

### 6. Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail
2. Create an App Password
3. Add credentials to server/.env

### 7. Running Locally

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

### 8. Deployment

#### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to Render/Railway
3. Add environment variables
4. Deploy

#### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect repository
3. Add environment variables
4. Deploy

#### Update Stripe Webhook
After deploying backend, update your Stripe webhook URL to point to:
`https://your-backend-domain.com/api/webhook`

## Important Notes

1. Replace all placeholder values in .env files with your actual credentials
2. Never commit .env files to version control
3. Test payments using Stripe test card: 4242 4242 4242 4242
4. Ensure CORS is properly configured for production domains
5. Set up proper error logging for production
6. Configure MongoDB indexes for better performance

## Support

For any issues or questions, refer to:
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Stripe Documentation](https://stripe.com/docs)
- [Nodemailer Documentation](https://nodemailer.com/)
