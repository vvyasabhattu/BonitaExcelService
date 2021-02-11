import { Component, OnInit } from '@angular/core';
import { BulkuploadSharedData } from '../../services/bulkUpload.sharedData.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-mandates',
  templateUrl: './all-mandates.component.html',
  styleUrls: ['./all-mandates.component.scss']
})
export class AllMandatesComponent {

  mandates: any;
  failedMandates: any;
  allEntities: any;
  constructor(private bulkuploadSharedData: BulkuploadSharedData,
    private router: Router) {
    this.mandates = this.bulkuploadSharedData.getMandateData();
    this.failedMandates = this.mandates.failMandates;
    this.allEntities = this.mandates.allMandates;

  }



}
