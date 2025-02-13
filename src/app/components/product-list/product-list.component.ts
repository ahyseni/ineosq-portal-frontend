import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../services/product.service";
import {Product} from "../../common/product";
import {ActivatedRoute} from "@angular/router";
import {CartItem} from "../../common/cart-item";
import {CartService} from "../../services/cart.service";
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit{

   products: Product[] = [];
   currentCategoryId: number = 1;
   previousCategoryId: number = 1;
   currentCategoryName: string = "";
   searchMode: boolean = false;

  // Pagination properties

  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;

  previousKeyword: string="";


  constructor(private productService: ProductService,private route: ActivatedRoute, private cartService: CartService) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {

    this.searchMode = this.route.snapshot.paramMap.has("keyword");
    if(this.searchMode){
      this.handleSearchProduct();
    }else {this.handleListProducts();}


  }

  handleListProducts() {
    //check if id is set


    const hasCategoyId: boolean = this.route.snapshot.paramMap.has('id');
    if(hasCategoyId){
      //get the id param string to a number

      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
      this.currentCategoryName = this.route.snapshot.paramMap.get('name')!;
    }else {
      // not available
      this.currentCategoryId = 1;
      this.currentCategoryName = "All"
    }
    //check if we have a different category id then reset the page number
    if(this.previousCategoryId != this.currentCategoryId){
      this.thePageNumber=1
    }
    this.previousCategoryId = this.currentCategoryId;

    console.log(`currentCategoryid= ${this.currentCategoryId}, thePageNumber = ${this.thePageNumber}`);



    this.productService.getProductListPaginate(this.thePageNumber-1,
                                                       this.thePageSize,
                                                       this.currentCategoryId).subscribe(this.processResult()
    );
  }

  private handleSearchProduct() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

    //if we have a different keyword set page number to 1

    if(this.previousKeyword!=theKeyword){
      this.thePageNumber=1;
    }
    this.previousKeyword = theKeyword;


    this.productService.searchProductPaginate(this.thePageNumber -1,
                                              this.thePageSize,
                                               theKeyword).subscribe(this.processResult()
    );
  }

  updatePageSize(pageSize: string) {
    this.thePageSize=+pageSize;
    this.thePageNumber=1
    this.listProducts();
  }

  processResult() {
    return (data: any)=> {
      this.products = data._embedded.products;
      this.thePageNumber= data.page.number +1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    }
  }
  addToCart(theProduct: Product){
    console.log(`Adding to cart : ${theProduct.name}, ${theProduct.unitPrice}`);
    const theCartItem = new CartItem((theProduct));
    this.cartService.addToCart(theCartItem);

  }

}
