import { Component, OnDestroy, OnInit } from '@angular/core';
import { OPDSFeed } from 'r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2';
import { OPDSLink } from 'r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-link';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { map } from 'rxjs/operators/map';
import { tap } from 'rxjs/operators/tap';
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
          let selfLink: OPDSLink;
          for (const link of pub.Links) {
            if (link.Rel.indexOf('self') !== -1) {
              selfLink = link;
              break;
            }
          }

          if (!selfLink) {
            continue;
          }

          const m = selfLink.Href.match(/\/pub\/([^/]+)\//);
          if (!m) {
            continue;
          }

          output.push({
            base64: m[1],
            href: selfLink.Href,
            title: pub.Metadata.Title,
          });
        }

        return output;
      }),
    );

  public sub: Subscription;

  constructor(
    private readonly publications: PublicationService,
  ) {}

  public ngOnInit() {
    this.reload();
  }

  public ngOnDestroy() {
    this.unsub();
  }

  public reload() {
    this.unsub();
    this.sub = this.publications.list().subscribe(this.feed);
  }

  private unsub() {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    this.sub = null;
  }
}
