/**
 * Created by Pip on 15/05/2015.
 */
module.exports = function ( grunt ) {

   var fs = require( "./file-access-extended" )( grunt );
   var Promise = require( 'promise' );

   return function () {
      var done = this.async();
      var name = this.name;


      grunt.config.requires( name + '.sizes' );
      grunt.config.requires( name + '.imagesOut' );
      grunt.config.requires( name + '.jasonPath' );
      grunt.config.requires( name + '.project' );

      // var projectJSONPath = grunt.config( this.name + '.jasonPath' ) + grunt.config( this.name + '.project' ) + '.json';
      var jsonID = grunt.config( name + '.project' );
      var jsonPath = grunt.config( name + '.jasonPath' );

      var imagesOut = grunt.config( name + '.imagesOut' );
      var sizes = grunt.config( name + '.sizes' );

      var project;
      var books;

      var writeMetricsIntoProject = function ( book ) {
         return fs.createImageMetrics( sizes, imagesOut + book + "/" )
            .then( function ( metrics ) {
               var bookData = fs.getBook( book, project );
               bookData.title = book.replace( /-/g, " " );
               bookData.sizes = metrics.sizes;
               bookData.range = metrics.range;
            } )
      };

      fs.getProject( jsonID, jsonPath )
         .then( function ( json ) {
            project = json;
            project.title = grunt.config( name + '.projectDesc' );
            return fs.readFolderListing(
               imagesOut,
               function ( name, ext, isFolder ) {
                  return ( isFolder );
               } )
         } )
         .then( function ( data ) {
            books = data.contents;
            var promises = [];
            var len = books.length;
            var book;
            for (var i = 0; i < len; i++) {
               book = books[i];
               promises.push( writeMetricsIntoProject( book ) );
            }

            return Promise.all( promises );
         } )
         .then( function () {
            return fs.writeJSON( jsonPath + jsonID + ".json", project );

         } )
         .then( function () {

            done()
         } )
         .catch( function ( error ) {
            grunt.log.error( error );
            done( false );
         } );


   }
}