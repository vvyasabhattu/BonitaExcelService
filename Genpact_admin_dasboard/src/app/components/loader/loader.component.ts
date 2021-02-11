//loader.interceptor.ts
import { Component, OnInit } from '@angular/core';
import { LoaderService } from '../../loader.service';
import { timeout } from 'q';

@Component({
  selector: 'app-loading',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {

  loading: boolean;
  constructor(private loaderService: LoaderService) {
    this.loaderService.isLoading.subscribe((v) => {
      if (!v) {
        setTimeout ( () => {
          this.loading = v;
        }, 3000)
      } else {
        this.loading = v;
      }
    });
  }
  ngOnInit() {
  }

}
