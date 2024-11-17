import { createElement } from "react";
import Dates from "../../../shared/components/dates/dates";
import Date from "../../../shared/components/dates/dates";
import Information from "../../../shared/components/information/information";
import MultiSelectionBox from "../../../shared/components/multi-selection-box/multi-selection-box";
import Number from "../../../shared/components/number/number";
import OtherMyinfo from "../../../shared/components/other-myinfo/other-myinfo";
import Phone from "../../../shared/components/phone/phone";
import RadioWithLabel from "../../../shared/components/radio-with-label/radio-with-label";
import SelectionBox from "../../../shared/components/selection-box/selection-box";
import Text from "../../../shared/components/text/text";
import Toggle from "../../../shared/components/toggle/toggle";
import TypeAhead from "../../../shared/components/type-ahead/type-ahead";
import { KeyWithAnyModel } from "../../../utils/model/common-model";
import Button from "../../../shared/components/button/button";
import Amount from "../../../shared/components/amount/amount";
import SliderWithLimit from "../../../shared/components/slider-with-limit/slider-with-limit";
import SliderWithCurrency from "../../../shared/components/slider-with-currency/slider-with-currency";
import ButtonGroup from "../../../shared/components/button-group/button-group";

const keysToComponentMap: KeyWithAnyModel = {
  Dates: Dates,
  Phone: Phone,
  RadioWithLabel: RadioWithLabel,
  Text: Text,
  SelectionBox: SelectionBox,
  MultiSelectionBox: MultiSelectionBox,
  Toggle: Toggle,
  Number: Number,
  Information: Information,
  OtherMyinfo: OtherMyinfo,
  TypeAhead: TypeAhead,
  Button: Button,
  Amount: Amount,
  SliderWithLimit: SliderWithLimit,
  SliderWithCurrency: SliderWithCurrency,
  ButtonGroup: ButtonGroup,
  Date: Date,
  Infowithoutmodal:Information
};

const renderComponent = (
  currentSection: KeyWithAnyModel,
  _i: number,
  handleCallback: any,
  handleFieldDispatch: any,
  userInput: { [key: string]: string }
) => {
  let component = currentSection.component_type.replace(/\s/g, "");
  if (typeof keysToComponentMap[component] !== "undefined") {
    return createElement(keysToComponentMap[component], {
      data: currentSection,
      key: currentSection.logical_field_name,
      handleCallback: handleCallback,
      handleFieldDispatch: handleFieldDispatch,
      value: userInput,
    });
  }
};

export default renderComponent;
