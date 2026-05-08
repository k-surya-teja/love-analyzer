import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavbarHome from './Components/NavbarHome';
import History from './Components/History';
import Home from './Components/Home';
import Footer from './Components/Footer';
import SharePage from './Components/SharePage';
import HeartsBackground from './Components/HeartsBackground';
import { ThemeProvider } from './Components/utils/ThemeContext';
import './App.css';

function App() {
    return (
        <ThemeProvider>
            <div className="App">
                <HeartsBackground />
                <Router>
                    <NavbarHome />
                    <div className="app-shell">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/history" element={<History />} />
                            <Route path="/share/:id" element={<SharePage />} />
                        </Routes>
                    </div>
                    <Footer />
                </Router>
            </div>
        </ThemeProvider>
    );
}

export default App;
