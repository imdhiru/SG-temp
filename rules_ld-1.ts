import { KeyWithAnyModel, ValidationObjModel } from '../../utils/model/common-model';
import rulesUtils from './rules.utils';

const Rules_ld_1 = (props: KeyWithAnyModel, stageInfo: KeyWithAnyModel): KeyWithAnyModel => {
    const validationObj: ValidationObjModel = {
        nonEditable: [],
        hidden: []
    };

    return rulesUtils(props, validationObj);
}

export default Rules_ld_1;