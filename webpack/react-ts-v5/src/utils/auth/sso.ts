import SSOWeb from '@mtfe/sso-web'

interface SSOWebConfig {
  clientId: string
  accessEnv: 'test' | 'product' | 'ppe'
  callbackUrl?: string
  logoutUri?: string
  includeUrl?: string
  includedUriList?: string
  excludeUriList?: string
  rewriteLocation?: string
  schema?: string
  sameSite?: boolean
}

export const ssoOption: SSOWebConfig = {
  clientId: 'cube',
  accessEnv: 'product',
  rewriteLocation: '/#',
  callbackUrl: '/sso/callback',
  logoutUri: '/sso/logout',
}

const ssoWeb = SSOWeb(ssoOption)
export default ssoWeb
