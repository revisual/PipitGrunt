/**
 * Created by Pip on 15/05/2015.
 */
module.exports = function ( grunt ) {

   var fs = require( "./file-access-extended" )( grunt );


   var buildProject = function ( contents, sizes, name ) {
      var tasks = {};
      var len = contents.length;
      for (var i = 0; i < len; i++) {
         buildBook( contents[i], sizes, name, tasks );
      }
      return tasks;
   };

   var buildBook = function ( book, sizes, name, tasks ) {

      var imageIn = grunt.config( name + '.imageIn' );
      var imageOut = grunt.config( name + '.imageOut' );
      var quality = grunt.config( name + '.quality' );

      for (var size in sizes) {

         tasks[book + "_" + size] = {
            options: {
               width: parseInt( sizes[size] ),
               quality: parseFloat( quality )
            },
            src: imageIn + book + '/*.*',
            dest: imageOut + book + '/' + sizes[size] + '/'
         };

         grunt.log.writeln( "built book:" + book + " size:" + sizes[size] );

      }
   };

   return function () {
      var done = this.async();

      grunt.config.requires( this.name + '.sizes' );
      grunt.config.requires( this.name + '.imageIn' );
      grunt.config.requires( this.name + '.imageOut' );
      grunt.config.requires( this.name + '.quality' );

      var sizes = grunt.config( this.name + '.sizes' );
      var imageIn = grunt.config( this.name + '.imageIn' );
      var name = this.name;

      fs.readFolderListing(
         imageIn,
         function ( name, ext, isFolder ) {
            return ( isFolder );
         } )

         .then( function ( data ) {

            var tasks = buildProject( data.contents, sizes, name );

            grunt.config( 'image_resize', tasks );
            grunt.task.run( 'image_resize' );

            done();

         } );


   }


}