import axios from 'axios';
import { put, takeLatest, call } from 'redux-saga/effects';
import Web3 from 'web3';

import {INIT_WEB3, INIT_WEB3_SUCCESS} from "actions/types";

const contractNames = [
  'Posts',
  'Comments',
  'PostVotes',
  'CommentVotes',
];

async function collectAbis() {
  const responses = await Promise.all(
    contractNames.map(async c => await axios.get(`http://localhost:8000/assets/abi/${c}.json`))
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        postVotesContract: contracts['PostVotes'],
        commentVotesContract: contracts['CommentVotes'],
      }
    })
  } catch (error) {
    console.error(error);
  }
}

export function* watchInitWeb3() {
  yield takeLatest(INIT_WEB3, initWeb3Context);
}
