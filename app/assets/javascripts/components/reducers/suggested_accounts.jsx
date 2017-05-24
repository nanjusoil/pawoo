import {
  FOLLOWERS_FETCH_SUCCESS,
  FOLLOWERS_EXPAND_SUCCESS,
  FOLLOWING_FETCH_SUCCESS,
  FOLLOWING_EXPAND_SUCCESS,
  FOLLOW_REQUESTS_FETCH_SUCCESS,
  FOLLOW_REQUESTS_EXPAND_SUCCESS,
  FOLLOW_REQUEST_AUTHORIZE_SUCCESS,
  FOLLOW_REQUEST_REJECT_SUCCESS,
} from '../actions/accounts';
import {
  SUGGESTED_ACCOUNTS_FETCH_SUCCESS,
  SUGGESTED_ACCOUNTS_EXPAND_SUCCESS
} from '../actions/suggested_accounts';
import {
  REBLOGS_FETCH_SUCCESS,
  FAVOURITES_FETCH_SUCCESS
} from '../actions/interactions';
import {
  BLOCKS_FETCH_SUCCESS,
  BLOCKS_EXPAND_SUCCESS
} from '../actions/blocks';
import {
  MUTES_FETCH_SUCCESS,
  MUTES_EXPAND_SUCCESS
} from '../actions/mutes';
import Immutable from 'immutable';

const normalizeAccount = (state, account) => state.set(account.id, Immutable.fromJS(account));

const normalizeAccounts = (state, accounts) => {
  accounts.forEach(account => {
    state = normalizeAccount(state, account);
  });

  return state;
};

const initialState = Immutable.Map();

export default function userLists(state = initialState, action) {
  switch(action.type) {
  case SUGGESTED_ACCOUNTS_FETCH_SUCCESS:
  case SUGGESTED_ACCOUNTS_EXPAND_SUCCESS:
    return normalizeAccounts(state, action.accounts);
  default:
    return state;
  }
};
