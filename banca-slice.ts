import { createSlice } from "@reduxjs/toolkit";

const bancaList = createSlice({
    name:'bancaList',
    initialState: {
        bancaDetails: {}
    },
    reducers: {
        getBancaData(state, action) {
            state.bancaDetails = action.payload
        }
    }
});

export const bancaListAction = bancaList.actions;

export default bancaList;