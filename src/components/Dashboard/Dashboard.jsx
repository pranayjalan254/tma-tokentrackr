import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import { useState, useEffect } from "react";
import { ethers } from "../../../ethers-5.6.esm.min.js";
import "./Dashboard.css";
import { EthereumProvider } from "@walletconnect/ethereum-provider";

const Dashboard = () => {
  const { logout } = useAuth();
  const [walletAddress, setWalletAddress] = useState("");
  const [ethBalance, setEthBalance] = useState("0");
  const [network, setNetwork] = useState("");
  const [gasPrices, setGasPrices] = useState({ low: 0, medium: 0, high: 0 });

  // Function to get network name based on chain ID
  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet";
      case 5:
        return "Goerli Testnet";
      case 11155111:
        return "Sepolia Testnet";
      case 137:
        return "Polygon Mainnet";
      default:
        return "Unknown Network";
    }
  };

  // Fetch gas prices and set the state
  const fetchGasPrices = async () => {
    if (!provider) return;
    try {
      const gasPrice = await provider.getGasPrice();
      const gasPriceInGwei = ethers.utils.formatUnits(gasPrice, "gwei");
      setGasPrices({
        low: gasPriceInGwei * 0.8,
        medium: gasPriceInGwei,
        high: gasPriceInGwei * 1.2,
      });
    } catch (error) {
      console.error("Error fetching gas prices:", error);
    }
  };

  // Fetch wallet information and initialize provider
  useEffect(() => {
    const fetchWalletInfo = async () => {
      const provider = await EthereumProvider.init({
        projectId: "aecf1ee81036bd3fe28c914b0465a30f",
        metadata: {
          name: "AppKit",
          description: "AppKit Example",
          url: "https://example.com",
          icons: ["https://avatars.githubusercontent.com/u/179229932"],
        },
        showQrModal: true,
        optionalChains: [1, 137, 2020, 11155111],

        rpcMap: {
          11155111:
            "https://eth-sepolia.g.alchemy.com/v2/Eni5THenJtUWs4oixXBwi2KRBDk8iMAH",
        },
      });
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const networkInfo = await provider.getNetwork();
      setWalletAddress(address);
      setEthBalance(ethers.utils.formatEther(balance));
      setNetwork(getNetworkName(networkInfo.chainId));

      // Fetch gas prices
      await fetchGasPrices();
    };

    fetchWalletInfo();
  }, []);

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
            <button onClick={handleLogout}>Logout</button>
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
            <strong>Wallet Address:</strong> {walletAddress}
          </p>
          <p className="wallet-address">
            <strong>ETH Balance:</strong> {ethBalance} ETH
          </p>
          <p className="wallet-address">
            <strong>Current Network:</strong> {network}
          </p>
          <div className="wallet-address">
            <div className="gas-prices">
              <h4>Current Gas Prices (Gwei)</h4>
              <p className="prices">
                <strong>Low:</strong> {gasPrices.low} Gwei
              </p>
              <p className="prices">
                <strong>Medium:</strong> {gasPrices.medium} Gwei
              </p>
              <p className="prices">
                <strong>High:</strong> {gasPrices.high} Gwei
              </p>
            </div>
          </div>
        </section>
        <section className="dashboard-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
