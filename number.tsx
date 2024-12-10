import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import {
  fieldError,
  getUrl,
  isFieldUpdate,
} from "../../../utils/common/change.utils";
import errorMsg from "../../../assets/_json/error.json";
import { lastAction } from "../../../utils/store/last-accessed-slice";
import { postalCodeValidation } from "./number.utils";
import { postalCodeAction } from "../../../utils/store/postal-code";
import "./number.scss";

const Number = (props: KeyWithAnyModel) => {
  const [error, setError] = useState("");  
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const userInputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );
  const updatedStageInputsSelector = useSelector(
    (state: StoreModel) => state.stages.updatedStageInputs
  );
  const fieldErrorSelector = useSelector(
    (state: StoreModel) => state.fielderror.error
  );
    const dispatch = useDispatch();
  const [defaultValue, setDefaultValue] = useState("");
  const [valueUpdate, setValueUpdate] = useState("");
  const [isPostalCodeFetch, setIsPostalCodeFetch] = useState(false);
  const [isPostalValue , setPostalValue] = useState("");
  const changeHandler = (
    fieldName: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = event.target.value;
    setDefaultValue(inputValue);
    if (!event.target.validity.valid) {
      props.handleCallback(props.data, inputValue);        
      if ((props.data.mandatory === "Yes" || props.data.mandatory ==="Conditional") && inputValue.length < 1) {
        setError(`${errorMsg.emity} ${props.data.rwb_label_name}`);
      } else if (props.data.regex && !(`${inputValue}`.match(props.data.regex))) {
        setError(`${errorMsg.patterns} ${props.data.rwb_label_name}`)
      } else if (props.data.min_length && `${inputValue}`.length < props.data.min_length) {
        setError(`${errorMsg.bankAccountMinLength} ${props.data.min_length} digits`)
      } else {
        setError((`${errorMsg.patterns} ${props.data.rwb_label_name}`));
      }
    }else{
      setError("");
      const fieldValue = event.target.value;
      setValueUpdate(fieldValue)
      if (
        fieldValue &&
        isPostalValue !== fieldValue && 
        fieldName === "postal_code" &&
        event.target.validity.valid
      ) {
        setPostalValue(fieldValue)
        const channelrefNumber =
          stageSelector[0].stageInfo.application["channel_reference"];
        setIsPostalCodeFetch(true);
        dispatch(
          postalCodeValidation(
            fieldValue,
            channelrefNumber,
            stageSelector[0].stageInfo.applicants
          )
        ).then((response: any) => {
          dispatch(postalCodeAction.setPostalCode(response));
          setIsPostalCodeFetch(false);
        });
      }
      else if (stageSelector[0].stageId !== "ad-2") {
        props.handleCallback(props.data, event.target.value);     
      } else {
        dispatch(isFieldUpdate(props, event.target.value, fieldName));
        if (accountNumValidation(inputValue,props)) {     
          props.handleCallback(props.data, inputValue);
        } else {
          props.handleCallback(props.data, "");            
          showAccountNumError();           
        }           
       }
    } 
  };
  const showAccountNumError = () => {
    if (        
      props.data.logical_field_name === "scb_account_no" ||
      props.data.logical_field_name === "other_bank_account_bt"
    ) {
      setError(errorMsg.sgBankAccountMismatch);
    } else if (
      props.data.logical_field_name === "re_enter_scb_account_no" ||
      props.data.logical_field_name === "reenter_other_bank_account_bt"
    ) {
      setError(errorMsg.sgBankAccountMismatch_RE);
    } else if (props.data.logical_field_name === "other_bank_credit_card_bt") {
      setError(errorMsg.sgCreditCardNoMismatch);
    }else if (props.data.logical_field_name === "reenter_other_bank_credit_card_bt") {
      setError(errorMsg.sgCreditCardNoMismatch_RE);
    } else {
      setError(`${errorMsg.emity} ${props.data.rwb_label_name}`);
    }
  }
  const isValidInput = (inputValue:string, props:KeyWithAnyModel) => {
    if (props.data.regex && !(`${inputValue}`.match(props.data.regex))) {
      return false;
    } else if (props.data.min_length && `${inputValue}`.length < props.data.min_length) {
      return false;
    } else {
      return true;
    }
  }
  const accountNumValidation = (inputValue:string, props:KeyWithAnyModel) => {
    const validFields = ["scb_account_no", "re_enter_scb_account_no", "other_bank_account_bt", "reenter_other_bank_account_bt", "other_bank_credit_card_bt", "reenter_other_bank_credit_card_bt"];
    if (validFields.indexOf(props.data.logical_field_name) === -1) {
      return true;
    }
    let storeValue: string | null = null;
    let fieldName: string | null = null;
    if (props.data.logical_field_name === "scb_account_no") {
      fieldName = "re_enter_scb_account_no";              
    } else if (props.data.logical_field_name === "re_enter_scb_account_no") {
      fieldName = "scb_account_no";
    } else if (props.data.logical_field_name === "other_bank_account_bt") {
      fieldName = "reenter_other_bank_account_bt";   
    } else if (props.data.logical_field_name === "reenter_other_bank_account_bt") {
      fieldName = "other_bank_account_bt";
    } else if (props.data.logical_field_name === "other_bank_credit_card_bt") {
      fieldName = "reenter_other_bank_credit_card_bt";
    } else if (props.data.logical_field_name === "reenter_other_bank_credit_card_bt") {
      fieldName = "other_bank_credit_card_bt";      
    }
    fieldName = fieldName + "_a_1";
    if (
      stageSelector &&
      stageSelector[0] &&
      stageSelector[0].stageInfo &&
      stageSelector[0].stageInfo.applicants
    ) {
      let userUpdateValue = null;
      const userUpdateStageSelector = updatedStageInputsSelector.findIndex(
        (ref: any) => ref && ref.stageId === stageSelector[0].stageId
      );
      if (userUpdateStageSelector > -1) {
        userUpdateValue = updatedStageInputsSelector[userUpdateStageSelector].applicants[fieldName];
      }
      const userInputResponse = userInputSelector.applicants[fieldName];
      storeValue =
        userInputResponse ||
        userUpdateValue ||
        stageSelector[0].stageInfo.applicants[fieldName];
    }    
    return !(storeValue && (inputValue !== storeValue));
  }; 
  useEffect(() => {
    if (
      stageSelector &&
      stageSelector[0] &&
      stageSelector[0].stageInfo &&
      stageSelector[0].stageInfo.applicants
    ) {
      const userInputResponse =
        userInputSelector.applicants[props.data.logical_field_name + "_a_1"];

      const stageIndex = getUrl
        .getUpdatedStage()
        .updatedStageInputs.findIndex(
          (ref: any) => ref && ref.stageId === stageSelector[0].stageId
        );
      let updatedVal = null;
      if (stageIndex > -1) {
        updatedVal =
          getUrl.getUpdatedStage().updatedStageInputs[stageIndex].applicants[
            props.data.logical_field_name + "_a_1"
          ];
      }
      
      let fieldValue = "";
      if (updatedVal) {
        fieldValue = updatedVal;
      } else if (userInputResponse) {
        fieldValue = userInputResponse;
      } else if (
        stageSelector[0].stageInfo.applicants[
          props.data.logical_field_name + "_a_1"
        ] &&
        updatedVal !== ""
      ) {
        fieldValue =
          stageSelector[0].stageInfo.applicants[
            props.data.logical_field_name + "_a_1"
          ];
      }

      setDefaultValue(fieldValue);   
      setValueUpdate(fieldValue)   
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);    
useEffect(() => {  
  if (
    isValidInput(userInputSelector.applicants[props.data.logical_field_name + "_a_1"], props) &&
    accountNumValidation(
      userInputSelector.applicants[props.data.logical_field_name + "_a_1"],
      props
    )
  ) {    
    setError("");
    props.handleCallback(
      props.data,
      userInputSelector.applicants[props.data.logical_field_name + "_a_1"]
    );
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [userInputSelector.applicants]);
  useEffect(() => {
      dispatch(isFieldUpdate(props, defaultValue, props.data.logical_field_name));
      if (stageSelector[0].stageId !== "ad-2") {
        props.handleCallback(props.data, defaultValue);
      }
      props.handleFieldDispatch(props.data.logical_field_name, defaultValue);         
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueUpdate]);

  const bindHandler = (
    fieldName: string,
    event: React.FocusEvent<HTMLInputElement>
  ) => {    
    const fieldValue = event.target.value;    
    if (
      fieldValue &&
      fieldName !== "postal_code" &&
      event.target.validity.valid
    ) {
      if (stageSelector[0].stageId !== "ad-2") {
        props.handleCallback(props.data, event.target.value);
      }   
      setValueUpdate(fieldValue)
    }    

  };

  useEffect(() => {
    if (fieldError(fieldErrorSelector, props)) {
      if (!error) { 
        if (stageSelector[0].stageId !== "ad-2") {           
          setError(`${errorMsg.patterns} ${props.data.rwb_label_name}`);        
        } else if (isValidInput(userInputSelector.applicants[props.data.logical_field_name + "_a_1"], props) && !accountNumValidation(userInputSelector.applicants[props.data.logical_field_name + "_a_1"], props)){
          showAccountNumError();
        } else {
          setError(`${errorMsg.patterns} ${props.data.rwb_label_name}`);
        }
      }
    } else {
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldErrorSelector]);
  useEffect(() => {
    if (fieldError(fieldErrorSelector, props)) {
      setError(`${errorMsg.emity} ${props.data.rwb_label_name}`);
    } else {
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldErrorSelector]);

  const placeHolderText = () => {
    return props.data.rwb_label_name;
  };

  const focusHandler = (
    fieldName: string,
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    dispatch(lastAction.getField(fieldName));
  };
  return (
    <>
      <div className="number text">
        <label htmlFor={props.data.logical_field_name}>
          {props.data.rwb_label_name}
        </label>
        <input
          type={props.data.type}
          name={props.data.logical_field_name}
          aria-label={props.data.logical_field_name}
          id={props.data.logical_field_name + "_a_1"}
          placeholder={placeHolderText()}
          value={defaultValue}
          minLength={props.data.min_length}
          maxLength={props.data.length}
          pattern={props.data.regex}
          onChange={changeHandler.bind(this, props.data.logical_field_name)}
          onBlur={bindHandler.bind(this, props.data.logical_field_name)}
          disabled={props.data.editable || stageSelector[0].stageId === "bd-1"}
          onFocus={focusHandler.bind(this, props.data.logical_field_name)}
          className={`${
            isPostalCodeFetch ? "disabled" : ""
          }`}
        />
        {isPostalCodeFetch && <span className={`${props.data.logical_field_name} circle-spinner`}></span>}
        {error && <span className="error-msg">{error}</span>}
      </div>
    </>
  );
};

export default Number;
