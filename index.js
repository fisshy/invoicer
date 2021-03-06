const fs = require('fs');
const htmlToPdf = require('html-pdf');

const AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';

var s3bucket = new AWS.S3({
    params: {
        Bucket: process.env.AWS_S3_INVOICE_BUCKET
    }
});

const mustasche = require('mustache');
const log = require('./log');

/* TODO: Should probably use redis/memcache for this */
const template = {};
const templateText = {};

const getTemplate = (templateName) => {
    if(template[templateName]) {
        return template[templateName];
    }

    try {
        let tmp = fs.readFileSync(`${__dirname}/templates/${templateName}.html`, 'utf8'); /* maybe verify before */
        if(tmp) {
            template[templateName] = tmp;
        }
        return tmp;
    } catch(e) {
        console.log("error", e);
        log.error(e, 'invoice pdf generator');
        return null;
    }
}

const text = (templateName) => {
    let textTemplateName = `${templateName}-text`;
    if(!templateText[textTemplateName]) {
        try {
            let text = require(`${__dirname}/templates/${textTemplateName}.json`);
            if(text) {
                templateText[textTemplateName] = text;
                return text;
            }
        } catch(e) {
            console.log("error", e);
            log.error(e, 'invoice pdf generator');
            return null;
        }
    } else {
        return templateText[textTemplateName];
    }
}
const updateText = (data) => {
    if(!data.text || !data.model || !data.model.rr) return data;
    if(!data.text.rrWork) return data;
    data.text.rrWork = data.model.rr.type === "Rut" ? data.text.rutWork : data.text.rrWork;
    console.log("update text", data);
    return data;
}

const render = (templateName, data) => {
    let htmlTemplate = getTemplate(templateName);
    if(htmlTemplate == null) {
        return null;
    }
    if(!data.text) {
        data.text = text(templateName);
    }
    let html = mustasche.render(htmlTemplate, updateText(data));
    return html;
}

const  pdf = (templateName, data, next) => {
    let html = render(templateName, data);
    if(html == null) {
        return next('TEMPLATE_NOT_FOUND');
    }
    let options = {
        format: 'Letter',
        "header": {
            "height": "10mm",
            "contents": render('header', data)
          },
          "footer": {
            "height": "10mm",
            "contents": {
              default: '<div style="text-align: center;"><strong style="color: #444;">{{page}}</strong>/<strong>{{pages}}</strong></div>'
            }
        },
    };
    htmlToPdf.create(html, options).toStream(next);
}

const uploadS3 = (templateName, data, next) => {
    pdf(templateName, data, (err, stream) => {
        if(err) {
            log.error(err, 'invoice pdf generator');
            console.log("Error uploading data: ", err);
            return next('UNHANDLED_EXCEPTION');
        }

        const s3Params = {
            Key: data.model.fileName,
            Expires: new Date(Date.now() + 31536000),
            CacheControl: `public, max-age=${31536000}`,
            Body: stream,
            ContentType: 'application/pdf',
            ACL: 'public-read'
        };

        s3bucket.upload(s3Params, function(err, result) {
            if (err) {
                log.error(err, 's3-upload');
                console.log("Error uploading data: ", err);
                return next('UNHANDLED_EXCEPTION');
            } else {
                return next(null, result.Location);
            }
        });
    });
}

module.exports = {
    pdf, render, uploadS3
}
