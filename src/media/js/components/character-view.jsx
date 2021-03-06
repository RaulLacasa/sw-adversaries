
import React from "react";
import Remarkable from "remarkable";
import PanelInfo from "./panel-info";
import PanelSkill from "./panel-skill";
import PanelText from "./panel-text";
import PanelWeapons from "./panel-weapons";
import PanelTalent from "./panel-talent";
import PanelTag from "./panel-tag";
import { symbolise, getSourceLink } from "../lib/utils";
import dispatcher from "lib/dispatcher";
import * as CONFIG from "lib/config";

export default class CharacterView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			minions: 1,
			currentWounds: 0,
			aliveMinions: 1,
			displayCharacterMenu: false
		};

		this.md = new Remarkable();
	}

	componentWillUpdate(nextProps, nextState) {
		if(nextProps.character !== this.props.character) {
			this.setState({
				displayCharacterMenu: false
			});
		}
	}

	setMinions(minions) {
		if(minions <= 1) {
			minions = 1;
			this.setState({
				currentWounds: 0,
				aliveMinions: 0
			});
		} else {
			this.setAliveMinions(minions, this.state.currentWounds);
			}

		this.setState({
			minions: minions
		});

	}

	setAliveMinions(minions, currentWounds) {
		let character = this.props.character;

		let aliveMinions = minions;
		if (currentWounds > 0) aliveMinions = minions - Math.floor((currentWounds-1)/character.derived.wounds)

		this.setState({
			aliveMinions: aliveMinions
		});
	}

	setCurrentWounds(e) {
		e.preventDefault();
		this.setState({
			currentWounds: Number(this.refs.currentWounds.value)
		});
		this.setAliveMinions(this.state.minions, this.refs.currentWounds.value);
		this.refs.currentWounds.blur();
		this.refs.currentWounds.value = '';
	}

	addFavourite(id) {
		let character = this.props.character;

		if(!character) {
			return;
		}

		dispatcher.dispatch(CONFIG.FAVOURITE_ADD, character.id);

		this.setState({
			displayCharacterMenu: false
		});
	}

	removeFavourite(id) {
		let character = this.props.character;

		if(!character) {
			return;
		}

		dispatcher.dispatch(CONFIG.FAVOURITE_REMOVE, character.id);

		this.toggleCharacterMenu();
	}

	createAdversary() {
		dispatcher.dispatch(CONFIG.ADVERSARY_ADD);

		this.toggleCharacterMenu();
	}

	copyAdversary(id) {
		dispatcher.dispatch(CONFIG.ADVERSARY_COPY, this.props.character.id);

		this.toggleCharacterMenu();
	}

	deleteAdversary() {
		if(confirm("Are you sure you want to delete this adversary? This action cannot be undone.")) {
			dispatcher.dispatch(CONFIG.ADVERSARY_DELETE, this.props.character.id);
		}

		this.toggleCharacterMenu();
	}

	toggleCharacterMenu() {
		this.setState({
			displayCharacterMenu: !this.state.displayCharacterMenu
		});
	}

	render() {
		let character = this.props.character;

		if(!character) {
			return null;
		}

		let characteristics = [];

		for(let i in character.characteristics) {
			characteristics.push({
				"name": i,
				"value": character.characteristics[i]
			});
		}

		let defence = "defence" in character.derived ? character.derived.defence.join(" | ") : "0 | 0";

		// header icon based on important tags
		let icon = null;

		if(character.tags.indexOf("rebel alliance") != -1) {
			icon = <svg><use xlinkHref="#rebel-alliance"></use></svg>;
		}
		else if(character.tags.indexOf("empire") != -1) {
			icon = <svg><use xlinkHref="#galactic-empire"></use></svg>;
		}
		else if(character.tags.indexOf("first order") != -1) {
			icon = <svg><use xlinkHref="#first-order"></use></svg>;
		}

		// get all of the character's skills and characteristics as a hash
		let stats = {};

		for(var i in character.characteristics) {
			stats[i] = character.characteristics[i];
		}

		if(character.type !== CONFIG.MINION) {
			for(var i in character.skills) {
				stats[i] = character.skills[i];
			}
		}

		// add force rating
		(character.talents || []).forEach(t => {
			if(t && t.startsWith && t.startsWith("Force Rating")) {
				stats["Force Rating"] = t.split(" ")[2];
			}
		});

		let source = null;
		let sourceTag = character.tags.find(t => t.startsWith("source:"));

		if(character.source && sourceTag) {
			let url = character.source.length ? character.source : character.source.url;
			let owner = character.source.length ? "" : `${character.source.owner} of`;

			source = `<p><em>${character.name} stats provided by ${owner} ${getSourceLink(sourceTag)}.`;

			if(url) {
				source += ` Click to <a href="${url}">view original stats and descriptions</a>.</em></p>`;
			}
		}

		// character menu options and state
		let activeMenuState = this.state.displayCharacterMenu ? "active" : "";

		// favourite menu item
		let favLink = character.favourite
			? <li onClick={ this.removeFavourite.bind(this) }><svg className="star-filled outline"><use xlinkHref="#icon-star-full"></use></svg> Remove Favourite</li>
			: <li onClick={ this.addFavourite.bind(this) }><svg><use xlinkHref="#icon-star-empty"></use></svg> Add Favourite</li>
		;

		// edit or copy menu item
		let copyLink = character.id.startsWith(CONFIG.ADVERSARY_ID)
			? [<li onClick={ this.copyAdversary.bind(this) }><svg><use xlinkHref="#icon-edit"></use></svg> Edit</li>, <li onClick={ this.deleteAdversary.bind(this) }><svg><use xlinkHref="#icon-delete"></use></svg> Delete</li>]
			: <li onClick={ this.copyAdversary.bind(this) }><svg><use xlinkHref="#icon-copy"></use></svg> Copy</li>
		;

		let favIcon = null;

		if(character.favourite) {
			favIcon = <svg className="star-filled outline"><use xlinkHref="#icon-star-full"></use></svg>;
		}

		return <div className={ !this.props.visible ? "hidden" : null }>
			<h1 data-adversary-type={ character.type } className={ character.devOnly || character.id.startsWith(CONFIG.ADVERSARY_ID) ? "dev" : ""}>{ icon } { character.name } { favIcon }</h1>
			<h2 className="subtitle">
				<span className={ character.type.toLowerCase() }>{ character.type }</span>
				<span className={ "btn " + activeMenuState } onClick={ this.toggleCharacterMenu.bind(this) }><svg><use xlinkHref="#icon-menu"></use></svg></span>
				<div id="menu-character" className={ activeMenuState }>
					<ul>
						<li onClick={ this.createAdversary.bind(this) }><svg><use xlinkHref="#icon-plus"></use></svg> Create New</li>
						{ copyLink }
						{ favLink }
					</ul>
				</div>
			</h2>
			<PanelText text={ character.description } />
			{ character.notes ? <div className="text" dangerouslySetInnerHTML={ symbolise(this.md.render(`*${character.notes}*`)) }></div> : null }
			{ source ? <div className="text" dangerouslySetInnerHTML={ { __html: source } }></div> : null }
			<div className="column small">
				<div className="stats" id="characteristics">
					{ characteristics.map(c => {
						return <div key={ c.name }><span>{ c.value }</span><h3>{ c.name }</h3></div>
					})}
				</div>
				<div className="stats" id="derived">
					<div>
						<h3>Soak</h3>
						<span>{ character.derived.soak }</span>
					</div>
					<div>
						<h3>Wounds <small>Threshold | Current</small></h3>
						<span>{ character.type === CONFIG.MINION ? character.derived.wounds * this.state.minions : character.derived.wounds } |</span>
						<form style={{display: 'inline'}} onSubmit={this.setCurrentWounds.bind(this)}><input type="text" placeholder={this.state.currentWounds} maxLength="2" ref="currentWounds" /></form>
					</div>
					{ character.type === CONFIG.NEMESIS ? <div><h3>Strain <small>Threshold | Current</small></h3><span>{ character.derived.strain } |</span><input type="text" defaultValue="0" maxLength="2" /></div> : null }
					<div>
						<h3>Defence <small>&nbsp; Melee | Ranged</small></h3>
						<span>{ defence }</span>
					</div>
				</div>
			</div>
			<div className="column large">
				<PanelSkill character={ character } skills={ this.props.skills } aliveMinions={ this.state.aliveMinions } minions={ this.state.minions } setMinions={ this.setMinions.bind(this) } />
				<PanelWeapons title="Weapons" character={ character } skills={ this.props.skills } weapons={ this.props.weapons } qualities={ this.props.qualities } talents={ this.props.talents } aliveMinions={ this.state.aliveMinions } minions={ this.state.minions } />
				<PanelTalent title="Talents" stats={ stats } data={ character.talents } talents={ this.props.talents } />
				<PanelTalent title="Abilities" stats={ stats } data={ character.abilities } talents={ this.props.talents } />
				<PanelInfo title="Gear" text={ character.gear } />
				<PanelTag title="Tags" data={ character.tags } />
			</div>
		</div>;
	}
}
