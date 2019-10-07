import { setGlobalTimeMeasurer } from 'shared/src/framework/time-measure'

setGlobalTimeMeasurer(() => {
    const time = process.hrtime()
    return (time[0]*1000 + time[1]/1e6)
})