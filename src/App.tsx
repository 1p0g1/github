import './App.css';
import { useDictionary } from './dictionary/useDictionary';
import { GameBoard } from './components/GameBoard';

function App() {
  const { trie, loading, error } = useDictionary();

  if (loading) {
    return <div className="loading">Loading dictionary...</div>;
  }

  if (error || !trie) {
    return (
      <div className="error">
        Failed to load dictionary.
        <br />
        Run <code>npm run build:dictionary</code> first.
        {error && <><br /><small>{error}</small></>}
      </div>
    );
  }

  return <GameBoard trie={trie} />;
}

export default App;
