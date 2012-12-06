var events = require('events');
var eventEmitter = new events.EventEmitter();

function MessageController(zwave){
	this.zwave = zwave;

	this.messageQueue = new Array();

	this.block=false;
	this.actualMessage=null;
	this.sendAck=false;
	var self=this;
	eventEmitter.on("queue_modified",function(){

		if(self.messageQueue.length>0){
			if(!self.block){
				blockWriting(true);
				self.removeMessage(function(message){
					self.actualMessage=message;
					self.write(message);
				});
			}
		}
	});
	this.zwave.serialPort.on('data',function(response){
		console.log("response: ");
		console.log(response);
		if(MessageController.sendAck){
			//console.log("supuesto ack: "+zwave.ack);
			var buffer = new Buffer([zwave.ack]);
			//console.log("ack ");
			//console.log(buffer);
			self.zwave.serialPort.write(buffer,function(err){
				//console.log(err);
			});
			self.HandleResponse(response);	
			MessageController.sendAck=false;			
		} else {
			if(response[0]==zwave.ack){
				MessageController.sendAck=true;
			}
		}
		
	});
}
function blockWriting(block){
	MessageController.block= block;
	if(block){
		eventEmitter.emit('writing_disabled');
	}else {
		eventEmitter.emit('writing_enabled');
	}
}

MessageController.prototype.addMessage = function(message){
	
	this.messageQueue.push(message);
	eventEmitter.emit('queue_modified');
}
MessageController.prototype.removeMessage=function(callback){
	callback(this.messageQueue.shift());
	eventEmitter.emit('queue_modified');

}
MessageController.prototype.write = function(message,callback){
	
	

    switch (message.commandType){
      case this.zwave.responseType.swich:
        var chk = generateChecksum(new Buffer(message.message));
        //console.log(message);
        message.message.push(chk);        
        break;
       default:
       	break;
    }
    var buffer = new Buffer(message.message);
    console.log("escribiendo: ");
    console.log(buffer);
    this.zwave.serialPort.write(buffer);
}
MessageController.prototype.SendMessage=function(message){
	this.addMessage(message);
}
MessageController.prototype.HandleResponse=function(response){
	eventEmitter.emit('queue_modified');
	blockWriting(false);
	//console.log("respuesta: ");
	//console.log(response);
}
function generateChecksum(message){
  var offset = 1;
  var ret = message[offset];
  for(var i=offset;i < message.length -1 ; i++){    
    ret ^=message[i+1];    
  }
  ret = ~ret;
  
  return ret;
}
module.exports = MessageController;