import { Injectable } from "@angular/core";
import { JSON as TA_JSON } from 'ta-json';
import { Publication } from 'r2-shared-js/dist/es8-es2017/src/models/publication';
import { map } from 'rxjs/operators/map';
import { of } from 'rxjs//observable/of';
import 'rxjs/add/operator/do';

import { BackendService } from "./backend.service";
import { Observable } from "tns-core-modules/ui/frame/frame";

@Injectable()
export class PublicationService {
  private readonly metadataJsonCached = new Map<string, any>();

  constructor(private backend: BackendService) {}

  public list() {
    return this.backend
      .get('pub/')
      .pipe(
        map((res) => res.json()),
      );
  }

  public metadataJson(id: string) {
    if (this.metadataJsonCached.has(id)) {
      return of(this.metadataJsonCached.get(id));
    }

    return this.backend
      .get(`pub/${id}/manifest.json`)
      .pipe(
        map((res) => res.json()),
      )
      .do((data) => this.metadataJsonCached.set(id, data));
  }
}
