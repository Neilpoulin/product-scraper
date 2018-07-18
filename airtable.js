var Airtable = require('airtable');

const apiKey = 'keyEWxYQ7cjNjF14Y'

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: apiKey
});
var base = Airtable.base('appoovw05RGYlzFeS');

function uploadProduct(product)
{
    createRecord(product).then(recordId => {
        console.log('create record Id: ', recordId)
    })
}
module.exports.uploadProduct = uploadProduct;


function createRecord({name, materials, tags, price="", taxonomy, seller, url, imageUrl}){
    return new Promise((resolve, reject) => {
        let row = {name, materials, tags, price, taxonomy, seller, url, images: [{url: imageUrl}]}
        base('Products').create(row, function(err, record) {
            if (err) {
                console.error(err);
                reject(err)
            }
            console.log(record.getId());
            resolve(record.getId());
        })
    });
}
