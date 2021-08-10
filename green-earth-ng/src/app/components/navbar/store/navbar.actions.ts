import { Action} from '@ngrx/store';

export const FETCH = 'FETCH';

export class FetchNavbar implements Action {
    readonly type = FETCH;
    constructor(public payload: any) {}
}
