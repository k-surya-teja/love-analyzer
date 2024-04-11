import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Model from './Model';
import Error from './Error';

export default function Home() {

    const [name1, setName1] = useState("")
    const [name2, setName2] = useState("")

    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const updateOnlineStatus = () => {
            setIsOffline(!navigator.onLine);
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    const handleReset = (e) => {
        e.preventDefault();
        setName1("");
        setName2("");
        document.getElementById('name1').value = "";
        document.getElementById('name2').value = "";

    }

    return (
        <div className='container main' style={{ textAlign: 'center' }}>
            {!isOffline ? (
                <div>
                    <p className='hero'>
                        Introducing our <span style={{
                            color: 'rgb(218, 77, 100)', fontSize: '20px'
                        }}>Love Analyzer</span> , <br />A lighthearted way to explore relationships ! Just enter two names and discover whether it is <br /> <span className='hero-text'>friendship</span> / <span className='hero-text'>love</span> / <span className='hero-text'>attraction</span> / <span className='hero-text'>marriage</span> / <span className='hero-text'>rivalry</span> / <span className='hero-text'>siblinghood</span>. <br /> Remember, it's all for laughs and not to be taken seriously ! Enjoy the playful insights !
                    </p>
                    <br />
                    <Box className='container' sx={{ justifyContent: 'center' }}>
                        <div style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <div>
                                <label htmlFor="name1" className='label'>Enter your Name : </label><br />
                                <input className='form-control form-control-lg' id='name1' type="text" onChange={(e) => { setName1(e.target.value) }} required='true' /><br />
                                <label htmlFor="name2" className='label'>Enter your Crush Name : </label><br />
                                <input className='form-control form-control-lg' id='name2' type="text" onChange={(e) => { setName2(e.target.value) }} required='true' /><br />
                            </div>
                            {name1 !== "" && name2 !== "" && name1.split("").sort().join("")!== name2.split("").sort().join("") &&
                                <div style={{ justifyContent: 'center', gap: '10px', display: 'flex' }}>
                                    <Model name1={name1} name2={name2} />
                                    <button className='btn btn-lg btn-secondary' onClick={handleReset}>Reset</button>
                                </div>
                            }
                        </div>
                    </Box>
                </div>
            ) : <Error />
            }
        </div>
    )
}