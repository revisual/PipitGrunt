module.exports = function () {
   var fs = require( 'fs' );
   var path = require( 'path' );
   var Promise = require( 'promise' );


   var getJSONFile = function ( file ) {
      return getFileUTF8( file )
         .then( function ( data ) {
            return Promise.resolve( JSON.parse( data ) );
         } );
   };

   var saveJSONFile = function ( file, data ) {
      return saveFileUTF8( file, JSON.stringify( data, null, "   " ) );
   };

   var saveFileUTF8 = function ( file, data ) {

      var write = Promise.denodeify( fs.writeFile );
      return write( file, data, 'utf8' );

   };

   var getFileUTF8 = function ( file ) {
      var read = Promise.denodeify( fs.readFile );
      return read( file, 'utf8' );
   };

   var getFileStat = function ( file ) {
      var stat = Promise.denodeify( fs.stat );
      return stat( file );
   };

   var extMap = {
      json: getJSONFile,
      html: getFileUTF8,
      txt: getFileUTF8
   };

   var runFilterOn = function ( data, folder, filter ) {
      var out = [];
      var len = data.length;
      for (var i = 0; i < len; i++) {
         var item = data[i];
         var name = item.replace( /.*\\|\..*$/g, '' );
         var ext = item.split( '.' ).pop();
         var isFolder = fs.statSync( path.join( folder, item ) ).isDirectory();
         if (filter( name, ext, isFolder )) {
            out.push( item )
         }

      }
      return out;
   };

   var getFolderListing = function ( folder, filter ) {

      var readFolder = Promise.denodeify( fs.readdir );
      return readFolder( folder )
         .then( function ( data ) {
            if (filter && (typeof filter === 'function' )) {
               data = runFilterOn( data, folder, filter );
            }
            return Promise.resolve( {path: folder, contents: data} )
         } );
   };

   var getFilesFromList = function ( list ) {

      var promises = [];
      var out = new Array( list.length );
      var len = list.length;
      for (var i = 0; i < len; i++) {
         promises.push(
            readFileIntoOutSlot( list[i], i, out )
         );
      }

      return Promise.all( promises )
         .then( function ( data ) {
            return Promise.resolve( out );
         } );

   };

   var readFileIntoOutSlot = function ( filepath, slot, out ) {
      return extMap[filepath.split( "." ).pop()]( filepath )

         .then( function ( contents ) {
            out[slot] = contents;
         } )

         .catch( function ( error ) {
            out[slot] = error;
         } );
   };

   var readStatsIntoOutSlot = function ( filepath, slot, out ) {
      return getFileStat( filepath )

         .then( function ( stat ) {
            out[slot] = stat;
         } )

         .catch( function ( error ) {
            out[slot] = error;
         } );
   };

   var
      getAllStatsIn = function ( folder, extensions ) {
      var out = [];
      return getFolderListing(
         folder,
         function ( name, ext, isFolder ) {
            return ( !isFolder && extensions.indexOf( ext.toLowerCase() ) != -1);
         } )
         .then( function ( data ) {
            var promises = [];






            var len = data.contents.length;
            for (var i = 0; i < len; i++) {
               promises.push(
                  readStatsIntoOutSlot( path.join( folder, data.contents[i] ), i, out )
               );
            }
            return Promise.all( promises );
         } )
         .then( function () {
            return Promise.resolve( out );
         } )
   }

   var getAllJSONIn = function ( folder ) {
      var out = [];
      return getFolderListing(
         folder,
         function ( name, ext, isFolder ) {
            return ( !isFolder && ext.toLowerCase() == "json");
         } )
         .then( function ( data ) {
            var promises = [];
            var len = data.contents.length;
            for (var i = 0; i < len; i++) {
               promises.push(
                  readFileIntoOutSlot( path.join( folder, data.contents[i] ), i, out )
               );
            }

            return Promise.all( promises );
         } )

         .then( function () {
            return Promise.resolve( out );
         } )
   };

   var fileExists = function ( file ) {
      var exists = Promise.denodeify( fs.exists );
      return exists( file );

   }


   return {
      fileExists: fileExists,
      readUTF8: getFileUTF8,
      readJSON: getJSONFile,
      writeJSON: saveJSONFile,
      statsFromFolder: getAllStatsIn,
      readJSONFromFolder: getAllJSONIn,
      readFolderListing: getFolderListing,
      readFilesFromList: getFilesFromList
   }
};

