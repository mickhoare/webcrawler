const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
    test: async function (apiRequest) {
        let retVal = null;
        try {
            retVal = await webCrawler.execute(apiRequest);
        }
        catch (e) {
            if (e.message) {
                console.log(e.message);
            }
            else {
                console.log("test().Exception = UNKNOWN...");
            }
        }
        return retVal;
    },
}

var webCrawler = {
    isInitialized: false,
    counterNumber: 0,
    _autoSaveOff: false,
    execute: async function (api) {
        api = api || {};
        api.visited = [];
        api.req = {
            method: 'get',
            url: api.urlTarget
        };
        retVal = this.crawler(api.req.url, api);

    },
    crawler: async function (url, api) {
        let retVal = [];
        if (!this.isVisited(url, api)) {
            api.visited.push(url);
            let req = {
                method: 'get',
                url: url
            };

            let res = await webCrawler.Html(req);
            let $ = cheerio.load(res.data);
            let links = $('a');
            for (const link of links) {
                if (link.attribs && link.attribs.href) {
                    let urlLink = this.urlFromLink(req.url, link.attribs.href);
                    rec = await this.crawler(urlLink, api);
                    retVal = retVal.concat(rec);
                }
            }
            retVal = this.phoneNumsFromHTML(res.data);
        }
        return retVal
    },
    isVisited: function (url, api) {
        let retVal = false;
        for (const link of api.visited) {
            if (url == link) {
                retVal = true;
                break;
            }
        }
        return retVal;
    },
    phoneNumsFromHTML: function (html) {
        retVal = [];
        arrNums = html.match(/[0-9]{3}[-][0-9]{3}[-][0-9]{4}/g);
        if (arrNums) {
            arrNums.forEach((candidate) => {
                console.log(candidate)
                retVal.push(candidate);
            });
        }
        return retVal;
    },
    urlFromLink: function (url, href) {
        let path = url.substring(0, url.lastIndexOf("/") + 1);
        var urlReq = new URL(url);
        let origin = urlReq.origin;
        if (href.substring(0, 1) == "/") {
            return `${origin}${href}`;
        }
        else if (href.substring(0, 5) == "http:" || href.substring(0, 6) == "https:") {
            return href;
        }
        else {
            return `${path}${href}`;
        }
    },
    Html: async function (req) {
        return axios(req)
    }
}
