import { KeyWithAnyModel, ValidationObjModel } from '../../utils/model/common-model';
import rulesUtils from './rules.utils';

const Rules_ad_1 = (props: KeyWithAnyModel, _s: KeyWithAnyModel): KeyWithAnyModel => {
    const validationObj: ValidationObjModel = {
        nonEditable: [],
        hidden: []
    };

    return rulesUtils(props, validationObj);
}

export default Rules_ad_1;
