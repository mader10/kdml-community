# KDML Community App

A Progressive Web App (PWA) for community management, supporting both SYS and SSF organizations.

## Features

- User Authentication
- Meeting Management
- Funds Management
- Blood Donor Registry
- Committee Management
- Progressive Web App (PWA) support
- Offline functionality
- Responsive design

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment to Netlify

1. Push your code to a GitHub repository

2. Connect to Netlify:
   - Go to [Netlify](https://www.netlify.com/)
   - Sign up/Login with your GitHub account
   - Click "New site from Git"
   - Choose your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

The build settings are already configured in `netlify.toml`.

## Environment Variables

Make sure to set up the following environment variables in Netlify:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

## Tech Stack

- Webpack 5
- Tailwind CSS
- Firebase
- Service Workers (Workbox)
- PostCSS

## Prerequisites

- Node.js 14+ and npm
- Firebase project with:
  - Authentication (Phone number sign-in enabled)
  - Firestore Database
  - Storage

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd kdml-app
```

2. Create a Firebase project and update configuration:
   - Go to Firebase Console
   - Create a new project
   - Enable Phone Authentication
   - Create a Firestore database
   - Enable Storage
   - Copy the Firebase config
   - Update `src/js/firebase-config.js` with your config

3. Set up Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Meetings
    match /meetings/{meetingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Funds
    match /funds/{fundId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Committee
    match /committee/{memberId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

4. Set up Storage security rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /committee/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## Database Structure

### Collections

1. users
```javascript
{
  name: string,
  mid: string,
  organization: 'SYS' | 'SSF',
  phone: string,
  bloodGroup: string,
  isDonor: boolean,
  location: string,
  isAdmin: boolean
}
```

2. meetings
```javascript
{
  title: string,
  dateTime: timestamp,
  location: string,
  organization: 'SYS' | 'SSF' | 'both',
  description: string,
  attendance: {
    [userId]: {
      status: 'present' | 'absent',
      timestamp: timestamp
    }
  }
}
```

3. funds
```javascript
{
  name: string,
  type: 'monthly' | 'special' | 'emergency',
  organization: 'SYS' | 'SSF' | 'both',
  target: number,
  deadline: timestamp,
  status: 'active' | 'closed',
  contributions: {
    [userId]: {
      amount: number,
      timestamp: timestamp
    }
  }
}
```

4. committee
```javascript
{
  name: string,
  organization: 'SYS' | 'SSF',
  designation: string,
  phone: string,
  photoUrl: string,
  order: number
}
```

## License

MIT License 