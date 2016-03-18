# example-service

[![Build Status](https://travis-ci.org/c24-microws-mar/cart-service.svg)](https://travis-ci.org/c24-microws-mar/cart-service)
[![Dependencies](https://david-dm.org/c24-microws-mar/cart-service.svg)](https://david-dm.org/badges/shields)

This is the cart service.

Interface routes: 
   Get a cart (http.get): /carts/id 
      the response will be in the form of:
    {
        totalCost: 55.33,
        created: unixtimestamp
        modified: unixtimestamp
        items: [{
          itemId: ddd //the item id as given by the catalog service
          count: 5 //represents the number of times this item is in the basket
          itemDetails: {
            //All details about the item as delivered by the catalog-service/cd/id, please consult their readme.
          }
        },{
          itemId: cccc
          count: 2 //represents the number of times this item is in the basket
          itemDetails: {
            //All details about the item as delivered by the catalog-service/cd/id, please consult their readme.
          }
        }
      ]
    }

   Create a new cart (http.post): /carts 
      the payload should be a {itemId: xxxx, count: 2} where xxxx is the item id given by the catalog service
      the response will contain a cart id which will be used for further interaction with the cart: {cartId: yyyyy}

   Add an item to the cart (http.put): /carts/id
      the payload should be a {[{itemId: xxx, count: 5}, {itemId: yyy, count: 2},...]} where xxx is the item id given by the catalog service
      the response be 200 for a successful response, 500 for any failure.


## How to use

The following npm scripts are available:

~~~ sh
npm start       // starts the application
npm test        // runs all tests
npm run watch   // runs a file watcher to restart and test on each file change
~~~

## License

MIT
