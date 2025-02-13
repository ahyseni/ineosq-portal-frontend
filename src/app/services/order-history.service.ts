import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {OrderHistory} from "../common/order-history";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  private orderUrl = environment.ineosQUrl+'/orders';

  constructor(private httpClient: HttpClient) { }

  getOrderHistory(userEmail: string): Observable<GetResponseOrderHistory>{

    const orderHistoryUrl = `${this.orderUrl}/search/findByCustomerEmailOrderByDateCreatedDesc?email=${userEmail}`;
    return this.httpClient.get<GetResponseOrderHistory>(orderHistoryUrl);

  }
}
interface  GetResponseOrderHistory{

  _embedded:{

    orders: OrderHistory[];
  }

}
