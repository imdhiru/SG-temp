import { FieldsetModel, KeyWithAnyModel } from '../../utils/model/common-model';

const rulesUtils = (props: KeyWithAnyModel, validationObj: any) => {
    const result = props.map((element: Array<FieldsetModel>) => {
        return element.map((res: FieldsetModel) => {
            const eFields = res.fields.map((resData: KeyWithAnyModel) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                if(validationObj.modifyVisibility && validationObj.modifyVisibility.length > 0){
                    if(resData.logical_field_name && resData.default_visibility && resData.default_visibility=== 'No' && validationObj.modifyVisibility[0].includes(resData.logical_field_name) ) {
                        resData.default_visibility = "Yes"
                    }
                }
                if(validationObj.hidden && validationObj.hidden.length >0){
                    if(validationObj?.hidden.includes(resData.logical_field_name)){ 
                        resData.default_visibility = "No"
                    }
                }
                if(validationObj.fieldSetNameChange && validationObj.fieldSetNameChange.length > 0){
                    if(resData.logical_field_name && resData.default_visibility=== 'No' && validationObj.modifyVisibility[0].includes(resData.logical_field_name) ) {
                        resData.default_visibility = "Yes"
                    }
                }
                return {
                    ...resData,
                    editable: validationObj.nonEditable[0] && validationObj.nonEditable[0].includes(resData.logical_field_name) ? true : false
                }
            })
            const vFields = eFields.filter((subElement: KeyWithAnyModel) => !(validationObj.hidden.length > 0 && validationObj.hidden[0].includes(subElement.logical_field_name)) && subElement.default_visibility !== 'No');
            return { ...res, fields: vFields }
        })
    })
    return result[0]
}

export default rulesUtils
