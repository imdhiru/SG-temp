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
