# Parent Portal Error Handling Usage Guide

This guide demonstrates how to use the error handling utilities in the parent portal.

## Components

### 1. ParentErrorBoundary

Wrap your parent portal routes with the error boundary to catch React errors:

```jsx
import ParentErrorBoundary from './components/parent/ParentErrorBoundary';

<ParentErrorBoundary>
  <ParentLayout>
    <ParentDashboard />
  </ParentLayout>
</ParentErrorBoundary>
```

### 2. NotificationContainer

Add the notification container to your app root to enable toast notifications:

```jsx
import NotificationContainer from './components/parent/NotificationContainer';

function App() {
  return (
    <>
      <NotificationContainer />
      {/* Your routes */}
    </>
  );
}
```

### 3. Loading States

#### LoadingSpinner
```jsx
import LoadingSpinner from './components/parent/LoadingSpinner';

// Inline spinner
<LoadingSpinner message="Loading stats..." size="md" />

// Full screen spinner
<LoadingSpinner message="Loading..." size="lg" fullScreen />
```

#### LoadingOverlay
```jsx
import LoadingOverlay from './components/parent/LoadingOverlay';

<LoadingOverlay message="Saving changes..." show={isLoading} />
```

### 4. Success and Error Messages

#### SuccessMessage
```jsx
import SuccessMessage from './components/parent/SuccessMessage';

<SuccessMessage 
  message="Profile updated successfully!" 
  onDismiss={() => setShowSuccess(false)}
/>
```

#### ErrorMessage
```jsx
import ErrorMessage from './components/parent/ErrorMessage';

<ErrorMessage 
  message="Failed to load data" 
  onRetry={handleRetry}
  onDismiss={() => setError(null)}
/>
```

### 5. EmptyState
```jsx
import EmptyState from './components/parent/EmptyState';

<EmptyState
  title="No statistics available"
  message="Your child hasn't started practicing yet."
  action={
    <button onClick={handleRefresh}>Refresh</button>
  }
/>
```

## Hooks

### useParentAsync

For general async operations:

```jsx
import { useParentAsync } from '../hooks/useParentAsync';
import { fetchParentStats } from '../utils/parentApi';

function ParentDashboard() {
  const { loading, error, data, execute } = useParentAsync(
    () => fetchParentStats(token),
    {
      showSuccessNotification: false,
      showErrorNotification: true,
      onSuccess: (stats) => console.log('Stats loaded:', stats),
    }
  );

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} onRetry={execute} />;
  if (!data) return <EmptyState />;

  return <div>{/* Render stats */}</div>;
}
```

### useParentFormSubmit

For form submissions:

```jsx
import { useParentFormSubmit } from '../hooks/useParentAsync';
import { sendParentFeedback } from '../utils/parentApi';

function FeedbackForm() {
  const { submitting, submitError, submitSuccess, submit } = useParentFormSubmit(
    (formData) => sendParentFeedback(formData.message, token),
    {
      successMessage: 'Feedback sent successfully!',
      resetOnSuccess: true,
      onSuccess: () => {
        // Clear form or redirect
      },
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await submit({ message: formData.get('message') });
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea name="message" />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send Feedback'}
      </button>
      {submitSuccess && <SuccessMessage message="Feedback sent!" />}
      {submitError && <ErrorMessage message={submitError.message} />}
    </form>
  );
}
```

### useParentFetch

For data fetching with auto-fetch:

```jsx
import { useParentFetch } from '../hooks/useParentAsync';

function StatsDisplay() {
  const { loading, error, data, refetch } = useParentFetch(
    () => fetchParentStats(token),
    {
      immediate: true,
      onSuccess: (stats) => console.log('Stats:', stats),
    }
  );

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error.message} onRetry={refetch} />}
      {data && <StatsDisplay data={data} />}
    </div>
  );
}
```

## API Error Handling

The API utilities automatically handle errors. You can also use the error handler directly:

```jsx
import { handleApiCall, showNotification } from '../utils/parentErrorHandler';
import { fetchParentStats } from '../utils/parentApi';

async function loadStats() {
  try {
    const stats = await handleApiCall(
      () => fetchParentStats(token),
      {
        showLoading: true,
        showSuccess: true,
        successMessage: 'Stats loaded successfully!',
      }
    );
    return stats;
  } catch (error) {
    // Error is already handled and displayed
    console.error('Failed to load stats:', error);
  }
}
```

## Manual Notifications

Show notifications manually:

```jsx
import { showNotification } from '../utils/parentErrorHandler';

// Success
showNotification('Operation completed!', 'success', 3000);

// Error
showNotification('Something went wrong', 'error', 5000);

// Warning
showNotification('Please check your input', 'warning', 4000);

// Info
showNotification('Loading data...', 'info', 0); // 0 = persistent until closed
```

## Network Status

Monitor network connectivity:

```jsx
import { setupNetworkListeners, isOnline } from '../utils/parentErrorHandler';

useEffect(() => {
  setupNetworkListeners(
    () => {
      // Online callback
      console.log('Back online!');
    },
    () => {
      // Offline callback
      console.log('Connection lost');
    }
  );
}, []);

// Check current status
if (!isOnline()) {
  return <ErrorMessage message="No internet connection" />;
}
```

## Retry with Exponential Backoff

```jsx
import { retryApiCall } from '../utils/parentErrorHandler';
import { fetchParentStats } from '../utils/parentApi';

async function loadStatsWithRetry() {
  try {
    const stats = await retryApiCall(
      () => fetchParentStats(token),
      3, // max retries
      1000 // base delay in ms
    );
    return stats;
  } catch (error) {
    console.error('Failed after retries:', error);
  }
}
```

## Best Practices

1. **Always wrap parent routes with ParentErrorBoundary**
2. **Add NotificationContainer to your app root**
3. **Use the custom hooks for consistent error handling**
4. **Show loading states for all async operations**
5. **Provide retry options for failed operations**
6. **Display empty states when no data is available**
7. **Use appropriate notification types (success, error, warning, info)**
8. **Handle 401 errors automatically (already implemented in API utils)**
9. **Check network connectivity before making API calls**
10. **Log errors in development, send to tracking service in production**
