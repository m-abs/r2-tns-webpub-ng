import { Component, OnDestroy, OnInit } from '@angular/core';
import { OPDSFeed } from 'r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { map } from 'rxjs/operators/map';
import { Subscription } from 'rxjs/Subscription';

import { PublicationService } from '../services/publications.service';

@Component({
  moduleId: module.id,
  selector: 'ns-publications',
  templateUrl: 'publications.component.html',
})
export class PublicationsComponent implements OnInit, OnDestroy {
  public readonly feed = new BehaviorSubject<OPDSFeed>(null);

  public readonly items = this.feed
    .pipe(
      map((feed) => {
        if (!feed) {
          return null;
        }

        const output = [];

        for (const pub of feed.Publications) {
          const selfLink = pub.Links.find((link) => link.Rel.indexOf('self') !== -1)[0];
          if (!selfLink) {
            continue;
          }

          output.push({
            href: selfLink.href,
            title: pub.Metadata.Title,
          });
        }

        return output;
      }),
    );

  public sub: Subscription;

  constructor(private readonly publications: PublicationService) {}

  public ngOnInit() {
    this.sub = this.publications.list().subscribe(this.feed);
  }

  public ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
