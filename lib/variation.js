var util             = require( 'util' ),
    path             = require( 'path' ),
    _                = require( 'lodash' ),
    ejs              = require( 'ejs' ),
    fileUtil         = require( './file-util' ),
    logger           = require( './logger' ),
    readConfig       = require( './read-config' ),
    OptimizelyClient = require( 'optimizely-node-client' ),
    OptCLIBase       = require( './optcli-base' ),
    Assets           = require( './assets' );


function Variation( attributes, baseDir ) {

    Variation.super_.call( this, attributes, baseDir );
}

// Constants
Variation.JSON_FILE_NAME  = 'variation.json';
Variation.JS_FILE_NAME    = 'variation.js';
Variation.JS_COMPONENT    = 'js_component';
Variation.EXPERIMENT_ID   = 'experiment_id';

util.inherits( Variation, OptCLIBase );

Variation.create = function( attrs, baseDir ) {

    //create directory
    fileUtil.writeDir( baseDir );
    fileUtil.writeText( path.join( baseDir, Variation.JS_FILE_NAME ));
    fileUtil.writeJSON( path.join( baseDir, Variation.JSON_FILE_NAME ), attrs );

    return new Variation( attrs, baseDir );
};

Variation.prototype.getJSPath = function() {

    return this.getFilePath( Variation.JS_FILE_NAME );
};

Variation.prototype.getJS = function() {

    return fileUtil.loadFile( this.getJSPath() ) || '';
};

Variation.prototype.createRemote = function( client, remote ) {

    var _this = this,

        //assume assets are in experiment.baseDir
        assets = new Assets( {}, path.normalize( this.baseDir + '/..' ));

    if ( assets.JSONFileExists() ) {

        logger.log( 'info', 'assets file found, loading' );
        assets.loadFromFile();
    }

    //create new variation
    var varArgs = _.clone( this.attributes );

    varArgs[ Variation.JS_COMPONENT ] = String( ejs.render( this.getJS(), {
        locals: {
            assets: assets.attributes
        }
    }));

    varArgs[ Variation.EXPERIMENT_ID ] = experiment.attributes.id;

    return client.createVariation( varArgs ).then( function( variationAttrs ) {

        //update the id
        _this.attributes.id = variationAttrs.id;
        _this.saveAttributes();
        logger.log( 'info', 'created remote variation: ' + variationAttrs.id );

    }, function( error ) {

        logger.log( 'error', error );
        logger.log( 'error', 'unable to create remote variation: ' + e.message );

        console.error( e.stack );
    });
};

Variation.prototype.updateRemote = function(client) {

    var _this = this,

        //assume assets are in experiment.baseDir
        assets = new Assets( {}, path.normalize( this.baseDir + '/..') );

    if ( assets.JSONFileExists() ) {

        logger.log( 'info', 'assets file found, loading' );
        assets.loadFromFile();
    }

    var varArgs = _.clone( this.attributes );

    varArgs[ Variation.JS_COMPONENT ] = String( ejs.render( this.getJS(), {
        locals: {
            assets: assets.attributes
        }
    }));

    return client.updateVariation( varArgs ).then( function( variationAttrs ) {

        logger.log( 'info', 'updated remote variation: ' + variationAttrs.id );

    }, function( error ) {

        logger.log( 'error', error );

    }).catch( function( e ) {

        logger.log( 'error', 'unable to update remote variation: ' + e.message );
        console.error( e.stack );
    });
};

Variation.prototype.saveAttributes = function() {

    fileUtil.writeJSON( path.join( this.baseDir, Variation.JSON_FILE_NAME ), this.attributes );
};

module.exports = Variation;
