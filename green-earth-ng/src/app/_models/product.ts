export interface Product {
    id: number;
    name: string;
    sku: string;
    collection_id: number;
    brand_id: number;
    short_description: string;
    description: string;
    key_features: [string];
    thumbnail: string;
    category_id: number;
    seo: {
        page_title: string,
        meta_tag_name: string,
        meta_keywords: string
    };
    is_taxable: boolean;
    status: boolean;
    collection: {
        id: number,
        name: string,
        active: number,
    };
    brand: {
        id: number,
        name: string;
        description: string;
        sitel_url: string;
        logo: string;
    };
    sub_category: {
        id: number,
        category_name: string,
        main_category_id: number,
        attribute_id: string,
        property_id: number
    };
    variants: [
        {
            id: number,
            sell_price: number,
            cost_price: number,
            whole_sale_price: number,
            barcode: string,
            product_id: number,
            initial_quantity: number,
            image_key: string,
            attribute_detail: [
                {
                    id: number,
                    variant_id: number,
                    attribute_name: string,
                    attribute_value: string
                }
            ]
        }
    ];
}
