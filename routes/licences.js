var express = require('express');
const db = require('../db');
var router = express.Router();
var fs = require('fs');
var csvParser = require('csv-parse');
const nodemailer = require("nodemailer");
var lang = require('../config/lang_conf')
var emailconf = require('../config/email')
router.post('/request/',(req,res,next) =>{	
	let pnum = db.numlicenses(req.body.email);	
	pnum.then((num) => {
		if (num<db.maxlicenses){
				let userlimit = db.maxlicenses - num;
				let newlicences = Math.min(parseInt(req.body.number),userlimit);
			 	let todayDate = new Date().toISOString().slice(0,10);
               	let regmail = emailconf.filter;
				if (regmail.test(req.body.email)){
					for (i=0;i<newlicences;i++)
					{	
						let preqlicence = db.reqlicense(req.body.email,todayDate);

					}			
					res.status(201).send(lang.processing);
				}else{
					res.status(201).send(lang.invaliddomain);	
				}
			}
			else{
				res.status(201).send(lang.limitreached);	
			}					
			}	
	).catch((e)=>{
		res.status(201).send('error');
	});
});

router.get('/load', async (req, res, next) => {  	
	fs.readdir("edxlicences/new/", (err,files) => {
		if (err) {
        	console.log('Unable to scan directory: ' + err + '\n');
    	} 
		files.forEach(function(file){	
			let filepath = "edxlicences/new/" + file
			fs.createReadStream(filepath)
			.on('error', () => {
				console.log('errorcreatingstream');
				// handle error
			})
			.pipe(csvParser())
			.on('data', async (row) => {
				// use row data
				try{
				    
					if (row['0'] !='Code' && row[0] !='This row applies to all vouchers')
					{
						let results = await db.createlic('EDXORG',row[0],row[5]);		  

						let str = `added licence ${row[0]} with ${row[5]}\n`
						console.log(str);
					}
					
				}catch(e){
					console.log(e);
				}				
			})
			.on('end', () => {
				// handle end of CSV
				 fs.rename( "edxlicences/new/" + file,  "edxlicences/processed/" + file, function (err) {
					if (err) {
						console.log('error moving licence file\n');	
					}					
				});
			})			
		});
	});	
	res.send('Licence files loaded into the database.');
});





function sendMail(receiver,licences){
	return new  Promise((resolve,reject) => {		
	try{
		if (receiver !='')
		{

			let codigoslicencia =''
			for (i=0;i<licences.length;i++)
			{
				codigoslicencia += '\n' + licences[i];
			}

			let transporter = nodemailer.createTransport({
				host: "smtp.upv.es",
				port: 25,
				secure: false, // true for 465, false for other ports					
			});	
			
			var mailOptions = {
				from: emailconf.from, // sender address
				to: receiver, // list of receivers
				subject: emailconf.subject , // Subject line
				text:  + codigoslicencia + emailconf.mailTextFooter, // plain text body
			};
			transporter.sendMail(mailOptions, (error, response)=>{
				if(error){
					reject(error);
				}
				else{
					resolve(response.message);					
				}   
			});
			
		}
		else{
			resolve('empty');
			}
	}catch(e){
		reject(e);
	} 
});
}


router.get('/mailing',async function(req, res, next) {
	let results = await db.getmailing();	
	
	let emails = {}
	for (i=0;i<results.length;i++) {
		let user = results[i]['email'];
		if (!emails[user]) {
			emails[user] = {
				'id' : [],
				'licenses' : []
			};
		}
		emails[user]['id'].push(results[i]['id']);
		emails[user]['licenses'].push(results[i]['licencia']);
	}
	
	let result='ok';
	for (var email in emails)
	{
		try {
			let mailsent = await sendMail(email,emails[email]['licenses']);	
			let results = await db.updatemailing(emails[email]['id']);
		} catch(e) {
			result = e;
		}
	}
	res.send(result);
});

router.get('/assign', async (req, res, next) => {  		
	let results = await db.assignlic();
	res.send(results);
});


module.exports = router;
