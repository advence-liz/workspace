function retry(func, times) {
    return new Promise(async (reslove, reject) => {
        while (times > 0) {
            try {
                let res = await func()
                reslove(res)
            } catch (error) {
                times--
                if (times === 0) {
                    reject(e)
                }
            }
        }
    })
}
