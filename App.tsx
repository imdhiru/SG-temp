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




import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { store } from './utils/store/store';
import { useSelector } from 'react-redux';

// Mocking child components and dependencies
jest.mock('./router/main', () => jest.fn(() => <div data-testid="main"></div>));
jest.mock('./shared/components/model/model', () =>
  jest.fn(() => <div data-testid="globalError"></div>)
);
jest.mock('./shared/components/spinner/spinner', () =>
  jest.fn(() => <div data-testid="spinner"></div>)
);
jest.mock('./shared/components/model/dynamic-model', () =>
  jest.fn(() => <div data-testid="dynamicModel"></div>)
);
jest.mock('./shared/components/model/idle-time-out', () =>
  jest.fn(() => <div data-testid="idleTimeout"></div>)
);
jest.mock('react-activity-detector', () =>
  jest.fn(() => <div data-testid="activityDetector"></div>)
);
jest.mock('./services/track-events', () => ({
  triggerAdobeEvent: jest.fn(),
}));

// Mock useSelector
const mockUseSelector = (loaderState, errorState) => {
  useSelector.mockImplementation((selector) => {
    if (selector.name === 'loaderSelector') {
      return loaderState;
    }
    if (selector.name === 'errorSelector') {
      return errorState;
    }
    return {};
  });
};

describe('App Component', () => {
  const mockLoader = {
    isFetching: {
      isFetching: true,
    },
  };

  const mockError = {
    errors: ['Error 1'],
    exceptionList: [{ error_header: 'Exception Header' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders main component', () => {
    mockUseSelector({}, {});
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByTestId('main')).toBeInTheDocument();
  });

  test('disables right-click functionality', () => {
    mockUseSelector({}, {});
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    });

    fireEvent(window, event);

    expect(event.defaultPrevented).toBe(true);
  });

  test('renders spinner when loader state is active', () => {
    mockUseSelector(mockLoader, {});
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test('renders global error model when errors exist', () => {
    mockUseSelector({}, mockError);
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByTestId('globalError')).toBeInTheDocument();
  });

  test('renders dynamic model when exception list is not empty', () => {
    mockUseSelector({}, mockError);
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByTestId('dynamicModel')).toBeInTheDocument();
  });

  test('renders idle timeout model when openIdlePopUp is true', () => {
    mockUseSelector({}, {});
    const { rerender } = render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    // Simulate idle state
    fireEvent(screen.getByTestId('activityDetector'), new Event('idle'));

    rerender(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByTestId('idleTimeout')).toBeInTheDocument();
  });

  test('triggers onIdle and onActive callbacks', () => {
    mockUseSelector({}, {});
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const activityDetector = screen.getByTestId('activityDetector');

    // Trigger onIdle
    fireEvent(activityDetector, new Event('idle'));
    expect(screen.queryByTestId('idleTimeout')).toBeInTheDocument();

    // Trigger onActive
    fireEvent(activityDetector, new Event('active'));
    expect(screen.queryByTestId('idleTimeout')).not.toBeInTheDocument();
  });

  test('triggers Adobe event on formError', () => {
    const trackEvents = require('./services/track-events');
    mockUseSelector({}, mockError);

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(trackEvents.triggerAdobeEvent).toHaveBeenCalledWith('formError');
  });

  test('triggers Adobe event on formAbandonment', () => {
    const trackEvents = require('./services/track-events');
    mockUseSelector({}, {});

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const unloadEvent = new Event('unload');
    fireEvent(window, unloadEvent);

    expect(trackEvents.triggerAdobeEvent).toHaveBeenCalledWith(
      'formAbandonment',
      'BrowserClose'
    );
  });
});


