import dotenv from 'dotenv'
dotenv.config()

interface Config {
    PORT: number,
    JWT_SECRET: string,
    MONGO_URI: string,
    PASSWORD_SALT: number,
    DOMEN: string,
    LDAP: {
        url: string,
        bindDN: string,
        bindPW: string,
        searchBases: string[]
    }
}

export const config: Config = {
    PORT: Number(process.env.PORT) || 3000,
    JWT_SECRET: process.env.JWT_SECRET_ADMIN || "secret",
    MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/htlgram",
    PASSWORD_SALT: Number(process.env.PASSWORD_SALT) || 10,
    DOMEN: process.env.DOMEN || "*",
    LDAP: {
        url: process.env.LDAP_URL ?? "",
        bindDN: process.env.LDAP_BIND_DN ?? "",
        bindPW: process.env.LDAP_BIND_PW ?? "",
        searchBases: process.env.LDAP_SEARCH_BASES ? process.env.LDAP_SEARCH_BASES.split(";"): []
    }
}