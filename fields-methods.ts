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

import { assignUpdateUserInput } from "./yourFile"; // Replace with your file path

describe("assignUpdateUserInput", () => {
  let getUsInput: any;
  let updateUserInputs: any;

  beforeEach(() => {
    getUsInput = {
      "field1_a_1": "newValue1",
      "field2_a_1": "newValue2",
    };
    updateUserInputs = {
      field1: "oldValue1",
      field2: "oldValue2",
    };
  });

  it("should update matching fields in updateUserInputs", async () => {
    const result = await assignUpdateUserInput(getUsInput, updateUserInputs)();

    expect(result).toEqual({
      field1: "newValue1",
      field2: "newValue2",
    });
  });

  it("should not update fields if getUsInput is null", async () => {
    getUsInput = null;

    const result = await assignUpdateUserInput(getUsInput, updateUserInputs)();

    expect(result).toEqual(updateUserInputs);
  });

  it("should not update fields if updateUserInputs is null", async () => {
    updateUserInputs = null;

    const result = await assignUpdateUserInput(getUsInput, updateUserInputs)();

    expect(result).toBeNull();
  });

  it("should not add fields not in updateUserInputs", async () => {
    getUsInput["field3_a_1"] = "newValue3";

    const result = await assignUpdateUserInput(getUsInput, updateUserInputs)();

    expect(result).toEqual({
      field1: "newValue1",
      field2: "newValue2",
    });
  });
});



import { removeUserInput } from "./yourFile"; // Replace with your file path

describe("removeUserInput", () => {
  let mockUpdateUserInputs: any;
  let dependencyFieldsSelector: any;
  let conditionalFieldSelector: any;

  beforeEach(() => {
    mockUpdateUserInputs = { field1: "value1" };
    dependencyFieldsSelector = {
      workType: { value: "A" },
    };
    conditionalFieldSelector = {
      removedFields: {},
      newFields: {},
    };
  });

  it("should reset updateUserInputs if conditions are met", async () => {
    dependencyFieldsSelector.workType.value = "O";

    const result = await removeUserInput(
      mockUpdateUserInputs,
      dependencyFieldsSelector,
      conditionalFieldSelector
    )();

    expect(result).toEqual({});
  });

  it("should reset updateUserInputs if removedFields and newFields are empty", async () => {
    dependencyFieldsSelector.workType.value = "A";

    const result = await removeUserInput(
      mockUpdateUserInputs,
      dependencyFieldsSelector,
      conditionalFieldSelector
    )();

    expect(result).toEqual({});
  });

  it("should not reset updateUserInputs if conditions are not met", async () => {
    dependencyFieldsSelector.workType.value = "A";
    conditionalFieldSelector.removedFields = { someField: "value" };

    const result = await removeUserInput(
      mockUpdateUserInputs,
      dependencyFieldsSelector,
      conditionalFieldSelector
    )();

    expect(result).toEqual(mockUpdateUserInputs);
  });
});



