import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";

import { PublicationsComponent } from "./publications/publications.component";
import { PublicationDetailsComponent } from "./publications/publication-details.component";
import { PublicationRenderComponent } from "./publications/publication-render.component";

const routes: Routes = [
    { path: "", redirectTo: "/publications", pathMatch: "full" },
    { path: "publications", component: PublicationsComponent },
    { path: "publications/:id", component: PublicationDetailsComponent },
    { path: "publications/:id/render", component: PublicationRenderComponent },
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule],
})
export class AppRoutingModule { }
