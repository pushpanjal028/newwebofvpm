# Vishwa Patrakar Mahasangh - Organization Website

A modern, full-featured organization website built with React, Supabase, and Tailwind CSS. This application features member registration, payment processing, and a member directory.

## Features

- **Home Page**: Hero section with key features and benefits
- **About Page**: Organization mission, vision, and values
- **Gallery**: Photo gallery with images from events
- **Registration**: Member registration form with validation
- **Payment Processing**: Mock payment flow (ready for Stripe integration)
- **Member Directory**: Public list of registered members
- **Email Confirmation**: Mock email notifications (ready for real SMTP)

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Supabase** (PostgreSQL database)
- **Supabase Edge Functions** (Deno-based serverless functions)
- **Row Level Security (RLS)** for data protection

## Project Structure

```
vishwa-patrakar-mahasangh/
├── src/
│   ├── components/           # Reusable React components
│   │   ├── Navbar.tsx       # Navigation bar
│   │   ├── Footer.tsx       # Footer component
│   │   └── Layout.tsx       # Page layout wrapper
│   ├── pages/               # Page components
│   │   ├── Home.tsx         # Landing page
│   │   ├── About.tsx        # About page
│   │   ├── Gallery.tsx      # Photo gallery
│   │   ├── Registration.tsx # Registration form
│   │   ├── Payment.tsx      # Payment page
│   │   ├── Members.tsx      # Member directory
│   │   ├── Success.tsx      # Payment success page
│   │   └── Cancel.tsx       # Payment cancel page
│   ├── App.tsx              # Main app with routing
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── supabase/
│   └── functions/           # Edge Functions
│       ├── register-member/ # Member registration API
│       ├── complete-payment/# Payment completion API
│       └── get-members/     # Get members list API
├── .env                     # Environment variables
└── README.md               # This file
```

## Database Schema

### Members Table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| full_name | text | Member's full name |
| email | text | Unique email address |
| phone | text | Phone number |
| organization | text | Organization name (optional) |
| payment_status | text | pending, completed, or failed |
| payment_session_id | text | Payment session identifier |
| registration_date | timestamptz | Registration timestamp |
| created_at | timestamptz | Record creation time |
| updated_at | timestamptz | Last update time |

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (database already configured)
- Environment variables set in `.env`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Verify environment variables in `.env`:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Start development server:
```bash
npm run dev
```

4. Open browser to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## API Endpoints (Edge Functions)

### Register Member
**POST** `/functions/v1/register-member`

Creates a new member registration with pending payment status.

Request:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+91 1234567890",
  "organization": "Example Org"
}
```

Response:
```json
{
  "message": "Registration created successfully",
  "memberId": "uuid"
}
```

### Complete Payment
**POST** `/functions/v1/complete-payment`

Updates member payment status to completed.

Request:
```json
{
  "memberId": "uuid",
  "sessionId": "session_xxx"
}
```

Response:
```json
{
  "message": "Payment completed successfully",
  "emailSent": true,
  "member": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Get Members
**GET** `/functions/v1/get-members`

Returns list of members with completed payments.

Response:
```json
{
  "members": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+91 1234567890",
      "organization": "Example Org",
      "registration_date": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Current Implementation

### Payment Flow (Mock)

Currently implements a **mock payment system** that:
1. Shows a payment page with order summary
2. Simulates 2-second payment processing
3. Automatically completes payment and redirects to success page
4. Logs mock email confirmation to console

This allows you to test the full registration flow without a real payment gateway.

### Email Notifications (Mock)

Email confirmations are currently logged to the Edge Function console. You'll see:
```
Confirmation email would be sent to: user@example.com
Member: John Doe
Payment completed for session: session_xxx
```

## Upgrading to Production

### 1. Add Real Stripe Payment Integration

Install Stripe SDK:
```bash
npm install stripe @stripe/stripe-js
```

Update `src/pages/Payment.tsx`:
```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const handlePayment = async () => {
  // Create Stripe checkout session
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ memberId })
  });

  const { sessionId } = await response.json();
  const stripe = await stripePromise;
  await stripe.redirectToCheckout({ sessionId });
};
```

Create new Edge Function for Stripe checkout:
```typescript
// supabase/functions/create-checkout-session/index.ts
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'inr',
      product_data: {
        name: 'Vishwa Patrakar Mahasangh Membership',
      },
      unit_amount: 50000, // ₹500 in paise
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${frontendUrl}/cancel`,
  metadata: { memberId }
});
```

