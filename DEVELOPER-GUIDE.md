# Developer Quick Start Guide - Bioenergy Expo 2026

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Firebase project setup
- AWS SES configured
- Git

### Initial Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd 4\ events

# 2. Install dependencies
npm install

# 3. Create .env file with credentials
cp .env.example .env
# Edit .env with your credentials

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:5173
```

---

## 📁 Key Files to Know

### Authentication

- `src/lib/auth.ts` - User authentication & RBAC
- `src/lib/adminAuth.ts` - Admin authentication (legacy)
- `src/lib/exhibitorAuth.ts` - Exhibitor session (legacy)

### Collections & Data

- `src/lib/collections.ts` - Firestore schemas & types
- `src/lib/events.ts` - Event catalog
- `src/lib/firebase.ts` - Firebase config

### Services

- `src/lib/badgeService.ts` - QR badge generation
- `src/lib/notificationService.ts` - Notifications
- `src/lib/utils.ts` - Utility functions

### Pages

- `src/pages/Index.tsx` - Landing page
- `src/pages/VisitorRegister.tsx` - Visitor zone
- `src/pages/ExhibitorRegister.tsx` - Exhibitor zone (existing, enhanced)
- `src/pages/DelegateRegister.tsx` - Delegate zone
- `src/pages/FabricatorRegister.tsx` - Fabricator zone
- `src/pages/UnifiedDashboard.tsx` - User dashboard
- `src/pages/DownloadCenter.tsx` - Download center
- `src/pages/AdminDashboard.tsx` - Admin panel

### Components

- `src/components/landing/` - Landing page components
- `src/components/landing/Zones.tsx` - Zone showcase
- `src/components/landing/Footer.tsx` - Footer with WhatsApp
- `src/components/ui/` - Reusable UI components

### API Routes

- `api/send-badge-email.js` - Badge email API
- `api/send-notification-email.js` - Notification email API
- `api/send-attendee-email.js` - Attendee email (existing)

---

## 🔑 Common Tasks

### Add a New User Role

1. Update `src/lib/auth.ts`:

```typescript
export type UserRole =
  | "exhibitor"
  | "visitor"
  | "delegate"
  | "fabricator"
  | "admin"
  | "newRole";

export const roleHierarchy: Record<UserRole, number> = {
  admin: 5,
  // ... add your role
  newRole: 2,
};
```

2. Create registration page: `src/pages/NewRoleRegister.tsx`
3. Add route in `src/App.tsx`
4. Create Firestore collection for the role
5. Add to zones component if needed

### Create a New Firestore Collection

1. Add to `src/lib/collections.ts`:

```typescript
export interface NewCollection {
  id: string;
  // ... fields
  createdAt: Timestamp;
}

export const getNewCollectionByEmail = async (email: string) => {
  const q = query(
    collection(db, "newCollectionName"),
    where("email", "==", email),
  );
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : (snapshot.docs[0].data() as NewCollection);
};
```

2. Create Firestore collection in Firebase Console
3. Set security rules

### Send a Notification

```typescript
import { sendNotification } from "@/lib/notificationService";

await sendNotification({
  recipientId: userId,
  recipientRole: userRole,
  title: "Notification Title",
  message: "Notification message",
  type: "success", // "success" | "error" | "warning" | "info"
  sendEmail: true,
  emailAddress: userEmail,
  actionUrl: "/link/to/action",
});
```

### Generate and Send Badge

```typescript
import { generateAndSendBadge } from "@/lib/badgeService";

const result = await generateAndSendBadge({
  userId: "user-id",
  userRole: "visitor",
  userEmail: "user@example.com",
  userName: "John Doe",
  registrationCode: "VIS-ABC123", // optional
});

if (result.success) {
  console.log("Badge sent:", result.registrationCode);
}
```

### Update User Session

```typescript
import { setAuthUser, updateUserProfile } from "@/lib/auth";

// Update profile in session
updateUserProfile({
  name: "New Name",
  phone: "+91-XXXX-XXXX-XXXX",
});

// Get current user
const user = getCurrentUser();
```

### Query Downloads by Category

```typescript
import { getDownloadsByCategory } from "@/lib/collections";

const exhibitorFiles = await getDownloadsByCategory("Exhibitor");
```

---

## 🧪 Testing the Platform

### Create Test Users

```typescript
// In browser console, run:
import { setAuthUser } from "@/lib/auth";

