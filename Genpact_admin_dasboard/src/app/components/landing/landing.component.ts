import { Component, OnInit, ViewChild, OnDestroy , ElementRef, ViewEncapsulation,Renderer2} from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { SortDescriptor, State, CompositeFilterDescriptor,process} from '@progress/kendo-data-query';
import { GridDataResult, SelectAllCheckboxState, PageChangeEvent,GridComponent,RowClassArgs } from '@progress/kendo-angular-grid';
import { CookieService } from 'ngx-cookie-service';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Observable, of, Subscription, timer} from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, tap  } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { LoaderService } from '../../loader.service';
import { DataService } from '../../services/share.service';
import { DashboardService } from '../../services/dashboard.service';
import { ExcelServicesService } from '../../services/excel.service';
import { BulkuploadService } from '../../services/bulkupload.service';
import { BulkuploadSharedData } from '../../services/bulkUpload.sharedData.service';
import { stickyColumnDimensions, commonColumnDimensions } from './kendoGridStickyColumns';
import { CommentsModalComponent } from './coments-modal.component';
import { HttpClient} from '@angular/common/http';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: "landing-component",
  encapsulation: ViewEncapsulation.None,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  providers: [DatePipe]
})
export class LandingComponent implements OnInit, OnDestroy {
  @ViewChild('tabset', { static: true }) tabset: TabsetComponent;
  @ViewChild('uploadconfirmation', { static: true }) uploadconfirmation: ElementRef;
  @ViewChild('bulkMandateFileUpload', { static: true }) bulkMandateFileUpload:ElementRef;
  @ViewChild(GridComponent, {static: false}) public grid;
  @ViewChild('resultModal', {static: false}) resultModal : ElementRef;
  // @ViewChild('toggleButton', { static: true }) toggleButton: ElementRef;
  // @ViewChild('menu', { static: true }) menu: ElementRef;
  bsModalRef: BsModalRef;

  singleModuleSearch = {
    searchProductTypeText: '',
    searchInstituteText: '',
    searchBillingCompany: '',
    searchBillingCompanyContact: ''
  };
  public filter: CompositeFilterDescriptor;
  gridPageSize = 10; // This is for client side pagination
  gridDataTemp: any = []; // This is for client side pagination
  skip = 0; // This is for client side pagination
 
  public state: State = {
    skip: 0,
    take: this.gridPageSize,
    sort: [{
      field: 'mandate_originated_date',
      dir: 'desc'
    }],
    filter: {
      logic: 'and',
      filters: []
    }
  };
  overviewPage = { page: 1, pageSize: this.gridPageSize };// This is for client side pagination
  public gridData: GridDataResult;
  public gridDataExpense: GridDataResult;
  public filteredData: any;
  public comment: string;
  public userRole: string;
  public userid: any;
  public gridShow: string = 'all';
  modalRef: BsModalRef;
  showCommonColumns: any = [];
  stickyCount: number;
  public productId: any;
  usrData: any;
  public test: any;
  errorMessage: string = '';
  MandateList: string = '';
  public gridDataFiltered : any;
  filterSize: number = 0;

  statuses = [
    { name: 'Allocated to Reviewer Team 1'},
    { name: 'Allocated to Team 1 Analyst' },
    { name: 'BD originated' },
    { name: 'Info req approved'},
    { name: 'Info req received'},
    { name: 'Mandate Created' },
    { name: 'Team 1 rejected' },
    { name: 'Team 2 Reviewer approved' }
  ];

  mandatesCounts = {
    totalRequestCount: 0,
    supervisorCount: 0,
    completedrequestCount: 0
  };

  mainColumnDimenstions = {
    CASEID                : { sticky : true, checked : true },
    REQUESTTYPE      : { sticky : false, checked : true },
    DESCRIPTION           : { sticky : false, checked : true },
    TOPIC          : { sticky : true, checked : true },
    CREATEDBY                   : { sticky : false, checked : true },
    CREATEDON               : { sticky : false, checked : true },
    DESCRIPTIONS      : { sticky : false, checked : true },
    COMMENTS      : { sticky : false, checked : true },
    REQUESTSTATUS  : { sticky : false, checked : true },
    PRIORITY  : { sticky : false, checked : true }
   
    
  };
  datastring: any;

  stickyColumnDimensions: any = stickyColumnDimensions;
  commonColumnDimensions: any = commonColumnDimensions;

  public mySelection: number[] = [];
  public selectAllState: SelectAllCheckboxState = 'unchecked';
  excel = [];
  commentsRole: any;
  isChecked: boolean = false;
  currentColumnSelection: any = [];
  searchProductName: any;
  searchInstituteName: any;
  searchBillingComp: any;
  searchBillingCompContact: any;
  institutionId: string = '';
  workId: any;
  globalMandateId: any;
  hasDeleteAccess: boolean = false;
  subscription: Subscription;
  companyContacts: any = [];
  products = [];
  institutions = [];
  productsList: any;
  institutionsList: any;
  selectedProductObj: any;
  disableInstitution: boolean = false;
  disableBillingCompany: boolean = false;
  disableBillingContact: boolean = false;
  smeProcessName:string = '';
  agreeementDate:boolean = false;
  agreeementStartDate = new Date();
  agreeementEndDate = new Date();
  mouDate:boolean = false;
  mouStartDate = new Date();
  mouEndDate = new Date();
  purchaseOrderDate:boolean = false;
  purchaseOrderStartDate = new Date();
  purchaseOrderEndDate = new Date();
  letterIntentDate:boolean = false;
  letterIntentStartDate = new Date();
  letterIntentEndDate = new Date();
  engagementLetterDate:boolean = false;
  engagementLetterStartDate = new Date();
  engagementLetterEndDate = new Date();
  commercialEmailDate: boolean = false;
  commercialEmailStartDate = new Date();
  commercialEmailEndDate = new Date();
  poDetails:any;
  startDateAccMis: Date;  
  endDateAccMis: Date;
  startDateInsMis: Date;  
  endDateInsMis: Date;  
  toggleMIS : boolean = false;
  tabSelected : any="all";
  mandateids:any;
  getdata:any;
  resultFilterKey:any="all";
  resultFilterWord:any="all";
  search_word:any;
  mandateIdsString : string = '';
  public fileList: FileList;
  public file: File;
  todayDate:Date;
  isMisOpen=false;
  recentactivities: any = [];
  errorInfo: any = [];
  gridData2:any;
  gridDataFiltered2:any;
  gridDataTemp2: any = [];
  gridDataExpenseTemp: any = [];
  gridDataExpenseTemp2: any = [];

  constructor(
   // private loaderService: LoaderService,
    private dashBoard: DashboardService,
    private datePip: DatePipe,
    private modalService: BsModalService,
    private excelService: ExcelServicesService,
    private bulkUploadService: BulkuploadService,
    private bulkUploadSharedData: BulkuploadSharedData,
    private router: Router,
    private toastr: ToastrService,
    private data: DataService,
    public cookieService: CookieService,
    private http: HttpClient,
    private renderer: Renderer2) {
      this.startDateAccMis =new Date();
      this.endDateAccMis =new Date();
      this.startDateInsMis =new Date();
      this.endDateInsMis =new Date();
      this.todayDate = new Date();

      // this.renderer.listen('window', 'click',(e:Event)=>{
      //   console.log("Mis Window Called 1 ");
      //   console.log("Toggle btn: ",this.toggleButton);
      //   if(e.target !== this.toggleButton.nativeElement && e.target!==this.menu.nativeElement){
      //     this.isMisOpen=false;
      //     console.log("Mis Window Called 2 ");
      // }
      // });
      
  }

  ngOnInit() { 
   // this.getUserRole();
   // this.getColumnDisplay();
    // this.getMandatesCount(); 
    // this.getAllMandatess(); // This is for client side pagination comment on init
    this.test = "hello";
    this.getAllMandatess();
    // this.data.search.subscribe(searchFilter => {
    //   if (searchFilter.searchWord === '') {
    //     this.getAllMandatess();
    //   }
    //   if (searchFilter.searchWord) {
    //     this.globalSearchFilter(searchFilter);

    //     this.resultFilterKey = searchFilter.searchFilter;
    //     this.resultFilterWord = searchFilter.searchWord;
    //   }
    // });
    // this.subscription = timer(0, 20000).subscribe(_ => this.getMandatesCount());
    // this.isMisOpen=false;
  }


  
  ngOnDestroy() {
    // this.subscription.unsubscribe();
  }

  // ngAfterViewInit() {
  //   setTimeout ( () => {
  //     this.grid.autoFitColumns();
  //   }, 10000)
  // }

  public rowCallback(context: RowClassArgs) {
    let isRejected = false;
    if(context.dataItem.case_current_status){
     isRejected = context.dataItem.case_current_status.includes('rejected') ? true : false ; 
    }
    return {
        status: isRejected
    };
  }

