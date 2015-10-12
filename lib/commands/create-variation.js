var fs = require( 'fs' ),
    path = require( 'path' ),
    OptimizelyClient = require( 'optimizely-node-client' ),
    readConfig = require( '../read-config' ),
    Experiment = require( '../experiment' ),
    Variation = require( '../variation' ),
    logger = require( '../logger' );

var createLocalVariation = function( experiment, folder, description ) {

    var success = Variation.create({ description: description },
                  path.join( experiment.baseDir, folder ));

    if ( success )
        logger.log( 'info', 'created variation ' + description + 'in folder ' + folder );
    else
        logger.log( 'error', 'failed to create variation' );
};

module.exports = function( identifier, folder, description, program ) {

    var experiment = Experiment.locateAndLoad( identifier );

    if (experiment)
        createLocalVariation(experiment, folder, description);
    else
        console.log( 'no local experiment found by: ' + identifier + '. Please specify experiment folder, id or description' );
};
