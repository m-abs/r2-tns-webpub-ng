import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Publication } from 'r2-shared-js/dist/es8-es2017/src/models/publication';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { combineLatest } from 'rxjs/operators//combineLatest';
import { map } from 'rxjs/operators/map';
import { Subscription } from 'rxjs/Subscription';
import { SwipeDirection, SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { EventData } from 'tns-core-modules/ui/page';

import { PublicationService } from '../services/publications.service';

@Component({
  moduleId: module.id,
  selector: 'ns-publication-render',
  templateUrl: 'publication-render.component.html',
})
export class PublicationRenderComponent implements OnInit {
  public readonly item$ = new BehaviorSubject<Publication>(null);
  public readonly spineIdx$ = new BehaviorSubject<number>(0);

  public readonly href = this.item$
    .pipe(
      combineLatest(this.spineIdx$),
      map(([item, spineIdx]) => {
        if (!item) {
          return null;
        }

        if (!item.Spine || !item.Spine[spineIdx]) {
          return null;
        }

        return this.resourceUrl(item.Spine[spineIdx].Href);
      })
    );

  public sub: Subscription;

  private get id() {
    return this.route.snapshot.params['id'];
  }

  private get baseUrl() {
    return this.publications.baseUrl(this.id);
  }

  constructor(
    private readonly publications: PublicationService,
    private readonly route: ActivatedRoute,
  ) {}

  public ngOnInit() {
    this.sub = this.publications
      .metadataJson(this.id)
      .subscribe(
        (item) => this.item$.next(item),
        (err) => console.error(err));
  }

  public resourceUrl(href: string) {
    if (!this.id || !href) {
      return null;
    }

    return this.publications.resourceUrl(this.id, href);
  }

  public onSwipe(args: SwipeGestureEventData) {
    switch (args.direction) {
      case SwipeDirection.left: {
        return this.prev();
      }
      case SwipeDirection.right: {
        return this.next();
      }
    }
  }

  public prev() {
    this.spineIdx$.next(Math.max(0, this.spineIdx$.value - 1));
  }

  public next() {
    this.spineIdx$.next(this.spineIdx$.value + 1);
  }

  public webviewPageLoaded(url: string) {
    const idx = url.indexOf(this.baseUrl);
    if (idx !== 0) {
      console.error(`Unknown url?: ${url}`);
      return;
    }

    const path = url.substr(this.baseUrl.length + 1).split('#')[0];
    const spine = this.item$.value.Spine;
    for (let i = 0; i < spine.length; i += 1) {
      const spineItem = spine[i];
      if (spineItem.Href === path) {
        this.spineIdx$.next(i);
        return;
      }
    }
  }
}
