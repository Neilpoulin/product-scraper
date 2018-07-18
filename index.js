var axios = require('axios');
var airtable = require('./airtable')

const createCsvWriter = require('csv-writer').createObjectCsvWriter;


const apiKey = 'fx0i3j3w2letmbq2g6rxlyk4'
const etsyDomain = 'https://openapi.etsy.com/v2'
const listingsPath = '/listings/active'
const listingIdPath = '/listings/:listingId'

const csvWriter = createCsvWriter({
    path: 'output/products.csv',
    header: [
        {id: 'title', title: 'Title'},
        {id: 'tags', title: 'Tags'},
        {id: 'materials', title: 'Materials'},
        {id: 'image', title: 'Image'},
    ]
});

const inputUrl = 'https://www.etsy.com/listing/568136358/light-grey-dog-bed-cover-custom?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=dog%20beds&ref=sc_gallery-1-2&plkey=c0d6159e3de06ca82b43102fed6bbba5e9f999ad:568136358&more_colors=1';

function start(){
    // getListings();
    processUrl(inputUrl)
}

function processUrl(url) {
    if (url.indexOf('www.etsy.com') !== -1){
        let listingId = url.split('www.etsy.com/')[1].split('/')[1]
        console.log('parsed listing ID ', listingId, 'from url')
        getEtsyListing(listingId, url)
    }
}

function getEtsyListing(listingId, url)
{
    axios.get(`${etsyDomain}${listingIdPath.replace(':listingId', listingId)}?api_key=${apiKey}&includes=MainImage`).then(({data}) =>  data).then(data => {
        processListings(data.results, url);
    })
}

function getListings()
{
    axios.get(`${etsyDomain}${listingsPath}?api_key=${apiKey}&includes=MainImage`).then(({data}) =>  data).then(data => {
        // console.log('data', data);
        const firstListings = data.results[0];
        processListings(data.results);
    })
}

function processListings(results, originalUrl)
{
    let records = results.map(listing => {
        console.log('listing', listing)
        airtable.uploadProduct({
            tags: listing.tags.map(tag => tag.toLowerCase()).join(', '),
            materials: listing.materials.map(material => material.toLowerCase()).join(', '),
            taxonomy: listing['taxonomy_path'].map(path => path.toLowerCase()).join(', '),
            name: listing.title,
            seller: 'Etsy',
            price: listing.price,
            url: originalUrl,
            imageUrl: getImageUrlEtsy(listing)
        })

        let record = {
            tags: listing.tags.map(tag => tag.toLowerCase()).join(', '),
            materials: listing.materials.map(material => material.toLowerCase()).join(', '),
            title: listing.title,
            name: listing.title,
            image: getImageUrlEtsy(listing)
        };
        return record;
    });


    csvWriter.writeRecords(records);
}

function getImageUrlEtsy(listing)
{
    let fullImageUrl = listing.MainImage["url_fullxfull"]
    return fullImageUrl
}

start();
