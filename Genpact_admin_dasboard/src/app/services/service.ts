import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import {  HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable()
export class Service {

  protected getGetHeaders(): HttpHeaders {
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    return headers;
  }

  protected getUrlHeaders(): HttpHeaders {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return headers;
  }

  protected getPostHeaders(userService: UserService): HttpHeaders {
    const headers = this.getGetHeaders();
    //headers.append('X-Bonita-API-Token', userService.getCurrentUser().apiToken) ;
    return headers;
  }
}
