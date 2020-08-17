const express=require('express');
const app=express();
const cors=require('cors');
const mongodb=require('mongodb');
const bodyParser=require('body-parser');
const request=require('request');
const cheerio=require('cheerio');
//const mongo_url="mongodb://localhost:27017";
const mongourl="mongodb+srv://admin:<password>@cluster0.sln75.mongodb.net/web-scraper?retryWrites=true&w=majority";
app.use(bodyParser());
app.use(cors());
const url1='https://www.amazon.in/JBL-C100SI-Ear-Headphones-Black/dp/B01DEWVZ2C/ref=sr_1_1?dchild=1&keywords=jbl&qid=1597655607&s=computers&sr=1-1';
const url2='https://www.amazon.in/Bose-SoundLink-Wireless-Bluetooth-Speakers/dp/B014WEGG2K/ref=sr_1_5?dchild=1&keywords=bose&qid=1597692819&s=electronics&sr=1-5';
const url3='https://www.amazon.in/Bose-SoundSport-Wireless-Headphones-Aqua/dp/B01E3SNNGW/ref=sr_1_6?dchild=1&keywords=bose&qid=1597692819&s=electronics&sr=1-6';
const url4='https://www.amazon.in/Sennheiser-CX-180-Street-II/dp/B00D75AB6I/ref=sr_1_4?crid=2M4BYQFM3AFM2&dchild=1&keywords=sennheiser+earphone&qid=1597692958&s=electronics&sprefix=sen%2Celectronics%2C324&sr=1-4';
const url5='https://www.amazon.in/JBL-Portable-Wireless-Bluetooth-Speaker/dp/B00TFGWAA8/ref=sr_1_2?dchild=1&keywords=jbl&qid=1597688003&s=electronics&sr=1-2';
const url6='https://www.amazon.in/Philips-SHE1505BK-94-Upbeat-Earphones/dp/B07MZQ5F8S/ref=sr_1_4?dchild=1&keywords=phillips&qid=1597693018&s=electronics&sr=1-4';
const url7='https://www.amazon.in/Apple-MWP22HN-A-AirPods-Pro/dp/B07ZRXF7M8/ref=sr_1_4?dchild=1&keywords=airpods&qid=1597693075&s=electronics&sr=1-4';
const url8='https://www.amazon.in/boAt-BassHeads-100-Headphones-Black/dp/B071Z8M4KX/ref=sr_1_1?dchild=1&keywords=boat&qid=1597693135&s=electronics&sr=1-1';
const url9='https://www.amazon.in/Boat-Rockerz-400-Bluetooth-Headphones/dp/B01J82IYLW/ref=sr_1_4?dchild=1&keywords=boat&qid=1597693135&s=electronics&sr=1-4';
const url10='https://www.amazon.in/Cancelling-Headphones-Detection-Transperancy-Qualcomm/dp/B07XYGLJQZ/ref=redir_mobile_desktop?ie=UTF8&aaxitk=--PLv8Sq5JSqv4i8ahaXJQ&hsa_cr_id=8536032410502&ref_=sbx_be_s_sparkle_mcd_asin_1';

const urls=[url1,url2,url3,url4,url5,url6,url7,url8,url9,url10];
app.get("/scrape-amazon",async function getData(req,res){
    var $,products=[];
    urls.forEach((item)=>request(item, async function(error, response, html) {
        let product_details={name:'',price:'',image:'',features:[]}
         $=cheerio.load(html);
        $('#productTitle').each(function(i, element) {
            
            var el = $(this);
            var name = el.text().trim();
            //console.log(name);
            product_details.name=name;
        })
        $('#priceblock_ourprice').each(function(i, element) {
            
            var el = $(this);
            var price = el.text();
            //console.log(price);
            product_details.price=price;
        })
         var img=$('#landingImage').attr('data-old-hires');
         product_details.image=img;
         //console.log(img);
         let featureDetails = [];

        $('#feature-bullets>ul>li>span').each((i, el) => {
            featureDetails.push($(el).text().replace(/[\n\t]/g, '').trim());
        });
        
        product_details.features=featureDetails;
        //console.log(product_details)
        try{
            let client=await mongodb.connect(mongourl);
            let db=client.db("web-scraper");
            db.collection('amazon').insertOne(product_details);
            client.close();

        }catch(err){
            console.log(err);
        }
        products.push(product_details);
        if(urls.indexOf(item)===urls.length-1)
            res.send(products);
        
    }))
    
})

app.get("/get-amazon", async(req,res)=>{
    try{
        let client=await mongodb.connect(mongourl);
        let db=client.db("web-scraper");
        let data=await db.collection("amazon").find().toArray();
        res.send(data);
        client.close();
    }catch(err){
        console.log(err);
    }
})
app.listen(process.env.PORT || 4040,()=>{
    console.log("listening..");
})