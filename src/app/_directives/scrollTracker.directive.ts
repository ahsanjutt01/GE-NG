import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
    selector: '[appScrollTracker]'
})
export class ScrollTrackerDirective {
    @Output() scrollingFinished = new EventEmitter<boolean>();

    emitted = false;

    @HostListener('window:scroll', [])
    onScroll(): void {
        const footerHeight = document.getElementById('footer').offsetHeight;
        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - footerHeight) && !this.emitted) {
            this.emitted = true;
            this.scrollingFinished.emit(this.emitted);
        } else if ((window.innerHeight + window.scrollY) < document.body.offsetHeight) {
            this.emitted = false;
        }
    }
}
