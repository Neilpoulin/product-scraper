var axios = require('axios');
var airtable = require('./airtable')

// const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const apiKey = 'fx0i3j3w2letmbq2g6rxlyk4'
const etsyDomain = 'https://openapi.etsy.com/v2'
const listingIdPath = '/listings/:listingId'

/**
 * Responds to any HTTP request.
 *
 * @param {!Object} req HTTP request context.
 * @param {!Object} res HTTP response context.
 */
exports.helloWorld = (req, res) => {
    let url = req.query.url;
    if ( !url){
        return res.status(400).send('You must provide a URL as a query parameter')
    }

    processUrl(url, true).then((records) => {
        return res.status(200).send({message: 'successfully processed url', records});
    }).catch(error => {
        return res.status(400).send(JSON.stringify(error))
    });
};


exports.testRun = function(url){
    processUrl(url, false)
}

function processUrl(url, doUpload=true) {
    if (url.indexOf('www.etsy.com') !== -1){
        let listingId = url.split('www.etsy.com/')[1].split('/')[1]
        console.log('parsed listing ID ', listingId, 'from url')
        return getEtsyListing(listingId, url).then(listings => {
            console.log('listings', listings)
            let records = listings.map(listing => transformEtsyListing(listing, url));
            if (doUpload)
            {
                records.forEach(record => airtable.uploadProduct(record))
            }
            return records
        })
    } else {
        return Promise.reject({error: 'unsupported site.'})
    }
}

function getEtsyListing(listingId)
{
    return axios.get(`${etsyDomain}${listingIdPath.replace(':listingId', listingId)}?api_key=${apiKey}&includes=MainImage`)
        .then(({data}) => data).then(data => {
            return data.results;
        })
}


function transformEtsyListing(listing) {
    return {
        tags: listing.tags.map(tag => tag.toLowerCase()).join(', '),
        materials: listing.materials.map(material => material.toLowerCase()).join(', '),
        taxonomy: listing['taxonomy_path'].map(path => path.toLowerCase()).join(', '),
        name: listing.title,
        seller: 'Etsy',
        price: listing.price,
        url: listing.url,
        imageUrl: getImageUrlEtsy(listing),
        description: listing.description,
    }
}

function getImageUrlEtsy(listing)
{
    let fullImageUrl = listing.MainImage["url_fullxfull"]
    return fullImageUrl
}
