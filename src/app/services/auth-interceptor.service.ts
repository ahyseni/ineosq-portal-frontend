import {Inject, Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {from, lastValueFrom, Observable} from "rxjs";
import {OKTA_AUTH} from "@okta/okta-angular";
import {OktaAuth} from "@okta/okta-auth-js";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor{

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(req,next));
  }

  private async handleAccess(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    // add secure end point

    const theEndPoint = environment.ineosQUrl+'/orders';
    const securedEndPoints = [theEndPoint];

    if(securedEndPoints.some(url =>req.urlWithParams.includes(url))){
      const accessToken = this.oktaAuth.getAccessToken();

      // clone request and add new header
        req = req.clone({

          setHeaders: {
            Authorization: 'Bearer ' + accessToken
          }
        }) ;

    }
    return await lastValueFrom(next.handle(req));
  }
}
