import { Injectable} from '@angular/core';
import { PlaybackEvent, PlaybackEventListener, Playlist, TNSAudioPlayer } from '@nota/nativescript-audioplayer';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { take } from 'rxjs/operators/take';
import { Subject } from 'rxjs/Subject';

export interface PlaybackEventData {
  /**
   * The PlaybackEvent triggered
   * @type {PlaybackEvent}
   */
  type: PlaybackEvent;
  /**
   * Data object associated with the event
   * @type {*}
   */
  data?: any;
}

export interface PlaybackPosition {
  /**
   * Index in the playlist
   */
  playlistIndex: number;

  /**
   * Current time in the current file
   */
  currentTime: number;

  /**
   * Duration of the current file
   */
  duration: number;
}


@Injectable()
export class PlayerService implements PlaybackEventListener {
  public readonly playbackEvents = new Subject<PlaybackEventData>();
  public readonly playerState = new BehaviorSubject<PlaybackEvent>(PlaybackEvent.Stopped);
  public readonly playing = new BehaviorSubject<boolean>(false);
  public readonly position = new BehaviorSubject<PlaybackPosition>(null);

  private currentPlaylist: Playlist;
  private currentPosition: PlaybackPosition;
  private currentPlaylistId: string;

  /**
   * Get the TNSAudioPlayer without delay.
   * This should not be used expect than there is no other choise
   */
  private get _player() {
    let player: TNSAudioPlayer;

    this.player$
      .pipe(
        take(1)
      )
      .subscribe((p) => player = p);

    return player;
  }

  private readonly player$ = new AsyncSubject<TNSAudioPlayer>();

  private get player() {
    return this.player$.toPromise();
  }

  constructor() {
    this.initTNSPlayer();
  }

  public onPlaybackEvent(evt: PlaybackEvent, data?: any): void {
    this._onPlaybackEvent(evt, data);
  }

  public async getCurrentPlaylistIndex(): Promise<number> {
    const player = await this.player;
    if (!player) {
      return null;
    }

    return player.getCurrentPlaylistIndex();
  }

  public getCurrentPlaylistID(): string {
    return this.currentPlaylistId;
  }

  public async getCurrentTime(): Promise<number> {
    const player = await this.player;
    if (!player) {
      return null;
    }

    return player.getCurrentTime();
  }

  public async getCurrentDuration(): Promise<number> {
    const player = await this.player;
    if (!player) {
      return -1;
    }

    return player.getDuration();
  }


  protected setPlaying(playing: boolean) {
    this.playing.next(!!playing);
  }

  protected updatePosition(position: PlaybackPosition) {
    if (position.currentTime === 0 && position.duration === 0) {
      // Likely still buffering, do not propagate this position.
      return;
    }

    this.position.next(position);
  }


  protected async _onPlaybackEvent(evt: PlaybackEvent, data?: any) {
    switch (evt) {
      case PlaybackEvent.Buffering: {
        this.setPlaying(true);
        this.playerState.next(evt);
        break;
      }
      case PlaybackEvent.Playing: {
        this.setPlaying(true);
        this.playerState.next(evt);
        break;
      }
      case PlaybackEvent.Paused: {
        this.setPlaying(false);
        this.playerState.next(evt);
        break;
      }
      case PlaybackEvent.Stopped: {
        this.setPlaying(false);
        this.playerState.next(evt);
        break;
      }
      case PlaybackEvent.EndOfTrackReached: {
        break;
      }
      case PlaybackEvent.EndOfPlaylistReached: {
        this.setPlaying(false);
        break;
      }
      case PlaybackEvent.TimeChanged: {
        const position: PlaybackPosition = {
          playlistIndex: await this.getCurrentPlaylistIndex(),
          currentTime: await this.getCurrentTime(),
          duration: await this.getCurrentDuration(),
        };

        this.updatePosition(position);

        break;
      }
      case PlaybackEvent.WaitingForNetwork: {
        this.playerState.next(evt);
        break;
      }
      case PlaybackEvent.EncounteredError: {
        this.setPlaying(false);
        this.playerState.next(evt);
        break;
      }
    }

    this.playbackEvents.next({
      data,
      type: evt,
    });
  }


  private async initTNSPlayer() {
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    const aplayer = new TNSAudioPlayer();

    await aplayer.isReady;

    this.player$.next(aplayer);
    this.player$.complete();

    aplayer.setPlaybackEventListener(this);

    return aplayer;
  }
}
