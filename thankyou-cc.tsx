import "./thank-you.scss";
import { KeyWithAnyModel } from "../../../utils/model/common-model";
import ThankYouTimeline from "./thankyou-timeline";
import ThankYouBanner from "./thankyou-banner";
import ThankYouSurvey from "./thankyou-survey"
const ThankYouCC = (props: KeyWithAnyModel) => {
  const applicationDetails = props.applicationDetails;
  const thankyou = props.thankyou;

  const getTimelineData = () => {
    if (!applicationDetails.isStp) {
      return thankyou[applicationDetails.thankyouProp].CCPL.timeLine;
    }
    return thankyou.CCSTP;
  };
  return (
    <>
      <ThankYouBanner
        banner_header={
          !applicationDetails.isStp
            ? thankyou[applicationDetails.thankyouProp].CCPL.banner_header
            : thankyou.STPCCBanner.banner_header
        }
        banner_content={true}
        banner_body_1={
          !applicationDetails.isStp
            ? thankyou[applicationDetails.thankyouProp].CCPL.banner_body_1
            : ""
        }
        productName={" "}
        banner_body_2={
          !applicationDetails.isStp
            ? thankyou[applicationDetails.thankyouProp].CCPL.banner_body_2
            : ""
        }
        resumeUrl={
          !applicationDetails.isStp
            ? thankyou[applicationDetails.thankyouProp].CCPL.resumeUrl
            : ""
        }
      />
      <div className="thankyou__body__outer">
        <div className="thankyou__body">
          {!applicationDetails.isStp && (
            <>
              <div className="thankyou__title">
                <label>
                  {thankyou[applicationDetails.thankyouProp].CCPL.title}
                </label>
              </div>
              <div className="thankyou__content">
                <label>
                  {thankyou[applicationDetails.thankyouProp].CCPL.content}
                </label>
              </div>
            </>
          )}
          {applicationDetails.isStp && (
            <div className="thankyou__title">
              <div>
                {thankyou.STPCCBanner.banner_body_1}
                {applicationDetails.productName}
                {thankyou.STPCCBanner.banner_body_2}
              </div>
              <div>{applicationDetails.productName}</div>
              <div>{applicationDetails.cardNumber}</div>
            </div>
          )}
          <ThankYouTimeline
            title={thankyou[applicationDetails.thankyouText].timeLine}
            data={getTimelineData()}
            checkCompletedStatus={true}
            handleLink={props.showOTPPopup}
          />
          {applicationDetails.isStp && (
            <div>
              <div>
                {thankyou[applicationDetails.thankyouText].timeline_header}
              </div>
              <div>
                {thankyou[applicationDetails.thankyouText].timeline_desc}
              </div>
            </div>
          )}
          {!applicationDetails.isStp && (
            <div>
              <div className="thankyou__note__content">
                <label>{thankyou.CCPL.note_title}</label>
              </div>
              <div className="thankyou__note__content">
                <div>{thankyou.CCPL.note_content_1}</div>
                <div>{thankyou.CCPL.note_content_2}</div>
              </div>
              <div className="thankyou__note__content">
                <div>{thankyou.CCPL.note_content_3}</div>
                <div>
                  <a
                    target="_blank"
                    rel="feedback noreferrer"
                    href={thankyou.CCPL.note_link}
                  >
                    {thankyou.CCPL.note_content_4}
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="body__app-details">
            <label>{thankyou.CCPL.refId_lbl}</label>
            {props.applicationReferenceNo!}
          </div>
          <div className="body__refno">
            {applicationDetails.isStp ? (
              <>
                <button
                  onClick={(e) => props.showContinuePopup(e)}
                  className="thankyou__continue"
                >
                  {thankyou[applicationDetails.thankyouText].continueButton}
                </button>
              </>
            ) : (
              <button
                onClick={(e) => props.submitForm(e)}
                className="thankyou__continue"
              >
                {thankyou[applicationDetails.thankyouText].doneButton}
              </button>
            )}
          </div>
          <ThankYouSurvey/>
        </div>
      </div>   
    </>
  );
};

export default ThankYouCC;
