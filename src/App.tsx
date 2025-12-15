import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout, LayoutNav, useNavigation } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DrawArena } from './pages/DrawArena';
import { Contestants } from './pages/Contestants';
import { Winners } from './pages/Winners';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { currentPage, navigate } = useNavigation();

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'draw':
        return <DrawArena />;
      case 'contestants':
        return <Contestants />;
      case 'winners':
        return <Winners />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <LayoutNav currentPage={currentPage} onNavigate={navigate} />
        {renderPage()}
      </Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
