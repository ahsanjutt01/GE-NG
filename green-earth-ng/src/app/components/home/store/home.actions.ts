import { Action} from '@ngrx/store';
import { Home } from 'src/app/_models/home';

export const FETCH = 'FETCH';

export class FetchHome implements Action {
    readonly type = FETCH;
    payload: Home;
}
