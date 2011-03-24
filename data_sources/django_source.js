/*globals Django CoreTasks */
// djangcore URL structure (via Taavi):

/**
  Add this to get things working.
*/
// Django = SC.Object.create() ;

Django.urlPrefix = 'api/models';

/**
  GET total number of objects
  /<url_prefix>/<app_label>/<model_name>/length/
*/
Django.getLengthURL = "/%@/%@/%@/length/" ;


/**
 GET a couple of objects with query parameters / conditions and orderby 
 /<url_prefix>/<app_label>/<model_name>/list/?offset=0&limit=0&ordering=name&conditions=ipPublic%20%3D%20%7Bipp%7D%20AND%20ipUmts%20%3D%20%7Bipu%7D&name=jochen&nr=48455
 */
//Django.getQueryURL = "/%@/%@/%@/list/?offset=%@&limit=%@&ordering=%@&conditions=%@&parameters=%@";
//Django.getQueryURL = "/%@/%@/%@/list/?offset=%@&limit=%@&ordering=%@%@";
Django.getQueryURL = "/%@/%@/%@/list/?ordering=%@%@";

/**
  GET a range of objects based on a sort
  Parameters::
    ordering (required, takes: the key of a field)
    start (optional, takes: integer, default: 0)
    length (optional, takes: integer, default: <length of objects>)
  /<url_prefix>/<app_label>/<model_name>/range/?order_by=pk&start=0&length=10
*/
Django.getRangeURL = "/%@/%@/%@/list/?start=%@&length=%@" ;
Django.getAllURL = "/%@/%@/%@/list/" ;

/**
  GET, DELETE one or more objects by their pks
  Parameters::
    NOTE: we need to be able to use non integer PKs. Is it safe to assume that PKs won't have commas?
    pk (required, takes: comma-separated list of integers) Integers? does this mean that it is bad to have uuid pk's?
  Notes:
    - GET will always return a list, even if it only contains one object
    - DELETE will return a response with a proper http status code
  /<url_prefix>/<app_label>/<model_name>/?pks=1,2,3
*/
Django.getURL = "/%@/%@/%@/?pk=%@" ;
Django.deleteURL = "/%@/%@/%@/?pk=%@" ;

/**
  POST, PUT one or more updated objects
  Notes:
    - Requests should pass a list of attribute hashes in the body of the request.
    - PUT requests should also include a pk value in each attribute hash.
  /<url_prefix>/<app_label>/<model_name>/
*/
Django.putURL = "/%@/%@/%@/?pk=%@" ;
Django.postURL = "/%@/%@/%@/" ;


