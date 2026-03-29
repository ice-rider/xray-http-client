import { Router, Route } from '@solidjs/router';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { getToken } from './api';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute(props: { children: any }) {
  const token = getToken();
  if (!token) {
    window.location.href = '/login';
    return null;
  }
  return props.children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path="/" component={() => <ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/login" component={LoginPage} />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
