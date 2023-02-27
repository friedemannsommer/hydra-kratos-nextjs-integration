import { config, createApiHandler } from '@ory/integrations/next-edge'

export { config }

export default createApiHandler({
    fallbackToPlayground: false,
    dontUseTldForCookieDomain: true
})
