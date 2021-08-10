
export interface Cart {
    id: number;
    order_id: string;
    user_agent_detail: string;
    cart_price: number; // sum real price of items
    customer_id: number;
    cart_discount: number; // sum of total dicount price
    cart_price_after_discount: number; // cart_price_after_discount = cart_price - cart_discount
    is_taxes: number;
    tax_name: string;
    tax_price: number;
    cart_price_after_tax: number; // cart_price_after_discount - tax_price else cart_price_after_discount
    is_coupon: boolean;
    coupon_id: number;
    coupon_code: string;
    coupon_discount_type: string; // % or rs
    coupon_discount_price: number; // coupon 50
    coupon_total_discount_price: number; // coupon 50
    cart_price_after_coupon: number;
    // cart_price_after_tax percent or rs = cart_price_after_tax - coupon_discount_price else cart_price_after_tax
    cart_total_price: number; // cart_price_after_coupon
    delivery_method?: string;
    selected_delivery_method?: any;
    delivery_rate?: number;
    billing_address?: any;
    shipping_address?: any;
    is_reward: boolean;
    reward_points: number;
    reward_amount: number;
    earnablPoints?: number;
    cartItems: CartItem[];
    // additional charges
    is_additional_discount?: number;
    additional_discount_price?: number;
    additional_discount_type?: string;
}

export interface CartItem {
    id?: number;
    cart_id?: number;
    order_id: string;
    product_id: number;
    sku: string;
    variant_id: number;
    quantity: number;
    name: string;
    property_name: string;
    property_value: string;
    attributes_detail: string;
    thumbnail: string;
    maxQty?: number;
    unit_price: number; // unit Price of product // Change required
    price: number; // real total price price seling
    product?: any;
    freeProduct: any;
    discount: number; // 50%
    price_after_discount: number; // after discount applied real price 9.99 after 4.995
    // discountPrice: number; // replace with price_after_discount  // change require
    total_price: number; // price - discount = total_price
    is_promotion: boolean;
    is_deal_of_the_day: boolean;
    promotion_type: string;
    promotion_title: string;
    afterDiscountPrice: number;
    isFreeNicShot?: boolean;
    cart_item_promotion: CartItemPromotion;
    deal_of_the_day: any;

    // exclusive
    exclusive_offer?: any;
    exclusiveItems?: [];
    selected_variant?: any;
    mix_match_offer?: any;
    mixMatchItems?: any;
    isFreeProductsPermotion?: boolean;
    freeProducts?: any;
}

export interface CartItemPromotion {
    id?: number;
    cart_id?: number;
    cart_item_id?: number;
    order_id: string;
    promotion_type: string;
    promotion_id: number;
    variant_id: number;
    promotion_detail_id: number;
    product_linked_id?: number;
    quantity: number;
    discount_type: string;
    discount_price: number;
    promotion_start_date: Date;
    promotion_end_date: Date;
    title?: string;
    isExclusive?: boolean; //
    isMixMatch?: boolean; //
}
