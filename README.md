# Mini CRM Application

A modern Angular-based Customer Relationship Management (CRM) application with a beautiful dark theme UI.

## Features

- **Leads Management**: Create, view, and manage leads with status tracking
- **Deals Management**: Track deals with amounts and stages
- **Contacts Management**: Store and manage contact information
- **Companies Management**: Manage company information and relationships
- **Modern UI**: Beautiful dark theme with Bootstrap 5 and Bootstrap Icons
- **Real-time Data**: Connected to JSON Server for data persistence
- **Responsive Design**: Works on desktop and mobile devices
- **User Authentication**: Signup, login, logout

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mini-crm
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Start JSON Server (Backend)
In one terminal, start the JSON Server:
```bash
npm run json-server
```
This will start the server on `http://localhost:3000`

### Start Angular Development Server
In another terminal, start the Angular application:
```bash
npm start
```
This will start the application on `http://localhost:4200`

## API Endpoints

The application uses JSON Server with the following endpoints:

- `GET /leads` - Get all leads
- `POST /leads` - Create a new lead
- `PUT /leads/:id` - Update a lead
- `DELETE /leads/:id` - Delete a lead

- `GET /deals` - Get all deals
- `POST /deals` - Create a new deal
- `PUT /deals/:id` - Update a deal
- `DELETE /deals/:id` - Delete a deal

- `GET /contacts` - Get all contacts
- `POST /contacts` - Create a new contact
- `PUT /contacts/:id` - Update a contact
- `DELETE /contacts/:id` - Delete a contact

- `GET /companies` - Get all companies
- `POST /companies` - Create a new company
- `PUT /companies/:id` - Update a company
- `DELETE /companies/:id` - Delete a company

- `POST /auth/signup` – Register a new user
- `POST /auth/login` – Login user and return token/session
- `POST /auth/logout` – Logout user 

## Data Structure

### User
```json
{
  "id": "string",
  "username": "string",
  "passwrod": "string",
  "name": "string",
}
```
### Lead
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "status": "New" | "Qualified" | "Won" | "Lost",
  "source": "Website" | "Referral" | "Email" | "Cold Call",
  "product": "Software License" | "Website Development" | "Mobile App Development" | "SEO Package" | "Cloud Hosting" | "Digital Marketing" | "E-Commerce Solution" | "CRM Subscription"
  "createdAt": "ISO date string"
}
```

### Deal
```json
{
  "id": "string",
  "title": "string",
  "amount": "number",
  "stage": "Prospecting" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost",
  "closeDate": "ISO date string (optional)",
  "createdAt": "ISO date string"
}
```

### Contact
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string (optional)",
  "createdAt": "ISO date string"
}
```

### Company
```json
{
  "id": "string",
  "name": "string",
  "industry": "string (optional)",
  "website": "string (optional)",
  "createdAt": "ISO date string"
}
```

## Features

### Authentication

- **User Signup** – Register new users
- **User Login** – Login with username and password
- **Logout** – Securely log out users

### Leads
- Create new leads with validation
- View leads in a paginated table
- Search leads by name or email
- Filter by status
- Sort by different columns
- Delete leads

### Deals
- Create new deals with amount and stage tracking
- View deals in a table format
- Search deals by title
- Delete deals

### Contacts
- Create new contacts with validation
- View contacts in a paginated table
- Search contacts by name or email
- Delete contacts

### Companies
- Create new companies
- View companies in a paginated table
- Search companies by name or industry
- Click on website links
- Delete companies

## Technologies Used

- **Frontend**: Angular 19, TypeScript, Bootstrap 5, Bootstrap Icons
- **Backend**: JSON Server
- **Styling**: SCSS with custom dark theme
- **State Management**: Angular Signals

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── data.service.ts        # HTTP service for API calls (CRUD)
│   │   ├── auth.service.ts        # Authentication service (login/signup/logout, token management)
│   │   ├── auth.guard.ts          # Route guard to protect authenticated routes
│   │   └── model.ts              # TypeScript interfaces (User, Lead, Deal, Contact, Company)
│   ├── features/
│   │   ├── auth/                  # Authentication components
│   │   │   ├── login/             # Login component
│   │   │   └── signup/            # Signup component
│   │   ├── leads/                 # Lead management components
│   │   ├── deals/                 # Deal management components
│   │   ├── contacts/              # Contact management components
│   │   └── companies/             # Company management components
│   └── layout/
│       ├── admin-layout/          # Main layout component
│       ├── sidebar/               # Navigation sidebar
│       └── topbar/                # Top navigation bar
├── styles.scss                     # Global styles
└── main.ts                         # Application entry point

```

## Development

### Building for Production
```bash
npm run build
```

### Running Tests
```bash
npm test
```

## Troubleshooting

1. **Port 3000 already in use**: Make sure no other application is using port 3000, or change the port in the json-server script.

2. **CORS issues**: The application is configured to work with JSON Server running on localhost:3000.

3. **Build errors**: Make sure all dependencies are installed with `npm install`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


