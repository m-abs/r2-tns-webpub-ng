import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MediaOverlayNode } from 'r2-shared-js/dist/es8-es2017/src/models/media-overlay';
import { Publication } from 'r2-shared-js/dist/es8-es2017/src/models/publication';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { of } from 'rxjs/observable/of';
import { combineLatest } from 'rxjs/operators/combineLatest';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { filter } from 'rxjs/operators/filter';
import { map } from 'rxjs/operators/map';
import { switchMap } from 'rxjs/operators/switchMap';
import { tap } from 'rxjs/operators/tap';
import { Subscription } from 'rxjs/Subscription';
import { SwipeDirection, SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { EventData, Observable } from 'tns-core-modules/ui/page';

import { PlayerService } from '../services/player.service';
import { PublicationService } from '../services/publications.service';
import { MediaOverlay } from '../types/mediaoverlay.types';
import { AudioTrack, Playlist } from '../types/player.types';

@Component({
  moduleId: module.id,
  selector: 'ns-publication-render',
  templateUrl: 'publication-render.component.html',
  providers: [
    PlayerService,
  ],
})
export class PublicationRenderComponent implements OnInit, OnDestroy {
  public readonly item$ = new BehaviorSubject<Publication>(null);
  public readonly spineIdx$ = new BehaviorSubject<number>(0);

  public readonly link$ = this.item$
    .pipe(
      map((item) => {
        if (!item) {
          return null;
        }

        return item.Links || [];
      }),
    );

  public readonly mediaOverlay = new BehaviorSubject<MediaOverlay>(null);

  public readonly href = this.item$
    .pipe(
      combineLatest(
        this.spineIdx$,
        this.player.position,
        this.mediaOverlay,
      ),
      map(([item, spineIdx, position, mediaOverlay]) => {
        if (!item) {
          return null;
        }

        if (!mediaOverlay || !position) {
          if (!item.Spine || !item.Spine[spineIdx]) {
            return null;
          }

          return this.resourceUrl(item.Spine[spineIdx].Href);
        }

        const children = mediaOverlay.audioPlaylistIdxToChildrens.get(position.playlistIndex);
        if (!children) {
          return null;
        }

        for (const child of children) {
          const {start, end} = child.time;
          if (start <= position.currentTime && position.currentTime <= end) {
            return this.resourceUrl(child.text);
          }
        }
        return null;
      }),
      filter((val) => !!val),
      distinctUntilChanged(),
    );

  public subs = [] as Subscription[];

  private get id() {
    return this.route.snapshot.params['id'] as string;
  }

  private get baseUrl() {
    return this.publications.baseUrl(this.id);
  }

  constructor(
    private readonly player: PlayerService,
    private readonly publications: PublicationService,
    private readonly route: ActivatedRoute,
  ) {}

  public ngOnInit() {
    this.subs.push(
      this.publications
        .metadataJson(this.id)
        .subscribe(
          (item) => this.item$.next(item),
          (err) => console.error(err)
        )
      );


    this.subs.push(
      this.link$
        .pipe(
          map((links) => {
            if (!links) {
              return null;
            }

            return links.filter((link) => link.HasRel('media-overlay'));
          }),
          switchMap((mosLink) => {
            if (!mosLink || mosLink.length === 0) {
              return of(null);
            }

            return this.publications.mediaOverlay(this.id, mosLink[0].Href);
          }),
          map((mediaOverlays) => {
            if (!mediaOverlays) {
              return null;
            }

            return new MediaOverlay(mediaOverlays);
          }),
        )
        .subscribe((mos) => {
          if (!mos) {
            this.mediaOverlay.next(null);
            return;
          }

          // List of audio tracks for the playback service
          const audioTracks = [] as AudioTrack[];

          for (const audioHref of mos.audioHrefs) {
            const url = this.publications.resourceUrl(this.id, audioHref);
            audioTracks.push(new AudioTrack(url, null, null, null, null, null));
          }

          const audioPlaylist = new Playlist(this.id, ...audioTracks);
          this.player.loadPlaylist(audioPlaylist);
          this.player.play();

          this.mediaOverlay.next(mos);
        },
        (err) => {
          console.error(err);
        })
    );
  }

  public ngOnDestroy() {
    for (const sub of this.subs || []) {
      sub.unsubscribe();
    }

    this.player.destroy();
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
