import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { WebView } from 'tns-core-modules/ui/web-view';
import * as fs from 'tns-core-modules/file-system';
import { WebViewInterface } from 'nativescript-webview-interface';
import { Publication } from 'r2-shared-js/dist/es8-es2017/src/models/publication';
import * as nsApp from 'tns-core-modules/application';

import { Item } from "./item";

declare var android: any;
declare function escape(input: string): string;

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./items.component.html",
})
export class ItemsComponent implements OnInit {
    @ViewChild('webview')
    public webviewEl: ElementRef;

    public get webview() {
      return this.webviewEl.nativeElement as WebView;
    }

    private jsData: string;

    private webviewInterface: WebViewInterface;

    private androidBackPressed = (evt: nsApp.AndroidActivityBackPressedEventData) => {
      if (!this.webview) {
        return;
      }

      if (this.webview.canGoBack) {
        evt.cancel = true;
        this.webview.goBack();
      }
    };

    public ngOnInit(): void {
        let jsDataFilePath = 'tns_modules/nativescript-webview-interface/www/nativescript-webview-interface.js';
        if (global.TNS_WEBPACK) {
          jsDataFilePath = 'assets/js/nativescript-webview-interface.js';
        }

        fs.knownFolders
          .currentApp()
          .getFile(jsDataFilePath)
          .readText()
          .then((data) => this.jsData = data);

        if (nsApp.android) {
          nsApp.android.on(nsApp.AndroidApplication.activityBackPressedEvent, this.androidBackPressed);
        }
    }

    public ngOnDestroy() {
      if (nsApp.android) {
        nsApp.android.removeEventListener(nsApp.AndroidApplication.activityBackPressedEvent, this.androidBackPressed);
      }
    }

    public webViewLoaded(args: any) {
        const webview = args.object as WebView;
        webview.on(WebView.loadFinishedEvent, (args: any) => {
          if (args.error || !args.url) {
            return;
          }

          if (webview.android) {
            webview.android.loadUrl(`javascript:${escape(this.jsData)}`);
          } else if (webview.ios) {
            webview.ios.stringByEvaluatingJavaScriptFromString(this.jsData);
          }
        });

        webview.src = '~/assets/books/twenty/toc.xhtml';
        this.webviewInterface = new WebViewInterface(webview);

        if (webview.android) {
          const settings = webview.android.getSettings();
          settings.setAllowFileAccessFromFileURLs(true);
          settings.setAllowUniversalAccessFromFileURLs(true);
          settings.setSupportZoom(false);
          (<any>android.webkit.WebView).setWebContentsDebuggingEnabled(true);
        }
    }
}
