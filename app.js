var uberURL = "https://api.uber.com/v1";
var uber_token = "D7tPZDWmYumZxMLCZf6kExL-zZ1-RUjOA5-YbHa1";
var googlemapsURL = "https://maps.googleapis.com/maps/api";

var taxi_options = {
    "cities" : [
        {
            "name" : "New_York_City",
            "taxi_options_number" : 2,
            "taxi" : [
                {
                    "display_name" : "Yellow"
                },
                {
                    "display_name" : "Black"
                }
            ]
        },
        {
            "name" : "Philadelphia",
            "taxi_options_number" : 1,
            "taxi" : [
                {
                    "display_name" : "Orange"
                }
            ]
        },
        {
            "name" : "Washington_D.C.",
            "taxi_options_number" : 1,
            "taxi" : [
                {
                    "display_name" : "White"
                }
            ]
        },
        {
            "name" : "San_Francisco",
            "taxi_options_number" : 1,
            "taxi" : [
                {
                    "display_name" : "Red"
                }
            ]
        },
        {
            "name" : "Paris",
            "taxi_options_number" : 1,
            "taxi" : [
                {
                    "display_name" : "Black"
                }
            ]
        }
    ]
};

function getAvailableProducts(){
    var selectedCity = $('#pickCity option:selected').text().trim();
    var cityId = $('#pickCity').val();
    $.ajax({
        url: googlemapsURL + '/geocode/json',
        data: {"address" : selectedCity},
        success: function(data) {
            if (data.status == "OK"){
                latitudeFrom = data.results[0].geometry.location.lat;
                longitudeFrom = data.results[0].geometry.location.lng;
                
                var products = [];
                // GET Uber products available in specified city
                $.ajax({
                    url: uberURL + '/products' + '?server_token=' + uber_token,
                    data: {"latitude" : latitudeFrom, "longitude" : longitudeFrom},
                    success: function(data) {
                        data["products"].forEach(function(data) {
                            products.push(data);
                        });
                        console.log(taxi_options.cities[cityId].taxi_options_number);

                        // append uber products
                        $("#productsAvailable")
                            .empty()
                            .append($("<tr>")
                                .append($("<td>").attr("style", "padding-left: 5em;")
                                    .append("<h3>Uber</h3>")
                                ).append($("<td>").attr("id", "uber-products"))
                            )
                        for (var i=0; i<products.length; i++){
                            $("#uber-products")
                                .append($("<div>").attr("class", "checkbox")
                                    .append($("<input>").attr("type", "checkbox").attr("id", products[i].display_name))
                                    .append($("<label>").attr("for", products[i].display_name)
                                        .append(" " + products[i].display_name)
                                    )
                                )
                        }

                        // append taxi products
                        var taxi_Opt = taxi_options.cities[cityId]
                        $("#productsAvailable")
                            .append($("<tr>")
                                .append($("<td>").attr("style", "padding-left: 5em;")
                                    .append("<h3>Taxi</h3>")
                                ).append($("<td>").attr("id", "taxi-products"))
                            )
                        for (var j=0; j<taxi_Opt.taxi_options_number; j++){
                            $("#taxi-products")
                                .append($("<div>").attr("class", "checkbox")
                                    .append($("<input>").attr("type", "checkbox").attr("id", taxi_Opt.taxi[j].display_name))
                                    .append($("<label>").attr("for", taxi_Opt.taxi[j].display_name)
                                        .append(" " + taxi_Opt.taxi[j].display_name)
                                    )
                                )
                        }

                        // append lyft products
                        $("#productsAvailable")
                            .append($("<tr>")
                                .append($("<td>").attr("style", "padding-left: 5em;")
                                    .append("<h3>Lyft</h3>")
                                ).append($("<td>").attr("id", "lyft-products"))
                            )
                        $("#lyft-products")
                            .append($("<div>").attr("class", "checkbox")
                                .append("Coming Soon :)")
                            )    
                    }
                });
                return products;
            } else {
                console.log(data.status);
            }
        }
    });


}

function compare(){

    //document.getElementById("productsAvailable").style.display = "none";
    var start_Address = document.getElementById('fromAddress').value;
    var end_Address = document.getElementById('toAddress').value;
    var start_latitude = "";
    var start_longitude = "";
    var end_latitude = "";
    var end_longitude = "";

    var checkedProducts = [];
    $("input[type='checkbox']:checked").each(function(){
        checkedProducts.push($(this).attr("id"));
    });
    console.log(checkedProducts)

    // google maps geocode call
    $.ajax({
        url: googlemapsURL + '/geocode/json',
        data: {"address" : start_Address},
        success: function(data) {
            if (data.status == "OK"){
                start_latitude = data.results[0].geometry.location.lat;
                start_longitude = data.results[0].geometry.location.lng;
                console.log("### Here's the start_latitude: " +  start_latitude + " and the start_longitude : " + start_longitude + " ###");  
                
                $.ajax({
                    url: googlemapsURL + '/geocode/json',
                    data: {"address" : end_Address},
                    success: function(data) {
                        if (data.status == "OK"){
                            end_latitude = data.results[0].geometry.location.lat;
                            end_longitude = data.results[0].geometry.location.lng;
                            console.log("### Here's the end_latitude: " +  end_latitude + " and the end_longitude : " + end_longitude + " ###");  
                            
                            var prices = estimatesPriceUber(start_latitude, start_longitude, end_latitude, end_longitude)
                            // append uber results
                            $("#estimateResults").empty();
                            for (var k=0; k<prices.length; k++){
                                for (var l=0; l<checkedProducts.length; l++){
                                    if (checkedProducts[l] == prices[k].display_name){
                                        $("#estimateResults")
                                            .append($("<tr>")
                                                .append($("<td>").attr("style", "padding-left: 5em;")
                                                    .append(prices[k].display_name)
                                                ).append($("<td>")
                                                    .append(prices[k].estimate)
                                                )
                                            )
                                    }
                                }
                            }
                        } else {
                            console.log("Failed getting end coordinates: " + data.status);
                        }
                    }
                });

            } else {
                console.log("Failed getting start coordinates: " + data.status);
            }
        }
    });

}

// GET the Uber products available at a specific location -- not used?
function getProductsUber(latitudeFrom, longitudeFrom){
    var products = [];
    // GET v1-products
    $.ajax({
        url: uberURL + '/products' + '?server_token=' + uber_token,
        data: {"latitude" : latitudeFrom, "longitude" : longitudeFrom},
        async: false,
        success: function(data) {
            console.log(data);
            data["products"].forEach(function(data) {
                products.push(data);
            });
        }
    });
    return products;
}

// GET the Uber products available at a specific location
function estimatesPriceUber(start_latitude, start_longitude, end_latitude, end_longitude){
    var prices = [];
    // GET estimates price
    $.ajax({
        url: uberURL + '/estimates/price' + '?server_token=' + uber_token,
        data: {"start_latitude" : start_latitude, "start_longitude" : start_longitude, "end_latitude" : end_latitude, "end_longitude" : end_longitude},
        async: false,
        success: function(data) {
            console.log(data);
            data["prices"].forEach(function(data) {
                prices.push(data);
            });
        }
    });
    return prices;
}