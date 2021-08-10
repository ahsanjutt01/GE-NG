import { AfterContentInit, AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { GenericService } from 'src/app/_services/generic.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnDestroy {

  constructor(
    private genericService: GenericService
  ) {
    this.genericService.isErrorPage.next(true);
  }

  ngOnDestroy(): void {
    this.genericService.isErrorPage.next(false);
  }
}
