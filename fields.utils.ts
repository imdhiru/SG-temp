import {
  AppDispatch,
  postRequest,
  isFormUpdate,
  preserveRequest,
  getLovData,
  getProductCategory,
} from "../../../services/common-service";
import {
  authenticateType,
  FindIndex,
  getUrl,
} from "../../../utils/common/change.utils";
import { CONSTANTS } from "../../../utils/common/constants";
import {
  FieldSetGroupModel,
  KeyWithAnyModel,
  StageDetails,
  StageFieldModel,
  ValueSelectModel,
} from "../../../utils/model/common-model";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { stagesAction } from "../../../utils/store/stages-slice";
import Rules_bd_1 from "../../rules/rules_bd-1";
import Rules_bd_2 from "../../rules/rules_bd-2";
import RulesSSF from "../../rules/rules_ssf-1";
import RulesSSFTwo from "../../rules/rules_ssf-2";
import Rules_ad_1 from "../../rules/rules_ad-1";
import Rules_ad_2 from "../../rules/rules_ad-2";
import Rules_acd from "../../rules/rules_acd";
import { nextStage } from "./stage.utils";
import { PAYLOAD_CONSTANTS } from "./constants";
import Rules_bd_3 from "../../rules/rules_bd-3";
import { store } from "../../../utils/store/store";
import { errorAction } from "../../../utils/store/error-slice";
import { ValueUpdateAction } from "../../../utils/store/value-update-slice";
import { StepCountAction } from "../../../utils/store/step-count-slice";

/**
 * The method used to filter the response based on stages and forming the grouping for page level
 * @param stageSelector Initial response
 * @param stageId current stageId
 * @returns
 */
export const stageFields = (
  stageSelector: Array<StageDetails>,
  stageId: string,
  myinfoMissingFields?: any,
  other?: string | undefined
) => {
  let stageFieldsValues: Array<StageFieldModel> = [];
  if (
    stageSelector &&
    stageSelector[0].stageInfo &&
    stageSelector[0].stageInfo.fieldmetadata &&
    stageSelector[0].stageInfo.fieldmetadata.data.stages
  ) {
    let currentStage;
    if(stageId === "ssf-1" && authenticateType() !== "myinfo" && authenticateType() !== "manual"){
      currentStage= [stageId, CONSTANTS.STAGE_NAMES.SSF_2]
    }
    else if(stageId === "ssf-1" || stageId === "bd-2" || stageId ==='bd-3' && authenticateType()== "manual"){
      currentStage= ['bd'];
    }
    else if(stageId === 'doc' && authenticateType()==='manual'){
      currentStage = ['setDocumentList']
    }
    else if(stageId === "ad-2" && authenticateType()== "manual"){
      currentStage= ['ad'];
    }
    else{
      currentStage= [stageId];
    }
// let currentStage =
    // stageId === "ssf-1" && authenticateType() !== "myinfo" && authenticateType() !== "manual"
    //     ? [stageId, CONSTANTS.STAGE_NAMES.SSF_2]
    //     : [stageId];
    currentStage.forEach((name) => {
      const stageIndex = FindIndex(stageSelector[0].stageInfo, name);
      const finalStageIndex = stageIndex === -1 ? 0 : stageIndex;
        stageFieldsValues.push(
          stageSelector[0].stageInfo.fieldmetadata.data.stages[finalStageIndex]
        );
    });
  }

  let currentStageFields: any;
  if (stageFieldsValues) {
    let fieldsetGroup: Array<FieldSetGroupModel[]> = [];
    const groupObj = (response: StageFieldModel) => {
      
      return response.fields.reduce(
        (prev: Array<FieldSetGroupModel>, { field_set_name, ...items }) => {
          let id = prev.findIndex(
            (item: KeyWithAnyModel) => item.field_set_name === field_set_name
          );
          if (
            !(myinfoMissingFields && myinfoMissingFields.length > 0) ||
            other === "othermyinfo"
          ) {
            fieldGroupingFunc(id, prev, field_set_name, items);
          }
          return prev;
        },
        []
      );
    };
    stageFieldsValues.forEach((data: StageFieldModel) => {
      
      if (fieldsetGroup.length > 0) {
        fieldsetGroup[0].push(groupObj(data)[0]);
      } else {
        fieldsetGroup.push(groupObj(data));
      }
    });
    if (stageId === "bd-2") {
      currentStageFields = Rules_bd_2(
        fieldsetGroup,
        stageSelector[0].stageInfo
      );
    } else if (stageId === "ssf-2") {
      currentStageFields = RulesSSFTwo(
        fieldsetGroup,
        stageSelector[0].stageInfo,
        myinfoMissingFields
      );
    } else if (stageId === "bd-1") {
      currentStageFields = Rules_bd_1(
        fieldsetGroup,
        stageSelector[0].stageInfo.application
      );
    } else if (stageId === "bd-3") {
      currentStageFields = Rules_bd_3(
        fieldsetGroup,
        stageSelector[0].stageInfo
      );
    } else if (stageId === "ad-1") {
      currentStageFields = Rules_ad_1(
        fieldsetGroup,
        stageSelector[0].stageInfo.application
      );
    } else if (stageId === "ad-2") {
      currentStageFields = Rules_ad_2(
        fieldsetGroup,
        stageSelector[0].stageInfo
      );
    } else if (stageId === "ACD") {
      currentStageFields = Rules_acd(
        fieldsetGroup,
        stageSelector[0].stageInfo.application
      );
    } else {
      currentStageFields = RulesSSF(
        fieldsetGroup,
        stageSelector[0].stageInfo,
        myinfoMissingFields
      );
    }
  }
  return {
    fields: currentStageFields,
  };
};

