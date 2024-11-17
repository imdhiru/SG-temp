import { CONSTANTS } from "../../../utils/common/constants";
import { store } from "../../../utils/store/store";
import {
  checkProductDetails,
  getProductCategory,
} from "../../../services/common-service";
import { authenticateType } from "../../../utils/common/change.utils";

export const stateUrl = (props: string) => {
  const tmpStore = store.getState().stages.stages[0].stageInfo;
  const getStateUrl = (stage: string) => {
    switch (stage) {
      case CONSTANTS.STAGE_NAMES.SSF_1:
        return CONSTANTS.STATE_URLS.SUPER_SHORT_FORM;
      case CONSTANTS.STAGE_NAMES.SSF_2:
        return CONSTANTS.STATE_URLS.MYINFO_DETAILS;
      case CONSTANTS.STAGE_NAMES.BD_2:
        return CONSTANTS.STATE_URLS.PERSONAL_DETAILS;
      case CONSTANTS.STAGE_NAMES.BD_3:
        return CONSTANTS.STATE_URLS.EMPLOYMENT;
      case CONSTANTS.STAGE_NAMES.DOC:
        return CONSTANTS.STATE_URLS.DOCUMENTS;
      case CONSTANTS.STAGE_NAMES.AD_1:
        return CONSTANTS.STATE_URLS.TAX_DETAILS;
      case CONSTANTS.STAGE_NAMES.AD_2: {
        const productCategory = getProductCategory(tmpStore.products);
        if (productCategory === "CC") {
          return CONSTANTS.STATE_URLS.CREDIT_CARD_DETAILS;
        } else if (productCategory === "PL") {
          return CONSTANTS.STATE_URLS.LOAN_DETAILS;
        } else {
          return CONSTANTS.STATE_URLS.ADDITIONAL_DATA;
        }
      }
      case CONSTANTS.STAGE_NAMES.ACD:
        return CONSTANTS.STATE_URLS.CREDIT_LIMIT;
      case CONSTANTS.STAGE_NAMES.RP:
        return CONSTANTS.STATE_URLS.REVIEW;
      case CONSTANTS.STAGE_NAMES.FFD_1:
        return CONSTANTS.STATE_URLS.THANKYOU;
        case CONSTANTS.STAGE_NAMES.LD_1:
        return CONSTANTS.STATE_URLS.LOAN_CALCULATOR;
      default:
        return CONSTANTS.STATE_URLS.SUPER_SHORT_FORM;
    }
  };
  window.history.replaceState("", "", "/" + getStateUrl(props));
};

