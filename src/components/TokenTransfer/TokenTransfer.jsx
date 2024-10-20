import { useState, useEffect } from "react";
import { ethers } from "../../../ethers-5.6.esm.min.js";
import Modal from "react-modal";
import "./TokenTransfer.css";
import { ERC20_ABI } from "../../../ERC20_ABI.js";
import { popularTokens } from "../../PopularTokens.js";
import { useAccount } from "wagmi";
import { config, getEthersProvider } from "../../provider.tsx";

const TokenTransfer = () => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState("");
  const [token, setToken] = useState("ETH");
  const [tokenName, setTokenName] = useState("ETH");
  const [customToken, setCustomToken] = useState("");
  const [tokenBalance, setTokenBalance] = useState(0);
  const [resetButtonVisible, setResetButtonVisible] = useState(false);
  const { address, isConnected } = useAccount();

  // Array of supported tokens, including popular tokens
  const tokens = [
    { symbol: "ETH", address: null, name: "ETH" },
    ...popularTokens,
  ];

  // Effect to set up the provider when the component mounts
  useEffect(() => {
    const setupProvider = async () => {
      const provider = getEthersProvider(config);
      setProvider(provider);
    };
    setupProvider();
  }, []);

  // Effect to fetch token balance when the provider or selected token changes
  useEffect(() => {
    fetchTokenBalance();
  }, [token, provider]);

  // Function to fetch the name of an ERC20 token
  const fetchTokenName = async (tokenAddress) => {
    if (!provider) return;

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        provider
      );
      const name = await tokenContract.name();
      setTokenName(name);
    } catch (err) {
      console.error("Error fetching token name:", err);
      setTokenName("Unknown Token");
    }
  };

  // Function to fetch the balance of the selected token
  const fetchTokenBalance = async () => {
    if (!provider) return;

    try {
      if (token === "ETH") {
        // Fetch ETH balance
        const balance = await provider.getBalance(address);
        setTokenBalance(ethers.utils.formatEther(balance));
      } else {
        // Fetch ERC20 token balance
        await fetchTokenName(token);
        const tokenContract = new ethers.Contract(token, ERC20_ABI, provider);
        const balance = await tokenContract.balanceOf(address);
        const decimals = await tokenContract.decimals();
        setTokenBalance(ethers.utils.formatUnits(balance, decimals));
      }
    } catch (err) {
      console.error("Error fetching token balance:", err);
      setError("Invalid token address or token not found.");
    }
  };

  // Function to handle the token transfer process
  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTransactionDetails(null);

    if (!provider) {
      setError("No wallet connected. Please connect a wallet first.");
      setLoading(false);
      return;
    }

    try {
      const signer = provider.getSigner();

      if (token === "ETH") {
        // Handle ETH transfer
        const tx = {
          to: recipientAddress,
          value: ethers.utils.parseEther(amount),
        };
        const transaction = await signer.sendTransaction(tx);
        const receipt = await transaction.wait();
        setTransactionDetails({
          hash: transaction.hash,
          from: transaction.from,
          to: transaction.to,
          value: ethers.utils.formatEther(transaction.value),
          gasUsed: receipt.gasUsed.toString(),
          gasPrice: ethers.utils.formatUnits(receipt.effectiveGasPrice, "gwei"),
          blockNumber: receipt.blockNumber,
        });
      } else {
        // Handle ERC20 token transfer
        const tokenContract = new ethers.Contract(token, ERC20_ABI, signer);
        const decimals = await tokenContract.decimals();
        const transaction = await tokenContract.transfer(
          recipientAddress,
          ethers.utils.parseUnits(amount, decimals)
        );
        const receipt = await transaction.wait();
        setTransactionDetails({
          hash: transaction.hash,
          from: transaction.from,
          to: recipientAddress,
          value: amount,
          gasUsed: receipt.gasUsed.toString(),
          gasPrice: ethers.utils.formatUnits(receipt.effectiveGasPrice, "gwei"),
          blockNumber: receipt.blockNumber,
        });
      }
      setModalIsOpen(true);
      setRecipientAddress("");
      setAmount("");
      setError("");
    } catch (error) {
      console.error("Error processing transaction:", error);
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle token selection
  const handleTokenSelect = (tokenAddress) => {
    setToken(tokenAddress);
    setResetButtonVisible(true);
  };

  // Function to reset the selected token to ETH
  const handleResetToETH = () => {
    setToken("ETH");
    setTokenName("ETH");
    setCustomToken("");
    setResetButtonVisible(false);
  };

  return (
    <div className="token-transfer-container">
      <h2>Token Transfer</h2>
      {error && <p className="status-message">{error}</p>}
      <div className="selected-token-info">
        {resetButtonVisible && (
          <button className="reset-button" onClick={handleResetToETH}>
            Transfer Eth
          </button>
        )}
      </div>
      <div className="popular-tokens">
        {tokens
          .filter((t) => t.symbol !== "ETH")
          .map((tokenItem) => (
            <img
              src={tokenItem.logo}
              alt={tokenItem.symbol}
              className="token-logo"
              onClick={() => handleTokenSelect(tokenItem.address)}
              key={tokenItem.address}
            />
          ))}
      </div>
      <div className="custom-token">
        <input
          type="text"
          placeholder="Enter custom token address"
          value={customToken}
          onChange={(e) => setCustomToken(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            if (ethers.utils.isAddress(customToken)) {
              setToken(customToken);
              fetchTokenName(customToken);
              setCustomToken("");
              setResetButtonVisible(true);
            } else {
              setError("Invalid token address.");
            }
          }}
        >
          Add Custom Token
        </button>
      </div>
      <div className="balance-display">
        <p>Currently Selected: {tokenName}</p>
      </div>
      <div className="balance-display">
        <p>
          Balance: {tokenBalance} {tokenName}
        </p>
      </div>
      <form onSubmit={handleTransfer}>
        <div className="form-group">
          <label htmlFor="recipient">Recipient Address</label>
          <input
            type="text"
            id="recipient"
            placeholder="Recipient Wallet Address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="text"
            id="amount"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <button className="payment-button" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Payment"}
        </button>
      </form>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Transaction Details"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h3>Payment Successful</h3>
        {transactionDetails ? (
          <div className="transaction-details">
            <p>
              <strong>Transaction Hash:</strong> {transactionDetails.hash}
            </p>
            <p>
              <strong>From:</strong> {transactionDetails.from}
            </p>
            <p>
              <strong>To:</strong> {transactionDetails.to}
            </p>
            <p>
              <strong>Value:</strong> {transactionDetails.value} {tokenName}
            </p>
            <p>
              <strong>Gas Price:</strong> {transactionDetails.gasPrice} GWEI
            </p>
            <p>
              <strong>Block Number:</strong> {transactionDetails.blockNumber}
            </p>
          </div>
        ) : (
          <p>No transaction details available.</p>
        )}
        <button onClick={() => setModalIsOpen(false)}>Close</button>
      </Modal>
    </div>
  );
};

export default TokenTransfer;