/** @class
  This code is mean to work in concert with the djangocore Django 
  application and the auto-generated SproutCore frameworks produced 
  by the django-sproutcore library (which includes the djangocore
  application).

  @extends SC.DataSource
  @author Erich Ocean
*/
Django.DataSource = SC.DataSource.extend({

  createRecord: function(store, storeKey, params) {
    console.log("createRecord");
    var recordType      = SC.Store.recordTypeFor(storeKey),
        dataHash        = store.readDataHash(storeKey),
        recordTypePath  = recordType.modelClass.split("."),
        appName         = recordTypePath[0],
        modelName       = recordTypePath[1];
    var url = Django.postURL.fmt(Django.urlPrefix, appName, modelName);

    SC.Request.postUrl(url).set('isJSON', YES)
      .notify(this, this._didCreateRecord, {
        store: store,
        storeKey: storeKey,
        callbacks: params
      }).send(dataHash);
    return YES ;
  },

  _didCreateRecord: function(request, params) {
    console.log("_didCreateRecord");
      var store     = params.store,
        storeKey  = params.storeKey,
        response  = request.get('response'),
        record;
    if (SC.$ok(response)) {

      if (response.length > 0)
      {
        var recordType = new String(response[0].model);
        var recordTypeArray = recordType.split('.');
        var appName = '';
        if (recordTypeArray.length == 2)
        {
          appName = recordTypeArray[0];
        }
        var singleFields = new Object();
        this._createNestedRecords(appName, response[0].fields, singleFields);

        record = singleFields;
        record.pk = response[0].pk;
        store.dataSourceDidComplete(storeKey, record, record.pk);
        if(params.callbacks && params.callbacks.successCallback){
          CoreTasks.invokeCallback(params.callbacks.successCallback);
        }
      }
      
    }else{
      store.dataSourceDidError(storeKey, record);
      if(params.callbacks && params.callbacks.failureCallback){
        CoreTasks.invokeCallback(params.callbacks.failureCallback);
      }
    }
    
  },

  _createNestedRecords: function(appName, fields, singleFields) {
       var subRecords = new Array();
       // search through fields to get nested Elements    
       
       for (k in fields)
       {
         if (typeof(fields[k]) == 'object' && fields[k] != null)
         {
          //console.log(fields[k]);  
          if (fields[k].get('length')>0)
          {
            var fieldType = new String(fields[k][0].model);
            var fieldTypeArray = fieldType.split('.');
            var fieldRecordType = fieldTypeArray[1];
            var f = fieldRecordType.charAt(0).toUpperCase();
            var fieldRecordType =  appName+'.'+f + fieldRecordType.substr(1);
            subRecords = [];
            for (var j = 0; j<fields[k].get('length'); j++)
            {
              var subRecord = fields[k][j].fields;
              subRecord.type = fieldRecordType;
              subRecord.pk = fields[k][j].pk;
              subRecords.push(subRecord);
            }
            singleFields[k] = subRecords;
          }
         }
         else
         {
           singleFields[k] = fields[k];
         }
       }
  },  

  retrieveRecord: function(store, storeKey, id) {
    console.log("retrieveRecord");
    var recordType      = SC.Store.recordTypeFor(storeKey),
        recordId        = id ? id : store.idFor(storeKey),
        recordTypePath  = recordType.modelClass.split("."),
        appName         = recordTypePath[0],
        modelName       = recordTypePath[1];
    //if the id is int instead of object, fmt(%@ won't work. thus we have to convert the object-type
    if(SC.typeOf(recordId)!='object')id=""+recordId;
    var url = Django.getURL.fmt(Django.urlPrefix, appName, modelName, recordId);

    SC.Request.getUrl(url).set('isJSON', YES)
      .notify(this, this._didRetrieveRecord, {
        store: store,
        storeKey: storeKey
      }).send();
    return YES;
  },

  _didRetrieveRecord: function(request, params) {
    console.log("_didRetrieveRecord");
    var store     = params.store,
        storeKey  = params.storeKey,
        response  = request.get('response')[0],
        record;
    // normal: load into store...response == dataHash
    if (SC.$ok(response)) {
      record = response.fields;
      record.pk = response.pk;

      console.log('dataSourceDidComplete');
      store.dataSourceDidComplete(storeKey, record);

    // error: indicate as such...response == error
    } else store.dataSourceDidError(storeKey, record);
  },

  updateRecord: function(store, storeKey, params) {
    console.log("updateRecord");
    var recordType      = SC.Store.recordTypeFor(storeKey),
        recordId        = store.idFor(storeKey),
        dataHash        = store.readDataHash(storeKey),
        recordTypePath  = recordType.modelClass.split("."),
        appName         = recordTypePath[0],
        modelName       = recordTypePath[1];
    var url = Django.putURL.fmt(Django.urlPrefix, appName, modelName, recordId);

    SC.Request.putUrl(url).set('isJSON', YES)
      .notify(this, this._didCreateRecord, {
        store: store,
        storeKey: storeKey
      }).send(dataHash);

    return YES ;
  },

  _didUpdateRecord: function(request, params) {
    console.log("_didUpdateRecord");
    var store     = params.store,
        storeKey  = params.storeKey,
        response  = request.get('response'),
        record;
    if (SC.$ok(response)) {
      record = response.fields;
      record.pk = response.pk;
      store.dataSourceDidComplete(storeKey, record, record.pk);
    }else{
      store.dataSourceDidError(storeKey, record);
    }
  },

  destroyRecord: function(store, storeKey, params) {
    console.log("destroyRecord");
    var recordType = SC.Store.recordTypeFor(storeKey),
        recordId   = store.idFor(storeKey),
        recordTypePath = recordType.modelClass.split("."),
        appName = recordTypePath[0],
        modelName = recordTypePath[1];
    var url = Django.deleteURL.fmt(Django.urlPrefix, appName, modelName, recordId);

    SC.Request.deleteUrl(url).set('isJSON', YES)
      .notify(this, this._didDestroyRecord, {
        store: store,
        storeKey: storeKey
      }).send();
    return YES;
  },

  destroyRecord: function(store, storeKey) {
    console.log("destroyRecord2");
    var recordType = SC.Store.recordTypeFor(storeKey),
        recordId   = store.idFor(storeKey),
        recordTypePath = recordType.modelClass.split("."),
        appName = recordTypePath[0],
        modelName = recordTypePath[1];
    var url = Django.deleteURL.fmt(Django.urlPrefix, appName, modelName, recordId);

    SC.Request.deleteUrl(url).set('isJSON', YES)
      .notify(this, this._didDestroyRecord, {
        store: store,
        storeKey: storeKey
      }).send();
    return YES;
  },

  _didDestroyRecord: function(request, params) {
    console.log("_didDestroyRecord");
    var store = params.store,
        storeKey = params.storeKey,
        response = request.get('response'),
        record;

    if (SC.$ok(response)) {
      //this seems to be useless, since the record is already destroyed. also,
      //the response seems to be always empty
      //record = response.fields;
      //record.pk = response.pk;

      console.log('dataSourceDidDestroy');
      store.dataSourceDidDestroy(storeKey);

    // error: indicate as such...response == error
    } else store.dataSourceDidError(storeKey, record);
  },

  fetch_: function(store, query) {
    console.log("fetch");
    if (true || query._autogenerated) {
    console.log(query.recordType);
    console.log(recordType.modelClass);
      var recordType = query.recordType,
          recordTypePath = recordType.modelClass.split("."),
          appName = recordTypePath[0],
          modelName = recordTypePath[1];

      var url = Django.getAllURL.fmt(Django.urlPrefix, appName, modelName) ;
      SC.Request.getUrl(url).set('isJSON', YES)
        .notify(this, this._didFetchRecords, { 
           query: query, store: store
         }).send();
      return YES ;
    } else return NO ;
  },

  fetch: function(store, query) {
           console.log("beneenenenenene ###########");
    if (true || query._autogenerated) {
      var recordType = query.recordType,
          recordTypePath = recordType.modelClass.split("."),
          appName = recordTypePath[0],
          modelName = recordTypePath[1];

    /*
     * - (String) conditions [R/W]
     *   - (SC.Enumerable) expandedRecordTypes [R/W]
     *   - (Object) isEditable [R/W]
     *   - (Boolean) isLocal [R/W]
     *   - (Boolean) isQuery [R/W]
     *   - (Boolean) isRemote [R/W]
     *   + (String) LOCAL [R/W]
     *   - (String) location [R/W]
     *   - (String) orderBy [R/W] Optional orderBy parameters.
     *   - (Hash) parameters [R/W]
     *   - (Object) queryLanguage [R/W]
     *   - (SC.Record) recordType [R/W]
     *   - (SC.Enumerable) recordTypes [R/W] Optional array of multiple record types.
     *   + (String) REMOTE [R/W]
     *   - (SC.Query) scope [R/W]
     *   */
    console.log("expandedRecordTypes: "+query.expandedRecordTypes());
    console.log("conditions: "+query.conditions);
    console.log("editable: "+query.isEditable);
    console.log("isLocal: "+query.isLocal);
    console.log("isQuery: "+query.isQuery);
    console.log("isRemote: "+query.isRemote);
    console.log("LOCAL: "+query.LOCAL);
    console.log("location: "+query.location);
    console.log("orderBy: "+query.orderBy);
    console.log("parameters: "+query.parameters);
    console.log("querylanguage: "+query.queryLanguage);
    console.log("recordTypes: "+query.recordTypes);
    console.log("REMOTE: "+query.REMOTE);
    console.log("scope: "+query.scope);
    console.log("recordType: "+recordType);
    console.log("recordTypePath: "+recordTypePath);
    console.log("appName: "+appName);
    console.log("modelname: "+modelName);

    var url = "";
    if (query.url)
    {
    	url = query.url;
    }
    else if(query.orderBy || query.parameters || query.conditions) {
        //build the conditions from the parameters array
        var limit = 10000; //to do later
        var offset = 0; //to do later
        var conditions = escape(query.conditions);
        var orderby = escape(query.orderBy);
        if (orderby == null)
        {
        	orderby = 'pk';
        }
        var parameters = "";
        for(var i in query.parameters) {
            parameters=parameters+"&"+i+"="+query.parameters[i]+"";
        }
        
       // parameters = escape(parameters);
        //url = Django.getQueryURL.fmt(Django.urlPrefix, appName, modelName, offset, limit, orderby, conditions, parameters);
        //url = Django.getQueryURL.fmt(Django.urlPrefix, appName, modelName, offset, limit, orderby)+parameters;
        url = Django.getQueryURL.fmt(Django.urlPrefix, appName, modelName, orderby)+parameters;
    } else {
      url = Django.getAllURL.fmt(Django.urlPrefix, appName, modelName) ;
    }
    query.url = url;
      SC.Request.getUrl(url).set('isJSON', YES)
        .notify(this, this._didFetchRecords, { 
           query: query, store: store
         }).send();
      return YES ;
    } else return NO ;
  },

  _didFetchRecords: function(request, params) {
    console.log("_didFetchRecords");
    var query       = params.query,
        qParams      = query.parameters,
        store       = params.store,
        response    = request.get('response');

	if (SC.$ok(request)) 
	{
		//store.loadRecords(query.recordType, request.get('body'));
		var records = new Array();
		var bod = request.get('response');
		var counter = 1;
		// get the RecordType
    var recordType = new String(query.recordType);
    var recordTypeArray = recordType.split('.');
    var appName = '';
    if (recordTypeArray.length == 2)
    {
      appName = recordTypeArray[0];
    }
    var storeKeys = [];
		if (bod.length>0)
		{
      for (var i = 0; i<bod.length; i++)
      {
        if (bod[i].fields)
        {
          var fields = bod[i].fields;
          var singleFields = new Object();
          this._createNestedRecords(appName, fields, singleFields);
          var new_record = singleFields;
          new_record.pk = bod[i].pk;
          records.push(new_record);
        }
      }
      var storeKeys = store.loadRecords(query.recordType, records);
      // only for REMOTE-Queries
      if(query.get('isRemote'))
      {
        store.loadQueryResults(query, storeKeys);
      }
      store.dataSourceDidFetchQuery(query);
			
		}		
		if (qParams && qParams.successCallback) 
		{
			CoreTasks.invokeCallback(qParams.successCallback);
		}
	} 
	else 
	{
		store.dataSourceDidErrorQuery(query, response) ;
		if (qParams && qParams.failureCallback) 
		{
			CoreTasks.invokeCallback(qParams.failureCallback);
		}
	}
  },


  

  _loadRecords: function(store, query, json) {
	var records = [] ;
	console.log('_loadingRecords');
	// bplutka: Fallunterscheidung, falls das Array nur 1 Element hat zieht forEach nicht!
	if (json.length==1)
	{
		var new_record = json[0].fields ;
		new_record.pk = json[0].pk ;
		records.push(new_record) ;
		records.push(new_record) ;
	}
	else
	{
		json.forEach(function(obj) {

			var new_record = obj.fields ;
			new_record.pk = obj.pk ;
			records.push(new_record) ;
		}) ;
	}
	store.loadRecords(query.recordType, records);
	store.dataSourceDidFetchQuery(query);
  }

});
