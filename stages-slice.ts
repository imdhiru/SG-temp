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
    getStage(state, action) {
      const newStage = action.payload;
      if (!(state.stages.length > 0) && newStage.id !== "setDocumentList" && newStage.id !== "setApplicantList") {
        state.stages.push({
          stageId: newStage.id,
          stageInfo: newStage.formConfig,
        });
      } else if (newStage.id !== "setDocumentList" && newStage.id === "setApplicantList") {
        state.stages[0].stageInfo.applicants =
          newStage.formConfig;
      } else if (
        //Setting document list to store
        newStage.id === "setDocumentList" &&
        newStage.formConfig.applicant_documents &&
        newStage.formConfig.applicant_documents.length > 0
      ) {
        state.stages[0].stageInfo.applicant_documents =
          newStage.formConfig.applicant_documents;
      } else {
        state.stages[0].stageId = newStage.id;
        state.stages[0].stageInfo = newStage.formConfig;
      }
    },
    addMyinfoData(state, action) {
      const myinfoRes = action.payload;
      state.myinfoResponse = myinfoRes.applicants;
      let myinfoMissingFields: any = null;
      state.userInput.missingFields = myinfoMissingFields;
    },
    addIbankingData(state, action) {
      const ibankingRes = action.payload;
      state.ibankingResponse = ibankingRes.applicants;
    },

    modifyStage(state, action) {
      const stageId = action.payload.fieldData;
      const fieldValue = action.payload.isIbanking
        ? state.ibankingResponse[stageId.fieldName + "_a_1"]
        : state.myinfoResponse[stageId.fieldName + "_a_1"];
      if (
        fieldValue === undefined ||
        fieldValue !== stageId.value ||
        stageId.fieldName === "name_of_employer"
      ) {
        state.userInput.applicants[stageId.fieldName + "_a_1"] = stageId.value;
        if (stageId.fieldName === "full_name") {
          state.userInput.applicants["first_name_a_1"] = stageId.value;
        }
      }
    },
    updateTaxToggle(state) {
      state.taxCustom.toggle = !state.taxCustom.toggle;
    },
    updateAddTaxToggle(state) {
      state.taxCustom.addTaxToggle = !state.taxCustom.addTaxToggle;
    },
    removeAddToggleField(state, action) {
      const stageId = action.payload;
      if (Object.keys(state.userInput).length > 0) {
        stageId.removeFields.forEach((remove: string) => {
          delete state.userInput.applicants[remove + "_a_1"];
        });
        stageId.newFields.forEach((add: string) => {
          if (
            state.stages[0].stageId === "ad-1" ||
            add.substr(0, 5) === "alias"
          ) {
            state.userInput.applicants[add + "_a_1"] = state.userInput
              .applicants[add + "_a_1"]
              ? state.userInput.applicants[add + "_a_1"]
              : stageId.value;
          } else {
            const fieldValue =
              stageId.value && typeof stageId.value === "object"
                ? stageId.value[add + "_a_1"]
                : stageId.value;
            state.userInput.applicants[add + "_a_1"] = fieldValue;
          }
        });
      }
      stageId.removeFields.forEach((remove: string) => {
        state.conditionalFields.removedFields[remove] = "";
        delete state.conditionalFields.newFields[remove];
      });
      stageId.newFields.forEach((add: string) => {
        const fieldValue =
          stageId.value && typeof stageId.value === "object"
            ? stageId.value[add + "_a_1"]
            : stageId.value;
        state.conditionalFields.newFields[add] = fieldValue;
      });
    },
    resetNewAndOldFields(state) {
      state.conditionalFields.newFields = {};
      state.conditionalFields.removedFields = {};
    },
    updateStageFields(state, action) {
      const stageId = action.payload;
      state.stages[0] = stageId;
    },
    updateStageId(state, action) {
      const stageId = action.payload;
      state.stages[0].stageId = stageId;
    },
    isPartialMyinfoResponse(state, action) {
      state.myinfoMissingFields = action.payload !== "200" ? true : false;
    },
    isPartialMyinfoResUpdate(state, action) {
      state.myinfoMissingFields = action.payload;
    },
    getMissingFields(state, action) {
      state.myinfoMissingLogicFields = action.payload;
    },
    removeMandatoryFields(state, action) {
      state.userInput.missingFields = action.payload;
    },
    updateUserInputFields(state, action) {
      state.userInput.applicants = action.payload;
    },
    revertMyinfoMandatoryFields(state, action) {
      const stagesData = action.payload;
      state.stages[0].stageInfo.fieldMetaData.data.stages[1].fields =
        stagesData[0].stageInfo.fieldMetaData.data.stages[1].fields.filter(
          (res: any) => res.rwb_category !== "ssf-1"
        );
    },
    resetDefaultValue(state, action) {
      const data = action.payload;
      if (
        JSON.stringify(state.dependencyFields.workType) !== JSON.stringify(data)
      ) {
        state.dependencyFields.workType = data;
      }
    },
    resetCurrentStage(state, action) {
      state.currentStage = action.payload;
    },
    setJourneyType(state, action) {
      state.journeyType = action.payload;
    },
    setOtpShow(state, action) {
      state.otpOpen = action.payload;
    },
    setOtpTrigger(state, action) {
      state.otpTrigger = action.payload;
    },
    setOtpResume(state, action) {
      state.otpResume = action.payload;
    },
    setOTPSuccessForThankYou(state, action) {
      state.otpSuccess = action.payload;
    },
    updateProductDetails(state, action) {
      state.stages[0].stageInfo.products[0] = action.payload;
    },
    updateTaxFields(state, action) {
      if (action.payload) {
        let i = 1;
        while (i < 5) {
          const CountyTaxValue =
            action.payload[`country_of_tax_residence_${i}_a_1`];
          const tinValue = action.payload[`tax_id_no_${i}_a_1`];
          const crsReasonCodeValue = action.payload[`crs_reason_code_${i}_a_1`];
          const crsCommentValue = action.payload[`crs_comments_${i}_a_1`];
          if (CountyTaxValue) {
            state.userInput.applicants[`country_of_tax_residence_${i}_a_1`] =
              CountyTaxValue;
          }
          if (tinValue) {
            state.userInput.applicants[`tax_id_no_${i}_a_1`] = tinValue;
          }
          if (crsReasonCodeValue) {
            state.userInput.applicants[`crs_reason_code_${i}_a_1`] =
              crsReasonCodeValue;
          }
          if (crsCommentValue) {
            state.userInput.applicants[`crs_comments_${i}_a_1`] =
              crsCommentValue;
          }
          i++;
        }
      }
    },
    updateLastStageInput(state, action) {
      const stageId = action.payload;
      if (Object.keys(state.userInput).length > 0) {
        const obj = {
          stageId: stageId,
          applicants: state.userInput.applicants,
        };
        const isStageExits = state.updatedStageInputs.findIndex(
          (ref: any) => ref && ref.stageId === obj.stageId
        );
        if (isStageExits > -1) {
          state.updatedStageInputs[isStageExits] = obj;
        } else {
          state.updatedStageInputs.push(obj);
        }
      }
    },
    deleteStageInput(state) {
      if (Object.keys(state.updatedStageInputs).length > 0) {
        const isStageExits = state.updatedStageInputs.findIndex(
          (ref: any) => ref.stageId === "ssf-2"
        );
        if (isStageExits > -1) {
          delete state.updatedStageInputs[isStageExits];
        }
      }
    },
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
    setIsDocument(state, action){
      state.isDocument = action.payload;
    },
    setIsDocumentUpload(state, action){
      state.isDocumentUpload = action.payload;
    },
    setLastStageId(state, action) {
      state.lastStageId = action.payload;
    },
    setCCPLChannel(state, action) { 
      state.ccplChannel = action.payload;
    }
  },
});

export const stagesAction = stages.actions;

export default stages;