import { put, takeLatest, call } from 'redux-saga/effects';
import Web3 from 'web3';
import axios from 'axios';
import {INIT_WEB3_SUCCESS} from "../actions/types";

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

const getContractAddresses = () => {
    return axios.get('http://localhost:8000/assets/contracts.json')   ;
};

function* initWeb3Context() {
    const web3 = new Web3('http://localhost:8545');
    try {
        const accounts = yield call(web3.eth.getAccounts);
        const addresses: {[name: string]: string} = (yield call(getContractAddresses)).data;
        const abis = yield call(collectAbis);
        const contracts: any = {};
        contractNames.forEach(
            name => contracts[name] = new web3.eth.Contract(abis[name], addresses[name])
        );

        yield put({
            type: INIT_WEB3_SUCCESS,
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
        })
    } catch (error) {
        console.error(error);
    }
}

export function* watchInitWeb3() {
    yield takeLatest('INIT_WEB3', initWeb3Context);
}