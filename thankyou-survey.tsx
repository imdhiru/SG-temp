import "./thank-you.scss";
import { KeyWithAnyModel, StoreModel } from "../../../utils/model/common-model";
import thankyouData from "../../../assets/_json/thankyou.json";
import { useSelector} from "react-redux";
import { getUrl } from "../../../utils/common/change.utils";


const ThankYouSurvey = ( ) => {
const thankyou: KeyWithAnyModel = thankyouData;
const stageSelector = useSelector((state: StoreModel) => state.stages.stages);
const applicationReferenceNo = getUrl.getChannelRefNo().applicationRefNo;
const survey_link = "&p="+stageSelector[0].stageInfo.products[0].product_category+"&m=sg"+"&c="+applicationReferenceNo;

  return (
    <div className="thankyou__feedback">
    {thankyou.Survey.content_1}
    <a target="_blank" 
    rel="feedback noreferrer" 
    href={thankyou.Survey.link+survey_link} >
    {thankyou.Survey.content_2}</a>
    {thankyou.Survey.content_3}
  </div>
  );
};

export default ThankYouSurvey;