import { KeyWithAnyModel, ValidationObjModel } from '../../utils/model/common-model';
import rulesUtils from './rules.utils';
import { store } from '../../utils/store/store';
import { getProductCategory } from "../../services/common-service";

const Rules_ad_2 = (props: KeyWithAnyModel, stageInfo: KeyWithAnyModel): KeyWithAnyModel => {
    const validationObj: ValidationObjModel = {
        nonEditable: [],
        hidden: []
    };
    const filteredFields = [];
    filteredFields.push(props[0].filter((fields:any)=> fields.field_set_name === 'Credit Card Details'));
    const stage = store.getState();
    let hidhenFields:Array<string> = [] 
    if(stageInfo.products[0].product_type === '334' || stageInfo.products[0].product_type === '335' || stageInfo.products[0].product_type === '310'){
        let hidhenFields:Array<string> = ['deposit_insurance_scheme']
        if(stageInfo.products[0].product_type === '310' && stageInfo.applicants["account_currency_a_1"] !== "USD"){
            hidhenFields.push('checkbook_request_note','cheque_book_request')
            validationObj.hidden!.push(hidhenFields);
        }
        validationObj.hidden!.push(hidhenFields);
    }

    if (stage && stage.stages && stage.stages.stages && stage.stages.stages.length > 0 && stage.stages.stages[0].stageInfo &&
        getProductCategory(stage.stages.stages[0].stageInfo.products) === 'PL' && stage.stages.journeyType === "ETC") {
        hidhenFields.push('embossed_name_2');
        if(stage.stages.stages[0].stageInfo.applicants.credit_limit_consent_a_1 !== 'Y'){
            hidhenFields.push('preferred_limit_etc');
        }
        validationObj.hidden!.push(hidhenFields);
    }
    return rulesUtils(filteredFields, validationObj);
}

export default Rules_ad_2;
