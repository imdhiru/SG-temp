import { combineReducers, configureStore } from '@reduxjs/toolkit';
import auth from './auth-slice';
import error from './error-slice';
import fieldError from './field-error-slice';
import loader from './loader-slice';
import logout from './logout-slice';
import lov from './lov-slice';
import stages from './stages-slice';
import urlParam from './urlparam-slice';
import valueUpdate from './value-update-slice';
import tax from './tax-slice';
import documentUploadList from './document-slice';
import bancaList from './banca-slice';
import authorize from './authorize-slice';
import alias from './alias-slice';
import lastAccessed from './last-accessed-slice';
import otp from './otp-slice';
import trustBank from './trust-bank-slice';
import rate from './rate-slice';
import postalCode from './postal-code'
import pendingApplication from './pending-application-slice';
import applicants from './applicants-slice';
import stepCount from './step-count-slice';
import token from './token-slice';
import referralcode from './referral-code-slice';

const combinedReducer = combineReducers({
  auth: auth.reducer,
  stages: stages.reducer,
  loader: loader.reducer,
  error: error.reducer,
  lov: lov.reducer,
  valueUpdate: valueUpdate.reducer,
  fielderror: fieldError.reducer,
  logout: logout.reducer,
  urlParam: urlParam.reducer,
  tax: tax.reducer,
  documentUploadList : documentUploadList.reducer,
  bancaList : bancaList.reducer,
  authorize: authorize.reducer,
  alias: alias.reducer,
  lastAccessed: lastAccessed.reducer,
  otp: otp.reducer,
  trustBank: trustBank.reducer,
  rate: rate.reducer,
  postalCode: postalCode.reducer,
  pendingApplication: pendingApplication.reducer,
  applicants: applicants.reducer,
  stepCount: stepCount.reducer,
  token: token.reducer,
  referralcode:referralcode.reducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'logout/sessionLogout') { // check for action type 
    state = undefined;
  }
  return combinedReducer(state, action);
};


export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.REACT_APP_REDUX_TOOLKIT === 'true'
})


export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch;
