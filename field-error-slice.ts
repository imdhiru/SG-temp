import { createSlice } from "@reduxjs/toolkit";

const initialState: any = {
    error: {},
    mandatoryFields: []
}

const fieldError = createSlice({
    name: 'fielderror',
    initialState: initialState,
    reducers: {
        getFieldError(state, action) {
            const newError = action.payload;
            // state.error = newError.fieldName
            if (newError) {
                state.error = newError.fieldName
            } else {
                state.error = {};
            }
        },
        removeToggleFieldError(state, action) {
            const s = action.payload;

            if (state.error) {
                s.forEach((data: any) => {
                    const position = Object.keys(state.error).indexOf(data);
                    if (position >= 0) {
                        state.error.splice(position, 1);
                    }
                })                
            }
        },
        getMandatoryFields(state, action) {
            if (action.payload) {
                if (state.mandatoryFields && state.mandatoryFields.length > 0) {
                    action.payload.forEach((item:string) => {
                        if(!(state.mandatoryFields.includes(item))) {
                            state.mandatoryFields = state.mandatoryFields.concat(item)
                        }
                    });
                } else {
                    state.mandatoryFields = action.payload;
                }
            } else {
                state.mandatoryFields = null;
            }
        },
        updateMandatoryFields(state, action) {
            if (action.payload) {
                if (state.mandatoryFields && state.mandatoryFields.length > 0) {
                    action.payload.forEach((item:string) => {
                        if(!(state.mandatoryFields.includes(item))) {
                            state.mandatoryFields = state.mandatoryFields.concat(item)
                        }
                    });
                } else {
                    state.mandatoryFields = action.payload;
                }
            }
        },
        removeMandatoryFields(state, action) {
            const nonMandatoryField = action.payload;

            if (state.mandatoryFields) {
                nonMandatoryField.forEach((data: string) => {
                    const position = Object.values(state.mandatoryFields).indexOf(data);
                    if (position >= 0) {
                        state.mandatoryFields.splice(position, 1);
                    }
                })                
            }
        }
    }
});

export const fieldErrorAction = fieldError.actions;

export default fieldError;