  gotoForm(caseId){
    console.log(caseId);
    let caseURL = "/bonita/portal/homepage#?id="+caseId+"&_p=casemoredetailsadmin&_pf=2";
    this.dashBoard.checkFormLink(caseURL).subscribe(
      response => {
          console.log(response.status,"status");
      },err=>{
        console.log(err,"error");
        if(err.status==200){
          // return taskLink
          // window.location.href = caseURL; 
          console.log("url ",caseURL);
          window.open( caseURL, "_blank"); 
        }else{
          this.toastr.error('Please wait and try again','Mandate creation in progress');
          // return '#';
        }
      }
    )
  }

  getUserRole() {
    const userName = this.cookieService.get('userName');
    this.dashBoard.checkUserRoles(userName).subscribe(
      data => {
        if (data['UserRoles']) {
          this.hasDeleteAccess =  data['UserRoles'].includes('Netops_Admin');
        }
      }
    );
  }

  updateInstituionByProductSelection(selectedProduct){
    const that = this;
    that.singleModuleSearch.searchInstituteText = '';
    that.disableInstitution = false;
    that.productsList.filter(function(obj) {
        if(obj.PRODUCTNAME === selectedProduct){
          if(obj.ISINSTITUTIONAPP==="N"){
            that.institutions.push("Individual");
            that.singleModuleSearch.searchInstituteText = 'Individual';
            that.disableInstitution = true;
            that.selectedProductObj = obj;
            that.productId = obj.PRODUCTID;
            that.institutionId = "~INDL~";
            that.getFeeMasterDetails();
          }else{
            that.institutionId = "";
            that.productId = obj.PRODUCTID;
            that.selectedProductObj = obj;
            that.dashBoard.getInstitutions(that.productId).subscribe(
              result => {
                const institutions: any = result;
                that.institutionsList = institutions;
                that.institutions = institutions.map(data => data['INSTITUTIONNAME']);
                }
            );
          }
          that.singleModuleSearch.searchBillingCompany="";
          that.singleModuleSearch.searchBillingCompanyContact="";
          that.disableBillingCompany = false;
          that.disableBillingContact = false;
          return false;
        }
      });
  }

  updateBillingCompanyAndContactDetailsByInstituteSelection(selectedInstitution){
    for (let i= 0; i < this.institutionsList.length; i++) {
      if (this.institutionsList[i].INSTITUTIONNAME === selectedInstitution) {
        this.institutionId = this.institutionsList[i]['INSTITUTIONID'];
        this.updateBillingCompanyAndContactDetails();
      }
    }
  }

  getFeeMasterDetails(){
    if(this.selectedProductObj.ISINSTITUTIONAPP=="N"){
      this.dashBoard.getBillingCompanyDetails(this.productId,this.institutionId).subscribe(
        result => {
          //if(Object.keys(result).length>0){
            this.setStartDateAndEndDateDetails(result);
          //}
        }
      );
    }
  }

  setStartDateAndEndDateDetails(feeMaster){
    this.agreeementDate = false;
    this.mouDate = false;
    this.purchaseOrderDate = false;
    this.letterIntentDate = false;
    this.engagementLetterDate = false;
    this.commercialEmailDate = false;
    if(Object.keys(feeMaster).length>0){
      this.dashBoard.getPOdetails(feeMaster.FEEINSTITUTIONID).subscribe(
        result => {
          if(Object.keys(result).length>0){
            this.poDetails= result;
          }
          if(Object.keys(feeMaster).length>0){
            if(feeMaster["IS_AGREEMENT_REQUIRED"] && feeMaster["IS_AGREEMENT_REQUIRED"]==="Y"){
              this.agreeementDate = true;
              if(feeMaster["AGREEMENT_START_DATE"]){
                this.agreeementStartDate = new Date(feeMaster["AGREEMENT_START_DATE"]);
              }if(feeMaster["AGREEMENT_END_DATE"]){
                this.agreeementEndDate = new Date(feeMaster["AGREEMENT_END_DATE"]);
              }
            }if(feeMaster["IS_MOU_REQUIRED"] && feeMaster["IS_MOU_REQUIRED"]==="Y"){
              this.mouDate = true;
              if(feeMaster["MOU_START_DATE"]){
                this.mouStartDate = new Date(feeMaster["MOU_START_DATE"]);
              }if(feeMaster["MOU_END_DATE"]){
                this.mouEndDate = new Date(feeMaster["MOU_END_DATE"]);
              }
            }if(this.poDetails){
              this.purchaseOrderDate = true;
              if(this.poDetails["postart_date"]){
                this.purchaseOrderStartDate = new Date(this.poDetails["postart_date"]);
              }if(this.poDetails["poend_date"]){
                this.purchaseOrderEndDate = new Date(this.poDetails["poend_date"]);
              }
            }if(feeMaster["IS_LOI_REQUIRED"] && feeMaster["IS_LOI_REQUIRED"]==="Y"){
              this.letterIntentDate = true;
              if(feeMaster["LOI_START_DATE"]){
                this.letterIntentStartDate = new Date(feeMaster["LOI_START_DATE"]);
              }if(feeMaster["LOI_END_DATE"]){
                this.letterIntentEndDate = new Date(feeMaster["LOI_END_DATE"]);
              }
            }if(feeMaster["IS_ENGAGEMENT_LETTER_REQUIRED"] && feeMaster["IS_ENGAGEMENT_LETTER_REQUIRED"]==="Y"){
              this.engagementLetterDate = true;
              if(feeMaster["ENG_START_DATE"]){
                this.engagementLetterStartDate = new Date(feeMaster["ENG_START_DATE"]);
              }if(feeMaster["ENG_END_DATE"]){
                this.engagementLetterEndDate = new Date(feeMaster["ENG_END_DATE"]);
              }
            }if(feeMaster["IS_COMMERCIALEMAIL_REQUIRED"] && feeMaster["IS_COMMERCIALEMAIL_REQUIRED"]==="Y"){
              this.commercialEmailDate = true;
              if(feeMaster["CEMAIL_START_DATE"]){
                this.commercialEmailStartDate = new Date(feeMaster["CEMAIL_START_DATE"]);
              }if(feeMaster["CEMAIL_END_DATE"]){
                this.commercialEmailEndDate = new Date(feeMaster["CEMAIL_END_DATE"]);
              }
            }
          }else{
            console.log("data is empty in this product and institution combination");
          }
        }
      );
    }
  }

  updateBillingCompanyAndContactDetails(){
    this.singleModuleSearch.searchBillingCompany="";
    this.singleModuleSearch.searchBillingCompanyContact="";
    this.disableBillingCompany = false;
    this.disableBillingContact = false;
    if(this.singleModuleSearch.searchInstituteText!="Individual" 
    && this.selectedProductObj.ISINSTITUTIONAPP=="Y"){
      console.log('Checking Company and contact of billing');
    this.dashBoard.getBillingCompanyDetails(this.productId,this.institutionId).subscribe(
      result => {
        if(Object.keys(result).length>0){
          console.log('Fee Master Details', result);
          this.setStartDateAndEndDateDetails(result);
          const companyName = result["company_name"];
          this.singleModuleSearch.searchBillingCompany = companyName;
          this.dashBoard.getBAcompaniesList(companyName).subscribe(
            result => {
              const companies: any = result;
              this.companyContacts = companies.map(data => data['contact_full_name']);
            }
          );
          this.singleModuleSearch.searchBillingCompanyContact = result["contact_full_name"];
          this.disableBillingCompany = true;
          this.disableBillingContact = true;
        }else{
          console.log("data is empty in this product and institution combination");
        }
      }
    );
    }
  }

  updateCheckedOptions(options, event, type?, ind?) {
    if (type && type === 'sticky') {
      this.stickyColumnDimensions[ind].sticky = !this.stickyColumnDimensions[ind].sticky;
      this.stickyColumnDimensions[ind].checked = !this.stickyColumnDimensions[ind].checked;
      this.stickyColumnDimensions[ind].status = !this.stickyColumnDimensions[ind].status;
      if (this.stickyColumnDimensions[ind].checked) {
        if (this.commonColumnDimensions[ind].checked) {
          this.commonColumnDimensions[ind].checked = !this.commonColumnDimensions[ind].checked;
        }
        this.commonColumnDimensions[ind].disabled = true;
      } else {
        this.commonColumnDimensions[ind].disabled = false;
        this.commonColumnDimensions[ind].checked = false;
      }
      this.isSticky(this.stickyColumnDimensions[ind].sticky);
      this.checkColumnCount();
    } else {
      this.commonColumnDimensions[ind].checked = !this.commonColumnDimensions[
        ind
      ].checked;
      this.commonColumnDimensions[ind].status = !this.commonColumnDimensions[
        ind
      ].status;
      this.isSticky(this.stickyColumnDimensions[ind].sticky);
    }
  }

  checkColumnCount() {
    this.stickyCount = 0;
    this.stickyColumnDimensions.forEach(item => {
      if (item.checked) {
        this.stickyCount = this.stickyCount + 1;
      }
    });
    if (this.stickyCount >= 2) {
      this.stickyColumnDimensions.forEach(item => {
        if (!item.checked) {
          item.disabled = true;
        }
      });
    } else {
      this.stickyColumnDimensions.forEach(item => {
        if (!item.checked) {
          item.disabled = false;
        }
      });
    }
  }

