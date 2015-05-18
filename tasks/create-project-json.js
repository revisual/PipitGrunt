/**
 * Created by Pip on 15/05/2015.
 */
module.exports = function ( grunt ) {

   var fs = require( "./file-access-extended" )( grunt );

   return function () {
      var done = this.async();

      grunt.config.requires( this.name + '.sizes' );
      grunt.config.requires( this.name + '.imagesOut' );
      grunt.config.requires( this.name + '.jasonPath' );
      grunt.config.requires( this.name + '.project' );

      // var projectJSONPath = grunt.config( this.name + '.jasonPath' ) + grunt.config( this.name + '.project' ) + '.json';
      var jsonID = grunt.config( this.name + '.project' );
      var jsonPath = grunt.config( this.name + '.jasonPath' );
      var bookID = grunt.config( this.name + '.book' );
      var bookDesc = grunt.config( this.name + '.bookDesc' );
      var imagesOut = grunt.config( this.name + '.imagesOut' );
      var sizes = grunt.config( this.name + '.sizes' );

      fs.createImageMetrics( sizes, imagesOut )
         .then( function ( metrics ) {

            return fs.getProject( jsonID, jsonPath )
               .then( function ( json ) {
                  var book = fs.getBook( bookID, json );
                  book.title = bookDesc;
                  book.sizes = metrics.sizes;
                  book.range = metrics.range;
                  return fs.writeJSON( jsonPath + jsonID + ".json", json );
               } )
               .then( function () {
                  done();
               } )

         } )
         .catch( function ( error ) {
            grunt.log.error( 'An error occured ' + JSON.stringify( error ) );

         } );
   }
}