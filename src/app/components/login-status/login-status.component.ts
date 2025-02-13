import {Component, Inject, OnInit} from '@angular/core';
import {OKTA_AUTH, OktaAuthStateService} from "@okta/okta-angular";
import {OktaAuth} from "@okta/okta-auth-js";
import { MatMenuModule} from '@angular/material/menu';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements  OnInit{

  isAuthenticated: boolean = false;
  userFullName: string = '';

  storage: Storage = sessionStorage;


  constructor(private oktaAuthService: OktaAuthStateService,
              @Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {
  }

  ngOnInit(): void {
    // Subscribe to authentication changes

    this.oktaAuthService.authState$.subscribe(
      (result) =>{
        this.isAuthenticated = result.isAuthenticated!;
        this.getUserDetails();
      }
    )
  }

  getUserDetails() {
    if(this.isAuthenticated){
      //Fetch the logged in user details

      this.oktaAuth.getUser().then(
        (res) =>{
          this.userFullName = res.name as string;

          //retrieve the email from okta response
          const userEmail = res.email;
          this.storage.setItem('userEmail',JSON.stringify(userEmail));

        }
      )

    }

  }

  logout(){
    // terminate the session with okta

    this.oktaAuth.signOut();
  }
}
