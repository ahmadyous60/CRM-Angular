# CRM Application

A modern Angular-based Customer Relationship Management (CRM) application with comprehensive authentication, authorization, and role-based access control, integrated with a .NET backend API.

## 🚀 Features

### Core CRM Modules
- **Leads Management**: Create, view, edit, and manage leads with status tracking and filtering
- **Deals Management**: Track deals with amounts, stages, and close dates
- **Contacts Management**: Store and manage contact information with search capabilities
- **Companies Management**: Manage company information and relationships
- **Tasks Management**: Create and track tasks with due dates and priorities
- **Notes Management**: Add and manage notes with rich text support
- **Events Management**: Schedule and manage events and meetings
- **Users Management**: User administration with role and permission management

### Security & Authentication
- **JWT Token Authentication**: Secure login with access and refresh tokens
- **Role-Based Access Control (RBAC)**: Multiple user roles (Admin, User, SuperAdmin)
- **Permission-Based Authorization**: Granular permissions for different modules
- **Password Reset**: Forgot password and reset password functionality
- **Session Management**: Automatic token refresh and session restoration
- **Route Guards**: Protected routes with authentication and authorization guards

### User Interface
- **Modern Dark Theme**: Beautiful dark theme with Bootstrap 5 and Material Design
- **Responsive Design**: Works seamlessly on desktop, tablet, and Laptop devices
- **Real-time Updates**: Live data updates with Angular Signals
- **Advanced Filtering**: Search and filter capabilities across all modules
- **Export Functionality**: Export data to Excel format from leads
- **Interactive UI**: Smooth animations and user-friendly interface

## 🛠️ Technology Stack

### Frontend
- **Angular 19**: Latest Angular framework with standalone components
- **TypeScript**: Type-safe development
- **Bootstrap 5**: Responsive UI framework
- **Angular Material**: Material Design components
- **RxJS**: Reactive programming with observables
- **SCSS**: Advanced styling with custom dark theme

### Backend
- **.NET Web API**: RESTful API backend
- **JWT Authentication**: JSON Web Token for secure authentication
- **Entity Framework**: ORM for database operations
- **SQL Server**: Database for data persistence

### Development Tools
- **Angular CLI**: Development and build tools
- **Jasmine & Karma**: Unit testing framework
- **ESLint**: Code linting and formatting

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **.NET 8 SDK** (for backend API)
- **SQL Server** (for database)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CRM-Angular
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm start
```
The Angular application will be available at `http://localhost:4200`

### 3. Backend Setup
```bash
# Navigate to backend directory (if separate)
cd ../CRMAPI

# Restore packages
dotnet restore

# Update database
dotnet ef database update

# Start the API
dotnet run
```
The .NET API will be available at `https://localhost:7298`

## 🔐 Authentication & Authorization

### User Roles
- **SuperAdmin**: Full system access, user management
- **Admin**: Module management, user oversight
- **User**: Standard CRM operations

### Permissions
- **Leads**: `Leads.View`, `Leads.Add`, `Leads.Edit`, `Leads.Delete` , `Leads.Export`
- **Deals**: `Deals.View`, `Deals.Add`, `Deals.Edit`, `Deals.Delete`
- **Contacts**: `Contacts.View`, `Contacts.Add`, `Contacts.Edit`, `Contacts.Delete`
- **Companies**: `Companies.View`, `Companies.Add`, `Companies.Edit`, `Companies.Delete`
- **Users**: `Users.View`, `Users.Add`, `Users.Edit`, `Users.Delete`

### JWT Token Flow
1. User logs in with credentials
2. Backend validates and returns JWT access token + refresh token
3. Frontend stores tokens and includes access token in API requests
4. Token interceptor automatically adds `Authorization: Bearer <token>` header
5. Automatic token refresh when access token expires
6. Secure logout with token revocation

## 📡 API Endpoints

