import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {IneosShopFormService} from "../../services/ineos-shop-form.service";
import {Country} from "../../common/country";
import {State} from "../../common/state";
import {IneosValidators} from "../../validators/ineos-validators";
import {CartService} from "../../services/cart.service";
import {CheckoutService} from "../../services/checkout.service";
import {Router} from "@angular/router";
import {Order} from "../../common/order";
import {OrderItem} from "../../common/order-item";
import {Purchase} from "../../common/purchase";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {environment} from "../../../environments/environment";
import {PaymentInfo} from "../../common/payment-info";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit{

checkoutFormGroup!: FormGroup;

totalPrice: number = 0;
totalQuantity: number = 0;

creditCardMonths: number[] =[];
creditCardYears: number[] = [];

countries: Country[] =[];

shippingAddressStates: State[] = [];
billingAddressStates: State[] = [];

storage: Storage = sessionStorage;

//initialize stripe api

  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = "";
  isDisabled: boolean = false;



  constructor(private formBuilder: FormBuilder,
              private ineosFormService: IneosShopFormService,
              private  cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) {
  }

  ngOnInit(): void {

    this.setupStripePaymentForm();

    this.reviewCartDetails();
    // read email

    const userEmail = JSON.parse(this.storage.getItem('userEmail')!);
this.checkoutFormGroup = this.formBuilder.group({
  customer: this.formBuilder.group({
      firstName: new FormControl('',[Validators.required,
                                                        Validators.minLength(2),
                                                        IneosValidators.notOnlyWhitespace]),
      lastName: new FormControl('',[Validators.required,
                                                      Validators.minLength(2),
                                                      IneosValidators.notOnlyWhitespace]),
      email: new FormControl(userEmail,
        [Validators.required,
                      Validators.pattern('^[a-z09._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
                      IneosValidators.notOnlyWhitespace])
    }),
  shippingAddress: this.formBuilder.group({
    street: new FormControl('',[Validators.required,
      Validators.minLength(2),
      IneosValidators.notOnlyWhitespace]),
    city: new FormControl('',[Validators.required,
      Validators.minLength(2),
      IneosValidators.notOnlyWhitespace]),
    state: new FormControl('',[Validators.required]),
    country: new FormControl('',[Validators.required]),
    zipCode: new FormControl('',[Validators.required,
      Validators.minLength(5),
      IneosValidators.notOnlyWhitespace])
  }),
  billingAddress: this.formBuilder.group({
    street: new FormControl('',[Validators.required,
      Validators.minLength(2),
      IneosValidators.notOnlyWhitespace]),
    city: new FormControl('',[Validators.required,
      Validators.minLength(2),
      IneosValidators.notOnlyWhitespace]),
    state:new FormControl('',[Validators.required,]),
    country: new FormControl('',[Validators.required]),
    zipCode: new FormControl('',[Validators.required,
      Validators.minLength(5),
      IneosValidators.notOnlyWhitespace])
  }),
  creditCard: this.formBuilder.group({
    /*
    cardType: new FormControl('',[Validators.required]),
    nameOnCard:new FormControl('',[Validators.required,
      Validators.minLength(2),
      IneosValidators.notOnlyWhitespace]),
    cardNumber: new FormControl('',[Validators.required,Validators.pattern('[0-9]{16}')]),
    securityCode: new FormControl('',[Validators.required,Validators.pattern('[0-9]{3}')]),
    expirationMonth: [''],
    expirationYear: ['']

     */
  })
  });
/*
    // populate credit card months
    const startMonth: number = new Date().getMonth()+1;
    console.log("Start month : "+startMonth);

    this.ineosFormService.getCreditCardMonths(startMonth).subscribe(
      data =>{
        console.log("Retrieved credit card months: "+JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );



    //polulate credit card years

    this.ineosFormService.getCreditCardYears().subscribe(

        data =>{
          console.log("Retrieved credit card years: "+JSON.stringify(data));
          this.creditCardYears = data;
        }

    )
*/

    this.ineosFormService.getCountries().subscribe(

      data =>{
        console.log("Retrieved countries: "+JSON.stringify(data));
        this.countries= data;
      }
    )
  }


  get firstName(){ return this.checkoutFormGroup.get('customer.firstName');  }
  get lastName(){ return this.checkoutFormGroup.get('customer.lastName');  }
  get email(){ return this.checkoutFormGroup.get('customer.email');  }


  get shippingAddressStreet(){ return this.checkoutFormGroup.get('shippingAddress.street');  }
  get shippingAddressCity(){ return this.checkoutFormGroup.get('shippingAddress.city');  }
  get shippingAddressState(){ return this.checkoutFormGroup.get('shippingAddress.state');  }
  get shippingAddressZipCode(){ return this.checkoutFormGroup.get('shippingAddress.zipCode');  }
  get shippingAddressCountry(){ return this.checkoutFormGroup.get('shippingAddress.country');  }

  get billingAddressStreet(){ return this.checkoutFormGroup.get('billingAddress.street');  }
  get billingAddressCity(){ return this.checkoutFormGroup.get('billingAddress.city');  }
  get billingAddressState(){ return this.checkoutFormGroup.get('billingAddress.state');  }
  get billingAddressZipCode(){ return this.checkoutFormGroup.get('billingAddress.zipCode');  }
  get billingAddressCountry(){ return this.checkoutFormGroup.get('billingAddress.country');  }


  get creditCardType(){ return this.checkoutFormGroup.get('creditCard.cardType');  }
  get creditNameOnCard(){ return this.checkoutFormGroup.get('creditCard.nameOnCard');  }
  get creditCardNumber(){ return this.checkoutFormGroup.get('creditCard.cardNumber');  }
  get creditCardSecurityCode(){ return this.checkoutFormGroup.get('creditCard.securityCode');  }

  onSubmit(){

    console.log("Handling the submit button");

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    // console.log(this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    // console.log(this.checkoutFormGroup.get('shippingAddress')?.value.state.name);
    //
    // console.log(this.checkoutFormGroup.get('billingAddress')?.value.country.name);
    // console.log(this.checkoutFormGroup.get('billingAddress')?.value.state.name);

    // set up order
     let order = new Order(this.totalPrice,this.totalQuantity);
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;
    // get cart items
    const cartItems = this.cartService.cartItems;

    // create order items from cart items
     // - long way
    /*
     let orderItems: OrderItem[] = [];
     for(let i=0; i<cartItems.length;i++){

       orderItems[i]= new OrderItem(cartItems[i]);
     }
     */

     // - short way

    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // set up purchase
     let purchase = new Purchase(this.checkoutFormGroup.controls['customer'].value,this.checkoutFormGroup.controls['shippingAddress'].value,this.checkoutFormGroup.controls['billingAddress'].value,order,orderItems);

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address

    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    // populate purchase - order and order items

    purchase.order=order;
    purchase.orderItems = orderItems;
    // compute payment info

    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer.email;

    console.log(`this.paymentInfo.amount :${this.paymentInfo.amount}`);


    // call rest api via the checkout service

   // if valid form
    if(!this.checkoutFormGroup.invalid && this.displayError.textContent === ""){

      this.isDisabled = true;
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,

                billing_details: {
                  email: purchase.customer.email,
                  name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                  address: {
                    line1: purchase.billingAddress.street,
                    city: purchase.billingAddress.city,
                    state: purchase.billingAddress.state,
                    postal_code: purchase.billingAddress.zipCode,
                    country: this.billingAddressCountry?.value.code
                  }

                }
              }
            }, { handleActions: false})
            .then((result: any) => {
              if(result.error) {
                // inform customer

                alert(`There was an error : ${result.error.message}`)
                this.isDisabled = false;
              } else {
                // call rest API cia the checkout service
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: (response: any) => {
                    alert(` Your order has been received. \nOrder tracking number: ${response.orderTrackingNumber}`);

                    //reset card

                    this.resetCart();
                    this.isDisabled = false;
                  },

                  error: (err: any) => {
                    alert(`There was an error: ${err.message}`);
                    this.isDisabled = false;
                  }
                })

              }
              });
             }
      );
    }else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }


  }

  copyShippingAddressToBillingAddress(event: any) {

    if(event.target.checked){
      console.log("Shipping Address")
      console.log(this.checkoutFormGroup.controls.shippingAddress.value);
      this.checkoutFormGroup.controls.billingAddress.setValue(this.checkoutFormGroup.controls.shippingAddress.value);
      this.billingAddressStates =this.shippingAddressStates;
      console.log("Billing Address");
      console.log(this.checkoutFormGroup.controls.billingAddress.value);
    }else{
      this.checkoutFormGroup.controls.billingAddress.reset();
      this.billingAddressStates=[];
      console.log("Reset Billing Address");
      console.log(this.checkoutFormGroup.controls.billingAddress.value);
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup!.value.expirationYear);

    let startMonth: number;

    if(currentYear === selectedYear){
      startMonth = new Date().getMonth() +1;
    }else{
      startMonth = 1;
    }
    this.ineosFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    );
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode =formGroup?.value.country.code;
    const countryName =formGroup?.value.country.name;

    this.ineosFormService.getStates(countryCode).subscribe(
      data => {
        if(formGroupName === 'shippingAddress'){
          this.shippingAddressStates = data;
          console.log("Shipping Address Change Get States");
          console.log(this.shippingAddressStates.values());
        }else{
          this.billingAddressStates = data;
          console.log("Billing Address Change Get States");
          console.log(this.billingAddressStates.values());
        }
        formGroup!.get('state')?.setValue(data[0]);
      }
    );

  }

  reviewCartDetails() {
    //subscribe to cartservice.totalquantity

    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    //subscribe to cartservice.totalprice

    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
  );
  }

  resetCart() {
    // reset cart
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();
    // reset the form
    this.checkoutFormGroup.reset();
    // navigate back to the products page

    this.router.navigateByUrl("/products");
  }

   setupStripePaymentForm() {

    //handle stripe element

     var elements = this.stripe.elements();
     //create card element

     this.cardElement = elements.create('card', {hidePostalCode: true});

     // add an instance of card API

     this.cardElement.mount('#card-element');

     // Add event binding

     this.cardElement.on('change',(event: any)=>{

       this.displayError = document.getElementById('card-errors');

       if(event.complete) {
         this.displayError.textContent = "";

       }else if (event.error){
         this.displayError.textContent = event.error.message;       }
     })

  }
}
