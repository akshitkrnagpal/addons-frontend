/* @flow */
import config from 'config';
import * as React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { getCanonicalURL } from 'amo/utils';
import { hrefLangs } from 'core/languages';
import type { AppState } from 'amo/store';

type Props = {|
  prependClientApp?: boolean,
  to: string,
|};

type InternalProps = {|
  ...Props,
  _config: typeof config,
  _hrefLangs: typeof hrefLangs,
  clientApp: string,
  lang: string,
|};

export class HrefLangBase extends React.PureComponent<InternalProps> {
  static defaultProps = {
    _config: config,
    _hrefLangs: hrefLangs,
    prependClientApp: true,
  };

  render() {
    const {
      _config,
      _hrefLangs,
      clientApp,
      lang,
      prependClientApp,
      to,
    } = this.props;

    if (_config.get('unsupportedHrefLangs').includes(lang)) {
      return null;
    }

    const hrefLangsMap = _config.get('hrefLangsMap');
    const path = prependClientApp ? `/${clientApp}${to}` : to;

    return (
      <Helmet>
        {_hrefLangs.map((hrefLang) => {
          const locale = hrefLangsMap[hrefLang] || hrefLang;
          const locationPathname = `/${locale}${path}`;

          return (
            <link
              href={getCanonicalURL({ _config, locationPathname })}
              hrefLang={hrefLang}
              key={hrefLang}
              rel="alternate"
            />
          );
        })}
      </Helmet>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    clientApp: state.api.clientApp,
    lang: state.api.lang,
  };
};

const HrefLang: React.ComponentType<Props> = compose(connect(mapStateToProps))(
  HrefLangBase,
);

export default HrefLang;
