import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import AirdropAbi from "./abi/AirdropClaimer.json";
import "./App.css";

const CONTRACT_ADDRESS = "0xfD704fdCDf772a137BAdbDE8b3f535ef9f79Be1f";

function App() {
  const [account, setAccount] = useState(null);
  const [referral, setReferral] = useState(null);
  const [txStatus, setTxStatus] = useState("");

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
    } catch (err) {
      console.error(err);
      setTxStatus("Already Claimed or insuficient gas fee.");
    }
  };

  const referralLink = `${window.location.origin}?ref=${account}`;

  return (
    <div className="page">
      <div className="main-content">
        <div className="header">
          <img src="/monkey.png" alt="logo" className="logo" />
          <h1 className="main-title">$2000 usdt Reward & Monkey Token Airdrop</h1>
        </div>

        <p className="coming-soon">"The top 100 referrers will be rewarded with $10 USDT each,"</p>
        <p className="coming-soon">while our system will randomly select 1000 claimers to receive $1 USDT each as a special bonus."</p>

        <div className="token-info">
          <p>FCFS: <strong>6.7k/20k</strong></p>
          <p>Token Name: <strong>$Monkey</strong></p>
          <p>Symbol: <strong>$Monk</strong></p>
          <p>Total Supply: <strong>100,000,000</strong></p>
          <p>CA: <strong>0x24EEb02cdb8aA5570AfFC2DeC465f57bA176Db47</strong></p>
          <p>Listing: <strong>19th August</strong></p>
          <p>Rate: <strong>0.02$ per $Monk</strong></p>
          <p>Ref: <strong>20 Monk Per reffer</strong></p>
        </div>

        {!account && (
          <button onClick={connectWallet} className="connect-btn">
            Connect and Claim
          </button>
        )}

        {account && (
          <>
            <button className="claim-btn" onClick={claimAirdrop}>
              Claim 100 Monk
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
