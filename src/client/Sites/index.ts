import { Site } from "./Site";
import { DemoSite } from "./DemoSite";
import { HuobiSite } from "./HuobiSite";
import { SerumSite } from "./SerumSite";
import { SiteConfig } from "../../common/config";


export const CreateSite: ((siteConfig: SiteConfig) => Site) = (siteConfig: SiteConfig) => {
    let site: Site;
    if (siteConfig.site_type === "DemoSite") {
        site = new DemoSite();
    }
    else if (siteConfig.site_type === "HuobiSite") {
        site = new HuobiSite();
    }
    else if (siteConfig.site_type === "SerumSite") {
        site = new SerumSite();
    }
    else {
        site = new Site();
    }
    site.m_siteConfig = siteConfig;

    return site;
}

export { Site };
