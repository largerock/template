# Template

A modern professional networking platform built with React, TypeScript, and Next.js.

## Features

- Professional profile management
- Work experience tracking
- Skills management
- Industry categorization
- Location-based networking
- Dark mode support
- Responsive design

## Tech Stack

- **Frontend**: React, TypeScript, Next.js
- **Styling**: Tailwind CSS
- **State Management**: Custom stores with Zustand
- **Authentication**: Clerk
- **Database**: PostgreSQL
- **Location Services**: Google Places API
- **Form Management**: React Hook Form
- **Type Safety**: TypeScript, Zod

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Yarn or npm

### Database Setup

1. Install PostgreSQL:

   ```bash
   # macOS (using Homebrew)
   brew install postgresql@14

   # Ubuntu/Debian
   sudo apt install postgresql-14

   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. Start PostgreSQL service:

   ```bash
   # macOS
   brew services start postgresql@14

   # Ubuntu/Debian
   sudo service postgresql start
   ```

3. Create the database:

   ```bash
   createdb template
   ```

### Application Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/template.git
   cd template
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in the required environment variables in `.env.local`:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/template"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key

   # Google Places API
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key
   ```

4. Run database migrations:

   ```bash
   yarn prisma migrate dev
   ```

5. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```sh
template/
├── apps/
│   └── web/        # Main Next.js application
│       ├── src/
│       │   ├── components/   # React components
│       │   ├── hooks/        # Custom React hooks
│       │   ├── state/        # State management
│       │   ├── app/          # nextjs root
│       │   └── types/        # TypeScript types
├── libs/
│   └── core-types/            # Shared TypeScript types
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
