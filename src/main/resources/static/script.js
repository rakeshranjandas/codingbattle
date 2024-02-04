
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

	startContest() {

		AppObjectStore.getAppView().startContest();

	},

	joinContest() {

		AppObjectStore.getAppView().joinContest();

	}
};


class AppManager {

	constructor(view, state) {

		this.view = view;

		this.view.setManager(this);

		this.state = state;

		this.state.setManager(this);

		this.adapter = new AppAdapter();

		this.adapter.setManager(this);

	}

	start() {

		this.view.render();

	}

	saveUser(user) {

		this.state.setUser(user);

		this.adapter.setUser(user);

	}

	createContest(duration, problems) {

		this.state.createNewContest(duration, problems);

		this.adapter.sendCreateContest(this.state.clone());

	}

	contestCreated(contestId, newState) {

		console.log('Created contest', contestId);

		this.state.update(newState);

		this.view.ready();

	}

	joinContest(inviteCode) {

		this.adapter.sendJoinContest(

			this.state.clone(),

			inviteCode

		);
	}

	contestJoined(newState) {

		this.state.update(newState);

		this.view.ready();

	}

	participantJoined(joinedUser) {

		this.state.addNewParticipant(joinedUser);

	}

	startContest() {

		this.view.countdown();

		this.adapter.sendStartContest();

	}

	contestEnterCountdown(contestStartTimestamp) {

		this.state.prepareTimer(contestStartTimestamp);

	}

	contestCountdown(countdownInSeconds) {

		this.view.countdown(countdownInSeconds);

	}

	contestRunning(countdownInSeconds) {

		this.view.running(countdownInSeconds);

	}

	contestEnded() {

		this.view.ended();

	}

	submissionAccepted(problemId) {

		this.state.updateSubmissionAccepted(problemId);

		this.adapter.sendSubmissionAccepted(problemId);

	}

	participantSubmissionAccepted(user, problemId) {

		this.state.updateSubmissionAccepted(problemId, user);

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

		let problems = this.fields.getProblems().split('\n').filter(x => x).map((x) => {return {'url': x}});

		if (duration === '' || problems.length === 0) {

			alert("Please enter proper information.");

			return;

		}

		this.fields.changeState(this.fields.STATE.CONNECTING)

		this.manager.createContest(

			duration,

			problems,

		);

	}

	joinContest() {

		let inviteCode = this.fields.getInviteCode();

		if (inviteCode === '') {

			alert("Please enter proper information.");

			return;

		}

		this.fields.changeState(this.fields.STATE.CONNECTING);

		this.manager.joinContest(inviteCode);

	}

	startContest() {

		this.manager.startContest();

	}

	ready() {

		this.fields.changeState(this.fields.STATE.READY);
	
	}

	countdown(countdownInSeconds) {

		this.fields.changeState(this.fields.STATE.STARTING, countdownInSeconds);

	}

	running(countdownInSeconds) {

		this.fields.changeState(this.fields.STATE.RUNNING, countdownInSeconds);

	}

	ended() {

		this.fields.changeState(this.fields.STATE.ENDED);

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

		CONNECTING_DIV: '#connecting_div',
		READY_DIV: '#ready_div',

		STARTING_DIV: '#starting_div',
		STARTING_TIME_SPAN: '#starting_time_span',
		
		RUNNING_DIV: '#running_div',
		RUNNING_TIME_SPAN: '#running_time_span',

		ENDED_DIV: '#ended_div',

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

		},

		STARTING: (countdownInSeconds) => {

			$(this.SELECTORS.STARTING_DIV).show();

			if (countdownInSeconds) $(this.SELECTORS.STARTING_TIME_SPAN).text(countdownInSeconds);

		},

		RUNNING: (countdownInSeconds) => {

			$(this.SELECTORS.RUNNING_DIV).show();

			$(this.SELECTORS.RUNNING_TIME_SPAN).text(countdownInSeconds);

		},

