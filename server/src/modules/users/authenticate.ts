import { Client } from "ldapts";
import { config } from "../../config/config";


export default class LDAPService {
	private static CONFIG = config.LDAP;

  private static escapeFilter(value: string) {
    const map: Record<string, string> = {
      '\0': '\\00',
      '(': '\\28',
      ')': '\\29',
      '*': '\\2a',
      '\\': '\\5c',
    }
    return value.replace(/[\0\(\)\*\\]/g, c => map[c] ?? c)
  }


  static async getInfo(username: string): Promise<any | number> {
    const client = new Client({ url: LDAPService.CONFIG.url, timeout: 10000, connectTimeout: 10000 });
    try {
      // 1️⃣ Bind as the service account to search for the user's DN
      await client.bind(LDAPService.CONFIG.bindDN, LDAPService.CONFIG.bindPW);

      const opts = {
        scope: "sub" as const,
        filter: `(cn=${LDAPService.escapeFilter(username)})`,
        attributes: ["*"],
        paged: true,
        sizeLimit: 1,
      };

      let userDN: string | null = null; 
 
      let userInfo: any = null; 
 
      for (const base of LDAPService.CONFIG.searchBases) { 
        const { searchEntries } = await client.search(base, opts); 
        console.log(searchEntries) 
 
        if (searchEntries.length) { 
          userDN = searchEntries[0]?.dn ?? null; 
          userInfo = searchEntries[0]; 
          return userInfo; 
        } 
      }

      if (!userDN) {
        return 404;
      }

      await client.unbind();
      await client.bind(userDN);
      return 200;
    } catch (err: any) {
      console.log("getInfo error")
      console.log(err)
      return 500;
    } finally {
      try {
        await client.unbind();
      } catch {}
    }
  }

  static async login(username: string, password: string): Promise<number> {
    const client = new Client({ url: LDAPService.CONFIG.url, timeout: 10000, connectTimeout: 10000 });

    try {
      // 1️⃣ Bind as the service account to search for the user's DN
      await client.bind(LDAPService.CONFIG.bindDN, LDAPService.CONFIG.bindPW);

      const opts = {
        scope: "sub" as const,
        filter: `(cn=${LDAPService.escapeFilter(username)})`,
        attributes: ["dn"],
        paged: true,
        sizeLimit: 1,
      };

      let userDN: string | null = null;

      for (const base of LDAPService.CONFIG.searchBases) {
        const { searchEntries } = await client.search(base, opts);
        if (searchEntries.length) {
          userDN = searchEntries[0]?.dn ?? null;
          break;
        }
      }

      if (!userDN) {
        return 404;
      }

      await client.unbind();
      await client.bind(userDN, password);
      return 200;
    } catch (err: any) {
      console.log("login error")
      console.log(err)
      return 401;
    } finally {
      try {
        await client.unbind();
      } catch {}
    }
  }
}


// LDAPService.getInfo('20230266').then(status => {
// 	console.log(`Info status for '20230252': ${status}`)
// })