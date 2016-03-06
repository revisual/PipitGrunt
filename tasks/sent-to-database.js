/**
 * Created by Pip on 15/05/2015.
 */
module.exports = function ( grunt ) {

   var format = require( 'pg-format' )
      , Promise = require( 'promise' )
      , pg = require( 'pg' );

   var that = this;

   var sendQuery = function ( sql, url ) {
      return new Promise( function ( resolve, reject ) {
         pg.connect( url, function ( err, client, done ) {

            if (client == null) {
               reject( err );
               return;
            }

            client.query( sql, function ( err, result ) {

               done();

               if (err) {
                  reject( err )
               }
               else {
                  resolve( result );
               }
            } );
         } );
      } );
   };

   this.createProjectRow = function ( json, url ) {
      var sql = format(
         'INSERT INTO %I(%I, %I, %I, %I) VALUES(%L, %L, %L, %L)',
         'project',
         'id', 'title', 'priority', 'private',
         json.id, json.title, json.index, true );
      return sendQuery( sql, url );
   };

   this.createBookRow = function ( json, project, url ) {
      var sql = format(
         'INSERT INTO %I(%I, %I, %I, %I, %I, %I, %I, %I, %I, %I) VALUES(%L, %L, %L, %L, %L, %L, %L, %L, %L, %L)',
         'book',
         'id', 'title', 'project', 'firstpage', 'lastpage', 'xlarge','large','medium','small','xsmall',
         json.id, json.title, project, json.range.split("-")[0], json.range.split("-")[1], json.sizes.xlarge , json.sizes.large, json.sizes.medium, json.sizes.small, json.sizes.xsmall );
      return sendQuery( sql, url );
   } ;

   this.createBooks = function ( json, url ) {
      var promises = [];

      json.content.forEach( function ( item, i, a ) {
         promises.push( that.createBookRow(item, json.id, url))
      } );

      return Promise.all( promises );
   };



   return function () {
      var done = this.async();
      var name = this.name;


      grunt.config.requires( name + '.json' );
      grunt.config.requires( name + '.url' );

      var json = grunt.config( name + '.json' );
      var url = grunt.config( name + '.url' ).url;

      that.createProjectRow( json, url )
         .then( function ( data ) {
            return that.createBooks( json, url );
         } )
         .then( function ( data ) {
            done();
         } )
         .catch( function ( error ) {
            done( error );
         } )


   }
}