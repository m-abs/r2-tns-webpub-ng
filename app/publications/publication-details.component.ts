import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Publication } from 'r2-shared-js/dist/es8-es2017/src/models/publication';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { map } from 'rxjs/operators/map';
import { Subscription } from 'rxjs/Subscription';

import { PublicationService } from '../services/publications.service';

@Component({
  moduleId: module.id,
  selector: 'ns-publication-details',
  templateUrl: 'publication-details.component.html',
})
export class PublicationDetailsComponent implements OnInit, OnDestroy {
  public readonly item = new BehaviorSubject<any>(null);

  public readonly cover = this.item
    .pipe(
      map((item) => {
        if (!item || !item.resources) {
          return null;
        }

        for (const resource of item.resources) {
          if (resource.rel === 'cover') {
            return resource;
          }
        }

        return null;
      }),
    );

  public sub: Subscription;

  private get id() {
    return this.route.snapshot.params['id'];
  }

  constructor(
    private readonly publications: PublicationService,
    private readonly route: ActivatedRoute,
  ) {}

  public ngOnInit() {
    this.sub = this.publications
      .metadataJson(this.id)
      .subscribe(
        (item) => this.item.next(item),
        (err) => console.error(err)
      );
  }

  public ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  public resourceUrl(href: string) {
    if (!this.id || !href) {
      return null;
    }

    return this.publications.resourceUrl(this.id, href);
  }
}
