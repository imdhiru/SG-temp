import { createSlice } from "@reduxjs/toolkit";
import { KeyWithAnyModel } from "../model/common-model";

const initialState: {lov:Array<KeyWithAnyModel>} = {
    lov: []
}

const lov = createSlice({
    name: 'lov',
    initialState: initialState,
    reducers: {
        getLovData(state, action) {
            const newStage = action.payload;
            const existingStages = state.lov.find((item: KeyWithAnyModel) => item.label === newStage.label);
            if (!existingStages) {
                state.lov.push({
                    label: newStage.label,
                    value: newStage.value
                })
            }
        }
    }
});

export const lovAction = lov.actions;

export default lov;