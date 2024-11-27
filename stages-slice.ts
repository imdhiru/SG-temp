import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dispatchLoader } from "../../../services/common-service";
import "./myinfo-singpass-login.scss";

const MyinfoSingpassLogin = () => {
  const authorizeSelector = useSelector(
    (state: any) => state.authorize.authorize
  );
  const [singpassCredential, setsingpassCredential] = useState({
    nric: "",
    password: "",
  });
  const dispatch = useDispatch();
  const [isProduction, setIsProduction] = useState(false);
  const [isVirtualSingPass, setIsVirtualSingPass] = useState(false);

  useEffect(() => {
    if (`${process.env.REACT_APP_PRODUCTION}` !== "Y") {
      setIsProduction(true);
    } else {
      dispatch(dispatchLoader(true));
      doRealSingpassLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setsingpassCredential((prevUser: any) => {
      prevUser[event.target.name] = event.target.value;
      return { ...prevUser };
    });
  };

  const blurHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.validity.valid) {
      setsingpassCredential((prevUser: any) => {
        prevUser[event.target.name] = event.target.value;
        return { ...prevUser };
      });
    }
  };

  const signPassHandler = (data?: string) => {
    if (data === "virtual") {
      if (
        singpassCredential.nric !== "" &&
        singpassCredential.password !== ""
      ) {
        const hostUrl = `${process.env.REACT_APP_HOST_URL}`;
        dispatch(dispatchLoader(true));
        let myinfoCallbackUrl = `#${
          process.env.REACT_APP_RTOB_CALLBACK_URL + singpassCredential.nric
        }`;
          window.location.href = hostUrl + myinfoCallbackUrl;       
      } else {
        setsingpassCredential({
          nric: "",
          password: "",
        });
      }
    } else {
      dispatch(dispatchLoader(true));
      doRealSingpassLogin();
    }
  };

  const doRealSingpassLogin = () => {
    if (authorizeSelector && authorizeSelector.attributes[0]) {
      const {
        client_id,
        scope,
        purpose_id,
        code_challenge,
        code_challenge_method,
        response_type,
        redirect_uri,
      } = authorizeSelector.attributes[0];

      const authorizeUrl =
        process.env.REACT_APP_SINGPASS_URL +
        "?client_id=" +
        client_id +
        "&scope=" +
        scope +
        "&purpose_id=" +
        purpose_id +
        "&code_challenge=" +
        code_challenge +
        "&code_challenge_method=" +
        code_challenge_method +
        "&response_type=" +
        response_type +
        "&redirect_uri=" +
        redirect_uri;
      window.location.href = authorizeUrl;
    }
  };

  const virtualSingPass = () => {
    setIsVirtualSingPass(true);
  };
  return (
    <>
      {isProduction && (
        <div className={`singpass-modal ${!isVirtualSingPass ? "auth" : ""}`}>
          {!isVirtualSingPass ? (
            <div>
              <div className="singpass-model__auth">
                <div className="singpass-model__question">
                  Do you want to proceed with Virtual Singpass or Singpass?
                </div>
                <div className="singpass-model__btn">
                  <button type="button" onClick={virtualSingPass}>
                    Virtual Singpass
                  </button>
                  <button type="button" onClick={() => signPassHandler()}>
                    Real Singpass
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="singpass-modal__body">
              <form name="singpassLoginForm">
                <div className="singpass-modal__header">Log in</div>
                <div className="singpass-modal__form-group">
                  <div className="singpass-modal__credentials">
                    <input
                      type="text"
                      placeholder="Singpass ID"
                      name="nric"
                      onBlur={blurHandler.bind(this)}
                      onChange={changeHandler.bind(this)}
                      value={singpassCredential.nric}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      name="password"
                      onBlur={blurHandler.bind(this)}
                      onChange={changeHandler.bind(this)}
                      value={singpassCredential.password}
                    />
                  </div>
                  <div className="singpass-modal__submit">
                    <button
                      type="button"
                      onClick={() => signPassHandler("virtual")}
                    >
                      Log in
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MyinfoSingpassLogin;
