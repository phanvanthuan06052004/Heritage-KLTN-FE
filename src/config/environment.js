/* global process */
import 'dotenv/config'

export const env = {
    BUILD_MODE: typeof process !== 'undefined' ? process.env.BUILD_MODE : undefined,
    WEBSITE_DOMAIN_DEVELOPMENT: typeof process !== 'undefined' ? process.env.WEBSITE_DOMAIN_DEVELOPMENT : undefined,
    WEBSITE_DOMAIN_PRODUCTION: typeof process !== 'undefined' ? process.env.WEBSITE_DOMAIN_PRODUCTION : undefined
}