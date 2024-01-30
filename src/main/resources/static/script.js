
$(document).ready(function() {

	let appManager = AppObjectStore.getAppManager();

	appManager.start();

});


const AppObjectStore = {

	appManager: null,

	appView: null,

	appState: null,

	appAdapter: null,

	getAppManager: function() {

		if (this.appManager === null) {

			this.appManager = new AppManager(

				this.getAppView(),

				this.getAppState()

			);

		}

		return this.appManager;

	},

	getAppView: function() {

		if (this.appView === null) this.appView = new AppView();

		return this.appView;

	},

	getAppState: function() {

		if (this.appState === null) this.appState = new AppState();

		return this.appState;

	},

	getAppAdapter: function() {

		if (this.appAdapter === null) this.appAdapter = new AppAdapter();

		return this.appAdapter;

	},

};


const AppActions = {

	saveUser() {

		AppObjectStore.getAppView().saveUser();

	},

	createContest() {

		AppObjectStore.getAppView().createContest();

	},

	joinContest() {

		AppObjectStore.getAppView().joinContest();

	}
};


class AppManager {

	constructor(view, state) {

		this.view = view;

		view.setManager(this);

		this.state = state;

		this.adapter = new AppAdapter(this);

	}

	start() {

		this.view.render();

	}

	saveUser(user) {

		this.state.setUser(user);

	}

	createContest(duration, problems, onCreateSuccess) {

		this.state.setDuration(duration);

		this.state.setProblems(problems);

		this.adapter.sendCreateContest(

			this.state.serialize(),


			() => {

				onCreateSuccess();

			}
		);

	}

	joinContest(inviteCode, onJoinSuccess) {

		this.adapter.sendJoinContest(

			this.state.getUser(),

			inviteCode,


			() => {

				onJoinSuccess();
			}
		);
	}

}


class AppView {

	setManager(manager) {

		this.manager = manager;

		this.fields = new AppViewFields();

	}

	render() {

		this.fields.render();

	}

	saveUser() {

		let user = this.fields.getUser();

		if (user === '') {

			alert("Please enter username!");

			return;

		}

		this.manager.saveUser(user);

		this.fields.changeState(this.fields.STATE.CREATE_JOIN_CHOICE);

	}

	createContest() {

		let duration = this.fields.getDuration();

		let problems = this.fields.getProblems().split('\n').filter(x => x);

		if (duration === '' || problems.length === 0) {

			alert("Please enter proper information.");

			return;

		}

		this.fields.changeState(this.fields.STATE.CONNECTING)

		this.manager.createContest(

			duration,

			problems,

			() => { this.fields.changeState(this.fields.STATE.READY) }
		);

	}

	joinContest() {

		let inviteCode = this.fields.getInviteCode();

		if (inviteCode === '') {

			alert("Please enter proper information.");

			return;

		}

		this.fields.changeState(this.fields.STATE.CONNECTING);

		this.manager.joinContest(

			inviteCode,

			() => { this.fields.changeState(this.fields.STATE.READY) }

		);

	}

}

class AppViewFields {

	SELECTORS = {

		APP: '#app',

		INPUT_USER_DIV: '#input_user_div',
		INPUT_USER_TEXT: '#input_user_text',

		CREATE_OR_JOIN_DIV: '#create_or_join_div',
		CREATE_DURATION_TEXT: '#create_duration_text',
		CREATE_PROBLEMS_TEXTAREA: '#create_problems_textarea',
		JOIN_CODE_TEXT: '#join_code_text',

		READY_DIV: '#ready_div',

		CONNECTING_DIV: '#connecting_div',

	};

	STATE = {

		INPUT_USER: () => {

			$(this.SELECTORS.INPUT_USER_DIV).show();

		},

		CREATE_JOIN_CHOICE: () => {

			$(this.SELECTORS.CREATE_OR_JOIN_DIV).show();

		},

		CONNECTING: () => {

			$(this.SELECTORS.CONNECTING_DIV).show();

		},

		READY: () => {

			$(this.SELECTORS.READY_DIV).show();

		}

	}

	constructor() {

		this.state = this.STATE.INPUT_USER;

	}

	changeState(newState) {

		this.state = newState;

		this.render();

	}

	render() {

		$(this.SELECTORS.APP + ' > div').hide();

		this.state();

	}

	getUser() {

		return $(this.SELECTORS.INPUT_USER_TEXT).val();

	}

	getDuration() {

		return $(this.SELECTORS.CREATE_DURATION_TEXT).val();

	}

	getProblems() {

		return $(this.SELECTORS.CREATE_PROBLEMS_TEXTAREA).val();

	}

	getInviteCode() {

		return $(this.SELECTORS.JOIN_CODE_TEXT).val();

	}

}


