import { authenticateType, getUrl } from "../utils/common/change.utils";
import { KeyWithAnyModel } from "../utils/model/common-model";
import { checkProductDetails, sortByAscendingOrder } from "./common-service";
import submitService from "./submit-service";
import { store } from "../utils/store/store";

class service {
  formConfigPayload = (createResponse?: any) => {
    const productInfo:any = getUrl.getProductInfo();
    const productType = getUrl.getParameterByName("products")?getUrl.getParameterByName("products"): productInfo[0].product_type
    return {
      application: {
        branch_code: null,
        country_code: "SG",
        referral: "",
        referral_id: "",
        acquisition_channel: "",
        source_system_name: "sc.com",
        channel_reference: createResponse
          ? createResponse.application.channel_reference
          : "",
        application_reference: createResponse
          ? createResponse.application.application_reference
          : "",
        source_id: "",
        application_timestamp: "",
        priority_flag: "",
        response_type: "",
        total_applicants: 1,
        application_error_code: [],
        application_error_message: [],
        version: "",
        page_wise: "yes",
        tps_indicator: "",
        tps_creation_timestamp: "",
        ext_lead_reference_number: null,
        tmxSessionId: "80866c6f-a323-43bc-b30b-a95b874254b6",
        trueClientIP: null,
      },
      client: {
        journey: createResponse ? "prelogin_ntc_or_ntp" : null,
        "auth-type": createResponse ? authenticateType() : null,
        "login-type": createResponse ? "prelogin" : null,
        myinfo: {
          "myinfo-attributes": null,
          "myinfo-code": null,
          "myinfo-redirect-uri": null,
          "myinfo-client-id": null,
          "is-myinfo-virtual": null,
        },
      },
      stage: {
        page_id: createResponse ? "" : "ssf-1",
        stage_id: "",
        stage_name: "",
        stage_status: "",
        stage_params: {
          is_dedupe_required: "",
          current_applicant: "",
        },
        applicant_status: [],
      },
      applicants: {},
      products: productInfo,
      dedupeList: {},
      lov_desc: {},
      oz_templates: null,
      preApprovedData: {},
      productsInBundle: [productType],
    };
  };
  createPayload = (data: any, currentStageFields: any, url:string,isExit?:boolean) => {
    let applicantFields = {...currentStageFields}
    let payload: KeyWithAnyModel = {};
    let stageCode: string | null = null;
    payload = {
      application: {
        channel_reference: getUrl.getChannelRefNo().channelRefNo
      }
    };
    if(isExit){
      payload.application['save_exit'] = "Yes";
      
    }
    if(getUrl.getChannelRefNo().applicationRefNo !== null) {
      payload.application['application_reference'] = getUrl.getChannelRefNo().applicationRefNo;
    }
    const productsSelector = data.stageInfo.products;
    if(url.split("/").indexOf("create") !== -1){
      payload.application['tmxSessionId'] = getUrl.getChannelRefNo().tmxSessionId ? getUrl.getChannelRefNo().tmxSessionId:null
    }
    if (data.stageId === "ad-1" || data.stageId === "ad-2") {
      stageCode = "AD";
    } else if (data.stageId === "rp") {
      stageCode = "FFD";
    } else if (data.stageId === "ld-1") {
      stageCode = "LD";
    } else {
      stageCode = "BD";
    }
    if(url.split("/").indexOf("preserve") !== -1){
      payload.application.stage = {
        stage_id: stageCode,
        page_id: data.stageId,
      };
    }
    if(url.split("/").indexOf("create") !== -1){
      const refer = store.getState().referralcode.refer;
      const referralId = store.getState().referralcode.referId;
      if (refer === "true") {
        if (referralId !== null) {
          payload.application["referral_id_2"] = store.getState().referralcode.referId;
        } else {
          payload.application["referral_id_2"] = null;
        }
      }
      if (
        refer !== "true" ||
        store.getState().urlParam.resume
      ) {
        if (store.getState().referralcode.referId !== null)
          payload.application["referral_id_2"] =
            store.getState().referralcode.referId;
        else {
          payload.application["referral_id_2"] = null;
        }
      }
    }
    const isApplicant = Object.keys(applicantFields).length > 0;
    if (isApplicant) {
      for(let field in applicantFields) {
        if(applicantFields[field] === '' || applicantFields[field] === null) {
          delete applicantFields[field];
        }
        if (applicantFields.referral_id_2_a_1) {
          delete applicantFields["referral_id_2_a_1"];
        }
      }
      if(Object.keys(applicantFields).length > 0) {
        payload["applicant"] = applicantFields;
      }
      if(data.stageId === "ACD" && payload["applicant"]){
        payload["applicant"].amount_to_be_ported_a_1 = payload["applicant"].min_limit_a_1;
      }
      const windoObj: KeyWithAnyModel = window;
      if (windoObj._satellite && windoObj._satellite.getVisitorId() && windoObj._satellite.getVisitorId()._fields.MCMID && (data.stageId === 'ssf-1' || data.stageId === 'ssf-2')) {
        if (!payload.application) {
          payload.application = {};
        }
        payload.application['adobe_ecid'] = windoObj._satellite.getVisitorId()._fields.MCMID;
      }
      if (data.stageId === "ld-1") {
        const rate = getUrl.getRate();
        const rateStore = data.stageInfo.applicants;
        payload["applicant"].rbp_applied_rate_a_1 = rate.ar || rateStore['rbp_applied_rate_a_1'];
        payload["applicant"].rbp_effective_Interest_rate_a_1 = rate.eir || rateStore['rbp_effective_Interest_rate_a_1'];
      }
    }
    return sortByAscendingOrder(payload);
  };
  offerPayload = (data: any) => {
    let payload: KeyWithAnyModel = {};
    payload = {
      application: {
        channel_reference: getUrl.getChannelRefNo().channelRefNo
      }
    };

    if(getUrl.getChannelRefNo().applicationRefNo !== null) {
      payload.application['application_reference'] = getUrl.getChannelRefNo().applicationRefNo;
    }
    return sortByAscendingOrder(payload);
  }; 
  getCardActivationPayload = (data:any) => {
    let payload: KeyWithAnyModel = {};
    payload = {
      application_reference_no: getUrl.getChannelRefNo().applicationRefNo,
      country_code: "SG",
      applicant_sequence_no: "1",
      product_sequence_no: data.productSequenceNo,
      product_category: data.productCategory,
      product_type: data.productType,
      tracking_id: submitService.generateUUID
    };
    return sortByAscendingOrder(payload);
  }
}

