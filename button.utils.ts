import { AppDispatch } from "../../../services/common-service";
import { FindIndex } from "../../../utils/common/change.utils";
import { KeyWithAnyModel, StageDetails, UserFields,taxStoreModel } from "../../../utils/model/common-model";
import { fieldErrorAction } from "../../../utils/store/field-error-slice";
import { stagesAction } from "../../../utils/store/stages-slice";
import { taxAction } from "../../../utils/store/tax-slice";

export const getFields = (getStages: Array<StageDetails>, taxSelector: taxStoreModel,  action : string, userInputs : UserFields): any => {
    return (dispatch: AppDispatch) => {
        let fields: Array<KeyWithAnyModel> | undefined;
        
        const stageId = getStages[0].stageId === 'ssf-1' ? 'ssf-2' : getStages[0].stageId;
        const stageIndex = FindIndex(getStages[0].stageInfo, stageId);
        fields = getStages[0].stageInfo.fieldmetadata.data.stages[stageIndex].fields;
        let newFileds: Array<KeyWithAnyModel> = [];
        let removeFieldsArray: Array<string> = [];
        let newFieldsArray: Array<string> = [];
        let getClonedField = (logical_field_name: string) => {
            if (fields) {
                let field = fields.find(fieldData => fieldData.logical_field_name === logical_field_name);
                if (field && field.logical_field_name) {
                    return { ...field };
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }

        let country_of_tax_residence = getClonedField('country_of_tax_residence');
        let tax_id_no = getClonedField('tax_id_no');
        let crs_reason_code = getClonedField('crs_reason_code');
        
        const getSequence = () => {
            for (let i = 1; i <= taxSelector.maxCount; i++) {
                let isItemFound = false;
                taxSelector.fields.forEach((field: string, index: number) => {
                    if (
                        field &&
                        field.split("_")[4] === i.toString() &&
                        index % 2 === 0
                    ) {
                        isItemFound = true;
                    }
                });
                if (!isItemFound) {
                    return i;
                }
            }
        };
        
        taxSelector.fields.forEach((field: string) => {
            if (
                field &&
                field.split("_")[0] === "country" &&
                country_of_tax_residence
            ) {
                country_of_tax_residence.logical_field_name = field;
                newFileds.push({ ...country_of_tax_residence });
            } else if (field.split("_")[0] === "tax" && tax_id_no) {
                tax_id_no.logical_field_name = field;
                const seqNo = field.split("_")[3];
                const tax_id_no_value = userInputs.applicants['tax_id_no_' + seqNo + '_a_1']
                const crs_reason_codeValue = userInputs.applicants['crs_reason_code_' + seqNo + '_a_1'];
                if (!crs_reason_codeValue) {
                    newFileds.push({...tax_id_no});
                    newFieldsArray.push(tax_id_no.logical_field_name);
                    if (tax_id_no_value && userInputs.applicants['crs_reason_code_' + seqNo + '_a_1'] !== undefined) {
                        removeFieldsArray.push('crs_reason_code_' + seqNo);
                    }
                    if (tax_id_no_value && userInputs.applicants['crs_comments_' + seqNo + '_a_1'] !== undefined) {
                        removeFieldsArray.push('crs_comments_' + seqNo);
                    }
                }
                if (!tax_id_no_value) {
                    if (crs_reason_code) {
                        let temp_crs_reason_code = { ...crs_reason_code };
                        temp_crs_reason_code.logical_field_name = temp_crs_reason_code.logical_field_name + '_' + seqNo;
                        newFileds.push(temp_crs_reason_code);
                        newFieldsArray.push(temp_crs_reason_code.logical_field_name);
                        if (crs_reason_codeValue && userInputs.applicants['tax_id_no_' + seqNo + '_a_1'] !== undefined) {
                            removeFieldsArray.push('tax_id_no_' + seqNo);
                        }
                        if (crs_reason_codeValue === "B00") {
                            let crs_comments = getClonedField('crs_comments');
                            if (crs_comments) {
                                let temp_crs_comments = { ...crs_comments };
                                temp_crs_comments.logical_field_name = temp_crs_comments.logical_field_name + '_' + seqNo;
                                newFileds.push(temp_crs_comments);
                                newFieldsArray.push(temp_crs_comments.logical_field_name);
                            }
                        } else {
                            if (userInputs.applicants['crs_comments_' + seqNo + '_a_1'] !== undefined) {
                                removeFieldsArray.push('crs_comments_' + seqNo);
                            }
                        }
                    }
                }
            }
        });

        if (removeFieldsArray.length > 0 || newFieldsArray.length > 0) {
            dispatch(fieldErrorAction.getMandatoryFields(newFieldsArray));
            dispatch(fieldErrorAction.removeMandatoryFields(removeFieldsArray));
            dispatch(
                stagesAction.removeAddToggleField({
                    removeFields: removeFieldsArray,
                    newFields: newFieldsArray,
                    value: ''
                })
            );
        }

        if (taxSelector.count < taxSelector.maxCount && action === "add") {
            dispatch(taxAction.updateCount(taxSelector.count + 1));
            if (country_of_tax_residence) {
                country_of_tax_residence.logical_field_name = "country_of_tax_residence_" + getSequence();
                newFileds.push({ ...country_of_tax_residence });
                dispatch(fieldErrorAction.getMandatoryFields([country_of_tax_residence.logical_field_name]));
                dispatch(taxAction.addTaxFiled(country_of_tax_residence.logical_field_name));
                dispatch(
                    stagesAction.removeAddToggleField({
                        removeFields: [],
                        newFields: [country_of_tax_residence.logical_field_name],
                        value: ''
                    })
                );
            }
            if (tax_id_no && crs_reason_code) {
                tax_id_no.logical_field_name = "tax_id_no_" + getSequence();
                newFileds.push({ ...tax_id_no });
                crs_reason_code.logical_field_name = "crs_reason_code_" + getSequence();
                newFileds.push({ ...crs_reason_code });
                dispatch(fieldErrorAction.getMandatoryFields([tax_id_no.logical_field_name, crs_reason_code.logical_field_name]));
                dispatch(taxAction.addTaxFiled(tax_id_no.logical_field_name));
                dispatch(
                    stagesAction.removeAddToggleField({
                        removeFields: [],
                        newFields: [tax_id_no.logical_field_name, crs_reason_code.logical_field_name],
                        value: ''
                    })
                );
            }
        }

        return newFileds;
    }
}
