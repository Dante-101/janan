import './setup-logger'
import './setup-time-measurer'

import { setGlobalApiClient } from 'shared/src/framework/network/api-client'

import { NodeApiClient } from '../node-api-client'

setGlobalApiClient(NodeApiClient)