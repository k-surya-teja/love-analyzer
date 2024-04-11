import NavbarHome from './Components/NavbarHome';
import History from './Components/History';
import Home from './Components/Home';
import Footer from './Components/Footer'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <NavbarHome />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/history' element={<History/>}></Route>
        </Routes>
        <Footer/>
      </Router>
    </div>
  );
}

export default App;
