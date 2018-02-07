import 'nativescript-nodeify';

import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { AppRoutingModule } from "./app.routing";
import { AppComponent } from "./app.component";

import { ItemsComponent } from "./item/items.component";

// Uncomment and add to NgModule imports if you need to use two-way binding
// import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { NativeScriptHttpModule } from "nativescript-angular/http";
import { BackendService } from './services/backend.service';
import { PublicationService } from './services/publications.service';
import { PublicationsComponent } from './publications/publications.component';

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
        ItemsComponent,
        PublicationsComponent,
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
