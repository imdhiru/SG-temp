import { getUrl } from "../../utils/common/change.utils";
import { filterDisableFields } from "../../utils/common/change.utils";
import {
  KeyWithAnyModel,
  ValidationObjModel,
} from "../../utils/model/common-model";
import rulesUtils from "./rules.utils";

const RulesSSFTwo = (
  props: KeyWithAnyModel,
  stages: KeyWithAnyModel,
  myinfoMissingFields?: Array<string>
): KeyWithAnyModel => {
  const validationObj: ValidationObjModel = {
    nonEditable: [],
    hidden: [],
  };

  const fieldSet = props.flat();
  let nonEditableFields: Array<string> = ["NRIC", "date_of_birth"];
  let myInfoMissingValues: Array<string> = myinfoMissingFields
    ? myinfoMissingFields
    : [];
  let hiddenFields: Array<string> = [];
  //Removing this condition as fields here in ssf-2 are from myinfo only, have to re-write the logic for manual cases
  if (stages.application.source_system_name === "3") {
    if (stages.applicants["residency_status_a_1"] === "FR") {
      hiddenFields = ["NRIC"];
      if (myInfoMissingValues.length > 0) {
        myInfoMissingValues.push("passport_no", "pass_exp_date");
      }
    } else {
      hiddenFields = ["FIN", "passport_no", "pass_exp_date"];
    }

    if(!stages.applicants["year_of_assessment_fff_1_a_1"]){
      hiddenFields.push("year_of_assessment_fff_1");
    }
    if(!stages.applicants["annual_income_fff_1_a_1"]){
      hiddenFields.push("annual_income_fff_1");
    }

    if (getUrl.getJourneyType()) {
      let fields= [];
      fields = fieldSet.map((item:any) => item.fields);      
      nonEditableFields = filterDisableFields(fields.flat(), []);
    } else {
      const filteredMissingFields = fieldSet.filter(
        (item: any) => item.field_set_name !== "Missing Myinfo Details"
      );
      const default_editable = ['marital_status']
      if (myInfoMissingValues.length > 0) {
        nonEditableFields = filterDisableFields(
          filteredMissingFields[0].fields,
          myInfoMissingValues,
          default_editable
        );
      } else {
        nonEditableFields = filterDisableFields(
          filteredMissingFields[0].fields,
          myInfoMissingValues,
          default_editable
        );
      }
    }
  }
  if(stages.applicants["NRIC_a_1"]){
    nonEditableFields.push("NRIC");
  }
  if(stages.applicants["date_of_birth_a_1"]){
    nonEditableFields.push("date_of_birth");
  }
  validationObj.nonEditable.push(nonEditableFields);
  validationObj.hidden!.push(hiddenFields);

  return rulesUtils(props, validationObj);
};

export default RulesSSFTwo;
