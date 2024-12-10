import React from "react";
import ActivityDetector from "react-activity-detector";
import PopupModel from "../popup-model/popup-model";
import Model from "./model";
import "./model.scss";

export const IdleTimeOutModel = (props:any) => {
  const modelOnIdle = () => {
    window.location.href = `${process.env.REACT_APP_HOME_PAGE_URL}`;
  };

  return (
    <>
      <PopupModel displayPopup={true} timeoutClass="timeOut">
        <ActivityDetector
          enabled={true}
          timeout={ Number(`${process.env.REACT_APP_RTOB_POPUP_IDLE_TIMEOUT_DURATION}`) * 1000}
          onIdle={modelOnIdle}
          name="default"
        />
        <Model name="idleTimeOut" callBackMethod={true} handlebuttonClick={props.handlePopUpClick}/>
      </PopupModel>
    </>
  );
};

export default IdleTimeOutModel;
