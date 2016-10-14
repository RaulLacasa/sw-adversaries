
import React from "react";

export default class TalentPanel extends React.Component {
	render() {
		if(this.props.data == null) {
			return null;
		}

		let data = this.props.data;
		let talents = [];
		let allTalents = this.props.talents.get();

		data.forEach(t => {
			let talentName = t.replace(/\s\d+$/, "");
			let talent = allTalents.find(i => i.name == talentName)

			if(talent != null) {
				talents.push({
					id: talent.id,
					name: t,
					description: talent.description
				});
			}
		});

		return <div className="info">
			<h2>{ this.props.title }</h2>
			{ talents.length > 0 ? talents.map(t => <p key={ t.id }><strong>{ t.name }:</strong> {t.description }</p> ) : "–" }
		</div>;
	}
}