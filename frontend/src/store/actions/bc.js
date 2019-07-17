import Web3 from 'web3';
import axios from 'axios';

import { INIT_WEB3 } from './types';

async function collectAbis() {
    const contracts = [
        'Posts',
        'Comments',
    ];
    const responses = await Promise.all(
        contracts.map(async c => await axios.get(`http://localhost:8000/assets/abi/${c}.json`))
        );
    const abis = {};
    responses.forEach((r, i) => abis[contracts[i]] = r.data.abi);
    return abis;
}

export const initWeb3 = () => dispatch => {
    const web3 = new Web3('http://localhost:8545');
    let accounts;
    let addresses;
    let postsContract;
    let commentsContract;
    web3.eth.getAccounts()
    .then(_accounts => {
        accounts = _accounts;
        return axios.get('http://localhost:8000/assets/contracts.json');
    })
    .then(async response => {
        addresses = response.data;
        const abis = await collectAbis();
        postsContract = web3.eth.Contract(
            abis['Posts'],
            addresses.Posts,
        );
        commentsContract = web3.eth.Contract(
            abis['Comments'],
            addresses.Comments
        )
        dispatch({
            type: INIT_WEB3,
            web3: web3,
            account: accounts[0],
            accounts: accounts,
            addresses: addresses,
            postsContract: postsContract,
            commentsContract: commentsContract,
        });
    })
    .catch(console.error);
}