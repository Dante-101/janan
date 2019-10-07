import '../src/framework/setup/setup'

import { setGlobalLogLevel } from 'shared/src/framework/log'

import { setLogFile } from '../src/framework/node-logger'

setLogFile("logs/shared-node-test.log.json")
setGlobalLogLevel("VERBOSE")