import { Injectable } from '@angular/core';
// import { Observable, of, throwError } from 'rxjs';
import {
  HttpClient,
  HttpResponse,
  HttpHeaders,
  HttpHandler,
  HttpErrorResponse
} from '@angular/common/http';
import { SettingsService } from './settings.service';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable()
export class DashboardService {
  private API_ALL_MANDATES_URL = '/extension/getrequests?f=getOverAllCounts';
  private API_GET_COLUMN_DATA = '/extension/getrequests?f=getrequests';
  private API_GET_REQUEST_BY_USER= '/extension/getrequests?f=getFailedrequests';
  private API_GET_MANDATES_URL_FILTERS = '/extension/getrequests?f=getrequests';


  private API_GET_COLUMN_FIELDS = '/extension/smekpi';
  private API_SET_COLUMN_FIELDS = '/extension/smedashboard';
  private API_GET_AUTO_PRODUCT = '/extension/getMasterData';
  
  private API_GET_COMPLETD_URL_FILTERS = '/extension/getrequests?f=getcompletedrequests';
  private API_GET_EXCEL_MANDATES = '/extension/smedashboard?f=getnetopsmandatesforexcel';
  private API_POST_COMMENTS = '/extension/smedashboard?f=savecomments';
  private API_GET_COMMENTS = '/extension/smekpi';

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) { }

  checkFormLink(link) {
    return this.http.get<any>(link);
  }

  checkUserRoles(user) {
    return this.http.post(`/bonita/API/extension/mandateUtility?f=getUserRoles`, { userName: user });
  }

  getAllMandatesDummy() {
    return this.http.get<any>(this.settingsService.getBonitaApiBaseUrl() + this.API_GET_COLUMN_FIELDS + '?c=0&p=10&f=getAllMandates');
  }

  getAllMandatesWithFilters(filter?, page?, sort?) {
    console.log('filter page, sort ', filter, page, sort);
    //    POST /api/v1/purchaseorder
    const filterData = {
      filter: filter,
      page: page,
      sort: sort
    };
    // filter to fetch all data
    const filterDataAll = {
      "filter":{
        "filters":[] 
      },
      "page":{
          "page":1,"pageSize":page.totalPage
      },
      sort: sort
    };
    return this.http.get<any>(this.settingsService.getBonitaApiBaseUrl() + this.API_GET_COLUMN_DATA);
  }

   deleteMandates(rec) {
  //  const response1 = this.http.get<any>(this.settingsService.getBonitaApiBaseUrl() + this.API_ALL_MANDATES_URL + '?c=0&p=10&f=deletemandates&ids=' + rec.join());
     const response2 =  this.http.post<any>('/bonitaAPI/accesssme/deleteMandateFromSME', { mandateIds: rec.join() });
     const response3 =  this.http.post<any>('/bonita/API/extension/mandateUtility?f=bulkDelete',{ mandateIds: rec.join() });
    return forkJoin([response2, response3]);
    
  }
  getProducts() {
    return this.http.post('/bonita/API/extension/getMasterData?f=products', {});
  }

  getInstitutions(selectedProduct) {
    return this.http.post('/bonita/API/extension/getMasterData?f=institution', {productId: selectedProduct});
  }

  onProductAutoComplete(obj) {
    // return this.http.get<any>('https://reqres.in/api/users');
    return this.http.post<any>(
      this.settingsService.getBonitaApiBaseUrl() +
      this.API_GET_AUTO_PRODUCT + '?f=product',
      obj,
      { observe: 'response' }
    );
  }

  onInstitutionAutoComplete(obj) {
    return this.http.post<any>(
      this.settingsService.getBonitaApiBaseUrl() +
      this.API_GET_AUTO_PRODUCT + '?f=institution',
      obj,
      { observe: 'response' }
    );
  }

  onBillingCompanyAutoComplete(obj) {
    return this.http.post<any>(
      this.settingsService.getBonitaApiBaseUrl() +
      this.API_GET_AUTO_PRODUCT + '?f=bacompany',
      obj,
      { observe: 'response' }
    );
  }

  onBillingCompanyContactAutoComplete(obj) {
    return this.http.post<any>(
      this.settingsService.getBonitaApiBaseUrl() +
      this.API_GET_AUTO_PRODUCT + '?f=bacompanycontact',
      obj,
      { observe: 'response' }
    );
  }

  getBAcompaniesList(companyName) {
    return this.http.post('/bonita/API/extension/getMasterData?f=bacompaniescontact', { companyName });
  }

  getColumnFieldService() {
    return this.http.get(
      this.settingsService.getBonitaApiBaseUrl() +
      this.API_GET_COLUMN_FIELDS +
      '?c=0&p=10&f=getdashboardfields'
    );
  }

  saveColumnFieldsSevice(leftColumn, rightColumn) {
    return this.http.post<any>(
      this.settingsService.getBonitaApiBaseUrl() +
      this.API_SET_COLUMN_FIELDS +
      '?c=0&p=10&f=saveconfiguration',
      { 'dashboardFieldMenu': leftColumn, 'rightDashboardFieldMenu': rightColumn },
      { observe: 'response' }
    );
  }

  getMadatesCount() {
    return this.http.get<any>(this.settingsService.getBonitaApiBaseUrl() + this.API_ALL_MANDATES_URL );
  }

  getMandatesByFilter(filter?, page?, mandateStatus?, sort?,section?) {
    if(section == 'Request created'){
      return this.http.get<any>(this.settingsService.getBonitaApiBaseUrl() + this.API_GET_REQUEST_BY_USER);
    }else if(section == 'Request closed'){
      return this.http.get<any>(this.settingsService.getBonitaApiBaseUrl() + this.API_GET_COMPLETD_URL_FILTERS);
    }else{   
      return this.http.get<any>(this.settingsService.getBonitaApiBaseUrl() + this.API_GET_MANDATES_URL_FILTERS);
    }
  }

  getProcessIdToRedirectParent(smeProcessName) {
    return this.http.get('/bonita/API/bpm/process?f=name=' +smeProcessName+ '&p=0&c=1&o=version%20desc&f=activationState=ENABLED');
  }

  saveSingleNOMandate(productName, institutionName, billingCompany, billingCompanyContact, userid) {
    return this.http.post<any>('/bonitaAPI/accesssme/createMandate?source=NO', {
      "userId": userid,
      "productName": productName,
      "institutionName": institutionName,
      "billingCompany": billingCompany,
      "billingCompanyContact": billingCompanyContact,
      "entityName": '',
      "orderId": '',
      "lender": '',
      "smeFirstStatus": ''
    });
  }

  fetchExcelData(data) {
    if (data.length > 0) {
      return this.http.post(this.settingsService.getBonitaApiBaseUrl() + this.API_GET_EXCEL_MANDATES, { 'requestIds': data.join() });
    } else {
      return this.http.post(this.settingsService.getBonitaApiBaseUrl() + this.API_GET_EXCEL_MANDATES, {});
    }
  }

  //  getColumnsAndData() {
  //     return Observable.forkJoin(
  //     this.http.get(this.settingsService.getBonitaApiBaseUrl() + this. + '?c=0&p=10&f=getdashboardfields'),
  //     this.http.get(this.settingsService.getBonitaApiBaseUrl() + this. + '?c=0&p=10&f=getAllMandates')
  //     );
  //  }
  //  getColumnsAndData() {
  //    const c1 = this.http.get(this.settingsService.getBonitaApiBaseUrl() + this. + '?c=0&p=10&f=getdashboardfields');
  //    const c2 = this.http.get(this.settingsService.getBonitaApiBaseUrl() + this. + '?c=0&p=10&f=getAllMandates');
  //    return Observable.forkJoin([c1, c2]);
  //   }
  globalHeaderSearch(globalSearch) {
    return this.http.post<any>(
      this.settingsService.getBonitaApiBaseUrl() +
      this.API_SET_COLUMN_FIELDS +
      '?f=getnetopsmandatesforglobalsearch',
      {
        'filter': {
          'filters': [
            {
              'filters': [
                {
                  'field': '',
                  'operator': '',
                  'value': ''
                }

              ]

            },

          ],
          'logic': 'and'
        },
        'page': {
          'page': 1,
          'pageSize': 10
        },
        'sort': {
          'dir': '',
          'field': ''
        },
        'columnName': globalSearch.searchFilter ? globalSearch.searchFilter : 'all',
        'searchString': globalSearch.searchWord
      },
      { observe: 'response' }
    );
  }
  getComments(workflow_id,role) {
    return this.http.get<any>(this.settingsService.getBonitaApiBaseUrl() + this.API_GET_COMMENTS + '?f=getcomments&c=' + workflow_id + '&p=NO&'+'t='+ role);
  }

  addComment(Comment, Role, id, commentRole,global_mandate_id) {
    return this.http.post(this.settingsService.getBonitaApiBaseUrl() + this.API_POST_COMMENTS, {
      comment: Comment,
      userRole: Role,
      workflow_id: id,
      toUserRole: commentRole,
      globalMandateId: global_mandate_id
    });
  }

  rejectMandates(payload) {
    return this.http.post(this.settingsService.getBonitaApiBaseUrl() + '/extension/mandateUtility?f=bulkReject', payload);
  }

  caseOnFloorMandates(mandatesList) {
    return this.http.post(this.settingsService.getBonitaApiBaseUrl() + '/extension/mandateUtility?f=caseonfloor', { mandateIds: mandatesList });
  }

  generateOFSinvoice(mandateIds) {
    return this.http.post('/bonitaAPI/accesssme/generateOFSReport?mandateIds=' + mandateIds, {});
  }

  getBillingCompanyDetails(productId,institutionId){
    return this.http.post('/bonitaAPI/accesssme/feeMaster?productId='+ productId +  '&institutionId='+ institutionId,{});
  }

  getPOdetails(feeId){
    return this.http.post('/bonitaAPI/accesssme/poListByFeeId?feeId='+ feeId,{})
  }

  uploadEditBulkMandate(formData){
    return this.http.post('/bonitaAPI/ismeMandatesUpdate',formData);
  }

  fetchEditExport(type,mandateIdsString){
    return this.http.get<any>('/bonitaAPI/accesssme/downloadExcelForBulkMandate?exportFileName=' + type + '&mandateIds=' + mandateIdsString,{responseType: 'blob' as 'json'});
  }

  checkTemplatesUpload(productId,institutionId,productName,institutionName){
    const obj = {
      productId:productId,
      institutionId:institutionId,
      productName:productName,
      institutionName:institutionName
    }
    return this.http.post('/bonitaAPI/accesssme/checkTemplatesUpload',obj);
  }

}
