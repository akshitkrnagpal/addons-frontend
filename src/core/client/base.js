/* global document */
import 'core/polyfill';
import { oneLine } from 'common-tags';
import config from 'config';
import FastClick from 'fastclick';
import { createBrowserHistory } from 'history';
import RavenJs from 'raven-js';
import * as React from 'react';
import { render } from 'react-dom';

import Root from 'core/components/Root';
import { langToLocale, makeI18n, sanitizeLanguage } from 'core/i18n/utils';
import log from 'core/logger';
import { addQueryParamsToHistory } from 'core/utils';

export default async function createClient(
  createStore,
  { _FastClick = FastClick, sagas = null } = {},
) {
  // This code needs to come before anything else so we get logs/errors if
  // anything else in this function goes wrong.
  const publicSentryDsn = config.get('publicSentryDsn');
  if (publicSentryDsn) {
    log.info(`Configured client-side Sentry with DSN ${publicSentryDsn}`);
    RavenJs.config(publicSentryDsn, { logger: 'client-js' }).install();
  } else {
    log.warn('Client-side Sentry reporting was disabled by the config');
  }

  _FastClick.attach(document.body);

  const initialStateContainer = document.getElementById('redux-store-state');
  let initialState;

  const html = document.querySelector('html');
  const lang = sanitizeLanguage(html.getAttribute('lang'));
  const locale = langToLocale(lang);
  const appName = config.get('appName');

  if (initialStateContainer) {
    try {
      initialState = JSON.parse(initialStateContainer.textContent);
    } catch (error) {
      log.error('Could not load initial redux data');
    }
  }

  const history = addQueryParamsToHistory({
    history: createBrowserHistory(),
  });
  const { sagaMiddleware, store } = createStore({ history, initialState });

  if (sagas && sagaMiddleware) {
    sagaMiddleware.run(sagas);
  } else {
    log.warn(`sagas not found for this app (src/${appName}/sagas)`);
  }

  let i18nData = {};
  try {
    if (locale !== langToLocale(config.get('defaultLang'))) {
      i18nData = await new Promise((resolve) => {
        // eslint-disable-next-line max-len, global-require, import/no-dynamic-require
        require(`bundle-loader?name=[name]-i18n-[folder]!../../locale/${locale}/${appName}.js`)(
          resolve,
        );
      });
    }
  } catch (e) {
    log.info(oneLine`Locale not found or required for locale: "${locale}".
      Falling back to default lang: "${config.get('defaultLang')}"`);
  }
  const i18n = makeI18n(i18nData, lang);

  const renderApp = (App) => {
    render(
      <Root history={history} i18n={i18n} store={store}>
        <App />
      </Root>,
      document.getElementById('react-view'),
    );
  };

  return { history, renderApp, store };
}
