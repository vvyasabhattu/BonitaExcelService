package com.evoke.bonita.constants;

public class URLConstants {

	
	public static final String DELETE_SME_MANDATE_API = "client/ bonita/update/deleted/mandate/order/status";
	public static final String  UPLOAD_FILE = "client/upload/file";
	public static final String  SME_ORDER_REPORT_API = "client/bonita/upload/order/report";
	public static final String  EMAIL_API = "client/send/email";
	public static final String  DOWLOAD_API = "client/download/file/aws?reportCode=";
	public static final String  INFO_REQ_DETAILS = "client/update/inforeq/details";	
	public static final String TOKEN_URL = "api/v0/client/token/generate";
	
	public static final String  BULK_DOWNLOAD_API_URL = "sme-note/mediator/downloadBulkUploadTemplate";
	public static final String  INFO_REQ_DOWNLOAD_URL = "sme-note/mediator/fileDownload/downloadInfoReq";
	public static final String  GENERATE_LETTER = "sme-note/mediator/generateLetter";
	public static final String  FILE_PROCESS = "sme-note/mediator/getFileProcessMetadataByMandateId";
	public static final String  BA_ACTIVITY_LINK = "sme-note/mediator/generateLink/baActivityLink";
	public static final String  BULK_DOWNLOAD_API = "sme-note/mediator/downloadBulkUploadTemplate";
	public static final String  REPORT_TEMPLATE = "sme-note/mediator/getReportTemplate";
	public static final String  GRADING_REPORT_API = "sme-note/mediator/downloadGradingReport";
	public static final String  SME_UPLOAD_AND_CLASSIFY_API = "sme-note/mediator/uploadAndClassifyFiles";
	
	public static final Long  MANDATE_STARTS = 2000000L;
	
	
}
