export function AppError({ error }: { error: Error | null }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-gray-500">{error?.message || 'An unknown error occurred'}</p>
      </div>
    </div>
  );
}
