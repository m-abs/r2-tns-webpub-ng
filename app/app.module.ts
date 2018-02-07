import 'nativescript-nodeify';

import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptHttpModule } from "nativescript-angular/http";

import { AppRoutingModule } from "./app.routing";
import { AppComponent } from "./app.component";
import { BackendService } from './services/backend.service';
import { PublicationService } from './services/publications.service';
import { PublicationsComponent } from './publications/publications.component';
import { PublicationDetailsComponent } from './publications/publication-details.component';
import { PublicationRenderComponent } from './publications/publication-render.component';

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        NativeScriptHttpModule,
    ],
    declarations: [
        AppComponent,
        PublicationsComponent,
        PublicationDetailsComponent,
        PublicationRenderComponent,
    ],
    providers: [
        BackendService,
        PublicationService,
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule { }
