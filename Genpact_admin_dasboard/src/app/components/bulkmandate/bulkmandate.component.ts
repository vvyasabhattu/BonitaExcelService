import { Component, OnInit } from '@angular/core';
import { } from '../../services/user.service';
import { BulkuploadSharedData } from '../../services/bulkUpload.sharedData.service'
import { BulkuploadService } from '../../services/bulkupload.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../loader.service';
import { SettingsService } from 'src/app/services/settings.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'bulkmandate',
  templateUrl: './bulkmandate.component.html',
  styleUrls: ['./bulkmandate.component.scss']
})
export class BulkmandateComponent implements OnInit {


  mandates: any;
  failedMandates: any;
  allEntities: any;
  succesMandatesFinal: any;
  failedMandatesCount: any;
  allMandatesCount: any;
  private obj: any;
  backDashboardurl: string = "";
  constructor(private bulkuploadSharedData: BulkuploadSharedData,
    private router: Router,
    private bulkUpload: BulkuploadService,
    private toastr: ToastrService,
    private settingsService: SettingsService,
    private loaderService: LoaderService) {
    this.mandates = this.bulkuploadSharedData.getMandateData();
    this.failedMandates = this.mandates.failMandates;
    this.failedMandatesCount = this.failedMandates.length;
    this.allEntities = this.mandates.allMandates;
    this.allMandatesCount = this.allEntities.length;
    this.succesMandatesFinal = this.mandates.succesMandatesFinal;
  }

  ngOnInit () {
    this.backDashboardurl = location.origin + "/bonita/apps/netops/dashboard/?role=NetopsTeam";
  }



  errorMandates() {

    this.router.navigate(['/bulkmandate/errorMandates'])
    this.bulkuploadSharedData.setMandateData(this.mandates)

  }

  allMandates() {

    this.router.navigate(['/bulkmandate/allMandates'])
    this.bulkuploadSharedData.setMandateData(this.mandates)

  }

  createMandates() {
    this.loaderService.isLoading.next(true);
    this.obj = JSON.parse(JSON.stringify(this.succesMandatesFinal));

    let finalMandates = {
      mandates: this.obj,
      source: 'NO'
    }

    this.bulkUpload.createMandates(finalMandates).subscribe(response => {
      this.loaderService.isLoading.next(false);
      this.router.navigate(['/kendo']);
    }, error => {
      console.log('Error creating bulk mandates ', error);
      this.loaderService.isLoading.next(false);
      this.toastr.error('Error in mandate creation', 'Something went wrong - ' + error);
    });


  }


}