import { Injectable } from '@angular/core';
import { OPDSFeed } from 'r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2';
import { MediaOverlayNode } from 'r2-shared-js/dist/es8-es2017/src/models/media-overlay';
import { MediaOverlay } from 'r2-shared-js/dist/es8-es2017/src/models/metadata-media-overlay';
import { Publication } from 'r2-shared-js/dist/es8-es2017/src/models/publication';
import { of } from 'rxjs//observable/of';
import { map } from 'rxjs/operators/map';
import { tap } from 'rxjs/operators/tap';
import { JSON as TA_JSON } from 'ta-json';

import { BackendService } from './backend.service';

@Injectable()
export class PublicationService {
  private readonly metadataJsonCached = new Map<string, any>();

  constructor(private readonly backend: BackendService) {}

  public list() {
    return this.backend
      .get('opds2/publications.json')
      .pipe(
        map((res) => res.text()),
        map((text) => TA_JSON.parse(text, OPDSFeed)),
      );
  }

  public metadataJson(id: string) {
    if (this.metadataJsonCached.has(id)) {
      return of(this.metadataJsonCached.get(id));
    }

    return this.backend
      .get(`pub/${id}/manifest.json`)
      .pipe(
        map((res) => res.text()),
        map((text) => TA_JSON.parse<Publication>(text, Publication)),
        tap(
          (data) => this.metadataJsonCached.set(id, data),
          (err) => this.metadataJsonCached.delete(id),
        ),
      );
  }

  public mediaOverlay(id: string, mediaOverlayHref: string, resource?: string) {
    if (!resource) {
      mediaOverlayHref = mediaOverlayHref.replace('?resource={path}', '');
    } else {
      mediaOverlayHref = mediaOverlayHref.replace('{path}', resource);
    }

    return this.backend
      .get(`pub/${id}/${mediaOverlayHref}`)
      .pipe(
        map((res) => res.json()),
        map((data) => {
          const mediaOverlays = data['media-overlay'].map((mo) => TA_JSON.deserialize(mo, MediaOverlayNode));
          return {
            'media-overlay': mediaOverlays as MediaOverlayNode[],
          };
        }),
      );
  }

  public resourceUrl(id: string, path: string) {
    return `${this.baseUrl(id)}/${path}`;
  }

  public baseUrl(id: string) {
    return this.backend.makeURL(`pub/${id}`);
  }
}
