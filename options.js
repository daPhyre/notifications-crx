function $(id){return document.getElementById(id);}
function enableSave(){$('saveButton').disabled=false;}
function disableSave(){$('saveButton').disabled=true;}
window.onload=function(){
	$('pathNew').addEventListener('input',enableSave);
	$('pathZero').addEventListener('input',enableSave);
	//$('useHttps').addEventListener('click',enableSave);
	$('alwaysNew').addEventListener('click',enableSave);
	$('showZero').addEventListener('click',enableSave);
	$('playSound').addEventListener('click',enableSave);
	$('showNoti').addEventListener('click',enableSave);
	$('timeNoti').addEventListener('click',enableSave);
	$('refreshInterval').addEventListener('click',enableSave);
	$('saveButton').addEventListener('click',save);
	$('restoreButton').addEventListener('click',clear);
	$('useBg').addEventListener('click',setUseBg);
	init();
}

function init(){
	$('pathNew').value=(localStorage.pathNew||localStorage.pathNew=='')?localStorage.pathNew:'notifications';
	$('pathZero').value=(localStorage.pathZero||localStorage.pathZero=='')?localStorage.pathZero:'';
	//$('useHttps').checked=(localStorage.useHttps)?(localStorage.useHttps == 'yes'):false;
	$('alwaysNew').checked=(localStorage.alwaysNew)?(localStorage.alwaysNew == 'yes'):false;
	$('showZero').checked=(localStorage.showZero)?(localStorage.showZero == 'yes'):false;
	$('playSound').checked=(localStorage.playSound)?(localStorage.playSound == 'yes'):true;
	$('showNoti').checked=(localStorage.showNoti)?(localStorage.showNoti == 'yes'):true;
	$('timeNoti').value=(parseInt(localStorage.timeNoti)>=0)?parseInt(localStorage.timeNoti)/1000+'':'20';
	$('refreshInterval').value=(parseInt(localStorage.refreshInterval))?parseInt(localStorage.refreshInterval)/60000+'':'5';
	disableSave();
	chrome.permissions.contains({permissions:['background']},function(result){
		$('useBg').checked=result;
	});
}

function save(){
	localStorage.pathNew=$('pathNew').value;
	localStorage.pathZero=$('pathZero').value;
	
	//localStorage.useHttps=$('useHttps').checked?'yes':'no';
	localStorage.alwaysNew=$('alwaysNew').checked?'yes':'no';
	localStorage.showZero=$('showZero').checked?'yes':'no';
	localStorage.playSound=$('playSound').checked?'yes':'no';
	localStorage.showNoti=$('showNoti').checked?'yes':'no';
	
	localStorage.timeNoti=(!isNaN($('timeNoti').value)&&parseInt($('timeNoti').value)>=0)?parseInt($('timeNoti').value*1000):20000;
	localStorage.refreshInterval=(!isNaN($('refreshInterval').value)&&parseInt($('refreshInterval').value)>0)?parseInt($('refreshInterval').value*60000):300000;

	init();
	chrome.extension.getBackgroundPage().init();
}

function clear(){
	if(confirm('Restore all data to default?\nThis can\'t be undone...')){
		localStorage.clear();
		init();
	}
}

function setUseBg(){
	if($('useBg').checked)
		chrome.permissions.request({permissions:['background']});
	else
		chrome.permissions.remove({permissions:['background']});
}