const generatePayload = new service();

export default generatePayload;



import generatePayload from './service';
import { getUrl } from '../utils/common/change.utils';
import { store } from '../utils/store/store';
import submitService from './submit-service';

jest.mock('../utils/common/change.utils', () => ({
  getUrl: {
    getProductInfo: jest.fn(),
    getParameterByName: jest.fn(),
    getChannelRefNo: jest.fn(),
    getRate: jest.fn(),
  },
}));

jest.mock('../utils/store/store', () => ({
  store: {
    getState: jest.fn(),
  },
}));

jest.mock('./submit-service', () => ({
  generateUUID: jest.fn(() => 'mock-uuid'),
}));

describe('Service class', () => {
  describe('formConfigPayload', () => {
    it('should generate payload with product info and default product type', () => {
      const mockProductInfo = [{ product_type: 'mockType' }];
      (getUrl.getProductInfo as jest.Mock).mockReturnValue(mockProductInfo);
      (getUrl.getParameterByName as jest.Mock).mockReturnValue(null);

      const result = generatePayload.formConfigPayload();
      expect(result.products).toEqual(mockProductInfo);
      expect(result.productsInBundle).toEqual(['mockType']);
    });

    it('should generate payload with product type from URL', () => {
      (getUrl.getProductInfo as jest.Mock).mockReturnValue([]);
      (getUrl.getParameterByName as jest.Mock).mockReturnValue('URLType');

      const result = generatePayload.formConfigPayload();
      expect(result.productsInBundle).toEqual(['URLType']);
    });
  });

  describe('createPayload', () => {
    it('should generate payload with application reference', () => {
      (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
        channelRefNo: 'mock-channel',
        applicationRefNo: 'mock-app-ref',
      });

      const result = generatePayload.createPayload(
        { stageInfo: {}, stageId: 'mock-stage' },
        {},
        'mock/url'
      );

      expect(result.application.channel_reference).toBe('mock-channel');
      expect(result.application.application_reference).toBe('mock-app-ref');
    });

    it('should add save_exit flag if isExit is true', () => {
      (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
        channelRefNo: 'mock-channel',
        applicationRefNo: null,
      });

      const result = generatePayload.createPayload(
        { stageInfo: {}, stageId: 'mock-stage' },
        {},
        'mock/url',
        true
      );

      expect(result.application.save_exit).toBe('Yes');
    });
  });

  describe('offerPayload', () => {
    it('should generate payload with channel reference', () => {
      (getUrl.getChannelRefNo as jest.Mock).mockReturnValue({
        channelRefNo: 'mock-channel',
        applicationRefNo: 'mock-app-ref',
      });

      const result = generatePayload.offerPayload({});
      expect(result.application.channel_reference).toBe('mock-channel');
      expect(result.application.application_reference).toBe('mock-app-ref');
    });
  });

  describe('getCardActivationPayload', () => {
    it('should generate payload with product details', () => {
      const result = generatePayload.getCardActivationPayload({
        productSequenceNo: '1',
        productCategory: 'mock-category',
        productType: 'mock-type',
      });

      expect(result.application_reference_no).toBeUndefined(); // Assuming getChannelRefNo().applicationRefNo is null
      expect(result.country_code).toBe('SG');
      expect(result.applicant_sequence_no).toBe('1');
      expect(result.product_sequence_no).toBe('1');
      expect(result.product_category).toBe('mock-category');
      expect(result.product_type).toBe('mock-type');
      expect(result.tracking_id).toBe('mock-uuid');
    });
  });
});

