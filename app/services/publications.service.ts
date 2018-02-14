import { Injectable } from '@angular/core';
import { OPDSFeed } from 'r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2';
import { initGlobals } from 'r2-shared-js/dist/es8-es2017/src//init-globals';
import { Publication } from 'r2-shared-js/dist/es8-es2017/src/models/publication';
import { of } from 'rxjs//observable/of';
import 'rxjs/add/operator/do';
import { map } from 'rxjs/operators/map';
import { tap } from 'rxjs/operators/tap';
import { JSON as TA_JSON } from 'ta-json';
import { Observable } from 'tns-core-modules/ui/frame/frame';

import { BackendService } from './backend.service';

initGlobals();

@Injectable()
export class PublicationService {
  private readonly metadataJsonCached = new Map<string, any>();

  constructor(private backend: BackendService) {}

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
        map((text) => TA_JSON.parse(text, Publication)),
      )
      .do((data) => this.metadataJsonCached.set(id, data));
  }

  public resourceUrl(id: string, path: string) {
    return `${this.baseUrl(id)}/${path}`;
  }

  public baseUrl(id: string) {
    return this.backend.makeURL(`pub/${id}`);
  }
}
