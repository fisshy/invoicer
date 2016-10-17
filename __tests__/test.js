import test from 'ava';
import invoicr from '../index.js';
const fs = require('fs');

test('Ensure html from render', t => {
    let template = fs.readFileSync('../templates/test.html', 'utf8');
    let html = invoicr.render('test', { name : 'Joachim '});
    t.true(html != "");
});

test.cb('Ensure test.pdf is created', t => {
    t.plan(1);
    invoicr.pdf('test', { name : 'Joachim '}, (err, stream) => {
        if(err) {
            t.fail();
            t.end();
        }
        stream.pipe(fs.createWriteStream('./test.pdf'));
        stream.on('close', () => {
            t.pass();
            t.end();
        });
    });
});

test.cb('Ensure se-invoice.pdf is created', t => {
    t.plan(1);
    let model = require('./invoice-model.json')
    invoicr.pdf('se-invoice', model, (err, stream) => {
        if(err) {
            t.fail();
            t.end();
        }
        stream.pipe(fs.createWriteStream('./invoice.pdf'));
        stream.on('close', () => {
            t.pass();
            t.end();
        });
    });
});
