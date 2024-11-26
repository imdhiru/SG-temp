describe("Stages Slice", () => {
  let initialState: StageSliceModel;

  beforeEach(() => {
    initialState = {
      stages: [],
      myinfoResponse: {},
      ibankingResponse: {},
      userInput: {
        applicants: {},
        missingFields: {},
      },
      updatedStageInputs: [],
      taxCustom: {
        toggle: false,
        addTaxToggle: false,
      },
      conditionalFields: {
        newFields: {},
        removedFields: {},
      },
      myinfoMissingFields: null,
      myinfoMissingLogicFields: null,
      dependencyFields: {
        workType: null,
      },
      currentStage: null,
      journeyType: null,
      otpOpen: false,
      otpTrigger: true,
      otpResume: false,
      isDocument: false,
      lastStageId: null,
      otpSuccess: false,
      isDocumentUpload: false,
      ccplChannel: null,
    };
  });

  describe("mergeLastStageInputs", () => {
    it("should merge userInput.applicants into updatedStageInputs when stage exists and applicants are non-empty", () => {
      initialState.updatedStageInputs = [
        { stageId: "mock-stage-id", applicants: { name: "John" } },
      ];
      initialState.userInput.applicants = { name: "Doe", age: 30 };

      const action = stagesAction.mergeLastStageInputs("mock-stage-id");
      const state = stagesReducer(initialState, action);

      expect(state.updatedStageInputs[0].applicants).toEqual({
        name: "Doe",
        age: 30,
      });
      expect(state.userInput.applicants).toEqual({});
    });

    it("should copy applicants from updatedStageInputs to userInput when stage exists and applicants are empty", () => {
      initialState.updatedStageInputs = [
        { stageId: "mock-stage-id", applicants: { name: "John" } },
      ];
      initialState.userInput.applicants = {};

      const action = stagesAction.mergeLastStageInputs("mock-stage-id");
      const state = stagesReducer(initialState, action);

      expect(state.userInput.applicants).toEqual({ name: "John" });
    });

    it("should clear userInput.applicants when stage does not exist", () => {
      initialState.updatedStageInputs = [
        { stageId: "other-stage-id", applicants: { name: "John" } },
      ];
      initialState.userInput.applicants = { name: "Doe", age: 30 };

      const action = stagesAction.mergeLastStageInputs("mock-stage-id");
      const state = stagesReducer(initialState, action);

      expect(state.userInput.applicants).toEqual({});
    });
  });

  describe("mergeBasicInputs", () => {
    it("should merge applicants correctly when account_currency_9_a_1 is not set", () => {
      initialState.updatedStageInputs = [
        {
          stageId: "ssf-1",
          applicants: { account_currency_9_a_1: "USD", otherField: "value" },
        },
      ];
      initialState.userInput.applicants = {};

      const action = stagesAction.mergeBasicInputs();
      const state = stagesReducer(initialState, action);

      expect(state.updatedStageInputs[0].applicants).not.toHaveProperty(
        "account_currency_9_a_1"
      );
      expect(state.userInput.applicants).toEqual({
        otherField: "value",
      });
    });

    it("should update applicants when account_currency_9_a_1 differs", () => {
      initialState.updatedStageInputs = [
        {
          stageId: "ssf-1",
          applicants: { account_currency_9_a_1: "USD", otherField: "value" },
        },
      ];
      initialState.userInput.applicants = { account_currency_9_a_1: "SGD" };

      const action = stagesAction.mergeBasicInputs();
      const state = stagesReducer(initialState, action);

      expect(state.updatedStageInputs[0].applicants.account_currency_9_a_1).toBe(
        "SGD"
      );
      expect(state.userInput.applicants).toEqual({
        account_currency_9_a_1: "SGD",
        otherField: "value",
      });
    });

    it("should handle multiple stages and merge applicants accordingly", () => {
      initialState.updatedStageInputs = [
        {
          stageId: "ssf-1",
          applicants: { account_currency_9_a_1: "USD", fieldA: "valueA" },
        },
        {
          stageId: "ssf-2",
          applicants: { fieldB: "valueB" },
        },
      ];
      initialState.userInput.applicants = { account_currency_9_a_1: "SGD" };

      const action = stagesAction.mergeBasicInputs();
      const state = stagesReducer(initialState, action);

      expect(state.updatedStageInputs[0].applicants.account_currency_9_a_1).toBe(
        "SGD"
      );
      expect(state.userInput.applicants).toEqual({
        account_currency_9_a_1: "SGD",
        fieldA: "valueA",
        fieldB: "valueB",
      });
    });
  });
});

..................



import { createSlice } from "@reduxjs/toolkit";
import { StageSliceModel} from "../model/common-model"; 

const initialState: StageSliceModel = {
    stages: [],
    myinfoResponse: {},
    ibankingResponse: {},
    userInput: {
        applicants: {},
        missingFields: {}
    },
    updatedStageInputs: [],

    taxCustom: {
        toggle: false,
        addTaxToggle: false
    },
    conditionalFields: {
        newFields: {},
        removedFields: {}
    },
    myinfoMissingFields: null,
    myinfoMissingLogicFields: null,
    dependencyFields: {
        workType: null
    },
    currentStage: null,
    journeyType: null,
    otpOpen: false,
    otpTrigger: true, 
    otpResume: false,   
    isDocument : false,
    lastStageId: null,
    otpSuccess: false,
    isDocumentUpload:false,
    ccplChannel: null
}
const stages = createSlice({
  name: "stages",
  initialState,
  reducers: {
   
   
    mergeLastStageInputs(state, action) {
      const stageIndex = state.updatedStageInputs.findIndex(
        (ref: any) => ref && ref.stageId === action.payload
      );
      if (stageIndex > -1 && Object.keys(state.userInput.applicants).length > 0) {
        for (let key in state.userInput.applicants) {
          if (
            state.userInput.applicants[key] !==
            state.updatedStageInputs[stageIndex].applicants[key]
          ) {
            state.updatedStageInputs[stageIndex].applicants[key] =
              state.userInput.applicants[key];
          }
        }
        state.userInput.applicants = {};
      } else if(stageIndex > -1) {
        state.userInput.applicants = {};
        state.userInput.applicants = state.updatedStageInputs[stageIndex].applicants;
      } else {
        state.userInput.applicants = {};
      }
      // state.userInput.applicants = {};
    },
    mergeBasicInputs(state) {
      const stageIds = ["ssf-1", "ssf-2"];
      let isAccount_currency = false;
      stageIds.forEach((stage: string) => {
        const stageApplicant = state.updatedStageInputs.find(
          (ref: any) => ref && ref.stageId === stage
        );
        if (!state.userInput.applicants["account_currency_9_a_1"]) {
          if (stageApplicant) {
            isAccount_currency = true;
            delete stageApplicant.applicants["account_currency_9_a_1"];
          }
          delete state.userInput.applicants["account_currency_9_a_1"];
        } else if (
          stageApplicant &&
          state.userInput.applicants["account_currency_9_a_1"] !==
            stageApplicant.applicants["account_currency_9_a_1"]
        ) {
          stageApplicant.applicants["account_currency_9_a_1"] =
            state.userInput.applicants["account_currency_9_a_1"];
        }
        if (stageApplicant && !isAccount_currency) {
          state.userInput.applicants = {
            ...state.userInput.applicants,
            ...stageApplicant.applicants,
          };
        }
      });
    },
    
  },
});

export const stagesAction = stages.actions;

export default stages;




