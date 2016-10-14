
import React from "react";

export default class TextPanel extends React.Component {
	render() {
		// TODO make this excpand and collapse
		let lines = this.props.text.split("\n\n");

		return <div className="text">{ lines.map((l, i) => { return <p key={ i }>{ l }</p>; })}</div>;
	}
}