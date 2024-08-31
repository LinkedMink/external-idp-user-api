import {
  ConsoleLogger,
  Inject,
  Injectable,
  LoggerService,
  LogLevel as NestLogLevel,
  Scope,
} from "@nestjs/common";
import { Container, format, Logform, transports } from "winston";
import {
  loggingConfigLoad,
  LoggingConfigType,
  LogLevel,
  LogLevels,
} from "../config/logging.config.js";

type ConsoleLoggerPublic = LoggerService & {
  setContext: ConsoleLogger["setContext"];
  resetContext: ConsoleLogger["resetContext"];
  isLevelEnabled: ConsoleLogger["isLevelEnabled"];
};

interface AppTransformableInfo extends Logform.TransformableInfo {
  message: string;
  label: string;
  timestamp: string;
  meta: Record<string, string>;
}

const appPrintf = format.printf as (
  templateFunction: (info: AppTransformableInfo) => string
) => Logform.Format;

@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLoggerService implements ConsoleLoggerPublic {
  private static readonly FormatStack = [
    format.cli({ levels: LogLevels }),
    format.timestamp(),
    appPrintf(info => {
      return `${info.timestamp} ${info.level} ${info.message}`;
    }),
  ];

  private static readonly Loggers = new Container();

  private context;

  constructor(
    @Inject(loggingConfigLoad.KEY)
    private readonly loggingConfig: LoggingConfigType
  ) {
    // if (!WinstonLoggerService.Loggers) {
    //   WinstonLoggerService.Loggers = new Container({
    //     level: loggingConfig.level,
    //     levels: LogLevels,
    //     transports: [new transports.Console()],
    //   });
    // }
    if (!WinstonLoggerService.Loggers.options.level) {
      WinstonLoggerService.Loggers.options = {
        level: loggingConfig.level,
        levels: LogLevels,
        transports: [new transports.Console()],
      };
    }

    this.context = loggingConfig.defaultContext;
  }

  private getLogger = (context = this.context) => {
    if (WinstonLoggerService.Loggers.has(context)) {
      return WinstonLoggerService.Loggers.get(context);
    }

    return WinstonLoggerService.Loggers.add(context, {
      ...WinstonLoggerService.Loggers.options,
      format: format.combine(
        format.label({ label: context, message: true }),
        ...WinstonLoggerService.FormatStack
      ),
    });
  };

  private getLogHandler =
    (level: LogLevel) => (input: string | { message: string }, context?: string) => {
      if (typeof input === "string") {
        return this.getLogger(context)[level](input);
      }

      const { message, ...meta } = input;
      this.getLogger(context)[level](message, meta);
    };

  setContext = (context: string) => {
    this.context = context;
  };

  resetContext = () => {
    this.context = this.loggingConfig.defaultContext;
  };

  isLevelEnabled = (_level: NestLogLevel) => true;

  log = this.getLogHandler("info");
  warn = this.getLogHandler("warn");
  debug = this.getLogHandler("debug");
  verbose = this.getLogHandler("debug");
  fatal = this.getLogHandler("error");

  error = (message: string, stack?: string, context?: string) => {
    this.getLogger(context).error(this.loggingConfig.isStackTraceLogged && stack ? stack : message);
  };

  setLogLevels(_: NestLogLevel[]) {}
}