/**
 * The method used to push the fields to make a fieldset grouping
 * @param id
 * @param prev
 * @param field_set_name
 * @param items
 */
export const fieldGroupingFunc = (
  id: number,
  prev: Array<KeyWithAnyModel>,
  field_set_name: string,
  items: KeyWithAnyModel
) => {
  if (id >= 0) {
    prev[id].fields.push(items);
  } else {
    prev.push({ field_set_name, fields: [items] });
  }
};

/**
 * The method is used to get user inputs
 * @param applicantsSelector
 * @param stageSelector
 * @returns
 */
export const userInputPayload = (
  applicantsSelector: KeyWithAnyModel,
  stageSelector: Array<StageDetails>,
  otherMyInfo?: string
): any => {
  return async (dispatch: AppDispatch) => {
    const fieldUpdate = JSON.parse(JSON.stringify(stageSelector[0]));
    if (otherMyInfo) {
      fieldUpdate.stageId = otherMyInfo;
    }
    for (let key in applicantsSelector) {
      fieldUpdate.stageInfo.applicants[key] = applicantsSelector[key];
    }
    dispatch(stagesAction.updateStageFields(fieldUpdate));
  };
};
/**
 * The method used to build residential address from myinfo response
 * @param stageSelector
 * @returns
 */
export const residentialAddress = (stageSelector: KeyWithAnyModel) => {
  const block = stageSelector[0].stageInfo.applicants["block_a_1"];
  const building = stageSelector[0].stageInfo.applicants["building_name_a_1"];
  const street = stageSelector[0].stageInfo.applicants["street_name_a_1"];
  const unitNo = stageSelector[0].stageInfo.applicants["unit_no_a_1"];
  const postalCode = stageSelector[0].stageInfo.applicants["postal_code_a_1"];
  if (block && street && postalCode) {
    return (
      block +
      (building ? "," + building : "") +
      "," +
      street +
      (unitNo ? "," + unitNo : "") +
      "," +
      postalCode
    );
  } else {
    return null;
  }
};

/**
 * The method used to make API request for all stages.
 * @param userInputSelector To ensure whether all teh fields are filled by userInput
 * @param stageSelector Initial response
 * @param valueSelector to ensure whether any changes deducted or not
 * @returns
 */

