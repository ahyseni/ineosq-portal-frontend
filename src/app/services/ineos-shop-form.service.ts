import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Country} from "../common/country";
import { map } from 'rxjs/operators'
import {State} from "../common/state";
import {environment} from "../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class IneosShopFormService {

  private countriesUrl=environment.ineosQUrl+'/countries';
  private statesUrl=environment.ineosQUrl+'/states';


  constructor(private httpClient: HttpClient) { }

  getCountries(): Observable<Country[]>{
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    );
  }

  getStates(theCountryCode: string): Observable<State[]>{

    // Search Url

    const searchStatesUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;
    return this.httpClient.get<GetResponseStates>(searchStatesUrl).pipe(
      map(response => response._embedded.states)
    );
  }

  getCreditCardMonths(startMonth: number): Observable<number[]>{
    let data: number[] = [];

    for (let theMonth =startMonth;theMonth<=12; theMonth++){
      data.push(theMonth);
    }
    return of(data);
  }
  getCreditCardYears(): Observable<number[]>{
    let data: number[] = [];
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;

    for (let theYear =startYear;theYear<=endYear; theYear++){
      data.push(theYear);
    }
    return of(data);
  }

}
interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  }
}
interface GetResponseStates {
  _embedded: {
    states: State[];
  }
}
