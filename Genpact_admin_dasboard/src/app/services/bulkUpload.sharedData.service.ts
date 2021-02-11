import { Injectable } from "@angular/core";

@Injectable()
export class BulkuploadSharedData {

     mandateData: any;

     setMandateData(data: any){
        this.mandateData = data;
     }

    getMandateData(){
        return this.mandateData;
    }
}