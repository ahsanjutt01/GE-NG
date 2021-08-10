import { Product } from './product';

export interface Home {
    header: Header;
    deals: {
        banners: [Banner],
        is_active: boolean
    };
    category: {
        heading: string,
        description: string,
        is_active: boolean,
        list: [
            {
                id: number,
                category_name: string
            }
        ]
    };
    deal_of_the_day: {
        heading: string,
        description: string,
        image: string,
        is_active: boolean,
        detail: any
    };
    featured_product: {
        title: string,
        tabs: [
            {
                title: string,
                is_active: number,
                list: [Product]
            }
        ]
    };
    banner: {
        imgages: {
            desktop: string,
            mobile: string
        },
        url: string,
        is_active: number
    };
}

interface Header {
    images: { desktop: string, tab: string, mobile: string };
}

interface Banner {
    image: string;
    url: string;
}
