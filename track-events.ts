import { getUrl } from "../utils/common/change.utils";
import { store } from "../utils/store/store";
import { KeyWithAnyModel } from "../utils/model/common-model";
import { getDeviceType } from '../utils/common/change.utils';
import { getUserType, getErrorType, loginval, getStepName } from '../utils/adobe/constant';

class service {

    documentList = (docResponse: KeyWithAnyModel) => {
        let fields = [];
        if (docResponse.length > 0) {
            docResponse.forEach((docResp: KeyWithAnyModel) => {
                if(docResp && docResp.document_list){
                    docResp.document_list.forEach((document_list: KeyWithAnyModel) => {
                        if(document_list && document_list.document_options){
                            document_list.document_options.forEach((document_options: KeyWithAnyModel) => {
                                if(document_options && document_options.document_types){
                                    document_options.document_types.forEach((document_types: KeyWithAnyModel) => {
                                        if(document_types.uploaded_documents){
                                            fields.push({
                                                formFieldName: `${document_list.document_category} Uploaded`,
                                                formFieldValue: (document_types.uploaded_documents.length > 0) ? 'Yes' : 'No'
                                            }) 
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            fields.push({
                formFieldName: 'na',
                formFieldValue: "na"
            })
        }
        return fields;
    }

    getFormFieldValue = (labelName: string, stage: KeyWithAnyModel, lov: string) => {
        let finalValue = 'na';
        let stageApplicant = labelName.concat('_a_1')
        let value = (stage.stages.userInput && stage.stages.userInput.applicants) ? stage.stages.userInput.applicants[stageApplicant] : null;
        if (!value) {
            value = (stage.stages.stages[0].stageInfo.applicants) ? stage.stages.stages[0].stageInfo.applicants[stageApplicant] : null;
        }
        if (value) {
            if (lov === 'Yes') {
                const lovData = stage.lov.lov;
                if (lovData) {
                    const lovValues = lovData.find((lovs: KeyWithAnyModel) => lovs.label === labelName);
                    if (lovValues) {
                        const lovValue = lovValues.value.find((lov: KeyWithAnyModel) => lov.CODE_VALUE === value)
                        if (lovValue) {
                            finalValue = lovValue.CODE_DESC;
                        }
                    }
                }
            } else if (lov === 'No') {
                finalValue = value;
            }

        }
        return finalValue;
    }

    getFormFields(stageId: string, stage: KeyWithAnyModel, logicalNames: Array<string>){
        let formFields: Array<{}> = [];
        logicalNames.forEach(logicalName => {
            const currentStage = stage.stages.stages[0].stageInfo.fieldmetadata.data.stages.find((stage : KeyWithAnyModel) => stage.stageId === stageId);
            if(currentStage){
               const field = currentStage.fields.find( (field : KeyWithAnyModel) => field.logical_field_name === logicalName)
                if(field){
                    formFields.push({
                        formFieldValue : this.getFormFieldValue(logicalName, stage, field.lov),
                        formFieldName : this.getLabelName(field.rwb_label_name)
                    })
                }
            }
        })
        return formFields ;
    }

    getLabelName(label: string) {
        switch (label) {
            case 'Tenor & monthly repayment': {
                return 'Tenor';
            }
            default: {
                return label;
            }
        }
    }

    getFormFieldsByScreenName = (stage: KeyWithAnyModel) => {
        let formFileds: Array<{}> = [];
            switch (stage.stages.stages[0].stageId.toLowerCase()) {
                case 'ssf-1': {
                    formFileds = this.getFormFields(stage.stages.stages[0].stageId.toLowerCase(), stage, ['residency_status', 'ownership_status'])
                    break;
                }
                case 'ssf-2': {
                    formFileds = this.getFormFields(stage.stages.stages[0].stageId.toLowerCase(), stage, ['residency_status', 'ownership_status', 'marital_status', 'gender', 'nationality', 'country_of_birth'])
                    break;
                }
                case 'bd-1': {
                    formFileds = this.getFormFields(stage.stages.stages[0].stageId.toLowerCase(), stage, ['residency_status', 'ownership_status'])
                    break;
                }
                case 'bd-3': {
                    formFileds = this.getFormFields(stage.stages.stages[0].stageId.toLowerCase(), stage, ['work_type', 'job_title', 'nature_of_employer','office_phone_number'])
                    break;
                }
                case 'ld-1': {
                    formFileds = this.getFormFields(stage.stages.stages[0].stageId.toLowerCase(), stage, ['required_annual_income', 'required_loan_amount', 'loan_tenor'])
                    break;
                }

            }
        return formFileds;
    }

    triggerAdobeEvent = (eventName: string, buttonName?: string, docResponse?: KeyWithAnyModel, errType?: string) => {
        if(getUrl.getParameterByName("auth") !== "upload" && !store.getState().stages.isDocumentUpload){
        const stage = store.getState();
        const appRefNo = getUrl.getChannelRefNo().applicationRefNo;
        if (stage && stage.stages && stage.stages.stages && stage.stages.stages.length > 0 && stage.stages.stages[0].stageInfo) {
            let stepName = getStepName(stage);
            let dataLayer: KeyWithAnyModel = this.getAdobeDataLayer(eventName, stage, stepName);
            if (eventName === 'formStart') {
                dataLayer.page.attributes.pfm = loginval();
                if (!(window.sessionStorage.isFromFFF === "true")) {
                    const aggregator_code = (stage.urlParam && stage.urlParam.aggregators && stage.urlParam.aggregators.aggregator_code) ? stage.urlParam.aggregators.aggregator_code : 'na';
                    const aggregator_type = (stage.urlParam && stage.urlParam.aggregators && stage.urlParam.aggregators.aggregator_type) ? stage.urlParam.aggregators.aggregator_type : 'na';
                    const aggregator_instance = (stage.urlParam && stage.urlParam.aggregators && stage.urlParam.aggregators.aggregator_instance) ? stage.urlParam.aggregators.aggregator_instance : 'na';
                    const intcid = localStorage.getItem("intcid") ? localStorage.getItem("intcid") : 'na';
                    if (intcid !== 'na') {
                        localStorage.removeItem("intcid");
                    }
                    const subchancode = 'na'
                    const refid = 'na'
                    const referId = 'na'
                    const instance = 'na'
                    const camp_id = 'na'
                    const pid = 'na'
                    const promoCode = 'na'
                    const promo = 'na'
                    const state = 'na'
                    dataLayer.campaign = {
                        internal: {
                            campaignName: 'aggregator_code:aggregator_type:aggregator_instance:intcid:subchancode:refid:referId:instance:camp_id:pid:promoCode:promo:state',
                            campaignValue: aggregator_code + ':' + aggregator_type + ':' + aggregator_instance + ':' + intcid + ':' + subchancode + ':' + refid + ':' + referId + ':' + instance + ':' + camp_id + ':' + pid + ':' + promoCode + ':' + promo + ':' + state
                        }
                    }
                } else {
                    delete window.sessionStorage.isFromFFF;
                }
                window.adobeDataLayer.push(dataLayer);
            }
            else if (eventName === 'ctaClick') {
                const popupName = errType;
                if (buttonName === 'Continue') {
                    const stageId = stage.stages.stages[0].stageId;
                    if (stageId !== 'doc') {
                        dataLayer.form.formFields = this.getFormFieldsByScreenName(stage)
                    } else if (stageId === 'doc' && docResponse) {
                        dataLayer.form.formFields = this.documentList(docResponse);
                    }
                    if (stageId === 'rp') {
                        buttonName = 'Agree and Submit';
                    }
                }
                dataLayer.customLinkClick = {
                    'customLinkText': buttonName,
                    'customLinkRegion': buttonName === 'Login' ? 'top' : 'bottom',
                    'customLinkType': 'button'
                }
                if(popupName){
                    dataLayer.form.popupName = popupName;
                }
                window.adobeDataLayer.push(dataLayer);
            }
            else if (eventName === 'formStepCompletions') {
                dataLayer.form.refNum = appRefNo !== null ? appRefNo : 'na';
                dataLayer.form.formFields = [
                    {
                        formFieldValue: 'na',
                        formFieldName: 'na'
                    }];
                window.adobeDataLayer.push(dataLayer);
            }
            else if (eventName === 'formSubmit' && !window.adobeDataLayer.find((eachEvent: KeyWithAnyModel) => eachEvent.event === 'formSubmit')) {
                dataLayer.form.refNum = appRefNo !== null ? appRefNo : 'na';
                dataLayer.form.appStatus = 'Complete';
                if (stage.stages.userInput.applicants.insurance_consent_a_1) {
                    dataLayer.form.formFields = [
                        {
                            formFieldValue: stage.stages.userInput.applicants.insurance_consent_a_1 === 'Y' ? 'Yes' : 'No',
                            formFieldName: 'Insurance product selected'
                        }];
                }
                else {
                    dataLayer.form.formFields = [
                        {
                            formFieldValue: 'na',
                            formFieldName: 'na'
                        }];
                }
                window.adobeDataLayer.push(dataLayer);
            }
            else if (eventName === 'formAbandonment' && !window.adobeDataLayer.find((eachEvent: KeyWithAnyModel) => ( eachEvent.event === 'formSubmit' || eachEvent.event === 'formAbandonment'))) {
                dataLayer.form.refNum = appRefNo !== null ? appRefNo : 'na';
                dataLayer.form.formLastAccessedField = stage.lastAccessed.fieldFocused ? stage.lastAccessed.fieldFocused : 'na';
                dataLayer.form.formFields = [
                    {
                        formFieldValue: 'na',
                        formFieldName: 'na'
                    }];
                dataLayer.customLinkClick = {
                    'customLinkText': buttonName,
                    'customLinkRegion': buttonName === 'Login' ? 'top' : 'bottom',
                    'customLinkType': 'button'
                }
                window.adobeDataLayer.push(dataLayer);
            }
            else if (eventName === 'formError') {
                const error = store.getState().error.errors;
                const exception: KeyWithAnyModel = store.getState().error.exceptionList;
                dataLayer.form.refNum = appRefNo !== null ? appRefNo : 'na';
                if (error.length > 0) {
                    dataLayer.error = [{
                        errorCode: error[0].statusCode ? error[0].statusCode : exception[0].error_type ? exception[0].error_type : 'na',
                        errorField: stepName,
                        errorDescription: error[0].statusText ? error[0].statusText : exception[0].status ? exception[0].status : 'na'
                    }]
                } 
                else if(exception && exception.errorList && exception.errorList.errors && exception.errorList.errors.length > 0){
                    dataLayer.error = [{
                        errorCode: exception.errorList.errors[0].code ? exception.errorList.errors[0].code : 'na',
                        errorField: stepName,
                        errorDescription: exception.errorList.errors[0].detail ? exception.errorList.errors[0].detail : exception.error_header
                    }]
                }  else {
                    dataLayer.error = [{
                        errorCode: 'na',
                        errorField: stepName,
                        errorDescription: 'na'
                    }]
                }
                dataLayer.customLinkClick = {
                    customLinkText: errType ? getErrorType(errType.toUpperCase()) : 'na',
                    customLinkRegion: 'bottom',
                    customLinkType: 'button'
                }
                window.adobeDataLayer.push(dataLayer);
            }
            else if (eventName === 'popupViewed') {
                const lastEvent: KeyWithAnyModel =  window.adobeDataLayer[window.adobeDataLayer.length-1];
                if (!lastEvent || (lastEvent && lastEvent.event !== 'popupViewed')) {
                    dataLayer.form.refNum = appRefNo !== null ? appRefNo : 'na';
                    dataLayer.form.formFields = [{
                        formFieldValue: 'na',
                        formFieldName: 'na'
                    }];
                    dataLayer.form.popupName = buttonName ? buttonName : 'na'
                    window.adobeDataLayer.push(dataLayer);
                }
            }

            else if (eventName === 'formResume') {
                    let resumeRetriggered = false;
                    let adobeObj = window.adobeDataLayer;
                    adobeObj.map((v) => {
                        let { event }: any = v;
                        if (event === 'formResume') {
                            resumeRetriggered = true;
                        }
                        return resumeRetriggered;
                    })
                    if (!resumeRetriggered) {
                        dataLayer.form.refNum = appRefNo !== null ? appRefNo : 'na';
                        window.adobeDataLayer.push(dataLayer);
                    }
                }
        }
        else{
            let exception: KeyWithAnyModel = stage.error.exceptionList; 
            if (exception.length !== 0 && (exception.errorList.errors[0].code === 'BZ01' || exception.errorList.errors[0].code === 'MYINFOERROR01')){
                const stepName = 'apply';
                let dataLayer: KeyWithAnyModel = this.getAdobeMyinfoDataLayer(eventName, stage, stepName);
                if(eventName === 'formError' && window.adobeDataLayer.length < 1) {
                    dataLayer.form.refNum = appRefNo !== null ? appRefNo : 'na';
                    window.adobeDataLayer.push(dataLayer);
                }
                else if(eventName === 'ctaClick') {
                    dataLayer.customLinkClick = {
                        'customLinkText': buttonName,
                        'customLinkPosition': buttonName === 'Login' ? 'top' : 'bottom',
                        'customLinkType': 'button'
                    }
                    window.adobeDataLayer.push(dataLayer);
                    let errorBlock: any = window.adobeDataLayer[1];
                    delete errorBlock.error;
                }
            } 
        }
    }
}

    getProductInfo = (stage: KeyWithAnyModel) => {
        //add doc upload for resume 
        if(getUrl.getParameterByName("auth") !== "upload" && !store.getState().stages.isDocumentUpload){
        let info: Array<{}> = [];
        let formName = '';
        let productCategory = '';
        let productName = '';
        const products = stage.stages.stages[0].stageInfo.products;
        products.forEach((product: KeyWithAnyModel) => {
            const formNameCheck = product.product_category === 'CC' || product.product_category === 'PL' ? 'SG_CCPL' : 'SG_CASA';
        info.push({
                productInfo: {
                    productName: product.name,
                    productID: product.product_type,
                    productCategory: product.product_category,
                    productSubCategory: 'na',
                }
            });
            info.push({
                formInfo: {
                        formName : formName ? (formName + '|' + formNameCheck) : formNameCheck,
                        productCategory : productCategory ? (productCategory + '|' + product.product_category) : product.product_category,
                      productName : productName ? (productName + '|' + product.name) : product.name
                }
            })
        });

    return info;
    }
    else{
        return[]; 
    } 
 }      

    getAdobeDataLayer = (eventName: string, stage: KeyWithAnyModel, stepName: string) => {
        //add doc upload for resume 
        if(getUrl.getParameterByName("auth") !== "upload" && !store.getState().stages.isDocumentUpload){
        const product = this.getProductInfo(stage);
        const formInfo: KeyWithAnyModel = product[1]
        const channelRef = getUrl.getChannelRefNo().channelRefNo;
        let dataObject = {
            event: eventName,
            page: {
                pageInfo: {
                    pageType: 'form',
                    pageName: 'sg:EN:personal:form:' + formInfo.formInfo.productCategory + ':na:' + formInfo.formInfo.productName + ':' + formInfo.formInfo.formName + ':' + stepName,
                    buildDetails: `${process.env.REACT_APP_ADOBE_BUILD_DETAILS}`,
                    libDetails: `${process.env.REACT_APP_ADOBE_LIB_DETAILS}`
                },
                category: {
                    primaryCategory: formInfo.formInfo.productCategory,
                    subCategory1: 'na'
                },
                attributes: {
                    country: 'sg',
                    language: 'EN',
                    platform: getDeviceType()
                },
            },
            form: {
                formName: formInfo.formInfo.formName,
                formStepName: stepName,
                formPlatform: 'rtob',
                formType: 'application',
                channelRefNum: channelRef ? channelRef : 'na',
            },
            user: {
                "userInfo": {
                    userID: ( stage.stages.stages[0].stageInfo.applicants && stage.stages.stages[0].stageInfo.applicants.profile_id_a_1 ) ? stage.stages.stages[0].stageInfo.applicants.profile_id_a_1 : 'na',
                    userType: stage.stages.journeyType ? getUserType(stage.stages.journeyType) : 'na',
                    userStatus: (stage.auth && stage.auth.SSCode) ? 'logged in' : 'guest',
                    segment: 'personal'
                }
            },
            product: [product[0]]
        };
        return dataObject;
    }
    else{
        return[];
    }
}

getProductDetails = (stage: KeyWithAnyModel) => {
    if(getUrl.getParameterByName("auth") !== "upload" && !store.getState().stages.isDocumentUpload){
    let info: Array<{}> = [];
    let formName = '';
    let productCategory = '';
    let productName = '';  
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    //localStorage.removeItem('products');
    products.forEach((product: KeyWithAnyModel) => {
        const formNameCheck = product.product_category === 'CC' || product.product_category === 'PL' ? 'SG_CCPL' : 'SG_CASA';
    info.push({
            productInfo: {
                productName: product.name,
                productID: product.product_type,
                productCategory: product.product_category,
                productSubCategory: 'na',
            }
        });
        info.push({
            formInfo: {
                    formName : formName ? (formName + '|' + formNameCheck) : formNameCheck,
                    productCategory : productCategory ? (productCategory + '|' + product.product_category) : product.product_category,
                    productName : productName ? (productName + '|' + product.name) : product.name
            }
        })
    });
    return info;
    }
    else{
        return[]; 
    } 
}

getAdobeMyinfoDataLayer = (eventName: string ,stage: KeyWithAnyModel,stepName: string) => {

    const product = this.getProductDetails(stage);
    let formInfo: KeyWithAnyModel = product[1]
    let exception: KeyWithAnyModel = stage.error.exceptionList;
    let channelRef = getUrl.getChannelRefNo().channelRefNo;
    let dataObject = {
        event: eventName,
        page: {
            pageInfo: {
                pageType: 'form',
                pageName: 'sg:EN:personal:form:' + formInfo.formInfo.productCategory + ':na:' + formInfo.formInfo.productName + ':' + formInfo.formInfo.formName + ':' + stepName,
                buildDetails: `${process.env.REACT_APP_ADOBE_BUILD_DETAILS}`,
                libDetails: `${process.env.REACT_APP_ADOBE_LIB_DETAILS}`
            },
            category: {
                primaryCategory: formInfo.formInfo.productCategory,
                subCategory1: 'na'
            },
            attributes: {
                country: 'sg',
                language: 'EN',
                platform: getDeviceType()
            },
        },
        product: [product[0]],
        form: {
            formName: formInfo.formInfo.formName,
            formStepName: stepName,
            formPlatform: 'rtob',
            formType: 'application',
            channelRefNum: channelRef ? channelRef : 'na',
        },
        user: {
            "userInfo": {
                userID: ((stage.stages && (stage.stages.stages.length > 0)) && ( stage.stages.stages[0].stageInfo.applicants && stage.stages.stages[0].stageInfo.applicants.profile_id_a_1 ) ? stage.stages.stages[0].stageInfo.applicants.profile_id_a_1 : 'na'),
                userType: stage.stages.journeyType ? getUserType(stage.stages.journeyType) : 'na',
                userStatus: (stage.auth && stage.auth.SSCode) ? 'logged in' : 'guest',
                segment: 'personal'
            }
        },
        error: [{
            errorCode: exception.errorList.errors[0].code ? exception.errorList.errors[0].code : 'na',
            errorDescription: exception.errorList.errors[0].detail ? exception.errorList.errors[0].detail : exception.error_header,
            errorField: 'na',
        }]
    };
    return dataObject;
}
    atViewStart = () => {
        this.prehideSnippet();
        const stage = store.getState();
        if (stage && stage.stages.stages && stage.stages.stages.length > 0 && stage.stages.stages[0].stageInfo) {
           let formInfo: KeyWithAnyModel = this.getProductInfo(stage)[1];
           const stepName = getStepName(stage);
            window.adobeDataLayer.push({
                "event": "at-view-start",
                "page": {
                    "pageInfo": {
                        "pageName": 'sg:EN:personal:form:' + formInfo.formInfo.productCategory + ':na:' + formInfo.formInfo.productName + ":"
                            + formInfo.formInfo.formName + ":" + stepName,
                        "viewName": stepName,
                        "primaryCategory": formInfo.formInfo.productCategory,
                        "subCategory1": "na"
                    }
                }
            });
        }
    }

    prehideSnippet = () => {
        (function (g, b, d, f) { (function (a, c, d) { if (a) { var e = b.createElement("style"); e.id = c; e.innerHTML = d; a.appendChild(e) } })(b.getElementsByTagName("head")[0], "at-body-style", d); setTimeout(function () { var a = b.getElementsByTagName("head")[0]; if (a) { var c = b.getElementById("at-body-style"); c && a.removeChild(c) } }, f) }(window, document, "body{opacity: 1 !important}", 3E3));
    }

}

const trackEvents = new service();

export default trackEvents;