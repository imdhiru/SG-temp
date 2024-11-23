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






import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { createStore } from "redux";
import App from "./App";
import { StoreModel } from "./utils/model/common-model";

// Mock Redux store and reducers
const mockStore = (state: Partial<StoreModel>) => createStore(() => state);

jest.mock("react-activity-detector", () => (props: any) => {
  const { onIdle, onActive } = props;
  return (
    <div>
      <button onClick={onIdle}>Simulate Idle</button>
      <button onClick={onActive}>Simulate Active</button>
    </div>
  );
});

jest.mock("./services/track-events", () => ({
  triggerAdobeEvent: jest.fn(),
}));

describe("App Component", () => {
  const renderApp = (initialState: Partial<StoreModel>) => {
    const store = mockStore(initialState);
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
  };

  test("renders the Main component", () => {
    renderApp({});
    expect(screen.getByText(/main component content/i)).toBeInTheDocument(); // Replace with actual content inside `Main` component
  });

  test("disables right-click on the window", () => {
    const { container } = renderApp({});
    const contextMenuEvent = new MouseEvent("contextmenu", { bubbles: true });
    fireEvent(container, contextMenuEvent);
    expect(contextMenuEvent.defaultPrevented).toBe(true);
  });

  test("shows Spinner when loaderState is true", () => {
    renderApp({ loader: { isFetching: true } });
    expect(screen.getByTestId("spinner")).toBeInTheDocument(); // Add a `data-testid` to Spinner if not already
  });

  test("shows error Model when errors exist", () => {
    renderApp({ error: { errors: ["Error 1", "Error 2"] } });
    expect(screen.getByTestId("globalError")).toBeInTheDocument(); // Add a `data-testid` to Model if not already
  });

  test("shows DynamicModel when exceptionList exists", () => {
    renderApp({ error: { exceptionList: [{ error_header: "Header" }] } });
    expect(screen.getByTestId("dynamicModel")).toBeInTheDocument(); // Add a `data-testid` to DynamicModel if not already
  });

  test("opens IdleTimeOutModel on idle", () => {
    renderApp({});
    fireEvent.click(screen.getByText("Simulate Idle"));
    expect(screen.getByText("IdleTimeOutModel content")).toBeInTheDocument(); // Replace with actual content inside `IdleTimeOutModel`
  });

  test("closes IdleTimeOutModel on popup close", () => {
    renderApp({});
    fireEvent.click(screen.getByText("Simulate Idle"));
    fireEvent.click(screen.getByText("Close Popup")); // Replace with actual button content in IdleTimeOutModel
    expect(screen.queryByText("IdleTimeOutModel content")).not.toBeInTheDocument();
  });

  test("handles onActive event correctly", () => {
    renderApp({ loader: { isFetching: false } });
    fireEvent.click(screen.getByText("Simulate Active"));
    expect(screen.queryByText("IdleTimeOutModel content")).not.toBeInTheDocument();
  });

  test("tracks Adobe events for form errors", () => {
    const { default: trackEvents } = require("./services/track-events");
    renderApp({ error: { errors: ["Error"], exceptionList: [] } });
    expect(trackEvents.triggerAdobeEvent).toHaveBeenCalledWith("formError");
  });

  test("tracks Adobe events for form abandonment", () => {
    const { default: trackEvents } = require("./services/track-events");
    const unloadEvent = new Event("unload");
    window.dispatchEvent(unloadEvent);
    expect(trackEvents.triggerAdobeEvent).toHaveBeenCalledWith(
      "formAbandonment",
      "BrowserClose"
    );
  });
});
