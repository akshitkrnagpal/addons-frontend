import * as React from 'react';

import SearchTools, { SearchToolsBase } from 'amo/pages/SearchTools';
import Search from 'amo/components/Search';
import HrefLang from 'amo/components/HrefLang';
import { ADDON_TYPE_OPENSEARCH, SEARCH_SORT_RELEVANCE } from 'core/constants';
import {
  dispatchClientMetadata,
  fakeI18n,
  getFakeConfig,
  shallowUntilTarget,
} from 'tests/unit/helpers';

describe(__filename, () => {
  let store;

  function render({ ...props } = {}) {
    return shallowUntilTarget(
      <SearchTools store={store} i18n={fakeI18n()} {...props} />,
      SearchToolsBase,
    );
  }

  beforeEach(() => {
    store = dispatchClientMetadata().store;
  });

  it('should have search component', () => {
    const root = render();
    expect(root.find(Search)).toHaveLength(1);
  });

  it('search component should have `search` props', () => {
    const root = render();
    expect(root.find(Search)).toHaveProp('filters', {
      addonType: ADDON_TYPE_OPENSEARCH,
      sort: SEARCH_SORT_RELEVANCE,
    });
  });

  it('renders a "description" meta tag', () => {
    const root = render();

    expect(root.find('meta[name="description"]')).toHaveLength(1);
    expect(root.find('meta[name="description"]').prop('content')).toMatch(
      /Download Firefox extensions to customize/,
    );
  });

  it('renders a HrefLang component', () => {
    const root = render();

    expect(root.find(HrefLang)).toHaveLength(1);
    expect(root.find(HrefLang)).toHaveProp('to', '/search-tools/');
  });

  it('renders a canonical link tag', () => {
    const baseURL = 'https://example.org';
    const _config = getFakeConfig({ baseURL });
    const pathname = '/language-tools/';
    const { store: storeWithPathname } = dispatchClientMetadata({ pathname });

    const root = render({ _config, store: storeWithPathname });

    expect(root.find('link[rel="canonical"]')).toHaveLength(1);
    expect(root.find('link[rel="canonical"]')).toHaveProp(
      'href',
      `${baseURL}${pathname}`,
    );
  });
});
