import { filterDisableFields, getUrl } from "../../utils/common/change.utils";
import {
  KeyWithAnyModel,
  ValidationObjModel,
} from "../../utils/model/common-model";
import rulesUtils from "./rules.utils";

const RulesSSF = (
  props: KeyWithAnyModel,
  stageInfo: KeyWithAnyModel,
  missing_fields?: Array<string>
): KeyWithAnyModel => {
  const auth = getUrl.getParameterByName("auth");
  const fieldSet = props.flat();
  const isMyInfoVirtual = getUrl.getParameterByName("isMyInfoVirtual");
  const validationObj: ValidationObjModel = {
    nonEditable: [],
    hidden: [],
    modifyVisibility: []
  };

  if (
    stageInfo.application.source_system_name === "3" &&
    (auth === "myinfo" || isMyInfoVirtual === "true")
  ) {
    let nonEditableFields: Array<string> = [];
    let default_editable : any[] = [];



    if(stageInfo.products[0].product_category !== 'CA' && stageInfo.products[0].product_category !== 'SA'){
     default_editable = ['email', 'mobile_number']
    }
	
    let myinfoMissingFields: Array<string> = ['ownership_status'];
   
    if (!stageInfo.applicants['mobile_number_a_1']) {
      myinfoMissingFields.push('mobile_number');
    }
    if (!stageInfo.applicants['email_a_1']) {
      myinfoMissingFields.push('email');
    }
    if (!stageInfo.applicants['residency_status']) {
      myinfoMissingFields.push('residency_status');
    };
    const myInfoMissingValues = myinfoMissingFields;
    nonEditableFields = filterDisableFields(
      fieldSet[0].fields,
      myInfoMissingValues,
      default_editable
    );
    validationObj.nonEditable.push(nonEditableFields);
    const hiddenFields = ["contact_preference_casa_etc", "dsa_code"];
    
    validationObj.hidden!.push(hiddenFields);
  }
  else if (stageInfo.applicants['auth_mode_a_1'] === 'IX') {
    const ibankingFields = ["full_name", "email", "mobile_number", "account_currency_9", "account_currency", "contact_preference_casa_etc"];
    let ibankingDisableFields = ["full_name"]
    if (stageInfo.applicants['mobile_number_a_1']) {
      ibankingDisableFields.push('mobile_number');
    }
    if (stageInfo.applicants['email_a_1']) {
      ibankingDisableFields.push('email');
    }
    if (stageInfo.applicants['account_currency_9_a_1']) {
      ibankingDisableFields.push('account_currency_9');
    }
    if (stageInfo.applicants['account_currency_a_1']) {
      ibankingDisableFields.push('account_currency');
    }
    validationObj.nonEditable.push(ibankingDisableFields);
    let hiddenFields: any[] = [];
    fieldSet.forEach((field: KeyWithAnyModel) => {
      field.fields.forEach((fieldName: KeyWithAnyModel) => {
        if (ibankingFields.indexOf(fieldName["logical_field_name"]) === -1) {
          hiddenFields.push(fieldName["logical_field_name"])
        }
      });
    });
    validationObj.hidden!.push(hiddenFields);
  } else if (auth === "manual") {
    let defaultVisiblity = ["date_of_birth", "residency_status"];
    validationObj.modifyVisibility!.push(defaultVisiblity)
    const hiddenFields = [
      "ownership_status",
      "residential_address",
      "see_other_myInfo_details",
      "see_other_myInfo_details_consent",
      "contact_preference_casa_etc",
      "residential_address_consent_a_1",
      "dsa_code"
    ];
    validationObj.hidden!.push(hiddenFields);
  } else {
    const hiddenFields = [
      "see_other_myInfo_details",
      "see_other_myInfo_details_consent",
      "contact_preference_casa_etc",
      "dsa_code"
    ];
    validationObj.hidden!.push(hiddenFields);
  }
  return rulesUtils(props, validationObj);
};

export default RulesSSF;