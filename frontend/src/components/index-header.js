import * as React from 'react'
import {Link} from 'react'

import './index-header.css';
import Button from 'react-bootstrap/Button';
import { ConnectKitProvider, ConnectKitButton, getDefaultClient } from "connectkit";
import Badge from 'react-bootstrap/Badge';

function IndexHeader(props) {
    const {routeToPage} = props;
    return (
        <>
            <h4 id="event-header-subtitle">Decent AI</h4>
            <Button id="create-event-but" onClick={() => routeToPage('create')}>Run AI node</Button>{' '}
            <div className="absolute top-0 right-0 p-4">
                <ConnectKitButton />
            </div>
        </>
    );
}

export default IndexHeader