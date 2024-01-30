
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

		if (this.appState === null) { 

			this.appState = new AppState();

			this.appStateUI = new AppStateUI();

			this.appState.setUI(this.appStateUI);

		}

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

		this.state.addParticipant(this.state.getUser());

		this.adapter.sendCreateContest(

			AppStateRequestConvertor.getCreateContestRequest(this.state),

			() => {

				onCreateSuccess();

			}
		);

	}

	joinContest(inviteCode, onJoinSuccess) {

		this.adapter.sendJoinContest(

			AppStateRequestConvertor.getJoinContestRequest(this.state, inviteCode),

			(contestResponse) => {

				this.state.update(AppStateResponseConvertor.processJoinContestResponse(contestResponse));

			},

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


	}

	setUI(appStateUI) {

		this.appStateUI = appStateUI;

		this.appStateUI.setState(this);

	}

	update(appStateObj) {

		this.duration = appStateObj.getDuration();

		this.participants = appStateObj.getParticipants();

		this.problems = appStateObj.getProblems();

		this._updateUI();

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

	getDuration() {

		return this.duration;

	}

	setProblems(problems) {

		console.log(problems);

		this.problems = structuredClone(problems);

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

		if (this.appStateUI) this.appStateUI.render();

	}

}


const AppStateRequestConvertor = {

	getCreateContestRequest(state) {

		return {

			userId: state.getUser(),

			questions: state.getProblems().map((problem) => { return this._formatQuestion(problem); }),

		};

	},

	_formatQuestion(problem) {

		return {
			
			name: "temp_problem_name",

			url: problem

		}

	},

	getJoinContestRequest(state, inviteCode) {

		return {

			sessionId: inviteCode,
			
			userId: state.getUser()

		};

	}

}

const AppStateResponseConvertor = {

	processJoinContestResponse: function(response) {

		let newState = new AppState();

		newState.setProblems(response.questions.map((problem) => problem.url));

		response.users.forEach((user) => { newState.addParticipant(user.userId); })

		return newState;
		
	}

}


class AppStateUI {

	SELECTORS = {

		STATE_DIV: '#state_div'

	};

	setState(state) {

		this.appState = state;

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

	sendCreateContest(contestRequest, onCreateSuccess) {

		this.adapterAjax.sendCreateContestRequest(contestRequest, (contestResponse) => {

			this.adapterSocket.init(

				contestResponse.sessionId, 

				this.processReceivedMessage, 

				() => {

					onCreateSuccess();

					this.adapterSocket.send({"message": "Create contest test."});

				}

			);

		});

	}

	sendJoinContest(joinRequest, stateUpdateCallback, onJoinSuccess) {

		this.adapterAjax.sendJoinContestRequest(joinRequest,(contestResponse) => {

			stateUpdateCallback(contestResponse);

			this.adapterSocket.init(

				contestResponse.sessionId, 

				this.processReceivedMessage, 

				() => {

					onJoinSuccess();

					this.adapterSocket.send({"message": "Join contest test."});

				}

			);

		});

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

	_PATH_PREFIX = 'v1/contest';

	_PATHS = {

		CREATE_CONTEST: '',

		JOIN_CONTEST: 'join'

	}

	sendCreateContestRequest(contestRequest, callback) {

		this._doPostRequest(this._PATHS.CREATE_CONTEST, contestRequest, callback);

	}

	sendJoinContestRequest(joinRequest, callback) {

		this._doPostRequest(this._PATHS.JOIN_CONTEST, joinRequest, callback);

	}

	_doPostRequest(path, request, callback) {

		$.ajax({

			type: 'POST',
			
			url: this._PATH_PREFIX + (path.length ? '/' + path: ''),
			
			data: JSON.stringify(request),

			contentType: "application/json",
			
			dataType: 'json',
			
			success: function(res){
			
				callback(res);
			
			}

		});

	}

}

class AppAdapterSocket {

	BROKER_URL = 'ws://localhost:8100/coding-battle-websocket';

	PUBLISH_DESTINATION = "/cb-publish/contest";

	SUBSCRIBE_ENDPOINT = '/cb-topic';

	constructor() {

		this.stompClient = new StompJs.Client({ brokerURL: this.BROKER_URL });

	}

	setRoom(room) {

		this.room = room;

	}

	init(topic, processReceivedCallback, onInitSuccessCallback) {

		this.setRoom(topic);

		this.stompClient.onConnect = (frame) => {

		    console.log('Connected: ' + frame);

		    onInitSuccessCallback();

		    this.stompClient.subscribe(this.SUBSCRIBE_ENDPOINT + '/' + this.room, (socketMessage) => {

		    	console.log(socketMessage.body);

		    	// processReceivedCallback(JSON.parse(greeting.body));

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

	        destination: this.PUBLISH_DESTINATION + '/' + this.room,

	        body: JSON.stringify(data)

	    });

	}

	terminate() {

		this.stompClient.deactivate();

	}

}






