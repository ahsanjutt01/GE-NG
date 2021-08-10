export interface Settings {
    menu: Menu[];
    organization: Organization;
    currency: string;
    reward: any;
    shipping: any;
    countries?: any;
}

interface Menu {
    id: number;
    category_name: string;
    slug: string;
}

interface Organization {
    id: number;
    name: string;
    phone: string;
    email: string;
    registration_number: string;
    vat_number: string;
    postal_code: string;
    address: string;
    logo: string;
    store_locations: string;
}