		ENDED: () => {

			$(this.SELECTORS.ENDED_DIV).show();

		},

	}

	constructor() {

		this.state = this.STATE.INPUT_USER;

	}

	changeState(newState, params) {

		this.state = newState;

		this.render(params);

	}

	render(params) {

		$(this.SELECTORS.APP + ' > div').hide();

		this.state(params);

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

	setManager(manager) {

		this.manager = manager;

	}

	clone() {

		let cloned = new AppState();

		cloned.setUser(this.user);

		cloned.setDuration(this.duration);

		cloned.setProblems(this.problems);

		cloned.setParticipants(this.participants);

		return cloned;

	}

	createNewContest(duration, problems) {

		this.duration = duration;

		this.problems = structuredClone(problems);

		this.participants[this.user] = this._newParticipantProblems();

		this._updateUI();

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

		this.problems = structuredClone(problems);

		this._updateUI();

	}

	getProblems() {

		return structuredClone(this.problems);

	}

	addNewParticipant(newUser) {

		if (newUser == this.user) return ;

		this.addParticipant(newUser);

	}

	addParticipant(user) {

		this.participants[user] = this._newParticipantProblems();

		this._updateUI();

	}

	_newParticipantProblems() {

		return Array(this.problems.length).fill('');

	}

	setParticipants(participants) {

		this.participants = structuredClone(participants);

	}

	getParticipants() {

		return this.participants;

	}

	updateSubmissionAccepted(problemId, user) {

		if (user === this.user) return;

		if (!user) user = this.user;

		let index = this.problems.findIndex(problem => problem.id === problemId);

		this.participants[user][index] = 'AC';

		this._updateUI();

	}

	_updateUI() {

		if (this.appStateUI) this.appStateUI.render();

	}

	prepareTimer(contestStartTimestamp) {

		let timer = new AppTimer();

		timer.setDurationInSeconds(this.duration * 60);

		timer.setStartTimestamp(contestStartTimestamp);

		timer.setCallbackOnWaiting((toWaitSeconds) => { this.manager.contestCountdown(toWaitSeconds); });

		timer.setCallbackOnTick((elapsedSeconds) => { this.manager.contestRunning(elapsedSeconds); });

		timer.setCallbackOnEnd(() => { this.manager.contestEnded(); });

		timer.start();

	}

}

class AppTimer {

	_STATES = {

		SETUP: 'SETUP',

		WAITING: 'WAITING',

		RUNNING: 'RUNNING',

		ENDED: 'ENDED'

	};

	constructor(durationInSeconds) {

		this._durationInSeconds = durationInSeconds ? durationInSeconds: 10;

		this._state = this._STATES.SETUP;

	}

	setDurationInSeconds(durationInSeconds) {

		this._durationInSeconds = durationInSeconds;

	}

	setStartTimestamp(startTimestamp) {

		this._startTimestamp = startTimestamp;

	}

	setCallbackOnWaiting(callback) {

		this._callbackOnWaiting = callback;

	}

	setCallbackOnTick(callback) {

		this._callbackOnTick = callback;

	}

	setCallbackOnEnd(callback) {

		this._callbackOnEnd = callback;

	}

	start() {

		if (this._state != this._STATES.SETUP) return;

		this._state = this._STATES.RUNNING;

		if (this._startTimestamp && this._startTimestamp > (new Date().getTime())) {

			this._state = this._STATES.WAITING;

			this._toWaitSeconds = Math.floor((this._startTimestamp - new Date().getTime()) / 1000);

		}

		this._elapsedSeconds = 0;

		this._intervalId = setInterval(() => {

			if (this._state === this._STATES.WAITING) {

				this._toWaitSeconds--;

				this._waiting();

				if (this._toWaitSeconds <= 0) this._state = this._STATES.RUNNING; 

				return;
			}


			this._elapsedSeconds++;

			if (this._elapsedSeconds >= this._durationInSeconds) this._state = this._STATES.ENDED;

			if (this._state === this._STATES.RUNNING) this._ticking();

			else if (this._state === this._STATES.ENDED) this._ended();

		}, 1000);

	}

