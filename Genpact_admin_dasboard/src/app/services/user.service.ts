import { Injectable, EventEmitter, Output } from "@angular/core";
import {
  HttpClient,
  HttpResponse,
  HttpErrorResponse
} from "@angular/common/http";
import { SettingsService } from "./settings.service";
import { Service } from "./service";
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

export interface User {
  id: string;
  username: string;
  sessionId?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  apiToken?: string;
  permissions?: string[];

  //  getName(): string;
  //  setPermissions(permissions: string[]): void;
}

// function toCurrentUser(r: any): User {
//   const user : User;

//   user.id = r.user_id;
//   user.username = r.user_name;
//   user.sessionId = r.session_id;

//   return user;
// }

// function mapCurrentUser(response: Response): User {
//   console.log('currentUser');
//   const currentUser: User = toCurrentUser(response);
//   currentUser.apiToken = response.headers.get('X-Bonita-API-Token');
//   return currentUser;
// }

function handleError(err: HttpErrorResponse) {
  let errorMessage = '';
  if (err.error instanceof ErrorEvent) {
    errorMessage = `An error occurred: ${err.error.message}`;
  } else {
    errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
  }
 // console.log(errorMessage);
  return throwError(errorMessage);
}


@Injectable()
export class UserService extends Service {
  @Output() loggedInUser: EventEmitter<User> = new EventEmitter();
  currentUser: User;
  currentLoginDetails: any;
  user: any;

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService,
    private cookieService: CookieService
  ) {
    super();
    const currentUser = this.http
      .get(
       // `${this.settingsService.getBonitaApiBaseUrl()}/loginService`,
       `${this.settingsService.getBonitaApiBaseUrl()}/system/session/unusedid`,
        { headers: this.getGetHeaders() }
      );
    //  .pipe(map(mapCurrentUser));
    //  .catch(handleError) as Observable<User>;

    currentUser.subscribe(currentLoggedInUser => {
      // TODO: Fetching all users (c=-1) -- this is perhaps dangerous and should either grab a huge number or iterate over pages
      this.http
        .get(
          `${this.settingsService.getBonitaApiBaseUrl()}/identity/user/?p=0&c=-1&d=professional_data`,
          { headers: this.getGetHeaders() }
        )
        .subscribe(userList => {
         this.user  = userList;
          this.currentUser.apiToken = currentLoggedInUser['apiToken'];
        });
        this.cookieService.set('userName', currentLoggedInUser['user_name']);
        this.cookieService.set('userId', currentLoggedInUser['user_id']);
    });
  }
  getCurrentUser(): User {
    return this.currentUser;
  }
}

