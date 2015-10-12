var glob        = require( 'glob' ),
    fs          = require( 'fs' ),
    path        = require( 'path' ),
    util        = require( 'util' ),
    _           = require( 'lodash' ),
    fileUtil    = require( './file-util' ),
    logger      = require( './logger' ),
    Variation   = require( './variation' ),
    OptCLIBase  = require( './optcli-base' ),
    Project     = require( './project' ),
    Variation   = require( './variation' );

function Experiment( attributes, baseDir ) {

    Experiment.super_.call( this, attributes, baseDir );
}

// Constants
Experiment.JSON_FILE_NAME   = 'experiment.json';
Experiment.JS_FILE_NAME     = 'global.js';
Experiment.CSS_FILE_NAME    = 'global.css';
Experiment.CUSTOM_CSS       = 'custom_css',
Experiment.CUSTOM_JS        = 'custom_js',
Experiment.PROJECT_ID       = 'project_id';

util.inherits( Experiment, OptCLIBase );

Experiment.create = function( attrs, baseDir ) {

    //create directory
    fileUtil.writeDir( baseDir );
    fileUtil.writeText( path.join( baseDir, Experiment.CSS_FILE_NAME ));
    fileUtil.writeText( path.join( baseDir, Experiment.JS_FILE_NAME ));
    fileUtil.writeJSON( path.join( baseDir, Experiment.JSON_FILE_NAME ), attrs );

    return new Experiment( attrs, baseDir );
};

Experiment.locateAndLoad = function( identifier ) {

    var experiment = null;

    if ( fs.existsSync( identifier ) && fs.lstatSync( identifier ).isDirectory() ) {

        //it's a directory
        experiment = new Experiment( {}, identifier );

        if ( !experiment.loadFromFile() ) return false;

    } else {

        var attrs = {};

        glob.sync( '**/' + Experiment.JSON_FILE_NAME ).forEach( function( jsonFile ) {

            if ( experiment ) return;

            try {

                attrs = JSON.parse( fs.readFileSync( jsonFile ), {

                    encoding: 'utf-8'
                });

                if ( identifier === String( attrs.id ) || identifier === attrs.description ) {

                    experiment = new Experiment( attrs, path.dirName( jsonFile ));

                    return experiment;
                }

            } catch ( e ) {

                logger.log( 'warn', 'could not parse ' + jsonFile );
                return false;
            }
        });
    }

    return experiment;
};

Experiment.prototype.getJSPath = function() {

    return this.getFilePath( Experiment.JS_FILE_NAME );
};

Experiment.prototype.getCSSPath = function() {

    return this.getFilePath( Experiment.CSS_FILE_NAME );
};

Experiment.prototype.getCSS = function() {

    return fileUtil.loadFile( this.getCSSPath() ) || '';
};

Experiment.prototype.getJS = function() {

    return fileUtil.loadFile( this.getJSPath() ) || '';
};

Experiment.prototype.getVariations = function() {

    return glob.sync( this.baseDir + '/**/' + Variation.JSON_FILE_NAME );
};

Experiment.prototype.createRemote = function( client ) {

    var _this = this,

        //find the project - assume it's one directory above
        project = new Project( {}, path.normalize( this.baseDir + '/..' )),

        //create new experiment
        expArgs = _.clone( this.attributes );

    project.loadFromFile();

    expArgs[ Experiment.CUSTOM_CSS ] = this.getCSS();
    expArgs[ Experiment.CUSTOM_JS ] = this.getJS();
    expArgs[ Experiment.PROJECT_ID ] = project.attributes.id;

    return client.createExperiment( expArgs ).then( function( experimentAttrs ) {

        //update the id
        _this.attributes.id = experimentAttrs.id;
        _this.saveAttributes();

        logger.log( 'info', 'created remote experiment: ' + experimentAttrs.id );

    }, function( error ) {

        logger.log( 'error', error );

    }).catch( function( e ) {

        logger.log( 'error', 'unable to create remote experiment: ' + e.message );
        console.error( e.stack );
    });
};

Experiment.prototype.updateRemote = function( client ) {

    //create new experiment
    var expArgs = _.clone( this.attributes );

    expArgs[ Experiment.CUSTOM_CSS ] = this.getCSS();
    expArgs[ Experiment.CUSTOM_JS ] = this.getJS();

    return client.updateExperiment( expArgs ).then( function( experimentAttrs ) {

        logger.log( 'info', 'updated remote experiment: ' + experimentAttrs.id);

    }, function( error ) {

        logger.log( 'error', error );

    }).catch( function( e ) {

        logger.log( 'error', 'unable to update remote experiment: ' + e.message );
        console.error( e.stack );
    });
};

Experiment.prototype.saveAttributes = function() {

    fileUtil.writeJSON( path.join( this.baseDir, Experiment.JSON_FILE_NAME ), this.attributes );
};

Experiment.prototype.getOptcliURL = function() {

    var optcliURL,
        appendToURL;

    optcliURL = this.attributes.edit_url;

    appendToURL = optcliURL.indexOf( '?' ) === -1 ?
        '?optcli=activate' :
        '&optcli=activate';

    optcliURL = optcliURL.indexOf( '#' ) === -1 ?
        optcliURL + appendToURL :
        optcliURL.replace( '#', appendToURL + '#' );

    return optcliURL;
};

module.exports = Experiment;
