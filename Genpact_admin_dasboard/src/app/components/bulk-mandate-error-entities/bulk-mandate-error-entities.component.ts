import { Component, OnInit } from '@angular/core';
import { BulkuploadSharedData } from '../../services/bulkUpload.sharedData.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-bulk-mandate-error-entities',
  templateUrl: './bulk-mandate-error-entities.component.html',
  styleUrls: ['./bulk-mandate-error-entities.component.scss']
})
export class BulkMandateErrorEntitiesComponent  {

  private mandates: any;
  public failedMandates: any;
  public  isCollapsed = false;
  activeIds: string[] = [];
  constructor(private bulkuploadSharedData: BulkuploadSharedData,
  private router: Router){
    this.mandates =  this.bulkuploadSharedData.getMandateData();
    this.failedMandates = this.mandates.failMandates;
    const len = this.failedMandates.length;
    for ( let i = 0; i < len; i++) {
      let str = 'panel-' + i;
      this.activeIds.push(str);
      console.log('activeIds for errors ', this.activeIds)
    }
  
  }


}
