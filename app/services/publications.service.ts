import { Injectable } from "@angular/core";
import { JSON as TA_JSON } from 'ta-json';
import { Publication } from 'r2-shared-js/dist/es8-es2017/src/models/publication';
import { map } from 'rxjs/operators/map';

import { BackendService } from "./backend.service";

@Injectable()
export class PublicationService {
  constructor(private backend: BackendService) {}

  public list() {
    return this.backend
      .get('pub/')
      .pipe(
        map((res) => res.json()),
      );
  }
}
