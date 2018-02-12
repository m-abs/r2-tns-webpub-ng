import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

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
