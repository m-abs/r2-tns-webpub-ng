import { Component, OnInit } from "@angular/core";
import { WebView } from 'tns-core-modules/ui/web-view';
import * as fs from 'tns-core-modules/file-system';
import { WebViewInterface } from 'nativescript-webview-interface';

import { Item } from "./item";
import { ItemService } from "./item.service";

declare var android: any;
declare function escape(input: string): string;

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./items.component.html",
})
export class ItemsComponent implements OnInit {
    jsData: string;

    webviewInterface: WebViewInterface;

    // This pattern makes use of Angular’s dependency injection implementation to inject an instance of the ItemService service into this class. 
    // Angular knows about this service because it is included in your app’s main NgModule, defined in app.module.ts.
    constructor(private itemService: ItemService) { }

    ngOnInit(): void {
        let jsDataFilePath = 'tns_modules/nativescript-webview-interface/www/nativescript-webview-interface.js';
        if (global.TNS_WEBPACK) {
          jsDataFilePath = 'assets/js/nativescript-webview-interface.js';
        }

        fs.knownFolders
          .currentApp()
          .getFile(jsDataFilePath)
          .readText()
          .then((data) => this.jsData = data);
    }

    public webViewLoaded(args: any) {
        const webview = args.object as WebView;
        this.webviewInterface = new WebViewInterface(webview, '');

        if (webview.android) {
          webview.android.loadUrl(`javascript:${escape(this.jsData)}`);

          const settings = webview.android.getSettings();
          settings.setAllowFileAccessFromFileURLs(true);
          settings.setAllowUniversalAccessFromFileURLs(true);
          settings.setSupportZoom(false);
          (<any>android.webkit.WebView).setWebContentsDebuggingEnabled(true);
        } else if (webview.ios) {
          webview.ios.stringByEvaluatingJavaScriptFromString(this.jsData);
        }
    }
}
