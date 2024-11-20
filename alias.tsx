import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import "./alias.scss";
import { getFields } from "./alias.utils";
import renderComponent from "../../../modules/dashboard/fields/renderer";
import { constant } from './constant';

export const Alias = (props: KeyWithAnyModel) => {

  const stageSelector = useSelector(
    (state: StoreModel) => state.stages.stages
  );

  const journeyType = useSelector((state: StoreModel) => state.stages.journeyType);

  const aliasSelector = useSelector(
    (state: StoreModel) => state.alias
  );

  const dispatch = useDispatch();
  const [field, setField] = useState([]);
  const addNewAliasName = () => {
    const stageComponents = dispatch(
        getFields(stageSelector, aliasSelector, "add")
    );
    setField(stageComponents);
  };

  useEffect(() => {
    if (stageSelector) {
      const stageComponents = dispatch(
        getFields(stageSelector, aliasSelector, "get")
      );
      setField(stageComponents);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aliasSelector]);

    return (
        <>
         {field &&
          field.map((currentSection: KeyWithAnyModel, index: number) => {
            return renderComponent(
              currentSection,
              index,
              props.handleCallback,
              props.handleFieldDispatch,
              props.value
            );
          })}
          { !journeyType && <div className="alias__buttton">
          <div className="alias__plus">
            <input
              type={constant.type}
              name={constant.name}
              aria-label={constant.ariaLabel}
              id={constant.id}
              placeholder={constant.placeholder}
              value={constant.value}
              className ={(aliasSelector && aliasSelector.count < aliasSelector.maxCount) ? 'show-btn, button' : 'hide-btn'}
              onClick={() => addNewAliasName()}
            />
            </div>
          </div>}
        </>
    )
}

export default Alias;
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Alias from "./Alias";
import { getFields } from "./alias.utils";
import renderComponent from "../../../modules/dashboard/fields/renderer";

jest.mock("../../../modules/dashboard/fields/renderer");
jest.mock("./alias.utils", () => ({
  getFields: jest.fn(),
}));

const mockStore = configureStore([]);

describe("Alias Component", () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      stages: {
        stages: ["stage1", "stage2"],
        journeyType: null,
      },
      alias: {
        count: 1,
        maxCount: 3,
      },
    });

    (getFields as jest.Mock).mockReturnValue(["Field1", "Field2"]);
    (renderComponent as jest.Mock).mockReturnValue(<div>Mocked Component</div>);
  });

  it("renders correctly with initial data", () => {
    render(
      <Provider store={store}>
        <Alias handleCallback={jest.fn()} handleFieldDispatch={jest.fn()} value="Test Value" />
      </Provider>
    );

    expect(screen.getByText("Mocked Component")).toBeInTheDocument();
  });

  it("calls getFields on useEffect and sets field state", () => {
    render(
      <Provider store={store}>
        <Alias handleCallback={jest.fn()} handleFieldDispatch={jest.fn()} value="Test Value" />
      </Provider>
    );

    expect(getFields).toHaveBeenCalledWith(["stage1", "stage2"], { count: 1, maxCount: 3 }, "get");
  });

  it("renders the button when journeyType is null and alias count is less than maxCount", () => {
    render(
      <Provider store={store}>
        <Alias handleCallback={jest.fn()} handleFieldDispatch={jest.fn()} value="Test Value" />
      </Provider>
    );

    const button = screen.getByPlaceholderText("Enter Alias Name");
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("show-btn, button");
  });

  it("hides the button when alias count is not less than maxCount", () => {
    store = mockStore({
      stages: {
        stages: ["stage1", "stage2"],
        journeyType: null,
      },
      alias: {
        count: 3,
        maxCount: 3,
      },
    });

    render(
      <Provider store={store}>
        <Alias handleCallback={jest.fn()} handleFieldDispatch={jest.fn()} value="Test Value" />
      </Provider>
    );

    const button = screen.queryByPlaceholderText("Enter Alias Name");
    expect(button).not.toHaveClass("show-btn, button");
  });

  it("calls addNewAliasName on button click", () => {
    render(
      <Provider store={store}>
        <Alias handleCallback={jest.fn()} handleFieldDispatch={jest.fn()} value="Test Value" />
      </Provider>
    );

    const button = screen.getByPlaceholderText("Enter Alias Name");
    fireEvent.click(button);

    expect(getFields).toHaveBeenCalledWith(["stage1", "stage2"], { count: 1, maxCount: 3 }, "add");
  });

  it("renders components using renderComponent", () => {
    render(
      <Provider store={store}>
        <Alias handleCallback={jest.fn()} handleFieldDispatch={jest.fn()} value="Test Value" />
      </Provider>
    );

    expect(renderComponent).toHaveBeenCalledTimes(2); // Mocked data contains two fields
  });
});
