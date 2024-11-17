import { KeyWithAnyModel, ValidationObjModel } from '../../utils/model/common-model';
import rulesUtils from './rules.utils';

const Rules_acd = (props: KeyWithAnyModel, _s: KeyWithAnyModel): KeyWithAnyModel => {
    const validationObj: ValidationObjModel = {
        nonEditable: [],
        hidden: []
    };

    return rulesUtils(props, validationObj);
}

export default Rules_acd;