### Authentication
- `POST /api/Auth/login` - User login
- `POST /api/Auth/signup` - User registration
- `POST /api/Auth/logout` - User logout
- `POST /api/Auth/refresh` - Refresh access token
- `POST /api/Auth/forgot-password` - Request password reset
- `POST /api/Auth/reset-password` - Reset password with token

### CRM Modules
- `GET /api/Leads` - Get all leads
- `POST /api/Leads` - Create new lead
- `PUT /api/Leads/{id}` - Update lead
- `DELETE /api/Leads/{id}` - Delete lead

- `GET /api/Deals` - Get all deals
- `POST /api/Deals` - Create new deal
- `PUT /api/Deals/{id}` - Update deal
- `DELETE /api/Deals/{id}` - Delete deal

- `GET /api/Contacts` - Get all contacts
- `POST /api/Contacts` - Create new contact
- `PUT /api/Contacts/{id}` - Update contact
- `DELETE /api/Contacts/{id}` - Delete contact

- `GET /api/Companies` - Get all companies
- `POST /api/Companies` - Create new company
- `PUT /api/Companies/{id}` - Update company
- `DELETE /api/Companies/{id}` - Delete company

- `GET /api/Tasks` - Get all tasks
- `POST /api/Tasks` - Create new task
- `PUT /api/Tasks/{id}` - Update task
- `DELETE /api/Tasks/{id}` - Delete task

- `GET /api/Notes` - Get all notes
- `POST /api/Notes` - Create new note
- `PUT /api/Notes/{id}` - Update note
- `DELETE /api/Notes/{id}` - Delete note

- `GET /api/Events` - Get all events
- `POST /api/Events` - Create new event
- `PUT /api/Events/{id}` - Update event
- `DELETE /api/Events/{id}` - Delete event

- `GET /api/Users` - Get all users (Admin only)
- `PUT /api/Users/{id}/roles` - Update user roles (Admin only)
- `DELETE /api/Users/{id}` - Delete user (Admin only)

## 📊 Data Models

### User
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  token: string;          // JWT access token
  refreshToken: string;   // JWT refresh token
  permissions: string[];  // User permissions
  roles: string[];        // User roles
}
```

### Lead
```typescript
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Qualified' | 'Won' | 'Lost';
  source: 'Website' | 'Referral' | 'Email' | 'Cold Call';
  product: 'Software License' | 'Website Development' | 'Mobile App Development' | 'SEO Package' | 'Cloud Hosting' | 'Digital Marketing' | 'E-Commerce Solution' | 'CRM Subscription';
  createdAt: string;
}
```

### Deal
```typescript
interface Deal {
  id: string;
  title: string;
  amount: number;
  stage: 'Prospecting' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  closeDate?: string;
  createdAt: string;
}
```

### Contact
```typescript
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
}
```

### Company
```typescript
interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  createdAt: string;
}
```

### Task
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  createdAt: string;
}
```

### Note
```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}
```

