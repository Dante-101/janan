import '../../shared-node/src/framework/setup/setup-logger'
import '../../shared-node/src/framework/setup/setup-time-measurer'

import { setLogFile } from '../../shared-node/src/framework/node-logger'
import { setGlobalLogLevel } from '../src/framework/log'

setLogFile("logs/shared-test.log.json")
setGlobalLogLevel("VERBOSE")