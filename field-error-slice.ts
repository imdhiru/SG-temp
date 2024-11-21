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



import fieldErrorReducer, { fieldErrorAction } from './fieldError';

describe('fieldError slice', () => {

  // Test Initial State
  it('should return the initial state', () => {
    expect(fieldErrorReducer(undefined, { type: undefined })).toEqual({
      error: {},
      mandatoryFields: [],
    });
  });

  // Test getFieldError Reducer
  it('should handle getFieldError', () => {
    const previousState = { error: {}, mandatoryFields: [] };
    const payload = { fieldName: 'name' };

    expect(fieldErrorReducer(previousState, fieldErrorAction.getFieldError(payload)))
      .toEqual({ error: 'name', mandatoryFields: [] });
    
    // Test when newError is undefined
    expect(fieldErrorReducer(previousState, fieldErrorAction.getFieldError(null)))
      .toEqual({ error: {}, mandatoryFields: [] });
  });

  // Test removeToggleFieldError Reducer
  it('should handle removeToggleFieldError', () => {
    const previousState = { error: { name: 'error' }, mandatoryFields: [] };
    const payload = ['name'];

    expect(fieldErrorReducer(previousState, fieldErrorAction.removeToggleFieldError(payload)))
      .toEqual({ error: {}, mandatoryFields: [] });

    // Test when state.error is empty
    const previousState2 = { error: {}, mandatoryFields: [] };
    expect(fieldErrorReducer(previousState2, fieldErrorAction.removeToggleFieldError(payload)))
      .toEqual({ error: {}, mandatoryFields: [] });
  });

  // Test getMandatoryFields Reducer
  it('should handle getMandatoryFields', () => {
    const previousState = { error: {}, mandatoryFields: [] };
    const payload = ['field1', 'field2'];

    expect(fieldErrorReducer(previousState, fieldErrorAction.getMandatoryFields(payload)))
      .toEqual({ error: {}, mandatoryFields: ['field1', 'field2'] });

    // Test when state.mandatoryFields already has values
    const previousState2 = { error: {}, mandatoryFields: ['field1'] };
    expect(fieldErrorReducer(previousState2, fieldErrorAction.getMandatoryFields(['field2', 'field3'])))
      .toEqual({ error: {}, mandatoryFields: ['field1', 'field2', 'field3'] });

    // Test when payload is empty or null
    expect(fieldErrorReducer(previousState2, fieldErrorAction.getMandatoryFields(null)))
      .toEqual({ error: {}, mandatoryFields: null });
  });

  // Test updateMandatoryFields Reducer
  it('should handle updateMandatoryFields', () => {
    const previousState = { error: {}, mandatoryFields: ['field1'] };
    const payload = ['field2', 'field3'];

    expect(fieldErrorReducer(previousState, fieldErrorAction.updateMandatoryFields(payload)))
      .toEqual({ error: {}, mandatoryFields: ['field1', 'field2', 'field3'] });

    // Test when mandatoryFields is empty
    const previousState2 = { error: {}, mandatoryFields: [] };
    expect(fieldErrorReducer(previousState2, fieldErrorAction.updateMandatoryFields(['field4'])))
      .toEqual({ error: {}, mandatoryFields: ['field4'] });
  });

  // Test removeMandatoryFields Reducer
  it('should handle removeMandatoryFields', () => {
    const previousState = { error: {}, mandatoryFields: ['field1', 'field2', 'field3'] };
    const payload = ['field2'];

    expect(fieldErrorReducer(previousState, fieldErrorAction.removeMandatoryFields(payload)))
      .toEqual({ error: {}, mandatoryFields: ['field1', 'field3'] });

    // Test when mandatoryFields are empty
    const previousState2 = { error: {}, mandatoryFields: ['field1'] };
    expect(fieldErrorReducer(previousState2, fieldErrorAction.removeMandatoryFields(['field1'])))
      .toEqual({ error: {}, mandatoryFields: [] });
  });

});

