import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import NewsValidation from './artifacts/contracts/NewsValidation.sol/NewsValidation.json';
import './App.css';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [newsItems, setNewsItems] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [transactionPending, setTransactionPending] = useState(false);

  const contractAddress = "0x62c87fDc1B4B3C8fFc2B78ECCcA8B50F3bB4192C";

  useEffect(() => {
    const connectWallet = async () => {
      try {
        if (!window.ethereum) throw new Error('MetaMask is not installed');

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, NewsValidation.abi, signer);

        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        setAccount(accounts[0]);

        window.ethereum.on('accountsChanged', () => window.location.reload());
        await loadNews(contract);
      } catch (err) {
        console.error('Error connecting wallet:', err);
      }
    };

    connectWallet();
  }, []);

  const loadNews = async (contract) => {
    try {
      const count = await contract.getNewsCount();
      const items = [];
      for (let i = 1; i <= count; i++) {
        const news = await contract.getNews(i);
        items.push({
          id: Number(news.id),
          author: news.author,
          title: news.title,
          content: news.content,
          trueVotes: Number(news.trueVotes),
          falseVotes: Number(news.falseVotes),
          isValidated: news.isValidated
        });
      }
      setNewsItems(items);
      setLoading(false);
    } catch (err) {
      console.error('Error loading news:', err);
    }
  };

  const submitNews = async (e) => {
    e.preventDefault();
    setTransactionPending(true);
    try {
      const tx = await contract.submitNews(newTitle, newContent);
      await tx.wait();
      setNewTitle('');
      setNewContent('');
      await loadNews(contract);
    } catch (err) {
      console.error('Error submitting news:', err);
    }
    setTransactionPending(false);
  };

  const voteOnNews = async (newsId, isTrue) => {
    setTransactionPending(true);
    try {
      const tx = await contract.voteOnNews(newsId, isTrue);
      await tx.wait();
      await loadNews(contract);
    } catch (err) {
      console.error('Error voting on news:', err);
    }
    setTransactionPending(false);
  };

  return (
    <div className="app-container">
      <h2>Blockchain-Based Fake News Detection</h2>
      <div className="account-display">
        Connected Account: {account}
      </div>
  
      <form className="news-form" onSubmit={submitNews}>
        <div className="input-group">
          <label htmlFor="title">News Title</label>
          <input
            id="title"
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter news title"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="content">News Content</label>
          <textarea
            id="content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Enter news content"
            required
          />
        </div>
        <button
          type="submit"
          className={`button button-primary ${transactionPending ? 'transaction-pending' : ''}`}
          disabled={transactionPending}
        >
          Submit News
        </button>
      </form>
  
      {loading ? (
        <div className="loading-state">Loading news...</div>
      ) : (
        <div className="news-list">
          {newsItems.map((news) => (
            <div key={news.id} className="news-card">
              <h3>{news.title}</h3>
              <p className="news-content">{news.content}</p>
              <div className="news-meta">
                <span><strong>Author:</strong> {news.author}</span>
                <div className="vote-stats">
                  <span className="vote-true">✅ {news.trueVotes}</span>
                  <span className="vote-false">❌ {news.falseVotes}</span>
                </div>
              </div>
              {news.isValidated ? (
                <div className={`validation-badge ${news.trueVotes > news.falseVotes ? 'validation-true' : 'validation-false'}`}>
                  {news.trueVotes > news.falseVotes ? 'Validated True' : 'Validated False'}
                </div>
              ) : (
                <div className="vote-buttons">
                  <button
                    onClick={() => voteOnNews(news.id, true)}
                    className="button vote-true-btn"
                    disabled={transactionPending}
                  >
                    Vote True
                  </button>
                  <button
                    onClick={() => voteOnNews(news.id, false)}
                    className="button vote-false-btn"
                    disabled={transactionPending}
                  >
                    Vote False
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

}

export default App;