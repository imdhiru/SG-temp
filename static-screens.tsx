import { useEffect } from "react";
import Fields from "./fields";
import { stateUrl } from "./stage.utils";

const StaticScreens = (props: any) => {

  useEffect(() => {
    stateUrl(props.pageStage);
  }, [props.pageStage]);
  
  return (
    <>
      <div className="static-screens">
        {(() => {
          switch (props.pageStage) {
            default:
              return <Fields />;
          }
        })()}
      </div>
    </>
  );
};

export default StaticScreens;