export const submitRequest = (
  applicantsSelector: KeyWithAnyModel,
  stageSelector: StageDetails,
  stageSelectorThankYou:Array<StageDetails>,
  valueSelector: ValueSelectModel,
  applicationJourney: string | null,
  lovSelector: KeyWithAnyModel,
  userInputSelector: KeyWithAnyModel,
  errorSelector: any,
  otpAuth: boolean,
  isPreserveCall?: boolean,
  isExit? :boolean,
  bancaSelector? : KeyWithAnyModel
): any => {
  return async (dispatch: AppDispatch) => {
    const stagePayload = () => {
      const stageIndex = FindIndex(
        stageSelector.stageInfo,
        stageSelector.stageId
      );
      if (stageSelector.stageId !== "rp" && stageSelector.stageId !== "doc") {
        let metagata = {
          ...stageSelector.stageInfo.fieldmetadata.data.stages[stageIndex],
        };
        if (stageSelector.stageId === "ad-1") {
          let fields = [...metagata.fields];
          let i = 1;
          while (i < 6) {
            fields.push(
              { logical_field_name: `country_of_tax_residence_${i}` },
              { logical_field_name: `tax_id_no_${i}` },
              { logical_field_name: `crs_reason_code_${i}` },
              { logical_field_name: `crs_comments_${i}` }
            );
            i++;
          }
          metagata.fields = fields;
          let fieldIndex = metagata.fields.findIndex(
            (field: KeyWithAnyModel) =>
              field.logical_field_name === "add_tax_residency_note"
          );
          if (fieldIndex > -1) {
            metagata.fields.splice(fieldIndex, 1);
          }
          const tmpStore = store.getState().stages.stages[0].stageInfo;
          if (
            tmpStore &&
            tmpStore.applicants["casa_fatca_declaration_a_1"] === "Y"
          ) {
            fieldIndex = metagata.fields.findIndex(
              (field: KeyWithAnyModel) =>
                field.logical_field_name === "tax_id_no"
            );
            if (fieldIndex > -1) {
              metagata.fields.splice(fieldIndex, 1);
            }
          }
        }
        return metagata.fields.reduce(
          (prev: any, { logical_field_name, ...item }: any) => {
            if (!PAYLOAD_CONSTANTS.INFO_FIELDS.includes(item.component_type)) {
              if (applicantsSelector[logical_field_name + "_a_1"]) {
                prev[logical_field_name + "_a_1"] = applicantsSelector[
                  logical_field_name + "_a_1"
                ]
                  ? applicantsSelector[logical_field_name + "_a_1"]
                  : stageSelector.stageInfo.applicants[
                      logical_field_name + "_a_1"
                    ];
              }
            }
            if ((stageSelector.stageId === "ad-2" ||(stageSelector.stageId === "bd-3" && applicantsSelector.credit_limit_consent_a_1 === "N"))) 
            {
                  if(bancaSelector && bancaSelector.eligible_banca_insurances)
                  {
                    bancaSelector.eligible_banca_insurances.map((eligibleBancaInsurance: any, index: number) => {
                      if(applicantsSelector["insurance_consent_" + eligibleBancaInsurance + "_a_1"])
                      {
                        prev["insurance_consent_" + eligibleBancaInsurance + "_a_1"] =
                        applicantsSelector["insurance_consent_" + eligibleBancaInsurance + "_a_1"];
                      }

                      if(eligibleBancaInsurance === 'SG-PA' && applicantsSelector["insurance_consent_" + eligibleBancaInsurance + "_a_1"] === 'Y')
                      {
                        prev['banca_benefit_amount1_a_1'] = "50000.0";
                        prev['banca_eligible_prdcd_a_1'] = stageSelector.stageInfo.products[0].product_type;
                        prev['banca_premium_amount_a_1'] = bancaSelector.eligible_banca_insurance_informations[index].Premium.InsurancePremiumAmount;
                        prev['banca_product_applicable_a_1'] = 'Y';
                        prev['banca_product_code_a_1'] = "PA";
                      }
                    })
                  }
            }
            return prev;
          },
          {}
        );
      } else if(stageSelector.stageId === "rp") {
        
        const fieldUpdate = JSON.parse(JSON.stringify(stageSelectorThankYou[0]));
        for (let key in applicantsSelector) {
          fieldUpdate.stageInfo.applicants[key] = applicantsSelector[key];
        }
        let stateInfofield = fieldUpdate.stageInfo;
        return stateInfofield
       
      }
    };

    stagePayload();

    const patchUserInputOnPayload = () => {
      const fieldUpdate = JSON.parse(JSON.stringify(stageSelector));
      for (let key in applicantsSelector) {
        fieldUpdate.stageInfo.applicants[key] = applicantsSelector[key];
      }
      return fieldUpdate;
    };

    if (isPreserveCall) {
      dispatch(fieldErrorAction.getMandatoryFields(null));
      dispatch(fieldErrorAction.getFieldError(null));
      let currentStageFields: any;
      if (
        stageSelector &&
        stageSelector.stageId !== "ssf-1" &&
        stageSelector.stageId !== "ssf-2" &&
        stageSelector.stageId !== "bd-1"
      ) {
        currentStageFields = stagePayload();
      } else {
        currentStageFields = applicantsSelector;
      }
      return await dispatch(await preserveRequest(patchUserInputOnPayload(), currentStageFields ,isExit)).then((response:any)=>{
        return Promise.resolve(response);
       }).catch((err: any) => {
        return Promise.reject(err);
      });
    } else {
      let isSaveRequest = false;
      let isRetry = false;
      if (errorSelector && errorSelector.retry) {
        isRetry = true;
        dispatch(errorAction.getRetryStatus(false));
      }
      // bd-1 back nav should always skip api calls
      if (stageSelector.stageId === "bd-1") {
        isSaveRequest = true;
      } else if (
        (valueSelector.backNavigation.formChange !== null &&
          stageSelector.stageId !== "rp" &&
          stageSelector.stageId !== "ssf-1" && stageSelector.stageId !== "ssf-2") ||
        (stageSelector.stageId === "ssf-2" &&
          valueSelector.otherMyInfo &&
          getUrl.getChannelRefNo().applicationRefNo)
      ) {
        isSaveRequest = compareStageRequest(
          stageSelector.stageInfo.applicants,
          userInputSelector.applicants
        );
        if(isSaveRequest && otpAuth){
          isSaveRequest = false;
        }
      }

      if (
        (getUrl.getChangeUpdate() && stageSelector.stageId === "ad-2") ||
        valueSelector.backNavigation.nextStageId === stageSelector.stageId ||
        isRetry
      ) {
        isSaveRequest = false;
      }

      if (isSaveRequest !== true) {
        dispatch(fieldErrorAction.getMandatoryFields(null));
        dispatch(fieldErrorAction.getFieldError(null));
        let currentStageFields: any;
        if (
          stageSelector &&
          stageSelector.stageId !== "ssf-1" &&
          stageSelector.stageId !== "ssf-2" &&
          stageSelector.stageId !== "bd-1"
        ) {
          currentStageFields = stagePayload();
        } else {
          currentStageFields = applicantsSelector;
        }
        return dispatch(
          postRequest(
            patchUserInputOnPayload(),
            currentStageFields,
            patchUserInputOnPayload().stageId,
            applicationJourney
          )
          )
          .then((response: any) => {
            
            dispatch(isFormUpdate(null));
            const journeyType = applicationJourney
              ? applicationJourney
              : response;
            const stateStage = nextStage(
              patchUserInputOnPayload().stageId,
              journeyType
            );
            dispatch(StepCountAction.modifyStepCount(stateStage));
            dispatch(stagesAction.updateStageId(stateStage));
            dispatch(stagesAction.resetCurrentStage(stateStage));
            if (journeyType && stateStage !== "ffd-1") {
              const nextStage = getUrl.getSteps().steps;
              const nextStageId = valueSelector.backNavigation.nextStageId;
              const stageUpdate =
                nextStageId && nextStage && 
                nextStage[stateStage].step > nextStage[nextStageId].step
                  ? true
                  : false;
              if (!nextStageId || stageUpdate) {
                dispatch(ValueUpdateAction.getNextStageId(stateStage));
              } 
            }
            return stateStage;
          })
          .catch((err: any) => {
            return Promise.reject(err);
          });
      } else {
        dispatch(fieldErrorAction.getMandatoryFields(null));
        dispatch(fieldErrorAction.getFieldError(null));
        const stateStage = nextStage(
          patchUserInputOnPayload().stageId,
          applicationJourney
        );
        dispatch(stagesAction.resetCurrentStage(stateStage));
        dispatch(stagesAction.updateStageId(stateStage));
        dispatch(
          getLovMissing(
            stateStage,
            stageSelector.stageInfo.fieldmetadata.data.stages,
            lovSelector
          )
        );
        return stateStage;
      }
    }
  };
};

export const getLovMissing = (
  stageId: string,
  stageSpecInfo: KeyWithAnyModel,
  lovSelector: KeyWithAnyModel
): any => {
  return (dispatch: AppDispatch) => {
    stageSpecInfo.forEach((stageVal: KeyWithAnyModel) => {
      if (stageVal.stageId === stageId) {
        if (stageVal.fields.length > 0) {
          stageVal.fields.forEach((fName: KeyWithAnyModel) => {
            if (fName.lov === "Yes") {
              const existingLov = lovSelector.lov.find(
                (item: KeyWithAnyModel) =>
                  item.label === fName.logical_field_name
              );
              if (!existingLov) {
                dispatch(getLovData(fName.logical_field_name));
              }
            }
          });
        }
      }
    });
  };
};
export const compareStageRequest = (
  stageSelectorApplicants: KeyWithAnyModel,
  userInputSelectorApplicants: KeyWithAnyModel
): any => {
  let isChanged = true;
  for (let key in userInputSelectorApplicants) {
    if (userInputSelectorApplicants[key] !== stageSelectorApplicants[key]) {
      isChanged = false;
      return isChanged;
    }
  }
  return isChanged;
};
