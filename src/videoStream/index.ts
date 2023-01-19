import {Mpeg1Muxer} from "./mpeg1muxer";
import * as EventEmitter from "events";
import {Server as WsServer} from "ws";

interface VideoStreamOptions {
  name: string;
  url: string;
  wsPort: number;
  width?: number;
  height?: number;
  ffmepgOptions?: { [key: string]: string|number; };
  ffmpegPath?: string;
  autoStart?: boolean;
}

export class VideoStream extends EventEmitter {

  private options: VideoStreamOptions;
  private mpeg1Muxer: any;
  private wsServer: WsServer | undefined;
  private stream: any
  private inputStreamStarted: boolean = false;
  private STREAM_MAGIC_BYTES: string = "jsmp";
  private broadcast: ((data: any, opts?: any) => object) | undefined = undefined;
  private streamTimedOut: boolean = false;

  constructor(options: VideoStreamOptions) {
    super();
    this.options = options;
    if (options.autoStart !== undefined && options.autoStart) {
        this.start();
    }
  }

  public start() {
    this.startMpeg1Stream();
    this.pipeStreamToSocketServer();
  }

  public stop() {
    if(this.wsServer) {
        this.wsServer.close();
    }
    this.stream.kill();
    this.inputStreamStarted = false;
    return this;
  }

  public isStreamTimedOut(): boolean {
    return this.streamTimedOut;
  }

  private startMpeg1Stream() {
    this.mpeg1Muxer = new Mpeg1Muxer({
      ffmpegOptions: this.options.ffmepgOptions,
      url: this.options.url,
      ffmpegPath: this.options.ffmpegPath === undefined ? "ffmpeg" : this.options.ffmpegPath
    });
    this.stream = this.mpeg1Muxer.stream;
    if (this.inputStreamStarted) {
      return;
    }
    this.mpeg1Muxer.on('mpeg1data', (data: any) => {
      return this.emit('camdata', data);
    });
    let gettingInputData: boolean = false;
    let inputData = [];
    let gettingOutputData: boolean = false;
    this.mpeg1Muxer.on('ffmpegStderr', (data: string) => {
      data = data.toString()
      if (data.indexOf('Input #') !== -1) {
        gettingInputData = true;
      }
      if (data.indexOf('Output #') !== -1) {
        gettingInputData = false;
        gettingOutputData = true;
      }
      if (data.indexOf('frame') === 0) {
        gettingOutputData = false;
      }
      if (gettingInputData) {
        inputData.push(data.toString());
        let size: string[] = data.match(/\d+x\d+/) as string[];
        if (size != null) {
          size = size[0].split('x');
          if (this.options.width == null) {
            this.options.width = parseInt(size[0], 10);
          }
          if (this.options.height == null) {
            return this.options.height = parseInt(size[1], 10);
          }
        }
      }
    });

    let timeoutSet = false;
    this.mpeg1Muxer.on('ffmpegStderr', (data: any) => {
      // disabled console logs about ffmpeg stream

      // Check if stream is available
      let timeout = null;
      if(!timeoutSet) {
        timeoutSet = true;
        timeout = setTimeout(() => {
          this.streamTimedOut = true;
          if(this.wsServer){
            this.emit('streamTimedOut');
          }
        }, 15000);
      }
      if(data.includes("fps=")){
        if(timeout) {
          clearTimeout(timeout);
        }
      }

      return global.process.stderr.write(data);
    });
    this.mpeg1Muxer.on('exitWithError', (data: any) => {
      return this.emit('exitWithError', data);
    });
    return this;
  }

  private pipeStreamToSocketServer() {
    this.wsServer = new WsServer({
      port: this.options.wsPort,
      path: '/stream'
    })
    this.wsServer.on("connection", (socket: any, request: any) => {
      return this.onSocketConnect(socket, request)
    })
    this.broadcast = function(data, opts) {
      let results;
      results = [];
      if (this.wsServer) {
        for (let client of this.wsServer?.clients) {
          if (client.readyState === 1) {
            client.send(data, opts);
            results.push('sent');
          } else {
            // @ts-ignore
            let msg = "Error: Client from remoteAddress " + client.remoteAddress + " not connected.";
            //console.log(msg);
            results.push(msg);
          }
        }
      }
      return results
    }
    return this.on('camdata', (data) => {
        if (this.broadcast) {
          return this.broadcast(data);
        }
        return null;
    })
  }

  private onSocketConnect(socket: any, request: any) {
    let streamHeader = new Buffer(8);
    streamHeader.write(this.STREAM_MAGIC_BYTES);
    if (this.options.width != null) {
      streamHeader.writeUInt16BE(this.options.width, 4);
    }
    if (this.options.height != null) {
      streamHeader.writeUInt16BE(this.options.height, 6);
    }
    socket.send(streamHeader, {
      binary: true
    });
    //console.log(`${this.name}: New WebSocket Connection (` + this.wsServer.clients.size + " total)")

    socket.remoteAddress = request.connection.remoteAddress;

    return socket.on("close", (code: number, message: string) => {
      let size = 0;
      if (this.wsServer) {
          size = this.wsServer.clients.size;
      }

      let msg = `${this.options.name}: Disconnected WebSocket (${size} total)`;
      //console.log(msg);
      return msg;
    });
  }

}