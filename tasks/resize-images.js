/**
 * Created by Pip on 15/05/2015.
 */
module.exports = function ( grunt ) {

   var fs = require( "./file-access-extended" )( grunt );

   var buildProject = function ( contents, name ) {
      var tasks = {};
      var len = contents.length;
      for (var i = 0; i < len; i++) {
         buildBook( contents[i], name, tasks );
      }
      return tasks;
   };

   var buildBook = function ( book, name, tasks ) {

      var imageIn = grunt.config( name + '.imageIn' );
      var imageOut = grunt.config( name + '.imageOut' );
      var quality = grunt.config( name + '.quality' );
      var sizes = grunt.config( name + '.sizes' );

      createThumb( book, name, tasks );

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

   var createThumb = function ( book, name, tasks ) {

      var thumb = grunt.config( name + '.thumbs' );
      var imageIn = grunt.config( name + '.imageIn' );
      var imageOut = grunt.config( name + '.imageOut' );

      tasks[book + "_thumbs"] = {
         options: {
            width: thumb.width || 96,
            height: thumb.height || 64,
            quality: thumb.quality || 1,
            crop: true
         },
         src: imageIn + book + '/00001.jpg',
         dest: imageOut + 'thumbs/' + book + '.jpg'

      };
   };

   return function () {
      var done = this.async();

      grunt.config.requires( this.name + '.sizes' );
      grunt.config.requires( this.name + '.imageIn' );
      grunt.config.requires( this.name + '.imageOut' );
      grunt.config.requires( this.name + '.quality' );


      var imageIn = grunt.config( this.name + '.imageIn' );
      var dryRun = grunt.config( this.name + '.dryRun' );
      dryRun = (dryRun == undefined) ? false : dryRun;
      var name = this.name;

      fs.readFolderListing(
         imageIn,
         function ( name, ext, isFolder ) {
            return ( isFolder );
         } )

         .then( function ( data ) {

            var tasks = buildProject( data.contents, name );

            if (dryRun) {
               grunt.log.writeln( JSON.stringify( tasks, null, "   " ) );
               grunt.log.ok( "Dry run - nothing resized" );
            }

            else {
               grunt.config( 'image_resize', tasks );
               grunt.task.run( 'image_resize' );
            }

            done();

         } )
         .catch( function ( error ) {
            grunt.log.error( error );
            done( false );
         } );


   }


}