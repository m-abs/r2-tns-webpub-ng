import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Publication } from 'r2-shared-js/dist/es8-es2017/src/models/publication';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { map } from 'rxjs/operators/map';
import { tap } from 'rxjs/operators/tap';
import { Subscription } from 'rxjs/Subscription';

import { PublicationService } from '../services/publications.service';

@Component({
  moduleId: module.id,
  selector: 'ns-publication-details',
  templateUrl: 'publication-details.component.html',
})
export class PublicationDetailsComponent implements OnInit, OnDestroy {
  public readonly item = new BehaviorSubject<Publication>(null);

  public readonly metadata = this.item
    .pipe(
      map((item) => item && item.Metadata ? item.Metadata : null),
    );

  public readonly resources = this.item
    .pipe(
      map((item) => item && item.Resources ? item.Resources : null),
    );

  public readonly cover = this.resources
    .pipe(
      map((resources) => {
        if (!resources) {
          return null;
        }

        for (const resource of resources) {
          if (resource.Rel && resource.Rel.indexOf('cover') !== -1) {
            return {
              height: resource.Height || 300,
              href: this.resourceUrl(resource.Href),
              width: resource.Width || 300,
            };
          }
        }

        return null;
      }),
    );

  public readonly authors$ = this.metadata
    .pipe(
      map((metadata) => {
        if (!metadata) {
          return;
        }

        if (!metadata.Author) {
          return 'Unknown';
        }

        const authors = metadata.Author;

        return authors.map((author) => typeof author === 'string' ? author : author.Name).join(', ');
      }),
      tap((val) => console.log(val)),
    );

  public readonly title$ = this.metadata
    .pipe(
      map((metadata) => {
        if (!metadata) {
          return;
        }

        return metadata.Title || 'No Title';
      }),
      tap((val) => console.log(val)),
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
