import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './utils/store/store';
import App from './App';
import trackEvents from './services/track-events';

// Mock dependencies
jest.mock('./services/track-events', () => ({
  triggerAdobeEvent: jest.fn(),
}));

jest.mock('./utils/store/store', () => ({
  store: {
    getState: jest.fn(),
    subscribe: jest.fn(),
    dispatch: jest.fn(),
  },
}));

// Mock environment variables
process.env.REACT_APP_RTOB_APP_IDLE_TIMEOUT_DURATION = '10';

describe('App Component', () => {
  const mockLoaderState = {
    isFetching: { isFetching: true },
  };

  const mockErrorState = {
    errors: ['API Error 1', 'API Error 2'],
    exceptionList: [{ error_header: 'Mock Exception Header' }],
  };

  beforeEach(() => {
    jest.spyOn(store, 'getState').mockReturnValue({
      loader: mockLoaderState,
      error: mockErrorState,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Main component', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );

    // Main component render check
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('disables right-click context menu', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const contextMenuEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    });

    fireEvent(window, contextMenuEvent);

    expect(contextMenuEvent.defaultPrevented).toBe(true);
  });

  test('renders Spinner when loaderState is true', () => {
    jest.spyOn(store, 'getState').mockReturnValue({
      loader: mockLoaderState,
      error: { errors: [], exceptionList: [] },
    });

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner check
  });

  test('renders Model when errors exist', () => {
    jest.spyOn(store, 'getState').mockReturnValue({
      loader: { isFetching: { isFetching: false } },
      error: mockErrorState,
    });

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByRole('dialog', { name: /globalError/i })).toBeInTheDocument();
  });

  test('renders DynamicModel when exceptionList is not empty', () => {
    jest.spyOn(store, 'getState').mockReturnValue({
      loader: { isFetching: { isFetching: false } },
      error: mockErrorState,
    });

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByText(/Mock Exception Header/)).toBeInTheDocument(); // Exception content
  });

  test('triggers Adobe event on formError', () => {
    jest.spyOn(store, 'getState').mockReturnValue({
      loader: { isFetching: { isFetching: false } },
      error: mockErrorState,
    });

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(trackEvents.triggerAdobeEvent).toHaveBeenCalledWith('formError');
  });

  test('renders IdleTimeOutModel when user is idle', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    act(() => {
      jest.advanceTimersByTime(
        Number(process.env.REACT_APP_RTOB_APP_IDLE_TIMEOUT_DURATION) * 10000
      );
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument(); // Idle timeout modal
  });

  test('handles active state after idle', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    act(() => {
      jest.advanceTimersByTime(
        Number(process.env.REACT_APP_RTOB_APP_IDLE_TIMEOUT_DURATION) * 10000
      );
    });

    // Simulate activity
    fireEvent(window, new Event('mousemove'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); // Idle timeout modal removed
  });

  test('calls Adobe event on browser close', () => {
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
