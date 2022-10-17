function dk(base = 50000, cost = 900 * 1.5) {
    const preMonth = (base + cost) / 12
    let sum = 0
    for (let i = 1; i <= 12; i++) {
        sum = sum + preMonth * (1 + ((12 - i) / 12) * 0.04)
    }
    console.log(sum / base)
}
dk(50000, 900)
dk(50000, 900 * 1.5)
