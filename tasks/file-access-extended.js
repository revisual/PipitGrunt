module.exports = function ( grunt ) {
   var fs = require( './file-access' )();
   var path = require( 'path' );
   var Promise = require( 'promise' );

   var getBook = function ( id, project ) {
      var len = project.content.length;
      var content = project.content;
      for (var i = 0; i < len; i++) {
         if (content[i].id == id)
            return content[i];
      }
      var item = {
         "id": id,
         "title": "",
         "range": ""
      };

      content.push( item );
      return item;
   };


   var getTotalFileSizeIn = function ( folder ) {

      return fs.statsFromFolder( folder, ['jpg', 'jpeg'] )
         .then( function ( stats ) {
            var total = 0;
            var len = stats.length;
            for (var i = 0; i < len; i++) {
               total += parseInt( stats[i].size );
            }
            return Promise.resolve( total );
         } )
   };


   var writeTotalsIntoSizeSlot = function ( filepath, slot, out ) {
      return getTotalFileSizeIn( filepath )

         .then( function ( stat ) {
            out[slot] = stat;
         } )

         .catch( function ( error ) {
            out[slot] = error;
         } );
   };

   var calcRange = function ( files ) {
      var len = files.length;
      for (var i = 0; i < len; i++) {
         files[i] = parseInt( files[i].replace( /.*\\|\..*$/g, '' ) );
      }
      files.sort( function ( a, b ) {
         if (a < b)return 1;
         if (a > b)return -1;
         return 0;
      } );
      return files.pop() + "-" + files.shift();
   };

   var createImageMetrics = function ( sizes, imageOut ) {
      var promises = [];
      var out = {};
      var totalSizes = {};

      for (size in sizes) {
         promises.push(
            writeTotalsIntoSizeSlot( imageOut + sizes[size] + "/", size, totalSizes )
         );
      }

      promises.push(
         fs.readFolderListing( imageOut + sizes[size] + "/", ['jpg', 'jpeg'] )
            .then( function ( data ) {
               out.range = calcRange( data.contents );
               return Promise.resolve( out.range );
            } )
      );

      return Promise.all( promises )
         .then( function ( data ) {
            out.sizes = totalSizes;
            return Promise.resolve( out );
         } );


   }

   var getProject = function ( projectID, jasonPath ) {

      return fs.readJSON( jasonPath + projectID + '.json' )

         .catch( function ( error ) {

            if (error.errno == -4058) {
               return Promise.resolve(
                  {
                     "title": "",
                     "id": projectID,
                     "index": 0,
                     "content": []
                  }
               )
            }

            else {
               return Promise.resolve( error );
            }

         } );
   }


   return {
      /*readUTF8: fs.readUTF8,
       readJSON: fs.readJSON,

       statsFromFolder: fs.statsFromFolder,
       readJSONFromFolder: fs.readJSONFromFolder,
       readFolderListing: fs.readFolderListing,
       readFilesFromList: fs.readFilesFromList,*/
      readFolderListing: fs.readFolderListing,
      getBook: getBook,
      writeJSON: fs.writeJSON,
      getProject: getProject,
      createImageMetrics: createImageMetrics
   }
};

