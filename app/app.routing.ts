import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";

import { PublicationsComponent } from "./publications/publications.component";

const routes: Routes = [
    { path: "", redirectTo: "/publications", pathMatch: "full" },
    { path: "publications", component: PublicationsComponent },
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
