import React from "react";
import "./model.scss";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import { useDispatch, useSelector } from "react-redux";
import { errorAction } from "../../../utils/store/error-slice";
import {
  dispatchLoader,
  redirectingToIbanking,
} from "../../../services/common-service";
import DOMPurify from "dompurify";
import { getUrl } from "../../../utils/common/change.utils";
import { Player } from "@lottiefiles/react-lottie-player";
import lottieSrc from "../../../assets/_json/lottie/oops.json";

export const DynamicModel = (props: KeyWithAnyModel) => {
  const modelData = props.errorList;
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const dispatch = useDispatch();
  const handlebuttonClick = () => {
    if (props.errorList.error_type === "CancelApplication" || props.errorList.error_type === "cancelResume") {
      if (
        (getUrl.getParameterByName("SSCode") || getUrl.getParameterByName('transfer-token') ||  getUrl.getUpdatedStage()?.ccplChannel=== "IBK" || getUrl.getUpdatedStage()?.ccplChannel=== "MBNK") || 
        (stageSelector && stageSelector[0] && stageSelector[0].stageInfo  && 
          stageSelector[0].stageInfo.applicants && (stageSelector[0].stageInfo.applicants["auth_mode_a_1"] === "IX" || stageSelector[0].stageInfo.applicants["auth_mode_a_1"] === "IM"))
      ) {
        if (getUrl.getParameterByName("source") === "scm") {
          //Ibanking redirection for app
          window.location.href = `${process.env.REACT_APP_IBANKING_SC_MOBILE}`;
        } else if(getUrl.getUpdatedStage()?.ccplChannel=== "MBNK" || getUrl.getParameterByName("channel") === "MBNK") {
          const redirectUrl =  `${process.env.REACT_APP_IBANKING_SC_MOBILE_TRANSFER}`;
          window.location.href = redirectUrl;
        } else {
          redirectingToIbanking();
        }
      } else {
        if(props.errorList.error_type === "cancelResume"){
          window.location.href = `${process.env.REACT_APP_RESUME_URL}`;
        }else{
          window.location.href = `${process.env.REACT_APP_HOME_PAGE_URL}`;
        }
      }
    } else if (props.handlebuttonClick) {
      props.handlebuttonClick();
    } else {
      dispatch(dispatchLoader(false));
      dispatch(errorAction.getExceptionList([]));
    }
  };

  const getMarkup = (content: any) => {
    return {
      __html: DOMPurify.sanitize(content),
    };
  };

  return (
    <>
      {modelData && modelData && (
        <div className="popup">
          <div className="popup__container">
            <div className="waring__icon">
              <Player src={lottieSrc} className="player" loop autoplay />
            </div>
            <div className="popup__info">
              {modelData.error_header && (
                <>
                  {modelData.errorList &&
                    modelData.errorList.application_reference && (
                      <div className="app__ref">
                        APPLICATION NO:{" "}
                        {modelData.errorList.application_reference}
                      </div>
                    )}
                  <div className="popup__info__head">
                    {modelData.error_header}
                  </div>
                </>
              )}
              <div className="popup__info__desc">
                {modelData.errorList.map(
                  (content: KeyWithAnyModel, index: number) => {
                    return (
                      <p key={`${content}${index}`}>
                        {content.detail ? (
                          <span
                            dangerouslySetInnerHTML={getMarkup(content.detail)}
                          />
                        ) : (
                          "Something went wrong!"
                        )}
                      </p>
                    );
                  }
                )}
                {modelData.error_button && (
                  <p
                    className="btn"
                    onClick={() => handlebuttonClick()}
                    key={`${modelData.error_button}`}
                  >
                    {modelData.error_button}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DynamicModel;
