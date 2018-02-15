
import { MediaTrack, PlaybackEvent, PlaybackEventListener, Playlist as TNSPlaylist, TNSAudioPlayer } from '@nota/nativescript-audioplayer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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

export class TimeCue {
  public id: string;
  public timeMilis: number;
  constructor(id: string, timeMilis: number) {
    this.id = id;
    this.timeMilis = timeMilis;
  }
}

export class AudioTrack {
  public url: string;
  public title: string;
  public artist: string;
  public album: string;
  public albumArtUrl: string;
  public timeCues: TimeCue[];

  constructor(url: string, title: string, artist: string, album: string, albumArtUrt?: string, timeCues?: TimeCue[]) {
    this.url = url;
    this.title = title || '';
    this.artist = artist || '';
    this.album = album || '';
    this.albumArtUrl = albumArtUrt;
    this.timeCues = timeCues;
  }
}

export class Playlist {
  public id: string;
  public tracks: AudioTrack[];

  constructor(id: string, ...tracks: AudioTrack[]) {
    this.id = id;
    this.tracks = tracks;
  }
}

export interface IPlayerService {
  playerState: BehaviorSubject<PlaybackEvent>;
  playing: BehaviorSubject<boolean>;

  /**
   * Prepare a playlist for the next play()
   */
  preparePlaylist(playlist: Playlist, startIndex?: number, startOffset?: number): void;

  /**
   * Load a playlist
   */
  loadPlaylist(playlist: Playlist, startIndex?: number, startOffset?: number): Promise<void>;

  /**
   * ID of the current playlist
   */
  getCurrentPlaylistID(): string;

  /**
   * Start playing.
   */
  play(): Promise<void>;

  /**
   * Pause playback
   */
  pause(): Promise<void>;

  /**
   * Stop playback
   */
  stop(): Promise<void>;

  /**
   * Are we currently playing?
   */
  isPlaying(): Promise<boolean>;

  /**
   * Skip to the next playlist item
   */
  skipForward(): Promise<void>;

  /**
   * Skip to the previous playlist item
   */
  skipBackward(): Promise<void>;

  /**
   * Seek to a timeoffset in a playlistIndex
   */
  seekTo(timeMilis: number, playlistIndex?: number): Promise<void>;

  /**
   * Handle events from player service
   */
  setPlaybackEventListener(listener: PlaybackEventListener): void;

  /**
   * Get the current playlist index
   */
  getCurrentPlaylistIndex(): Promise<number>;

  /**
   * Get the current time offset in the audio-file
   */
  getCurrentTime(): Promise<number>;

  /**
   * Get the duration of the currently playing audio-file
   */
  getCurrentDuration(): Promise<number>;

  destroy(): void;
}
