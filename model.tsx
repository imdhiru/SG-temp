import "./model.scss";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import modelInfo from "../../../assets/_json/model.json";
import trackEvents from "../../../services/track-events";
import { useSelector, useDispatch } from "react-redux";
import { getUrl, FindIndex } from "../../../utils/common/change.utils";
import { redirectingToIbanking, rateRequest } from "../../../services/common-service";
import { Player } from "@lottiefiles/react-lottie-player";
import lottieSrc from "../../../assets/_json/lottie/oops.json";
import validateService from "../../../services/validation-service";
import { useState, useEffect } from "react";
import { referralcodeAction } from "../../../utils/store/referral-code-slice";
import errorMsg from "../../../assets/_json/error.json";

const Model = (props: KeyWithAnyModel) => {
  const modelsData: KeyWithAnyModel = modelInfo;
  let modelData = modelsData.find((model: any) => model.name === props.name);
  
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const [showReferralPopupContent, setShowReferralPopupContent] =
    useState(false);
  const referralcodeSelector = useSelector((state: any) => state.referralcode);
  const resumeSelector = useSelector(
    (state: StoreModel) => state.urlParam.resume
  );
  
  //Start code for postal popup
  const rateSelector = useSelector((state: StoreModel) => state.rate);
  const [ar, setAr] = useState("");
  const [eir, setEir] = useState("");
  const [pincode, setPincode] = useState("");
  const [buttonClicked, setButtonClicked] = useState(false);
  const [postalMinLen, setPostalMinLen] = useState(6);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (props.name === "postal_code" && rateSelector.ar) {
      setAr(rateSelector.ar);
      setEir(rateSelector.eir);
     // modelData.header_content = modelData.header_content_second;
     // modelData.body_content = [""];
     // modelData.buttons = modelData.buttons_second;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateSelector]);

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length >= postalMinLen) {
      setPincode(event.target.value);
    } else {
      setPincode("");
    }
  };

  useEffect(() => {
    if (props.name === "postal_code") {
      const stageIndex = FindIndex(stageSelector[0].stageInfo, 'ssf-2');
      if (stageIndex) {
        const postalProp = (stageSelector[0].stageInfo.fieldMetaData.data.stages[stageIndex].fields.filter((field: KeyWithAnyModel) => field.logical_field_name === 'postal_code'));
        if (postalProp) {
          setPostalMinLen(postalProp[0].min_length);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const allowOnlyNumber = (event: any, fieldName: string) => {
    if (pincode && pincode.length > postalMinLen) {
      return false;
    }
    validateService.allowOnlyCharacter(event, fieldName);
  };

 //End code for postal popup

 
  let header_content = modelData.header_content
  
    ? modelData.header_content
    : props.name;
  if (header_content === "ageHardStop") {
    header_content = "Age Hard Stop";
  } 
  else if (header_content === "usHardStop") {
    header_content = "We are unable to open accounts for US residents";
  }
  trackEvents.triggerAdobeEvent("popupViewed", header_content);

  const handlebuttonClick = (index: number) => {
    if (props.name === "postal_code") {
      setButtonClicked(true);
      trackEvents.triggerAdobeEvent(
        "ctaClick",
        `${modelData.buttons[index],modelData.PostalCodebuttons[index]}:${header_content}`,
        {},
        modelData.header_content
      );
      if (rateSelector.ar) {
        props.handlebuttonClick();
      } else {
        if (pincode && pincode.length >= postalMinLen) {
          dispatch(rateRequest(pincode));  
        }
      }
    }
    else if (props.name === "nationalityHardStop" || props.name === "showTrustInfo" || props.name === "showLoanInfo" || props.name === "showEIRInfo" || props.name === "preferred_limit" || props.name === "preferred_credit_limit" || props.name === "contact_preference" || props.name === "enter_account_info") {
      props.handlebuttonClick();
      trackEvents.triggerAdobeEvent(
        "ctaClick",
        `${modelData.buttons[index]}:${header_content}`,
        {},
        header_content 
      );
    } else {
      trackEvents.triggerAdobeEvent(
        "ctaClick",
        `${modelData.buttons[index]}:${header_content}`,
        {},
        header_content
      );
      if (props.name === "CCThankYou") {
        if (index === 0) {
          if (props.handleContinueWithoutActivation) {
            props.handleContinueWithoutActivation();
          } else {
            props.handlebuttonClick();
          }
        } else {
          props.handlebuttonClick();
        }
      } else if (props.name === "CCCardActivation") {
        if (props.handleOTPSuccessClick) {
          props.handleOTPSuccessClick();
        } else {
          props.handlebuttonClick();  
         }
                 
      } else if (index === 0 && !props.callBackMethod && (referralcodeSelector  && referralcodeSelector.refer && referralcodeSelector.refer !== "true")) {
        if (
          (getUrl.getParameterByName("SSCode") || getUrl.getParameterByName("transfer-token")) || getUrl.getUpdatedStage().ccplChannel =="IBK" || getUrl.getUpdatedStage().ccplChannel =="MBNK" ||
          (stageSelector && stageSelector.length > 0  &&
            (stageSelector[0].stageInfo.applicants["auth_mode_a_1"] === "IX" || stageSelector[0].stageInfo.applicants["auth_mode_a_1"] === "IM")
        )) {
          if (getUrl.getParameterByName("source") === "scm") {
            //Ibanking redirection for app
            window.location.href = `${process.env.REACT_APP_IBANKING_SC_MOBILE}`;
          } else {
            redirectingToIbanking();
          }
        } else {
          window.location.href = `${process.env.REACT_APP_HOME_PAGE_URL}`;
        }
      }else if (
        props.name === "referral_code" &&
        (referralcodeSelector.refer !== null ||
          (referralcodeSelector.refer === null && resumeSelector))
      ) {
        if (index === 0) {
          props.setContinueWithoutReferralcode(false);
          props.setShowReferralcodePopup(false);
          dispatch(
            referralcodeAction.setReferralErrorMsg(
                errorMsg.referralcodeerror 
            )
          );
        } else {
          props.setContinueWithoutReferralcode(true);
          props.setShowReferralcodePopup(false);
          dispatch(
            referralcodeAction.setReferralErrorMsg("")
          );
        }
      } else if (props.handlebuttonClick) {
        props.handlebuttonClick();
      }
    }
  };
  useEffect(() => {
    if (
      props.name === "referral_code" &&
      (referralcodeSelector.refer !== null ||
        (referralcodeSelector.refer === null && resumeSelector))
    ) {
      setShowReferralPopupContent(true);
    }
 // eslint-disable-next-line react-hooks/exhaustive-deps    
  }, [referralcodeSelector.refer,showReferralPopupContent]);

  const handleRatebuttonClick = (index: number) =>{
    if (props.name === "postal_code") {
      setButtonClicked(true);
      trackEvents.triggerAdobeEvent(
        "ctaClick",
        `${modelData.buttons[index],modelData.PostalCodebuttons[index]}:${header_content}`,
        {},
        modelData.header_content
      );
      if (pincode && pincode.length >= postalMinLen) {
        dispatch(rateRequest(pincode));  
      }
    }
  };

  return (
    <>
      {modelData && props.name !== "ageHardStop" && (
       <div className={`popup ${props.name === "postal_code" ? "postal__code__popup": ""}`}>
          <div className="popup__container">
            {props.name !== "postal_code" && (
              <div className={`${
                showReferralPopupContent
                  ? "referralcode-popup-icon"
                  : "waring__icon"
              }`}>
                {!props.isTooltip && !showReferralPopupContent && (
                  <Player src={lottieSrc} className="player" loop autoplay />
                )}
                {props.isTooltip && !showReferralPopupContent && <div className="popup__question"></div>}
              </div>
            )}
            <div className="popup__info">
              {modelData.header_content && (
                <div
                  className={`popup__info__head ${
                    props.name === "postal_code"
                      ? "popup__info__head__underline"
                      : ""
                  }`}
                >
                  {modelData.header_content}
                </div>
              )}
              <div className="popup__info__desc">
                <div className="model__content">
                  {props.name !== "ageHardStop" &&
                    modelData.body_content.map(
                      (content: string, index: number) => {
                        return (
                          <p key={`${content}${index}`}>
                            {content}
                            {(props.name === "preferred_limit" ||
                              (props.name === "preferred_credit_limit" &&
                                index === 1)) && (
                              <a
                                rel="noreferrer"
                                href={
                                  process.env.REACT_APP_PREFERRED_LIMIT_FAQS
                                }
                                target="_blank"
                              >
                                FAQs
                              </a>
                            )}
                          </p>
                        );
                      }
                    )}
                  {/* {props.name === "ageHardStop" &&
                    modelData.body_content.map(
                      (content: string, index: number) => {
                        return (
                          <p
                            key={`${content}${index}`}
                          >{`${content} ${props.body_content}`}</p>
                        );
                      }
                    )} */}
                  {props.name === "postal_code" && (
                    <>
                    <div className='postal_code_lable'>{modelData.postal_code_lable}</div>
                    <div className="postalCode" >
                      {(
                        <input
                          className="postalCodeText"
                          type="text"
                          placeholder="Enter postal code"
                          name="postCode"
                          onChange={changeHandler.bind(this)}
                          onKeyPress={event =>
                            allowOnlyNumber(event, "postal_code")
                          }
                          maxLength={6}
                        />
                        
                      )}
                    {modelData.buttons &&
                    modelData.buttons.map((button: string, index: number) => {
                    return (
                      <div className="postalCodeTextButton">
                        <p
                          className="btnRate"
                          onClick={() => handleRatebuttonClick(index)}
                          key={`${button}${index}`}>
                          {button}
                        </p>
                      </div>
                    );
                   })}
                  </div>
                      {buttonClicked && !pincode && (
                        <div className="postal__error">
                          {modelData.errorDesc}
                        </div>
                      )}
                      {ar && (
                        <>
                        <div className="postal_image_main"> 
                          <div className="postal_image"></div>
                        </div>
                         <div className='header_second'>{modelData.header_content_second}</div>
                            <div className="ar__rate">
                              <div>{ar}% p.a.</div>
                              <div>(EIR {eir}% p.a.)</div>
                            </div>
                            <p> {modelData.popupDescription} </p>
                        </>
                      )}
                    </>
                  )}
                </div>
                {props.name === "postal_code" && ar && modelData.PostalCodebuttons &&
                  modelData.PostalCodebuttons.map((button: string, index: number) => {
                    return (
                      <div className="postalcode_conti_btn">
                        <p
                          className="btn"
                          onClick={() => handlebuttonClick(index)}
                          key={`${button}${index}`}
                        >
                          {button}
                        </p>
                      </div>
                    );
                  })}
                {props.name !== "postal_code" && modelData.buttons &&
                  modelData.buttons.map((button: string, index: number) => {
                    return (
                      <div className="postal__code__btn">
                        <p
                          className="btn"
                          onClick={() => handlebuttonClick(index)}
                          key={`${button}${index}`}
                        >
                          {button}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Model;
