
import React from "react";
import { BaseText } from "./text";
import { id, isNumeric, normalise } from "../../lib/string";
import { throttle } from "../../lib/timer";

export class AutoComplete extends BaseText {
	constructor(props) {
		super(props);

		this.state.value = props.value || ""
		this.update = throttle(this.callHandler.bind(this));
	}

	componentWillUpdate(nextProps, nextState) {
		if(nextProps.value !== this.props.value) {
			this.setState({
				error: false,
				value: nextProps.value
			});
		}
	}

	callHandler(value) {
		if(this.props.handler) {
			this.props.handler(value);
		}
	}

	selectItem(evt) {
		let value = evt.target.getAttribute("data-value");

		this.callHandler(value);
	}

	handleChange(evt) {
		let value = evt.target.value;

		this.setState({
			error: this.hasError(value),
			value: value
		});

		this.update(value);
	}

	render() {
		let inputId = "input_" + id(this.props.label);
		let filter = this.state.value.toLowerCase();
		let values = filter == "" ? [] : this.props.values.filter(a => normalise(a).indexOf(filter) != -1);

		if(values.length == 1 && values[0] == this.state.value) {
			values = [];
		}

		return <div className={ this.getClassName() + " row-filter" }>
			<label htmlFor={ inputId }>{ this.props.label } { this.props.required ? <span className="required">*</span> : null }</label>
			<input id={ inputId } type="text" value={ this.state.value } onChange={ this.handleChange.bind(this) } onBlur={ this.handleBlur.bind(this) } />
			{ this.props.note ? <div><small>{ this.props.note }</small></div> : null }
			{ values.length > 0 ? <ul>{ values.map(m => <li onClick={ this.selectItem.bind(this) } data-value={ m }>{ m }</li>) }</ul> : null }
		</div>;
	}
}