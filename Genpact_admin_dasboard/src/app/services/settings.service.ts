import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
 import { map, catchError} from 'rxjs/operators';

// import uiLabels from '../../assets/ui-labels.json';

@Injectable()
export class SettingsService {
  private bonitaApiBaseUrl: string;
  private bonitaBaseUrl: string;

  constructor( private http: HttpClient  ) {
    
  }

  getBonitaApiBaseUrl() {
    // if (!this.bonitaApiBaseUrl && window && window.location) {
    //    const paths = window.location.pathname.split('/', 2);
    //    this.bonitaApiBaseUrl = window.location.origin + '/';
    //    if (paths && paths.length > 1) {
    //      this.bonitaApiBaseUrl += paths[1] ;
    //      this.bonitaApiBaseUrl += 'bonita/' ;
    //    }
    //    this.bonitaApiBaseUrl += 'API' ;
    // }
    // return this.bonitaApiBaseUrl ;
     return '/bonita/API' ;
    // return 'http://localhost:9990' ;
  }

  getBonitaBaseUrl() {
    if (!this.bonitaBaseUrl && window && window.location) {
      const paths = window.location.pathname.split('/', 2);
      this.bonitaBaseUrl = '/';
      if (paths && paths.length > 1) {
        this.bonitaBaseUrl += paths[1] ;
      }
    }

    return this.bonitaBaseUrl;
  }

}
