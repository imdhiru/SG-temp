import axios, { AxiosError } from "axios";
import { KeyWithAnyModel } from "../../../utils/model/common-model";

export const postalCodeValidation = (value:string,channelrefNumber:number,applicants:KeyWithAnyModel):any => {
  
  const application = `${process.env.REACT_APP_RTOB_APPLICATION_END_POINT}`;
  const baseUrl = `${process.env.REACT_APP_RTOB_BASE_URL}`;
  const postalCode = `${process.env.REACT_APP_RTOB_SINGPOST}`
  const url = baseUrl+application+channelrefNumber+postalCode+'?zipCode='+value
   return async () => {
       return axios
        .get(url)
        .then(async (response:any) => {
          let tmpApplicants:KeyWithAnyModel = {};
          tmpApplicants['block_a_1'] = response.data.applicants['block_a_1']
          tmpApplicants['building_name_a_1'] = response.data.applicants['building_name_a_1']
          tmpApplicants['street_name_a_1'] = response.data.applicants['street_name_a_1']
          return Promise.resolve(tmpApplicants);
        })
        .catch((error: AxiosError) => {
          return Promise.resolve(error);
        });
    };
}

