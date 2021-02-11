import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

import { UserService, User } from '../../services/user.service';
import { DataService } from '../../services/share.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [DatePipe]
})
export class HeaderComponent implements OnInit {
  currentUser: User = null;
  errorMessage = '';
  isLoading = true;
  searchbox = {
    searchFilter: 'all',
    searchWord: ''
  };
  switchUrl: any;
  tempUrl: any;
  urlSlice: any;
  searchWord: any;
  startDate:any;
  constructor(
    private userService: UserService,
    private datePip:DatePipe,
    public cookieService: CookieService,
    private data: DataService) {
      console.log(window.location.href);
      this.tempUrl = window.location.href.search("bonita/")
      this.urlSlice = window.location.href.slice(0,this.tempUrl);
      this.switchUrl = this.urlSlice + "bonita/apps/home";
      console.log(this.switchUrl, "switchUrl");

  }

  ngOnInit() {
    this.userService.loggedInUser.subscribe(data => {
        this.currentUser = data ; this.isLoading = false;
    }) ;
  }

  doSearch() {
    this.searchbox.searchWord = this.searchWord;
    this.data.searchHeader(this.searchbox);
  }

  switchRole(){
    console.log("in" , this.switchUrl)
    window.parent.location.href = this.switchUrl;
    
  }

  getDate()
  {
     this.startDate=this.datePip.transform(this.searchWord,'dd/MM/yyyy');
      this.searchWord=this.startDate;
      console.log("Date1 : ",this.searchWord)
  }
}