	_waiting() {

		console.log('Timer waiting', this._toWaitSeconds);

		if (this._callbackOnWaiting) this._callbackOnWaiting(this._toWaitSeconds);
		
	}

	_ticking() {

		console.log('Timer tick', this._elapsedSeconds);

		if (this._callbackOnTick) this._callbackOnTick(this._durationInSeconds - this._elapsedSeconds);

	}

	_ended() {

		console.log('Timer ended');

		clearInterval(this._intervalId);

		if (this._callbackOnEnd) this._callbackOnEnd();

	}

}


const NetworkRequestGenerator = {

	getCreateContestRequest(state) {

		return {

			userId: state.getUser(),

			questions: state.getProblems().map((problem) => { return this._formatQuestion(problem); }),

			duration: state.getDuration()

		};

	},

	_formatQuestion(problem) {

		return {
			
			name: "temp_problem_name",

			url: problem.url

		}

	},

	getJoinContestRequest(state, inviteCode) {

		return {

			sessionId: inviteCode,
			
			userId: state.getUser()

		};

	},

	getSocketRequest(socketEvent, user, problemId) {

		let data = {};

		data.eventType = socketEvent.eventType;

		data.userId = user;

		if (problemId) data.contestQuestionId = problemId;

		return {

			getDestination: (path) => { return path + (socketEvent.destinationSuffix.length?('/'+socketEvent.destinationSuffix):''); },

			data: data

		};

	}

}

const NetworkResponseProcessor = {

	_generateNewAppStateFromResponse: function(response) {

		let newState = new AppState();

		newState.setProblems(response.questions.map((problem) => {return {url: problem.url, id: problem.contestQuestionId}}));

		response.users.forEach((user) => { newState.addParticipant(user.userId); });

		newState.setDuration(response.duration);

		return newState;

	},

	processCreateContestResponse: function(response) {

		return this._generateNewAppStateFromResponse(response);

	},

	processJoinContestResponse: function(response) {

		return this._generateNewAppStateFromResponse(response);

	},

	getContestId: function(contestResponse) {

		return contestResponse.sessionId;

	},

	getEventType: function(socketResponse) {

		return socketResponse.eventType;

	},

	getHandler: function (socketResponse, socketEventSettings) {

		for (const [key, entry] of Object.entries(socketEventSettings)) {

			if (entry.eventType === this.getEventType(socketResponse)) {

				return entry.handlerFn;

			}
		}

	},

	getUser: function(socketResponse) {

		return socketResponse.userId;

	},

	getProblemId: function(socketResponse) {

		return socketResponse.contestQuestionId;

	},

	getStartTime: function(socketResponse) {

		return socketResponse.startedAt;

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

		let table = this.getTableLayout(participants[this.appState.getUser()].length, tableContentHTML);

		let duration = this.getDurationSection(this.appState.getDuration());

		return duration + table;
	}

	getDurationSection(duration) {

		return `<p>Duration: ${duration}</p>`;

	}

	getTableContentHTML(participantName, problemStatusArr) {

		let row = `<tr><td>${participantName}</td>`;

		problemStatusArr.forEach((status) => { row += `<td>${status=='AC'?'&check;':''}</td>` } );

		row += '</td>';

		return row;
	}

	getTableLayout(problemsLength, tableContent) {

		let tableHead = '<thead><tr><th>user</th>';

		for (let i = 1; i <= problemsLength; i++) tableHead += `<th>#${i}</th>`;

		tableHead += '</tr></thead>';

		return `<table>${tableHead}${tableContent}</table>`;

	}

};


class AppAdapter {

	SOCKET_EVENT = {

		JOIN: { eventType: 'JOIN', destinationSuffix: '', handlerFn: 'receivedUserJoined' },

		CONTEST_START: { eventType: 'CONTEST_START', destinationSuffix: 'start', handlerFn: 'receivedContestStart'},

		SUBMIT_AC: { eventType: 'SUBMIT_AC', destinationSuffix: 'submit', handlerFn: 'receivedSubmissionAccepted'},

		CONTEST_END: { eventType: 'CONTEST_END', destinationSuffix: '', handlerFn: 'receivedContestEnd'},

	};

