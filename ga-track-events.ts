import TagManager from "react-gtm-module";
import { getUrl } from "../utils/common/change.utils";
import { KeyWithAnyModel } from "../utils/model/common-model";
import { store } from "../utils/store/store";
import { CONSTANTS } from "../utils/common/constants";
import { getProductCategory } from "./common-service";

class service {
    getProductsInfoForGA = (stage: KeyWithAnyModel) => {
        let response: Array<{}> = [];
        const products = stage.stages.stages[0].stageInfo.products;
        products.forEach((product: KeyWithAnyModel) => {
            response.push({
                name: product.name.toLowerCase().replace(/ /g, "-"), // string in required format
                id: product.product_type, // id of product  string (can be populated from backend CRM)
                price: "0",
                brand: "scb", // constant
                category: product.product_category === 'CC' ? 'credit-cards' : product.product_category === 'CA' ? 'current-account' : product.product_category === 'SA' ? 'savings-account' : 'borrow',
                categoryForPgViewEvnt: product.product_category === "CC" ? "credit-cards" : "borrow",
                variant: "deposits", // constant
                quantity: 1, // integer always 1
                campaignCode: product.campaign
            });
        });
        return response;
    };

    getStepPath = (stage: any) => {
        let stageId = stage.stages.stages[0].stageId;
        let journeyType = stage.stages.journeyType;
        let journeyCtnType;
        const productCategory = getProductCategory(stage.stages.stages[0].stageInfo.products);
        if (journeyType === "ETC") {
            journeyCtnType =
                productCategory === "CA" || productCategory === "SA"
                    ? "ETC_CASA"
                    : "ETC_CC";
        } else {
            journeyCtnType =
                productCategory === "CA" || productCategory === "SA"
                    ? "NON_ETC_CASA"
                    : "NON_ETC_CC";
        }
        const steps: KeyWithAnyModel = CONSTANTS[journeyCtnType];
        return steps[stageId];
    };

    pageView = (eventName: string, isStp?: boolean) => {
        const stage = store.getState();
        if (
            stage &&
            stage.stages.stages &&
            stage.stages.stages.length > 0 &&
            stage.stages.stages[0].stageInfo && getUrl.getParameterByName("auth") !== "upload"
            && !store.getState().stages.isDocumentUpload
        ) {
            let productsInfo = this.getProductsInfoForGA(stage);
            let product: KeyWithAnyModel = productsInfo[0];
            let stepName = this.getStepPath(stage);
            let code = getUrl.getParameterByName("instance");
            let productName = "";
            let subProductName = "";
            let campaignCode = "";
            productsInfo.forEach(function (product: KeyWithAnyModel, index: number) {
                let subCategoryName = product.name;
                if (index >= 1) {
                    productName += "|" + productName + "|" + product.category;
                    subProductName += "|" + subProductName + "|" + subCategoryName;
                    campaignCode += "|" + campaignCode + "|" + product.campaignCode;
                } else {
                    productName = product.category;
                    subProductName = subCategoryName;
                    campaignCode = product.campaignCode;
                }
            });
            let pageViewEvent: KeyWithAnyModel = {};
            pageViewEvent = {
                CountryCode: "sg",
                ProductName: productName,
                SubProductName: subProductName,
                FormStep: stepName,
                Language: "en",
                event: "RTOBPageview",
                offerCode: campaignCode,
            };
            let bundleProduct = productsInfo.length > 1 ? "/bundled" : "";

            if (eventName === "basic-info") {
                pageViewEvent.Pageview =
                    "/sg/" +
                    product.categoryForPgViewEvnt +
                    "/" +
                    product.name +
                    bundleProduct +
                    "/apply/step/" +
                    stepName +
                    (code !== "" && code ? "?instance=" + code : "");

            } else {
                let clientType = stage.stages.journeyType ? stage.stages.journeyType.toLowerCase() : "na";
                pageViewEvent.Pageview =
                    "/sg/" +
                    product.categoryForPgViewEvnt +
                    "/" +
                    product.name +
                    (clientType === "etb" ? "-clients" : "") +
                    "/apply/step/" +
                    stepName +
                    (code !== "" && code ? "?instance=" + code : "");
                pageViewEvent.ClientType = clientType;
                pageViewEvent.ApplicationNumber = getUrl.getChannelRefNo().applicationRefNo;

                if (stepName === 'Thank You') {
                    pageViewEvent.ApprovalStatus = isStp ? 'approved' : 'pending';
                }
            }

            if (getUrl.getParameterByName("source") === "scmobile_offers") {
                pageViewEvent.ReferralSource = "SC Mobile - Offers Flow";
            }
            TagManager.dataLayer({ dataLayer: pageViewEvent });
        }
    };
}

const gaTrackEvents = new service();

export default gaTrackEvents;