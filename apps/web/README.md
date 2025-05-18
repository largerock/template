# Template App

The main Next.js application for Template platform.

## Development Setup

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Create a `.env.local` file from the example:

   ```bash
   cp .env.local.example .env.local
   ```

3. Add your Clerk API keys to the `.env.local` file

4. Start the development server:

   ```bash
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## VS Code Configuration

This project includes recommended VS Code settings for optimal development:

- ESLint integration for linting and formatting
- Auto-fix on save for ESLint errors
- Removal of trailing whitespace on save
- Recommended extensions

Please make sure you have the following extensions installed:

- ESLint (`dbaeumer.vscode-eslint`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)

## Available Scripts

- `yarn dev` - Start the development server
- `yarn build` - Build the application for production
- `yarn start` - Start the production server
- `yarn lint` - Run ESLint to check for issues
- `yarn lint:fix` - Run ESLint and automatically fix issues
- `yarn format` - Format code using ESLint
- `yarn test` - Run tests

## Stack

- Next.js
- TypeScript
- Clerk Auth
- Tailwind CSS
- Zustand (State Management)

## Using Custom Clerk Authentication

This application includes custom integration with Clerk's JWT templates for authentication:

### Authentication Flow

1. **JWT Template**: The app uses a custom Clerk JWT template named `template-token`
2. **Token Storage**: Custom JWT is stored in Zustand state with persistence
3. **API Integration**: All API calls use the stored token for authentication

### Implementation Details

#### Token Provider

The `AuthTokenProvider` component automatically manages token lifecycle:

- Fetches the token when user is authenticated
- Verifies token expiration
- Refreshes token when needed

```jsx
// Already added to the layout.tsx
<AuthTokenProvider>{children}</AuthTokenProvider>
```

#### Token Access Methods

1. **React Hooks**:

   ```jsx
   // Access token directly
   const { token, decodedToken } = useTemplateToken();

   // Access specific claims
   const { claim: role } = useTemplateClaim("role");
   ```

2. **Zustand Store**:

   ```jsx
   // Direct store access
   const { allInterests, isLoadingInterests } = useTaxonomyInterestsStore();

   // Actions
   const { searchInterests, refreshIfNeeded } = useTaxonomyInterestsStore();
   ```

3. **API Client**:

   ```jsx
   // Use in API calls
   import api from "../lib/api-with-token";

   // The token is automatically included
   const profile = await api.getCurrentUser();
   ```

4. **API Hooks**:

   ```jsx
   // React hooks for API calls
   const { data, isLoading, error, execute } = useUserProfile();
   ```

### Example Page

An example implementation showing all methods is available at `/example` route.

### Clerk Dashboard Setup

To use this functionality, you need to create a JWT template in Clerk:

1. Go to the Clerk Dashboard > JWT Templates
2. Create a new template named `template-token`
3. Add your custom claims (optional)
4. Set the appropriate lifetime and signing algorithm
