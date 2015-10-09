/*
 * Pull from the Optimizely API
 * ----
 * A modification to Optimizely CLI by Carlos Saenz (carlos@plu.sx)
 *
 */

// Unused?
// var _ = require( 'lodash' ), fs = require( 'fs' );

var readConfig        = require( '../read-config' ),
    Experiment        = require( '../experiment' ),
    Variation         = require( '../variation' ),
    pushVariation     = require( './push-variation' ),
    logger            = require( '../logger'),
    OptimizelyClient  = require( 'optimizely-node-client' );

module.exports = function( folder, program ) {

    /*
     * 1) PROMPT: Folder name for experiment
            - If folder exists, readConfig for token. Fail read token = prompt for token
            - If folder !exists, prompt for token
     * 2) TRY: Connect to API, get experiment assets - success / fail
     * 3) TRY: mkdir (if needed) - success / fail
     * 4) TRY: Write appropriate files to folder - success / fail
     */

    logger.log( 'The first step of PULL is for this message to exist... ;-)' );

    /*
    //find the experiment
    var experiment = Experiment.locateAndLoad( folder ),
        client;

    if ( !experiment ) {

        logger.log( 'error', 'could not find experiment at ' + folder );
        return;

    } else {

        logger.log( 'info', 'pushing experiment at ' + folder );
    }

    readConfig( 'token' ).then( function( token ) {

        client = new OptimizelyClient( token );

        //if we already have an id, then update
        if ( experiment.attributes.id ) experiment.updateRemote( client );
        else experiment.createRemote(client);

    }).then( function() {

        if ( program.iterate ) {

            experiment.getVariations().forEach( function( variationPath ) {

                pushVariation( variationPath.slice( 0, - Variation.JSON_FILE_NAME.length ), program );
            });
        }

    }).catch( function( error ) {

        // Handle any error from all above steps
        logger.log( 'error', error.stack );

    }).done();
    */
};
