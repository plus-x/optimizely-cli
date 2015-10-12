var path = require( 'path' ),
	readConfig = require( '../read-config' ),
	Variation = require( '../variation' ),
	Experiment = require( '../experiment' ),
	logger = require( '../logger' ),
	OptimizelyClient = require( 'optimizely-node-client' ),

	// These are defined in the above files. These lines help with JSHint
	client = client || {},
	experiment = experiment || {};

module.exports = function( folder, program ) {

	//find the variation
	var varPath = path.resolve( process.cwd(), folder ),
		variation = new Variation( {}, varPath );

	variation.loadFromFile();

	if ( !variation ) {

		logger.log( 'error', 'could not find variation at ' + folder );
		return;
	}

	logger.log( 'info', 'pushing variation at ' + folder );

	readConfig( 'token' ).then( function( token ) {

		client = new OptimizelyClient( token );

		//if we already have an id, then update
		if ( variation.attributes.id ) variation.updateRemote( client );
		else {

			//find the experiment
			this.experiment = new Experiment( {}, path.normalize( variation.baseDir + '/..' ));

			if( !this.experiment.loadFromFile() ) {

				logger.log( 'error', 'no experiment.json found.' );
				return;

			} else if ( !this.experiment.attributes.id ) {

				logger.log( 'error', 'no id found for experiment. Please run push-experiment first' );
				return;
			}

			variation.createRemote( client, experiment );
		}
	}).catch( function( error ) {

		// Handle any error from all above steps
		logger.log( 'error', error.stack );

	}).done();
};