class AppState {

	constructor() {

		this.user = '';

		this.problems = [];

		this.participants = {};

		this.appStateUI = new AppStateUI(this);

	}

	serialize() {

		return {

			user: this.user,

			problems: this.problems,

			participants: this.participants

		}

	}

	setUser(user) {

		this.user = user;

		this._updateUI();

	}

	getUser() {

		return this.user;

	}

	setDuration(duration) {

		this.duration = duration;

		this._updateUI();

	}

	setProblems(problems) {

		this.problems = structuredClone(problems);

		this.addParticipant(this.user);

		this._updateUI();

	}

	getProblems() {

		return structuredClone(this.problems);

	}

	addParticipant(user) {

		this.participants[user] = Array(this.problems.length).fill('');

		this._updateUI();

	}

	getParticipants() {

		return this.participants;

	}

	updateSubmissionAccepted(user, problemIndex) {

		this.participants[user][problemIndex] = 'AC';

		this._updateUI();

	}

	_updateUI() {

		this.appStateUI.render();

	}

}


class AppStateUI {

	SELECTORS = {

		STATE_DIV: '#state_div'

	};

	constructor(appState) {

		this.appState = appState;

	}

	render() {

		$(this.SELECTORS.STATE_DIV).html(this.getHTML());

	}

	getHTML() {

		let participants = this.appState.getParticipants();

		if (Object.keys(participants).length === 0) return '';

		let tableContentHTML = this.getTableContentHTML(this.appState.getUser(), participants[this.appState.getUser()]);

		for (let participant in participants) {

			if (participant == this.appState.getUser()) continue;

			tableContentHTML += this.getTableContentHTML(participant, participants[participant]);

		};

		let table = this.getTable(participants[this.appState.getUser()].length, tableContentHTML);

		return table;
	}

	getTableContentHTML(participantName, problemStatusArr) {

		let row = `<tr><td>${participantName}</td>`;

		problemStatusArr.forEach((status) => { row += `<td>${status}</td>` } );

		row += '</td>';

		return row;
	}

	getTable(problemsLength, tableContent) {

		let tableHead = '<thead><tr><th>user</th>';

		for (let i = 1; i <= problemsLength; i++) tableHead += `<th>#${i}</th>`;

		tableHead += '</tr></thead>';

		return `<table>${tableHead}${tableContent}</table>`;

	}

};


class AppAdapter {

	constructor(manager) {

		this.manager = manager;

		this.adapterAjax = new AppAdapterAjax();

		this.adapterSocket = new AppAdapterSocket();

	}

	sendCreateContest(contest, onCreateSuccess) {

		let contestTopic = 123; // Do Ajax call and create a contest -> Retrieve contest id

		this.adapterSocket.init(contestTopic, this.processReceivedMessage, onCreateSuccess);

	}

	sendJoinContest(user, inviteCode, onJoinSuccess) {

		this.adapterSocket.init(

			'xx',

			this.processReceivedMessage,

			() => {

				onJoinSuccess();

				this.adapterSocket.send({name: user});

			}
		);

	}

	processReceivedMessage(receivedMessage) {

		console.log(receivedMessage)

	}




	// receivedUserJoined() {}

	// receivedContestStart() {}

	// receivedContestEnd() {}

	// receivedTimerUpdate() {}

	// sendSubmissionStatusForProblem() {}

	// receivedSubmissionStatusUpdate() {}

	// terminateConnections() {}

}

class AppAdapterAjax {


}

class AppAdapterSocket {

	BROKER_URL = 'ws://localhost:8111/gs-guide-websocket';

	PUBLISH_DESTINATION = "/app/hello";

	SUBSCRIBE_ENDPOINT = '/topic/greetings';

	constructor() {

		this.stompClient = new StompJs.Client({ brokerURL: this.BROKER_URL });

	}

	init(topic, processReceivedCallback, onInitSuccessCallback) {

		this.stompClient.onConnect = (frame) => {

		    console.log('Connected: ' + frame);

		    onInitSuccessCallback();

		    this.stompClient.subscribe(this.SUBSCRIBE_ENDPOINT, (greeting) => {

		    	processReceivedCallback(JSON.parse(greeting.body));

		    });

		};

		this.stompClient.onWebSocketError = (error) => {
		    console.error('Error with websocket', error);
		};

		this.stompClient.onStompError = (frame) => {
		    console.error('Broker reported error: ' + frame.headers['message']);
		    console.error('Additional details: ' + frame.body);
		};


		this.stompClient.activate();

	}

	send(data) {

	    this.stompClient.publish({

	        destination: this.PUBLISH_DESTINATION,

	        body: JSON.stringify(data)

	    });

	}

	terminate() {

		this.stompClient.deactivate();

	}

}






