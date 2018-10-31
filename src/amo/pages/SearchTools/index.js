/* @flow */
import config from 'config';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Helmet from 'react-helmet';

import Search from 'amo/components/Search';
import HrefLang from 'amo/components/HrefLang';
import { getCanonicalURL } from 'amo/utils';
import { ADDON_TYPE_OPENSEARCH, SEARCH_SORT_RELEVANCE } from 'core/constants';
import translate from 'core/i18n/translate';
import { convertFiltersToQueryParams } from 'core/searchUtils';
import type { SearchFilters } from 'amo/components/AutoSearchInput';
import type { AppState } from 'amo/store';
import type { I18nType } from 'core/types/i18n';

type Props = {|
  filters: SearchFilters,
|};

type InternalProps = {|
  ...Props,
  _config: typeof config,
  i18n: I18nType,
  locationPathname: string,
|};

export class SearchToolsBase extends React.Component<InternalProps> {
  static defaultProps = {
    _config: config,
  };

  render() {
    const { _config, filters, i18n, locationPathname } = this.props;

    return (
      <React.Fragment>
        <Helmet>
          <link
            rel="canonical"
            href={getCanonicalURL({ locationPathname, _config })}
          />
          <meta
            name="description"
            content={i18n.gettext(`Download Firefox extensions to customize the
              way you search—everything from privacy-enhanced searching to
              website-specific searches, image searching, and more.`)}
          />
        </Helmet>

        <HrefLang to="/search-tools/" />

        <Search
          enableSearchFilters
          filters={filters}
          paginationQueryParams={convertFiltersToQueryParams(filters)}
        />
      </React.Fragment>
    );
  }
}

export function mapStateToProps(state: AppState) {
  const filters = {
    addonType: ADDON_TYPE_OPENSEARCH,
    sort: SEARCH_SORT_RELEVANCE,
  };

  return {
    filters,
    locationPathname: state.router.location.pathname,
  };
}

const SearchTools: React.ComponentType<Props> = compose(
  translate(),
  connect(mapStateToProps),
)(SearchToolsBase);

export default SearchTools;
