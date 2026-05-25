# Bioenergy Expo 2026 - International Platform Documentation

## 🎯 Platform Overview

Bioenergy Expo 2026 is now a world-class international expo platform with **4 dedicated zones**, unified authentication, QR badge system, and comprehensive management tools. This platform serves **Visitors, Exhibitors, Delegates/Conference participants, and Fabricators/Vendors**.

---

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI components
- **Database**: Firebase Firestore
- **Authentication**: Custom RBAC system with sessionStorage
- **Email**: AWS SES
- **QR Codes**: qrcode.react library
- **Backend APIs**: Node.js/JavaScript serverless functions

### Database Collections

```
Firestore Database Structure:
├── exhibitors       - Company stall bookings & payment tracking
├── visitors         - Simple visitor registrations
├── delegates        - Conference & VIP attendees
├── fabricators      - Vendor/manufacturing partners
├── badges           - QR codes & registration badges
├── notifications    - User notifications
├── downloads        - Downloadable resources (brochures, manuals, etc.)
└── admin_settings   - Admin configuration & preferences
```

---

## 👥 Four Registration Zones

### 1. **Visitor Zone** 🎫
**Purpose**: Simple, fast registration for event visitors
- **URL**: `/visitor/register`
- **Features**:
  - 1-minute registration
  - QR badge automatic generation
  - Email badge delivery
  - Event brochure access
  - Exhibitor directory
  - Schedule information
- **Dashboard**: `/dashboard`

### 2. **Exhibitor Zone** 🏪
**Purpose**: Comprehensive booth management for companies
- **URL**: `/exhibitor/register`
- **Features**:
  - Company profile management
  - Stall size selection (Small/Medium/Large)
  - Automated payment tracking
  - Stall allocation visualization
  - Logo & brochure uploads
  - Exhibitor manual download
  - Real-time communication
- **Login**: `/exhibitor/login`
- **Dashboard**: `/exhibitor/panel`

### 3. **Delegate / Conference Zone** 🎤
**Purpose**: Conference registration with speaker management
- **URL**: `/delegate/register`
- **Features**:
  - Pass type selection (Standard/VIP/Speaker)
  - Speaker profile submissions
  - Session scheduling
  - Agenda download
  - Networking events
  - Certificate generation
  - Priority support

### 4. **Fabricator / Vendor Zone** 🔧
**Purpose**: Manufacturing partner coordination
- **URL**: `/fabricator/register`
- **Features**:
  - Multi-specialization selection
  - Design submission portal
  - Quality certification tracking
  - Fabrication guidelines
  - Technical drawings upload
  - Approval workflow
  - Project tracking

---

## 🔐 Authentication & Authorization (RBAC)

### Authentication System (`src/lib/auth.ts`)

**User Roles** (Hierarchy):
1. **Admin** (Level 5) - Full platform control
2. **Delegate** (Level 4) - Conference priority access
3. **Fabricator** (Level 3) - Vendor tools
4. **Exhibitor** (Level 2) - Booth management
5. **Visitor** (Level 1) - Basic access

### Key Functions

```typescript
// Current user info
getCurrentUser()              // Returns AuthUser
getCurrentRole()              // Returns role
isAuthenticated()             // Check auth status

// Login/Logout
setAuthUser(user)             // Create session
clearAuth()                   // Logout

// Permissions
hasPermission(role)           // Check required role
hasAnyRole([roles])           // Multiple role check

// Role checks
isExhibitor(), isVisitor(), isDelegate(), isFabricator(), isAdmin()
```

### Session Management
- Sessions stored in `sessionStorage`
- Persists across page refreshes
- Cleared on logout
- Includes: id, email, name, role, company, phone, timestamp

---

## 🎫 QR Badge System (`src/lib/badgeService.ts`)

### Badge Generation Flow

1. **User Registration** → Data saved to Firestore
2. **Badge Generation** → QR code created with unique registration code
3. **Badge Storage** → Stored in `badges` collection
4. **Email Send** → Badge sent via AWS SES with branded template
5. **Verification** → Badge can be scanned and marked as entry

### Key Functions

