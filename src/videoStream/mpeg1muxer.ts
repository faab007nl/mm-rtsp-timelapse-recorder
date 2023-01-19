import * as child_process from "child_process";
import * as EventEmitter from "events";

interface Mpeg1MuxerOptions {
  ffmpegPath: string;
  url: string;
  ffmpegOptions?: { [key: string]: string|number; };
  additionalFlags?: string[];
}

export class Mpeg1Muxer extends EventEmitter {
  private options: Mpeg1MuxerOptions;
  private readonly spawnOptions: string[];
  private stream: child_process.ChildProcessWithoutNullStreams;
  private inputStreamStarted: boolean = false;
  private exitCode: number = 0;

  constructor(options: Mpeg1MuxerOptions) {
    super();
    this.options = options;

    if (this.options.ffmpegOptions !== undefined) {
      for (let key in this.options.ffmpegOptions) {
        if (this.options.additionalFlags === undefined) {
          this.options.additionalFlags = [];
        }
        this.options.additionalFlags.push(key);
        if (String(this.options.ffmpegOptions[key]) !== '') {
          this.options.additionalFlags.push(String(this.options.ffmpegOptions[key]));
        }
      }
    }

    this.spawnOptions = [
      "-rtsp_transport",
      "tcp",
      "-i",
      this.options.url,
      '-f',
      'mpegts',
      '-codec:v',
      'mpeg1video',
      // additional ffmpeg options go here
      ...(this.options.additionalFlags || []),
      '-'
    ];

    this.stream = child_process.spawn(this.options.ffmpegPath, this.spawnOptions, {
      detached: false,
    });

    this.inputStreamStarted = true;

    this.stream.stdout.on('data', (data) => {
      return this.emit('mpeg1data', data)
    });

    this.stream.stderr.on('data', (data) => {
      //return this.emit('ffmpegStderr', data)
    });

    this.stream.on('exit', (code, signal) => {
      if (code === 1) {
        this.exitCode = 1
        return this.emit('exitWithError', {
          code: code,
          message: "RTSP stream exited with error code 1"
        });
      }
    });
  }
}