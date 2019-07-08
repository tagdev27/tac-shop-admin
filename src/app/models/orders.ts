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
    transaction_id: string
    id: string
    country: string
    email: string
    created_date: string
    track_id: number
    status: string
    total_amount: number
    shipping_details: any
    gift_card_style: string
    tracking_details: Tracking[]
}