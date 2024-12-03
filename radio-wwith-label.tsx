import { useEffect, useState } from "react";
import "./radio-with-label.scss";
import { useDispatch, useSelector } from "react-redux";
import renderComponent from "../../../modules/dashboard/fields/renderer";
import { getFields } from "./radio-with-label.utils";
import {
  KeyWithAnyModel,
  LovInputModel,
  LovInputValModel,
  RadioDependecyModel,
  StoreModel,
} from "../../../utils/model/common-model";
import {
  fieldError,
  fieldIdAppend,
  isFieldUpdate,
} from "../../../utils/common/change.utils";
import { checkProductDetails } from "../../../services/common-service";
import { lastAction } from "../../../utils/store/last-accessed-slice";
import PhoenixRadioLabel from "../phoenix-radio-label/phoenix-radio-label";
import Model from "../model/model";
import loanDetailsConst from "../../../assets/_json/loan-details.json";
import { ValueUpdateAction } from "../../../utils/store/value-update-slice";

export const RadioWithLabel = (props: KeyWithAnyModel) => {
  const [lovData, setLovData] = useState([]);
  const [selectedLov, setselectedLov] = useState("");
  const [isShowOtherOption, setIsShowOtherOption] = useState<boolean>(false);
  const [radioDependency, setRadioDependency] =
    useState<RadioDependecyModel | null>();
  const [field, setField] = useState([]);
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const userInputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );

  const lovSelector = useSelector((state: StoreModel) => state.lov);
  const fieldErrorSelector = useSelector(
    (state: StoreModel) => state.fielderror.error
  );
  const taxCustomSelector = useSelector(
    (state: StoreModel) => state.stages.taxCustom
  );
  const inputSelector = useSelector(
    (state: StoreModel) => state.stages.userInput
  );
  const productSelector = useSelector(
    (_state: StoreModel) => stageSelector[0].stageInfo.products
  );
  const updatedStageInputsSelector = useSelector(
    (state: StoreModel) => state.stages.updatedStageInputs
  );
  const [errors, setErrors] = useState(false);
  const dispatch = useDispatch();
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const bancaSelector = useSelector(
    (state: StoreModel) => state.bancaList.bancaDetails
  );

  useEffect(() => {
    setErrors(fieldError(fieldErrorSelector, props));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldErrorSelector]);

  useEffect(() => {
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
        userUpdateValue =
          updatedStageInputsSelector[userUpdateStageSelector].applicants[
            props.data.logical_field_name + "_a_1"
          ];
      }
      const userInputResponse =
        userInputSelector.applicants[props.data.logical_field_name + "_a_1"];

      const fieldValue =
        userInputResponse ||
        userUpdateValue ||
        stageSelector[0].stageInfo.applicants[
          props.data.logical_field_name + "_a_1"
        ];

      if (
        props.data.logical_field_name === "residency_status" ||
        props.data.logical_field_name === "work_type" ||
        props.data.logical_field_name === "casa_fatca_declaration" ||
        props.data.logical_field_name === "preferred_limit" ||
        props.data.logical_field_name === "credit_limit_consent" ||
        props.data.logical_field_name ===
          "Customer_Agree_for_Phoenix_Limit_porting" ||
        props.data.logical_field_name ===  "deposit_loan_to" ||
        props.data.logical_field_name === "preferred_limit_etc" ||
        props.data.logical_field_name ===  "transfer_amount_to"
      ) {
        setRadioDependency({
          logical_field_name: props.data.logical_field_name,
          value: fieldValue,
        });
      } else {
        setselectedLov(fieldValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(isFieldUpdate(props, selectedLov, props.data.logical_field_name));
    props.handleCallback(props.data, selectedLov);
    props.handleFieldDispatch(props.data.logical_field_name, selectedLov);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLov]);

  useEffect(() => {
    if (radioDependency) {
      dispatch(
        isFieldUpdate(
          props,
          radioDependency.value!,
          props.data.logical_field_name
        )
      );
      const stageComponents = dispatch(
        getFields(stageSelector, radioDependency, null, inputSelector, bancaSelector)
      );
      if (
        stageComponents &&
        stageSelector[0].stageId !== "ad-1" &&
        stageComponents &&
        stageSelector[0].stageId !== "ad-2"
      ) {
        stageComponents.sort((prev: KeyWithAnyModel, next: KeyWithAnyModel) =>
          prev.seq_no > next.seq_no ? -1 : 0
        );
      }
      setField(stageComponents);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radioDependency, dispatch, taxCustomSelector.toggle]);
  useEffect(() => {
    if (props.data.logical_field_name === "work_type") {
      const returnValue = checkProductDetails(productSelector);
      setIsShowOtherOption(returnValue ? true : false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowOtherOption]);

  useEffect(() => {
    if (lovSelector.lov.length > 0) {
      lovSelector.lov.forEach((ref: LovInputModel) => {
        if (props.data.logical_field_name.includes(ref.label)) {
          let data = JSON.parse(JSON.stringify(ref.value));
          if (
            (props.data.logical_field_name === "deposit_loan_to" || props.data.logical_field_name === "transfer_amount_to") &&
            radioDependency && !radioDependency.value
          ) {
            setRadioDependency({
              logical_field_name: props.data.logical_field_name,
              value: data[0]["CODE_VALUE"],
            });
          }
          data.map((res: LovInputValModel): LovInputValModel => {
            const selectedValue = radioDependency
              ? radioDependency.value
              : selectedLov;
            if (res["CODE_VALUE"] === selectedValue) {
              res["checked"] = true;
            } else {
              res["checked"] = false;
            }
            // if (
            //   props.data.logical_field_name === "residency_status" &&
            //   (authenticateType() === "myinfo" || (authenticateType() === "manual" && stageSelector[0].stageId === 'bd-1'))
            // ) {
            //   res["disabled"] = true
            //     // stageSelector[0].stageInfo.applicants.residency_status_a_1 !==
            //     //   "FR" && res["CODE_VALUE"] === "FR"
            //     //   ? true
            //     //   : stageSelector[0].stageInfo.applicants
            //     //       .residency_status_a_1 === "FR" &&
            //     //     res["CODE_VALUE"] !== "FR"
            //     //   ? true
            //     //   : false;
            // }
            return res;
          });
          setLovData(data);
          if (
            props.data.logical_field_name === "work_type" &&
            isShowOtherOption === false
          ) {
            setLovData((workTypeFiltered) => {
              return workTypeFiltered.filter((lovdata: any) => {
                return lovdata.CODE_VALUE !== "O";
              });
            });
          }
          setErrors(false);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    lovSelector.lov,
    props.data.logical_field_name,
    selectedLov,
    radioDependency,
  ]);

  const userInput = (fieldName: string, event: any) => {
    if (inputSelector.applicants[fieldName + "_a_1"] !== event) {
      if (
        fieldName === "residency_status" ||
        fieldName === "work_type" ||
        fieldName === "casa_fatca_declaration" ||
        fieldName === "preferred_limit" ||
        fieldName === "preferred_limit_etc" ||
        fieldName === "deposit_loan_to" ||
        fieldName === "transfer_amount_to" ||
        fieldName === "credit_limit_consent" ||
        fieldName === "Customer_Agree_for_Phoenix_Limit_porting"
      ) {
        setRadioDependency({ logical_field_name: fieldName, value: event });
      } else {
        setselectedLov(event);
      }
      props.handleCallback(props.data, event);
      props.handleFieldDispatch(fieldName, event);
      dispatch(isFieldUpdate(props, event, fieldName));
      dispatch(
        ValueUpdateAction.getChangeUpdate({
          id: stageSelector[0].stageId,
          changes: true,
        })
      );
    }
  };

  const handleCallback = (fieldName: string, value: string | number) => {
    props.handleCallback(fieldName, value);
  };
  const handleFieldDispatch = (fieldName: string, value: string | number) => {
    props.handleFieldDispatch(fieldName, value);
  };
  const focusHandler = (
    fieldName: string,
    event: React.FocusEvent<HTMLInputElement>
  ) => {
    dispatch(lastAction.getField(fieldName));
  };

  const handlePopupBackButton = () => {
    setShowInfoPopup(false);
  };

  return (
    <>
      <div className="radioWithLabel" id={fieldIdAppend(props)}>
        {props.data.logical_field_name !==
          "Customer_Agree_for_Phoenix_Limit_porting" && (
          <div className="radio__header">
            <label htmlFor={props.data.logical_field_name}>
              {props.data.rwb_label_name}
            </label>
            {props.data.info_tooltips === "Yes" &&
              props.data.logical_field_name !== "casa_fatca_declaration" && (
                <span
                  className="info-tooltip"
                  onClick={() => setShowInfoPopup(true)}
                ></span>
              )}
          </div>
        )}
        {props.data.logical_field_name ===
          "Customer_Agree_for_Phoenix_Limit_porting" && <PhoenixRadioLabel />}
        {lovData &&
          lovData.map((res: LovInputValModel, index) => {
            return (
              <div key={index}>
                <label htmlFor={res.CODE_VALUE}>
                  <input
                    type="radio"
                    name={res.CODE_VALUE}
                    id={res.CODE_VALUE}
                    onClick={() =>
                      userInput(props.data.logical_field_name, res.CODE_VALUE)
                    }
                    disabled={props.data.editable}
                    onChange={() => {
                      //do something
                    }}
                    checked={res.checked}
                    onFocus={focusHandler.bind(
                      this,
                      props.data.logical_field_name
                    )}
                  />
                  <span>{res.CODE_DESC}</span>
                </label>
              </div>
            );
          })}
      </div>
      {errors && (
        <span className="error-msg">
          Please select {props.data.rwb_label_name}
        </span>
      )}
      {field &&
        field.map((currentSection: KeyWithAnyModel, index: number) => {
          return renderComponent(
            currentSection,
            index,
            handleCallback,
            handleFieldDispatch,
            props.value
          );
        })}
      {/* {props.data.logical_field_name === "preferred_limit" && (
        <div className="limit-note"> 
          {loanDetailsConst.sliderWithCurrencyNote}
        </div>
      )} */}
      {showInfoPopup && (
        <Model
          name={props.data.logical_field_name}
          handlebuttonClick={handlePopupBackButton}
        />
      )}
    </>
  );
};

export default RadioWithLabel;
