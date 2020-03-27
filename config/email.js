//here we set the regex to filter the email and the mail template

let mail_confs = {};

mail_confs.filter =  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@.*upv.*.es$/	;
mail_confs.mailFrom = '"MOOCS UPV" <moocs@upv.es>';
mail_confs.mailSubject= " Aquí tienes tu código de certificado verificado gratuito";
mail_confs.mailTextMain = "Recibes este correo porque te has registrado recientemente en el  programa de certificados verificados gratuitos para cursos MOOC, ofertado por la Universidad Politécnica de Valencia en colaboración  con edX y otras universidades.  A continuación encontrarás el código solicitado.\n";
mail_confs.mailTextFooter = "\nTienes las intruciones para utilizarlo en\nhttps://edxcovid19.webs.upv.es/faq.html";

module.exports = mail_confs;