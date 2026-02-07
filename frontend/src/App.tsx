// import Dashboard from "./components/Dashboard_Old.tsx";
import "./style/App.scss";
import { Popup } from "./components/Popup";
import { StartupPopup } from "./components/StartupPopup";

function App() {
    return <>
        <StartupPopup
            simulateDatabaseConnection={true}
            simulateSerialConnection={true}
        />
        <div className="App">
            <header className="App-header">
                <h1>ESP32 Sensor Dashboard</h1>
            </header>
            <main>wdwdwd</main>
            <footer className="App-footer">rfr</footer>
        </div>
    </>;
}

export default App;
