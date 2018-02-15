import { MediaOverlayNode } from 'r2-shared-js/dist/es8-es2017/src/models/media-overlay';

export interface MediaOverlayResponse {
  'media-overlay': MediaOverlayNode[];
}

export class MediaOverlay {
  public readonly audioHrefs = [] as string[];
  public readonly audioHrefToIdx = new Map<string, number>();

  public readonly children = [] as MediaOverlayChild[];
  public readonly audioPlaylistIdxToChildrens = new Map<number, MediaOverlayChild[]>();
  public readonly textHrefToChildren = new Map<string, MediaOverlayChild[]>();
  constructor(private readonly raw: MediaOverlayResponse, path?: string) {
    for (const node of raw['media-overlay']) {
      for (const child of node.Children) {
        if (!child.Audio) {
          continue;
        }

        const item = new MediaOverlayChild(child);
        const audioLocalUri = item.audioHref;
        const textLocalUri = item.textHref;
        item.audioPlaylistIdx = this.audioHrefToIdx.get(audioLocalUri);
        if (item.audioPlaylistIdx === undefined) {
          item.audioPlaylistIdx = this.audioHrefs.length;
          this.audioHrefToIdx.set(audioLocalUri, this.audioHrefs.length);
          this.audioHrefs.push(audioLocalUri);
        }

        if (!this.audioPlaylistIdxToChildrens.has(item.audioPlaylistIdx)) {
          this.audioPlaylistIdxToChildrens.set(item.audioPlaylistIdx, []);
        }
        this.audioPlaylistIdxToChildrens.get(item.audioPlaylistIdx).push(item);

        if (!this.textHrefToChildren.has(item.textHref)) {
          this.textHrefToChildren.set(item.textHref, []);
        }
        this.textHrefToChildren.get(item.textHref).push(item);

        this.children.push(item);
      }
    }
  }
}

export class MediaOverlayChild {
  public get role() {
    return this.raw.Role;
  }

  public get text() {
    return this.raw.Text || '';
  }

  public get audio() {
    return this.raw.Audio || '';
  }

  public get audioHref() {
    const [audioHref] = this.audio.split('#');
    return audioHref;
  }

  public get time() {
    const [, time] = this.audio.split('#');
    const m = time.match(/t=([0-9]+(?:\.[0-9]+)?),([0-9]+(?:\.[0-9]+)?)/);
    if (!m) {
      return null;
    }

    const start = Number(m[1].replace('.', ''));
    const end = Number(m[2].replace('.', ''));
    return {
      start,
      end,
    };
  }

  public get textHref() {
    const [textHref] = this.text.split('#');
    return textHref;
  }

  public get textId() {
    const [, id] = this.text.split('#');
    return id;
  }

  public audioPlaylistIdx: number;

  constructor(public readonly raw: MediaOverlayNode) {

  }
}
