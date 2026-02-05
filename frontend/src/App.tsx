import Dashboard from './components/Dashboard.tsx';
import './style/App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>ESP32 Sensor Dashboard</h1>
        <p className="subtitle">Real-time temperature, humidity, and gas monitoring</p>
      </header>
      <main>
        <Dashboard />
      </main>
      <footer className="App-footer">
        <p>ESP32 Sensor Monitoring System • {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
