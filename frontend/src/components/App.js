import React, { useEffect } from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";
import Button from 'react-bootstrap/Button';

import './App.css';

import {Component, useState} from 'react'
import {WagmiConfig, createClient, chain} from "wagmi";

import {useAccount} from 'wagmi'

import {ConnectKitProvider, ConnectKitButton, getDefaultClient} from "connectkit";
import styled from 'styled-components'
import IndexHeader from './index-header'

import NodeList from "./node-list";
import Result from "./result";

import {GaslessOnboarding} from '@gelatonetwork/gasless-onboarding'
import { GaslessWalletConfig, LoginConfig} from '@gelatonetwork/gasless-onboarding'
import OutputList from "./output-list";
import { getNodesCount } from "../utils/inferenceHelpers";

const alchemyId = process.env.ALCHEMY_ID;

const chains = [chain.polygon];

const client = createClient(
    getDefaultClient({
        appName: "Decent AI",
        alchemyId,
        chains
    }),
);

const HeaderTitle = styled.p`

font-family: 'Satoshi';
font-style: normal;
font-weight: 700;
font-size: 65px;
line-height: 100%;

margin-top: 80px;
letter-spacing: -0.04em;

`

const TypePropmtTitle = styled.p`

font-family: 'Satoshi';
font-style: normal;
font-weight: 500;
font-size: 30px;
line-height: 100%;
/* identical to box height, or 96px */

text-align: center;
letter-spacing: -0.04em;

margin-top: 120px;

`

class App extends Component {
    constructor(props) {
        super();
        this.state = {
           page: 'home'
        }
        
    }
    componentDidMount(){
    
    }

    routeToPage = (page, data) => {
        console.log("btn clicked")
        this.setState({
            page: page,
            pageData: data
        })

    };


    render() {


        return (
            <div className="App">
                <header className="App-header">
                    <WagmiConfig client={client}>
                        <ConnectKitProvider>
                        {this.state.page === 'home' ? <Content routeToPage={this.routeToPage}></Content> : ''}
                        {this.state.page === 'start' ? <NodeList routeToPage={this.routeToPage}
                                                                         text={this.state.pageData}></NodeList> : ''}
                        {this.state.page === 'result' ? <Result routeToPage={this.routeToPage}
                                                                         requestId={this.state.pageData}></Result> : ''}
                        {this.state.page === 'rate' ? <OutputList routeToPage={this.routeToPage} ></OutputList> : ''}

                           
                        </ConnectKitProvider>
                    </WagmiConfig>
                </header>
            </div>
        );
    }
}

const Content = (props) => {
    const {isConnected} = useAccount()
    const [action, setAction] = useState('');
    const {routeToPage} = props;

    const [gaslessConnected, setGaslessConnected] = useState(localStorage.getItem('gasless_connected') == 'true')
    const [gaslessWalletStatus, setGaslessWalletStatus] = useState('Checking wallet...')

    const [nodeCount, setNodeCount] = useState(0)

    var text = ''

    // if (!isConnected) {
    //     return <ConnectKitButton/>
    // }

    console.log('connected' + gaslessConnected)
    let loginConfig = {
        chain: {
            id: 84531,
            rpcUrl: "https://goerli.base.org"
        },
        domains: [
            'http://localhost:3000'
        ]

    }
    let walletConfig = {
        apiKey: '3vA3QjzNh9099IAw5VA_wlGaNpGSf2rDh_tfhtt4alY_'
    }
    let gaslessWallet = new GaslessOnboarding(loginConfig, walletConfig)

    window.gaslessWallet = gaslessWallet

    const checkGaslessWalletConnect = async () => {
       
        await gaslessWallet.init()
        let provider = gaslessWallet.getProvider()
        if (provider != null) {
            setGaslessConnected(true)
            localStorage.setItem('gasless_connected', true)
            localStorage.setItem('gasless_address', gaslessWallet.getGaslessWallet().getAddress())
        } else {
            setGaslessWalletStatus('Connect wallet')
        }
    }

    const connectWallet = async () => {
        await gaslessWallet.init()
        await gaslessWallet.login()
        checkGaslessWalletConnect()
    }

    const getNodeCount = async () => {
        let nodeCount = await getNodesCount()
        setNodeCount(nodeCount)
    }
    
    useEffect(() => {
        checkGaslessWalletConnect()
      }, []);

      useEffect(() => {
        getNodeCount()
      }, []);


    return <>

      <div style={{display: 'flex', flexDirection: 'column', width: '100%', height: '100%', top: '0px'}}>

     
        <div style={{display: 'flex', flexDirection: 'column', zIndex: 100}}>
        <IndexHeader routeToPage={routeToPage} gaslessConnected={gaslessConnected} ></IndexHeader>
            <HeaderTitle>Create AI images in a decentralised way </HeaderTitle>
        </div>

        <img style={{width: '100%', height: '350px', position: 'absolute', top: '0px', zIndex: 0}} src="/images/header-background.png"></img>

        {gaslessConnected && 
        <>
            <TypePropmtTitle>Start by typing a prompt</TypePropmtTitle>

            <input className="Prompt-Input" placeholder="Type a prompt"
                onChange={(evt) => { text = evt.target.value }} ></input>

            <Button id="start-button" onClick={() => routeToPage('start', text)}>Generate now</Button>{' '}

        </>
        }
        {
            !gaslessConnected && 
            <Button id="start-button" onClick={() => connectWallet()}>{gaslessWalletStatus}</Button>

        }

        {nodeCount > 0 && <TypePropmtTitle style={{marginTop: '0px', paddingTop: '18px', fontSize: '20px'}}>{nodeCount} nodes online</TypePropmtTitle>}
        </div>

    </>
}

export default App