setAuthUser({
  id: "test-visitor-1",
  email: "test@example.com",
  name: "Test User",
  role: "visitor",
  timestamp: Date.now(),
});
```

### Test Registration Flow

1. **Visitor**: Visit `/visitor/register`
2. **Exhibitor**: Visit `/exhibitor/register`
3. **Delegate**: Visit `/delegate/register`
4. **Fabricator**: Visit `/fabricator/register`

### Check Database

1. Open Firebase Console
2. Navigate to Firestore Database
3. Check collections: exhibitors, visitors, delegates, fabricators, badges

### Test Email Sending

Check AWS SES console for:

- Successful sends in "Send Statistics"
- Bounces in "Suppression List"
- Failed sends

---

## 🐛 Debugging

### Enable Console Logging

```typescript
// In any file
console.log("Event:", JSON.stringify(data, null, 2));

// Check user auth
console.log("Current user:", getCurrentUser());
console.log("Current role:", getCurrentRole());
```

### Firebase Debugging

```typescript
// In browser console
firebase
  .firestore()
  .collection("exhibitors")
  .limit(5)
  .get()
  .then((snapshot) => console.log(snapshot.docs.map((d) => d.data())));
```

### Network Debugging

1. Open DevTools (F12)
2. Go to Network tab
3. Check API calls to `/api/send-badge-email`, etc.
4. View response status and body

### React Debugging

```bash
# Install React DevTools browser extension
# Then use React tab in DevTools to inspect component tree
```

---

## 📝 Code Style Guide

### Naming Conventions

- **Components**: PascalCase (e.g., `VisitorRegister`)
- **Files**: Match component name or descriptive (e.g., `visitor-register.tsx`)
- **Functions**: camelCase (e.g., `generateQRCode`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Types**: PascalCase (e.g., `Visitor`, `NotificationType`)

### Import Order

```typescript
// 1. External libraries
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 2. Relative imports - lib
import { getCurrentUser } from "@/lib/auth";

// 3. Relative imports - components
import { Button } from "@/components/ui/button";

// 4. Relative imports - pages
import Nav from "@/components/landing/Nav";
```

### Component Structure

```typescript
// Imports
import { ... } from "...";

// Types/Interfaces (if any)
interface Props { ... }

// Component
export default function ComponentName() {
  // State
  const [state, setState] = useState();

  // Hooks
  const navigate = useNavigate();
  const { toast } = useToast();

  // Effects
  useEffect(() => { ... }, []);

  // Handlers
  const handleClick = () => { ... };

  // Render
  return ( ... );
}
```

---

## 📦 Dependencies

### Key Libraries

- **react**: UI library
- **react-router-dom**: Routing
- **@tanstack/react-query**: Data fetching
- **firebase**: Backend services
- **@supabase/supabase-js**: Database (if used)
- **qrcode.react**: QR code generation
- **uuid**: Unique IDs
- **tailwindcss**: Styling
- **@radix-ui/**:UI components
- **lucide-react**: Icons
- **sonner**: Toast notifications
- **react-hook-form**: Form handling
- **zod**: Schema validation
- **date-fns**: Date utilities

### Check Installed Packages

```bash
npm list
npm list qrcode.react   # Check specific package
```

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
# Output: dist/ folder

# Preview build locally
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Redeploy
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# For production
netlify deploy --prod
```

---

## 🔒 Security Checklist

- [ ] Environment variables not committed
- [ ] Firebase security rules configured
- [ ] Admin credentials protected
- [ ] Email API keys secure
- [ ] AWS SES verified email addresses
- [ ] CORS properly configured
- [ ] Rate limiting on APIs
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] HTTPS enabled on production

---

## 📊 Performance Tips

1. **Lazy Load Components**

```typescript
const VisitorRegister = lazy(() => import("./VisitorRegister"));
```

2. **Optimize Images**

```typescript
// Use WebP with fallback
<img src="image.webp" alt="..." />
```

3. **Minimize Firestore Queries**

- Use indexes for common queries
- Batch requests where possible
- Limit query results with `.limit()`

4. **Cache Static Data**

```typescript
const cache = new Map();
```

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Guide](https://reactrouter.com/)

---

## 📞 Getting Help

1. Check PLATFORM-DOCUMENTATION.md
2. Search existing issues in Git
3. Check Firebase/AWS documentation
4. Contact dev team

---

**Happy Coding! 🚀**
