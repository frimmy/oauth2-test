$(function() {
    var auth = {
        // 
        // Updated with my own Yelp auth tokens
        // 
        consumerKey: 'hGEUfs4j4qnmYDe8qFteGA',
        consumerSecret: 'fOKVDDB5AKsCSHTFFa-CLRA1gNY',
        accessToken: 'XPELaGGKTEX5zZUgE8B4tTvvM3rMDpD3',
        // This example is a proof of concept for using Yelp's v2 API with javascript. 
        // I wouldnk't actually want to expose my access token secret like this in a real app, but I might have to for my API hack...
        accessTokenSecret: 'zcTu6xvV3hjyGaslbqWSks1y2Ns',
        serviceProvider: {
            signatureMethod: 'HMAC-SHA1'
        }
    };

    /*updated terms to indicate that devs can enter more than one search term*/
    var terms = "food+pizza";
    var near = "New+York+City";

    /*Object used by Oath to provide dev secrets on OAuth signature*/
    var accessor = {
        consumerSecret: auth.consumerSecret,
        tokenSecret: auth.accessTokenSecret
    };

    // Cleaned up parameter call 
    
    var parameters = [
        ['term', terms],
        ['location', near],
        // Even if developer doesn't have a call back function defined, user has to pass in a name string for the OAuth signature on the URL
        ['callback', 'cb'],
        ['oauth_consumer_key', auth.consumerKey],
        ['oauth_consumer_secret', auth.consumerSecret],
        ['oauth_token', auth.accessToken],
        ['oauth_signature_method', 'HMAC-SHA1']
        ];
    /*action represents simple search for YELP business, and GET for pulling back data*/
    var message = {
        'action': 'http://api.yelp.com/v2/search',
        'method': 'GET',
        'parameters': parameters
    }

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    
    var parameterMap = OAuth.getParameterMap(message.parameters);
    parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);
    console.log(parameterMap);

    // var delay = 2000;
    var geocoder = new google.maps.Geocoder();;
    var map;
    
    
    function codeAddress(address, next) {
        /* TODO: assign address var to business variables */ 
        geocoder.geocode({'address':address}, function(results, status)
            {   
                // sets the current business to geolocate as a jQuery object
                var $businessGeo = $('p#business-'+nextAddress);

                /*if that worked*/
                if (status == google.maps.GeocoderStatus.OK) {
                    /*we assume the first Markerer is the one we want*/
                    console.log("called codeAddress!");
                    newAddressesGeoLocated[nextAddress] = results[0].geometry.location;
                    // console.log(newAddressesGeoLocated[nextAddress]);
                    // Attach this info to the paragra
                    $businessGeo.html($businessGeo.html()+" " + results[0].geometry.location + ' delay ' + delay);
                    console.log(newAddressesGeoLocated);
                    /* TODO set geomarkers with address*/
                }
                // ========== Decode the error status ===========
                else {
                    //  === if we're sending the requests too fast, try this one again and increase the delay
                    if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT /*or status == */) {
                        nextAddress --;
                        delay++;
                    } else {
                        var reason ="Code "+status;
                        
                        // console.log(businessGeo);
                        $businessGeo.html($businessGeo.html()+ ' error=' + reason + '(delay = '+ delay+' ms)');
                    }
                }
                next();
            }
        );
    }
    
    function theNext() {
        if (nextAddress < Globaladdresses.length) {
            setTimeout(function() {
                codeAddress(Globaladdresses[nextAddress],theNext)
            },delay);
            nextAddress++;
        } else {
            console.log("finito");
            console.log(newAddressesGeoLocated);
        }
    }


    // no no
    var Globaladdresses = [];

    function cb (data) {
        var addresses = [];
    	console.log(data.businesses);

        y = data.businesses.length - 1;
        for (var i = 0; i <= y; i++) {
            // assign local variables address and city for geolocation
            var address = data.businesses[i].location.address[0];
            var city = data.businesses[i].location.city;
            var state = data.businesses[i].location.state_code;
            var zip = data.businesses[i].location.postal_code;

            var count = i+1
            addresses[i] = address + ' ' + city + ' ' + state + ' ' + zip;  

            $('#foo').append('<p id="business-'+(i+1)+'">' + count +') <img src=' + 
                data.businesses[i].image_url + ' alt="yelp photo"> ' + 
                addresses[i]+/*
                codeAddress(address+' '+city+' '+ country) + ' ' +*/
                 ' </p>');
        }
        
        

        return addresses
    }

    var delay = 100;
    var nextAddress = 0;
    var newAddressesGeoLocated = [];

    

    // specifically, OAuth will not allow for non specific or randomly generated json call back name by convenience methods i.e. $.get wouldn't work
    // user must specifiy the callback method name 
    $.ajax({
    	url: message.action,
    	data: parameterMap,
    	cache: true,
    	dataType: 'jsonp',
    	// jsonpCallback: 'cb',
    	success: function(data, textStats, XMLHttpRequest) {
            Globaladdresses = cb(data);
            console.log(Globaladdresses);
    	}
    })
    .done(function() {
        console.log("success");
    })
    .done(function() {
    	console.log("error");
    })
    .always(function() {
    	console.log("complete");
        theNext();
        console.log(newAddressesGeoLocated);
    });
});    