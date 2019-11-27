
import React from "react";
import InputText from "./input-text";
import InputSelect from "./input-select";
import PanelListEdit from "./panel-list-edit";
import PanelTalentEdit from "./panel-talent-edit";

import dispatcher from "lib/dispatcher";
import * as CONFIG from "lib/config";
import { sortByProperty } from "lib/utils";

const RANGED = 1;
const MELEE = 0;


export default class CharacterEdit extends React.Component {
	constructor(props) {
		super(props);

		let baseCharacter = {
			"name": "",
			"type": "",
			"description": "",
			"characteristics": {},
			"derived": {
				"defence": []
			},
			"skills": null,
			"talents": [],
			"abilities": [],
			"weapons": [],
			"gear": [],
			"tags": []
		};

		let editingCharacter = Object.assign({}, baseCharacter, props.character);

		if(editingCharacter.derived.defence.length == 0) {
			editingCharacter.derived.defence = [0, 0];
		}

		this.state = {
			character: editingCharacter
		};
	}

	save() {
		dispatcher.dispatch(CONFIG.ADVERSARY_SAVE, this.state.character);
	}

	setType(value) {
		let character = this.state.character;

		character.type = value;

		this.setState({
			character: character
		});
	}

	// add an item to a list
	addHandler(attr) {
		return function(item) {
			let character = this.state.character;

			character[attr].push(item);

			this.setState({
				character: character
			});
		};
	}

	// remove an item from a list of properties
	removeHandler(attr) {
		return function(index) {
			let character = this.state.character;

			character[attr].splice(index, 1);

			this.setState({
				character: character
			});
		};
	}

	render() {
		let character = this.state.character;

		if(!character) {
			return null;
		}


console.log(character)

/*

			-Name
			-Type (should be select)
			-Characteristics
			-Soak
			-Wound Threshold
			-Strain Threshold (should only display for Nemesis)
			-Defence
			-Melee
			-Ranged
			-Skills - this needs to be a list with check boxes for minions
			Weapons (selector or add own)
			Talents (selector or add own)
			Abilities (selector or add own)
			-Gear
			Tags (selector or add own - do these need to be separated out?)



			*/

		let characteristics = ["Brawn", "Agility", "Intellect", "Cunning", "Willpower", "Presence"];
		let skills = this.props.skills;
		let types = ["Minion", "Rival", "Nemesis"];
		let [talents, abilities] = ["talents", "abilities"].map(key => {
			// remove rank from the end of the name
			let noRanks = character[key].map(t => t.name || t).map(t => t.replace(/\s\d+$/, ""));

			return this.props.talents.filter(t => t.type == key).filter(t => noRanks.indexOf(t.name) == -1).sort(sortByProperty("name"));
		});
		let weapons = this.props.weapons.all().sort(sortByProperty("name"));

		return <div id="edit">
			<h1>Character</h1>
			<InputText text="Name" value={ character.name } handler={ text => character.name = text } />
			<InputSelect text="Type" value={ character.type } values={ types } handler={ this.setType.bind(this) } />

			<div className="edit-panel">
				<h2>Characteristics</h2>
				{ characteristics.map(c => <InputText text={ c } value={ character.characteristics[c] } handler={ text => character.characteristics[c] = parseInt(text) } />) }
			</div>

			<div className="edit-panel">
				<h2>Derived Characteristics</h2>

				<InputText text="Soak" value={ character.derived.soak } handler={ text => character.derived.soak = parseInt(text) } />
				<InputText text="Wound Threshold" value={ character.derived.wounds } handler={ text => character.derived.wounds = parseInt(text) } />
				{ character.type == "Nemesis" ? <InputText text="Strain Threshold" value={ character.derived.strain } handler={ text => character.derived.strain = parseInt(text) } /> : null }
				<InputText text="Melee Defence" value={ character.derived.defence[MELEE] } handler={ text => character.derived.defence[MELEE] = parseInt(text) } />
				<InputText text="Ranged Defence" value={ character.derived.defence[RANGED] } handler={ text => character.derived.defence[RANGED] = parseInt(text) } />
			</div>

			<div className="edit-panel">
				<h2>Skills</h2>
				{ skills.map(s => <InputText text={ s.name } value={ character.skills[s.name] } handler={ text => character.skills[s.name] = parseInt(text) } />) }
			</div>

			<PanelListEdit title="Weapons" list={ character.weapons } remove={ this.removeHandler("weapons").bind(this) }>
				<PanelTalentEdit list={ weapons } title="Add Weapon" label="Weapons" handler={ this.addHandler("weapons").bind(this) } />
			</PanelListEdit>
			<PanelListEdit title="Talents" list={ character.talents } remove={ this.removeHandler("talents").bind(this) }>
				<PanelTalentEdit list={ talents } title="Add Talent" label="Talents" handler={ this.addHandler("talents").bind(this) } />
			</PanelListEdit>
			<PanelListEdit title="Abilities" list={ character.abilities } remove={ this.removeHandler("abilities").bind(this) }>
				<PanelTalentEdit list={ abilities } title="Add Ability" label="Abilities" handler={ this.addHandler("abilities").bind(this) } />
			</PanelListEdit>
			<InputText text="Gear" value={ character.gear } handler={ text => character.gear = text } />
			
			<button className="btn" onClick={ this.save.bind(this) }>Save</button>
		</div>;
	}
}