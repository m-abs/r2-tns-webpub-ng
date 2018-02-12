import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { WebViewInterface } from 'nativescript-webview-interface';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import * as nsApp from 'tns-core-modules/application';
import * as fs from 'tns-core-modules/file-system';
import { WebView } from 'tns-core-modules/ui/web-view';

import { SwipeDirection, SwipeGestureEventData } from 'tns-core-modules/ui/gestures/gestures';
import { PublicationService } from '../services/publications.service';

let jsDataFilePath = 'tns_modules/nativescript-webview-interface/www/nativescript-webview-interface.js';
if (global.TNS_WEBPACK) {
  jsDataFilePath = 'assets/js/nativescript-webview-interface.js';
}

let webviewInterfaceJsData: string;
fs.knownFolders
  .currentApp()
  .getFile(jsDataFilePath)
  .readText()
  .then((data) => webviewInterfaceJsData = data);

declare var android: any;
declare function escape(input: string): string;

@Component({
  moduleId: module.id,
  selector: 'ns-webview, [ns-webview]',
  templateUrl: 'webview.component.html',
})
export class WebviewComponent implements OnInit, OnDestroy {
  @ViewChild('webview')
  public webviewEl: ElementRef;

  @Input()
  public set src(src: string) {
    this._src = src;

    if (!this.suspendLoading && this.webview && this.webview.src !== src) {
      this.webview.src = src;
    }
  }

  @Output()
  public readonly webviewSwipe = new EventEmitter<SwipeGestureEventData>();

  @Output()
  public readonly webviewPageLoaded = new EventEmitter<string>();

  public get src() {
    return this._src;
  }

  private get webview() {
    return this.webviewEl && this.webviewEl.nativeElement as WebView;
  }

  private webviewInterface: WebViewInterface;
  private _src: string;

  private suspendLoading = false;

  private readonly androidBackPressed = (evt: nsApp.AndroidActivityBackPressedEventData) => {
    if (!this.webview) {
      return;
    }

    if (this.webview.canGoBack) {
      evt.cancel = true;
      this.webview.goBack();
    }
  }

  public ngOnInit(): void {
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
      webview.src = this.src || '';
      this.webviewInterface = new WebViewInterface(webview);

      if (webview.android) {
        const settings = webview.android.getSettings();
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setSupportZoom(false);
        (<any>android.webkit.WebView).setWebContentsDebuggingEnabled(true);
      }
  }

  public webViewLoadFinished(args: any) {
    const webview = args.object as WebView;
    if (args.error || !args.url) {
      return;
    }

    this.suspendLoading = true;
    this.webviewPageLoaded.next(args.url);

    if (webview.android) {
      webview.android.loadUrl(`javascript:${escape(webviewInterfaceJsData)}`);
    } else if (webview.ios) {
      webview.ios.stringByEvaluatingJavaScriptFromString(webviewInterfaceJsData);
    }

    setTimeout(() => this.suspendLoading = false, 50);
  }

  public onSwipe(evt: SwipeGestureEventData) {
    this.webviewSwipe.emit(evt);
  }
}
