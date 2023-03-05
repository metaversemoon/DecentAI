import * as React from 'react'
import {Link} from 'react'

import './index-header.css';
import Button from 'react-bootstrap/Button';
import { ConnectKitProvider, ConnectKitButton, getDefaultClient } from "connectkit";
import Badge from 'react-bootstrap/Badge';

function IndexHeader(props) {
    const {routeToPage, gaslessConnected} = props;

    const show = () => {

    }

    const hide = () => {

    }

    const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;

    const truncateEthAddress = (address) => {
        const match = address.match(truncateRegex);
        if (!match) return address;
        return `${match[1]}…${match[2]}`;
      };

    return (

        <>
            <h4 id="event-header-subtitle">Decent AI</h4>
            <Button id="create-event-but" onClick={() => routeToPage('create')}>Run AI node</Button>{' '}
            <Button id="create-event-but" >{truncateEthAddress(localStorage.getItem('gasless_address'))}</Button>{' '}

            <div className="absolute top-0 right-0 p-4">
                {/* <ConnectKitButton.Custom 
                isConnected={gaslessConnected} 
                address={localStorage.getItem('gasless_address')} 
                ensName=''
                isConnecting={false}
                show={show}
                hide={hide} /> */}
            </div>
        </>
    );
}

export default IndexHeader