	constructor() {

		this.adapterAjax = new AppAdapterAjax();

		this.adapterSocket = new AppAdapterSocket();

		this.adapterSocket.setAdapter(this);

	}

	setManager(manager) {

		this.manager = manager;

	}

	setUser(user) {

		this.user = user;

	}

	getUser() {

		return this.user;

	}

	sendCreateContest(state) {

		let contestRequest = NetworkRequestGenerator.getCreateContestRequest(state);

		this.adapterAjax.sendCreateContestRequest(

			contestRequest, 

			(contestResponse) => {

				this.adapterSocket.init(

					contestResponse.sessionId,

					() => {

						this.manager.contestCreated(

							NetworkResponseProcessor.getContestId(contestResponse),

							NetworkResponseProcessor.processCreateContestResponse(contestResponse)

						); 

					}

				);
			}
		);

	}

	sendJoinContest(state, inviteCode) {

		let joinRequest = NetworkRequestGenerator.getJoinContestRequest(state, inviteCode);

		this.adapterAjax.sendJoinContestRequest(

			joinRequest,

			(contestResponse) => {

				this.adapterSocket.init(

					contestResponse.sessionId,

					() => {

						this.manager.contestJoined(NetworkResponseProcessor.processJoinContestResponse(contestResponse));

						this.adapterSocket.send(NetworkRequestGenerator.getSocketRequest(this.SOCKET_EVENT.JOIN, this.user));

					}

				);
			}

		);

	}

	processReceivedSocketMessage(receivedMessage) {

		let handlerFn = NetworkResponseProcessor.getHandler(receivedMessage, this.SOCKET_EVENT);

		if (this[handlerFn]) this[handlerFn](receivedMessage);

	}

	receivedUserJoined(receivedMessage) {

		let joinedUser = NetworkResponseProcessor.getUser(receivedMessage);

		console.log(joinedUser, " joined");

		this.manager.participantJoined(joinedUser);

	}

	sendStartContest() {

		this.adapterSocket.send(

			NetworkRequestGenerator.getSocketRequest(

				this.SOCKET_EVENT.CONTEST_START, 

				this.user

			)

		);

	}

	receivedContestStart(socketMessage) {

		console.log('receivedContestStart', socketMessage);
		
		this.manager.contestEnterCountdown(NetworkResponseProcessor.getStartTime(socketMessage));

	}

	receivedContestEnd(socketMessage) {

		this.manager.contestEnded();

	}


	sendSubmissionAccepted(problemId) {

		this.adapterSocket.send(

			NetworkRequestGenerator.getSocketRequest(

				this.SOCKET_EVENT.SUBMIT_AC, 

				this.user, 

				problemId

			)

		);

	}

	receivedSubmissionAccepted(receivedMessage) {

		console.log('receivedSubmissionAccepted', receivedMessage);

		this.manager.participantSubmissionAccepted(

			NetworkResponseProcessor.getUser(receivedMessage),

			NetworkResponseProcessor.getProblemId(receivedMessage)

		);

	}

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

	setAdapter(adapter) {

		this.adapter = adapter;

	}

	init(topic, onInitSuccessCallback) {

		this.setRoom(topic);

		this.stompClient.onConnect = (frame) => {

		    console.log('Connected: ' + frame);

		    if (onInitSuccessCallback) onInitSuccessCallback();

		    this.stompClient.subscribe(this.SUBSCRIBE_ENDPOINT + '/' + this.room, (socketMessage) => {

		    	this.adapter.processReceivedSocketMessage(JSON.parse(socketMessage.body));

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

	send(socketRequest) {

	    this.stompClient.publish({

	        destination: socketRequest.getDestination(this.PUBLISH_DESTINATION + '/' + this.room),

	        body: JSON.stringify(socketRequest.data)

	    });

	}

	terminate() {

		this.stompClient.deactivate();

	}

}






