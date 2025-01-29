import { pageInterface } from '../pageInterface';

export const GojoWTF: pageInterface = {
  name: 'Gojo',
  domain: ['https://gojo.wtf'],
  languages: ['English'],
  type: 'anime',

  isSyncPage(url) {
    return (
      utils.urlPart(url, 3) === 'watch' &&
      utils.urlPart(url, 4) !== '' && // Ensure there's an ID after /watch/
      utils.urlParam(url, 'ep') !== null
    );
  },

  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'info' && utils.urlPart(url, 4) !== '';
  },

  sync: {
    getTitle(url) {
      return j.$('.title a').first().text();
    },

    getIdentifier(url) {
      return utils.urlPart(url, 4); // Extract ID from /watch/{id}
    },

    getOverviewUrl(url) {
      const id = utils.urlPart(url, 4);
      const href = `https://${window.location.hostname}/info/${id}`;
      return href ? utils.absoluteLink(href, GojoWTF.domain) : '';
    },

    getEpisode(url) {
      const ep = utils.urlParam(url, 'ep');
      return ep ? Number(ep) : NaN;
    },

    nextEpUrl(url) {
      const id = utils.urlPart(url, 4);
      const totalEpisodeNumber = `${j.$("select option[value*='-']").last().val()}`.split('-');
      const nextEpisodeNumber = GojoWTF.sync.getEpisode(url) + 1;
      let href;

      if (totalEpisodeNumber.length > 1 && nextEpisodeNumber <= Number(totalEpisodeNumber[1]) + 1) {
        href = `https://${window.location.hostname}/watch/${id}?ep=${nextEpisodeNumber}`;
      }

      return href ? utils.absoluteLink(href, GojoWTF.domain) : '';
    },

    getMalUrl(provider) {
      const myanimelistBtn = j.$("a[href^='https://myanimelist.net']");
      const anilistBtn = j.$("a[href^='https://anilist.co']");

      if (provider === 'ANILIST' && anilistBtn.length > 0) {
        return `${anilistBtn.first().attr('href')}`;
      }

      return myanimelistBtn.length > 0 ? `${myanimelistBtn.first().attr('href')}` : false;
    },
  },

  overview: {
    getTitle(url) {
      return j.$('#root h1').first().text()?.trim() || '';
    },

    getIdentifier(url) {
      return GojoWTF.sync.getIdentifier(url);
    },

    uiSelector(selector) {
      j.$('#root h1').first().after(j.html(selector));
    },

    getMalUrl(provider) {
      return GojoWTF.sync.getMalUrl(provider);
    },
  },

  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    let inte: NodeJS.Timer;
    utils.urlChangeDetect(() => ready());
    j.$(() => ready());

    function ready() {
      page.reset();
      if (!GojoWTF.isSyncPage(window.location.href) && !GojoWTF.isOverviewPage(window.location.href)) return;

      clearInterval(inte);
      inte = utils.waitUntilTrue(
        () => GojoWTF.sync.getTitle(window.location.href) || GojoWTF.overview.getTitle(window.location.href) !== '',
        () => page.handlePage()
      );
    }
  },
};
