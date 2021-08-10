import { DecimalPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { LoaderComponent } from '../components/loader/loader.component';
import { ProductCardComponent } from '../components/product/product-card/product-card.component';

import { ModalComponent } from '../_modal/modal/modal.component';
import { PipeModule } from '../_pipes/pipe.module';
import { ShortDecimal } from '../_pipes/shortDecimal.pipe';
import { ScrollTrackerDirective } from '../_directives/scrollTracker.directive';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        ScrollingModule,
        NgScrollbarModule,
        PipeModule
    ],
    declarations: [
        ModalComponent,
        LoaderComponent,
        ProductCardComponent,
        ScrollTrackerDirective
        // ShortDecimal
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        ScrollingModule,
        NgScrollbarModule,
        ModalComponent,
        LoaderComponent,
        ShortDecimal,
        // PipeModule,
        ProductCardComponent,
        ScrollTrackerDirective
    ],
    providers: [
        DecimalPipe
    ]
})
export class SharedModule {
    static forRoot(): any {
        return {
            ngModule: PipeModule,
            providers: [],
        };
    }
}
