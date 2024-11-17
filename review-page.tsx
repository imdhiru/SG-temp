import "./review-page.scss";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import reviewpageData from "../../../assets/_json/review.json";
import { authenticateType } from "../../../utils/common/change.utils";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  dispatchLoader,
  getProductCategory,
} from "../../../services/common-service";
import Checkbox from "../../../shared/components/checkbox/checkbox";
import TooltipModel from "../../../shared/components/model/tooltip-model";

const ReviewPage = (props: KeyWithAnyModel) => {
  const dispatch = useDispatch();
  const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
  const reviewdata: KeyWithAnyModel = reviewpageData;
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isHideTooltipIcon, setIsHideTooltipIcon] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const rpAuthInfo =
    authenticateType() === "myinfo" ? reviewdata.myinfo : reviewdata.manual;
  const [productDetails, setProductDetails] = useState({
    productName: "",
  });
  const [filterLinkList, setFilterLinkList] = useState([]);
  const [productCategory, setProductCategory] = useState("");
  useEffect(() => {
    dispatch(dispatchLoader(false));
    setProductDetails((prevValue) => {
      if (
        stageSelector &&
        stageSelector[0].stageInfo &&
        stageSelector[0].stageInfo.products.length >= 1
      ) {
        prevValue.productName = stageSelector[0].stageInfo.products[0].name;
      }
      return { ...prevValue };
    });

    const productCtg = getProductCategory(stageSelector[0].stageInfo.products);
    setProductCategory(productCtg);
    const checkProductCategory =
      productCtg === "CA" || productCtg === "SA" ? true : false;
    setIsHideTooltipIcon(checkProductCategory);
    if (checkProductCategory === true) {
      setIsChecked(true);
    }

    let reviewLinks =
      productCtg === "PL" ? reviewdata.PLLinks : reviewdata.CCPLReviewContent;
    const fliteredLink: any = Object.entries(reviewLinks.contentLink).filter(
      (link: KeyWithAnyModel) => {
        return link;
      }
    );
    setFilterLinkList(fliteredLink);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (isHideTooltipIcon) {
      props.updateCheckboxStatus(true);
    } else {
      props.updateCheckboxStatus(isChecked);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecked]);

  return (
    <>
      {/*CASA begins */}
      {productDetails && isHideTooltipIcon === true && (
        <div className="field__group">
          <div className="review__content">
            <label className="review__content--header">
              <p>{reviewdata.confirm.reviewPageHeader1}</p>
            </label>
            {rpAuthInfo.header && <label>{rpAuthInfo.header}</label>}
            {rpAuthInfo.reviewDesc_1 && (
              <div className="review__content--body">
                <p>
                  {rpAuthInfo.reviewDesc_1} {productDetails.productName}{" "}
                  {rpAuthInfo.reviewDesc_2}
                </p>
              </div>
            )}
            {rpAuthInfo.reviewMyInfoDesc_1 && (
              <div className="review__content--body">
                {rpAuthInfo.reviewMyInfoDesc_1 && (
                  <p>{rpAuthInfo.reviewMyInfoDesc_1}</p>
                )}
                {rpAuthInfo.reviewMyInfoDesc_1 && (
                  <ol type="a">
                    <li>{rpAuthInfo.reviewMyInfoDesc_2}</li>
                    <li>{rpAuthInfo.reviewMyInfoDesc_3}</li>
                    <li>{rpAuthInfo.reviewMyInfoDesc_4}</li>
                  </ol>
                )}
                {rpAuthInfo.reviewMyInfoDesc_5 && (
                  <p>
                    {rpAuthInfo.reviewMyInfoDesc_5} {productDetails.productName}{" "}
                    {rpAuthInfo.reviewMyInfoDesc_6}
                  </p>
                )}
              </div>
            )}
            <label>{reviewdata.confirm.reviewDesc}</label>
            <div className="review__content--body">
              <p>{reviewdata.confirm.reviewDesc_1}</p>
              <ol>
                <li>{reviewdata.confirm.reviewDesc_2}</li>
                <li>{reviewdata.confirm.reviewDesc_3}</li>
                <li>{reviewdata.confirm.reviewDesc_4}</li>
              </ol>
              <p>{reviewdata.confirm.reviewDesc_5}</p>
              <p>{reviewdata.confirm.reviewDesc_6}</p>
              <p>{reviewdata.confirm.reviewDesc_7}</p>
            </div>
          </div>
        </div>
      )}
      {/*CASA ends */}
      {/*CCPL begins */}
      {isHideTooltipIcon === false && (
        <>
          <div className="review__ccpl__content">
            <div className="review__title">
              <div className="review__title__label">
              <p>{reviewdata.CCPL.reviewTitle1}</p>
            </div>            
            <div className="tool-tip__icon">
              <div
                className="tool-tip"
                onClick={(event) =>
                  setIsTooltipOpen(isTooltipOpen ? false : true)
                }
              ></div>
            </div>             
            </div>
            {productCategory === "PL" && (
              <>
                <div className="review__top__content">
                  <div>{reviewdata.PLLinks.contentStart}</div>
                  {filterLinkList.map((links: KeyWithAnyModel) => {
                    return (
                      <>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={links[1].path}
                        >
                          {links[1].name},
                        </a>
                      </>
                    );
                  })}
                  {reviewdata.CCPLReviewContent.contentLinkDescp}
                </div>
                <div className="review__top__content">
                  {reviewdata.PL.reviewContent1}
                </div>
              </>
            )}
          </div>
          <div className="review__checkbox">
          <Checkbox
              reviewHeader={reviewdata.CCPL.reviewHeader}
              reviewDescp1={reviewdata.CCPL.reviewDescp1}
              reviewDescpoint1={reviewdata.CCPL.reviewDescpoint1}
              reviewDescpoint2={reviewdata.CCPL.reviewDescpoint2}
              reviewDescp2={reviewdata.CCPL.reviewDescp2}
              reviewDescp3={reviewdata.CCPL.reviewDescp3}
              reviewDescp4={reviewdata.CCPL.reviewDescp4}
              checkedStatus={isChecked}
              setCheckedStatus={setIsChecked}
            />                        
          </div>
          {productCategory === "CC" && (
            <div className="review__ccpl__content">
              <div className="review__content--header">
                <label>{reviewdata.CCPLReviewContent.contentHeading}</label>
              </div>
              <div>
                {reviewdata.CCPLReviewContent.contentStart}
                {filterLinkList.map((links: KeyWithAnyModel) => {
                  return (
                    <>
                      <a target="_blank" rel="noreferrer" href={links[1].path}>
                        {links[1].name},
                      </a>
                    </>
                  );
                })}
                {reviewdata.CCPLReviewContent.contentLinkDescp},
                {reviewdata.CCPLReviewContent.contentEnd}
              </div>
            </div>
          )}
        </>
      )}
      {/*CCPL ends */}
      {isTooltipOpen && (
        <TooltipModel
          isTooltipOpen={isTooltipOpen}
          data="review"
          setIsTooltipOpen={setIsTooltipOpen}
          productCategory={productCategory}
        />
      )}
    </>
  );
};

export default ReviewPage;