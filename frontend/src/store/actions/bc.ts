import Web3 from 'web3';
import axios from 'axios';

import { INIT_WEB3 } from './types';
import {Dispatch} from "redux";
const contractNames = [
    'Posts',
    'Comments',
    'Upvotes',
    'Downvotes',
];

async function collectAbis() {
    const responses = await Promise.all(
        contractNames.map(async c => await axios.get(`http://localhost:8000/assets/abi/${c}.json`))
        );
    const abis: any = {};
    responses.forEach((r, i) => abis[contractNames[i]] = r.data.abi);
    return abis;
}

export const initWeb3 = (dispatch: Dispatch) => {
    const web3 = new Web3('http://localhost:8545');
    let accounts: string[];
    let addresses: {[name: string]: string};
    web3.eth.getAccounts()
    .then(_accounts => {
        accounts = _accounts;
        return axios.get('http://localhost:8000/assets/contracts.json');
    })
    .then(async response => {
        addresses = response.data;
        console.log(addresses);
        const abis = await collectAbis();
        const contracts: any = {};
        contractNames.forEach(
            name => contracts[name] = new web3.eth.Contract(abis[name], addresses[name])
        );

        dispatch({
            type: INIT_WEB3,
            web3Context: {
                web3: web3,
                account: accounts[0],
                accounts,
                addresses,
                postsContract: contracts['Posts'],
                commentsContract: contracts['Comments'],
                upvotesContract: contracts['Upvotes'],
                downvotesContract: contracts['Downvotes'],
            }
        });
    })
    .catch(console.error);
};
