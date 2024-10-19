import { useState, useEffect } from "react";
import { ethers } from "../../../ethers-5.6.esm.min.js";
import "./TokenAllowance.css";
import CheckAllowance from "./CheckAllowance";
import ApproveTokens from "./ApproveTokens";
import { ERC20_ABI } from "../../../ERC20_ABI.js";
import { popularTokens } from "../../PopularTokens.js";
import { EthereumProvider } from "@walletconnect/ethereum-provider";

const TokenAllowance = () => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  allowance;
  const [allowance, setAllowance] = useState(null);
  const [approvalAmount, setApprovalAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mode, setMode] = useState("check");
  const [provider, setProvider] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [selectedToken, setSelectedToken] = useState("");

  const tokens = [{ symbol: "ETH", address: null }, ...popularTokens];

  // Initialize Ethereum provider
  useEffect(() => {
    const setupProvider = async () => {
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
          1: "https://eth-mainnet.g.alchemy.com/v2/fNr3TwzXGZWEmV13p3mCxDAhHYj1fgKP",
        },
      });
      setProvider(provider);
    };
    setupProvider();
  }, []);

  // Update token address when a new token is selected
  useEffect(() => {
    if (selectedToken) {
      setTokenAddress(selectedToken);
    }
  }, [selectedToken]);

  // Check token allowance for the specified contract
  const checkAllowance = async () => {
    if (!tokenAddress || !contractAddress) {
      setError("Please provide both token address and contract address.");
      return;
    }

    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      let address = localStorage.getItem("walletAddress");

      if (!address) {
        const signer = provider.getSigner();
        address = await signer.getAddress();
      }

      const allowanceAmount = await contract.allowance(
        address,
        contractAddress
      );
      setAllowance(ethers.utils.formatEther(allowanceAmount));
      setError("");
    } catch (err) {
      setError(
        "Error fetching allowance. Please check the addresses and try again."
      );
      setAllowance(null);
    }
  };

  // Approve tokens for the specified contract
  const approveTokens = async () => {
    if (!tokenAddress || !contractAddress || !approvalAmount) {
      setError(
        "Please provide token address, contract address, and approval amount."
      );
      return;
    }

    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const signer = provider.getSigner();
      const ownerAddress = await signer.getAddress();
      const balance = await contract.balanceOf(ownerAddress);
      const decimals = await contract.decimals();
      const formattedBalance = ethers.utils.formatUnits(balance, decimals);

      if (parseFloat(formattedBalance) < parseFloat(approvalAmount)) {
        setError("Insufficient token balance for approval.");
        return;
      }

      setIsApproving(true);
      const tx = await contract
        .connect(signer)
        .approve(
          contractAddress,
          ethers.utils.parseUnits(approvalAmount, decimals)
        );
      await tx.wait();
      setSuccess("Approval successful!");
      setError("");
      setAllowance(null);
    } catch (err) {
      setError(
        "Error approving tokens. Connect to a wallet or try again later."
      );
      setSuccess("");
    } finally {
      setIsApproving(false);
    }
  };

  // Handle token selection from the popular tokens list
  const handleTokenSelect = (address) => {
    setSelectedToken(address);
  };

  return (
    <div className="token-allowance-container">
      <h2>Token Allowance</h2>

      <div className="toggle-mode">
        <button
          onClick={() => setMode("check")}
          className={mode === "check" ? "active" : ""}
        >
          Check Allowance
        </button>
        <button
          onClick={() => setMode("approve")}
          className={mode === "approve" ? "active" : ""}
        >
          Approve Allowance
        </button>
      </div>

      <div className="popular-tokens">
        {tokens
          .filter((t) => t.symbol !== "ETH")
          .map((tokenItem) => (
            <img
              key={tokenItem.symbol}
              src={tokenItem.logo}
              alt={tokenItem.symbol}
              className="token-logo"
              onClick={() => handleTokenSelect(tokenItem.address)}
            />
          ))}
      </div>

      {mode === "check" && (
        <CheckAllowance
          tokenAddress={tokenAddress}
          setTokenAddress={setTokenAddress}
          contractAddress={contractAddress}
          setContractAddress={setContractAddress}
          checkAllowance={checkAllowance}
          allowance={allowance}
          error={error}
        />
      )}

      {mode === "approve" && (
        <ApproveTokens
          tokenAddress={tokenAddress}
          setTokenAddress={setTokenAddress}
          contractAddress={contractAddress}
          setContractAddress={setContractAddress}
          approvalAmount={approvalAmount}
          setApprovalAmount={setApprovalAmount}
          approveTokens={approveTokens}
          success={success}
          error={error}
          setSuccess={setSuccess}
          setError={setError}
          isApproving={isApproving}
        />
      )}
    </div>
  );
};

export default TokenAllowance;
