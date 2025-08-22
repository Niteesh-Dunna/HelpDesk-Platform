import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TicketsPage from "./pages/TicketsPage";
import AdminKBPage from "./pages/AdminKBPage";
import KBSearchPage from "./pages/KBSearchPage";
import AdminTicketsPage from "./pages/AdminTicketsPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import ConfigPage from "./pages/ConfigPage";
import AgentTicketsPage from "./pages/AgentTicketsPage";
import AgentTicketDetailPage from "./pages/AgentTicketDetailPage";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User routes */}
        <Route
          path="/tickets"
          element={
            <PrivateRoute role={null}>
              <TicketsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <PrivateRoute>
              <TicketDetailPage />
            </PrivateRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/kb"
          element={
            <PrivateRoute role="admin">
              <AdminKBPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/tickets"
          element={
            <PrivateRoute role="admin">
              <AdminTicketsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/config"
          element={
            <PrivateRoute role="admin">
              <ConfigPage />
            </PrivateRoute>
          }
        />

        {/* KB search */}
        <Route path="/kb" element={<KBSearchPage />} />

        {/* Agent routes */}
        <Route
          path="/agent/tickets"
          element={
            <PrivateRoute role="agent">
              <AgentTicketsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/agent/tickets/:id"
          element={
            <PrivateRoute role="agent">
              <AgentTicketDetailPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
