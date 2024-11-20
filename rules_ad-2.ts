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









import { KeyWithAnyModel, ValidationObjModel } from '../../utils/model/common-model';
import rulesUtils from './rules.utils';
import { store } from '../../utils/store/store';
import { getProductCategory } from "../../services/common-service";
import Rules_ad_2 from './Rules_ad_2';

jest.mock('../../utils/store/store', () => ({
    store: {
        getState: jest.fn(),
    },
}));

jest.mock('../../services/common-service', () => ({
    getProductCategory: jest.fn(),
}));

jest.mock('./rules.utils', () => jest.fn());

describe('Rules_ad_2', () => {
    let mockProps;
    let mockStageInfo;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        
        // Setting up default mock data
        mockProps = [
            {
                field_set_name: 'Credit Card Details',
                some_other_field: 'value',
            },
            {
                field_set_name: 'Other Details',
                some_other_field: 'value',
            }
        ];

        mockStageInfo = {
            products: [{ product_type: '334' }],
            applicants: {
                "account_currency_a_1": "USD",
                "credit_limit_consent_a_1": 'N',
            },
        };
    });

    it('should return hidden fields for product types 334, 335, 310', () => {
        store.getState.mockReturnValue({
            stages: {
                stages: [
                    {
                        stageInfo: {
                            products: [{ product_type: '334' }],
                        },
                        journeyType: 'ETC',
                    }
                ]
            }
        });
        
        getProductCategory.mockReturnValue('PL');

        const result = Rules_ad_2(mockProps, mockStageInfo);

        // Check if 'deposit_insurance_scheme' is added to hidden fields
        expect(result.validationObj.hidden[0]).toContain('deposit_insurance_scheme');
    });

    it('should add checkbook_request_note and cheque_book_request when product type is 310 and currency is not USD', () => {
        mockStageInfo.products[0].product_type = '310';
        mockStageInfo.applicants["account_currency_a_1"] = "INR";
        
        store.getState.mockReturnValue({
            stages: {
                stages: [
                    {
                        stageInfo: {
                            products: [{ product_type: '310' }],
                        },
                        journeyType: 'ETC',
                    }
                ]
            }
        });
        
        getProductCategory.mockReturnValue('PL');
        
        const result = Rules_ad_2(mockProps, mockStageInfo);

        // Check if 'checkbook_request_note' and 'cheque_book_request' are added
        expect(result.validationObj.hidden[0]).toContain('checkbook_request_note');
        expect(result.validationObj.hidden[0]).toContain('cheque_book_request');
    });

    it('should add embossed_name_2 and preferred_limit_etc when journeyType is ETC and credit_limit_consent_a_1 is N', () => {
        store.getState.mockReturnValue({
            stages: {
                stages: [
                    {
                        stageInfo: {
                            products: [{ product_type: '334' }],
                            applicants: {
                                credit_limit_consent_a_1: 'N'
                            }
                        },
                        journeyType: 'ETC',
                    }
                ]
            }
        });
        
        getProductCategory.mockReturnValue('PL');
        
        const result = Rules_ad_2(mockProps, mockStageInfo);

        // Check if 'embossed_name_2' and 'preferred_limit_etc' are added
        expect(result.validationObj.hidden[0]).toContain('embossed_name_2');
        expect(result.validationObj.hidden[0]).toContain('preferred_limit_etc');
    });

    it('should not add preferred_limit_etc if credit_limit_consent_a_1 is Y', () => {
        mockStageInfo.applicants["credit_limit_consent_a_1"] = 'Y';
        
        store.getState.mockReturnValue({
            stages: {
                stages: [
                    {
                        stageInfo: {
                            products: [{ product_type: '334' }],
                            applicants: {
                                credit_limit_consent_a_1: 'Y'
                            }
                        },
                        journeyType: 'ETC',
                    }
                ]
            }
        });
        
        getProductCategory.mockReturnValue('PL');
        
        const result = Rules_ad_2(mockProps, mockStageInfo);

        // Check that 'preferred_limit_etc' is not in hidden fields
        expect(result.validationObj.hidden[0]).not.toContain('preferred_limit_etc');
    });

    it('should return empty hidden fields if no conditions are met', () => {
        mockStageInfo.products[0].product_type = '999';  // a product type that doesn't match any condition
        
        store.getState.mockReturnValue({
            stages: {
                stages: [
                    {
                        stageInfo: {
                            products: [{ product_type: '999' }],
                        },
                        journeyType: 'XYZ',  // journeyType that doesn't match 'ETC'
                    }
                ]
            }
        });

        getProductCategory.mockReturnValue('PL');
        
        const result = Rules_ad_2(mockProps, mockStageInfo);

        // Check if no hidden fields were added
        expect(result.validationObj.hidden).toHaveLength(0);
    });
});
