var GlobalSerial = require('serialport');
var events = require('events');
var sys = require('sys');
var SerialPort = GlobalSerial.SerialPort;
var MessageController = require('./MessageController.js');

function Zwave(){ 

  events.EventEmitter.call(this);
  this.isOpen=false;  
  this.sendAck = false;
  this.ack=0x06;
  this.serialPort = null;
  this.messageController = null;
  this.responseType = {
    swich:1,
    dimmer:2,
    controllerText:3
  };

}
sys.inherits(Zwave,events.EventEmitter);
function readStringFromBuff (startInd, buff)
{
    var ind = startInd;
    var out = "";
    for ( ; ind < buff.length; ++ind )
    {
        if ( buff[ ind ] != 0 )
            out += String.fromCharCode ( buff[ ind ] );
        else
            return out;
    }
}
Zwave.prototype.open = function(port,options,callback){

  if(!options){
    options={
      baudrate:115200
    };
  }
  var zwave = this;
  this.serialPort = new SerialPort(port,options);
  this.serialPort.on('open',function(err){    
    zwave.messageController = new MessageController(zwave);
    if(err){
  	   if(callback){	  
  	     callback(err);
  	   } else {
  	     console.log("Error abriendo el puerto: "+ port);
  	   }
    } else {
      zwave.isOpen=true;
      if(callback){
	       callback();
      }
    }
  this.emit('ready',port,options);
  /*zwave.serialPort.on('data',function(results){
    zwave.emit('data_receive',results);
    if(zwave.sendAck){
      zwave.sendMessage(new Buffer([zwave.ack]),false,function(){
        console.log("ack send");
        zwave.sendAck=false;
      });
    } else {     
      if(results[0] == zwave.ack){
        zwave.sendAck=true;    
        zwave.emit('ack_receive',results);
      }  
    }
    console.log(results);
    /*var text = readStringFromBuff(0,results);
    console.log(text);*/
    /*if(results.length==6){
      zwave.sendAck=true;
      zwave.time++;
    }
    if(results.length==1){
      zwave.ack = results;
    }
    if(zwave.sendAck && zwave.time==2){
      zwave.sendMessage(zwave.ack,false,function(){
  zwave.sendAck=false;
  zwave.time=0;
  console.log("ack send");
      })      
    }
    console.log(results);
  }); */ 
 
});
}

function handleResponse(response){
  var first = response[0];
  switch (first) {
    case Zwave.ack:{
      break;
    }
  }
  if(response[0]==Zwave.ack){
    //@TODO: handle ack
  }
} 
/*Zwave.prototype.sendMessage =function(message,checksum,callback){
  //var buffer =null;
  //var zwave = this;
  if(checksum){
      var chk = generateChecksum(message);
      message[message.length-1] = chk;      
  }
  //var search = [0x01, 0x03, 0x00, 0x02, 0xFE];
  this.serialPort.write(message,function(){
    if(callback){
      callback();
    }
  });
}*/
Zwave.prototype.getVersion = function(){
  var buffer = new Buffer([0x01,0x03,0x00,0x15,0xe9]);
  this.sendMessage(buffer,false);

}


Zwave.prototype.swichOn = function(nodeId){
  var state=0xFF;
  var message = [0x01, 0x09, 0x00, 0x13, nodeId, 0x03, 0x20, 0x01, state, 0x05];
  var zwaveMsg = new ZwaveMessage({
    message:message,
    nodeId:nodeId,
    commandType:this.responseType.swich,
    checksum:true
  });
  this.messageController.SendMessage(zwaveMsg);
  
  
};
Zwave.prototype.swichOff = function(nodeId){
  var state=0x00;
  var message = [0x01, 0x09, 0x00, 0x13, nodeId, 0x03, 0x20, 0x01, state, 0x05];
  var zwaveMsg = new ZwaveMessage({
    message:message,
    nodeId:nodeId,
    commandType:this.responseType.swich,
    checksum:true
  });
  this.messageController.SendMessage(zwaveMsg);
};
/**
option:
message:array;
nodeId:byte;
commandType:commandType(int)
waitAck:bool;
generateChecksum:bool; 
*/
function ZwaveMessage(option){
  this.message=option.message;
  this.nodeId=option.nodeId;
  this.commandType=option.commandType;
  this.checksum=option.checksum;
  this.waitAck=true;
  var self=this;
  /*if(option){
    switch (option.commandType){
      case Zwave.commandType.swich:{
        var chk = generateChecksum(new Buffer(option.message));
        message[message.length-1]=chk;        
        break;
      }    
    }
  }*/
}
function ZwaveResponse(){
  this.response = null;

}
module.exports.ZwaveResponse = ZwaveResponse;
module.exports.ZwaveMessage = ZwaveMessage;
module.exports = Zwave;