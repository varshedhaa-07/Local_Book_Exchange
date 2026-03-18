import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import AddBookPage from './pages/AddBookPage';
import AuthPage from './pages/AuthPage';
import BookDetailsPage from './pages/BookDetailsPage';
import ChatPage from './pages/ChatPage';
import HomePage from './pages/HomePage';
import MatchSuggestionsPage from './pages/MatchSuggestionsPage';
import MyBooksPage from './pages/MyBooksPage';
import MyTradesPage from './pages/MyTradesPage';
import ProfilePage from './pages/ProfilePage';
import TradeRequestsPage from './pages/TradeRequestsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/add-book" element={<AddBookPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/books" element={<MyBooksPage />} />
              <Route path="/profile/trades" element={<MyTradesPage />} />
              <Route path="/trade-requests" element={<TradeRequestsPage />} />
              <Route path="/matches" element={<MatchSuggestionsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:userId" element={<ChatPage />} />
              <Route path="/books/:id" element={<BookDetailsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
