// Class to handle child process used for running FFmpeg

const child_process = require('child_process');
const { EventEmitter } = require('events');

const { createSdpText } = require('./sdp');
const { convertStringToStream } = require('./utils');
const dotenv = require('dotenv');
const s3FolderUpload = require('s3-folder-upload');
const axios = require('axios');

dotenv.config();
const RECORD_FILE_LOCATION_PATH = process.env.RECORD_FILE_LOCATION_PATH || './files';
const credentials = {
  "accessKeyId": process.env.AWS_ACCESS_KEY_ID,
  "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY,
  "region": process.env.S3_REGION,
  "bucket": process.env.S3_BUCKET
}
const bucketRootPath = 'live-study-reocrd'

module.exports = class FFmpeg {
  constructor(rtpParameters, callback) {
    this._rtpParameters = rtpParameters;
    this._process = undefined;
    this._mkdirProcess = undefined;
    this._convertProcess = undefined;
    this._cleanupProcess = undefined;
    this._observer = new EventEmitter();
    this.m3u8Link = undefined;
    this._hlsFolderName = rtpParameters.fileName;
    this._localFolderPath = `${RECORD_FILE_LOCATION_PATH}/${this._hlsFolderName}`;
    this._bucketFolderPath = `${bucketRootPath}/${this._hlsFolderName}`;
    this._options = {
      useFoldersForFileTypes: false,
      uploadFolder: this._bucketFolderPath
    };
    this.m3u8Link = `https://${process.env.S3_BUCKET}.s3.ap-northeast-2.amazonaws.com/${this._bucketFolderPath}/playlist.m3u8`;
    callback({
      success: "녹화가 성공적으로 시작되었습니다.",
    });
    this._createProcess();
  }

  _createProcess() {
    const sdpString = createSdpText(this._rtpParameters);
    const sdpStream = convertStringToStream(sdpString);

    console.log('createProcess() [sdpString:%s]', sdpString);

    this._process = child_process.spawn('ffmpeg', this._commandArgs);

    if (this._process.stderr) {
      this._process.stderr.setEncoding('utf-8');

      this._process.stderr.on('data', data =>
        console.log('ffmpeg::process::data [data:%o]', data)
      );
    }

    if (this._process.stdout) {
      this._process.stdout.setEncoding('utf-8');

      this._process.stdout.on('data', data =>
        console.log('ffmpeg::process::data [data:%o]', data)
      );
    }

    this._process.on('message', message =>
      console.log('ffmpeg::process::message [message:%o]', message)
    );

    this._process.on('error', error =>
      console.error('ffmpeg::process::error [error:%o]', error)
    );

    this._process.once('close', () => {
      console.log('ffmpeg::process::close');
      this._observer.emit('process-close');

      this._mkdirProcess = child_process.spawn(
        'mkdir',
        [`${RECORD_FILE_LOCATION_PATH}/${this._hlsFolderName}`]
      );
      this._mkdirProcess.on('exit', (code, signal) => {
        console.log('mkdir process exited with ' + `code ${code} and signal ${signal}`);
        const convertArgs = [
          '-i',
          `${RECORD_FILE_LOCATION_PATH}/${this._hlsFolderName}.webm`,
          '-f',
          'hls',
          '-hls_time',
          '2',
          '-hls_playlist_type',
          'vod',
          '-hls_segment_type',
          'mpegts',
          '-hls_list_size',
          '0',
          `${RECORD_FILE_LOCATION_PATH}/${this._hlsFolderName}/playlist.m3u8`
        ]
        this._convertProcess = child_process.spawn('ffmpeg', convertArgs);
        this._convertProcess.on('exit', async (code, signal) => {
          console.log('ffmpeg process exited with ' + `code ${code} and signal ${signal}`);
          if (code === 0) {
            s3FolderUpload(this._localFolderPath, credentials, this._options)
              .then(() => {
                // S3한테 this.m3u8Link에 있는 링크를 헌일이 API 서버에 prepared=true로 바꿔달라는 요청 보내기
                child_process.exec(`cd files && rm -rf ${this._hlsFolderName} && rm ${this._hlsFolderName}.webm`);
              })
              .catch(e => {
                console.log("Error happend while uploading to S3: ", e);
              })
          }
        })
        this._convertProcess.on('error', data => {
          console.log(data);
        })
        this._convertProcess.stdout.on('data', data => {
          console.log(`child stdout:\n${data}`);
        })
        this._convertProcess.stderr.on('data', data => {
          console.log(`child stderr:\n${data}`);
        })
      })
    });

    sdpStream.on('error', error =>
      console.error('sdpStream::error [error:%o]', error)
    );

    // Pipe sdp stream to the ffmpeg process
    sdpStream.resume();
    sdpStream.pipe(this._process.stdin);
  }

  kill() {
    console.log('kill() [pid:%d]', this._process.pid);
    this._process.kill('SIGINT');
  }

  get _commandArgs() {
    let commandArgs = [
      '-loglevel',
      'debug',
      '-protocol_whitelist',
      'pipe,udp,rtp',
      '-fflags',
      '+genpts',
      '-f',
      'sdp',
      '-i',
      'pipe:0'
    ];

    commandArgs = commandArgs.concat(this._videoArgs);
    commandArgs = commandArgs.concat(this._audioArgs);

    commandArgs = commandArgs.concat([
      /*
      '-flags',
      '+global_header',
      */
      `${RECORD_FILE_LOCATION_PATH}/${this._rtpParameters.fileName}.webm`
    ]);

    console.log('commandArgs:%o', commandArgs);

    return commandArgs;
  }

  get _videoArgs() {
    return [
      '-map',
      '0:v:0',
      '-c:v',
      'copy'
    ];
  }

  get _audioArgs() {
    return [
      '-map',
      '0:a:0',
      '-strict', // libvorbis is experimental
      '-2',
      '-c:a',
      'copy'
    ];
  }
}
