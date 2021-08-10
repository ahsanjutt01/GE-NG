
import * as NavbarActions from './navbar.actions';

const initialState = {
    navbar: {
        currency: '',
        menu: [],
        organization:
        {
            id: 1,
            name: 'Vape Suite Ltd',
            phone: '0800 970 4039',
            email: 'official@bape.com',
            registration_number: '111111111111111',
            vat_number: '2122231221',
            postal_code: '1223122',
            address: '31 Westbourne Road Hundderfield, HD1 4LQ',
            logo: '',
            store_locations: []
        }
    }
};

export function navbarReducer(
    state = initialState,
    action: NavbarActions.FetchNavbar
): any {
    switch (action.type) {
        case NavbarActions.FETCH:
            return {
                ...state,
                navbar: action.payload
            };
        default:
            return state;
    }
}
