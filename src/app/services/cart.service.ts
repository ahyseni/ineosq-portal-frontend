import { Injectable } from '@angular/core';
import {CartItem} from "../common/cart-item";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] =[];

  totalPrice: Subject<number> = new Subject<number>();
  totalQuantity: Subject<number> = new Subject<number>();

  constructor() { }

  addToCart(theCartItem: CartItem){
    //check if exist
    let alreadyExist: boolean = false;
    let existingCartItem!: CartItem;
    if(this.cartItems.length>0) {
       for (let tempCartItem of this.cartItems){
         if(tempCartItem.id== theCartItem.id){
           existingCartItem =tempCartItem;
           break;
         }
       }
      //find the item based on id
      alreadyExist = (existingCartItem != undefined);
    }
    if(alreadyExist){
      existingCartItem.quantity++;
    }else{
      this.cartItems.push(theCartItem);
    }
    // compute total price and quantity
    this.computeCartTotals()
  }

  computeCartTotals() {

    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for(let  currentCartItem of this.cartItems){
      totalPriceValue +=currentCartItem.quantity*currentCartItem.unitPrice;
      totalQuantityValue +=currentCartItem.quantity;
    }

//publish the new values
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    //log cart data

    this.logCartData(totalPriceValue,totalQuantityValue);

  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {

    console.log(`Content of the cart`);
    for (let tempCartItem of this.cartItems)
    {
      const  subTotalprice = tempCartItem.quantity* tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity: ${tempCartItem.quantity}, unitPrice: ${tempCartItem.unitPrice}, subTotalPrice: ${subTotalprice} , imageUrl: ${tempCartItem.imageUrl}`);
    }
     console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantityValue: ${totalQuantityValue}`);
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;
    if(theCartItem.quantity === 0){
      this.remove(theCartItem);
    }else{
      this.computeCartTotals();
    }

  }

  remove(theCartItem: CartItem) {
    // get index of the item in the array

    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id === theCartItem.id)

    if(itemIndex>-1){
      this.cartItems.splice(itemIndex,1);
      this.computeCartTotals()
    }
  }
}
