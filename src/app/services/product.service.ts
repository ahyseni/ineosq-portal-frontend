import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {Product} from "../common/product";
import {ProductCategory} from "../common/product-category";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl =environment.ineosQUrl+'/products';
  private categoryUrl = environment.ineosQUrl+'/product-category';

  constructor(private httpClient: HttpClient) { }


  getProductListPaginate(thePage: number,
                         thePageSize: number,
                         currentCategoryId: number): Observable<GetResponseProducts>{

    //  need to build url
    const searchUrl =`${this.baseUrl}/search/findByCategoryId?id=${currentCategoryId}`+`&page=${thePage}&size=${thePageSize}`;

    console.log(`Getting products url -${searchUrl}`);
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  getProductList(currentCategoryId: number): Observable<Product[]>{

    //  need to build url
    const searchUrl =`${this.baseUrl}/search/findByCategoryId?id=${currentCategoryId}`;
    return this.GetProducts(searchUrl);
  }


  private GetProducts(searchUrl: string) {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

  getProductCategories(): Observable<ProductCategory[]>{


    return  this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );

  }

  searchProduct(theKeyword: string) : Observable<Product[]>{

    const searchUrl =`${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;

    return this.GetProducts(searchUrl);
  }
  searchProductPaginate(thePage: number,
                         thePageSize: number,
                         theKeyword: string): Observable<GetResponseProducts>{

    //  need to build url
    const searchUrl =`${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`+`&page=${thePage}&size=${thePageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }


  getProduct(theProductId: number): Observable<Product> {

    // build the url
    const productUrl = `${this.baseUrl}/${theProductId}`;
    return this.httpClient.get<Product>(productUrl);

  }
}
interface GetResponseProducts {
  _embedded: {
    products: Product[]
  },
  page:{
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}
interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[]
  }
}
