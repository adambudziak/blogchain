import Web3 from 'web3';
import axios from 'axios';

import { INIT_WEB3 } from './types';
import {Dispatch} from "redux";

async function collectAbis() {
    const contracts = [
        'Posts',
        'Comments',
        'Upvotes',
        'Downvotes',
    ];
    const responses = await Promise.all(
        contracts.map(async c => await axios.get(`http://localhost:8000/assets/abi/${c}.json`))
        );
    const abis: any = {};
    responses.forEach((r, i) => abis[contracts[i]] = r.data.abi);
    return abis;
}

export const initWeb3 = () => (dispatch: Dispatch) => {
    const web3 = new Web3('http://localhost:8545');
    let accounts: string[];
    let addresses;
    web3.eth.getAccounts()
    .then(_accounts => {
        accounts = _accounts;
        return axios.get('http://localhost:8000/assets/contracts.json');
    })
    .then(async response => {
        addresses = response.data;
        const abis = await collectAbis();
        const postsContract = new web3.eth.Contract(
            abis['Posts'],
            addresses.Posts,
        );
        const commentsContract = new web3.eth.Contract(
            abis['Comments'],
            addresses.Comments
        );
        const upvotesContract = new web3.eth.Contract(
            abis['Upvotes'],
            addresses.Upvotes,
        );
        const downvotesContract = new web3.eth.Contract(
            abis['Downvotes'],
            addresses.Downvotes
        );
        dispatch({
            type: INIT_WEB3,
            web3: web3,
            account: accounts[0],
            accounts,
            addresses,
            postsContract,
            commentsContract,
            upvotesContract,
            downvotesContract,
        });
    })
    .catch(console.error);
};
