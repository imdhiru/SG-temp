import React, { useEffect, useState,useRef } from "react";
import { useDispatch,useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "./utils/styles/App.scss";
import Main from "./router/main";
import Model from "./shared/components/model/model";
import Spinner from "./shared/components/spinner/spinner";
import { KeyWithAnyModel, StoreModel } from "./utils/model/common-model";
import DynamicModel from "./shared/components/model/dynamic-model";
import ActivityDetector from "react-activity-detector";
import IdleTimeOutModel from "./shared/components/model/idle-time-out";
import trackEvents from "./services/track-events";
import { submitRequest } from "./modules/dashboard/fields/fields.utils";
import { store } from "./utils/store/store";

export const App = () => {
  const loaderSelector = useSelector((state: StoreModel) => state.loader);
  const errorSelector = useSelector((state: StoreModel) => state.error);
  const [loaderState, setLoaderState] = useState(null);
  const [error, setError] = useState([]);
  const [exceptionList, setExceptionList] = useState<KeyWithAnyModel>([]);
  const [isIdle, setIsIdle] = useState(false);
  const [openIdlePopUp, setOpenIdlePopUp] = useState(false);
  const idleTimeoutRef=useRef<NodeJS.Timeout| null>(null);
  const dispatch = useDispatch();

  /**
   * Added to disabled right click options
   */
  useEffect(() => {
    window.addEventListener('contextmenu', function (event) {
      event.preventDefault();
    });
    return () => {
      window.removeEventListener('contextmenu', function (event) {
        event.preventDefault();
      });
    }
  }, [])
  useEffect(() => {
    // to check whether loader is enabled
    if (loaderSelector && loaderSelector.isFetching) {
      setLoaderState(loaderSelector.isFetching.isFetching);
    }
    // to check whether error is received from api request
    if (errorSelector && errorSelector.errors) {
      setError(errorSelector.errors);
    }

    // To check exceptional handling
    if (errorSelector && errorSelector.exceptionList) {
      setExceptionList(errorSelector.exceptionList);
    }
    const exceptions:  KeyWithAnyModel = errorSelector.exceptionList;
    if(errorSelector.errors.length > 0 || (exceptions && exceptions.error_header)){
      trackEvents.triggerAdobeEvent('formError');
    }
   
    window.addEventListener("unload", function () {
      trackEvents.triggerAdobeEvent('formAbandonment', 'BrowserClose')
    })
  }, [loaderSelector, errorSelector]);

  useEffect(()=>{
    if (isIdle) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      if (!openIdlePopUp) {
        setOpenIdlePopUp(true);
      }
    }
  },[isIdle])

  const onIdle = () => {   
    loaderState === true ? onActive() : setIsIdle(true);
  };
  const onActive = () => {
    setIsIdle(false);
  };
  const handlePopUpClick = () => {
    setOpenIdlePopUp(false);
  };
  return (
    <>
      {/* Idle time out */}
      <ActivityDetector
        enabled={true}
        timeout={
          Number(`${process.env.REACT_APP_RTOB_APP_IDLE_TIMEOUT_DURATION}`) *
          10000
        }
        onIdle={onIdle}
        onActive={onActive}
        name="default"
      />

      {openIdlePopUp && (
        <IdleTimeOutModel handlePopUpClick={handlePopUpClick} />
      )}

      <BrowserRouter basename="/">
        <Main />
        {exceptionList.length !== 0 && (
          <DynamicModel errorList={exceptionList} />
        )}
        {error.length > 0 ? (
          <Model name="globalError" />
        ) : (
          loaderState && <Spinner />
        )}
      </BrowserRouter>
    </>
  );
};
export default App;
