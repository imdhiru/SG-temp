import { AppDispatch, dispatchLoader, lovRequests } from "../../../services/common-service";
import { KeyWithAnyModel } from "../../../utils/model/common-model";
import { ValueUpdateAction } from "../../../utils/store/value-update-slice";

export const deleteConditionalFieldSelector = (
  updateUserInputs: KeyWithAnyModel,
  conditionalFieldSelector: KeyWithAnyModel
): any => {
  return async () => {
    if (Object.keys(conditionalFieldSelector.removedFields).length > 0) {
      for (let key in conditionalFieldSelector.removedFields) {
        delete updateUserInputs[key];
      }
    }
    return updateUserInputs;
  };
};

export const removeUserInput = (
  updateUserInputs: any,
  dependencyFieldsSelector: any,
  conditionalFieldSelector: any
): any => {
  // Sonar fix
  return async () => {
    if (
      dependencyFieldsSelector.workType["value"] &&
      ((!(Object.keys(conditionalFieldSelector.removedFields).length > 0) &&
        !(Object.keys(conditionalFieldSelector.newFields).length > 0)) ||
        dependencyFieldsSelector.workType["value"] === "O")
    ) {
      updateUserInputs = {};
    }
    return updateUserInputs;
  };
};

export const assignUpdateUserInput = (
  getUsInput: any,
  updateUserInputs: any
): any => {
  return async () => {
    if (getUsInput && updateUserInputs) {
      for (let item in getUsInput) {
        const field = item.split("_a_1")[0];
        if (updateUserInputs.hasOwnProperty(field)) {
          updateUserInputs[field] = getUsInput[item];
        }
      }
    }
    return updateUserInputs;
  };
};

export const setFieldsForMyinfo = (
  stageSelector: KeyWithAnyModel,
  otherMyinfoSelector:KeyWithAnyModel
): any => {
  return async (dispatch: AppDispatch) => {
    if (stageSelector && stageSelector.length > 0) {
      dispatch(ValueUpdateAction.updateOtherMyinfo(true));
      if (!otherMyinfoSelector.otherMyInfo) {
        dispatch(dispatchLoader(true));
        dispatch(lovRequests(stageSelector[0].stageInfo, "ssf-2", null));
      }
    }
    return stageSelector;
  };
};

export const dispatchLov = (
  stageSpecInfo: KeyWithAnyModel,
  stageUpdate : string, 
  lovSelector:KeyWithAnyModel
): any => {
  return async () => {
    stageSpecInfo.forEach((stageVal: KeyWithAnyModel) => {
      if (stageVal.stageId === stageUpdate) {
        if (stageVal.fields.length > 0) {
          stageVal.fields.forEach((fName: KeyWithAnyModel) => {
           return returnLovIfApplicable(fName , lovSelector);
          });
        }
      }
    });
  };
};

export const returnLovIfApplicable = (fName:KeyWithAnyModel, lovSelector:KeyWithAnyModel) =>{
  if (fName.lov === "Yes") {
    const existingLov = lovSelector.lov.find(
      (item: KeyWithAnyModel) =>
        item.label === fName.logical_field_name
    );
    if (!existingLov) {
      return fName.logical_field_name
    }
  }
}

