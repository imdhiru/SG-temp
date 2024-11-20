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









import Rules_bd_2 from './Rules_bd_2';
import { authenticateType } from '../../utils/common/change.utils';
import { checkProductDetails } from '../../services/common-service';
import rulesUtils from './rules.utils';

// Mock the dependencies
jest.mock('../../utils/common/change.utils', () => ({
  authenticateType: jest.fn(),
  getUrl: jest.fn(),
}));

jest.mock('../../services/common-service', () => ({
  checkProductDetails: jest.fn(),
}));

jest.mock('./rules.utils', () => jest.fn());

describe('Rules_bd_2', () => {
  const mockProps = { someProp: 'value' };
  const mockStageInfo = {
    products: ['product1'],
    applicants: {
      residency_status_a_1: 'FR',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle manual or myinfo authentication type and CASA product', () => {
    // Mock the return values of dependencies
    authenticateType.mockReturnValue('manual');
    checkProductDetails.mockReturnValue(true);

    const expectedValidationObj = {
      nonEditable: [],
      hidden: [
        [
          'postal_code_other',
          'email',
          'full_name',
          'date_of_birth',
          'mobile_number',
          'residency_status',
          'NRIC',
          'work_type',
          'year_of_assessment_fff_1',
          'year_of_assessment_fff_2',
          'annual_income_fff_1',
          'annual_income_fff_2',
          'dsa_code',
          'credit_limit_consent',
        ],
      ],
      modifyVisibility: [
        ['residential_address_consent'],
      ],
    };

    Rules_bd_2(mockProps, mockStageInfo);

    expect(rulesUtils).toHaveBeenCalledWith(mockProps, expectedValidationObj);
  });

  it('should include nationality_add in hidden fields if not a CASA product', () => {
    // Mock the return values of dependencies
    authenticateType.mockReturnValue('manual');
    checkProductDetails.mockReturnValue(false);

    const expectedValidationObj = {
      nonEditable: [],
      hidden: [
        [
          'postal_code_other',
          'email',
          'full_name',
          'date_of_birth',
          'mobile_number',
          'residency_status',
          'NRIC',
          'work_type',
          'year_of_assessment_fff_1',
          'year_of_assessment_fff_2',
          'annual_income_fff_1',
          'annual_income_fff_2',
          'dsa_code',
          'credit_limit_consent',
          'nationality_add',
        ],
      ],
      modifyVisibility: [
        [
          'overseas_contact_country_code',
          'overseas_contact_area_code',
          'overseas_contact_no',
          'residential_address_consent',
        ],
      ],
    };

    Rules_bd_2(mockProps, mockStageInfo);

    expect(rulesUtils).toHaveBeenCalledWith(mockProps, expectedValidationObj);
  });

  it('should not modify visibility if residency status is not FR', () => {
    // Update the mockStageInfo to change residency_status_a_1
    const updatedMockStageInfo = {
      ...mockStageInfo,
      applicants: {
        residency_status_a_1: 'NON-FR',
      },
    };

    authenticateType.mockReturnValue('myinfo');
    checkProductDetails.mockReturnValue(false);

    const expectedValidationObj = {
      nonEditable: [],
      hidden: [
        [
          'postal_code_other',
          'email',
          'full_name',
          'date_of_birth',
          'mobile_number',
          'residency_status',
          'NRIC',
          'work_type',
          'year_of_assessment_fff_1',
          'year_of_assessment_fff_2',
          'annual_income_fff_1',
          'annual_income_fff_2',
          'dsa_code',
          'credit_limit_consent',
          'nationality_add',
        ],
      ],
      modifyVisibility: [
        ['residential_address_consent'],
      ],
    };

    Rules_bd_2(mockProps, updatedMockStageInfo);

    expect(rulesUtils).toHaveBeenCalledWith(mockProps, expectedValidationObj);
  });
});

