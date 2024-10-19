import "./LandingPage.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);

  // Function to handle wallet connection
  const handleConnect = async () => {
    try {
      setIsConnected(true);
      console.log("Wallet connected!");
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  // Function to handle disconnection
  const handleDisconnect = () => {
    // Implement your disconnection logic here
    setIsConnected(false);
    console.log("Wallet disconnected!");
  };

  return (
    <div className="landing-container">
      <header onClick={() => navigate("/")} className="login-header">
        <img src="/logo.png" alt="TokenTrackr Logo" className="logo" />
        <h2>TokenTrackr</h2>
      </header>
      <div className="content">
        <h1 className="title">TokenTrackr</h1>
        <p className="subtitle">
          Monitor, track, and manage your tokens effortlessly.
        </p>
        <div className="get-started-btn">
          <w3m-button onClick={handleConnect}>Connect Wallet</w3m-button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
