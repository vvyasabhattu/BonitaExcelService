import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { LoaderComponent} from './components/loader/loader.component';
import { LoaderService } from './loader.service';
import { LoaderInterceptor } from './loader.interceptor';
import { HeaderComponent } from './components/header/header.component';

import { BulkmandateComponent } from './components/bulkmandate/bulkmandate.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { UserService } from './services/user.service';
import { SettingsService } from './services/settings.service';
import { LandingComponent } from './components/landing/landing.component';
import { DashboardService } from './services/dashboard.service';
import { CookieService } from 'ngx-cookie-service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GridModule, ExcelModule  } from '@progress/kendo-angular-grid';
import { MultiSelectModule } from '@progress/kendo-angular-dropdowns';
import { MultiCheckFilterComponent } from './components/landing/my-dropdown-filter';
import { BulkMandateErrorEntitiesComponent } from './components/bulk-mandate-error-entities/bulk-mandate-error-entities.component';
import { AllMandatesComponent } from './components/all-mandates/all-mandates.component';
import { BulkuploadService } from './services/bulkupload.service';
import { BulkuploadSharedData } from './services/bulkUpload.sharedData.service';
import { ToastrModule } from 'ngx-toastr';
import { DataService } from './services/share.service';
import { CommentsModalComponent } from './components/landing/coments-modal.component';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DisclaimerComponent } from './components/footer/disclaimer/disclaimer.component';
import { TermsofuseComponent } from './components/footer/termsofuse/termsofuse.component';
import { PrivacynoticeComponent } from './components/footer/privacynotice/privacynotice.component';
import { RegulatorydisclosuresComponent } from './components/footer/regulatorydisclosures/regulatorydisclosures.component';
import { InputsModule } from '@progress/kendo-angular-inputs';


const routes: Routes = [
   { path: 'landing', component: LandingComponent },
   { path: 'bulkmandate', component: BulkmandateComponent,
       children: [         
         {path: 'errorMandates', component: BulkMandateErrorEntitiesComponent},
         {path: 'allMandates', component: AllMandatesComponent},
         {path:'', redirectTo: "allMandates", pathMatch: "full"}
       ]
   },
   { path: 'disclaimer', component: DisclaimerComponent},
   { path: 'privacy-notice', component: PrivacynoticeComponent},
   { path: 'terms-of-use', component: TermsofuseComponent},
   { path: 'regulatory-disclosure', component: RegulatorydisclosuresComponent},
   { path: '', redirectTo: 'landing', pathMatch: 'full'},
   { path: '**', redirectTo: 'landing' }
 ];

@NgModule({
  declarations: [
    AppComponent,
    LoaderComponent,
    HeaderComponent,
    LandingComponent,
    MultiCheckFilterComponent,
    BulkmandateComponent,
    BulkMandateErrorEntitiesComponent,
    AllMandatesComponent,
    CommentsModalComponent,
    DisclaimerComponent,
    TermsofuseComponent,
    PrivacynoticeComponent,
    RegulatorydisclosuresComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes,  { useHash: true }),
    HttpClientModule,
    FormsModule,
    NgbModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    AngularFontAwesomeModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    GridModule,
    ExcelModule,
    MultiSelectModule,
    DateInputsModule,
    ToastrModule.forRoot({
      timeOut: 4000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    InputsModule
  ],
  providers: [
    LoaderService,
    UserService,
    SettingsService,
    DashboardService,
    CookieService,
    BulkuploadService,
    BulkuploadSharedData,
    DataService,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  entryComponents: [CommentsModalComponent]
})
export class AppModule { }
