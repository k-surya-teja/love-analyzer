import React from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { History } from '@mui/icons-material';
import { Link} from 'react-router-dom';
import logo from '../images/groom.png'

function NavbarHome() {

  // const navigate = useNavigate();
  // const handleShow = () => {
  //     navigate('/history');
  // }

  return (
    <Navbar expand='lg' className="Navbar">
      <Container>
        <Link className='link' to='/'>Love analyzer <img src={logo} style={{ width: '50px', marginTop: '-20px' }} alt="logo" /></Link>
        {/* <Navbar.Toggle onClick={handleShow} /> */}
        <Link className='link' style={{fontSize:'25px'}} to='/history'>Posts <History/></Link>
      </Container>
    </Navbar>
  );
}

export default NavbarHome;