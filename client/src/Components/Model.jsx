import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import friends from '../images/friends.gif';
import marriage from '../images/marriage.gif';
import enemies from '../images/enemies.gif';
import sisters from '../images/sister.gif';
import attraction from '../images/attraction.gif';
import lovers from '../images/lovers.gif';
import loveMusic from '../images/music.mp3';
import sisterMusic from '../images/sisterMusi.mp3';

export default function Model({ name1, name2 }) {
    const history = useNavigate();

    const flames = [
        { relation: 'friends', gif: friends },
        { relation: 'lovers', gif: lovers, music: loveMusic },
        { relation: 'attraction', gif: attraction },
        { relation: 'marriage', gif: marriage },
        { relation: 'enemies', gif: enemies },
        { relation: 'siblings', gif: sisters, music: sisterMusic }
    ];

    const [data, setData] = useState(flames[0]);
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPosted, setIsPosted] = useState(false);


    name1 = capitalizer(name1);
    name2 = capitalizer(name2);

    const handleClose = () => {
        setShow(false);
        setIsPosted(false);
    };

    const handleShow = () => {
        setShow(true);
        const temp_flames = flames;
        name1 = name1.toLowerCase().trim();
        name2 = name2.toLowerCase().trim();
        let arr = new Array(27).fill(0);
        for (let i = 0; i < name1.length; i++) {
            arr[name1.charCodeAt(i) - 97]++;
        }
        let len = name2.length;
        for (let i = 0; i < name2.length; i++) {
            let index = name2.charCodeAt(i) - 97;
            if (arr[index] > 0) {
                arr[index]--;
                len--;
            }
        }
        for (let i = 0; i < arr.length; i++) {
            len += arr[i];
        }

        let i = 0;
        let n = temp_flames.length;
        while (n > 1) {
            i = (i + len - 1) % n;
            temp_flames.splice(i, 1);
            n--;
        }
        setData(flames[0]);
    };

    function capitalizer(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await fetch('http://localhost:8000/userdata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name1: name1,
                    name2: name2,
                    relation: data.relation
                }),
            });
            setIsLoading(false);
            setIsPosted(true);

            setTimeout(() => {
                history('/history')
            }, 1000)
        } catch (error) {
            console.error('Error Occurred:', error);
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Button size='lg' variant='light' className='post-btn' onClick={handleShow}>
                Check
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                // style={{borderRadius:'10px'}}
                centered
            >
                <div style={{
                    justifyContent: 'center',
                    borderRadius: '10px',
                    background: 'rgb(240,138,182)',
                    background: 'radial-gradient(circle, rgba(240,138,182,1) 0%, rgba(240,251,242,1) 100%)',
                    textAlign: 'center',
                }}>
                    <Modal.Header style={{ border: 'none' }} closeButton />
                    <Modal.Body>
                        <p className='text'><span className='name'>{name1}</span> & <span className='name'>{name2}</span></p>
                        <img src={data.gif} style={{ borderRadius: '10px' }} width='80%' height='auto' alt={data.value} />
                        <p className='name' style={{fontSize:'25px'}}>{capitalizer(data?.relation)}</p>
                        {show && (
                            <audio id="backgroundMusic" autoPlay loop>
                                <source src={data?.music} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                        )}
                    </Modal.Body>
                    <Modal.Footer style={{ border: 'none' }}>
                        {isPosted ? (
                            <p>Data Posted Successfully!</p>
                        ) : (
                            <>
                                <Button variant="secondary" onClick={handleClose}>
                                    Close
                                </Button>
                                <Button variant='light' className='post-btn' onClick={handleSubmit}>
                                    {isLoading ? 'Posting...' : 'Post it'}
                                </Button>
                            </>
                        )}
                    </Modal.Footer>
                </div>
            </Modal>

        </div>
    );
}
