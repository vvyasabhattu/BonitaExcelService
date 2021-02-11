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


@Injectable()
export class BulkuploadService {

    private API_VALIDATE_MANDATE_FIELDS = '/extension/validateMandatesData';
    private API_CREATE_MANDATES = '/extension/createMandates';


    constructor(
        private http: HttpClient,
        private settingsService: SettingsService
    ) { }


    validateMandates(obj) {
        return this.http.post<any>(
            this.settingsService.getBonitaApiBaseUrl() + this.API_VALIDATE_MANDATE_FIELDS,
            obj);

    }

    createMandates(obj) {
        return this.http.post<any>(
            this.settingsService.getBonitaApiBaseUrl() + this.API_CREATE_MANDATES,
            obj);
    }

    saveRecentActivities(log,activity,userName){
        const obj = {
            log:log,
            activityName:activity,
            userName:userName
          }
        return this.http.post('/bonitaAPI/accesssme/saveRecentActivities', obj);
    }

    getRecentActivities(){
        return this.http.post('/bonitaAPI/accesssme/getRecentActivities', {});
    }

}