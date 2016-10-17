## Microservice to generate Invoice/PDF and upload to S3

## Install
```
$ npm install
```

## Test
```
$ npm test
```

### Environment
```
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_KEY,
    AWS_S3_INVOICE_BUCKET
```

## Generate invoices and upload to Amazon S3

```
$ npm start
```
```
curl -X POST -H "Cache-Control: no-cache" -H "Postman-Token: 7ee0f435-0c82-d90f-5845-9dea08b023bb" -d '{
	"name": "Joachim",
	"fileName": "test.pdf"
}' "http://localhost:8082/invoice/s3"
```

### Swedish invoice
![alt text](https://github.com/fisshy/invoicer/blob/master/pdf.JPG "Example of generated")
