import Web3 from 'web3';
import axios from 'axios';

import { INIT_WEB3 } from './types';

export const initWeb3 = () => dispatch => {
    const web3 = new Web3('http://localhost:8545');
    let accounts;
    let addresses;
    let postsContract;
    web3.eth.getAccounts()
    .then(_accounts => {
        accounts = _accounts;
        return axios.get('http://localhost:8000/assets/contracts.json');
    })
    .then(response => {
        addresses = response.data;
        return axios.get('http://localhost:8000/assets/abi/Posts.json');
    })
    .then(response => {
        const postsContractAbi = response.data.abi;
        postsContract = web3.eth.Contract(
            postsContractAbi,
            addresses.posts,
        );
        dispatch({
            type: INIT_WEB3,
            web3: web3,
            account: accounts[0],
            accounts: accounts,
            addresses: addresses,
            postsContract: postsContract
        });
    })
    .catch(console.error);
}