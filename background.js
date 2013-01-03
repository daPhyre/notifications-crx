var host='ayotli.com';
var pathNew='notifications';
var pathZero='';

var counter=0;
var newNotif=false;
var protocol='http'
var alwaysNew=false;
var showZero=false;
var deskNoti=null;
var showNoti=true;
var timeNoti=20000;
var timerVar=null;
var timerDelay=300000;
var playSound=true;
var audio=new Audio('sound.ogg'); // sound.ogg is button-44.wav from soundjay.com
window.onload=init;

var BADGE_NEW={color:[0,204,51,255]};
var BADGE_ACTIVE={color:[204,0,51,255]};
var BADGE_LOADING={color:[204,204,51,255]};
var BADGE_INACTIVE={color:[153,153,153,255]};

function loadData(){
	var xhr=new XMLHttpRequest();
	xhr.open('GET','http://ayotli.com/notifications/demo.json',true);	//JSON
	//xhr.open('GET','http://ayotli.com/notifications/demo.xml',true);	//XML
	xhr.onreadystatechange=function(){
		if(xhr.readyState==4){
			chrome.browserAction.setBadgeBackgroundColor(BADGE_INACTIVE);
			
			var jsonDoc=JSON.parse(xhr.responseText);		//JSON
			var username=jsonDoc.username;					//JSON
			//var xmlDoc=new DOMParser().parseFromString(xhr.responseText,'text/xml');			//XML
			//var username=xmlDoc.getElementsByTagName('username')[0].childNodes[0].nodeValue;	//XML
			
			if(username){
				var lastCounter=counter;
				var mess=parseInt(jsonDoc.messages);		//JSON
				var noti=parseInt(jsonDoc.notifications);	//JSON
				//var mess=parseInt(xmlDoc.getElementsByTagName('messages')[0].childNodes[0].nodeValue);		//XML
				//var noti=parseInt(xmlDoc.getElementsByTagName('notifications')[0].childNodes[0].nodeValue);	//XML
			
				var badgeTitle=username+' - Notifications';
				if(mess>0) badgeTitle+='\n> '+mess+' messages';
				if(noti>0) badgeTitle+='\n> '+noti+' notifications';
				counter=mess+noti;

				chrome.browserAction.setIcon({path:'icon.png'});
				chrome.browserAction.setTitle({title:badgeTitle});
				if(!showZero&&counter==0)chrome.browserAction.setBadgeText({text:''});
				else chrome.browserAction.setBadgeText({text:counter+''});
				if(counter>lastCounter){
					newNotif=true;
					if(playSound)audio.play();
					if(showNoti){
						if(deskNoti)deskNoti.cancel();
						deskNoti=webkitNotifications.createNotification('icon48.png','Notifications','You have '+counter+' new notifications');
						deskNoti.onclick=function(){openPage();this.cancel()};
						deskNoti.show();
						if(timeNoti){window.setTimeout(function(){deskNoti.cancel();},timeNoti);}
					}
				}
				if(newNotif)chrome.browserAction.setBadgeBackgroundColor(BADGE_NEW);
				else if(counter>0)chrome.browserAction.setBadgeBackgroundColor(BADGE_ACTIVE);
			}
			else{
				chrome.browserAction.setIcon({path:'icon-.png'});
				chrome.browserAction.setTitle({title:'Notifications\n--Disconnected--'});
				chrome.browserAction.setBadgeText({text:'?'});
				return;
			}
		}
		else return;
	}
	xhr.send(null);
	window.clearTimeout(timerVar);
	timerVar=window.setTimeout(loadData,timerDelay);
}

function init(){
	pathNew=(localStorage.pathNew||localStorage.pathNew=='')?localStorage.pathNew:pathNew;
	pathZero=(localStorage.pathZero||localStorage.pathZero=='')?localStorage.pathZero:pathZero;
	protocol=(localStorage.useHttps=='yes')?'https':'http';
	alwaysNew=(localStorage.alwaysNew)?(localStorage.alwaysNew=='yes'):false;
	showZero=(localStorage.showZero)?(localStorage.showZero=='yes'):false;
	playSound=(localStorage.playSound)?(localStorage.playSound=='yes'):true;
	showNoti=(localStorage.showNoti)?(localStorage.showNoti=='yes'):true;
	timeNoti=parseInt(localStorage.timeNoti||'20000');
	timerDelay=parseInt(localStorage.refreshInterval||'300000');

	chrome.browserAction.setIcon({path:'icon-.png'});
	chrome.browserAction.setBadgeText({text:'...'});
	chrome.browserAction.setBadgeBackgroundColor(BADGE_LOADING);
	loadData();
}

function tabCallback(tab){
	chrome.tabs.onRemoved.addListener(function(tabId){if(tabId==tab.id)loadData();});
	chrome.windows.update(tab.windowId,{focused:true});
}

function openUrl(uri){
	chrome.windows.getAll({populate:true},function(windows){
		if(windows.length<1){
			chrome.windows.create({url:uri,focused:true});
			return;
		}
		else if(!alwaysNew){
			for(var i=0;i<windows.length;i++){
				var tabs=windows[i].tabs;
				for(var j=0;j<tabs.length;j++){
					if(tabs[j].url.indexOf(uri)!=-1){
						chrome.tabs.update(tabs[j].id,{selected:true},tabCallback); 			// Just Focus
						//chrome.tabs.update(tabs[j].id,{url:uri,selected:true},tabCallback); 	// Update and Focus
						return;
					}
				}
			}
		}
		chrome.tabs.getSelected(null,function(tab){
			if(tab.url=='chrome://newtab/')
				chrome.tabs.update(tab.id,{url:uri},tabCallback);
			else
				chrome.tabs.create({url:uri},tabCallback);
		});
	});
}

function openPage(){
	if(counter>0)
		openUrl(protocol+'://'+host+'/'+pathNew);
	else
		openUrl(protocol+'://'+host+'/'+pathZero);
	newNotif=false;
	loadData();
}

chrome.browserAction.onClicked.addListener(function(tab){
	openPage();
});
