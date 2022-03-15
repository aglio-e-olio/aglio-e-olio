const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');

const { combine, timestamp, printf, colorize } = winston.format;

const logDir = 'logs'; // logs 디렉토리 하위에 로그 파일 저장

// Define log format
const logFormat = printf(info=>{
    return `${info.timestamp} ${info.level}: ${info.message}`;
});



/**
 * Log Level
 * error: 0. warn: 1. info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */

const logger = winston.createLogger({
    format: combine(
        timestamp({
            format:'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        logFormat,
    ),
    transports:[
        
        // info level
        new winstonDaily({
            level:'info',
            datePattern:'YYYY-MM-DD',
            dirname:logDir,
            filename:`%DATE%.info.log`,
            maxFiles:30, // 30일치 로그 파일 저장
            zippedArchive:true,
        }),
        
        // warn level
        new winstonDaily({
            level:'warn',
            datePattern:'YYYY-MM-DD',
            dirname:logDir+'/warn',
            filename:`%DATE%.warn.log`,
            maxFiles:30,
            zippedArchive:true,
        }),

        // error level
        new winstonDaily({
            level:'error',
            datePattern:'YYYY-MM-DD',
            dirname:logDir + '/error',
            filename:`%DATE%.error.log`,
            maxFiles:30, 
            zippedArchive:true
        }),

        new winstonDaily({
            level:'verbose',
            datePattern:'YYYY-MM-DD',
            dirname:logDir + '/verbose',
            filename:`%DATE%.verbose.log`,
            maxFiles:30,
            zippedArchive:true
        })
    ],
})

// morgan winston 설정
logger.stream = {
    write:message=>{
        logger.info(message);
    }
}


/**
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize({ all: true }), // console 에 출력할 로그 컬러 설정 적용함
            logFormat // log format 적용
        )
    }));
}
 */

module.exports = logger;
