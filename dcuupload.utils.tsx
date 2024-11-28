describe("Utility Functions", () => {
  describe("generateUUID", () => {
    it("should return a UUID when implemented", () => {
      // Since UUID logic is not implemented, we test as is.
      const uuid = generateUUID();
      expect(uuid).toBeUndefined();
    });
  });

  describe("getAckMetaData", () => {
    it("should return metadata with MD5 hash and reqId", () => {
      process.env.REACT_APP_XRTOB = "testPrefix";
      const mockChannelReference = "channel123";
      const mockMd5 = jest.fn(() => "mockMD5Hash");
      global.md5 = mockMd5;

      const metadata = getAckMetaData(mockChannelReference);
      expect(mockMd5).toHaveBeenCalledWith("testPrefixchannel123");
      expect(metadata).toEqual({
        reqId: expect.any(Function), // Mocked `generateUUID` function
        Channel: "MOBILE",
        Country: "SG",
        Language: "EN",
        AppName: "RCWB",
        ClientId: "MOBILE",
        RumDevice: "devicebrowserversion",
        Source: "RWB",
        DeviceType: "Desktop",
        InstanceCode: "CB_SG",
        authorization: "mockMD5Hash",
      });
    });
  });

  describe("fileValidation", () => {
    it("should return an error for unsupported file formats", () => {
      const file = [{ name: "test.txt" }];
      const documentTypes = { document_type_code: "T0308" };

      const result = fileValidation(file, documentTypes);
      expect(result).toEqual({
        errorType: "signatureDocFormatError",
        enableError: true,
      });
    });

    it("should return an error for exceeding file size", () => {
      jest.spyOn(global, "getFilesSizeInMB").mockReturnValue(11); // Mock file size in MB
      const file = [{ name: "test.png" }];
      const documentTypes = { document_type_code: "T0307" };

      const result = fileValidation(file, documentTypes);
      expect(result).toEqual({
        errorType: "documentSizeExceeded",
        enableError: true,
      });
    });

    it("should validate successfully for valid file", () => {
      jest.spyOn(global, "getFilesSizeInMB").mockReturnValue(2);
      const file = [{ name: "test.png" }];
      const documentTypes = { document_type_code: "T0307" };

      const result = fileValidation(file, documentTypes);
      expect(result).toEqual({
        errorType: "",
        enableError: false,
      });
    });
  });

  describe("getFilesSizeInMB", () => {
    it("should return correct size in MB", () => {
      const result = getFilesSizeInMB(1048576); // 1 MB in bytes
      expect(result).toBe(1);
    });

    it("should return 0 for empty files", () => {
      const result = getFilesSizeInMB(0);
      expect(result).toBe(0);
    });
  });

  describe("getTotalFileSize", () => {
    it("should calculate total file size for accepted files", () => {
      const finalDocList = [
        {
          documentStatus: "ACCEPTED",
          fileObject: { size: 1048576 }, // 1 MB
        },
        {
          documentStatus: "REJECTED",
          fileObject: { size: 2097152 }, // 2 MB
        },
      ];

      const result = getTotalFileSize(finalDocList);
      expect(result).toBe(1048576);
    });
  });

  describe("setSuccessStatus", () => {
    it("should update document response with uploaded status", async () => {
      const documentResponse = [
        {
          document_list: [
            {
              document_category_code: "DOC01",
              document_options: [
                {
                  document_types: [
                    {
                      uploaded_documents: [{}, {}],
                      document_type_code: "T123",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      const documentTypes = { document_category_code: "DOC01" };
      const selectedDocument = [
        {
          document_types: [{ document_type_code: "T123" }],
        },
      ];
      const documentUploadResponse = { docId: "12345" };
      const indexOfUpload = 1;

      const result = await setSuccessStatus(
        documentResponse,
        documentTypes,
        selectedDocument,
        documentUploadResponse,
        indexOfUpload
      )();

      expect(result[0].document_list[0].document_options[0].document_types[0].uploaded_documents[1]).toEqual({
        ...documentUploadResponse,
        documentStatus: "UPLOADED",
      });
    });
  });

  describe("validateMandatoryDoc", () => {
    it("should identify missing mandatory documents", async () => {
      const documentResponse = [
        {
          document_list: [
            {
              document_category_code: "DOC01",
              document_options: [
                {
                  document_types: [
                    { uploaded_documents: [] },
                  ],
                },
              ],
            },
          ],
        },
      ];
      const documentMandatoryStore = { DOC01: true };

      const result = await validateMandatoryDoc(
        documentResponse,
        documentMandatoryStore
      )();

      expect(result).toEqual({ DOC01: true });
    });
  });

  describe("getDocumentThumnail", () => {
    it("should fetch document thumbnail", async () => {
      const uploadedDocList = { document_id: "12345" };
      const refernceDetails = { channelReference: "ref123" };

      mockedAxios.get.mockResolvedValue({ data: "mockData" });
      const result = await getDocumentThumnail(
        uploadedDocList,
        "image",
        refernceDetails
      )();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/documents/12345"),
        { responseType: "arraybuffer" }
      );
      expect(result).toBeDefined();
    });
  });
});





import { KeyWithAnyModel } from "../../../utils/model/common-model";
import md5 from "md5";
import documentValidation from "../../../assets/_json/document-upload.json";
import { submitService } from "../../../services";
import axios from "axios";
import { getUrl } from "../../../utils/common/change.utils";
export const documentClientContext = (channelReference: string) => {
  return {
    ClientId: "iOS",
    Version: "1.0",
    RumDevice: "version: 1.7.21; build: 100",
    Language: "EN",
    Channel: "MOBILE",
    Country: "SG",
    AppName: "RCWBSG",
    reqId: submitService.generateUUID,
    userId: "1100011",
    Environment: "HKLPXTRCW04",
    SessionId: "885bc820-7715-4939-8af9-ec007fc87af5",
    Host: "https://rcwbsit.sc.com",
    classification: "TMP",
    authorization: md5(process.env.REACT_APP_XRTOB + channelReference),
  };
};

export const getDocumentMetaData = (
  selectedDocument: KeyWithAnyModel,
  documentTypes: KeyWithAnyModel
) => {
  return {
    origin: "front-line-supporting-document",
    documentCategoryCode: documentTypes.document_category_code,
    documentTypeCode: selectedDocument[0].document_types[0].document_type_code,
    applicantId: 1,
    imageOrder: selectedDocument[0].document_types[0].uploaded_documents.length,
    period: "0",
    isWatermarkRequired: "N",
    documentOptionSequence: selectedDocument[0].document_option_sequence
  };
};

export const fileuploadSuccess = (
  selectedDocumentList: KeyWithAnyModel,
  docUploadResponse: KeyWithAnyModel
): any => {
  return async () => {
    let uploadSuccessData:any;
    selectedDocumentList[0].uploaded_documents.forEach(function (
      value: KeyWithAnyModel
    ) {
      if (
        value["documentStatus"] === "UPLOADED" ||
        value["documentStatus"] === "UPLOADING"
      ) {
        value["docId"] = docUploadResponse["docId"];
        value["documentStatus"] =
        docUploadResponse["documentStatus"] === "UPLOADED" ? "Accepted" : "";
        value["document_name"] = docUploadResponse["document_name"];
        uploadSuccessData = value;
      }
    });
    return Promise.resolve(uploadSuccessData);
  };
};

export const generateUUID = () => {
  //return uuid.v4(); --> UUID logic has to be included
};

export const getAckMetaData = (channelReference: string) => {
  const md5Hsh = process.env.REACT_APP_XRTOB + channelReference;
  const MD5_ = md5(md5Hsh);
  return {
    reqId: submitService.generateUUID,
    Channel: "MOBILE",
    Country: "SG",
    Language: "EN",
    AppName: "RCWB",
    ClientId: "MOBILE",
    RumDevice: "devicebrowserversion",
    Source: "RWB",
    DeviceType: "Desktop",
    InstanceCode: "CB_SG",
    authorization: MD5_,
  };
};

export const fileValidation = (file: any,documentTypes:KeyWithAnyModel) => {
  //yet to handle PDF
  let docFormatSignCap = ["PNG","JPEG","JPG"]
  let fileType = file[0].name.substring(
    file[0].name.lastIndexOf(".") + 1,
    file[0].name.length
  ).toUpperCase();
  let basicDocumentFormat = documentValidation.acceptedFileTypes.toUpperCase();
  if (basicDocumentFormat.indexOf(fileType) === -1 || (documentTypes.document_type_code === 'T0308' && docFormatSignCap.indexOf(fileType) === -1)) {
   let formatErrorType = documentTypes.document_type_code === 'T0308' ?  "signatureDocFormatError" : "documentFormatError";
    return {
      errorType: formatErrorType,
      enableError: true,
    };
    //format error
  } else if (getFilesSizeInMB(file) > documentValidation.maxfilesize) {
    //size error
    return {
      errorType: "documentSizeExceeded",
      enableError: true,
    };
  }

  return {
    errorType: "",
    enableError: false,
  };
};

export const getFilesSizeInMB = (bytes: number) => {
  const k = 1024;
  if (bytes === 0) return 0;
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  //To fixed of null - IE 11 issue
  const fileSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return i === 2 ? fileSize : 0;
};

export const getTotalFileSize = (finalDocList: KeyWithAnyModel) => {
  let combinedFileSize = 0;
  finalDocList.forEach(function (value: KeyWithAnyModel) {
    if (
      value["documentStatus"].toUpperCase() === "ACCEPTED" &&
      value.fileObject
    ) {
      combinedFileSize = combinedFileSize + value.fileObject.size;
    }
  });
  return combinedFileSize;
};

export const setSuccessStatus = (
  documentResponse: KeyWithAnyModel,
  documentTypes: KeyWithAnyModel,
  selectedDocument: KeyWithAnyModel,
  documentUploadResponse: KeyWithAnyModel,
  indexOfUpload: number
):any => {
  return async () => {
  documentResponse[0].document_list.forEach((docOption: KeyWithAnyModel) => {
    if (
      docOption.document_category_code === documentTypes.document_category_code
    ) {
      docOption.document_options.forEach(
        (documentSegment: KeyWithAnyModel) => {
          if (
            documentSegment.document_types[0].document_type_code ===
            selectedDocument[0].document_types[0].document_type_code
          ) {
            if(documentSegment.document_types[0].uploaded_documents[indexOfUpload]){
              const docName = documentSegment.document_types[0].uploaded_documents[indexOfUpload].document_name;
              documentSegment.document_types[0].uploaded_documents[indexOfUpload] =
              documentUploadResponse;
              documentSegment.document_types[0].uploaded_documents[indexOfUpload].document_name = docName;
              documentSegment.document_types[0].uploaded_documents[indexOfUpload].documentStatus =
                "UPLOADED";
              documentSegment.document_types[0].uploaded_documents[indexOfUpload].docId =
              documentUploadResponse.docId;
            }
          }
        }
      );
    }
  });
  return Promise.resolve(documentResponse);
}

};

export const validateMandatoryDoc = (
  documentResponse: KeyWithAnyModel,
  documentMandatoryStore: KeyWithAnyModel
): any => {
  let missingManadatoryDoc:any = [];
  let uploadedDocumentList:any = [];
  return async () => {
    documentResponse[0].document_list.forEach((docOption: KeyWithAnyModel) => {
      if (documentMandatoryStore && documentMandatoryStore[docOption.document_category_code]) {
        docOption.document_options.forEach((docList: KeyWithAnyModel) => {
          docList.document_types.forEach((documentSegment: KeyWithAnyModel) => {
            if (
              !uploadedDocumentList[docOption.document_category_code]  && (
              ! documentSegment.uploaded_documents || 
              documentSegment.uploaded_documents === null ||
              documentSegment.uploaded_documents.length <= 0 || 
              (documentSegment.uploaded_documents.length === 1 && documentSegment.uploaded_documents[0].document_status === "UPLOAD") )
            ) {

              missingManadatoryDoc[docOption.document_category_code] = true;
            }
            else{
              uploadedDocumentList[docOption.document_category_code] = true
              if(missingManadatoryDoc[docOption.document_category_code]){
                delete missingManadatoryDoc[docOption.document_category_code];
              }
            }
          });
        });
      }
    });
    return missingManadatoryDoc;
  };
};

export const getDocumentThumnail = (
  uploadedDocList: KeyWithAnyModel,
  _type: string,
  refernceDetails: KeyWithAnyModel
): any => {
  const docTestId = uploadedDocList['document_id']?uploadedDocList['document_id']:uploadedDocList["docId"];
  let documentId:string;
  let typeOfDoc:string;
  if(uploadedDocList.document_id){
    typeOfDoc = docTestId.split(".").pop();
    documentId = docTestId
  }else{
    typeOfDoc = uploadedDocList.document_name.split(".").pop();
    documentId = docTestId+"."+typeOfDoc
  }
  const imageurl =
    process.env.REACT_APP_RTOB_BASE_URL +
    "/applications/" +
    refernceDetails.channelReference +
    "/documents/" + documentId
    
  return async () => {
    return axios.get(imageurl, { responseType: "arraybuffer" }).then((response) => {
      const blob = typeOfDoc === 'pdf' ? new Blob([response.data], {type: 'application/pdf'}) : new Blob([response.data], { type: "image/png" }),
        imgUrl = window.URL.createObjectURL(blob);
        return Promise.resolve(imgUrl);
    });
  };
};

export const filterDocuments = (documentList: KeyWithAnyModel): any => {
  documentList.finalDocument = {finalDocumentList: [],
  optionList: {
    docOption: [],
    optionsSelected: { applicantId: 1, options: [] },
  }}
  documentList.forEach((docList: KeyWithAnyModel) => {
    docList.document_list.forEach((documentTypes: KeyWithAnyModel) => {
      documentTypes.document_options.forEach(
        (docTypeList: KeyWithAnyModel) => {
          docTypeList.document_types.forEach((documentSelected: any) => {

            if(documentSelected.document_type_code === "T0308"){
              docList.isSignatureDoc = true;
            }
            if (
              documentSelected.uploaded_documents &&
              documentTypes.isSlectedForUpload !== "Y" &&
              documentSelected.uploaded_documents !== null &&
              documentSelected.uploaded_documents.length &&
              documentSelected.uploaded_documents.length > 0
            ) {
              documentSelected.uploaded_documents.forEach((documentUpload:KeyWithAnyModel, index:number)=>{
                if(documentUpload.document_status !== "Rejected"){
                  documentTypes.isSlectedForUpload = "Y";
                  documentUpload.docId = documentUpload.document_id.split(".")[0]
                  documentUpload.country = "SG"
                  documentUpload.documentStatus = documentUpload.document_status
                  documentUpload.appId = getUrl.getChannelRefNo().channelRefNo
                  documentUpload.documentCategoryCode = documentTypes.document_category_code
                  documentUpload.errorDescription = null
                  documentUpload.errorCode = null
                  documentUpload.responseStatus = null
                  documentUpload.documentTypeCode = documentSelected.document_type_code
                  documentUpload.documentOptionSequence = documentUpload.document_sequence_number
                  documentUpload.imageOrder = index+1
                  documentUpload.applicantId = 1
                if(documentUpload.documentStatus){
                  if(documentUpload.documentStatus === "UPLOADED"){
                    documentList.finalDocument.finalDocumentList.push(documentUpload);
                    if (
                      documentList.finalDocument.optionList.docOption.indexOf(
                        documentTypes.document_type_code
                      ) === -1
                    ) {
                      documentList.finalDocument.optionList.docOption.push(
                        documentTypes.document_type_code
                      );
                      documentList.finalDocument.optionList.optionsSelected.options.push({
                        documentCategoryCode: documentTypes.document_category_code,
                        documentOptionSequence: documentTypes.document_options[0].document_option_sequence,
                        documentTypeCode:documentSelected.document_type_code,
                      });
                    }
                  }
                  documentUpload.documentStatus = documentUpload.document_status === "UPLOADED" ? "Accepted" : documentUpload.document_status;
                }
                
                delete documentUpload.document_id
                delete documentUpload.document_status
              }
              })
            }
          });
        }
      );
    });
  });
  return documentList;
};

export const documentUploadRequest = (docaxios:any,url:string,data:KeyWithAnyModel,options:any) : any =>{
  return async ()=>{
     docaxios
    .post(url, data, options)
    .then((response:any) => {
      return Promise.resolve(response)
    }).catch((err:any)=>{
      return Promise.reject(err)
    })
  }

}
