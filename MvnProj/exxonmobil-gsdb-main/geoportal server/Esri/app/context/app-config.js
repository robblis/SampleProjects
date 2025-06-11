define([],function(){var obj={
// .......................................................................................

  system: {
    searchLimit: 10000,
    secureCatalogApp:true
  },

  edit: {
    setField: {
      allow: false,
      adminOnly: false
    }
  },

  bulkEdit: {
    allowByOwner: true,
    allowBySourceUri: true,
    allowByTaskRef: true,
    allowByQuery: true
  },

  search: {
    allowSettings: true,
    useSimpleQueryString: false,
    escapeFilter: false
  },

  searchMap: {
    basemap: "streets",
    basemapUrl: "",
    isTiled: false,
    autoResize: true,
    wrapAround180: true,
    center: [-98, 40],
    zoom: 3
  },

  searchResults: {
    numPerPage: 10,
    showDate: true,
    showOwner: false,
    showThumbnails: false,
    showFootprint: true,
    showAccess: false,
    showApprovalStatus: false,
    defaultSort: {"title.keyword": {"order" : "asc" ,"unmapped_type": "keyword"}},   
    sortDesc:{"title.keyword": {"order" : "desc" ,"unmapped_type": "keyword"}},
    showLinks: false,
    showCustomLinks: false,
	showJSONLink: true,
    showOpenSearchLinks: false,
    showTotalCountInHierarchy: true,
    showShoppingCart: false
  },

  statusChecker: {
    apiUrl: "http://registry.fgdc.gov/statuschecker/api/v2/results?",
    infoUrl: "http://registry.fgdc.gov/statuschecker/ServiceDetail.php?",
    authKey: null
  }

// .......................................................................................
};return obj;});