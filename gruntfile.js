module.exports = function ( grunt ) {

   var PROJECT = "making-ground";
   var PROJ_TITLE = "Making Ground";

   var S3_PATH = PROJECT + "/";

   var IMAGE_QUALITY = 0.5;
   var SIZES = {xsmall: 480, small: 768, medium: 992, large: 1200, xlarge: 1620};
   var IMAGES_IN = 'images/in/';
   var IMAGES_WORKING = 'images/working/';
   var IMAGES_OUT = 'images/out/';
   var JSON_PATH = 'json/';


   grunt.initConfig(
      {
         clean: {
            all: [IMAGES_OUT + SIZES.xsmall, IMAGES_OUT + SIZES.small, IMAGES_OUT + SIZES.medium, IMAGES_OUT + SIZES.large, IMAGES_OUT + SIZES.xlarge],
            working: [IMAGES_WORKING + '*'],
            incoming: [IMAGES_IN + '*'],
            out: [IMAGES_OUT + '*']
         },


         resize: {
            dryRun: false,
            quality: IMAGE_QUALITY,
            sizes: SIZES,
            imageIn: IMAGES_WORKING,
            imageOut: IMAGES_OUT,
            thumbs: {width: 96, height: 64}
         },

         createjson: {
            project: PROJECT,
            projectDesc: PROJ_TITLE,
            imagesOut: IMAGES_OUT,
            sizes: SIZES,
            jasonPath: JSON_PATH

         },

         sendToDataBase: {
            json: grunt.file.readJSON( JSON_PATH + PROJECT + ".json" ),
            url: grunt.file.readJSON( "database_url.json" )
         },


         copy: {
            verifylowercase: {
               files: [{
                  expand: true,
                  cwd: IMAGES_IN,
                  dest: IMAGES_WORKING,
                  src: [
                     '**/*.JPG',
                     '**/*.jpg'
                  ],
                  rename: function ( dest, src ) {
                     return dest + src.replace( '.JPG', '.jpg' );
                  }
               }]
            }
         },


         aws: grunt.file.readJSON( "aws-credentials.json" ),

         s3: {
            options: {
               accessKeyId: "<%= aws.accessKeyId %>",
               secretAccessKey: "<%= aws.secretAccessKey %>",
               bucket: "pipit",
               region: "eu-west-1",
               dryRun: false
            },
            build: {
               cwd: "images/out/",
               src: "**",
               dest: S3_PATH
            }
         }
      }
   );


   grunt.loadNpmTasks( 'grunt-contrib-clean' );
   grunt.loadNpmTasks( 'grunt-contrib-copy' );
   grunt.loadNpmTasks( 'grunt-image-resize' );
   grunt.loadNpmTasks( "grunt-aws" );

   grunt.registerTask( 'fulldeploy', ['clean:out','copy:verifylowercase', 'resize', 'clean:working', 'createjson', 'sendToDataBase', 's3'] );
   grunt.registerTask( 'resize', 'resizes project images', require( './tasks/resize-images' )( grunt ) );
   grunt.registerTask( 'createjson', 'creates project json', require( './tasks/create-project-json' )( grunt ) );
   grunt.registerTask( 'sendToDataBase', 'send to data base', require( './tasks/sent-to-database' )( grunt ) );
   grunt.registerTask( 'upload', ['s3'] );


}

