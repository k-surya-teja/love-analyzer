import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import { Stack,CircularProgress } from '@mui/material';
import friendsImg from '../images/friends.jpg';
import loversImg from '../images/lovers.jpg';
import attractionImg from '../images/attraction.jpg';
import marriageImg from '../images/marriage.jpg';
import enemiesImg from '../images/enemies.jpg';
import siblingsImg from '../images/siblings.jpg';

export default function History() {

    const [allData, setAllData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8000/userdata');
                if (response.ok) {
                    const data = await response.json();
                    setAllData(data);
                } else {
                    console.error('Failed to fetch data');
                }
            } catch (error) {
                console.error('Error occurred while fetching data:', error);
            }
        };
        fetchData();
    }, []);

    function capitalizer(string){
        return string.charAt(0).toUpperCase()+string.slice(1);
    }

    const getImage = (relation) => {
        switch (relation) {
            case 'friends':
                return friendsImg;
            case 'lovers':
                return loversImg;
            case 'attraction':
                return attractionImg;
            case 'marriage':
                return marriageImg;
            case 'enemies':
                return enemiesImg;
            case 'siblings':
                return siblingsImg;
            default:
                return null;
        }
    };

    const filteredData = allData.filter((item) =>
        item.name1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name2.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
        <div className='container'>
            <br />
            <center>
                <Form.Control type="text" style={{ width: '80%' }} onChange={(e) => {
                    setSearchQuery(e.target.value);
                }} placeholder="Search with name" />
            </center>
            <br />
            </div>
            <div className='container-fluid' style={{minHeight:'88vh'}}>
                <Stack overflowY="auto" direction="row" flexWrap="wrap" justifyContent="center" gap={1.5}>
                    {filteredData.length ? filteredData.reverse().map((item, index) => (
                        <div key={index} style={{minHeight:'9vh',width:'7cm',border:'1px solid white',padding:'10px',borderRadius:'10px',backgroundColor:'white',textAlign:'center'}}>
                            <img src={getImage(item.relation)} alt="nope" width='200px' height='200px' />
                            <h5 className='text'><span className='name'>{capitalizer(item.name1)}</span> and <span className='name'>{capitalizer(item.name2)}</span> are <span className='name'>{capitalizer(item.relation)}</span></h5>
                        </div>
                    )) : <p className='name' style={{textAlign:'center',fontSize:'34px',marginTop:'4cm'}}>Loading...<CircularProgress color='secondary' /></p>}
                </Stack>
            <br /><br />
        </div>
        </>
    );
}
