	if (typeof String.prototype.startsWith != 'function') {
	  String.prototype.startsWith = function (str){
		  if(!str || str.length==undefined){
			  return  false;
		  }
	    return this.slice(0, str.length) == str;
	  };
	};

	if (typeof String.prototype.endsWith != 'function') {
	  String.prototype.endsWith = function (str){
		  if(!str || str.length==undefined){
			  return  false;
		  }
	    return this.slice(- str.length) == str;
	  };
	};
	if(typeof String.prototype.trim !== 'function') {
	  String.prototype.trim = function() {
	    return this.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); 
	  };
	}
	var defaultBlockUIArguments={message:null} ;
	
	$.blockUI.defaults.overlayCSS.backgroundColor = '#000'; 
	$.blockUI.defaults.overlayCSS.opacity = 0.5; 
    $.blockUI.defaults.message=null;
	BlockUIR={
		_count:0,
		block:function(){
			this._count++;
			if(this._count==1){
				debugger;
				$.blockUI.apply(undefined,arguments); 
			}
		},
		unblock:function(){
			this._count--;
			if(this._count==0){
				$.unblockUI();
			}
		}
	};