```typescript
generateQRCode(data)          // Create QR image
createAndStoreBadge(...)      // Save to Firestore
sendBadgeEmail(...)           // Email via API
generateAndSendBadge(...)     // Complete workflow
getBadgeByRegistrationCode()  // Retrieve badge
markBadgeAsScanned()          // Track entry
```

### Registration Code Format
```
{TIMESTAMP}-{RANDOM}
Example: 2AB5K-X4YZ9W
```

---

## 📬 Notification System (`src/lib/notificationService.ts`)

### Features
- **In-app Notifications**: Displayed in user dashboard
- **Email Notifications**: Branded templates with AWS SES
- **Role-based**: Target specific user roles
- **Bulk Send**: Send to multiple users at once
- **Templates**: Pre-defined messages for common events

### Key Functions

```typescript
sendNotification(payload)     // Send single notification
sendBulkNotifications(...)    // Send to multiple users
getUserNotifications(userId)  // Get user's notifications
markNotificationAsRead()      // Mark as read

// Templates
notifyRegistrationSuccess()   // On registration
notifyPaymentReceived()        // On payment
notifyEventReminder()          // Reminder emails
notifyDesignApproval()         // For fabricators
```

### API Endpoints
- `POST /api/send-notification-email` - Email notifications
- `POST /api/send-badge-email` - Badge emails

---

## 📥 Download Center (`src/pages/DownloadCenter.tsx`)

**URL**: `/downloads`

### Features
- **Category Filtering**: By user role (Exhibitor, Visitor, Delegate, Fabricator)
- **File Types**: Brochures, Floor Plans, Manuals, Agendas, Guidelines
- **Responsive Grid**: Auto-adapts to screen size
- **Direct Downloads**: One-click file access

### Firestore Collection Structure
```typescript
{
  id: string
  title: string
  type: "brochure" | "floor_plan" | "manual" | "agenda" | "guidelines"
  fileUrl: string
  fileSize: number              // in MB
  category: string              // "Exhibitor" | "Visitor" | etc.
  description?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 📊 Unified Dashboard (`src/pages/UnifiedDashboard.tsx`)

**URL**: `/dashboard`

### User Dashboard Features
- **Profile Information**: Display all user data
- **Quick Stats**: Status, Notifications, Resources, Badge
- **Tabs**:
  - Profile: User information
  - Downloads: Role-based resources
  - Notifications: Recent notifications
  - Role-specific tools (Exhibitor/Fabricator)

### Role-Specific Tools
- **Exhibitor**: Stall allocation, payment status, materials upload
- **Fabricator**: Design submission, approval tracking

---

## 🌐 Public Landing Page

**URL**: `/`

### Sections
1. **Navigation**: Hero menu with zone links
2. **Hero Section**: Main value proposition
3. **Four Zones**: Register now buttons for each zone
4. **Events**: Current & upcoming events
5. **About**: Platform benefits
6. **Venue**: Location & directions
7. **Partners**: Sponsor logos
8. **CTA**: Final call-to-action
9. **Footer**: Links, contact, WhatsApp

### Zones Component (`src/components/landing/Zones.tsx`)
- Beautiful card layouts
- Gradient backgrounds (role-specific colors)
- Feature highlights
- Direct registration links
- Benefits section

---

## 📞 Contact & Communication

### WhatsApp Integration
- **Floating Button**: Fixed position on all pages
- **URL**: `/`
- **Link**: `https://wa.me/919142659818`
- **Pre-filled Message**: "Hello Bioenergy Expo 2026"
- **Footer CTA**: Direct WhatsApp button

### Contact Information
- **Email**: info@meeratradefair.com
- **Phone**: +91 9142 659 818 | +91 7011 807 613
- **WhatsApp**: +91 9142 659 818

---

## 🎨 Color Scheme by Zone

```
Visitor Zone:     Emerald → Teal (from-emerald-600 to-teal-600)
Exhibitor Zone:   Blue → Purple (from-blue-600 to-purple-600)
Delegate Zone:    Amber → Orange (from-amber-600 to-orange-600)
Fabricator Zone:  Slate → Slate (from-slate-700 to-slate-900)
Admin:            Red → Pink (from-red-600 to-pink-600)
```

