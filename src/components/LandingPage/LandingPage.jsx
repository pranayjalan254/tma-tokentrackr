import "./LandingPage.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnected(true);
      navigate("/dashboard");
      console.log("Wallet connected!");
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  return (
    <div className="landing-container">
      <header onClick={() => navigate("/")} className="login-header">
        <img src="/logo.png" alt="TokenTrackr Logo" className="logo" />
      </header>
      <div className="content">
        <h1 className="title">TokenTrackr</h1>
        <p className="subtitle">
          Monitor, track, and manage your tokens effortlessly.
        </p>
        <w3m-button onClick={handleConnect}>Connect Wallet</w3m-button>
      </div>
    </div>
  );
};

export default LandingPage;