### Event
```typescript
interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  createdAt: string;
}
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── core/                          # Core services and guards
│   │   ├── auth.service.ts           # Authentication service with JWT
│   │   ├── auth.guard.ts             # Route guard for authentication
│   │   ├── permission-guard.ts       # Permission-based route guard
│   │   ├── role-guard.ts             # Role-based route guard
│   │   ├── token.interceptor.ts      # JWT token interceptor
│   │   ├── data.service.ts           # HTTP service for API calls
│   │   └── navigation.service.ts     # Navigation service
│   ├── Directive/                    # Custom directives
│   │   └── hasPermission.directive.ts # Permission-based UI directive
│   ├── features/                     # Feature modules
│   │   ├── auth/                     # Authentication components
│   │   │   ├── login/                # Login component
│   │   │   ├── signup/               # Signup component
│   │   │   ├── forgotpassword/       # Forgot password component
│   │   │   └── resetpassword/        # Reset password component
│   │   ├── leads/                    # Lead management
│   │   │   ├── leads-list/           # Leads listing component
│   │   │   └── lead-form/            # Lead form component
│   │   ├── deals/                    # Deal management
│   │   │   ├── deals-list/           # Deals listing component
│   │   │   └── deal-form/            # Deal form component
│   │   ├── contacts/                 # Contact management
│   │   │   ├── contacts-list/        # Contacts listing component
│   │   │   └── contact-form/         # Contact form component
│   │   ├── companies/                # Company management
│   │   │   ├── companies-list/       # Companies listing component
│   │   │   └── company-form/         # Company form component
│   │   ├── Tasks/                    # Task management
│   │   │   ├── tasks-list/           # Tasks listing component
│   │   │   └── tasks-form/           # Task form component
│   │   ├── Notes/                    # Notes management
│   │   │   ├── notes-list/           # Notes listing component
│   │   │   └── notes-form/           # Note form component
│   │   ├── Events/                   # Event management
│   │   │   ├── events-list/          # Events listing component
│   │   │   └── events-form/          # Event form component
│   │   └── users/                    # User management
│   │       └── users-list.component.ts # Users listing component
│   ├── layout/                       # Layout components
│   │   ├── admin-layout/             # Main admin layout
│   │   ├── sidebar/                  # Navigation sidebar
│   │   └── topbar/                   # Top navigation bar
│   ├── models/                       # TypeScript interfaces
│   │   ├── user.model.ts            # User interface
│   │   ├── lead.model.ts            # Lead interface
│   │   ├── deal.model.ts            # Deal interface
│   │   ├── contact.model.ts         # Contact interface
│   │   ├── company.model.ts         # Company interface
│   │   ├── task.model.ts            # Task interface
│   │   ├── note.model.ts            # Note interface
│   │   ├── event.model.ts           # Event interface
│   │   └── index.ts                 # Model exports
│   ├── app.component.ts              # Root component
│   ├── app.routes.ts                 # Application routes
│   └── app.config.ts                 # App configuration
├── environments/                      # Environment configuration
│   ├── environment.ts               # Development environment
│   └── environment.prod.ts          # Production environment
├── styles.scss                       # Global styles
└── main.ts                          # Application entry point
```

## 🔧 Development

### Available Scripts
```bash
# Development
npm start                    # Start development server
npm run build               # Build for production
npm run watch               # Build and watch for changes
npm test                    # Run unit tests

# Backend (if using .NET)
dotnet run                  # Start .NET API
dotnet test                 # Run backend tests
dotnet ef database update   # Update database schema
```

### Environment Configuration
Update `src/environments/environment.ts` to configure API endpoints:
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7298/api'  // .NET API URL
};
```

## 🛡️ Security Features

### JWT Token Management
- **Access Tokens**: Short-lived tokens for API authentication
- **Refresh Tokens**: Long-lived tokens for token renewal
- **Automatic Refresh**: Seamless token renewal without user intervention
- **Token Revocation**: Secure logout with server-side token invalidation

### Route Protection
- **AuthGuard**: Protects routes requiring authentication
- **PermissionGuard**: Protects routes based on user permissions
- **RoleGuard**: Protects routes based on user roles
- **NoDirectAccessGuard**: Prevents direct access to auth pages

### UI Security
- **Permission Directive**: Show/hide UI elements based on permissions
- **Role-based Navigation**: Dynamic navigation based on user roles
- **Secure Storage**: Tokens stored securely in localStorage

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting provider
```

### Backend Deployment
```bash
# Publish .NET API
dotnet publish -c Release -o ./publish

# Deploy publish/ folder to your server
```

## 🐛 Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure .NET API has proper CORS configuration
2. **Token Expired**: Check if refresh token is working correctly
3. **Permission Denied**: Verify user has required permissions
4. **API Connection**: Ensure backend API is running on correct port

### Debug Mode
Enable debug logging in `environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7298/api',
  debug: true  // Enable debug logging
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions, please contact the development team, connect with me on [LinkedIn](https://www.linkedin.com/in/ahmad-yousaf21), or create an issue in the repository.


---

**Built with ❤️ using Angular 19, .NET 8, and modern web technologies**
