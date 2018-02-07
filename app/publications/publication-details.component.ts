import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Publication } from "r2-shared-js/dist/es8-es2017/src/models/publication";

import { PublicationService } from "../services/publications.service";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Subscription } from "rxjs/Subscription";

@Component({
  moduleId: module.id,
  selector: 'ns-publication-details',
  templateUrl: 'publication-details.component.html',
})
export class PublicationDetailsComponent {
  public readonly item = new BehaviorSubject<any>(null);

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
}
