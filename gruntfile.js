module.exports = function ( grunt ) {

   var PROJECT = "rnd-walks";
   var PROJ_TITLE = "R&D Walks";
   var BOOK = "fluttering-wire";
   var BOOK_TITLE = "fluttering wire";

   var S3_PATH = PROJECT + "/" + BOOK + "/";

   var IMAGE_QUALITY = 0.5;
   var SIZES = {xsmall: 480, small: 768, medium: 992, large: 1200, xlarge: 1620};
   var IMAGES_IN = 'images/in/';
   var IMAGES_OUT = 'images/out/';
   var JSON_PATH = 'json/';


   grunt.initConfig(
      {
         clean: {
            all: [IMAGES_OUT + SIZES.xsmall, IMAGES_OUT + SIZES.small, IMAGES_OUT + SIZES.medium, IMAGES_OUT + SIZES.large, IMAGES_OUT + SIZES.xlarge],
            incoming: [IMAGES_IN + '*']
         },

         copy: {
            xsmall: {
               expand: true,
               flatten: true,
               cwd: IMAGES_IN,
               src: '*',
               dest: IMAGES_OUT + SIZES.xsmall,
               filter: 'isFile'
            },
            small: {
               expand: true,
               flatten: true,
               cwd: IMAGES_IN,
               src: '*',
               dest: IMAGES_OUT + SIZES.small,
               filter: 'isFile'
            },
            medium: {
               expand: true,
               flatten: true,
               cwd: IMAGES_IN,
               src: '*',
               dest: IMAGES_OUT + SIZES.medium,
               filter: 'isFile'
            }
            ,
            large: {
               expand: true,
               flatten: true,
               cwd: IMAGES_IN,
               src: '*',
               dest: IMAGES_OUT + SIZES.large
               ,
               xlarge: {
                  expand: true,
                  flatten: true,
                  cwd: IMAGES_IN,
                  src: '*',
                  dest: IMAGES_OUT + SIZES.xlarge,
                  filter: 'isFile'
               }


            }
         },

         image_resize: {
            xsmall: {
               options: {
                  width: SIZES.xsmall,
                  quality: IMAGE_QUALITY
               },
               src: IMAGES_IN + '*.*',
               dest: IMAGES_OUT + SIZES.xsmall + '/'
            },
            small: {
               options: {
                  width: SIZES.small,
                  quality: IMAGE_QUALITY
               },
               src: IMAGES_IN + '*.*',
               dest: IMAGES_OUT + SIZES.small + '/'
            },
            medium: {
               options: {
                  width: SIZES.medium,
                  quality: IMAGE_QUALITY
               },
               src: IMAGES_IN + '*.*',
               dest: IMAGES_OUT + SIZES.medium + '/'
            },
            large: {
               options: {
                  width: SIZES.large,
                  quality: IMAGE_QUALITY
               },
               src: IMAGES_IN + '*.*',
               dest: IMAGES_OUT + SIZES.large + '/'
            },
            xlarge: {
               options: {
                  width: SIZES.xlarge,
                  quality: IMAGE_QUALITY
               },
               src: IMAGES_IN + '*.*',
               dest: IMAGES_OUT + SIZES.xlarge + '/'
            }
         },

         aws: grunt.file.readJSON( "aws-credentials.json" ),

         s3: {
            options: {
               accessKeyId: "<%= aws.accessKeyId %>",
               secretAccessKey: "<%= aws.secretAccessKey %>",
               bucket: "pipit"
            },
            build: {
               cwd: "images/out/",
               src: "**",
               dest: S3_PATH
            }
         },

         createjson: {
            project: PROJECT,
            book: BOOK,
            uid: S3_PATH,
            bookDesc: BOOK_TITLE,
            projectDesc: PROJ_TITLE,
            imagesOut: IMAGES_OUT,
            sizes: SIZES,
            jasonPath: JSON_PATH
         }

      }
   );

   grunt.loadNpmTasks( 'grunt-contrib-clean' );
   grunt.loadNpmTasks( 'grunt-contrib-copy' );
   grunt.loadNpmTasks( 'grunt-image-resize' );
   grunt.loadNpmTasks( "grunt-aws" );

   grunt.registerTask( 'full-run', ['resize-and-create-json', 's3', 'clean:incoming', 'clean:all'] );
   grunt.registerTask( 'resize-and-create-json', ['image_resize', 'createjson'] );
   grunt.registerTask( '480-temp', ['image_resize', 'createjson', 'clean:incoming', 'clean:all'] );
   grunt.registerTask( 'upload', ['s3'] );
   grunt.registerTask( 'createjson', 'creates the json for each project', require( './scripts/create-project-json' )( grunt ) );

}
;
