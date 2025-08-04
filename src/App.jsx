import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import AirdropAbi from "./abi/AirdropClaimer.json";
import "./App.css";

const CONTRACT_ADDRESS = "0xfD704fdCDf772a137BAdbDE8b3f535ef9f79Be1f";

// Dummy live claim data (can be dynamically updated later)
const dummyClaims = [
  "0xAbC...1234 claimed 100 MONK successfully!",
  "0xDef...5678 claimed 100 MONK successfully!",
  "0x123...AbC9 claimed 100 MONK successfully!",
  "0x456...FFaa claimed 100 MONK successfully!",
  "0x789...ACD1 claimed 100 MONK successfully!",
];

function App() {
  const [account, setAccount] = useState(null);
  const [referral, setReferral] = useState(null);
  const [txStatus, setTxStatus] = useState("");
  const [currentClaimIndex, setCurrentClaimIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferral(ref);

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        connectWallet();
      });
    }

    const interval = setInterval(() => {
      setCurrentClaimIndex((prev) => (prev + 1) % dummyClaims.length);
    }, 3000); // change message every 3 sec

    return () => clearInterval(interval);
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
    } catch (err) {
      console.error(err);
      setTxStatus("Already Claimed or insufficient gas fee.");
    }
  };

  const referralLink = `${window.location.origin}?ref=${account}`;

  return (
    <div className="page">
      {/* Live Claim Ticker */}
      <div className="ticker">
        <p>{dummyClaims[currentClaimIndex]}</p>
      </div>

      <div className="main-content">
        <div className="header">
          <img src="/monkey.png" alt="logo" className="logo" />
          <h1 className="main-title">$20,000 usdt Reward & $200k worth of $Monk Airdrop</h1>
        </div>

        <p className="coming-soon">"Top 100 referrers will receive $100 USDT each,</p>
        <p className="coming-soon">1000 claimers randomly receive $10 USDT each as a special bonus."</p>

        <div className="token-info">
          <p>FCFS: <strong>20k</strong></p>
          <p>Token: <strong>$Monkey (MONK)</strong></p>
          <p>Total Supply: <strong>100 Million</strong></p>
          <p>Listing: <strong>19th August</strong></p>
          <p>Listing Price: <strong>0.1$ per $Monk</strong></p>
          <p>Ref: <strong>20 Monk Per Referrer</strong></p>
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

        <div className="build-section">
          <h3>Want to build your own project?</h3>
          <a href="https://yourprojectlink.com" target="_blank" rel="noopener noreferrer">
            <button className="build-btn">Launch Your Own Airdrop</button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
