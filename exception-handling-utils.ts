import { errorAction } from "../utils/store/error-slice";
import { AppDispatch, dispatchError, dispatchLoader } from "./common-service";

export const exceptionCheck = (response: any,isExit?:boolean): any => {
  return async (dispatch: AppDispatch) => {
    const errors =
      response.data &&
      response.data.application &&
      response.data.application.error
        ? response.data.application
        : "";
    let responseAction =
      response.data &&
      response.data.application &&
      response.data.application.response_action
        ? response.data.application.response_action.toUpperCase()
        : "";
    let responseType =
      response.data &&
      response.data.application &&
      response.data.application.response_type
        ? response.data.application.response_type.toUpperCase()
        : "";
    let error: any = [];

    if (response.status === 200 || response.status === 201) {
      if (
        isExit && responseAction !== "CONTINUE" && responseAction !== "SUCCESS"
      ) { /** Exception handling specific for save and close pop-up */
        error = {
          response: {
            error_header: "Something went wrong!",
            errorList: {
              errors: [
                {
                  detail:
                  "Sorry, we are unable to save your application. Please proceed by resuming the application",
                }
            ]
            },

            error_button: "Ok",
            error_type: "cancelResume",
            status: "error",
          },
        };
        dispatch(errorAction.getRetryStatus(true));
        dispatch(errorAction.getExceptionList(error.response));
        dispatch(dispatchLoader(false));
        return Promise.reject("Rejected");
      }
      if (responseAction && responseType) {
        switch (responseAction) {
          case "CONTINUE":
          case "SUCCESS":
            if (responseType === "INFO" || responseType === "SOFT") {
              return Promise.resolve(response);
            }
            break;
          case "RESUBMIT":
            if (responseType === "HARD") {
              if (errors && errors.errors && errors.errors.length > 0) {
                error = {
                  response: {
                    error_header: "Something went wrong!",
                    errorList: errors,
                    error_button: "Ok",
                    error_type: "CancelApplication",
                    status: "error",
                  },
                };
              } else {
                error = {
                  response: {
                    error_header: "Something went wrong!",
                    errorList: [
                      {
                        detail:
                        "Application submission timeout. If the issue persists, please retry your application at a later time. (Reference Code: A22)"
                      },
                    ],
                    error_button: "Ok",
                    error_type: "CancelApplication",
                    status: "error",
                  },
                };
              }
            }
            dispatch(errorAction.getExceptionList(error.response));
            dispatch(dispatchLoader(false));
            return Promise.reject("Rejected");
          case "CORRECT":
          case "CORRECT AND RESUBMIT":
            if (errors && errors.errors && errors.errors.length > 0) {
              error = {
                response: {
                  error_header: "Please try again !",
                  errorList: errors,
                  error_button: "Ok",
                  error_type: "back",
                  status: "error",
                },
              };
            } else {
              error = {
                response: {
                  error_header: "Please try again !",
                  errorList: [
                    {
                      detail:
                        "We have encountered a technical issue. Please try again.",
                    },
                  ],
                  error_button: "Ok",
                  error_type: "back",
                  status: "error",
                },
              };
            }
            dispatch(errorAction.getRetryStatus(true));
            dispatch(errorAction.getExceptionList(error.response));
            dispatch(dispatchLoader(false));
            return Promise.reject("Rejected");

          case "STOP":
            if (responseType === "HARD") {
              if (errors && errors.errors && errors.errors.length > 0) {
                error = {
                  response: {
                    error_header: "Something went wrong!",
                    errorList: errors,
                    error_button: "Ok",
                    error_type: "CancelApplication",
                    status: "error",
                  },
                };
              } else {
                error = {
                  response: {
                    error_header: "Something went wrong!",
                    errorList: [
                      {
                        detail:
                          "Sorry, we are unable to continue with your application online. Please visit our branch with regard to this application. (Reference Code: A110)"
                      },
                    ],
                    error_button: "Ok",
                    error_type: "CancelApplication",
                    status: "error",
                  },
                };
              }
            }
            dispatch(errorAction.getExceptionList(error.response));
            dispatch(dispatchLoader(false));
            return Promise.reject("Rejected");
          case "FAIL":
            if (responseType === "HARD") {
              if (errors && errors.errors && errors.errors.length > 0) {
                error = {
                  response: {
                    error_header: "Something went wrong!",
                    errorList: errors,
                    error_button: "Ok",
                    error_type: "CancelApplication",
                    status: "error",
                  },
                };
              } else {
                error = {
                  response: {
                    error_header: "Something went wrong!",
                    errorList: [
                      {
                        detail:
                          "Sorry, we are unable to process your request. Please try again later",
                      },
                    ],
                    error_button: "Ok",
                    error_type: "CancelApplication",
                    status: "error",
                  },
                };
              }
            }
            dispatch(errorAction.getExceptionList(error.response));
            dispatch(dispatchLoader(false));
            return Promise.reject("Rejected");
          default:
            dispatch(dispatchError(error));
            return Promise.reject("Rejected");
        }
      } else {
        return Promise.resolve(response);
      }
    } else {
      dispatch(dispatchError(error));
      return Promise.reject("Rejected");
    }
  };
};
