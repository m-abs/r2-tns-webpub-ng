import { Component } from "@angular/core";

import { PublicationService } from "../services/publications.service";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Subscription } from "rxjs/Subscription";

@Component({
  moduleId: module.id,
  selector: 'ns-publications',
  templateUrl: 'publications.component.html',
})
export class PublicationsComponent {
  public readonly items = new BehaviorSubject<any[]>([]);

  public sub: Subscription;;

  constructor(private publications: PublicationService) {}

  ngOnInit() {
    this.sub = this.publications.list().subscribe(this.items);
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
