import logo from './logo.svg';
import './App.css';
import data from './config.json'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div >
        {
          data.map((data,i) => (
            <div key={i}>
                <h2>{data.title}</h2>
                <p>{data.url}</p>
            </div>
          ))
        }
      </div>
      </header>
      
    </div>
    
    
  );
}

export default App;
