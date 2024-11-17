import { getUrl } from '../../utils/common/change.utils';
import { KeyWithAnyModel, ValidationObjModel } from '../../utils/model/common-model';
import rulesUtils from './rules.utils';

const Rules_bd_3 = (props: KeyWithAnyModel, stageInfo: KeyWithAnyModel): KeyWithAnyModel => {
    const validationObj: ValidationObjModel = {
        nonEditable: [],
        hidden: [],
    };
    const filteredFields = [];
    filteredFields.push(props[0].filter((fields:any)=> fields.field_set_name === 'Employment Details'));
    let nonEditableFields: Array<string> = [];
    let hiddenFields: Array<string> = [];    
    if((stageInfo.products[0].product_category === "CC" || stageInfo.products[0].product_category === "PL")){
        if(stageInfo.application.journey_type ||getUrl.getJourneyType()  === 'NTC'){
            if(!stageInfo.applicants["year_of_assessment_fff_1_a_1"]){
                hiddenFields.push("year_of_assessment_fff_1");
            }
            if(!stageInfo.applicants["annual_income_fff_1_a_1"]){
                hiddenFields.push("annual_income_fff_1");
            }

          nonEditableFields.push("annual_income_fff_1","year_of_assessment_fff_1","residential_address");
       }
    }
    if (getUrl.getJourneyType() === "ETC") {
        hiddenFields.push("work_type","name_of_employer","name_of_employer_other","name_of_business","job_title","embossed_name","annual_income_fff_1","year_of_assessment_fff_1","residential_address","office_phone_number");
    }
    else{
        hiddenFields.push("credit_limit_consent","myinfo_data_cli","embossed_name");
        if(stageInfo.products[0].product_category  === "PL" || stageInfo.products[0].product_category === "CC"){
            if(stageInfo.application.journey_type !== 'NTC'){
                hiddenFields.push("annual_income_fff_1","year_of_assessment_fff_1","ownership_status","residential_address");
            }
      }
    }
    validationObj.nonEditable.push(nonEditableFields);
    validationObj.hidden!.push(hiddenFields);
    return rulesUtils(filteredFields, validationObj);
}

export default Rules_bd_3;
