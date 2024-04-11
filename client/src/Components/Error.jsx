import React from 'react';
import { WifiOff } from '@mui/icons-material';

export default function Error(){
    return(
        <div style={{minHeight:'70vh'}}>
            <h2 className='name' style={{marginTop:'4cm',fontSize:'25px'}}>You are Offline <WifiOff/></h2>
        </div>
    )
}