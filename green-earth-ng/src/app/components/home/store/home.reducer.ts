
import * as HomeActions from './home.actions';
import {Home } from '../../../_models/home';

let home: Home;
const initialState = {
    home: {home},
};

export function homeReducer(
    state = initialState,
    action: HomeActions.FetchHome
    ): any {
    switch (action.type) {
        case HomeActions.FETCH:
            return {
                ...state,
                home: {...state, type: action.type}
            };
    }
}
