import LandingPage from "./components/LandingPage/LandingPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import { AuthProvider } from "../AuthContext";
import WatchList from "./components/Watchlist/WatchList";
import TokenTransfer from "./components/TokenTransfer/TokenTransfer";
import TokenAllowance from "./components/TokenAllowance/TokenAllowance";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="" element={<WatchList />} />
            <Route path="transfer" element={<TokenTransfer />} />
            <Route path="allowance" element={<TokenAllowance />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
