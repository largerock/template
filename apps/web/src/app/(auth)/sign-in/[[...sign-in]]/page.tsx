import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className='flex min-h-[calc(100vh-72px)] flex-col items-center justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <h2 className='text-center text-3xl font-bold tracking-tight text-foreground'>
          Welcome to Template
        </h2>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <SignIn
          path='/sign-in'
          routing='path'
          signUpUrl='/sign-up'
          fallbackRedirectUrl='/dashboard'
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary hover:bg-primary/90 text-sm normal-case text-primary-foreground',
              footerActionLink: 'text-primary hover:text-primary/90',
            },
          }}
        />
      </div>
    </div>
  );
}
