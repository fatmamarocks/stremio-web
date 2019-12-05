const React = require('react');
const { useModelState } = require('stremio/common');

const initSearchState = () => ({
    selected: null,
    catalog_resources: []
});

const mapSearchState = (search) => {
    const queryString = search.selected !== null ?
        new URLSearchParams(search.selected.extra).toString()
        :
        '';
    const selected = search.selected;
    const catalog_resources = search.catalog_resources.map((catalog_resource) => {
        catalog_resource.href = `#/discover/${encodeURIComponent(catalog_resource.request.base)}/${encodeURIComponent(catalog_resource.request.path.type_name)}/${encodeURIComponent(catalog_resource.request.path.id)}?${queryString}`;
        return catalog_resource;
    });
    return { selected, catalog_resources };
};

const useSearch = (queryParams) => {
    const loadSearchAction = React.useMemo(() => {
        if (queryParams.has('search') && queryParams.get('search').length > 0) {
            return {
                action: 'Load',
                args: {
                    load: 'CatalogsWithExtra',
                    args: {
                        extra: [
                            ['search', queryParams.get('search')]
                        ]
                    }
                }
            };
        }
    }, [queryParams]);
    return useModelState({
        model: 'search',
        action: loadSearchAction,
        map: mapSearchState,
        init: initSearchState
    });
};

module.exports = useSearch;
