var fs = require('fs');
var processing = false;
var databaseConf = require('../config/database_conf');

const mysql = require('mysql');

const pool = mysql.createPool(databaseConf.dbconf);

let licencesdb = {}

licencesdb.maxlicenses = 5;

licencesdb.numlicenses = (email) =>{
	 return new  Promise((resolve,reject) => {		
		 try{
		   pool.query('select count(*) as num from solicitudes WHERE email = ?',[email],(err,results)=>{
			  if (err){							
				  reject(err);
			  }
			  else{
				  resolve(results[0]['num']);		
			  }
          });
		 }catch(e){
		 	reject(e);
		 } 
    });
}

licencesdb.getmailing = (email) =>{
	 return new  Promise((resolve,reject) => {		
		 try{
		   pool.query('SELECT solicitudes.id,email,licencias.licencia,url,enviada FROM `solicitudes`,licencias WHERE solicitudes.licencia=licencias.idlicencias and solicitudes.enviada is NULL ORDER BY email',(err,results)=>{
			  if (err){							
				  reject(err);
			  }
			  else{
				  resolve(results);		
			  }
          });
		 }catch(e){
		 	reject(e);
		 } 
    });
}

licencesdb.reqlicense = (email,todayDate) => {
	 return new  Promise((resolve,reject) => {
		 try{
			 pool.query("INSERT INTO solicitudes (email,fecha) VALUES (?,?)",[email,todayDate],(err,results)=>{
				 if (err){							
					 reject(err);
				 }
				 else{
					 resolve('ok');		
				 }
			 });
		 }catch(e){
		 	reject(e);
		 }
				
    });
}
   

licencesdb.updatemailing = (solicitudesId) => {
	 return new  Promise((resolve,reject) => {
		 let todayDate = new Date().toISOString().slice(0,10);		 
		 try{
			 pool.query("UPDATE solicitudes SET enviada=? where id in (?)",[todayDate,solicitudesId],(err,results)=>{
				 if (err){							
					 reject(err);
				 }
				 else{
					 resolve('ok');		
				 }
			 });
		 }catch(e){
		 	reject(e);
		 }
				
    });
}


licencesdb.createlic = (platform,license,url) =>{	
		return new  Promise((resolve,reject) => {
			try{
				pool.query('INSERT INTO licencias (plataforma,licencia,url) VALUES (?,?,?)',[platform,license,url],(err,results)=>{
					if (err){
						console.log("error inserting the license " + license + "\n");
						reject(err);
					}
				});
				resolve("ok");
			}catch(e){
			reject(e);
			}
    	});
    
}

licencesdb.assignlic = () =>{	
	
		return new  Promise((resolve,reject) => {
	try{	
	if (processing == true)
	{			
		resolve('A task already processing please wait');
	}
	else{	 
	 processing = true;		
	 pool.query('SELECT idlicencias,plataforma,licencia,url FROM `licencias` WHERE entregada is NULL', (err,licenses) => {		
		if (err){
			reject(err);
		}
		console.log('licencias = ' + licenses.length);	 
		if (licenses.length>0){
			console.log(licenses.length + 'cuantas?');
			pool.query('SELECT id,email,licencia,fecha FROM `solicitudes` WHERE licencia is NULL order by fecha', (function(licenses){
				return function (err,solicitudes,fields) {
					console.log('aqui tengo solicitudes y licencias para procesar\n');
					console.log('solicitudes' + solicitudes.length.toString() + '\n');
					console.log('licencias' + licenses.length.toString() + '\n');
					for (i=0;i<solicitudes.length;i++)
					{
						pool.query('UPDATE `solicitudes` SET licencia = ? WHERE id = ?',[licenses[i]['idlicencias'],solicitudes[i]['id']],(err,results)=>{
							if (err){
								console.log("error assigning the license " + licenses[i]['idlicencias'].toString() + "\n");							
								reject(err);
							}
							});
						pool.query('UPDATE `licencias` SET entregada = ? WHERE idlicencias = ?',[solicitudes[i]['id'],licenses[i]['idlicencias']],(err,results)=>{
							if (err){
								console.log("error assigning the license " + licenses[i]['idlicencias'].toString() + "\n");
								reject(err);
							}
							});
						
					}
					
					};	
			})(licenses));
			resolve('Licences assigned to the pending requests');
		}
		else{			
			resolve('0 Licenses remaining');
		}
       
			
        });	
		
	processing = false;
	}
	}
	catch(e){
		reject(e);
	}
    });
}



module.exports = licencesdb;