Add Stripe webhook handler to `complete-payment` function:
```typescript
// Verify webhook signature
const sig = req.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  await req.text(),
  sig,
  webhookSecret
);

if (event.type === 'checkout.session.completed') {
  // Update payment status
}
```

Add environment variables:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

### 2. Add Real Email Notifications

Install email service (using Resend as example):
```typescript
// In complete-payment Edge Function
import { Resend } from 'npm:resend@2';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

await resend.emails.send({
  from: 'Vishwa Patrakar Mahasangh <noreply@vishwapatrakar.org>',
  to: member.email,
  subject: 'Welcome to Vishwa Patrakar Mahasangh',
  html: `
    <h2>Registration Confirmed!</h2>
    <p>Dear ${member.full_name},</p>
    <p>Thank you for joining Vishwa Patrakar Mahasangh.</p>
    <p>Your membership is now active.</p>
  `
});
```

Alternative: Use Nodemailer with SMTP:
```typescript
import nodemailer from 'npm:nodemailer@6';

const transporter = nodemailer.createTransport({
  host: Deno.env.get('SMTP_HOST'),
  port: 587,
  auth: {
    user: Deno.env.get('SMTP_USER'),
    pass: Deno.env.get('SMTP_PASS')
  }
});

await transporter.sendMail({
  from: '"Vishwa Patrakar Mahasangh" <noreply@vishwapatrakar.org>',
  to: member.email,
  subject: 'Welcome to Vishwa Patrakar Mahasangh',
  html: emailTemplate
});
```

Add environment variable:
```
RESEND_API_KEY=re_...
# OR for SMTP
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Add Authentication (Optional)

For admin features, add Supabase Auth:
```bash
npm install @supabase/auth-ui-react
```

Create admin pages with authentication:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Sign in
await supabase.auth.signInWithPassword({
  email,
  password
});

// Protected route
const { data: { user } } = await supabase.auth.getUser();
if (!user) navigate('/login');
```

### 4. Deploy to Production

#### Frontend (Vercel/Netlify)

1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Add environment variables in dashboard
4. Deploy

#### Edge Functions

Edge Functions are already deployed to Supabase.

#### Update Environment Variables

```env
# Production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

## Security Considerations

### Current Security Features

1. **Row Level Security (RLS)** enabled on members table
2. **Public registration** - anyone can register
3. **Public read** - anyone can view completed members
4. **Secure updates** - only Edge Functions can update payment status

### Production Security Checklist

- [ ] Enable Stripe webhook signature verification
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting on Edge Functions
- [ ] Add CAPTCHA to registration form
- [ ] Implement proper error handling
- [ ] Add logging and monitoring
- [ ] Use HTTPS only in production
- [ ] Regularly update dependencies

## Troubleshooting

### Build Errors

If you encounter build errors:
```bash
npm run typecheck  # Check TypeScript errors
npm run lint       # Check linting errors
```

### Database Connection Issues

Verify environment variables:
```bash
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### Edge Function Errors

Check Edge Function logs in Supabase Dashboard:
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on function name
4. View logs tab

## License

This project is private and proprietary to Vishwa Patrakar Mahasangh.

## Support

For technical support, contact:
- Email: tech@vishwapatrakar.org
- Phone: +91 1234567890

## Contributing

This is a private project. Internal contributions should follow:
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit for review
