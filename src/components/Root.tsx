import { App } from '@/components/App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { UserSwitcher } from '@/components/DevTools/UserSwitcher.tsx';


function ErrorBoundaryError({ error }: { error: unknown }) {
  return (
    <div>
      <p>An unhandled error occurred:</p>
      <blockquote>
        <code>
          {error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : JSON.stringify(error)}
        </code>
      </blockquote>
    </div>
  );
}

export function Root() {
  const handleUserChange = (user: any) => {
    console.log('🧪 [DEV] Switched to user:', user);
  };

  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      
        <App/>
        <UserSwitcher onUserChange={handleUserChange} />
    </ErrorBoundary>
  );
}
