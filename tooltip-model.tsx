import "./model.scss";
import { KeyWithAnyModel } from "../../../utils/model/common-model";
import reviewpageData from "../../../assets/_json/review.json";

const TooltipModel = (props: KeyWithAnyModel) => {
  const reviewdata: KeyWithAnyModel = reviewpageData;
  if (props.data === "review" && props.productCategory === "PL")
    reviewdata.TooltipModel = reviewdata.PLTooltipModel;
  const close = (e:any) => {
     props.setIsTooltipOpen(false);
  };
  return (
    <>
      {/* banca Tooltip Model */}
      {props.data === 'banca' && props.isTooltipOpen && props.updatedInsuranceInformation && (
        <div className="tooltip-popup">
          <div className="tooltip-popup-container1">
            <div className="close-button" onClick={(e)=>close(e)}></div>
            <div className="tooltip-popup-info">
              {props.updatedInsuranceInformation.modalTitle && (
                <>
                  <div className="tooltip-popup-info__head">
                    {props.updatedInsuranceInformation.modalTitle}
                  </div>
                  <div>{props.updatedInsuranceInformation.ProductNameLabel}</div>
                  <hr />
                </>
              )}
              <div className="tooltip-popup-info__desc">
                {props.updatedInsuranceInformation.modalContent &&
                  props.updatedInsuranceInformation.modalContent.map(
                    (contentHeader: any, index: number) => {
                      return (
                        <>
                          <div key={index}>{contentHeader.header}</div>
                          <div>
                            {contentHeader.details &&
                              contentHeader.details.map(
                                (contentDetails: any, index: number) => {
                                  return (
                                    <div key={index}>{contentDetails}</div>
                                  );
                                }
                              )}
                          </div>
                        </>
                      );
                    }
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Review Tooltip Model */}
      {props.data === 'review' && props.isTooltipOpen && reviewdata.TooltipModel && (
        <div className="tooltip-popup">
          <div className="tooltip-popup-container1">
            <div className="close-button" onClick={(e)=>close(e)}></div>
            <div className="tooltip-popup-info">
              {reviewdata.TooltipModel.modelHeader && (
                <>
                  <div className="tooltip-popup-info__head">
                    {reviewdata.TooltipModel.modelHeader}
                  </div>
                  <div  className="tooltip__popup__info__subhead">{reviewdata.TooltipModel.modelSubHeader}</div>
                </>
              )}
              <div className="tooltip-popup-info__desc">
                {reviewdata.TooltipModel.modelDescrip &&
                  reviewdata.TooltipModel.modelDescrip.map(
                    (modelDescp: any, index: number) => {
                      return (
                        <>
                          <div key={index}>{modelDescp}</div>
                        </>
                      );
                    }
                  )}
                <div>{reviewdata.TooltipModel.subHeadings.subHeading}</div>
                {reviewdata.TooltipModel.subHeadings.bulletPointsHead &&
                    reviewdata.TooltipModel.subHeadings.bulletPointsHead
                      .point1 && (
                      <div>{reviewdata.TooltipModel.subHeadings.bulletPointsHead.point1}</div>
                )}
                {reviewdata.TooltipModel.subHeadings.bulletPointsHead && reviewdata.TooltipModel.subHeadings.bulletPointsHead.point2 &&
                  reviewdata.TooltipModel.subHeadings.bulletPointsHead.point2.map(
                    (points2: any, index: number) => {
                      return (
                        <>
                          <div key={index}>{points2}</div>
                        </>
                      );
                    }
                  )}
                {reviewdata.TooltipModel.subHeadings.bulletPointsHead && reviewdata.TooltipModel.subHeadings.bulletPointsHead.point3 &&
                  reviewdata.TooltipModel.subHeadings.bulletPointsHead.point3.map(
                    (points3: any, index: number) => {
                      return (
                        <>
                          <div key={index}>{points3}</div>
                        </>
                      );
                    }
                  )}
                {reviewdata.TooltipModel.subHeadings.subRemainingHeading &&
                  reviewdata.TooltipModel.subHeadings.subRemainingHeading.map(
                    (subheading: any, index: number) => {
                      return (
                        <>
                          <div key={index}>{subheading}</div>
                        </>
                      );
                    }
                  )}
                {reviewdata.TooltipModel.subBulletPoints &&
                  reviewdata.TooltipModel.subBulletPoints.map(
                    (subBulletPoints: any, index: number) => {
                      return (
                        <>
                          <div key={index}>{subBulletPoints}</div>
                        </>
                      );
                    }
                  )}
                <div>{reviewdata.TooltipModel.SecondTitle}</div>
                <div>{reviewdata.TooltipModel.secondSubTitle}</div>
                {reviewdata.TooltipModel.modelDescrip &&
                  reviewdata.TooltipModel.secondDescrp.map(
                    (secondDescrp: any, index: number) => {
                      return (
                        <>
                          <div key={index}>{secondDescrp}</div>
                        </>
                      );
                    }
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TooltipModel;