import { getUrl } from "../../utils/common/change.utils";
import {
  KeyWithAnyModel,
  ValidationObjModel,
} from "../../utils/model/common-model";
import rulesUtils from "./rules.utils";

const Rules_bd_1 = (props: KeyWithAnyModel, application: KeyWithAnyModel): KeyWithAnyModel => {
  const auth = getUrl.getParameterByName("auth");
  const isMyInfoVirtual = getUrl.getParameterByName("isMyInfoVirtual");
  const stageSelector = getUrl.getStageInfo()[0];
  const fieldSet = props.flat();
  const validationObj: ValidationObjModel = {
    nonEditable: [],
    hidden: []
  };

  //ibanking back nav issue fix
  if (stageSelector.stageInfo.applicants['auth_mode_a_1'] === 'IX') {
    const ibankingFields = [
      "full_name",
      "email",
      "mobile_number",
      "account_currency_9",
      "account_currency",
      "contact_preference_casa"
    ];

    validationObj.nonEditable.push(ibankingFields);

    let hiddenFields: any[] = [];

    fieldSet.forEach((field: KeyWithAnyModel) => {
      field.fields.forEach((fieldName: KeyWithAnyModel) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        ibankingFields.indexOf(fieldName["logical_field_name"]) === -1
          ? hiddenFields.push(fieldName["logical_field_name"])
          : "";
      });
    });

    validationObj.hidden!.push(hiddenFields);
  }

  //Adding resume here, incase of manual flow this condition has to be modified.
  else if (
    application.source_system_name === "3" &&
    (auth === "myinfo" || isMyInfoVirtual === "true" || auth === "resume")
  ) {

    let hiddenFields = [
      "dsa_code",
      "date_of_birth",
      "residency_status",
      "nationality",
      "country_of_birth",
      "contact_preference",
      "gender",
      "marital_status",
      "nationality_add",
      "other_name_or_alias",
      "education_level"
    ];
    if (stageSelector.stageId === 'bd-1' && (stageSelector.stageInfo.applicants['account_currency_9_a_1'] === '' || stageSelector.stageInfo.applicants['account_currency_a_1'] === '')) {
      hiddenFields.push('account_currency_9', 'account_currency');
    }
    validationObj.hidden!.push(hiddenFields);
    const nonEditableFields = [
      "full_name",
      "email",
      "mobile_number",
      "residential_address",
      "see_other_myInfo_details",
      "see_other_myInfo_details_consent",
      "ownership_status",
      "account_currency_9",
      "account_currency"
    ];
    validationObj.nonEditable.push(nonEditableFields);
  } else if (auth === "manual") {
    const hiddenFields = [
      "ownership_status",
      "education_level",
      "nationality",
      "nationality_add",
      "country_of_birth",
      "contact_preference",
      "other_name_or_alias",
      "education_level",
      "gender",
      "marital_status",
      "residential_address",
      "see_other_myInfo_details",
      "see_other_myInfo_details_consent",
    ];
    const nonEditableFields = [
      "full_name",
      "email",
      "mobile_number",
      "residential_status",
      "account_currency_9",
      "account_currency",
      "residency_status",
      "NRIC",
      "passport_no"
    ];
    validationObj.nonEditable.push(nonEditableFields);
    validationObj.hidden!.push(hiddenFields);
  } else {
    const hiddenFields = [
      "see_other_myInfo_details",
      "see_other_myInfo_details_consent",
    ];
    validationObj.hidden!.push(hiddenFields);
  }

  return rulesUtils(props, validationObj);
};

export default Rules_bd_1;

import { getUrl } from "../../utils/common/change.utils";
import rulesUtils from "./rules.utils";
import Rules_bd_1 from "./Rules_bd_1";

jest.mock("../../utils/common/change.utils", () => ({
  getUrl: {
    getParameterByName: jest.fn(),
    getStageInfo: jest.fn(),
  },
}));

jest.mock("./rules.utils");

describe("Rules_bd_1 Function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle the iBanking scenario and set nonEditable and hidden fields correctly", () => {
    // Arrange
    const props = [
      {
        fields: [
          { logical_field_name: "full_name" },
          { logical_field_name: "email" },
          { logical_field_name: "mobile_number" },
        ],
      },
    ];
    const application = { source_system_name: "1" };
    const stageInfoMock = [
      {
        stageId: "bd-1",
        stageInfo: {
          applicants: { auth_mode_a_1: "IX" },
        },
      },
    ];

    const mockReturnValue = { processed: "result" };

    getUrl.getParameterByName.mockReturnValueOnce(null).mockReturnValueOnce(null);
    getUrl.getStageInfo.mockReturnValue(stageInfoMock);
    rulesUtils.mockReturnValue(mockReturnValue);

    // Act
    const result = Rules_bd_1(props, application);

    // Assert
    expect(rulesUtils).toHaveBeenCalledWith(props, {
      nonEditable: [
        [
          "full_name",
          "email",
          "mobile_number",
          "account_currency_9",
          "account_currency",
          "contact_preference_casa",
        ],
      ],
      hidden: [
        ["account_currency_9", "account_currency", "contact_preference_casa"],
      ],
    });
    expect(result).toEqual(mockReturnValue);
  });

  it("should handle the manual scenario and set hidden and nonEditable fields correctly", () => {
    // Arrange
    const props = [];
    const application = { source_system_name: "1" };
    const stageInfoMock = [
      {
        stageId: "bd-2",
        stageInfo: {
          applicants: {},
        },
      },
    ];

    const mockReturnValue = { processed: "manualResult" };

    getUrl.getParameterByName.mockReturnValueOnce("manual");
    getUrl.getStageInfo.mockReturnValue(stageInfoMock);
    rulesUtils.mockReturnValue(mockReturnValue);

    // Act
    const result = Rules_bd_1(props, application);

    // Assert
    expect(rulesUtils).toHaveBeenCalledWith(props, {
      nonEditable: [
        [
          "full_name",
          "email",
          "mobile_number",
          "residential_status",
          "account_currency_9",
          "account_currency",
          "residency_status",
          "NRIC",
          "passport_no",
        ],
      ],
      hidden: [
        [
          "ownership_status",
          "education_level",
          "nationality",
          "nationality_add",
          "country_of_birth",
          "contact_preference",
          "other_name_or_alias",
          "gender",
          "marital_status",
          "residential_address",
          "see_other_myInfo_details",
          "see_other_myInfo_details_consent",
        ],
      ],
    });
    expect(result).toEqual(mockReturnValue);
  });

  it("should handle default case and set minimal hidden fields", () => {
    // Arrange
    const props = [];
    const application = { source_system_name: "1" };
    const stageInfoMock = [
      {
        stageId: "bd-2",
        stageInfo: {
          applicants: {},
        },
      },
    ];

    const mockReturnValue = { processed: "defaultResult" };

    getUrl.getParameterByName.mockReturnValueOnce(null);
    getUrl.getStageInfo.mockReturnValue(stageInfoMock);
    rulesUtils.mockReturnValue(mockReturnValue);

    // Act
    const result = Rules_bd_1(props, application);

    // Assert
    expect(rulesUtils).toHaveBeenCalledWith(props, {
      nonEditable: [],
      hidden: [["see_other_myInfo_details", "see_other_myInfo_details_consent"]],
    });
    expect(result).toEqual(mockReturnValue);
  });
});
