
/*  ------------------------------------------------------------------------------------
    webcrawler.js

    Usage: 
    const webcrawler = require('./webcrawler');
    let req = {
        "urlTarget": "https://therecount.github.io/interview-materials/project-a/1.html"
    };

    { 
        req: {
            method: 'get',
            url: urlTarget
        },
        errors: [],
        results: [],
        visited: []
    }  = await webcrawler.test(req);

    ------------------------------------------------------------------------------------- */
const axios = require("axios");
const cheerio = require("cheerio"); // Jquery Emulator for Node

module.exports = {
    test: async function (apiRequest) {
        let retVal = null;
        try {
            retVal = await webCrawler.execute(apiRequest);
        }
        catch (e) {
            if (e.message) {
                retVal = e.message;
            }
            else {
                retVal = "webcrawler.test().Exception = UNKNOWN...";
            }
            console.log(retVal);
        }
        return retVal;
    },
}

var webCrawler = {
    execute: async function (api) {
        api = api || {};
        api.visited = [];
        api.results = [];
        api.errors = [];
        api.req = {
            method: 'get',
            url: api.urlTarget
        };
        return await this.crawler(api.req.url, api);

    },
    crawler: async function (url, api) {
        let retVal = [];
        if (!this.isVisited(url, api)) {
            api.visited.push(url);

            let req = { method: 'get', url: url };
            let res = await webCrawler.Html(req, err => {
                console.log(err);
                return err;
            });

            if (res.isAxiosError || res.status != 200) {
                api.errors.push({ "url": url, err: (res.message ? res.message : "Unknown Error Loading Page") });
                return retVal;
            }

            let $ = cheerio.load(res.data);
            let links = $('a');
            for (const link of links) {
                if (link.attribs && link.attribs.href) {
                    let urlLink = this.urlFromLink(req.url, link.attribs.href.trim());
                    if (urlLink) {
                        await this.crawler(urlLink, api);
                    }
                }
            }
            api.results = api.results.concat(this.phoneNumsFromHTML(res.data));
        }
        return api
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
        arrNums = html.match(/[0-9]{3}[- .]?[0-9]{3}[- .]?[0-9]{4}/g);    // Rudimentary US style number match
        if (arrNums) {
            arrNums.forEach((candidate) => {
                retVal.push(candidate);
            });
        }
        return retVal;
    },
    urlFromLink: function (url, href) {
        let urlReq = new URL(url);
        let urlLink = new URL(href, url);
        let verb = urlLink.href.substring(urlLink.href.lastIndexOf("/") + 1) || '';
        if (urlLink.protocol != urlReq.protocol) {
            return null;                                    // different protocol (javascript, tel etc..)
        }
        else if (urlReq.hostname == urlLink.hostname) {     // internal
            if (verb.startsWith("#")) {
                return null;                                // Relative within page
            }
            return urlLink.href;
        }
        else {
            return null; //urlLink.href;                    // external off for now...
        }
    },
    Html: async function (req, fnError) {
        return axios(req).catch(async function (err) {
            if (fnError) {
                return fnError(err);
            }
        }.bind(this));
    }
}
