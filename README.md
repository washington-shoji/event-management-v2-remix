# Event Management System v2

A modern, full-stack event management application built with Remix, React, and TypeScript. This application provides comprehensive tools for managing events, organizations, venues, and users.

## 🚀 Features

### Core Functionality
- **Event Management**: Create, edit, view, and manage events
- **Organization Management**: Handle multiple organizations and their details
- **Venue Management**: Manage event venues and locations
- **User Management**: User registration, authentication, and profile management
- **Dashboard**: Centralized dashboard for all management tasks

### Technical Features
- **Modern Stack**: Built with Remix v2, React 18, and TypeScript
- **Styling**: Tailwind CSS for responsive and modern UI
- **Authentication**: Secure user authentication system
- **Type Safety**: Full TypeScript support throughout the application
- **Performance**: Optimized with Vite for fast development and builds

## 📋 Prerequisites

- Node.js >= 20.0.0
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-management-v2-remix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add your configuration:
   ```env
   # Add your environment variables here
   # Example:
   # DATABASE_URL=your_database_url
   # SESSION_SECRET=your_session_secret
   ```

## 🚀 Development

### Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 📁 Project Structure

```
event-management-v2-remix/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── DashboardLayout.tsx
│   │   └── Layout.tsx
│   ├── config/             # Application configuration
│   ├── routes/             # Remix routes
│   │   ├── dashboard.*     # Dashboard routes
│   │   ├── login.tsx       # Authentication routes
│   │   └── public.*        # Public routes
│   ├── services/           # Business logic and API services
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── public/                 # Static assets
└── package.json
```

### Key Routes

- `/` - Landing page
- `/login` - User authentication
- `/register` - User registration
- `/dashboard` - Main dashboard
- `/dashboard/events` - Event management
- `/dashboard/organizations` - Organization management
- `/dashboard/venues` - Venue management
- `/dashboard/users` - User management

## 🎨 Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling. The configuration is set up in `tailwind.config.ts` and the main styles are in `app/tailwind.css`.

## 🔧 Configuration

### TypeScript
The project is configured with TypeScript for type safety. Configuration is in `tsconfig.json`.

### Vite
Build tool configuration is in `vite.config.ts` with optimized settings for Remix.

### ESLint
Code quality is maintained with ESLint. Configuration includes rules for React, TypeScript, and accessibility.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy
The built application includes:
- `build/server` - Server-side code
- `build/client` - Client-side assets

You can deploy to any platform that supports Node.js applications.

### Recommended Platforms
- Vercel
- Netlify
- Railway
- Heroku
- AWS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Remix documentation](https://remix.run/docs)
2. Review the [Tailwind CSS documentation](https://tailwindcss.com/docs)
3. Open an issue in the repository

## 🔗 Links

- [Remix Documentation](https://remix.run/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
