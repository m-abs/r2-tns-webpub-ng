import { Http } from '@angular/http';
import { Injectable } from '@angular/core';

@Injectable()
export class BackendService {
  private static readonly ENDPOINT = 'http://localhost:3000';

  constructor(private readonly http: Http) {}

  public get(path: string) {
    return this.http
      .get(this.makeURL(path));
  }

  public makeURL(path: string) {
    return `${BackendService.ENDPOINT}/${path}`;
  }
}