  isSticky(col) {
    return true;
  }

  openModal(options, type, dataItem) {
    this.agreeementDate = false;
    this.mouDate = false;
    this.purchaseOrderDate = false;
    this.letterIntentDate = false;
    this.engagementLetterDate = false;
    this.commercialEmailDate = false;
    this.productId = '';
    this.institutionId = '';
    this.disableInstitution = false;
    this.companyContacts = [];
    this.singleModuleSearch = {
      searchProductTypeText: '',
      searchInstituteText: '',
      searchBillingCompany: '',
      searchBillingCompanyContact: ''
    };
    if (type === '') {
      this.dashBoard.getProducts().subscribe(
        result => {
          const products: any = result;
          this.productsList = products;
          this.products = products.map(data => data['PRODUCTNAME']);
        }
      );
    }
    else if (type === 'delete') {
      if ( this.mySelection && this.mySelection.length < 1) {
        return;
      }
    }else if (type === 'configureColumns') {
      this.checkColumnCount();
    }else if (type === 'cmnt') {
      this.workId = dataItem.CASEID;
      this.globalMandateId  = dataItem.CASEID;
      //this.getComments();
    }
    else if (type === 'mandateCreateUpdateLog') {
      if(this.modalRef){
        this.modalRef.hide();
      }
      this.getRecentActivities();
    }
    else if (type === 'serverLogs') {
      if(this.modalRef){
        this.modalRef.hide();
      }
      const errors = dataItem.split("~~");
      errors.forEach(item =>{
        this.errorInfo.push(item);
      })
    }
    setTimeout(() => {
      this.modalRef = this.modalService.show(options, { keyboard: false, ignoreBackdropClick: true });
    }, 400);
  }

  getRecentActivities(){
    this.bulkUploadService.getRecentActivities().subscribe(res =>{
      this.recentactivities = res;
    })
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.state.skip = 0;
    this.state.take = 10;
    this.state.filter = filter;
    if(this.state.filter.filters.length > 0)
    this.filterSize = this.state.filter.filters.length
    this.loadGridData();
  }
  public filterChange2(filter: CompositeFilterDescriptor): void {
    this.state.skip = 0;
    this.state.take = 10;
    this.state.filter = filter;
    if(this.state.filter.filters.length > 0)
    this.filterSize = this.state.filter.filters.length
    this.loadGridData2();
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    // this.getAllMandatess();
  }

  loadGridData () {
    
    if(this.filterSize > 0){
      this.gridDataFiltered = process(this.gridDataTemp.data, this.state);
      this.gridData = {
        data: this.gridDataFiltered.data,
        total: this.gridDataFiltered.total
    };
    }
    else if(this.filterSize == 0){
      this.gridData = {
          data: this.gridDataTemp.data.slice(this.skip, this.skip + this.gridPageSize),
          total: this.gridDataTemp.data.length
      };
    }

   
  // this.grid.data = this.gridData;
  // this.grid.autoFitColumns();
  console.log('this.gridData in load grid data ', this.gridData);
}

loadGridData2 () {
    
  if(this.filterSize > 0){
    this.gridDataFiltered = process(this.gridDataExpenseTemp.data, this.state);
    this.gridDataExpense = {
      data: this.gridDataFiltered.data,
      total: this.gridDataFiltered.total
  };
  }
  else if(this.filterSize == 0){
    this.gridDataExpense = {
        data: this.gridDataExpenseTemp.data.slice(this.skip, this.skip + this.gridPageSize),
        total: this.gridDataExpenseTemp.data.length
    };
  }

 
// this.grid.data = this.gridData;
// this.grid.autoFitColumns();
console.log('this.gridData in load grid data ', this.gridData);
}

  public pageChange({ skip, take }: PageChangeEvent): void {
    this.state.skip = skip;
    this.state.take = take;
    this.skip = skip;
    this.overviewPage.page = skip / this.gridPageSize + 1;
    this.overviewPage.pageSize = take;

    this.loadGridData();
    // this.getAllMandatess();
  }

  public pageChange1({ skip, take }: PageChangeEvent): void {
    this.state.skip = skip;
    this.state.take = take;
    this.skip = skip;
    this.overviewPage.page = skip / this.gridPageSize + 1;
    this.overviewPage.pageSize = take;

    this.loadGridData2();
    // this.getAllMandatess();
  }

  setPageSize (section) {
    // set overview page size
    if (section == 'Request created') {
        this.overviewPage.pageSize = this.mandatesCounts.supervisorCount;
      }
      if (section == 'Request closed') {
        this.overviewPage.pageSize = this.mandatesCounts.completedrequestCount;
      }
      if (section == 'all') {
        this.overviewPage.pageSize = this.mandatesCounts.totalRequestCount;
      }
      
  }

  getAllMandatess() {
    //this.loaderServiisLoading.next(true);
    // this.getMandatesCount();

       this.http.get<any>("http://localhost:9003/getUSMFUGData")
        .subscribe(res => {
	          res.dashBoardDataList.forEach(data => {
            });
          const gridData = {
            data: res.dashBoardDataList || [],
            total: res.allMandatesCount || 0
          };
          // this.grid.data = this.gridData;
          this.overviewPage['totalPage'] =res.allMandatesCount ;
          this.gridDataTemp = gridData;
          this.gridDataTemp2 = gridData;
          // this.statuses = res.statusMap ? res.statusMap : [];
      //    //this.loaderServiisLoading.next(false);
          this.loadGridData();
           // this.grid.autoFitColumns();
        }, err => {
          this.gridData = {
            data: [],
            total: 0
          };
      //    //this.loaderServiisLoading.next(false);
        });
    
  }


  getExpenseData(parentCaseId) {
    ////this.loaderServiisLoading.next(true);
    // this.getMandatesCount();
    console.log("parentCaseId:::",parentCaseId);
       this.http.get<any>("http://localhost:9003/getExpenseData?parentCaseId="+parentCaseId)
        .subscribe(res => {
	          res.dashBoardDataList.forEach(data => {
            });
          const gridDataExpense = {
            data: res.dashBoardDataList || [],
            total: res.allMandatesCount || 0
          };
          // this.grid.data = this.gridData;
          this.overviewPage['totalPage'] =res.allMandatesCount ;
          this.gridDataExpenseTemp = gridDataExpense;
          this.gridDataExpenseTemp2 = gridDataExpense;
           this.statuses = res.statusMap ? res.statusMap : [];
          //////this.loaderServiisLoading.next(false);
          this.loadGridData2();
           // this.grid.autoFitColumns();
        }, err => {
          this.gridDataExpense = {
            data: [],
            total: 0
          };
          //this.loaderServiisLoading.next(false);
        });
    
  }

  changeViewState(section) {
    this.gridShow = section;
    this.tabSelected = section;
    this.overviewPage = { page: 1, pageSize: 10 };
    this.state = {
      skip: 0,
      take: 10,
      sort: [{
        field: 'CASEID',
        dir: 'asc'
      }],
      filter: {
        logic: 'and',
        filters: []
      }
    };

    if (section === 'all') {
      this.getAllMandatess();
    } else {
      const mandateStatus = section ? section : '';
    //  //this.loaderServiisLoading.next(true);
      // this.getMandatesCount(); // mandates count is updated on load
      // set page size to all count for client side paging

      this.setPageSize(section);
      this.dashBoard.getMandatesByFilter(this.state.filter, this.overviewPage, mandateStatus, this.state.sort,section).subscribe(
        result => {
          result.dashBoardDataList.forEach(data => {
            // data.mandate_originated_date = data.mandate_originated_date ? new Date(data.mandate_originated_date) : null;
            // data.mandate_created_date = data.mandate_created_date ? new Date(data.mandate_originated_date) : null;
            // data.last_updated_date = data.mandate_created_date ? new Date(data.mandate_originated_date) : null;
            // data.case_login_date = data.case_login_date ? new Date(data.case_login_date) : null;
            // data.entity_first_contact_date = data.entity_first_contact_date ? new Date(data.entity_first_contact_date) : null;
            // data.case_on_floor_date = data.case_on_floor_date ? new Date(data.case_on_floor_date) : null;
            // data.report_executed_date = data.report_executed_date ? new Date(data.report_executed_date) : null;
          });
          const gridData = {
            data: result.dashBoardDataList || [],
            total: result.allMandatesCount || 0
          };
          this.gridDataTemp = gridData;
          // this.grid.data = this.gridData;
          // this.grid.autoFitColumns();
          this.loadGridData();
       //   //this.loaderServiisLoading.next(false);
        }, err => {
          this.gridData = {
            data: [],
            total: 0
          };
         // //this.loaderServiisLoading.next(false);
      });
    }
  }

