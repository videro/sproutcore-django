/*globals Django */
/** @private */
SC.RecordAttribute.registerTransform(Django.AutoField, {
  
  /** @private - convert an auto field to an integer */
  to: function(obj) {
    return SC.none(obj) ? null : Number(obj) ;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.BooleanField, {
  
  /** @private - convert a boolean field to a boolean */
  to: function(obj) {
    return !!obj ;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.CharField, {
  
  /** @private - 
    convert a char field to a string 
    allow null through as that will be checked separately
  */
  to: function(obj) {
    if (!(typeof obj === SC.T_STRING) && !SC.none(obj) && obj.toString) {
      obj = obj.toString();
    }
    return obj;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.CommaSeparatedIntegerField, {


  /** @private - 
    convert a comma-separated integer field to a string 
    allow null through as that will be checked separately
  */
  to: function(obj) {
    if (!(typeof obj === SC.T_STRING) && !SC.none(obj) && obj.toString) {
      obj = obj.toString();
    }
    return obj;
  }
  
});

// TODO: Check to make sure that this works. I added in some )'s to fix
// a syntax error, I don't know if that'll stop it from working. GeoffreyD
Django.DATE_FIELD_REGEXP = /([0-9]{4})(-([0-9]{2})(-([0-9]{2})))/ ;

/** @private */
SC.RecordAttribute.registerTransform(Django.DateField, {

  /** @private - convert a string to a Date */
  to: function(str, attr) {
    var ret ;
    
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
           " (([0-9]{2}):([0-9]{2})(:([0-9]{2})(\\.([0-9]+))?)?" +
           "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?",
        d      = str.match(new RegExp(regexp)),
        offset = 0,
        date   = new Date(d[1], 0, 1),
        time ;
        
    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
       offset = (Number(d[16]) * 60) + Number(d[17]);
       offset *= ((d[15] == '-') ? 1 : -1);
    }
    
    offset -= date.getTimezoneOffset();
    time = (Number(date) + (offset * 60 * 1000));
    
    ret = new Date();
    ret.setTime(Number(time));
    
    return ret ;
  },
  
  _dates: {},
  
  /** @private - convert a date to a string */
  from: function(date) { 
    var ret = this._dates[date.getTime()];
    if (ret) return ret ; 
    
    this._dates[date.getTime()] = ret = "%@-%@-%@".fmt(
      zp(date.getFullYear()),
      zp(date.getMonth()+1),
      zp(date.getDate())
    ) ;
    
    return ret ;
  }
});

/** @private */
Django.DATE_TIME_FIELD_REGEXP = new RegExp(
  "([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})?"
);
/** @private */
SC.RecordAttribute.registerTransform(Django.DateTimeField, {
  
  /** @private - convert a string to a Date */
  to: function(str, attr) {
    /*var ret ;
    
    var d      = str.match(Django.DATE_TIME_FIELD_REGEXP),
        offset = 0,
        date   = new Date(d[1], 0, 1),
        time ;
    
    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
       offset = (Number(d[16]) * 60) + Number(d[17]);
       offset *= ((d[15] == '-') ? 1 : -1);
    }
    
    offset -= date.getTimezoneOffset();
    time = (Number(date) + (offset * 60 * 1000));
    
    ret = new Date();
    ret.setTime(Number(time));
    
    return ret ;*/
    
    var ret ;
    var d      = str.match(Django.DATE_TIME_FIELD_REGEXP),
        offset = 0,
        time ;
    
    var date = SC.DateTime.create({});
    if (d)
    {
      
      if (d[1]) 
      { 
        date.set('year',d[1]); 
        
      }
      if (d[2]) { date.set('month',d[2] - 1); }
      if (d[3]) { date.set('day',d[3]); }
      
      date = SC.DateTime.create({year:d[1], month:d[2], day:d[3]});
      if (d[4]) { date.set('hour', d[4]); }
      if (d[5]) { date.set('minute', d[5]); }
      if (d[6]) { date.set('sec', d[6]); }
      /*if (d[12]) { date.set('usec', Number("0." + d[12]) * 1000); }
      if (d[14]) {
         offset = (Number(d[16]) * 60) + Number(d[17]);
         offset *= ((d[15] == '-') ? 1 : -1);
      }*/
      //console.log(date);
      /*offset -= date.get('timezone');
      time = (Number(date) + (offset * 60 * 1000));
      */
      

      /*ret = new Date();
      ret.setTime(Number(time));
      */
    }

    ret = date;
    return ret ;
  },
  
  _dates: {},
  
  _zeropad: function(num) { 
    return ((num<0) ? '-' : '') + ((num<10) ? '0' : '') + Math.abs(num); 
  },
  
  /** @private - convert a date to a string */
  from: function(date) { 

    /*
    var ret = this._dates[date.getTime()];
    if (ret) return ret ; 
    
    // figure timezone
    var zp = this._zeropad,
        tz = 0-date.getTimezoneOffset()/60;
        
    tz = (tz === 0) ? 'Z' : '%@:00'.fmt(zp(tz));
    
    this._dates[date.getTime()] = ret = "%@-%@-%@T%@:%@:%@%@".fmt(
      zp(date.getFullYear()),
      zp(date.getMonth()+1),
      zp(date.getDate()),
      zp(date.getHours()),
      zp(date.getMinutes()),
      zp(date.getSeconds()),
      tz) ;
    
    return ret ;
    */

    

    var ret = this._dates[date.get('milliseconds')];
    if (ret) return ret ; 
    
    // figure timezone
    var zp = this._zeropad;
        tz = 0-date.get('timezome')/60;
    
    tz = '';//(tz === 0) ? 'Z' : '%@:00'.fmt(zp(tz));
    this._dates[date.get('milliseconds')] = ret = "%@-%@-%@ %@:%@:%@%@".fmt(
      zp(date.get('year')),
      zp(date.get('month')),
      zp(date.get('day')),
      zp(date.get('hour')),
      zp(date.get('minute')),
      zp(date.get('sec')),
      tz) ;
    return ret ;
  }
});

/** @private */
SC.RecordAttribute.registerTransform(Django.DecimalField, {
  
  /** @private - convert a Number to a Decimal */
  from: function(str) {
    // Check the String!!
    str = String(str);
    str = str.replace(',','.');
    var str = parseFloat(str);

    return String(str);
  },

  /** @private - convert a decimal field to a Number */
  to: function(obj) {
    
    var num = String(obj);
    return SC.none(obj) ? null : Number(obj) ;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.FileField, {
  
  /** @private - 
    convert a file field to a string 
    allow null through as that will be checked separately
  */
  to: function(obj) {
    if (!(typeof obj === SC.T_STRING) && !SC.none(obj) && obj.toString) {
      obj = obj.toString();
    }
    return obj;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.FilePathField, {
  
  /** @private - 
    convert a file path field to a string 
    allow null through as that will be checked separately
  */
  to: function(obj) {
    if (!(typeof obj === SC.T_STRING) && !SC.none(obj) && obj.toString) {
      obj = obj.toString();
    }
    return obj;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.FloatField, {
  
  /** @private - convert a Number to a Decimal */
  from: function(str) {
    // Check the String!!
    str = String(str);
    str = str.replace(',','.');
    var str = parseFloat(str);

    return String(str);
  },

  /** @private - convert a float field to a Number */
  to: function(obj) {
    return SC.none(obj) ? null : Number(obj) ;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.ImageField, {
  
  /** @private - 
    convert an image field to a string 
    allow null through as that will be checked separately
  */
  to: function(obj) {
    if (!(typeof obj === SC.T_STRING) && !SC.none(obj) && obj.toString) {
      obj = obj.toString();
    }
    return obj;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.IntegerField, {
  
  /** @private - convert a Number to a Decimal */
  from: function(str) {
    // Check the String!!
    str = String(str);
    str = str.replace(',','.');
    var str = parseInt(str);

    return String(str);
  },

  /** @private - convert an integere field to a Number */
  to: function(obj) {
    return SC.none(obj) ? null : Number(obj) ;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.IPAddressField, {
  
  /** @private - 
    convert a IP address field to a string 
    allow null through as that will be checked separately
  */
  to: function(obj) {
    if (!(typeof obj === SC.T_STRING) && !SC.none(obj) && obj.toString) {
      obj = obj.toString();
    }
    return obj;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.NullBooleanField, {
  
  /** @private - convert a null boolean field to a boolean */
  to: function(obj) {
    return (obj === null) ? null : !!obj ;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.PositiveIntegerField, {
  
  /** @private - convert a Number to a Decimal */
  from: function(str) {
    // Check the String!!
    str = String(str);
    str = str.replace(',','.');
    var str = parseInt(str);

    return String(str);
  },

  /** @private - convert a positive integer field to a Number */
  to: function(obj) {
    return SC.none(obj) ? null : Number(obj) ;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.PositiveSmallIntegerField, {
  
  /** @private - convert a Number to a Decimal */
  from: function(str) {
    // Check the String!!
    str = String(str);
    str = str.replace(',','.');
    var str = parseInt(str);

    return String(str);
  },

  /** @private - convert a positive small integer field to a Number */
  to: function(obj) {
    return SC.none(obj) ? null : Number(obj) ;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.SlugField, {
  
  /** @private - 
    convert a slug field to a string 
    allow null through as that will be checked separately
  */
  to: function(obj) {
    if (!(typeof obj === SC.T_STRING) && !SC.none(obj) && obj.toString) {
      obj = obj.toString();
    }
    return obj;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.SmallIntegerField, {
  
  /** @private - convert a Number to a Decimal */
  from: function(str) {
    // Check the String!!
    str = String(str);
    str = str.replace(',','.');
    var str = parseInt(str);

    return String(str);
  },

  /** @private - convert a small integer field to a Number */
  to: function(obj) {
    return SC.none(obj) ? null : Number(obj) ;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.TextField, {
  
  /** @private - 
    convert a slug field to a string 
    allow null through as that will be checked separately
  */
  to: function(obj) {
    if (!(typeof obj === SC.T_STRING) && !SC.none(obj) && obj.toString) {
      obj = obj.toString();
    }
    return obj;
  }
  
});

/** @private */
Django.TIME_FIELD_REGEXP = /([0-9]{2}):([0-9]{2}):([0-9]{2})/ ;

/** @private FIXME: How does Django pass times in JSON? */
SC.RecordAttribute.registerTransform(Django.TimeField, {

  /** @private - convert a string to a Date */
  to: function(str, attr) {
    /*var ret ;
    
    var d      = str.match(Django.TIME_FIELD_REGEXP),
        offset = 0,
        date   = new Date(0, 0, 1),
        time ;
    date.setHours(d[1]) ;
    date.setMinutes(d[2]) ;
    date.setSeconds(d[3]) ;
    
    return ret ;
    */


    var ret ;
    
    var d      = str.match(Django.TIME_FIELD_REGEXP),
        offset = 0,
        date   = null, //new Date(0, 0, 1),
        time ;
    date = SC.DateTime.create({hour: d[1], minute: d[2], sec: d[3]});

    return ret ;
  },
  
  _dates: {},
   
  /** @private - convert a date to a string */
  from: function(date) { 
    /*var ret = this._dates[date.getTime()];
    if (ret) return ret ; 
    
    this._dates[date.getTime()] = ret = "%@:%@:%@".fmt(
      zp(date.getHours()),
      zp(date.getMinutes()),
      zp(date.getSeconds())
    );
    
    return ret ;*/
    var ret = this._dates[date.get('usec')];
    if (ret) return ret ; 
    
    this._dates[date.get('usec')] = ret = "%@:%@:%@".fmt(
      zp(date.get('hour')),
      zp(date.get('minute')),
      zp(date.get('sec'))
    );
    
    return ret ;

  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.URLField, {
  
  /** @private - 
    convert a slug field to a string 
    allow null through as that will be checked separately
  */
  to: function(obj) {
    if (!(typeof obj === SC.T_STRING) && !SC.none(obj) && obj.toString) {
      obj = obj.toString();
    }
    return obj;
  }
  
});

/** @private */
SC.RecordAttribute.registerTransform(Django.XMLField, {
  
  /** @private - 
    convert an XML field to an XML
    allow null through as that will be checked separately
  */
  to: function(obj) {
    if (!(typeof obj === SC.T_STRING) && !SC.none(obj) && obj.toString) {
      obj = obj.toString();
    }
    return obj ? Django.parseXML(obj) : '' ;
  }
  
});

