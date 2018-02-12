import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from 'nativescript-angular/router';

import { PublicationDetailsComponent } from './publications/publication-details.component';
import { PublicationRenderComponent } from './publications/publication-render.component';
import { PublicationsComponent } from './publications/publications.component';

const routes: Routes = [
    { path: '', redirectTo: '/publications', pathMatch: 'full' },
    { path: 'publications', component: PublicationsComponent },
    { path: 'publications/:id', component: PublicationDetailsComponent },
    { path: 'publications/:id/render', component: PublicationRenderComponent },
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule],
})
export class AppRoutingModule { }
