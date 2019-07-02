import { Product } from "./product";

export interface CartItem {
    email:string
    country:string
    quantity:number
    product:Product
    created_date:string
}