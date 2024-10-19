import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import { useAccount, useBalance } from "wagmi";
import "./Dashboard.css";
import { ethers } from "../../../ethers-5.6.esm.min.js";

const Dashboard = () => {
  const { logout } = useAuth();
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });

  // Safely format the balance
  const getFormattedBalance = () => {
    if (!balanceData) return "0";
    try {
      // Access the value property of balanceData
      return ethers.utils.formatEther(balanceData.value || "0");
    } catch (error) {
      console.error("Error formatting balance:", error);
      return "0";
    }
  };

  const ethBalance = getFormattedBalance();

  // Handle logout process
  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dash-header">
          <div className="header">
            <img
              className="header-logo"
              src="/logo.png"
              alt="TokenTrackr Logo"
            />
            <h1>TokenTrackr</h1>
          </div>
          <div>
            <w3m-button onClick={handleLogout}>Logout</w3m-button>
          </div>
        </div>
        <nav>
          <ul>
            <li>
              <Link to="">Watch List</Link>
            </li>
            <li>
              <Link to="allowance">Allowance</Link>
            </li>
            <li>
              <Link to="transfer">Transfer</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="dashboard-main">
        <section className="dashboard-summary">
          <h2>Welcome Back!</h2>
          <p className="wallet-address">
            <strong>Wallet Address:</strong> {address || "Not Connected"}
          </p>
          <p className="wallet-address">
            <strong>ETH Balance:</strong> {ethBalance} ETH
          </p>
          <div className="wallet-address"></div>
        </section>
        <section className="dashboard-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