  globalSearchFilter(searchFilter) {
   // //this.loaderServiisLoading.next(true);
    this.search_word = searchFilter.searchWord;
    if(searchFilter.searchFilter=='mandate_created_date')
    {
      let exp=searchFilter.searchWord;
      console.log("mandate_date : ",exp);
      var str=exp.split("/");
      var strNew=str[1]+"/"+str[0]+"/"+str[2];
      let date = new Date(strNew);
      this.search_word =this.datePip.transform(date,'yyyy-MM-dd');
      console.log("date : ",this.search_word);
    }
      searchFilter.searchWord=this.search_word;
    this.dashBoard.globalHeaderSearch(searchFilter).subscribe(
      result => {
        console.log(result);
        this.gridData = {
          data: result['body']['dashBoardDataList'] || [],
          total: result['body']['allMandatesCount'] || 0
        };
        this.grid.data = this.gridData;
        this.grid.autoFitColumns();
        this.tabset.tabs[0].active = true;
        this.gridShow = 'all';
      //  //this.loaderServiisLoading.next(false);
      },
      err => {
        this.gridData = {
          data: [],
          total: 0
        };
       // //this.loaderServiisLoading.next(false);
      });
  }
  
  getMandatesCount() {
    this.dashBoard.getMadatesCount().subscribe(count => {
      if (count && count.mandatesCounts) {
        this.mandatesCounts.totalRequestCount = count.mandatesCounts.totalRequestCount || 0;
        this.mandatesCounts.supervisorCount = count.mandatesCounts.supervisorCount || 0;
        this.mandatesCounts.completedrequestCount = count.mandatesCounts.completedrequestCount || 0;
        
      }
      this.getAllMandatess();
    }, error => {
      this.getAllMandatess();
    });
  }

  public getFrommServerData(): any {
    let selectedIds = [];

    if (this.mySelection.length > 0 ) {
      selectedIds = this.mySelection;
    }

    this.dashBoard.fetchExcelData(selectedIds).subscribe(records => {
      this.excel = [];
      if (records && records['dashBoardDataList'].length > 0) {
        records['dashBoardDataList'].forEach(row => {
          this.excel.push(row);
        });
        // this.excel.push(records['dashBoardDataList']);
        setTimeout( () => {
          this.excelService.exportAsExcelFile(this.excel, 'netops');
        }, 800);
      } else {
        this.toastr.warning('No records available to export', 'Excel export!');
        console.log('error');
      }
    });
  }

    //Export to Excel 2
    // public getFrommServerData2(grid: GridComponent): any {
    //   grid.saveAsExcel();
    // }
  
    // public allData = (): ExcelExportData => {
    //     console.log("griddata",this.gridData);
    //     const result: ExcelExportData = {
    //       data: process(this.gridDataTemp.data, { sort: [{ field: 'entity_name', dir: 'asc' }], filter: this.state.filter}).data
    //   };
    //   return result;
    //   }

      public getFrommServerData2():any{
        // grid.saveAsExcel();
        let selectedIds = [];

        if (this.mySelection.length > 0 ) 
        {
          selectedIds = this.mySelection;
          // console.log("My Selection ID: ",selectedIds);
        }
        else
        {
          var filtered_data = process(this.gridDataTemp.data, { sort: [{ field: 'entity_name', dir: 'asc' }], filter: this.state.filter}).data;
          let griddataarray = filtered_data;
          var griddata2size = filtered_data.length;
          
          for (let index = 0; index < griddata2size; index++) {
            var element = griddataarray[index];
            selectedIds.push(element['mandate_id']);
          }
          // console.log("My Selection ID: ",selectedIds);
        }

        this.dashBoard.fetchExcelData(selectedIds).subscribe(records => {
          this.excel = [];
          if (records && records['dashBoardDataList'].length > 0) {
            records['dashBoardDataList'].forEach(row => {
              this.excel.push(row);
            });
            // this.excel.push(records['dashBoardDataList']);
            setTimeout( () => {
              this.excelService.exportAsExcelFile(this.excel, 'netops');
            }, 800);
          } else {
            this.toastr.warning('No records available to export', 'Excel export!');
            console.log('error');
          }
        });
      }
    
  getColumnDisplay() {
    this.dashBoard.getColumnFieldService().subscribe(res => {
      if (res && res['dashboardFieldMenu'].length > 0 ) {
        this.currentColumnSelection['sticky'] = res['dashboardFieldMenu'];
        this.currentColumnSelection['common'] = res['rightDashboardFieldMenu'];
        this.stickyColumnDimensions = res['dashboardFieldMenu'];
        this.commonColumnDimensions = res['rightDashboardFieldMenu'];
        // this.columnSegragate(res['dashboardFieldMenu']);
        this.columnDisplay();
        this.checkColumnCount();
      } else {
        this.currentColumnSelection = this.stickyColumnDimensions;
        this.columnDisplay();
        this.checkColumnCount();
      }
      this.currentColumnSelection['sticky'] = this.stickyColumnDimensions;
      this.currentColumnSelection['common'] = this.commonColumnDimensions;
      this.checkColumnCount();
    }, error => {
      this.currentColumnSelection['sticky'] = this.stickyColumnDimensions;
      this.currentColumnSelection['common'] = this.commonColumnDimensions;
      this.columnDisplay();
      this.checkColumnCount();
    });

  }

  cancelSingleMandate() {
    this.singleModuleSearch = {
      searchProductTypeText: '',
      searchInstituteText: '',
      searchBillingCompany: '',
      searchBillingCompanyContact: ''
    };
  }

  columnSegragate(rows) {
    this.stickyColumnDimensions = [];
    this.commonColumnDimensions = [];
    Object.assign(this.stickyColumnDimensions, rows);
    Object.assign(this.commonColumnDimensions, rows);

    rows.filter( (row, index) => {
      if (row.sticky) {
        this.stickyColumnDimensions[index] = [];
        this.commonColumnDimensions[index] = [];
        // name
       this.stickyColumnDimensions[index].field_name = row.field_name;
       this.commonColumnDimensions[index].field_name = row.field_name;
        // id
       this.stickyColumnDimensions[index].field_id = row.field_id;
       this.commonColumnDimensions[index].field_id = row.field_id;
        // boolean values
        this.stickyColumnDimensions[index].sticky = true;
        this.stickyColumnDimensions[index].checked = true;
        this.stickyColumnDimensions[index].status = true;
        this.stickyColumnDimensions[index].status = false;
        this.commonColumnDimensions[index].disabled = false;
        this.commonColumnDimensions[index].status = false;
        this.commonColumnDimensions[index].sticky = false;
        this.commonColumnDimensions[index].checked = false;
      } else {
        if (row.checked) {
          this.stickyColumnDimensions[index] = [];
          this.commonColumnDimensions[index] = [];
          // name
         this.stickyColumnDimensions[index].field_name = row.field_name;
         this.commonColumnDimensions[index].field_name = row.field_name;
          // id
         this.stickyColumnDimensions[index].field_id = row.field_id;
         this.commonColumnDimensions[index].field_id = row.field_id;
          // boolean values
          this.stickyColumnDimensions[index].sticky = false;
          this.stickyColumnDimensions[index].checked = false;
          this.stickyColumnDimensions[index].status = false;
          this.stickyColumnDimensions[index].status = false;
          this.commonColumnDimensions[index].disabled = false;
          this.commonColumnDimensions[index].status = true;
          this.commonColumnDimensions[index].sticky = false;
          this.commonColumnDimensions[index].checked = true;

        } else {
          this.stickyColumnDimensions[index] = [];
          this.commonColumnDimensions[index] = [];
          // name
         this.stickyColumnDimensions[index].field_name = row.field_name;
         this.commonColumnDimensions[index].field_name = row.field_name;
          // id
         this.stickyColumnDimensions[index].field_id = row.field_id;
         this.commonColumnDimensions[index].field_id = row.field_id;
          // boolean values
          this.stickyColumnDimensions[index].sticky = false;
          this.stickyColumnDimensions[index].checked = false;
          this.stickyColumnDimensions[index].status = false;
          this.stickyColumnDimensions[index].status = false;
          this.commonColumnDimensions[index].disabled = false;
          this.commonColumnDimensions[index].status = false;
          this.commonColumnDimensions[index].sticky = false;
          this.commonColumnDimensions[index].checked = false;
        }

      }
    });
  }

  columnDisplay() {
    this.stickyColumnDimensions.filter((col, index) => {
      if (col.sticky === true || col.sticky === 1) {
        // this.showCommonColumns.push(this.stickyColumnDimensions[index]);
        this.mainColumnDimenstions[col.field_id] = [];
        this.mainColumnDimenstions[col.field_id].checked = true;
        this.mainColumnDimenstions[col.field_id].sticky = true;
      } else {
        if (this.commonColumnDimensions[index].checked === true || this.commonColumnDimensions[index].checked === 1) {
          // this.showCommonColumns.push(this.stickyColumnDimensions[index]);
          this.mainColumnDimenstions[col.field_id] = [];
          this.mainColumnDimenstions[col.field_id].checked = true;
          this.mainColumnDimenstions[col.field_id].sticky = false;
        } else {
          this.mainColumnDimenstions[col.field_id] = [];
          this.mainColumnDimenstions[col.field_id].checked = false;
          this.mainColumnDimenstions[col.field_id].sticky = false;
        }
      }
    });
  }

