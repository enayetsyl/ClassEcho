import { createLogger, format, transports } from 'winston'
import fs from 'fs'
import path from 'path'

const isProd = process.env.NODE_ENV === 'production'

// Union type of the two transport-instance interfaces Winston provides
type WinstonTransport =
  | transports.ConsoleTransportInstance
  | transports.FileTransportInstance

// Start with console only
const transportList: WinstonTransport[] = [
  new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  })
]

if (!isProd) {
  // In dev (or any non-prod) create logs/ and add file transports
  const logsDir = path.resolve(process.cwd(), 'logs')
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
  }

  transportList.push(
    new transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logsDir, 'combined.log') })
  )
}

const logger = createLogger({
  level: isProd ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: transportList,
  exitOnError: false,
})

export default logger
