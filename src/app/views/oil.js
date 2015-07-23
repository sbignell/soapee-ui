import _ from 'lodash';
import React from 'react';
import Reflux from 'reflux';
import { Link } from 'react-router';

import oilActions from 'actions/oil';

import oilStore from 'stores/oil';
import oilsStore from 'stores/oils';
import calculatorStore from 'stores/calculator';

import Spinner from 'components/spinner';
import FacebookComments from 'components/facebookComments';
import GoogleComments from 'components/googleComments';

export default React.createClass( {

    statics: {
        willTransitionTo: function ( transition, params ) {
            oilActions.getOilById( params.id );
        }
    },

    mixins: [
        Reflux.connect( oilStore, 'oil' )
    ],

    render() {
        return (
            <div id="oil">
                { this.renderLoading() }
                { this.renderOil() }
            </div>
        );
    },

    renderOil() {
        let oilName;

        if ( this.state.oil ) {
            oilName = this.state.oil.name;

            return (
                <div>
                    <ol className="breadcrumb">
                        <li><Link to="home">Home</Link></li>
                        <li><Link to="oils">Oils</Link></li>
                        <li className="active">{oilName}</li>
                    </ol>

                    <legend><h1>{oilName}</h1></legend>

                    <div className="row">

                        <div className="col-sm-4">
                            <div className="panel panel-primary">
                                <div className="panel-heading">
                                    <h3 className="panel-title">Saponification Values</h3>
                                </div>
                                { this.renderSaponification() }
                            </div>
                        </div>

                        <div className="col-sm-4">
                            <div className="panel panel-primary">
                                <div className="panel-heading">
                                    <h3 className="panel-title">Fatty Acids</h3>
                                </div>
                                { this.renderFattyAcids() }
                            </div>
                        </div>

                        <div className="col-sm-4">
                            <div className="panel panel-primary">
                                <div className="panel-heading">
                                    <h3 className="panel-title">Oil Properties</h3>
                                </div>
                                { this.renderProperties() }
                            </div>
                        </div>

                    </div>

                    <div className="row">
                        <ul className="nav nav-tabs" role="tablist">
                            <li role="presentation" className="active"><a href="#in-recipes" aria-controls="in-recipes" role="tab" data-toggle="tab">Used in Recipes</a></li>
                            <li role="presentation"><a href="#facebook" aria-controls="facebook" role="tab" data-toggle="tab">Facebook Comments</a></li>
                            <li role="presentation"><a href="#google" aria-controls="google" role="tab" data-toggle="tab">Google+ Comments</a></li>
                        </ul>
                        <div className="tab-content">
                            <div role="tabpanel" className="tab-pane active" id="in-recipes">
                                { this.renderInRecipes() }
                            </div>
                            <div role="tabpanel" className="tab-pane" id="facebook">
                                <FacebookComments />
                            </div>
                            <div role="tabpanel" className="tab-pane" id="google">
                                <GoogleComments />
                            </div>
                        </div>
                    </div>


                </div>
            );
        }
    },

    renderSaponification() {
        let oil = this.state.oil;

        return (
            <div className="properties-container">
                <table className="table table-striped table-condensed table-super-condensed">
                    <tbody>
                    <tr>
                        <td>KOH</td>
                        <td>{oil.sap}</td>
                    </tr>
                    <tr>
                        <td>NaOH</td>
                        <td>{calculatorStore.sapForNaOh(oil)}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        );
    },

    renderFattyAcids() {
        let oil = this.state.oil;
        let breakdowns = _.transform( oilsStore.getAllFats(), ( output, fat ) => {
            let breakdown = oil.breakdown[ fat ];

            if ( breakdown ) {
                output.push(
                    <tr>
                        <td>{_.capitalize(fat)}</td>
                        <td>{breakdown}%</td>
                    </tr>
                );
            }
        }, [] );
        let saturations =  _.map( oil.saturations, ( satType, saturation ) => {
            return (
                <tr>
                    <td>{_.capitalize(saturation)}:</td>
                    <td>{satType}%</td>
                </tr>
            );
        } );
        let ratios = `${oil.saturations.saturated} : ${ oil.saturations.monoSaturated + oil.saturations.polySaturated }`;
        let ratiosRow = (
            <tr>
                <td>Saturation Rations</td>
                <td>{ ratios }</td>
            </tr>
        );


        return (
            <div className="properties-container">
                <table className="table table-striped table-condensed table-super-condensed">
                    <tbody>
                    { breakdowns }
                    { this.gap() }
                    { saturations }
                    { this.gap() }
                    { ratiosRow }
                    </tbody>
                </table>
            </div>
        );
    },

    renderProperties() {
        let oil = this.state.oil;
        let properties;

        function render( property ) {
            return (
                <tr>
                    <td>{_.capitalize( property )}</td>
                    <td>{oil.properties[ property ]}%</td>
                </tr>
            );
        }

        properties = _( oil.properties )
            .keys()
            .sort()
            .map( render, this )
            .value();

        return (
            <div className="properties-container">
                <table className="table table-striped table-condensed table-super-condensed">
                    <tbody>
                    { properties }
                    </tbody>
                </table>
            </div>
        );
    },

    renderInRecipes() {
        let oil = this.state.oil;
        console.log('renderInRecipes', oil );
        function recipeRow( recipe ) {
            return (
                <tr>
                    <td><Link to="recipe" params={ { id: recipe.id } }>{ recipe.name }</Link></td>
                </tr>
            );
        }

        return (
            <div className="properties-container">
                <table className="table table-striped table-condensed table-super-condensed table-bordered">
                    <thead>
                    <th>
                        Recipe Name
                    </th>
                    </thead>
                    <tbody>
                    { _.map( oil.recipes, recipeRow, this ) }
                    </tbody>
                </table>
            </div>
        );
    },

    renderLoading() {
        if ( !(this.state.oil) ) {
            return <Spinner />;
        }
    },

    gap() {
        return (
            <tr>
                <td colSpan="2"></td>
            </tr>
        );
    }



} );