---

## 🚀 Deployment & Environment

### Environment Variables (.env)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=...
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SES_FROM_EMAIL=sidbixx@gmail.com
```
Note: The application is configured to send SES email from the verified sender `sidbixx@gmail.com`. In sandbox mode, you also must verify recipient addresses or request production access.

### Build & Run
```bash
# Development
npm run dev          # Vite dev server on port 5173

# Build
npm run build        # Production build
npm run build:dev    # Development build

# Preview
npm run preview      # Preview production build

# Testing
npm run test         # Run tests
npm run test:watch   # Watch mode
```

---

## 📱 Mobile Optimization

All pages are fully responsive:
- **Mobile First**: Designed for small screens first
- **Breakpoints**: Tailwind's sm, md, lg, xl breakpoints
- **Touch-friendly**: Buttons min 44px height
- **Responsive Images**: Scale with viewport
- **Grid Layouts**: Auto-adapt columns

---

## 🔄 Workflow Examples

### Visitor Registration Flow
```
1. Click "Visitor Register" on landing page
2. Fill name, email, phone, company, designation
3. Submit form
4. System creates visitor record + QR badge
5. Badge email sent automatically
6. Redirect to unified dashboard
7. User can download resources
```

### Exhibitor Registration Flow
```
1. Click "Exhibitor Register" on landing page
2. Step 1: Company & contact info
3. Step 2: Review info
4. Submit form
5. System creates exhibitor record
6. Badge email sent
7. Redirect to dashboard
8. Exhibitor can track payment & stall
```

### Fabricator Workflow
```
1. Register as fabricator
2. Accept guidelines
3. Select specializations
4. Access fabricator portal
5. Submit design files
6. Admin reviews & approves
7. Notification sent to fabricator
8. Track approval status in dashboard
```

---

## 🔧 Maintenance & Admin Tasks

### Admin Dashboard (`/admin`)
- **Credentials**: Username & password from env vars
- **Features**:
  - View all registrations
  - Filter by event/role
  - Export data
  - Analytics & trends
  - Live statistics

### Database Maintenance
- Monitor Firestore usage
- Archive old records
- Clean up unused files
- Backup regular data exports

### Email Management
- Monitor SES quota
- Check bounce rates
- Update email templates
- Test new campaigns

---

## 📚 Additional Resources

### Documentation Links
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [React Router Guide](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI Components](https://www.radix-ui.com/)

### API References
- [AWS SES](https://docs.aws.amazon.com/ses/)
- [QRCode.react](https://www.npmjs.com/package/qrcode.react)
- [Firebase Auth](https://firebase.google.com/docs/auth)

---

## 🐛 Troubleshooting

### Common Issues

**Email not sending?**
- Check AWS SES configuration
- Verify email is not in quarantine
- Check email quota limits
- If your SES account is still in sandbox mode, verify both the sender and recipient email identities in the same AWS region
- To send to arbitrary attendee emails, request SES production access from AWS and move the account out of sandbox mode

**Badge not generating?**
- Ensure qrcode.react is installed
- Check browser canvas support
- Verify Firestore permissions

**Users can't login?**
- Clear browser cache/sessionStorage
- Check user role in Firestore
- Verify Firestore rules allow read

**WhatsApp not working?**
- Check phone number format
- Ensure WhatsApp Business account active
- Test link on mobile device

---

## 📈 Future Enhancements

- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Advanced analytics dashboard
- [ ] Badge scanning mobile app
- [ ] Real-time chat messaging
- [ ] Video conferencing
- [ ] API documentation portal
- [ ] Admin mobile app
- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Advanced reporting

---

## 📞 Support & Contact

For questions or issues:
- **Email**: info@meeratradefair.com
- **Phone**: +91 9142 659 818
- **WhatsApp**: +91 9142 659 818
- **Website**: https://bioenergy-expo.com

---

**Last Updated**: May 4, 2026
**Version**: 2.0 - International Platform
**Platform**: React + Firebase + Firestore
