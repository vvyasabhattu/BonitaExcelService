import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Injectable()
export class DataService {

 // private messageSource = new BehaviorSubject('default message');
  private _headerSearch: BehaviorSubject<any> = new BehaviorSubject<any>([]);
//  currentMessage = this.messageSource.asObservable();
  search: Observable<any> = this._headerSearch.asObservable()
  constructor() { }

  searchHeader(message: any) {
    this._headerSearch.next(message)
  }

}