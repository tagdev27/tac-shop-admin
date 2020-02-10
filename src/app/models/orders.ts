import { Product } from "./product";

export interface Tracking {
    title: string
    text: string
    icon: string
    time: string
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface TacOrder {
    carts: CartItem[]
    currency_used: string
    conversion_rate:number
    transaction_id: string
    id: string
    country: string
    email: string
    created_date: string
    timestamp:any
    track_id: number
    status: string
    total_amount: number
    shipping_details: any
    other_payment_details:any
    gift_card_style: string
    tracking_details: Tracking[]
    payment_gateway_fee:any
    merchant_fee:any
    payment_gateway_used:string
    order_platform:string
    payment_status:string
    retry_url:string
}