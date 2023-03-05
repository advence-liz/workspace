// 注：和存量保持一致，方法取自helper的uuid
const s = () =>
  Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1)

export const genUUID = () => `${s()}${s()}${s()}`
