//Here we tell the server wich url to visit to launch the periodic tasks via crontab
let tasksrest = {};

tasksrest.assign ='https://yourserver/licences/assign';
tasksrest.mailing = 'https://yourserver/licences/mailing';


module.exports=tasksrest;