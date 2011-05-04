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
   /* var ret ;
    
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
    
    return ret ;*/
    var ret ;
    
    var regexp = "([0-9]{4})-([0-9]{2})-([0-9]{2})?",
        d      = str.match(new RegExp(regexp)),
        offset = 0,
        time ;
    var date = SC.DateTime.create({});
    date = SC.DateTime.create({year:d[1], month:d[2], day:d[3]});
    /*if (d[3]) { date.setMonth(d[3] - 1); }
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
    ret.setTime(Number(time));*/
    ret = date;
    return ret ;
  },
  
  _dates: {},
  _zeropad: function(num) { 
    return ((num<0) ? '-' : '') + ((num<10) ? '0' : '') + Math.abs(num); 
  },
  
  /** @private - convert a date to a string */
  from: function(date) { 
    /*var ret = this._dates[date.getTime()];
    if (ret) return ret ; 
    
    this._dates[date.getTime()] = ret = "%@-%@-%@".fmt(
      zp(date.getFullYear()),
      zp(date.getMonth()+1),
      zp(date.getDate())
    ) ;
    
    return ret ;*/
    var ret = this._dates[date.get('milliseconds')];
    if (ret) return ret ; 
    
    // figure timezone
    var zp = this._zeropad;
        tz = 0-date.get('timezome')/60;
    
    tz = '';//(tz === 0) ? 'Z' : '%@:00'.fmt(zp(tz));
    this._dates[date.get('milliseconds')] = ret = "%@-%@-%@".fmt(
      zp(date.toFormattedString('%Y')),
      zp(date.toFormattedString('%m')),
      zp(date.toFormattedString('%d'))) ;
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
      
      date = SC.DateTime.create({year:d[1], month:d[2], day:d[3], hour: d[4], minute:d[5], second:d[6]});
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
    this._dates[date.get('milliseconds')] = ret = "%@-%@-%@ %@:%@:%@".fmt(
      zp(date.toFormattedString('%Y')),
      zp(date.toFormattedString('%m')),
      zp(date.toFormattedString('%d')),
      zp(date.toFormattedString('%H')),
      zp(date.toFormattedString('%M')),
      zp(date.toFormattedString('%S'))) ;
    return ret ;
  }
});

/** @private */
SC.RecordAttribute.registerTransform(Django.DecimalField, {
  
  /** @private - convert a Number to a Decimal */
  from: function(str, attr) {
    // Check the String!!
    var decimalPlaces = 2;
    try
    {
      if (attr.get('decimalPlaces'))
      {
        decimalPlaces = attr.get('decimalPlaces');    
      }
    }
    catch (e)
    {
      
    }
    num = String(str);

    // Cut to decimalPlaces
    var index = num.indexOf('.');
    if (index != -1 && index+decimalPlaces+1 <= num.length)
    {
      return num.substr(0,index+decimalPlaces+1);
    }
    //num = cleanupFloat(num, decimalPlaces);
    return (num);
  },

  /** @private - convert a decimal field to a Number */
  to: function(obj, attr) {

    var decimalPlaces = 2;
    try
    {
      if (attr.get('decimalPlaces'))
      {
        decimalPlaces = attr.get('decimalPlaces');    
      }
    }
    catch (e)
    {
      
    }
    //var num = parseFloat(obj);
    var num=String(obj);

    num = num.replace(',','.');
    num = num.replace(' ','');
    if (num.length > 0)
    {

      var newNum = '';
      // eliminate all . except last
      var dotFound = false;
      for (var i = num.length -1 ; i>=0; i--)
      {
        if (num.charAt(i) == '.')
        {
          if (!dotFound)
          {
            newNum = num.charAt(i) + newNum;
            dotFound= true;  
          }
        }
        else
        {
          newNum = num.charAt(i) + newNum;
        }
      }
      num = newNum;
      var RegExp = /^(-)?(\d*)(\.?)(\d*)$/; // Note: this WILL allow a number that ends in a decimal: -452.
      // compare the argument to the RegEx
      // the 'match' function returns 0 if the value didn't match
      var result = num.match(RegExp);
      if (result)
      {
        if (result[0])
        {
          num=result[0];
        }
        else
        {
          num = '0.00';
        }
      }
      else
      {
        num = '0.00';
      }
    }
    // Cut to decimalPlaces
    var index = num.indexOf('.');
    if (index != -1 && index+decimalPlaces+1 <= num.length)
    {
      return num.substr(0,index+decimalPlaces+1);
    }
    //num = cleanupFloat(num, decimalPlaces);
    return SC.none(num) ? '0.00' : num ;
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
    var str = parseInt(str,10);

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
    var str = parseInt(str,10);

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
    var str = parseInt(str,10);

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
    var str = parseInt(str,10);

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
Django.TIME_FIELD_REGEXP = /([0-9]{0,2}):([0-9]{0,2}):([0-9]{0,2})/ ;

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

    /*console.log('str');
    console.log(str);
    console.log('str-end');
    */var ret ;
    
    var d      = str.match(Django.TIME_FIELD_REGEXP),
        offset = 0,
        date   = SC.DateTime.create({hour:0, minute:0, sec:0}), //new Date(0, 0, 1),
        time ;
    if (d)
    {
      date = SC.DateTime.create({hour: parseInt(d[1],10), minute: parseInt(d[2],10), sec: parseInt(d[3],10)});  
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
    /*var ret = this._dates[date.getTime()];
    if (ret) return ret ; 
    
    this._dates[date.getTime()] = ret = "%@:%@:%@".fmt(
      zp(date.getHours()),
      zp(date.getMinutes()),
      zp(date.getSeconds())
    );
    
    return ret ;*/
    var ret = this._dates[date.get('milliseconds')];
    if (ret) return ret ; 
    
    var zp = this._zeropad;

    this._dates[date.get('milliseconds')] = ret = "%@:%@:%@".fmt(
      (date.toFormattedString('%H')),
      (date.toFormattedString('%M')),
      (date.toFormattedString('%S'))
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

