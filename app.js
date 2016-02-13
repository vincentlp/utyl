var uberURL = "https://api.uber.com/v1";
var uber_token = "D7tPZDWmYumZxMLCZf6kExL-zZ1-RUjOA5-YbHa1";
var googlemapsURL = "https://maps.googleapis.com/maps/api";
//var gmaps_key = "AIzaSyCeLJVP12J0nujK1tPeTye7gbij0jNP93g";


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
        // + '?key=' + gmaps_key
        data: {"address" : selectedCity},
        success: function(data) {
            if (data.status == "OK"){
                latitudeFrom = data.results[0].geometry.location.lat;
                longitudeFrom = data.results[0].geometry.location.lng;
                console.log("### Here's the latitude: " +  latitudeFrom + " and the longitude : " + longitudeFrom + " ###");
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
                                .append($("<tr>").attr("id", "uber-row-1")
                                    .append($("<td>").attr("rowspan", products.length).attr("style", "padding-left: 5em;")
                                        .append("<h3>Uber</h3>")
                                    )
                                )

                            for (var i=0; i<products.length; i++){
                                if(i==0){
                                    $("#uber-row-1")
                                        .append($("<td>")
                                            .append($("<input>").attr("type", "checkbox"))
                                            .append(" " + products[i].display_name)
                                        )
                                }
                                else {
                                    $("#productsAvailable")
                                        .append($("<tr>")
                                            .append($("<td>")
                                                .append($("<input>").attr("type", "checkbox"))
                                                .append(" " + products[i].display_name)
                                            )
                                        )
                                }
                            }

                            // append taxi products
                            var taxi_Opt = taxi_options.cities[cityId]
                            $("#productsAvailable")
                                .append($("<tr>").attr("id", "taxi-row-1")
                                    .append($("<td>").attr("rowspan", taxi_Opt.taxi_options_number).attr("style", "padding-left: 5em;")
                                        .append("<h3>Taxi</h3>")
                                    )
                                )
                            for (var j=0; j<taxi_Opt.taxi_options_number; j++){
                                if(j==0){
                                    $("#taxi-row-1")
                                        .append($("<td>")
                                            .append($("<input>").attr("type", "checkbox"))
                                            .append(" " + taxi_Opt.taxi[j].display_name)
                                        )
                                }
                                else {
                                    $("#productsAvailable")
                                        .append($("<tr>")
                                            .append($("<td>")
                                                .append($("<input>").attr("type", "checkbox"))
                                                .append(" " + taxi_Opt.taxi[j].display_name)
                                            )
                                        )
                                }
                            }

                            // append lyft products
                            $("#productsAvailable")
                                .append($("<tr>").attr("id", "lyft-row-1")
                                    .append($("<td>").attr("rowspan", 1).attr("style", "padding-left: 5em;")
                                        .append("<h3>Lyft</h3>")
                                    ).append($("<td>")
                                        .append("Coming Soon :)")
                                    )
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

    var fromAddress = document.getElementById('fromAddress').value;
    var toAddress = document.getElementById('toAddress').value;
    var latitudeFrom = "";
    var longitudeFrom = "";

    // google maps geocode call
    $.ajax({
        url: googlemapsURL + '/geocode/json' + '?key=' + gmaps_key,
        data: {"address" : fromAddress},
        async: false,
        success: function(data) {
            console.log(data);
            if (data.status == "OK"){
                latitudeFrom = data.results[0].geometry.location.lat;
                longitudeFrom = data.results[0].geometry.location.lng;    
            } else {
                console.log(data.status);
            }
        }
    });

    var productsUber = getProductsUber(latitudeFrom, longitudeFrom);
    console.log(productsUber);
}

// GET the Uber products available at a specific location
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