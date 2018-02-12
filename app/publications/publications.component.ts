import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { PublicationService } from '../services/publications.service';

@Component({
  moduleId: module.id,
  selector: 'ns-publications',
  templateUrl: 'publications.component.html',
})
export class PublicationsComponent implements OnInit, OnDestroy {
  public readonly items = new BehaviorSubject<any[]>([]);

  public sub: Subscription;

  constructor(private readonly publications: PublicationService) {}

  public ngOnInit() {
    this.sub = this.publications.list().subscribe(this.items);
  }

  public ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
