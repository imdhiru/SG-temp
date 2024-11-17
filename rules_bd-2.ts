import { checkProductDetails } from '../../services/common-service';
import { authenticateType, getUrl } from '../../utils/common/change.utils';
import { KeyWithAnyModel, ValidationObjModel } from '../../utils/model/common-model';
import rulesUtils from './rules.utils';

const Rules_bd_2 = (props: KeyWithAnyModel, stageInfo: KeyWithAnyModel): KeyWithAnyModel => {
    const validationObj: ValidationObjModel = {
        nonEditable: [],
        hidden: [],
        modifyVisibility:[]
    };
    const auth = authenticateType()
    const isCASAProduct = checkProductDetails(stageInfo.products);
    let defaultVisiblity:any= []
    if(auth === "manual"||"myinfo"){
        let hiddenFields = ["postal_code_other","email","full_name","date_of_birth","mobile_number","residency_status","NRIC","work_type","year_of_assessment_fff_1","year_of_assessment_fff_2","annual_income_fff_1","annual_income_fff_2","dsa_code",
        "credit_limit_consent"]
        if(!isCASAProduct){
            hiddenFields.push('nationality_add');
        }

        if(stageInfo.applicants['residency_status_a_1'] === "FR"){
            defaultVisiblity = ["overseas_contact_country_code","overseas_contact_area_code","overseas_contact_no"];
        }
        defaultVisiblity.push( "residential_address_consent") 
        validationObj.hidden!.push(hiddenFields);
        validationObj.modifyVisibility!.push(defaultVisiblity)
      }

    return rulesUtils(props, validationObj);
}

export default Rules_bd_2;
