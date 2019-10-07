import { setGlobalLogger, setGlobalLogLevel } from 'shared/src/framework/log'

import { NodeLogger } from '../node-logger'

setGlobalLogger(NodeLogger)
setGlobalLogLevel('INFO')