export const getStageName = (
  stages: string,
  applicationJourney: string | null
) => {
  const tmpStore = store.getState().stages.stages[0].stageInfo;
  const checkProductCategory = checkProductDetails(tmpStore.products);
  const productCategory = getProductCategory(tmpStore.products);
  const flowType = authenticateType();
  if (
    applicationJourney === "NTC" &&
    tmpStore.applicants["auth_mode_a_1"] === "IX"
  ) {
    applicationJourney = "ETC";
  }
  debugger;
  const getStateUrl = (stage: string) => {
    if (applicationJourney === "ETC") {
      switch (stage) {
        case CONSTANTS.STAGE_NAMES.AD_1:
          return tmpStore.applicant_documents &&
            tmpStore.applicant_documents.length > 0
            ? CONSTANTS.STAGE_NAMES.DOC
            : CONSTANTS.STAGE_NAMES.BD_1;
        case CONSTANTS.STAGE_NAMES.AD_2:
          if (!checkProductCategory) {
            if (productCategory === "PL") {
              return CONSTANTS.STAGE_NAMES.LD_1;
            } else if (
              tmpStore.applicant_documents &&
              tmpStore.applicant_documents.length > 0
            ) {
              return CONSTANTS.STAGE_NAMES.DOC;
            } else if (
              tmpStore.applicants &&
              tmpStore.applicants.last_updated_credit_limit_date_flag &&
              tmpStore.applicants.last_updated_credit_limit_date_flag === "N"
            ) {
              return CONSTANTS.STAGE_NAMES.BD_3;
            } else {
              return CONSTANTS.STAGE_NAMES.BD_1;
            }
          }
          return CONSTANTS.STAGE_NAMES.AD_1;
        case CONSTANTS.STAGE_NAMES.RP:
          if (!checkProductCategory) {
            if (tmpStore.applicants.credit_limit_consent_a_1 === "N") {
              if (productCategory === "PL") {
                return CONSTANTS.STAGE_NAMES.AD_2;
              } else {
                return CONSTANTS.STAGE_NAMES.BD_3;
              }
            } else {
              return CONSTANTS.STAGE_NAMES.AD_2;
            }
          }
          return CONSTANTS.STAGE_NAMES.AD_2;
        case CONSTANTS.STAGE_NAMES.DOC:
          if (!checkProductCategory) {
            if (
              tmpStore.applicants &&
              tmpStore.applicants.last_updated_credit_limit_date_flag &&
              tmpStore.applicants.last_updated_credit_limit_date_flag === "N"
            ) {
              return CONSTANTS.STAGE_NAMES.BD_3;
            } else if (productCategory === "PL") {
              return CONSTANTS.STAGE_NAMES.LD_1;
            } else {
              return CONSTANTS.STAGE_NAMES.BD_1;
            }
          }
          return CONSTANTS.STAGE_NAMES.BD_1;
        case CONSTANTS.STAGE_NAMES.BD_3:
          if (
            tmpStore.applicants &&
            tmpStore.applicants.last_updated_credit_limit_date_flag &&
            tmpStore.applicants.last_updated_credit_limit_date_flag === "N" &&
            productCategory === "PL"
          ) {
            return CONSTANTS.STAGE_NAMES.BD_1;
          } else if (productCategory === "PL") {
            return CONSTANTS.STAGE_NAMES.LD_1;
          } else {
            return CONSTANTS.STAGE_NAMES.BD_1;
          }
        case CONSTANTS.STAGE_NAMES.ACD: {
          return CONSTANTS.STAGE_NAMES.AD_2;
        }
        case CONSTANTS.STAGE_NAMES.LD_1:
          if (
            tmpStore.applicant_documents &&
            tmpStore.applicant_documents.length > 0
          ) {
            return CONSTANTS.STAGE_NAMES.DOC;
          } else if (
            tmpStore.applicants &&
            tmpStore.applicants.last_updated_credit_limit_date_flag &&
            tmpStore.applicants.last_updated_credit_limit_date_flag === "N"
          ) {
            return CONSTANTS.STAGE_NAMES.BD_3;
          } else {
            return CONSTANTS.STAGE_NAMES.BD_1;
          }
        default:
          return CONSTANTS.STAGE_NAMES.BD_1;
      }
    } else {
      switch (stage) {
        case CONSTANTS.STAGE_NAMES.BD_3:
          
          if (productCategory === "PL") {
            //PL flow
            return CONSTANTS.STAGE_NAMES.LD_1;
          } else if (flowType === "manual") {
            // Manual flow
            return CONSTANTS.STAGE_NAMES.BD_2;
          } else {
            return CONSTANTS.STAGE_NAMES.BD_1;
          }
        case CONSTANTS.STAGE_NAMES.LD_1:
          if (flowType === "manual") {
            // Manual flow
            return CONSTANTS.STAGE_NAMES.BD_2;
          } else {
            return CONSTANTS.STAGE_NAMES.BD_1;
          }
        //case LD_1 --> bd_2 --> bd_1
        case CONSTANTS.STAGE_NAMES.BD_2: // Manual
          return CONSTANTS.STAGE_NAMES.BD_1;
        case CONSTANTS.STAGE_NAMES.SSF_2:
          return applicationJourney
            ? CONSTANTS.STAGE_NAMES.BD_1
            : CONSTANTS.STAGE_NAMES.SSF_1;
        case CONSTANTS.STAGE_NAMES.DOC:
          return CONSTANTS.STAGE_NAMES.BD_3;
        case CONSTANTS.STAGE_NAMES.AD_1:
          return tmpStore.applicant_documents &&
            tmpStore.applicant_documents.length > 0
            ? CONSTANTS.STAGE_NAMES.DOC
            : CONSTANTS.STAGE_NAMES.BD_3;
        case CONSTANTS.STAGE_NAMES.AD_2: {
          if (!checkProductCategory) {
            return tmpStore.applicant_documents &&
              tmpStore.applicant_documents.length > 0
              ? CONSTANTS.STAGE_NAMES.DOC
              : CONSTANTS.STAGE_NAMES.BD_3;
          } else {
            return CONSTANTS.STAGE_NAMES.AD_1;
          }
        }
        case CONSTANTS.STAGE_NAMES.RP: {
          return CONSTANTS.STAGE_NAMES.AD_2;
        }
        case CONSTANTS.STAGE_NAMES.ACD: {
          return CONSTANTS.STAGE_NAMES.AD_2;
        }
        default:
          return CONSTANTS.STAGE_NAMES.SSF_1;
      }
    }
  };
  return getStateUrl(stages);
};