  saveFieldSelection() {
    //this.loaderServiisLoading.next(true);
    this.dashBoard.saveColumnFieldsSevice(this.stickyColumnDimensions, this.commonColumnDimensions).subscribe(res => {
      console.log(res);
      this.getColumnDisplay();
      //this.loaderServiisLoading.next(false);
    }, err => {
      //this.loaderServiisLoading.next(false);
    });
  }

  revertFieldSelection() {
    if (this.currentColumnSelection) {
      this.stickyColumnDimensions =  this.currentColumnSelection['sticky'];
      this.commonColumnDimensions = this.currentColumnSelection['common'];
      this.columnDisplay();
    }
  }

  newDate(date) {
    if (date && date != '') {
      return this.datePip.transform(date, 'dd/MM/yyyy HH:mm');
    }

    return '';
    
  }

  onSearchProductTypeChange = (text$: Observable<string>) => {
    return text$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(term =>
        this.searchGetProduct(term).pipe(
          catchError(() => {
            return of([]);
          })
        )
      )
    );
  }

  searchGetProduct(term: string) { // return
    return new Observable(sub => {
      if (term.length > 0) {
        this.dashBoard.onProductAutoComplete({'productName': term})
          .subscribe(products => {
            let product: any;
            this.searchProductName = [];
            product = products.body;
            const linesArr = [];
            if (product.length === 0) {
              linesArr.push(['No Record for this search']);
            }
            for (let i = 0; i < product.length; i++) {
              if (product[i]) {
                this.searchProductName.push(product[i]);
                linesArr.push(product[i]['PRODUCTNAME']);
              }
            }
            sub.next(linesArr);
          });
      } else {
        const linesArr = [];
        sub.next(linesArr);
      }
    });
  }

  searchInstitutionName = (text$: Observable<string>) => {
    return text$.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(term =>
          this.searchGetInstitutionName(term).pipe(
            catchError(() => {
              return of([]);
            }))
        )
    );
  }

  searchGetInstitutionName(term) {
    this.singleModuleSearch.searchInstituteText  = '';
    return new Observable(sub => {
      if (term.length > 0) {
        this.dashBoard.onInstitutionAutoComplete({'instituteName': term})
          .subscribe(institution => {
            let ins: any;
            ins = institution.body;
            const linesArr = [];
            this.searchInstituteName = [];
            if (!ins) {
              linesArr.push(['No Record for this search']);
            }
            for (let i = 0; i < ins.length; i++) {
              if (ins[i]) {
                this.searchInstituteName.push(ins[i]);
                linesArr.push(ins[i]['INSTITUTIONNAME'] );
              }
            }
            sub.next(linesArr);
          });
      } else {
        const linesArr = [];
        sub.next(linesArr);
      }
    });
  }

  selectedItem(item, searchedItem){
      if (searchedItem === 'searchProductName') {
        this.singleModuleSearch.searchProductTypeText = '';
        let localItem = [];
        if (item !== 'No Record for this search') {
          for (let i= 0; i < this.searchProductName.length; i++) {
            if (this.searchProductName[i].PRODUCTNAME === item.item) {
              localItem = this.searchProductName[i];
              this.productId = this.searchProductName[i]['PRODUCTID'];
            }
          }
          this.singleModuleSearch.searchProductTypeText = localItem['PRODUCTNAME'];
          this.updateInstituionByProductSelection(localItem['PRODUCTNAME']);
        }
      }
      if (searchedItem === 'searchInstituteName') {
        this.singleModuleSearch.searchInstituteText = '';
        let localItem = [];
        if (item !== 'No Record for this search') {
          for (let i= 0; i < this.searchInstituteName.length; i++) {
            if (this.searchInstituteName[i].INSTITUTIONNAME === item.item) {
              localItem = this.searchInstituteName[i];
              this.institutionId = this.searchInstituteName[i]['INSTITUTIONID'];
            }
          }
          this.singleModuleSearch.searchInstituteText = localItem['INSTITUTIONNAME'];
          this.isDisabledField();
          this.updateBillingCompanyAndContactDetails();
        }
      }
      if (searchedItem === 'searchBillingComp') {
        this.singleModuleSearch.searchBillingCompany = '';
        let localItem = [];
        if (item !== 'No Record for this search') {
          for (let i= 0; i < this.searchBillingComp.length; i++) {
            if (this.searchBillingComp[i].company_name === item.item) {
              localItem = this.searchBillingComp[i];
            }
          }
          this.singleModuleSearch.searchBillingCompany = localItem['company_name'];

          this.dashBoard.getBAcompaniesList(this.singleModuleSearch.searchBillingCompany).subscribe(
            result => {
              const companies: any = result;
              this.companyContacts = companies.map(data => data['contact_full_name']);
            }
          );
        }
      }
      if (searchedItem === 'searchBillingCompContact') {
        this.singleModuleSearch.searchBillingCompanyContact = '';
        let localItem = [];
        if (item !== 'No Record for this search') {
          for (let i= 0; i < this.searchBillingCompContact.length; i++) {
            if (this.searchBillingCompContact[i].contact_full_name === item.item) {
              localItem = this.searchBillingCompContact[i];
            }
          }
          this.singleModuleSearch.searchBillingCompanyContact = localItem['contact_full_name'];
        }
      }
  }

  searchBillingCompany = (text$: Observable<string>) => {
    return text$.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(term =>
          this.searchGetBillingCompany(term).pipe(
            catchError(() => {
              return of([]);
            }))
        )
    );
  }

  searchGetBillingCompany(term) {
    this.companyContacts = [];
    this.singleModuleSearch.searchBillingCompany = '';
    this.singleModuleSearch.searchBillingCompanyContact = '';

    return new Observable(sub => {
          if (term.length > 0) {
            this.dashBoard.onBillingCompanyAutoComplete({'companyName': term})
              .subscribe(company => {
                let comp: any;
                this.searchBillingComp = [];
                comp = company.body;
                const linesArr = [];
                if (!comp) {
                  linesArr.push(['No Record for this search']); //
                }
                for (let i = 0; i < comp.length; i++) {
                  if (comp[i]) {
                    this.searchBillingComp.push(comp[i]);
                    linesArr.push(comp[i]['company_name'] );
                  }
                }
                if (this.singleModuleSearch.searchInstituteText === 'Individual' && comp.length === 0) {
                 // linesArr.push(term);
                 this.singleModuleSearch.searchBillingCompany = term;
                 this.isDisabledField();
                }
                sub.next(linesArr);
              });
          } else {
            const linesArr = [];
            sub.next(linesArr);
          }
    });
  }

  isDisabledField() {
    if ( this.singleModuleSearch.searchInstituteText === 'Individual') {
      return false;
    }
    if ( this.singleModuleSearch.searchBillingCompany ) {
      return false;
    }
    return true;
  }

  searchBillingCompanyContact = (text$: Observable<string>) => {
    return text$.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(term =>
          this.searchGetBillingCompanyContact(term).pipe(
            catchError(() => {
              return of([]);
            }))
        )
      );
  }

  searchGetBillingCompanyContact(term) {
    return new Observable(sub => {
          if (term.length > 0) {
            this.dashBoard.onBillingCompanyContactAutoComplete( {'companyName': this.singleModuleSearch.searchBillingCompany, 'contactName': term})
              .subscribe(company => {
                this.searchBillingCompContact = [];
                let ccontact: any;
                ccontact = company.body;
                const linesArr = [];
                if (!ccontact) {
                  linesArr.push(['No Record for this search']); // No Record for this search
                }
                for (let i = 0; i < ccontact.length; i++) {
                  if (ccontact[i]) {
                    this.searchBillingCompContact.push(ccontact[i])
                    linesArr.push(ccontact[i]['contact_full_name'] );
                  }
                }
                if ( this.singleModuleSearch.searchInstituteText === 'Individual' && ccontact.length === 0) {
                  this.singleModuleSearch.searchBillingCompanyContact = term;
                }
                sub.next(linesArr);
              });
          } else {
            const linesArr = [];
            sub.next(linesArr);
          }
    });
  }

  redirectToParentBonita() {
    //this.loaderServiisLoading.next(true); 
    //if(this.singleModuleSearch.searchInstituteText=="Individual"){
      this.smeProcessName = "Action Item Request";
    // }else{
    //   this.smeProcessName = "SME TASS Process";
    // }
    this.dashBoard.getProcessIdToRedirectParent(this.smeProcessName).subscribe( process => {
      console.log(process, '', process);
      //this.loaderServiisLoading.next(false); 
      if (process && process[0]) {
        window.location.href ='/bonita/portal/resource/process/'+this.smeProcessName+'/'+process[0].version+'/content/?id='+process[0].id+'&locale=en&mode=app';
      }
      /*Send mail alert to role 'Knowledge Hub Admin' accessed users if any template is not uploaded based on product and institution*/
      this.dashBoard.checkTemplatesUpload(this.productId,this.institutionId,this.singleModuleSearch.searchProductTypeText,this.singleModuleSearch.searchInstituteText).subscribe( result => {
        console.log(result, ' : ', result);
      });
    });
  }

  public onSelectedKeysChange(e) {
    const len = this.mySelection.length;

    if (len === 0) {
        this.isChecked = false;
        this.selectAllState = 'unchecked';
    } else if (len > 0 && len < this.gridData.data.length) {
        this.isChecked = true;
        this.selectAllState = 'indeterminate';
    } else {
      this.isChecked = true;
        this.selectAllState = 'checked';
    }
  }

  public onSelectedKeysChange1(e) {
    const len = this.mySelection.length;

    if (len === 0) {
        this.isChecked = false;
        this.selectAllState = 'unchecked';
    } else if (len > 0 && len < this.gridDataExpense.data.length) {
        this.isChecked = true;
        this.selectAllState = 'indeterminate';
    } else {
      this.isChecked = true;
        this.selectAllState = 'checked';
    }
  }

  public onSelectAllChange(checkedState: SelectAllCheckboxState) {
      if (checkedState === 'checked') {
          this.mySelection = this.gridData.data.map((item) => item.workflow_id);
          this.selectAllState = 'checked';
      } else {
          this.mySelection = [];
          this.selectAllState = 'unchecked';
      }
  }

  proceedToDelete() {
    this.modalRef.hide();
    //this.loaderServiisLoading.next(true);
    this.dashBoard.deleteMandates(this.mySelection).subscribe(
      res => {
        console.log(res);
        this.removeSelection();
        this.getMandatesCount();
        // this.getAllMandatess();
        //this.loaderServiisLoading.next(false);
        this.toastr.success('Deleted successfully!', 'Delete Records!');
      }, err => {
        //this.loaderServiisLoading.next(false);
        this.toastr.error('Something went wrong! Try again later', 'Delete Records!');
      });
  }

  removeSelection() {
    this.mySelection = [];
    this.isChecked = false;
    this.selectAllState = 'unchecked';
  }

  validateMandate(a_data) {
    console.log(a_data);
    this.bulkUploadService.validateMandates(a_data).subscribe(response => {
      console.log(response);
      this.bulkUploadSharedData.setMandateData(response), () => {};
      this.modalRef.hide();
      //this.loaderServiisLoading.next(false);
      this.router.navigate(['/bulkmandate']);
      this.saveRecentActivities(response,"Create Bulk Mandate");
    }, error => {
      // this.bulkMandateFileUpload.nativeElement.value = null; // reset file upload
      //this.loaderServiisLoading.next(false);
      console.error('Server error validating mandates', error);
    });
  }

  saveRecentActivities(res,activityName){
    const userName = this.cookieService.get('userName');
    const validFlag = res.validFlag;
    const failMandates = res.failMandates;
    const errorLogArray = [];
    var errorLog;
    if(validFlag){
      errorLog = "Success";
    }else{
      failMandates.forEach(mandate =>{
        const errorFields = mandate.errorFields;
        errorFields.forEach(field => {
          errorLogArray.push("Please check the field with name "+field);
        })
      })
    }
    errorLog = errorLogArray.join("~~");
    this.bulkUploadService.saveRecentActivities(errorLog,activityName,userName).subscribe(response => {
      console.log(" Result :",response);
    });
  }

  checkValidInput () {
    if (
      !(this.singleModuleSearch.searchProductTypeText) || this.singleModuleSearch.searchProductTypeText == ''
      || !(this.singleModuleSearch.searchInstituteText) || this.singleModuleSearch.searchInstituteText == ''
      || !(this.singleModuleSearch.searchBillingCompany) || this.singleModuleSearch.searchBillingCompany == ''
      || !(this.singleModuleSearch.searchBillingCompanyContact) || this.singleModuleSearch.searchBillingCompanyContact == ''
      ) {
        return false;
    } 
    return true;
  }

  checkValidInput1 (validateFileByProduct) {
    let validateExcelFile = this.singleModuleSearch.searchProductTypeText+'&'+this.singleModuleSearch.searchInstituteText;
    if (validateExcelFile != validateFileByProduct) {
        return false;
    } 
    return true;
  }

  uploadFile(ev) {
    this.datastring = {};
    let isValidInput = this.checkValidInput();
    if (!isValidInput) {
      this.toastr.error('Enter all the required fields', 'Fill Mandatory Fields');
      return false;
    }
    
    this.usrData = {
      'Product Name': this.singleModuleSearch.searchProductTypeText,
      'Institution Name': this.singleModuleSearch.searchInstituteText,
      'Billing Company': this.singleModuleSearch.searchBillingCompany,
      'Billing Company Contact': this.singleModuleSearch.searchBillingCompanyContact
    };

    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    let dataObj = [];
    let errors = [];
    let isValid = true;
    reader.onload = (event) => {
      try {
        const data = reader.result;
      let datastr = [];
      workBook = XLSX.read(data, { type: 'binary' });
      
      console.log('*********Validating uploaded excel file***************');
      jsonData = workBook.Sheets['Validation'];
      let validate = XLSX.utils.sheet_to_json(jsonData, {raw:true, defval:null});
      const validateFileByProductInstituition = validate[0]['Sheet_Validation'];
      let isValidInputFile = this.checkValidInput1(validateFileByProductInstituition);
      
      if (!isValidInputFile) {
        this.toastr.error('Upload correct excel file', 'Uploaded excel file not product specific');
        //this.loaderServiisLoading.next(false);
        return false;
      }


      jsonData = workBook.Sheets['Mandates'];
      //this.loaderServiisLoading.next(true);
      let initial = XLSX.utils.sheet_to_json(jsonData, {raw:true, defval:null});
      
      
      //const validateFileByProduct = initial[0]['Sheet_Validation']; 
      /* let isValidInputFile = this.checkValidInput1(validateFileByProduct);
      if (!isValidInputFile) {
        this.toastr.error('Upload correct excel file', 'Uploaded excel file not product specific');
        //this.loaderServiisLoading.next(false);
          return false;
      }
      if (initial.length > 0) {
        let isProdctTypeEntityNameSelected = true; // Excel being uploaded
        initial.forEach((row, index) => {
            //Individual
            if (this.singleModuleSearch.searchInstituteText.toLocaleLowerCase() == 'individual') {
                if (row['PRODUCT_TYPE'] && row['PRODUCT_CATEGORY']) {
                datastr.push(row);
              }
            } else {
              // TASS
                const tObj = JSON.parse(JSON.stringify(row));
                tObj['First_point_of_Entity_contact_date_DD-MMM-YYYY'] = this.getTimeStampStr(row['First_point_of_Entity_contact_date_DD-MMM-YYYY']);
                tObj['Payment_Date'] = this.getTimeStampStr(row['Payment_Date']);
                tObj['Case_login_date'] = this.getTimeStampStr(row['Case_login_date']);
                tObj['excel_row_number'] = (index + 2) + '';
                tObj['Case_On_floor_Date'] = this.getTimeStampStr(row['Case_On_floor_Date']);
                if (tObj['Product_type']) {
                  datastr.push(tObj);
                } else {
                    isProdctTypeEntityNameSelected = false;
                }
            }
            
        });
        // If product type or entity name is empty in any row,show error
        if (!isProdctTypeEntityNameSelected) {
          this.toastr.error('Excel Error', 'Product Type and Entity Name is required..');
          //this.loaderServiisLoading.next(false);
          console.error('Empty excel file');
          return false;
        }
      } else {
              this.toastr.error('Excel Error', 'Empty excel file');
                //this.loaderServiisLoading.next(false);
                console.error('Empty excel file');
                return false;
            }
      /* jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial['mandates'] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {}); */
        dataObj = this.usrData;
        dataObj['mandates'] = datastr;
        dataObj['source'] = 'NO';
        dataObj['institutionId'] = this.institutionId;
        dataObj['productId'] = this.productId;
        this.datastring = JSON.stringify(dataObj);
        this.validateMandate(this.datastring);
      } catch(err ){
        //this.loaderServiisLoading.next(false);
        this.toastr.error('Upload correct excel file', 'Seems some issue in uploaded excel.');
          console.error('Error validating/uploading excel ', err);
      }
      
    };
    reader.readAsBinaryString(file);
  }

  checkFileValidation (a_row, errors) {
    const tErorr = {};
    if (a_row['Product_type'] == null || a_row['Product_type'] == '') {
      tErorr['productType'] = 'Product Type can not empty';
    }
    if (a_row['Entity_name'] == null || a_row['Entity_name'] == '') {
      tErorr['entityName'] = 'Entity Name can not empty';
    }
    if (a_row['RM_Contact_Name'] == null || a_row['RM_Contact_Name'] == '') {
      tErorr['rmContact'] = 'RM Contact can not empty';
    }
    if (errors.length > 0) {
        this.toastr.error(errors.join(', '), 'Error in columns value.');
        return false;
    }
    return true;
  }

  getTimeStampStr (a_excelDate) {
    console.log('a_excelDate ', a_excelDate);
    if (Number(a_excelDate)) {
      const epochTimeStamp = new Date(Math.round((Number(a_excelDate) - 25569)*86400*1000)).getTime() +'';
     return this.formatDate(Number(epochTimeStamp))
    } else {
      return a_excelDate;
    }
    
  }

  formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [month, day, year].join('/');
  }

  chooseRole(event){
    // var selectedrole = event.target.value;
    this.commentsRole = event.target.value;
    console.log(this.commentsRole);
    this.getComments(this.commentsRole);
  }

  getComments(selectedrole) {   
    this.dashBoard.getComments(this.workId,selectedrole).subscribe(responsedata => {
      this.filteredData = responsedata.dashBoardDataList;
      console.log(this.filteredData);
    });
  }

  clearComment(){
    console.log("in clear comment");
    this.comment = '';
  }

  addComment(value: string) {
    
    this.comment = value;
    this.userid = this.workId;
    this.userRole = 'NO';
    this.dashBoard.addComment(this.comment, this.userRole, this.userid, this.commentsRole, this.globalMandateId).subscribe(addedComment => {
      console.log(addedComment);
      this.comment = '';
      this.getComments(this.commentsRole);
    });
  }

  getMasterLink() {
    const url = window.location.href;

    let webCheck1 = url.indexOf('dev-bonita');
    let webCheck2 = url.indexOf('uat-bonita');

    if (webCheck1 > 0) {
      return 'http://52.66.123.3/#!/container/feeMaster';
    } else if (webCheck2 > 0) {
      return 'https://uat-notes.smefirst.com/sme-note/#!/container/feeMaster';
    } else {
      return 'http://52.66.123.3/#!/container/feeMaster';
    }
  }

  caseReject() {
    if (this.mySelection.length) {
      this.bsModalRef = this.modalService.show(CommentsModalComponent, { keyboard: false, ignoreBackdropClick: true });
      this.bsModalRef.content.action.subscribe((data) => {
        if (data) {
          const obj = {
            mandateIds: this.mySelection.toString(),
            comments: data
          };
          //this.loaderServiisLoading.next(true);

          this.dashBoard.rejectMandates(obj).subscribe(
            result => {
              const successMandates = result['SuccessMandates'];
              const failedMandates = result['FailedMandates'];

              if (successMandates && successMandates.length) {
                this.toastr.success(successMandates.join(', '), 'Successfully Rejected:',
                    { timeOut: 8000 });
              }
              if (failedMandates && failedMandates.length) {
                this.toastr.warning(failedMandates.join(', '), 'Reject failed for:',
                    { timeOut: 8000 });
              }
              setTimeout(() => {
                this.removeSelection();
                this.getAllMandatess();
              }, 1000);
            },
            error => {
              //this.loaderServiisLoading.next(false);
              this.removeSelection();
              this.toastr.error('Error occured', 'Error');
            });
        }
      });
    }
  }

  caseOnFloor() {
    if (this.mySelection.length) {
      const mandateIds = this.mySelection.toString();
      //this.loaderServiisLoading.next(true);

      this.dashBoard.caseOnFloorMandates(mandateIds).subscribe(
        result => {
          const failedMandates = result['failedMandates'];

          if (failedMandates && failedMandates.length) {
            this.toastr.warning(failedMandates.join(', ') + '\nInfo Req is not approved', 'Case on floor failed for:',
                { timeOut: 6000 });
          } else {
            this.toastr.success('Successfully Submitted', 'Success');
          }
          setTimeout(() => {
            this.removeSelection();
            this.getAllMandatess();
          }, 1000);
        },
        error => {
          //this.loaderServiisLoading.next(false);
          this.removeSelection();
          this.toastr.error('Error occured', 'Error');
        });
    }
  }

  generateOFS() {
    const mandateIds = this.mySelection.toString();
    this.dashBoard.generateOFSinvoice(mandateIds).subscribe(
      result => {
        console.log(result);
        this.excel = [];
        const records: any = result;
        if (records && records.length > 0) {
          records.forEach(row => {
            this.excel.push(row);
          });
          setTimeout(() => {
            console.log(this.excel);
            this.excelService.exportAsExcelFile(this.excel, 'OFS');
          }, 800);
        } else {
          this.toastr.warning('No records available to export', 'Excel export!');
          console.log('error');
        }
      },
      error => {
        this.removeSelection();
        this.toastr.error('Error occured', 'Error');
      });
  }

    //Toggle for Download Anncount & Institute MIS Report Tab
    // fixMISDropdown(){
    //   this.toggleMIS = !this.toggleMIS;
    // }

    toggleMenu() {
      this.isMisOpen = !this.isMisOpen;
      console.log("Toggle MIS Called",this.isMisOpen);
    }

    closeMisPanel()
    {
      this.isMisOpen = false;
    }
  
      // Download Institute MIS Report
    /*downloadAccMis()
    {
      console.log("Acc MIS");
      console.log("Today: ",this.todayDate);
  
      var fieldName1 = 'startdate';
      let fieldValue1 = this.startDateAccMis;
      var fieldName2 = 'enddate';
      var fieldValue2 = this.endDateAccMis;

        var fieldName3 = 'searchfilter';
        var fieldValue3 = this.resultFilterKey;
  
        var fieldName4 = 'searchword';
        var fieldValue4 = this.resultFilterWord;
  
        var fieldName5 = 'tabselected';
        var fieldValue5 = this.tabSelected;
  
        var object = {};
        object[fieldName1] = fieldValue1;
        object[fieldName2] = fieldValue2;
        object[fieldName3] = fieldValue3;
        object[fieldName4] = fieldValue4;
        object[fieldName5] = fieldValue5;
        console.log("Object Sent:",object);
        
        console.log("Tab Selected: "+this.tabSelected);
  
        const requestOptions: Object = {responseType: 'blob'};
  
        //Bonita API : /bonitaAPI/accesssme/AccountMisWrite'
        // this.http.post<any>('http://localhost:9002/accesssme/AccountMisWrite',object,requestOptions).subscribe(
        this.http.post<any>('/bonitaAPI/accesssme/AccountMisWrite',object,requestOptions).subscribe(
          data=>{
            console.log("Data: "+data);
            this.downLoadExcelFile(data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","ACC")
          },
          err=>{
            console.log("Error in downloading file:",err);
          }
        );
    }
  
    // Download Institute MIS Report
    downloadInsMis()
    {
      console.log("Ins MIS");
  
      var fieldName1 = 'startdate';
      // let fieldValue1 = this.startDateInsMis.getFullYear()+"-"+(this.startDateInsMis.getMonth()+1)+"-"+this.startDateInsMis.getDate();
      let fieldValue1 = this.startDateInsMis;
      var fieldName2 = 'enddate';
      var fieldValue2 = this.endDateInsMis;
  
      var fieldName3 = 'searchfilter';
      var fieldValue3 = this.resultFilterKey;
  
      var fieldName4 = 'searchword';
      var fieldValue4 = this.resultFilterWord;
  
      var fieldName5 = 'tabselected';
      var fieldValue5 = this.tabSelected;
  
      var object = {};
      object[fieldName1] = fieldValue1;
      object[fieldName2] = fieldValue2;
      object[fieldName3] = fieldValue3;
      object[fieldName4] = fieldValue4;
      object[fieldName5] = fieldValue5;
  
      console.log("Object Sent:",object);
        const requestOptions: Object = {responseType: 'blob'};
  
        //Bonita API : /bonitaAPI/accesssme/InstitutionMisWrite'
        // this.http.post<any>('http://localhost:9002/accesssme/InstitutionMisWrite',object,requestOptions).subscribe(
        this.http.post<any>('/bonitaAPI/accesssme/InstitutionMisWrite',object,requestOptions).subscribe(
          data=>{
            console.log("Data: "+data);
            this.downLoadExcelFile(data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","INS")
          },
          err=>{
            console.log("Error in downloading file:",err);
          }
        );
    }
    */

      // Download Institute MIS Report
      downloadAccMis()
      {
        console.log("Acc MIS");
        
          // if(this.filterSize > 0){
          //   this.gridData2 = {
          //     data: process(this.gridDataTemp2.data, { sort: [{ field: 'entity_name', dir: 'asc' }], filter: this.state.filter}).data,
          //     total: this.gridDataTemp2.data.length
          // };
          // }
          // else if(this.filterSize == 0){
          //   this.gridData2 = {
          //       data: this.gridDataTemp2.data,
          //       total: this.gridDataTemp2.total
          //   };
          // }
  
          // console.log("gridDataFiltered2 : ",this.gridData2);
          // console.log("gridDataFiltered2 size : ",this.gridData2.data.length);
          // console.log("gridDataFiltered2 total: ",this.gridData2.total);
  
          // let griddataarray = this.gridData2.data;
          // console.group("grid data 2: ",griddataarray);
          // console.group("grid data 2 Size: ",this.gridData2.data.length);
          // var griddata2size = this.gridData2.data.length;
          // this.gridData2=null;
    
          // let mis_mandateids=[];
    
          // console.log();
          // for (let index = 0; index < griddata2size; index++) {
          //   var element = griddataarray[index];
          //   // console.log("Element mandateids: ",element['global_mandate_id']);
          //   mis_mandateids.push(element['global_mandate_id']);
          // }
          
          // var fieldName1 = 'mandateids';
          // var fieldValue1 = mis_mandateids;

          let selectedIds = [];

          if (this.mySelection.length > 0 ) 
          {
            selectedIds = this.mySelection;
            // console.log("My Selection ID: ",selectedIds);
          }
          else
          {
            var filtered_data = process(this.gridDataTemp.data, { sort: [{ field: 'entity_name', dir: 'asc' }], filter: this.state.filter}).data;
            let griddataarray = filtered_data;
            var griddata2size = filtered_data.length;
            
            for (let index = 0; index < griddata2size; index++) {
              var element = griddataarray[index];
              selectedIds.push(element['mandate_id']);
            }
            // console.log("My Selection ID: ",selectedIds);
          }
  
          var fieldName1 = 'mandateids';
          var fieldValue1 = selectedIds;
          
          var object = {};
          object[fieldName1] = fieldValue1;

          console.log("Object Sent:",object);
          
          console.log("Tab Selected: "+this.tabSelected);
    
          const requestOptions: Object = {responseType: 'blob'};
    
          //Bonita API : /bonitaAPI/accesssme/AccountMisWrite' OR http://localhost:9002/accesssme/getAccountMis
          this.http.post<any>('/bonitaAPI/accesssme/getAccountMis',object,requestOptions).subscribe(
            data=>{
              console.log("Data: "+data);
              this.downLoadExcelFile(data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","ACC")
            },
            err=>{
              console.log("Error in downloading file:",err);
            }
          );
      }
    
  
      // Download Institute MIS Report
      downloadInsMis()
      {
        console.log("Ins MIS");
  
        let selectedIds = [];

        if (this.mySelection.length > 0 ) 
        {
          selectedIds = this.mySelection;
          // console.log("My Selection ID: ",selectedIds);
        }
        else
        {
          var filtered_data = process(this.gridDataTemp.data, { sort: [{ field: 'entity_name', dir: 'asc' }], filter: this.state.filter}).data;
          let griddataarray = filtered_data;
          var griddata2size = filtered_data.length;
          
          for (let index = 0; index < griddata2size; index++) {
            var element = griddataarray[index];
            selectedIds.push(element['mandate_id']);
          }
          // console.log("My Selection ID: ",selectedIds);
        }

        var fieldName1 = 'mandateids';
        var fieldValue1 = selectedIds;
        var object = {};
        object[fieldName1] = fieldValue1;
        
        // console.log("Object Sent:",object);
          const requestOptions: Object = {responseType: 'blob'};
    
          //Bonita API : /bonitaAPI/accesssme/getInstitutionMis' OR http://localhost:9002/accesssme/getInstitutionMis
          this.http.post<any>('/bonitaAPI/accesssme/getInstitutionMis',object,requestOptions).subscribe(
            data=>{
              // console.log("Data: ",data);
              this.downLoadExcelFile(data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","INS")
            },
            err=>{
              console.log("Error in downloading file:",err);
            }
          );
      }

  
    downLoadExcelFile(data: any, type: string, misType:string)
    {
      let blob = new Blob([data], { type: type});
      if(blob.size == 0)
      {
        console.log("Null File");
        this.toastr.warning('No records available for MIS', 'MIS Download!');
      }
      else
      {
        let url = window.URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        if (misType == "INS") 
        {
          anchor.download = "InstitutionMIS"; 
        }
        else if (misType == "ACC")
        {
          anchor.download = "AccountMIS"; 
        }
        anchor.href = url;
        anchor.click();
      }
    }

     

    editExportExcel(){
      //this.loaderServiisLoading.next(true);
      if (this.mySelection.length > 0 ) {
        this.mandateIdsString = this.mySelection.toString();
        
        console.log("editExportExcelForBulk", this.gridData.data);
        console.log("editExportExcelForBulk selected ", this.mySelection)
        let flag = this.checkIfSameProductsSelected();
        if (!flag.isSameProdInst) {
          //this.loaderServiisLoading.next(false);
          this.toastr.error('File Download Failed','Please select mandates of same product and institution combination');
          return false;
        }
        if (!flag.isCorrectStatus) {
          //this.loaderServiisLoading.next(false);
          this.toastr.error('File Download Failed',`Mandates with Coordination Case Status - 
          coordination rejected or with empty value are not allwed`);
          return false;
        }
        /* this.mySelection.forEach(mandateId => {
            for (let index = 0; index < this.gridData.data.length; index++) {
              const element = this.gridData.data[index];
              if(element.mandate_id == mandateId){
                if(this.gridData.data[index] == element.product_id)
                  continue;
                else{
                  flag = false;
                  //this.loaderServiisLoading.next(false);
                  this.toastr.error('File Download Failed','Please select mandates only same product and institution combination');
                  return false;
                }
              }
           }
        }); */
        if(flag){
        this.dashBoard.fetchEditExport('NOEditBulkMandate',this.mandateIdsString).subscribe(
          result => {
            //this.loaderServiisLoading.next(false);
            this.removeSelection();
              var blob = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
              FileSaver.saveAs(blob,"ISME - List Mandates .xlsx");
          },
          error => {
            //this.loaderServiisLoading.next(false);
            this.removeSelection();
            console.log('error',error);
           }); 
          } 
        }  
      
    }

    checkIfSameProductsSelected () {

      let statusNotAllowed = ['coordination rejected'];
      let productId = {};
      let respMap = {
        isSameProdInst: true,
        isCorrectStatus: true
      };
      const selectedLen = this.mySelection.length;
      for (let i = 0; i < selectedLen; i++) {
          // Loop on all grid data
          const gridLen = this.gridData.data.length;
          for (let index = 0; index < gridLen; index++) {
            const tData = this.gridData.data[index];
            if (this.mySelection[i] == tData.mandate_id) {
              productId[tData.product_id] = tData.product_id;
              if (Object.keys(productId).length > 1) {
                respMap.isSameProdInst = false;
                return respMap;
              }
              if (tData.case_current_status == null) {
                respMap.isCorrectStatus = false;
                return respMap;
              } else if (
                statusNotAllowed.indexOf(tData.case_current_status.trim().toLowerCase()) >= 0
                || tData.case_current_status.trim() == ''
              ) {
                respMap.isCorrectStatus = false;
                return respMap;
              }
              break;
            }
          }
      }
      if (Object.keys(productId).length > 1 || Object.keys(productId).length == 0) {
        respMap.isSameProdInst = false;
      }
      return respMap;
    }


    downloadBulkMandateTemplate(){ 
      //this.loaderServiisLoading.next(true);
      console.log("Entered interval");
      var filename = "BulkMandateTemplate.xlsx";
      var url = "/bonitaAPI/accesssme/downloadBulkUploadTemplates?productId=" + this.productId + "&institutionId=" + this.institutionId + "&templateType=NO&mode=ADD";
      var a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", filename);
      a.click();
      //this.loaderServiisLoading.next(false);
  }

    storeEditBulkMandateFile(event){
      // if(this.modalRef)
      // this.modalRef.hide();
      this.fileList  = event.target.files;
      this.file = this.fileList[0];
      console.log("file details",this.file);
      setTimeout(() => {
        this.modalRef = this.modalService.show(this.uploadconfirmation, { keyboard: false, ignoreBackdropClick: true });
      }, 400);
    }

    uploadEditBulkMandate() {
      this.modalRef.hide();
      //this.loaderServiisLoading.next(true);  
      let formData:FormData = new FormData();
      this.errorMessage = "";
      this.MandateList = "";
      formData.append('file', this.file);
      formData.append('uploadType','update');
      this.dashBoard.uploadEditBulkMandate(formData).subscribe(
        result => {
          console.log('result uploadEditBulkMandate ', result );
          if(result['Error'].length > 0){
            this.errorMessage = result['Error'].toString();
          }
          if(result['MandateList'].length > 0){
            this.MandateList = result['MandateList'].toString();
          }
          if(result['Error'].length > 0 || result['MandateList'].length > 0){
            this.modalRef = this.modalService.show(this.resultModal, { keyboard: false, ignoreBackdropClick: true });
          }
          
          if(result['MandateList'].length > 0){
            this.getAllMandatess();
           // this.toastr.success('Successfully Submitted', 'Success');
          }

          if(result['Error'].length == 0 && result['MandateList'].length == 0){
            this.modalRef = this.modalService.show(this.resultModal, { keyboard: false, ignoreBackdropClick: true });
          }
          
          //this.loaderServiisLoading.next(false);  
          
        },
        error => {
          console.log("Error",error);
          this.errorMessage = error;
          //this.loaderServiisLoading.next(false);
          this.toastr.error('File Upload Failed','Please try again');
        });
      }


}
