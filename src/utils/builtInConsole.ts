const builtInConsole = {
    log: console.log.bind(console),
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console),
    trace: console.trace.bind(console),
    dir: console.dir.bind(console),
    dirxml: console.dirxml.bind(console),
    table: console.table.bind(console),
    group: console.group.bind(console),
    groupCollapsed: console.groupCollapsed.bind(console),
    groupEnd: console.groupEnd.bind(console),
    count: console.count.bind(console),
    countReset: console.countReset.bind(console),
    time: console.time.bind(console),
    timeEnd: console.timeEnd.bind(console),
    timeLog: console.timeLog.bind(console),
    clear: console.clear.bind(console),
    assert: console.assert.bind(console),
};

export default builtInConsole;