/**
 * The method used to scroll to top on page landing
 */
export const pageScrollTop = () => {
  const appBodyElement = document.getElementsByClassName("app__body")[0];
  appBodyElement.scroll(0, 0);
};

export const nextStage = (
  stages: string,
  applicationJourney: string | null
) => {
  const flowType = authenticateType();
  const tmpStore = store.getState().stages.stages[0].stageInfo;
  const trustBank = store.getState().trustBank.trustBank;
  const checkProductCategory = checkProductDetails(tmpStore.products);
  const productCategory = getProductCategory(tmpStore.products);
  if (
    applicationJourney === "NTC" &&
    tmpStore.applicants["auth_mode_a_1"] === "IX"
  ) {
    applicationJourney = "ETC";
  }
  const nextStateUrl = (stage: string) => {
    if (applicationJourney === "ETC") {
      switch (stage) {
        case CONSTANTS.STAGE_NAMES.RP:
          return CONSTANTS.STAGE_NAMES.FFD_1;
        case CONSTANTS.STAGE_NAMES.AD_2: {
          if (!checkProductCategory) {
            if (
              trustBank &&
              trustBank.applicant &&
              trustBank.applicant.phoenix_customer_a_1 === "Y" &&
              trustBank.applicant.limit_porting_eligible_flag_a_1 === "Y" &&
              (trustBank.applicant.customer_consent_for_limit_porting_a_1 ===
                "Y" ||
                trustBank.applicant.customer_consent_for_limit_porting_a_1 ===
                  "P")
            ) {
              return CONSTANTS.STAGE_NAMES.ACD;
            } else {
              return CONSTANTS.STAGE_NAMES.RP;
            }
          } else {
            return CONSTANTS.STAGE_NAMES.RP;
          }
        }
        case CONSTANTS.STAGE_NAMES.BD_1: {
          /* if (productCategory === 'PL') {
            return CONSTANTS.STAGE_NAMES.LD_1;
          }*/
          if (!checkProductCategory) {
            if (
              tmpStore.applicants &&
              tmpStore.applicants.last_updated_credit_limit_date_flag &&
              tmpStore.applicants.last_updated_credit_limit_date_flag === "N"
            ) {
              return CONSTANTS.STAGE_NAMES.BD_3;
            } else if (productCategory === "PL") {
              return CONSTANTS.STAGE_NAMES.LD_1;
            } else if (
              tmpStore.applicant_documents &&
              tmpStore.applicant_documents.length > 0
            ) {
              return CONSTANTS.STAGE_NAMES.DOC;
            } else {
              return CONSTANTS.STAGE_NAMES.AD_2;
            }
          } else if (
            tmpStore.applicant_documents &&
            tmpStore.applicant_documents.length > 0
          ) {
            return CONSTANTS.STAGE_NAMES.DOC;
          } else {
            return CONSTANTS.STAGE_NAMES.AD_1;
          }
        }
        case CONSTANTS.STAGE_NAMES.SSF_2: {
          /*if (productCategory === 'PL') {
            return CONSTANTS.STAGE_NAMES.LD_1;
          }*/
          if (!checkProductCategory) {
            //return CONSTANTS.STAGE_NAMES.BD_3;
            if (
              tmpStore.applicants &&
              tmpStore.applicants.last_updated_credit_limit_date_flag &&
              tmpStore.applicants.last_updated_credit_limit_date_flag === "N"
            ) {
              return CONSTANTS.STAGE_NAMES.BD_3;
            } else if (productCategory === "PL") {
              return CONSTANTS.STAGE_NAMES.LD_1;
            } else if (
              tmpStore.applicant_documents &&
              tmpStore.applicant_documents.length > 0
            ) {
              return CONSTANTS.STAGE_NAMES.DOC;
            } else {
              return CONSTANTS.STAGE_NAMES.AD_2;
            }
          } else if (
            tmpStore.applicant_documents &&
            tmpStore.applicant_documents.length > 0
          ) {
            return CONSTANTS.STAGE_NAMES.DOC;
          } else {
            return CONSTANTS.STAGE_NAMES.AD_1;
          }
        }
        case CONSTANTS.STAGE_NAMES.SSF_1: {
          /*if (productCategory === 'PL') {
            return CONSTANTS.STAGE_NAMES.LD_1;
          }*/
          if (!checkProductCategory) {
            //return CONSTANTS.STAGE_NAMES.BD_3;
            if (
              tmpStore.applicants &&
              tmpStore.applicants.last_updated_credit_limit_date_flag &&
              tmpStore.applicants.last_updated_credit_limit_date_flag === "N"
            ) {
              return CONSTANTS.STAGE_NAMES.BD_3;
            } else if (productCategory === "PL") {
              return CONSTANTS.STAGE_NAMES.LD_1;
            } else if (
              tmpStore.applicant_documents &&
              tmpStore.applicant_documents.length > 0
            ) {
              return CONSTANTS.STAGE_NAMES.DOC;
            } 
            // else if (flowType === "manual") {
            //   // Manual flow
            //   return CONSTANTS.STAGE_NAMES.BD_2;
            // }
             else {
              return CONSTANTS.STAGE_NAMES.AD_2;
            }
          } else if (
            tmpStore.applicant_documents &&
            tmpStore.applicant_documents.length > 0
          ) {
            return CONSTANTS.STAGE_NAMES.DOC;
          } else {
            return CONSTANTS.STAGE_NAMES.AD_1;
          }
        }
        case CONSTANTS.STAGE_NAMES.DOC: {
          if (
            tmpStore.applicants &&
            tmpStore.applicants.last_updated_credit_limit_date_flag &&
            tmpStore.applicants.last_updated_credit_limit_date_flag === "N" &&
            productCategory === "PL"
          ) {
            return CONSTANTS.STAGE_NAMES.LD_1;
          } else if (!checkProductCategory) {
            return CONSTANTS.STAGE_NAMES.AD_2;
          } else {
            return CONSTANTS.STAGE_NAMES.AD_1;
          }
          // return (!checkProductCategory) ? CONSTANTS.STAGE_NAMES.AD_2 : CONSTANTS.STAGE_NAMES.AD_1;
        }
        case CONSTANTS.STAGE_NAMES.AD_1:
          return CONSTANTS.STAGE_NAMES.AD_2;
        case CONSTANTS.STAGE_NAMES.ACD:
          return CONSTANTS.STAGE_NAMES.RP;
        case CONSTANTS.STAGE_NAMES.BD_3: {
          if (
            tmpStore.applicant_documents &&
            tmpStore.applicant_documents.length > 0
          ) {
            return CONSTANTS.STAGE_NAMES.DOC;
          } else if (!checkProductCategory) {
            if (
              tmpStore.applicants &&
              tmpStore.applicants.last_updated_credit_limit_date_flag &&
              tmpStore.applicants.last_updated_credit_limit_date_flag === "N" &&
              productCategory === "PL"
            ) {
              return CONSTANTS.STAGE_NAMES.LD_1;
            } else {
              if (tmpStore.applicants.credit_limit_consent_a_1 === "N") {
                return CONSTANTS.STAGE_NAMES.RP;
              } else {
                return CONSTANTS.STAGE_NAMES.AD_2;
              }
            }
          } else {
            return CONSTANTS.STAGE_NAMES.AD_1;
          }
        }
        case CONSTANTS.STAGE_NAMES.LD_1: {
          if (
            tmpStore.applicants &&
            tmpStore.applicants.last_updated_credit_limit_date_flag &&
            tmpStore.applicants.last_updated_credit_limit_date_flag === "N"
          ) {
            return CONSTANTS.STAGE_NAMES.AD_2;
          } else if (
            tmpStore.applicant_documents &&
            tmpStore.applicant_documents.length > 0
          ) {
            return CONSTANTS.STAGE_NAMES.DOC;
          } else {
            return CONSTANTS.STAGE_NAMES.AD_2;
          }
        }
        default:
          return CONSTANTS.STAGE_NAMES.SSF_1;
      }
    } else {
      switch (stage) {
        case CONSTANTS.STAGE_NAMES.RP:
          return CONSTANTS.STAGE_NAMES.FFD_1;
        case CONSTANTS.STAGE_NAMES.AD_2: {
          if (!checkProductCategory) {
            if (
              trustBank &&
              trustBank.applicant &&
              trustBank.applicant.phoenix_customer_a_1 === "Y" &&
              trustBank.applicant.limit_porting_eligible_flag_a_1 === "Y" &&
              (trustBank.applicant.customer_consent_for_limit_porting_a_1 ===
                "Y" ||
                trustBank.applicant.customer_consent_for_limit_porting_a_1 ===
                  "P")
            ) {
              return CONSTANTS.STAGE_NAMES.ACD;
            } else {
              return CONSTANTS.STAGE_NAMES.RP;
            }
          } else {
            return CONSTANTS.STAGE_NAMES.RP;
          }
        }
        case CONSTANTS.STAGE_NAMES.BD_1:
          if (flowType === "manual") {
            //Manual flow
            return CONSTANTS.STAGE_NAMES.BD_2;
          } else if (productCategory === "PL") {
            return CONSTANTS.STAGE_NAMES.LD_1;
          } else {
            return CONSTANTS.STAGE_NAMES.BD_3;
          }
        case CONSTANTS.STAGE_NAMES.SSF_2:
          return productCategory === "PL"
            ? CONSTANTS.STAGE_NAMES.LD_1
            : CONSTANTS.STAGE_NAMES.BD_3;
        case CONSTANTS.STAGE_NAMES.SSF_1:
          if (flowType === "manual") {
            //Manual flow
            return CONSTANTS.STAGE_NAMES.BD_2;
          } else if (productCategory === "PL") {
            return CONSTANTS.STAGE_NAMES.LD_1;
          } else {
            return CONSTANTS.STAGE_NAMES.BD_2;
          }
        case CONSTANTS.STAGE_NAMES.BD_2: //Manual flow
          if (productCategory === "PL") {
            return CONSTANTS.STAGE_NAMES.LD_1;
          } else {
            return CONSTANTS.STAGE_NAMES.BD_3;
          }
        case CONSTANTS.STAGE_NAMES.BD_3: {
          if (
            tmpStore.applicant_documents &&
            tmpStore.applicant_documents.length > 0
          ) {
            return CONSTANTS.STAGE_NAMES.DOC;
          } else {
            return !checkProductCategory
              ? CONSTANTS.STAGE_NAMES.AD_2
              : CONSTANTS.STAGE_NAMES.AD_1;
          }
        }
        case CONSTANTS.STAGE_NAMES.DOC: {
          return !checkProductCategory
            ? CONSTANTS.STAGE_NAMES.AD_2
            : CONSTANTS.STAGE_NAMES.AD_1;
        }
        case CONSTANTS.STAGE_NAMES.AD_1: {
          return CONSTANTS.STAGE_NAMES.AD_2;
        }
        case CONSTANTS.STAGE_NAMES.ACD:
          return CONSTANTS.STAGE_NAMES.RP;
        case CONSTANTS.STAGE_NAMES.LD_1:
          return CONSTANTS.STAGE_NAMES.BD_3;
        default:
          return CONSTANTS.STAGE_NAMES.SSF_1;
      }
    }
  };
  return nextStateUrl(stages);
};
