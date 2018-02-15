import { Injectable, NgZone} from '@angular/core';
import { MediaTrack, PlaybackEvent, PlaybackEventListener, Playlist as TNSPlaylist, TNSAudioPlayer } from '@nota/nativescript-audioplayer';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { take } from 'rxjs/operators/take';
import { Subject } from 'rxjs/Subject';

import { IPlayerService, PlaybackEventData, PlaybackPosition, Playlist } from '../types/player.types';

let instance = 0;
@Injectable()
export class PlayerService implements IPlayerService {
  public readonly instance = ++instance;
  public readonly playbackEvents = new Subject<PlaybackEventData>();
  public readonly playerState = new BehaviorSubject<PlaybackEvent>(PlaybackEvent.Stopped);
  public readonly playing = new BehaviorSubject<boolean>(false);
  public readonly position = new BehaviorSubject<PlaybackPosition>(null);

  private currentPlaylist: Playlist;
  private currentPosition: PlaybackPosition;
  private currentPlaylistId: string;

  /**
   * Other object that will get PlaybackEvents
   */
  public listener: PlaybackEventListener | void;

  /**
   * Increase/decrease the playbase rate
   */
  protected playbackRate: number;

  /**
   * Used to delay loading the playlist till it is needed
   */
  protected preparedPlaylist: {
    playlist: Playlist;
    startIndex?: number;
    startOffset?: number;
  };

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

  constructor(private readonly zone: NgZone) {
    this.initTNSPlayer();
  }

  private async ensurePlayingState() {
    const isPlaying = await this.isPlaying();
    if (this.playing.value !== isPlaying) {
      this.playing.next(isPlaying);
    }
  }

  /**
   * The prepared playlist will be used the next time play() is called
   */
  public preparePlaylist(playlist: Playlist, startIndex?: number, startOffset?: number) {
    this.preparedPlaylist = {
      playlist,
      startIndex,
      startOffset,
    };
  }

  /**
   * Connect a new PlaybackEventListener
   */
  public setPlaybackEventListener(listener: PlaybackEventListener) {
    this.listener = listener;
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

  private async _loadPlaylist(playlist: Playlist, startIndex?: number, startOffset?: number) {
    try {
      const player = await this.player;
      this.currentPlaylist = playlist;
      this.currentPlaylistId = playlist.id;
      player.loadPlaylist(this.generateTNSPlaylist(playlist), startIndex, startOffset);
    } catch (err) {
      console.error(err);
    }
  }

  public async loadPlaylist(playlist: Playlist, startIndex?: number, startOffset?: number) {
    console.log(`TNSPlayerService.loadPlaylist called. # tracks: ${playlist.tracks.length} -> StartAt: ${startIndex} @ ${startOffset}`);

    await this._loadPlaylist(playlist, startIndex, startOffset);
  }

  public async play() {
    try {
      const player = await this.player;

      if (!player) {
        console.error(`TNSPlayerService.play() -> No player`);
      }

      if (this.preparedPlaylist) {
        const {
          playlist,
          startIndex,
          startOffset,
        } = this.preparedPlaylist;

        await this._loadPlaylist(playlist, startIndex, startOffset);
        this.preparedPlaylist = undefined;
      } else {
        // If the android service have been closed, playback will start from the beginning of the book.
        // TODO: This should be fixed in the audioplayer plugin
        const currentPlaylistID = this.getCurrentPlaylistID();
        const playlistIndex = await this.getCurrentPlaylistIndex();
        if (currentPlaylistID && (!playlistIndex || playlistIndex === -1)) {
          if (this.currentPosition && this.currentPlaylist) {
            await this._loadPlaylist(this.currentPlaylist, this.currentPosition.playlistIndex, this.currentPosition.currentTime);
          }
        }
      }

      player.setRate(this.playbackRate);
      player.play();
    } catch (err) {
      console.error(err);
    }
  }

  public async pause() {
    const player = await this.player;
    if (!player) {
      console.error(`TNSPlayerService.pause() -> No player`);
      return;
    }

    player.pause();
  }

  public async isPlaying() {
    const player = await this.player;
    if (!player) {
      return false;
    }

    try {
      return player && player.isPlaying();
    } catch (err) {
      return false;
    }
  }


  public async stop() {
    const player = await this.player;
    if (!player) {
      console.error(`TNSPlayerService.stop() -> No player`);
      return;
    }

    player.stop();
  }

  public async skipForward() {
    const player = await this.player;
    if (!player) {
      console.error(`TNSPlayerService.skipForward() -> No player`);
      return;
    }

    player.skipToNext();
  }

  public async skipBackward() {
    const player = await this.player;
    if (!player) {
      console.error(`TNSPlayerService.skipBackward() -> No player`);
      return;
    }

    player.skipToPrevious();
  }

  public async skipToPlaylistIndexAndTimeMillis(playlistIndex: number, timeMillis: number) {
    console.log(`TNSPlayerService.skipToPlaylistIndexAndTimeMillis(${playlistIndex}, ${timeMillis})`);

    const player = await this.player;
    if (!player) {
      console.error(`TNSPlayerService.skipToPlaylistIndexAndTimeMillis(${playlistIndex}, ${timeMillis}) -> No player`);
      return;
    }

    try {
      player.skipToPlaylistIndexAndOffset(playlistIndex, timeMillis);
    } catch (err) {
      console.error(err);
    }

    this.updatePosition({
      currentTime: timeMillis,
      duration: 0,
      playlistIndex,
    });
  }

  public async seekTo(timeMillis: number) {
    const player = await this.player;
    if (!player) {
      console.error(`TNSPlayerService.seekTo(${timeMillis}) -> No player`);
    }

    player.seekTo(timeMillis);
  }

  public async seekRelative(timeMillis: number) {
    const player = await this.player;
    if (!player) {
      console.error(`TNSPlayerService.seekRelative(${timeMillis}) -> No player`);
    }

    player.seekRelative(timeMillis);
  }

  protected setPlaying(playing: boolean) {
    this.playing.next(!!playing);
  }

  public destroy() {
    console.log(`TNSPlayerService.destroy(): this.player? ${!!this._player}`);

    if (this._player) {
      this._player.destroy();
      delete this.listener;
    }
  }

  protected updatePosition(position: PlaybackPosition) {
    if (position.currentTime === 0 && position.duration === 0) {
      // Likely still buffering, do not propagate this position.
      return;
    }

    this.zone.run(() => this.position.next(position));
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
        const position = {
          playlistIndex: await this.getCurrentPlaylistIndex(),
          currentTime: await this.getCurrentTime(),
          duration: await this.getCurrentDuration(),
        } as PlaybackPosition;

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

  /**
   * Helper function to convert Playlist-object to a TNSPlaylist
   */
  private generateTNSPlaylist(playlist: Playlist): TNSPlaylist {
    const pl = new TNSPlaylist(playlist.id);
    for (const track of playlist.tracks) {
      pl.tracks.push(new MediaTrack(track.url, track.title, track.artist, track.album, track.albumArtUrl));
    }
    return pl;
  }
}
