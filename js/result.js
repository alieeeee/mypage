

var LinkedStateMixin = require('react-addons-linked-state-mixin');

var Result = React.createClass({
	mixins: [LinkedStateMixin],
	getInitialState: function() {
		return {message: ''};
	},
	render: function() {
		return <input type="text" valueLink={this.linkState('message')} />;
	}
});

ReactDOM.render(
  <div>Hello!</div>,
  document.getElementById('result')
);