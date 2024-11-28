import rulesUtils from "./rulesUtils"; // Adjust the import path
import { FieldsetModel, KeyWithAnyModel } from "../../utils/model/common-model";

describe("rulesUtils Function", () => {
  it("should correctly modify visibility based on validationObj.modifyVisibility", () => {
    const props: KeyWithAnyModel = [
      [
        {
          fields: [
            { logical_field_name: "field1", default_visibility: "No" },
            { logical_field_name: "field2", default_visibility: "Yes" },
          ],
        },
      ],
    ];
    const validationObj = {
      modifyVisibility: [["field1"]],
      hidden: [],
      fieldSetNameChange: [],
      nonEditable: [[]],
    };

    const result = rulesUtils(props, validationObj);

    expect(result.fields).toEqual(
      expect.arrayContaining([
        { logical_field_name: "field1", default_visibility: "Yes", editable: false },
        { logical_field_name: "field2", default_visibility: "Yes", editable: false },
      ])
    );
  });

  it("should hide fields based on validationObj.hidden", () => {
    const props: KeyWithAnyModel = [
      [
        {
          fields: [
            { logical_field_name: "field1", default_visibility: "Yes" },
            { logical_field_name: "field2", default_visibility: "Yes" },
          ],
        },
      ],
    ];
    const validationObj = {
      modifyVisibility: [],
      hidden: ["field1"],
      fieldSetNameChange: [],
      nonEditable: [[]],
    };

    const result = rulesUtils(props, validationObj);

    expect(result.fields).toEqual([
      { logical_field_name: "field2", default_visibility: "Yes", editable: false },
    ]);
  });

  it("should handle fieldSetNameChange correctly", () => {
    const props: KeyWithAnyModel = [
      [
        {
          fields: [
            { logical_field_name: "field1", default_visibility: "No" },
          ],
        },
      ],
    ];
    const validationObj = {
      modifyVisibility: [["field1"]],
      hidden: [],
      fieldSetNameChange: [["field1"]],
      nonEditable: [[]],
    };

    const result = rulesUtils(props, validationObj);

    expect(result.fields).toEqual([
      { logical_field_name: "field1", default_visibility: "Yes", editable: false },
    ]);
  });

  it("should mark fields as editable based on validationObj.nonEditable", () => {
    const props: KeyWithAnyModel = [
      [
        {
          fields: [
            { logical_field_name: "field1", default_visibility: "Yes" },
          ],
        },
      ],
    ];
    const validationObj = {
      modifyVisibility: [],
      hidden: [],
      fieldSetNameChange: [],
      nonEditable: [["field1"]],
    };

    const result = rulesUtils(props, validationObj);

    expect(result.fields).toEqual([
      { logical_field_name: "field1", default_visibility: "Yes", editable: true },
    ]);
  });

  it("should return only visible fields and filter out hidden ones", () => {
    const props: KeyWithAnyModel = [
      [
        {
          fields: [
            { logical_field_name: "field1", default_visibility: "No" },
            { logical_field_name: "field2", default_visibility: "Yes" },
            { logical_field_name: "field3", default_visibility: "No" },
          ],
        },
      ],
    ];
    const validationObj = {
      modifyVisibility: [],
      hidden: ["field3"],
      fieldSetNameChange: [],
      nonEditable: [[]],
    };

    const result = rulesUtils(props, validationObj);

    expect(result.fields).toEqual([
      { logical_field_name: "field2", default_visibility: "Yes", editable: false },
    ]);
  });

  it("should handle empty props and validationObj gracefully", () => {
    const props: KeyWithAnyModel = [];
    const validationObj = {
      modifyVisibility: [],
      hidden: [],
      fieldSetNameChange: [],
      nonEditable: [[]],
    };

    const result = rulesUtils(props, validationObj);

    expect(result).toEqual(undefined);
  });

  it("should handle nested data with multiple fields", () => {
    const props: KeyWithAnyModel = [
      [
        {
          fields: [
            { logical_field_name: "field1", default_visibility: "No" },
            { logical_field_name: "field2", default_visibility: "Yes" },
          ],
        },
        {
          fields: [
            { logical_field_name: "field3", default_visibility: "Yes" },
            { logical_field_name: "field4", default_visibility: "No" },
          ],
        },
      ],
    ];
    const validationObj = {
      modifyVisibility: [["field1", "field4"]],
      hidden: ["field3"],
      fieldSetNameChange: [["field4"]],
      nonEditable: [["field2"]],
    };

    const result = rulesUtils(props, validationObj);

    expect(result.fields).toEqual(
      expect.arrayContaining([
        { logical_field_name: "field1", default_visibility: "Yes", editable: false },
        { logical_field_name: "field2", default_visibility: "Yes", editable: true },
        { logical_field_name: "field4", default_visibility: "Yes", editable: false },
      ])
    );
  });
});














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
