function randomNumber (ln, prefix) {
    const res = []
    if (prefix) res.push(prefix)

    for (let i = 0; i < ln; i++) {
        res.push(Math.floor(Math.random() * 10))
    }
    return res.join('')
}
