import { ProgrammingError } from "./ProgrammingError-chunk.js";
import { assertMainOrNode, assertWorkerOrNode, isDesktop, isOfflineStorageAvailable, isTest } from "./Env-chunk.js";
import { client } from "./ClientDetector-chunk.js";
import { TypeRef, assert, assertNotNull, base64ExtToBase64, base64ToBase64Ext, base64ToBase64Url, base64UrlToBase64, binarySearch, defer, delay, difference, downcast, freezeMap, getFirstOrThrow, getTypeId, groupBy, groupByAndMapUniquely, identity, isSameTypeRef, lastThrow, mapNullable, mapObject, ofClass, pMap, promiseFilter, randomIntFromInterval, splitInChunks } from "./dist2-chunk.js";
import { CloseEventBusOption, GroupType, OperationType, SECOND_MS } from "./TutanotaConstants-chunk.js";
import { AssociationType, CUSTOM_MAX_ID, CUSTOM_MIN_ID, Cardinality, GENERATED_MAX_ID, GENERATED_MIN_ID, LOAD_MULTIPLE_LIMIT, POST_MULTIPLE_LIMIT, Type, ValueType, compareOldestFirst, firstBiggerThanSecond, getElementId, getListId } from "./EntityUtils-chunk.js";
import { CalendarEventTypeRef, CalendarEventUidIndexTypeRef, MailDetailsBlobTypeRef, MailSetEntryTypeRef, MailTypeRef, PhishingMarkerWebsocketDataTypeRef } from "./TypeRefs-chunk.js";
import { AuditLogEntryTypeRef, BucketPermissionTypeRef, EntityEventBatchTypeRef, GroupKeyTypeRef, KeyRotationTypeRef, PermissionTypeRef, PushIdentifierTypeRef, RecoverCodeTypeRef, RejectedSenderTypeRef, SecondFactorTypeRef, SessionTypeRef, UserGroupKeyDistributionTypeRef, UserGroupRootTypeRef, UserTypeRef, WebsocketCounterDataTypeRef, WebsocketEntityDataTypeRef, WebsocketLeaderStatusTypeRef, createWebsocketLeaderStatus } from "./TypeRefs2-chunk.js";
import { handleUncaughtError } from "./ErrorHandler-chunk.js";
import { HttpMethod, MediaType, ModelInfo_default, _verifyType, resolveTypeReference } from "./EntityFunctions-chunk.js";
import { ModelInfo_default$1 } from "./ModelInfo-chunk.js";
import { SessionKeyNotFoundError, isOfflineError, objToError } from "./ErrorUtils-chunk.js";
import { AccessBlockedError, AccessDeactivatedError, ConnectionError, InternalServerError, NotAuthenticatedError, NotAuthorizedError, NotFoundError, PayloadTooLargeError, ServiceUnavailableError, SessionExpiredError, handleRestError } from "./RestError-chunk.js";
import { SetupMultipleError } from "./SetupMultipleError-chunk.js";
import { OutOfSyncError } from "./OutOfSyncError-chunk.js";
import { CancelledError } from "./CancelledError-chunk.js";
import { EventQueue } from "./EventQueue-chunk.js";
import { LoginIncompleteError } from "./LoginIncompleteError-chunk.js";
import { MessageDispatcher, Request } from "./MessageDispatcher-chunk.js";
import { exposeLocalDelayed, exposeRemote } from "./WorkerProxy-chunk.js";
import { containsEventOfType, getEventOfType } from "./EntityUpdateUtils-chunk.js";
import { parseKeyVersion } from "./KeyLoaderFacade-chunk.js";

//#region src/common/api/worker/ProgressMonitorDelegate.ts
var ProgressMonitorDelegate = class {
	ref;
	constructor(progressTracker, totalWork) {
		this.progressTracker = progressTracker;
		this.totalWork = totalWork;
		this.ref = progressTracker.registerMonitor(totalWork);
	}
	async workDone(amount) {
		await this.progressTracker.workDoneForMonitor(await this.ref, amount);
	}
	async totalWorkDone(totalAmount) {
		await this.progressTracker.workDoneForMonitor(await this.ref, this.totalWork - totalAmount);
	}
	async completed() {
		await this.progressTracker.workDoneForMonitor(await this.ref, this.totalWork);
	}
};

//#endregion
//#region src/common/api/common/threading/Transport.ts
var WebWorkerTransport = class {
	constructor(worker) {
		this.worker = worker;
	}
	postMessage(message) {
		return this.worker.postMessage(message);
	}
	setMessageHandler(handler) {
		this.worker.onmessage = (ev) => handler(downcast(ev.data));
	}
};

//#endregion
//#region src/common/api/main/WorkerClient.ts
assertMainOrNode();
let WsConnectionState = function(WsConnectionState$1) {
	WsConnectionState$1[WsConnectionState$1["connecting"] = 0] = "connecting";
	WsConnectionState$1[WsConnectionState$1["connected"] = 1] = "connected";
	WsConnectionState$1[WsConnectionState$1["terminated"] = 2] = "terminated";
	return WsConnectionState$1;
}({});
var WorkerClient = class {
	_deferredInitialized = defer();
	_isInitialized = false;
	_dispatcher;
	constructor() {
		this.initialized.then(() => {
			this._isInitialized = true;
		});
	}
	get initialized() {
		return this._deferredInitialized.promise;
	}
	async init(locator) {
		if (env.mode !== "Test") {
			const { prefixWithoutFile } = window.tutao.appState;
			const workerUrl = prefixWithoutFile + "/worker-bootstrap.js";
			const worker = new Worker(workerUrl, { type: "module" });
			this._dispatcher = new MessageDispatcher(new WebWorkerTransport(worker), this.queueCommands(locator), "main-worker");
			await this._dispatcher.postRequest(new Request("setup", [
				window.env,
				this.getInitialEntropy(),
				client.browserData()
			]));
			worker.onerror = (e) => {
				throw new Error(`could not setup worker: ${e.name} ${e.stack} ${e.message} ${e}`);
			};
		} else {
			const WorkerImpl = globalThis.testWorker;
			const workerImpl = new WorkerImpl(this, true);
			await workerImpl.init(client.browserData());
			workerImpl._queue._transport = { postMessage: (msg) => this._dispatcher.handleMessage(msg) };
			this._dispatcher = new MessageDispatcher({ postMessage: function(msg) {
				workerImpl._queue.handleMessage(msg);
			} }, this.queueCommands(locator), "main-worker");
		}
		this._deferredInitialized.resolve();
	}
	queueCommands(locator) {
		return {
			execNative: (message) => locator.native.invokeNative(downcast(message.args[0]), downcast(message.args[1])),
			error: (message) => {
				handleUncaughtError(objToError(message.args[0]));
				return Promise.resolve();
			},
			facade: exposeLocalDelayed({
				async loginListener() {
					return locator.loginListener;
				},
				async wsConnectivityListener() {
					return locator.connectivityModel;
				},
				async progressTracker() {
					return locator.progressTracker;
				},
				async eventController() {
					return locator.eventController;
				},
				async operationProgressTracker() {
					return locator.operationProgressTracker;
				},
				async infoMessageHandler() {
					return locator.infoMessageHandler;
				}
			})
		};
	}
	getWorkerInterface() {
		return exposeRemote(async (request) => this._postRequest(request));
	}
	restRequest(...args) {
		return this._postRequest(new Request("restRequest", args));
	}
	/** @private visible for tests */
	async _postRequest(msg) {
		await this.initialized;
		return this._dispatcher.postRequest(msg);
	}
	reset() {
		return this._postRequest(new Request("reset", []));
	}
	/**
	* Add data from either secure random source or Math.random as entropy.
	*/
	getInitialEntropy() {
		const valueList = new Uint32Array(16);
		crypto.getRandomValues(valueList);
		const entropy = [];
		for (let i = 0; i < valueList.length; i++) entropy.push({
			source: "random",
			entropy: 32,
			data: valueList[i]
		});
		return entropy;
	}
};
function bootstrapWorker(locator) {
	const worker = new WorkerClient();
	const start = Date.now();
	worker.init(locator).then(() => console.log("worker init time (ms):", Date.now() - start));
	return worker;
}

//#endregion
//#region src/common/api/worker/EventBusClient.ts
assertWorkerOrNode();
let EventBusState = function(EventBusState$1) {
	EventBusState$1["Automatic"] = "automatic";
	EventBusState$1["Suspended"] = "suspended";
	EventBusState$1["Terminated"] = "terminated";
	return EventBusState$1;
}({});
const ENTITY_EVENT_BATCH_EXPIRE_MS = 38016e5;
const RETRY_AFTER_SERVICE_UNAVAILABLE_ERROR_MS = 3e4;
const NORMAL_SHUTDOWN_CLOSE_CODE = 1;
/**
* Reconnection interval bounds. When we reconnect we pick a random number of seconds in a range to prevent that all the clients connect at the same time which
* would put unnecessary load on the server.
* The range depends on the number of attempts and the server response.
* */
const RECONNECT_INTERVAL = Object.freeze({
	SMALL: [5, 10],
	MEDIUM: [20, 40],
	LARGE: [60, 120]
});
const MAX_EVENT_IDS_QUEUE_LENGTH = 1e3;
/** Known types of messages that can be received over websocket. */
var MessageType = function(MessageType$1) {
	MessageType$1["EntityUpdate"] = "entityUpdate";
	MessageType$1["UnreadCounterUpdate"] = "unreadCounterUpdate";
	MessageType$1["PhishingMarkers"] = "phishingMarkers";
	MessageType$1["LeaderStatus"] = "leaderStatus";
	return MessageType$1;
}(MessageType || {});
let ConnectMode = function(ConnectMode$1) {
	ConnectMode$1[ConnectMode$1["Initial"] = 0] = "Initial";
	ConnectMode$1[ConnectMode$1["Reconnect"] = 1] = "Reconnect";
	return ConnectMode$1;
}({});
var EventBusClient = class {
	state;
	socket;
	immediateReconnect = false;
	/**
	* Map from group id to last event ids (max. _MAX_EVENT_IDS_QUEUE_LENGTH). We keep them to avoid processing the same event twice if
	* it comes out of order from the server) and for requesting missed entity events on reconnect.
	*
	* We do not have to update these event ids if the groups of the user change because we always take the current users groups from the
	* LoginFacade.
	*/
	lastEntityEventIds;
	/**
	* Last batch which was actually added to the queue. We need it to find out when the group is processed
	*/
	lastAddedBatchForGroup;
	lastAntiphishingMarkersId = null;
	/** Queue to process all events. */
	eventQueue;
	/** Queue that handles incoming websocket messages only. Caches them until we process downloaded ones and then adds them to eventQueue. */
	entityUpdateMessageQueue;
	reconnectTimer;
	connectTimer;
	/**
	* Represents a currently retried executing due to a ServiceUnavailableError
	*/
	serviceUnavailableRetry = null;
	failedConnectionAttempts = 0;
	constructor(listener, cache, userFacade, entity, instanceMapper, socketFactory, sleepDetector, progressTracker) {
		this.listener = listener;
		this.cache = cache;
		this.userFacade = userFacade;
		this.entity = entity;
		this.instanceMapper = instanceMapper;
		this.socketFactory = socketFactory;
		this.sleepDetector = sleepDetector;
		this.progressTracker = progressTracker;
		this.state = EventBusState.Terminated;
		this.lastEntityEventIds = new Map();
		this.lastAddedBatchForGroup = new Map();
		this.socket = null;
		this.reconnectTimer = null;
		this.connectTimer = null;
		this.eventQueue = new EventQueue("ws_opt", true, (modification) => this.eventQueueCallback(modification));
		this.entityUpdateMessageQueue = new EventQueue("ws_msg", false, (batch) => this.entityUpdateMessageQueueCallback(batch));
		this.reset();
	}
	reset() {
		this.immediateReconnect = false;
		this.lastEntityEventIds.clear();
		this.lastAddedBatchForGroup.clear();
		this.eventQueue.pause();
		this.eventQueue.clear();
		this.serviceUnavailableRetry = null;
	}
	/**
	* Opens a WebSocket connection to receive server events.
	* @param connectMode
	*/
	connect(connectMode) {
		console.log("ws connect reconnect:", connectMode === ConnectMode.Reconnect, "state:", this.state);
		this.serviceUnavailableRetry = null;
		this.listener.onWebsocketStateChanged(WsConnectionState.connecting);
		this.state = EventBusState.Automatic;
		this.connectTimer = null;
		const authHeaders = this.userFacade.createAuthHeaders();
		const authQuery = "modelVersions=" + ModelInfo_default$1.version + "." + ModelInfo_default.version + "&clientVersion=" + env.versionNumber + "&userId=" + this.userFacade.getLoggedInUser()._id + "&accessToken=" + authHeaders.accessToken + (this.lastAntiphishingMarkersId ? "&lastPhishingMarkersId=" + this.lastAntiphishingMarkersId : "");
		const path = "/event?" + authQuery;
		this.unsubscribeFromOldWebsocket();
		this.socket = this.socketFactory(path);
		this.socket.onopen = () => this.onOpen(connectMode);
		this.socket.onclose = (event) => this.onClose(event);
		this.socket.onerror = (error) => this.onError(error);
		this.socket.onmessage = (message) => this.onMessage(message);
		this.sleepDetector.start(() => {
			console.log("ws sleep detected, reconnecting...");
			this.tryReconnect(true, true);
		});
	}
	/**
	* Sends a close event to the server and finally closes the connection.
	* The state of this event bus client is reset and the client is terminated (does not automatically reconnect) except reconnect == true
	*/
	async close(closeOption) {
		console.log("ws close closeOption: ", closeOption, "state:", this.state);
		switch (closeOption) {
			case CloseEventBusOption.Terminate:
				this.terminate();
				break;
			case CloseEventBusOption.Pause:
				this.state = EventBusState.Suspended;
				this.listener.onWebsocketStateChanged(WsConnectionState.connecting);
				break;
			case CloseEventBusOption.Reconnect:
				this.listener.onWebsocketStateChanged(WsConnectionState.connecting);
				break;
		}
		this.socket?.close();
	}
	async tryReconnect(closeIfOpen, enableAutomaticState, delay$1 = null) {
		console.log("ws tryReconnect closeIfOpen:", closeIfOpen, "enableAutomaticState:", enableAutomaticState, "delay:", delay$1);
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
		if (!delay$1) this.reconnect(closeIfOpen, enableAutomaticState);
else this.reconnectTimer = setTimeout(() => this.reconnect(closeIfOpen, enableAutomaticState), delay$1);
	}
	onOpen(connectMode) {
		this.failedConnectionAttempts = 0;
		console.log("ws open state:", this.state);
		const p = this.initEntityEvents(connectMode);
		this.listener.onWebsocketStateChanged(WsConnectionState.connected);
		return p;
	}
	onError(error) {
		console.log("ws error:", error, JSON.stringify(error), "state:", this.state);
	}
	async onMessage(message) {
		const [type, value] = message.data.split(";");
		switch (type) {
			case MessageType.EntityUpdate: {
				const { eventBatchId, eventBatchOwner, eventBatch } = await this.instanceMapper.decryptAndMapToInstance(await resolveTypeReference(WebsocketEntityDataTypeRef), JSON.parse(value), null);
				const filteredEntityUpdates = await this.removeUnknownTypes(eventBatch);
				this.entityUpdateMessageQueue.add(eventBatchId, eventBatchOwner, filteredEntityUpdates);
				break;
			}
			case MessageType.UnreadCounterUpdate: {
				const counterData = await this.instanceMapper.decryptAndMapToInstance(await resolveTypeReference(WebsocketCounterDataTypeRef), JSON.parse(value), null);
				this.listener.onCounterChanged(counterData);
				break;
			}
			case MessageType.PhishingMarkers: {
				const data = await this.instanceMapper.decryptAndMapToInstance(await resolveTypeReference(PhishingMarkerWebsocketDataTypeRef), JSON.parse(value), null);
				this.lastAntiphishingMarkersId = data.lastId;
				this.listener.onPhishingMarkersReceived(data.markers);
				break;
			}
			case MessageType.LeaderStatus: {
				const data = await this.instanceMapper.decryptAndMapToInstance(await resolveTypeReference(WebsocketLeaderStatusTypeRef), JSON.parse(value), null);
				await this.userFacade.setLeaderStatus(data);
				await this.listener.onLeaderStatusChanged(data);
				break;
			}
			default:
				console.log("ws message with unknown type", type);
				break;
		}
	}
	/**
	* Filters out specific types from @param entityUpdates that the client does not actually know about
	* (that are not in tutanotaTypes), and which should therefore not be processed.
	*/
	async removeUnknownTypes(eventBatch) {
		return promiseFilter(eventBatch, async (entityUpdate) => {
			const typeRef = new TypeRef(entityUpdate.application, entityUpdate.type);
			try {
				await resolveTypeReference(typeRef);
				return true;
			} catch (_error) {
				console.warn("ignoring entityEventUpdate for unknown type with typeId", getTypeId(typeRef));
				return false;
			}
		});
	}
	onClose(event) {
		this.failedConnectionAttempts++;
		console.log("ws close event:", event, "state:", this.state);
		this.userFacade.setLeaderStatus(createWebsocketLeaderStatus({ leaderStatus: false }));
		this.sleepDetector.stop();
		const serverCode = event.code - 4e3;
		if ([
			NotAuthorizedError.CODE,
			AccessDeactivatedError.CODE,
			AccessBlockedError.CODE
		].includes(serverCode)) {
			this.terminate();
			this.listener.onError(handleRestError(serverCode, "web socket error", null, null));
		} else if (serverCode === SessionExpiredError.CODE) {
			this.state = EventBusState.Suspended;
			this.listener.onWebsocketStateChanged(WsConnectionState.connecting);
		} else if (this.state === EventBusState.Automatic && this.userFacade.isFullyLoggedIn()) {
			this.listener.onWebsocketStateChanged(WsConnectionState.connecting);
			if (this.immediateReconnect) {
				this.immediateReconnect = false;
				this.tryReconnect(false, false);
			} else {
				let reconnectionInterval;
				if (serverCode === NORMAL_SHUTDOWN_CLOSE_CODE) reconnectionInterval = RECONNECT_INTERVAL.LARGE;
else if (this.failedConnectionAttempts === 1) reconnectionInterval = RECONNECT_INTERVAL.SMALL;
else if (this.failedConnectionAttempts === 2) reconnectionInterval = RECONNECT_INTERVAL.MEDIUM;
else reconnectionInterval = RECONNECT_INTERVAL.LARGE;
				this.tryReconnect(false, false, SECOND_MS * randomIntFromInterval(reconnectionInterval[0], reconnectionInterval[1]));
			}
		}
	}
	async initEntityEvents(connectMode) {
		this.entityUpdateMessageQueue.pause();
		this.eventQueue.pause();
		const existingConnection = connectMode == ConnectMode.Reconnect && this.lastEntityEventIds.size > 0;
		const p = existingConnection ? this.loadMissedEntityEvents(this.eventQueue) : this.initOnNewConnection();
		return p.then(() => {
			this.entityUpdateMessageQueue.resume();
			this.eventQueue.resume();
		}).catch(ofClass(ConnectionError, (e) => {
			console.log("ws not connected in connect(), close websocket", e);
			this.close(CloseEventBusOption.Reconnect);
		})).catch(ofClass(CancelledError, () => {
			console.log("ws cancelled retry process entity events after reconnect");
		})).catch(ofClass(ServiceUnavailableError, async (e) => {
			if (!existingConnection) this.lastEntityEventIds.clear();
			console.log("ws retry init entity events in ", RETRY_AFTER_SERVICE_UNAVAILABLE_ERROR_MS, e);
			let promise = delay(RETRY_AFTER_SERVICE_UNAVAILABLE_ERROR_MS).then(() => {
				if (this.serviceUnavailableRetry === promise) {
					console.log("ws retry initializing entity events");
					return this.initEntityEvents(connectMode);
				} else console.log("ws cancel initializing entity events");
			});
			this.serviceUnavailableRetry = promise;
			return promise;
		})).catch(ofClass(OutOfSyncError, async (e) => {
			await this.cache.purgeStorage();
			throw e;
		})).catch((e) => {
			this.entityUpdateMessageQueue.resume();
			this.eventQueue.resume();
			this.listener.onError(e);
		});
	}
	async initOnNewConnection() {
		const { lastIds, someIdsWereCached } = await this.retrieveLastEntityEventIds();
		this.lastEntityEventIds = lastIds;
		if (someIdsWereCached) await this.loadMissedEntityEvents(this.eventQueue);
else await this.cache.recordSyncTime();
	}
	/**
	* Gets the latest event batch ids for each of the users groups or min id if there is no event batch yet.
	* This is needed to know from where to start loading missed events when we connect.
	*/
	async retrieveLastEntityEventIds() {
		const lastIds = new Map();
		let someIdsWereCached = false;
		for (const groupId of this.eventGroups()) {
			const cachedBatchId = await this.cache.getLastEntityEventBatchForGroup(groupId);
			if (cachedBatchId != null) {
				lastIds.set(groupId, [cachedBatchId]);
				someIdsWereCached = true;
			} else {
				const batches = await this.entity.loadRange(EntityEventBatchTypeRef, groupId, GENERATED_MAX_ID, 1, true);
				const batchId = batches.length === 1 ? getElementId(batches[0]) : GENERATED_MIN_ID;
				lastIds.set(groupId, [batchId]);
				await this.cache.setLastEntityEventBatchForGroup(groupId, batchId);
			}
		}
		return {
			lastIds,
			someIdsWereCached
		};
	}
	/** Load event batches since the last time we were connected to bring cache and other things up-to-date.
	* @param eventQueue is passed in for testing
	* @VisibleForTesting
	* */
	async loadMissedEntityEvents(eventQueue) {
		if (!this.userFacade.isFullyLoggedIn()) return;
		await this.checkOutOfSync();
		let eventBatches = [];
		for (let groupId of this.eventGroups()) {
			const eventBatchForGroup = await this.loadEntityEventsForGroup(groupId);
			eventBatches = eventBatches.concat(eventBatchForGroup);
		}
		const timeSortedEventBatches = eventBatches.sort((a, b) => compareOldestFirst(getElementId(a), getElementId(b)));
		let totalExpectedBatches = 0;
		for (const batch of timeSortedEventBatches) {
			const filteredEntityUpdates = await this.removeUnknownTypes(batch.events);
			const batchWasAddedToQueue = this.addBatch(getElementId(batch), getListId(batch), filteredEntityUpdates, eventQueue);
			if (batchWasAddedToQueue) totalExpectedBatches++;
		}
		const progressMonitor = new ProgressMonitorDelegate(this.progressTracker, totalExpectedBatches + 1);
		console.log("ws", `progress monitor expects ${totalExpectedBatches} events`);
		await progressMonitor.workDone(1);
		eventQueue.setProgressMonitor(progressMonitor);
		await this.cache.recordSyncTime();
	}
	async loadEntityEventsForGroup(groupId) {
		try {
			return await this.entity.loadAll(EntityEventBatchTypeRef, groupId, this.getLastEventBatchIdOrMinIdForGroup(groupId));
		} catch (e) {
			if (e instanceof NotAuthorizedError) {
				console.log("ws could not download entity updates, lost permission");
				return [];
			} else throw e;
		}
	}
	async checkOutOfSync() {
		if (await this.cache.isOutOfSync()) throw new OutOfSyncError("some missed EntityEventBatches cannot be loaded any more");
	}
	async eventQueueCallback(modification) {
		try {
			await this.processEventBatch(modification);
		} catch (e) {
			console.log("ws error while processing event batches", e);
			this.listener.onError(e);
			throw e;
		}
	}
	async entityUpdateMessageQueueCallback(batch) {
		this.addBatch(batch.batchId, batch.groupId, batch.events, this.eventQueue);
		this.eventQueue.resume();
	}
	unsubscribeFromOldWebsocket() {
		if (this.socket) this.socket.onopen = this.socket.onclose = this.socket.onerror = this.socket.onmessage = identity;
	}
	async terminate() {
		this.state = EventBusState.Terminated;
		this.reset();
		this.listener.onWebsocketStateChanged(WsConnectionState.terminated);
	}
	/**
	* Tries to reconnect the websocket if it is not connected.
	*/
	reconnect(closeIfOpen, enableAutomaticState) {
		console.log("ws reconnect socket.readyState: (CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3): " + (this.socket ? this.socket.readyState : "null"), "state:", this.state, "closeIfOpen:", closeIfOpen, "enableAutomaticState:", enableAutomaticState);
		if (this.state !== EventBusState.Terminated && enableAutomaticState) this.state = EventBusState.Automatic;
		if (closeIfOpen && this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.immediateReconnect = true;
			this.socket.close();
		} else if ((this.socket == null || this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) && this.state !== EventBusState.Terminated && this.userFacade.isFullyLoggedIn()) {
			if (this.connectTimer) clearTimeout(this.connectTimer);
			this.connectTimer = setTimeout(() => this.connect(ConnectMode.Reconnect), 100);
		}
	}
	addBatch(batchId, groupId, events, eventQueue) {
		const lastForGroup = this.lastEntityEventIds.get(groupId) || [];
		const index = binarySearch(lastForGroup, batchId, compareOldestFirst);
		let wasAdded;
		if (index < 0) {
			lastForGroup.splice(-index, 0, batchId);
			wasAdded = eventQueue.add(batchId, groupId, events);
		} else wasAdded = false;
		if (lastForGroup.length > MAX_EVENT_IDS_QUEUE_LENGTH) lastForGroup.shift();
		this.lastEntityEventIds.set(batchId, lastForGroup);
		if (wasAdded) this.lastAddedBatchForGroup.set(groupId, batchId);
		return wasAdded;
	}
	async processEventBatch(batch) {
		try {
			if (this.isTerminated()) return;
			const filteredEvents = await this.cache.entityEventsReceived(batch);
			if (!this.isTerminated()) await this.listener.onEntityEventsReceived(filteredEvents, batch.batchId, batch.groupId);
		} catch (e) {
			if (e instanceof ServiceUnavailableError) {
				console.log("ws retry processing event in 30s", e);
				const retryPromise = delay(RETRY_AFTER_SERVICE_UNAVAILABLE_ERROR_MS).then(() => {
					if (this.serviceUnavailableRetry === retryPromise) return this.processEventBatch(batch);
else throw new CancelledError("stop retry processing after service unavailable due to reconnect");
				});
				this.serviceUnavailableRetry = retryPromise;
				return retryPromise;
			} else {
				console.log("EVENT", "error", e);
				throw e;
			}
		}
	}
	getLastEventBatchIdOrMinIdForGroup(groupId) {
		const lastIds = this.lastEntityEventIds.get(groupId);
		return lastIds && lastIds.length > 0 ? lastThrow(lastIds) : GENERATED_MIN_ID;
	}
	isTerminated() {
		return this.state === EventBusState.Terminated;
	}
	eventGroups() {
		return this.userFacade.getLoggedInUser().memberships.filter((membership) => membership.groupType !== GroupType.MailingList).map((membership) => membership.group).concat(this.userFacade.getLoggedInUser().userGroup.group);
	}
};

//#endregion
//#region libs/cborg.js
const typeofs = [
	"string",
	"number",
	"bigint",
	"symbol"
];
const objectTypeNames = [
	"Function",
	"Generator",
	"AsyncGenerator",
	"GeneratorFunction",
	"AsyncGeneratorFunction",
	"AsyncFunction",
	"Observable",
	"Array",
	"Buffer",
	"Object",
	"RegExp",
	"Date",
	"Error",
	"Map",
	"Set",
	"WeakMap",
	"WeakSet",
	"ArrayBuffer",
	"SharedArrayBuffer",
	"DataView",
	"Promise",
	"URL",
	"HTMLElement",
	"Int8Array",
	"Uint8Array",
	"Uint8ClampedArray",
	"Int16Array",
	"Uint16Array",
	"Int32Array",
	"Uint32Array",
	"Float32Array",
	"Float64Array",
	"BigInt64Array",
	"BigUint64Array"
];
/**
* @param {any} value
* @returns {string}
*/
function is(value) {
	if (value === null) return "null";
	if (value === undefined) return "undefined";
	if (value === true || value === false) return "boolean";
	const typeOf = typeof value;
	if (typeofs.includes(typeOf)) return typeOf;
	if (typeOf === "function") return "Function";
	if (Array.isArray(value)) return "Array";
	if (isBuffer$1(value)) return "Buffer";
	const objectType = getObjectType(value);
	if (objectType) return objectType;
	return "Object";
}
/**
* @param {any} value
* @returns {boolean}
*/
function isBuffer$1(value) {
	return value && value.constructor && value.constructor.isBuffer && value.constructor.isBuffer.call(null, value);
}
/**
* @param {any} value
* @returns {string|undefined}
*/
function getObjectType(value) {
	const objectTypeName = Object.prototype.toString.call(value).slice(8, -1);
	if (objectTypeNames.includes(objectTypeName)) return objectTypeName;
	return undefined;
}
var Type$1 = class {
	/**
	* @param {number} major
	* @param {string} name
	* @param {boolean} terminal
	*/
	constructor(major, name, terminal) {
		this.major = major;
		this.majorEncoded = major << 5;
		this.name = name;
		this.terminal = terminal;
	}
	toString() {
		return `Type[${this.major}].${this.name}`;
	}
	/**
	* @param {Type} typ
	* @returns {number}
	*/
	compare(typ) {
		return this.major < typ.major ? -1 : this.major > typ.major ? 1 : 0;
	}
};
Type$1.uint = new Type$1(0, "uint", true);
Type$1.negint = new Type$1(1, "negint", true);
Type$1.bytes = new Type$1(2, "bytes", true);
Type$1.string = new Type$1(3, "string", true);
Type$1.array = new Type$1(4, "array", false);
Type$1.map = new Type$1(5, "map", false);
Type$1.tag = new Type$1(6, "tag", false);
Type$1.float = new Type$1(7, "float", true);
Type$1.false = new Type$1(7, "false", true);
Type$1.true = new Type$1(7, "true", true);
Type$1.null = new Type$1(7, "null", true);
Type$1.undefined = new Type$1(7, "undefined", true);
Type$1.break = new Type$1(7, "break", true);
var Token = class {
	/**
	* @param {Type} type
	* @param {any} [value]
	* @param {number} [encodedLength]
	*/
	constructor(type, value, encodedLength) {
		this.type = type;
		this.value = value;
		this.encodedLength = encodedLength;
		/** @type {Uint8Array|undefined} */
		this.encodedBytes = undefined;
		/** @type {Uint8Array|undefined} */
		this.byteValue = undefined;
	}
	toString() {
		return `Token[${this.type}].${this.value}`;
	}
};
const useBuffer = globalThis.process && !globalThis.process.browser && globalThis.Buffer && typeof globalThis.Buffer.isBuffer === "function";
const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();
/**
* @param {Uint8Array} buf
* @returns {boolean}
*/
function isBuffer(buf$1) {
	return useBuffer && globalThis.Buffer.isBuffer(buf$1);
}
/**
* @param {Uint8Array|number[]} buf
* @returns {Uint8Array}
*/
function asU8A(buf$1) {
	if (!(buf$1 instanceof Uint8Array)) return Uint8Array.from(buf$1);
	return isBuffer(buf$1) ? new Uint8Array(buf$1.buffer, buf$1.byteOffset, buf$1.byteLength) : buf$1;
}
const toString = useBuffer ? (bytes, start, end) => {
	return end - start > 64 ? globalThis.Buffer.from(bytes.subarray(start, end)).toString("utf8") : utf8Slice(bytes, start, end);
} : (bytes, start, end) => {
	return end - start > 64 ? textDecoder.decode(bytes.subarray(start, end)) : utf8Slice(bytes, start, end);
};
const fromString = useBuffer ? (string) => {
	return string.length > 64 ? globalThis.Buffer.from(string) : utf8ToBytes(string);
} : (string) => {
	return string.length > 64 ? textEncoder.encode(string) : utf8ToBytes(string);
};
/**
* Buffer variant not fast enough for what we need
* @param {number[]} arr
* @returns {Uint8Array}
*/
const fromArray = (arr) => {
	return Uint8Array.from(arr);
};
const slice = useBuffer ? (bytes, start, end) => {
	if (isBuffer(bytes)) return new Uint8Array(bytes.subarray(start, end));
	return bytes.slice(start, end);
} : (bytes, start, end) => {
	return bytes.slice(start, end);
};
const concat = useBuffer ? (chunks, length) => {
	chunks = chunks.map((c) => c instanceof Uint8Array ? c : globalThis.Buffer.from(c));
	return asU8A(globalThis.Buffer.concat(chunks, length));
} : (chunks, length) => {
	const out = new Uint8Array(length);
	let off = 0;
	for (let b of chunks) {
		if (off + b.length > out.length) b = b.subarray(0, out.length - off);
		out.set(b, off);
		off += b.length;
	}
	return out;
};
const alloc = useBuffer ? (size) => {
	return globalThis.Buffer.allocUnsafe(size);
} : (size) => {
	return new Uint8Array(size);
};
/**
* @param {Uint8Array} b1
* @param {Uint8Array} b2
* @returns {number}
*/
function compare(b1, b2) {
	if (isBuffer(b1) && isBuffer(b2)) return b1.compare(b2);
	for (let i = 0; i < b1.length; i++) {
		if (b1[i] === b2[i]) continue;
		return b1[i] < b2[i] ? -1 : 1;
	}
	return 0;
}
/**
* @param {string} str
* @returns {number[]}
*/
function utf8ToBytes(str) {
	const out = [];
	let p = 0;
	for (let i = 0; i < str.length; i++) {
		let c = str.charCodeAt(i);
		if (c < 128) out[p++] = c;
else if (c < 2048) {
			out[p++] = c >> 6 | 192;
			out[p++] = c & 63 | 128;
		} else if ((c & 64512) === 55296 && i + 1 < str.length && (str.charCodeAt(i + 1) & 64512) === 56320) {
			c = 65536 + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023);
			out[p++] = c >> 18 | 240;
			out[p++] = c >> 12 & 63 | 128;
			out[p++] = c >> 6 & 63 | 128;
			out[p++] = c & 63 | 128;
		} else {
			out[p++] = c >> 12 | 224;
			out[p++] = c >> 6 & 63 | 128;
			out[p++] = c & 63 | 128;
		}
	}
	return out;
}
/**
* @param {Uint8Array} buf
* @param {number} offset
* @param {number} end
* @returns {string}
*/
function utf8Slice(buf$1, offset, end) {
	const res = [];
	while (offset < end) {
		const firstByte = buf$1[offset];
		let codePoint = null;
		let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
		if (offset + bytesPerSequence <= end) {
			let secondByte, thirdByte, fourthByte, tempCodePoint;
			switch (bytesPerSequence) {
				case 1:
					if (firstByte < 128) codePoint = firstByte;
					break;
				case 2:
					secondByte = buf$1[offset + 1];
					if ((secondByte & 192) === 128) {
						tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
						if (tempCodePoint > 127) codePoint = tempCodePoint;
					}
					break;
				case 3:
					secondByte = buf$1[offset + 1];
					thirdByte = buf$1[offset + 2];
					if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
						tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
						if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) codePoint = tempCodePoint;
					}
					break;
				case 4:
					secondByte = buf$1[offset + 1];
					thirdByte = buf$1[offset + 2];
					fourthByte = buf$1[offset + 3];
					if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
						tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
						if (tempCodePoint > 65535 && tempCodePoint < 1114112) codePoint = tempCodePoint;
					}
			}
		}
		if (codePoint === null) {
			codePoint = 65533;
			bytesPerSequence = 1;
		} else if (codePoint > 65535) {
			codePoint -= 65536;
			res.push(codePoint >>> 10 & 1023 | 55296);
			codePoint = 56320 | codePoint & 1023;
		}
		res.push(codePoint);
		offset += bytesPerSequence;
	}
	return decodeCodePointsArray(res);
}
const MAX_ARGUMENTS_LENGTH = 4096;
/**
* @param {number[]} codePoints
* @returns {string}
*/
function decodeCodePointsArray(codePoints) {
	const len = codePoints.length;
	if (len <= MAX_ARGUMENTS_LENGTH) return String.fromCharCode.apply(String, codePoints);
	let res = "";
	let i = 0;
	while (i < len) res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
	return res;
}
/**
* Bl is a list of byte chunks, similar to https://github.com/rvagg/bl but for
* writing rather than reading.
* A Bl object accepts set() operations for individual bytes and copyTo() for
* inserting byte arrays. These write operations don't automatically increment
* the internal cursor so its "length" won't be changed. Instead, increment()
* must be called to extend its length to cover the inserted data.
* The toBytes() call will convert all internal memory to a single Uint8Array of
* the correct length, truncating any data that is stored but hasn't been
* included by an increment().
* get() can retrieve a single byte.
* All operations (except toBytes()) take an "offset" argument that will perform
* the write at the offset _from the current cursor_. For most operations this
* will be `0` to write at the current cursor position but it can be ahead of
* the current cursor. Negative offsets probably work but are untested.
*/
const defaultChunkSize = 256;
var Bl = class {
	/**
	* @param {number} [chunkSize]
	*/
	constructor(chunkSize = defaultChunkSize) {
		this.chunkSize = chunkSize;
		/** @type {number} */
		this.cursor = 0;
		/** @type {number} */
		this.maxCursor = -1;
		/** @type {(Uint8Array|number[])[]} */
		this.chunks = [];
		/** @type {Uint8Array|number[]|null} */
		this._initReuseChunk = null;
	}
	reset() {
		this.cursor = 0;
		this.maxCursor = -1;
		if (this.chunks.length) this.chunks = [];
		if (this._initReuseChunk !== null) {
			this.chunks.push(this._initReuseChunk);
			this.maxCursor = this._initReuseChunk.length - 1;
		}
	}
	/**
	* @param {Uint8Array|number[]} bytes
	*/
	push(bytes) {
		let topChunk = this.chunks[this.chunks.length - 1];
		const newMax = this.cursor + bytes.length;
		if (newMax <= this.maxCursor + 1) {
			const chunkPos = topChunk.length - (this.maxCursor - this.cursor) - 1;
			topChunk.set(bytes, chunkPos);
		} else {
			if (topChunk) {
				const chunkPos = topChunk.length - (this.maxCursor - this.cursor) - 1;
				if (chunkPos < topChunk.length) {
					this.chunks[this.chunks.length - 1] = topChunk.subarray(0, chunkPos);
					this.maxCursor = this.cursor - 1;
				}
			}
			if (bytes.length < 64 && bytes.length < this.chunkSize) {
				topChunk = alloc(this.chunkSize);
				this.chunks.push(topChunk);
				this.maxCursor += topChunk.length;
				if (this._initReuseChunk === null) this._initReuseChunk = topChunk;
				topChunk.set(bytes, 0);
			} else {
				this.chunks.push(bytes);
				this.maxCursor += bytes.length;
			}
		}
		this.cursor += bytes.length;
	}
	/**
	* @param {boolean} [reset]
	* @returns {Uint8Array}
	*/
	toBytes(reset = false) {
		let byts;
		if (this.chunks.length === 1) {
			const chunk = this.chunks[0];
			if (reset && this.cursor > chunk.length / 2) {
				byts = this.cursor === chunk.length ? chunk : chunk.subarray(0, this.cursor);
				this._initReuseChunk = null;
				this.chunks = [];
			} else byts = slice(chunk, 0, this.cursor);
		} else byts = concat(this.chunks, this.cursor);
		if (reset) this.reset();
		return byts;
	}
};
const decodeErrPrefix = "CBOR decode error:";
const encodeErrPrefix = "CBOR encode error:";
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} need
*/
function assertEnoughData(data, pos, need) {
	if (data.length - pos < need) throw new Error(`${decodeErrPrefix} not enough data for type`);
}
const uintBoundaries = [
	24,
	256,
	65536,
	4294967296,
	BigInt("18446744073709551616")
];
/**
* @typedef {import('./bl.js').Bl} Bl
* @typedef {import('../interface').DecodeOptions} DecodeOptions
*/
/**
* @param {Uint8Array} data
* @param {number} offset
* @param {DecodeOptions} options
* @returns {number}
*/
function readUint8(data, offset, options) {
	assertEnoughData(data, offset, 1);
	const value = data[offset];
	if (options.strict === true && value < uintBoundaries[0]) throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
	return value;
}
/**
* @param {Uint8Array} data
* @param {number} offset
* @param {DecodeOptions} options
* @returns {number}
*/
function readUint16(data, offset, options) {
	assertEnoughData(data, offset, 2);
	const value = data[offset] << 8 | data[offset + 1];
	if (options.strict === true && value < uintBoundaries[1]) throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
	return value;
}
/**
* @param {Uint8Array} data
* @param {number} offset
* @param {DecodeOptions} options
* @returns {number}
*/
function readUint32(data, offset, options) {
	assertEnoughData(data, offset, 4);
	const value = data[offset] * 16777216 + (data[offset + 1] << 16) + (data[offset + 2] << 8) + data[offset + 3];
	if (options.strict === true && value < uintBoundaries[2]) throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
	return value;
}
/**
* @param {Uint8Array} data
* @param {number} offset
* @param {DecodeOptions} options
* @returns {number|bigint}
*/
function readUint64(data, offset, options) {
	assertEnoughData(data, offset, 8);
	const hi = data[offset] * 16777216 + (data[offset + 1] << 16) + (data[offset + 2] << 8) + data[offset + 3];
	const lo = data[offset + 4] * 16777216 + (data[offset + 5] << 16) + (data[offset + 6] << 8) + data[offset + 7];
	const value = (BigInt(hi) << BigInt(32)) + BigInt(lo);
	if (options.strict === true && value < uintBoundaries[3]) throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
	if (value <= Number.MAX_SAFE_INTEGER) return Number(value);
	if (options.allowBigInt === true) return value;
	throw new Error(`${decodeErrPrefix} integers outside of the safe integer range are not supported`);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeUint8(data, pos, _minor, options) {
	return new Token(Type$1.uint, readUint8(data, pos + 1, options), 2);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeUint16(data, pos, _minor, options) {
	return new Token(Type$1.uint, readUint16(data, pos + 1, options), 3);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeUint32(data, pos, _minor, options) {
	return new Token(Type$1.uint, readUint32(data, pos + 1, options), 5);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeUint64(data, pos, _minor, options) {
	return new Token(Type$1.uint, readUint64(data, pos + 1, options), 9);
}
/**
* @param {Bl} buf
* @param {Token} token
*/
function encodeUint(buf$1, token) {
	return encodeUintValue(buf$1, 0, token.value);
}
/**
* @param {Bl} buf
* @param {number} major
* @param {number|bigint} uint
*/
function encodeUintValue(buf$1, major, uint) {
	if (uint < uintBoundaries[0]) {
		const nuint = Number(uint);
		buf$1.push([major | nuint]);
	} else if (uint < uintBoundaries[1]) {
		const nuint = Number(uint);
		buf$1.push([major | 24, nuint]);
	} else if (uint < uintBoundaries[2]) {
		const nuint = Number(uint);
		buf$1.push([
			major | 25,
			nuint >>> 8,
			nuint & 255
		]);
	} else if (uint < uintBoundaries[3]) {
		const nuint = Number(uint);
		buf$1.push([
			major | 26,
			nuint >>> 24 & 255,
			nuint >>> 16 & 255,
			nuint >>> 8 & 255,
			nuint & 255
		]);
	} else {
		const buint = BigInt(uint);
		if (buint < uintBoundaries[4]) {
			const set = [
				major | 27,
				0,
				0,
				0,
				0,
				0,
				0,
				0
			];
			let lo = Number(buint & BigInt(4294967295));
			let hi = Number(buint >> BigInt(32) & BigInt(4294967295));
			set[8] = lo & 255;
			lo = lo >> 8;
			set[7] = lo & 255;
			lo = lo >> 8;
			set[6] = lo & 255;
			lo = lo >> 8;
			set[5] = lo & 255;
			set[4] = hi & 255;
			hi = hi >> 8;
			set[3] = hi & 255;
			hi = hi >> 8;
			set[2] = hi & 255;
			hi = hi >> 8;
			set[1] = hi & 255;
			buf$1.push(set);
		} else throw new Error(`${decodeErrPrefix} encountered BigInt larger than allowable range`);
	}
}
/**
* @param {Token} token
* @returns {number}
*/
encodeUint.encodedSize = function encodedSize(token) {
	return encodeUintValue.encodedSize(token.value);
};
/**
* @param {number} uint
* @returns {number}
*/
encodeUintValue.encodedSize = function encodedSize(uint) {
	if (uint < uintBoundaries[0]) return 1;
	if (uint < uintBoundaries[1]) return 2;
	if (uint < uintBoundaries[2]) return 3;
	if (uint < uintBoundaries[3]) return 5;
	return 9;
};
/**
* @param {Token} tok1
* @param {Token} tok2
* @returns {number}
*/
encodeUint.compareTokens = function compareTokens(tok1, tok2) {
	return tok1.value < tok2.value ? -1 : tok1.value > tok2.value ? 1 : 0;
};
/**
* @typedef {import('./bl.js').Bl} Bl
* @typedef {import('../interface').DecodeOptions} DecodeOptions
*/
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeNegint8(data, pos, _minor, options) {
	return new Token(Type$1.negint, -1 - readUint8(data, pos + 1, options), 2);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeNegint16(data, pos, _minor, options) {
	return new Token(Type$1.negint, -1 - readUint16(data, pos + 1, options), 3);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeNegint32(data, pos, _minor, options) {
	return new Token(Type$1.negint, -1 - readUint32(data, pos + 1, options), 5);
}
const neg1b = BigInt(-1);
const pos1b = BigInt(1);
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeNegint64(data, pos, _minor, options) {
	const int = readUint64(data, pos + 1, options);
	if (typeof int !== "bigint") {
		const value = -1 - int;
		if (value >= Number.MIN_SAFE_INTEGER) return new Token(Type$1.negint, value, 9);
	}
	if (options.allowBigInt !== true) throw new Error(`${decodeErrPrefix} integers outside of the safe integer range are not supported`);
	return new Token(Type$1.negint, neg1b - BigInt(int), 9);
}
/**
* @param {Bl} buf
* @param {Token} token
*/
function encodeNegint(buf$1, token) {
	const negint = token.value;
	const unsigned = typeof negint === "bigint" ? negint * neg1b - pos1b : negint * -1 - 1;
	encodeUintValue(buf$1, token.type.majorEncoded, unsigned);
}
/**
* @param {Token} token
* @returns {number}
*/
encodeNegint.encodedSize = function encodedSize(token) {
	const negint = token.value;
	const unsigned = typeof negint === "bigint" ? negint * neg1b - pos1b : negint * -1 - 1;
	if (unsigned < uintBoundaries[0]) return 1;
	if (unsigned < uintBoundaries[1]) return 2;
	if (unsigned < uintBoundaries[2]) return 3;
	if (unsigned < uintBoundaries[3]) return 5;
	return 9;
};
/**
* @param {Token} tok1
* @param {Token} tok2
* @returns {number}
*/
encodeNegint.compareTokens = function compareTokens(tok1, tok2) {
	return tok1.value < tok2.value ? 1 : tok1.value > tok2.value ? -1 : 0;
};
/**
* @typedef {import('./bl.js').Bl} Bl
* @typedef {import('../interface').DecodeOptions} DecodeOptions
*/
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} prefix
* @param {number} length
* @returns {Token}
*/
function toToken$3(data, pos, prefix, length) {
	assertEnoughData(data, pos, prefix + length);
	const buf$1 = slice(data, pos + prefix, pos + prefix + length);
	return new Token(Type$1.bytes, buf$1, prefix + length);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} minor
* @param {DecodeOptions} _options
* @returns {Token}
*/
function decodeBytesCompact(data, pos, minor, _options) {
	return toToken$3(data, pos, 1, minor);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeBytes8(data, pos, _minor, options) {
	return toToken$3(data, pos, 2, readUint8(data, pos + 1, options));
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeBytes16(data, pos, _minor, options) {
	return toToken$3(data, pos, 3, readUint16(data, pos + 1, options));
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeBytes32(data, pos, _minor, options) {
	return toToken$3(data, pos, 5, readUint32(data, pos + 1, options));
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeBytes64(data, pos, _minor, options) {
	const l = readUint64(data, pos + 1, options);
	if (typeof l === "bigint") throw new Error(`${decodeErrPrefix} 64-bit integer bytes lengths not supported`);
	return toToken$3(data, pos, 9, l);
}
/**
* `encodedBytes` allows for caching when we do a byte version of a string
* for key sorting purposes
* @param {Token} token
* @returns {Uint8Array}
*/
function tokenBytes(token) {
	if (token.encodedBytes === undefined) token.encodedBytes = token.type === Type$1.string ? fromString(token.value) : token.value;
	return token.encodedBytes;
}
/**
* @param {Bl} buf
* @param {Token} token
*/
function encodeBytes(buf$1, token) {
	const bytes = tokenBytes(token);
	encodeUintValue(buf$1, token.type.majorEncoded, bytes.length);
	buf$1.push(bytes);
}
/**
* @param {Token} token
* @returns {number}
*/
encodeBytes.encodedSize = function encodedSize(token) {
	const bytes = tokenBytes(token);
	return encodeUintValue.encodedSize(bytes.length) + bytes.length;
};
/**
* @param {Token} tok1
* @param {Token} tok2
* @returns {number}
*/
encodeBytes.compareTokens = function compareTokens(tok1, tok2) {
	return compareBytes(tokenBytes(tok1), tokenBytes(tok2));
};
/**
* @param {Uint8Array} b1
* @param {Uint8Array} b2
* @returns {number}
*/
function compareBytes(b1, b2) {
	return b1.length < b2.length ? -1 : b1.length > b2.length ? 1 : compare(b1, b2);
}
/**
* @typedef {import('./bl.js').Bl} Bl
* @typedef {import('../interface').DecodeOptions} DecodeOptions
*/
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} prefix
* @param {number} length
* @param {DecodeOptions} options
* @returns {Token}
*/
function toToken$2(data, pos, prefix, length, options) {
	const totLength = prefix + length;
	assertEnoughData(data, pos, totLength);
	const tok = new Token(Type$1.string, toString(data, pos + prefix, pos + totLength), totLength);
	if (options.retainStringBytes === true) tok.byteValue = slice(data, pos + prefix, pos + totLength);
	return tok;
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeStringCompact(data, pos, minor, options) {
	return toToken$2(data, pos, 1, minor, options);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeString8(data, pos, _minor, options) {
	return toToken$2(data, pos, 2, readUint8(data, pos + 1, options), options);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeString16(data, pos, _minor, options) {
	return toToken$2(data, pos, 3, readUint16(data, pos + 1, options), options);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeString32(data, pos, _minor, options) {
	return toToken$2(data, pos, 5, readUint32(data, pos + 1, options), options);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeString64(data, pos, _minor, options) {
	const l = readUint64(data, pos + 1, options);
	if (typeof l === "bigint") throw new Error(`${decodeErrPrefix} 64-bit integer string lengths not supported`);
	return toToken$2(data, pos, 9, l, options);
}
const encodeString = encodeBytes;
/**
* @typedef {import('./bl.js').Bl} Bl
* @typedef {import('../interface').DecodeOptions} DecodeOptions
*/
/**
* @param {Uint8Array} _data
* @param {number} _pos
* @param {number} prefix
* @param {number} length
* @returns {Token}
*/
function toToken$1(_data, _pos, prefix, length) {
	return new Token(Type$1.array, length, prefix);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} minor
* @param {DecodeOptions} _options
* @returns {Token}
*/
function decodeArrayCompact(data, pos, minor, _options) {
	return toToken$1(data, pos, 1, minor);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeArray8(data, pos, _minor, options) {
	return toToken$1(data, pos, 2, readUint8(data, pos + 1, options));
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeArray16(data, pos, _minor, options) {
	return toToken$1(data, pos, 3, readUint16(data, pos + 1, options));
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeArray32(data, pos, _minor, options) {
	return toToken$1(data, pos, 5, readUint32(data, pos + 1, options));
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeArray64(data, pos, _minor, options) {
	const l = readUint64(data, pos + 1, options);
	if (typeof l === "bigint") throw new Error(`${decodeErrPrefix} 64-bit integer array lengths not supported`);
	return toToken$1(data, pos, 9, l);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeArrayIndefinite(data, pos, _minor, options) {
	if (options.allowIndefinite === false) throw new Error(`${decodeErrPrefix} indefinite length items not allowed`);
	return toToken$1(data, pos, 1, Infinity);
}
/**
* @param {Bl} buf
* @param {Token} token
*/
function encodeArray(buf$1, token) {
	encodeUintValue(buf$1, Type$1.array.majorEncoded, token.value);
}
encodeArray.compareTokens = encodeUint.compareTokens;
/**
* @param {Token} token
* @returns {number}
*/
encodeArray.encodedSize = function encodedSize(token) {
	return encodeUintValue.encodedSize(token.value);
};
/**
* @typedef {import('./bl.js').Bl} Bl
* @typedef {import('../interface').DecodeOptions} DecodeOptions
*/
/**
* @param {Uint8Array} _data
* @param {number} _pos
* @param {number} prefix
* @param {number} length
* @returns {Token}
*/
function toToken(_data, _pos, prefix, length) {
	return new Token(Type$1.map, length, prefix);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} minor
* @param {DecodeOptions} _options
* @returns {Token}
*/
function decodeMapCompact(data, pos, minor, _options) {
	return toToken(data, pos, 1, minor);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeMap8(data, pos, _minor, options) {
	return toToken(data, pos, 2, readUint8(data, pos + 1, options));
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeMap16(data, pos, _minor, options) {
	return toToken(data, pos, 3, readUint16(data, pos + 1, options));
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeMap32(data, pos, _minor, options) {
	return toToken(data, pos, 5, readUint32(data, pos + 1, options));
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeMap64(data, pos, _minor, options) {
	const l = readUint64(data, pos + 1, options);
	if (typeof l === "bigint") throw new Error(`${decodeErrPrefix} 64-bit integer map lengths not supported`);
	return toToken(data, pos, 9, l);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeMapIndefinite(data, pos, _minor, options) {
	if (options.allowIndefinite === false) throw new Error(`${decodeErrPrefix} indefinite length items not allowed`);
	return toToken(data, pos, 1, Infinity);
}
/**
* @param {Bl} buf
* @param {Token} token
*/
function encodeMap(buf$1, token) {
	encodeUintValue(buf$1, Type$1.map.majorEncoded, token.value);
}
encodeMap.compareTokens = encodeUint.compareTokens;
/**
* @param {Token} token
* @returns {number}
*/
encodeMap.encodedSize = function encodedSize(token) {
	return encodeUintValue.encodedSize(token.value);
};
/**
* @typedef {import('./bl.js').Bl} Bl
* @typedef {import('../interface').DecodeOptions} DecodeOptions
*/
/**
* @param {Uint8Array} _data
* @param {number} _pos
* @param {number} minor
* @param {DecodeOptions} _options
* @returns {Token}
*/
function decodeTagCompact(_data, _pos, minor, _options) {
	return new Token(Type$1.tag, minor, 1);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeTag8(data, pos, _minor, options) {
	return new Token(Type$1.tag, readUint8(data, pos + 1, options), 2);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeTag16(data, pos, _minor, options) {
	return new Token(Type$1.tag, readUint16(data, pos + 1, options), 3);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeTag32(data, pos, _minor, options) {
	return new Token(Type$1.tag, readUint32(data, pos + 1, options), 5);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeTag64(data, pos, _minor, options) {
	return new Token(Type$1.tag, readUint64(data, pos + 1, options), 9);
}
/**
* @param {Bl} buf
* @param {Token} token
*/
function encodeTag(buf$1, token) {
	encodeUintValue(buf$1, Type$1.tag.majorEncoded, token.value);
}
encodeTag.compareTokens = encodeUint.compareTokens;
/**
* @param {Token} token
* @returns {number}
*/
encodeTag.encodedSize = function encodedSize(token) {
	return encodeUintValue.encodedSize(token.value);
};
/**
* @typedef {import('./bl.js').Bl} Bl
* @typedef {import('../interface').DecodeOptions} DecodeOptions
* @typedef {import('../interface').EncodeOptions} EncodeOptions
*/
const MINOR_FALSE = 20;
const MINOR_TRUE = 21;
const MINOR_NULL = 22;
const MINOR_UNDEFINED = 23;
/**
* @param {Uint8Array} _data
* @param {number} _pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeUndefined(_data, _pos, _minor, options) {
	if (options.allowUndefined === false) throw new Error(`${decodeErrPrefix} undefined values are not supported`);
else if (options.coerceUndefinedToNull === true) return new Token(Type$1.null, null, 1);
	return new Token(Type$1.undefined, undefined, 1);
}
/**
* @param {Uint8Array} _data
* @param {number} _pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeBreak(_data, _pos, _minor, options) {
	if (options.allowIndefinite === false) throw new Error(`${decodeErrPrefix} indefinite length items not allowed`);
	return new Token(Type$1.break, undefined, 1);
}
/**
* @param {number} value
* @param {number} bytes
* @param {DecodeOptions} options
* @returns {Token}
*/
function createToken(value, bytes, options) {
	if (options) {
		if (options.allowNaN === false && Number.isNaN(value)) throw new Error(`${decodeErrPrefix} NaN values are not supported`);
		if (options.allowInfinity === false && (value === Infinity || value === -Infinity)) throw new Error(`${decodeErrPrefix} Infinity values are not supported`);
	}
	return new Token(Type$1.float, value, bytes);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeFloat16(data, pos, _minor, options) {
	return createToken(readFloat16(data, pos + 1), 3, options);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeFloat32(data, pos, _minor, options) {
	return createToken(readFloat32(data, pos + 1), 5, options);
}
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} _minor
* @param {DecodeOptions} options
* @returns {Token}
*/
function decodeFloat64(data, pos, _minor, options) {
	return createToken(readFloat64(data, pos + 1), 9, options);
}
/**
* @param {Bl} buf
* @param {Token} token
* @param {EncodeOptions} options
*/
function encodeFloat(buf$1, token, options) {
	const float = token.value;
	if (float === false) buf$1.push([Type$1.float.majorEncoded | MINOR_FALSE]);
else if (float === true) buf$1.push([Type$1.float.majorEncoded | MINOR_TRUE]);
else if (float === null) buf$1.push([Type$1.float.majorEncoded | MINOR_NULL]);
else if (float === undefined) buf$1.push([Type$1.float.majorEncoded | MINOR_UNDEFINED]);
else {
		let decoded;
		let success = false;
		if (!options || options.float64 !== true) {
			encodeFloat16(float);
			decoded = readFloat16(ui8a, 1);
			if (float === decoded || Number.isNaN(float)) {
				ui8a[0] = 249;
				buf$1.push(ui8a.slice(0, 3));
				success = true;
			} else {
				encodeFloat32(float);
				decoded = readFloat32(ui8a, 1);
				if (float === decoded) {
					ui8a[0] = 250;
					buf$1.push(ui8a.slice(0, 5));
					success = true;
				}
			}
		}
		if (!success) {
			encodeFloat64(float);
			decoded = readFloat64(ui8a, 1);
			ui8a[0] = 251;
			buf$1.push(ui8a.slice(0, 9));
		}
	}
}
/**
* @param {Token} token
* @param {EncodeOptions} options
* @returns {number}
*/
encodeFloat.encodedSize = function encodedSize(token, options) {
	const float = token.value;
	if (float === false || float === true || float === null || float === undefined) return 1;
	if (!options || options.float64 !== true) {
		encodeFloat16(float);
		let decoded = readFloat16(ui8a, 1);
		if (float === decoded || Number.isNaN(float)) return 3;
		encodeFloat32(float);
		decoded = readFloat32(ui8a, 1);
		if (float === decoded) return 5;
	}
	return 9;
};
const buffer = new ArrayBuffer(9);
const dataView = new DataView(buffer, 1);
const ui8a = new Uint8Array(buffer, 0);
/**
* @param {number} inp
*/
function encodeFloat16(inp) {
	if (inp === Infinity) dataView.setUint16(0, 31744, false);
else if (inp === -Infinity) dataView.setUint16(0, 64512, false);
else if (Number.isNaN(inp)) dataView.setUint16(0, 32256, false);
else {
		dataView.setFloat32(0, inp);
		const valu32 = dataView.getUint32(0);
		const exponent = (valu32 & 2139095040) >> 23;
		const mantissa = valu32 & 8388607;
		if (exponent === 255) dataView.setUint16(0, 31744, false);
else if (exponent === 0) dataView.setUint16(0, (inp & 2147483648) >> 16 | mantissa >> 13, false);
else {
			const logicalExponent = exponent - 127;
			if (logicalExponent < -24) dataView.setUint16(0, 0);
else if (logicalExponent < -14) dataView.setUint16(0, (valu32 & 2147483648) >> 16 | 1 << 24 + logicalExponent, false);
else dataView.setUint16(0, (valu32 & 2147483648) >> 16 | logicalExponent + 15 << 10 | mantissa >> 13, false);
		}
	}
}
/**
* @param {Uint8Array} ui8a
* @param {number} pos
* @returns {number}
*/
function readFloat16(ui8a$1, pos) {
	if (ui8a$1.length - pos < 2) throw new Error(`${decodeErrPrefix} not enough data for float16`);
	const half = (ui8a$1[pos] << 8) + ui8a$1[pos + 1];
	if (half === 31744) return Infinity;
	if (half === 64512) return -Infinity;
	if (half === 32256) return NaN;
	const exp = half >> 10 & 31;
	const mant = half & 1023;
	let val;
	if (exp === 0) val = mant * 5.960464477539063e-8;
else if (exp !== 31) val = (mant + 1024) * 2 ** (exp - 25);
else val = mant === 0 ? Infinity : NaN;
	return half & 32768 ? -val : val;
}
/**
* @param {number} inp
*/
function encodeFloat32(inp) {
	dataView.setFloat32(0, inp, false);
}
/**
* @param {Uint8Array} ui8a
* @param {number} pos
* @returns {number}
*/
function readFloat32(ui8a$1, pos) {
	if (ui8a$1.length - pos < 4) throw new Error(`${decodeErrPrefix} not enough data for float32`);
	const offset = (ui8a$1.byteOffset || 0) + pos;
	return new DataView(ui8a$1.buffer, offset, 4).getFloat32(0, false);
}
/**
* @param {number} inp
*/
function encodeFloat64(inp) {
	dataView.setFloat64(0, inp, false);
}
/**
* @param {Uint8Array} ui8a
* @param {number} pos
* @returns {number}
*/
function readFloat64(ui8a$1, pos) {
	if (ui8a$1.length - pos < 8) throw new Error(`${decodeErrPrefix} not enough data for float64`);
	const offset = (ui8a$1.byteOffset || 0) + pos;
	return new DataView(ui8a$1.buffer, offset, 8).getFloat64(0, false);
}
/**
* @param {Token} _tok1
* @param {Token} _tok2
* @returns {number}
*/
encodeFloat.compareTokens = encodeUint.compareTokens;
/**
* @typedef {import('../interface').DecodeOptions} DecodeOptions
*/
/**
* @param {Uint8Array} data
* @param {number} pos
* @param {number} minor
*/
function invalidMinor(data, pos, minor) {
	throw new Error(`${decodeErrPrefix} encountered invalid minor (${minor}) for major ${data[pos] >>> 5}`);
}
/**
* @param {string} msg
* @returns {()=>any}
*/
function errorer(msg) {
	return () => {
		throw new Error(`${decodeErrPrefix} ${msg}`);
	};
}
/** @type {((data:Uint8Array, pos:number, minor:number, options?:DecodeOptions) => any)[]} */
const jump = [];
for (let i = 0; i <= 23; i++) jump[i] = invalidMinor;
jump[24] = decodeUint8;
jump[25] = decodeUint16;
jump[26] = decodeUint32;
jump[27] = decodeUint64;
jump[28] = invalidMinor;
jump[29] = invalidMinor;
jump[30] = invalidMinor;
jump[31] = invalidMinor;
for (let i = 32; i <= 55; i++) jump[i] = invalidMinor;
jump[56] = decodeNegint8;
jump[57] = decodeNegint16;
jump[58] = decodeNegint32;
jump[59] = decodeNegint64;
jump[60] = invalidMinor;
jump[61] = invalidMinor;
jump[62] = invalidMinor;
jump[63] = invalidMinor;
for (let i = 64; i <= 87; i++) jump[i] = decodeBytesCompact;
jump[88] = decodeBytes8;
jump[89] = decodeBytes16;
jump[90] = decodeBytes32;
jump[91] = decodeBytes64;
jump[92] = invalidMinor;
jump[93] = invalidMinor;
jump[94] = invalidMinor;
jump[95] = errorer("indefinite length bytes/strings are not supported");
for (let i = 96; i <= 119; i++) jump[i] = decodeStringCompact;
jump[120] = decodeString8;
jump[121] = decodeString16;
jump[122] = decodeString32;
jump[123] = decodeString64;
jump[124] = invalidMinor;
jump[125] = invalidMinor;
jump[126] = invalidMinor;
jump[127] = errorer("indefinite length bytes/strings are not supported");
for (let i = 128; i <= 151; i++) jump[i] = decodeArrayCompact;
jump[152] = decodeArray8;
jump[153] = decodeArray16;
jump[154] = decodeArray32;
jump[155] = decodeArray64;
jump[156] = invalidMinor;
jump[157] = invalidMinor;
jump[158] = invalidMinor;
jump[159] = decodeArrayIndefinite;
for (let i = 160; i <= 183; i++) jump[i] = decodeMapCompact;
jump[184] = decodeMap8;
jump[185] = decodeMap16;
jump[186] = decodeMap32;
jump[187] = decodeMap64;
jump[188] = invalidMinor;
jump[189] = invalidMinor;
jump[190] = invalidMinor;
jump[191] = decodeMapIndefinite;
for (let i = 192; i <= 215; i++) jump[i] = decodeTagCompact;
jump[216] = decodeTag8;
jump[217] = decodeTag16;
jump[218] = decodeTag32;
jump[219] = decodeTag64;
jump[220] = invalidMinor;
jump[221] = invalidMinor;
jump[222] = invalidMinor;
jump[223] = invalidMinor;
for (let i = 224; i <= 243; i++) jump[i] = errorer("simple values are not supported");
jump[244] = invalidMinor;
jump[245] = invalidMinor;
jump[246] = invalidMinor;
jump[247] = decodeUndefined;
jump[248] = errorer("simple values are not supported");
jump[249] = decodeFloat16;
jump[250] = decodeFloat32;
jump[251] = decodeFloat64;
jump[252] = invalidMinor;
jump[253] = invalidMinor;
jump[254] = invalidMinor;
jump[255] = decodeBreak;
/** @type {Token[]} */
const quick = [];
for (let i = 0; i < 24; i++) quick[i] = new Token(Type$1.uint, i, 1);
for (let i = -1; i >= -24; i--) quick[31 - i] = new Token(Type$1.negint, i, 1);
quick[64] = new Token(Type$1.bytes, new Uint8Array(0), 1);
quick[96] = new Token(Type$1.string, "", 1);
quick[128] = new Token(Type$1.array, 0, 1);
quick[160] = new Token(Type$1.map, 0, 1);
quick[244] = new Token(Type$1.false, false, 1);
quick[245] = new Token(Type$1.true, true, 1);
quick[246] = new Token(Type$1.null, null, 1);
/**
* @param {Token} token
* @returns {Uint8Array|undefined}
*/
function quickEncodeToken(token) {
	switch (token.type) {
		case Type$1.false: return fromArray([244]);
		case Type$1.true: return fromArray([245]);
		case Type$1.null: return fromArray([246]);
		case Type$1.bytes:
			if (!token.value.length) return fromArray([64]);
			return;
		case Type$1.string:
			if (token.value === "") return fromArray([96]);
			return;
		case Type$1.array:
			if (token.value === 0) return fromArray([128]);
			return;
		case Type$1.map:
			if (token.value === 0) return fromArray([160]);
			return;
		case Type$1.uint:
			if (token.value < 24) return fromArray([Number(token.value)]);
			return;
		case Type$1.negint: if (token.value >= -24) return fromArray([31 - Number(token.value)]);
	}
}
/**
* @typedef {import('../interface').EncodeOptions} EncodeOptions
* @typedef {import('../interface').OptionalTypeEncoder} OptionalTypeEncoder
* @typedef {import('../interface').Reference} Reference
* @typedef {import('../interface').StrictTypeEncoder} StrictTypeEncoder
* @typedef {import('../interface').TokenTypeEncoder} TokenTypeEncoder
* @typedef {import('../interface').TokenOrNestedTokens} TokenOrNestedTokens
*/
/** @type {EncodeOptions} */
const defaultEncodeOptions = {
	float64: false,
	mapSorter,
	quickEncodeToken
};
/** @returns {TokenTypeEncoder[]} */
function makeCborEncoders() {
	const encoders = [];
	encoders[Type$1.uint.major] = encodeUint;
	encoders[Type$1.negint.major] = encodeNegint;
	encoders[Type$1.bytes.major] = encodeBytes;
	encoders[Type$1.string.major] = encodeString;
	encoders[Type$1.array.major] = encodeArray;
	encoders[Type$1.map.major] = encodeMap;
	encoders[Type$1.tag.major] = encodeTag;
	encoders[Type$1.float.major] = encodeFloat;
	return encoders;
}
const cborEncoders = makeCborEncoders();
const buf = new Bl();
var Ref = class Ref {
	/**
	* @param {object|any[]} obj
	* @param {Reference|undefined} parent
	*/
	constructor(obj, parent) {
		this.obj = obj;
		this.parent = parent;
	}
	/**
	* @param {object|any[]} obj
	* @returns {boolean}
	*/
	includes(obj) {
		/** @type {Reference|undefined} */
		let p = this;
		do 
			if (p.obj === obj) return true;
		while (p = p.parent);
		return false;
	}
	/**
	* @param {Reference|undefined} stack
	* @param {object|any[]} obj
	* @returns {Reference}
	*/
	static createCheck(stack, obj) {
		if (stack && stack.includes(obj)) throw new Error(`${encodeErrPrefix} object contains circular references`);
		return new Ref(obj, stack);
	}
};
const simpleTokens = {
	null: new Token(Type$1.null, null),
	undefined: new Token(Type$1.undefined, undefined),
	true: new Token(Type$1.true, true),
	false: new Token(Type$1.false, false),
	emptyArray: new Token(Type$1.array, 0),
	emptyMap: new Token(Type$1.map, 0)
};
/** @type {{[typeName: string]: StrictTypeEncoder}} */
const typeEncoders = {
	number(obj, _typ, _options, _refStack) {
		if (!Number.isInteger(obj) || !Number.isSafeInteger(obj)) return new Token(Type$1.float, obj);
else if (obj >= 0) return new Token(Type$1.uint, obj);
else return new Token(Type$1.negint, obj);
	},
	bigint(obj, _typ, _options, _refStack) {
		if (obj >= BigInt(0)) return new Token(Type$1.uint, obj);
else return new Token(Type$1.negint, obj);
	},
	Uint8Array(obj, _typ, _options, _refStack) {
		return new Token(Type$1.bytes, obj);
	},
	string(obj, _typ, _options, _refStack) {
		return new Token(Type$1.string, obj);
	},
	boolean(obj, _typ, _options, _refStack) {
		return obj ? simpleTokens.true : simpleTokens.false;
	},
	null(_obj, _typ, _options, _refStack) {
		return simpleTokens.null;
	},
	undefined(_obj, _typ, _options, _refStack) {
		return simpleTokens.undefined;
	},
	ArrayBuffer(obj, _typ, _options, _refStack) {
		return new Token(Type$1.bytes, new Uint8Array(obj));
	},
	DataView(obj, _typ, _options, _refStack) {
		return new Token(Type$1.bytes, new Uint8Array(obj.buffer, obj.byteOffset, obj.byteLength));
	},
	Array(obj, _typ, options, refStack) {
		if (!obj.length) {
			if (options.addBreakTokens === true) return [simpleTokens.emptyArray, new Token(Type$1.break)];
			return simpleTokens.emptyArray;
		}
		refStack = Ref.createCheck(refStack, obj);
		const entries = [];
		let i = 0;
		for (const e of obj) entries[i++] = objectToTokens(e, options, refStack);
		if (options.addBreakTokens) return [
			new Token(Type$1.array, obj.length),
			entries,
			new Token(Type$1.break)
		];
		return [new Token(Type$1.array, obj.length), entries];
	},
	Object(obj, typ, options, refStack) {
		const isMap = typ !== "Object";
		const keys = isMap ? obj.keys() : Object.keys(obj);
		const length = isMap ? obj.size : keys.length;
		if (!length) {
			if (options.addBreakTokens === true) return [simpleTokens.emptyMap, new Token(Type$1.break)];
			return simpleTokens.emptyMap;
		}
		refStack = Ref.createCheck(refStack, obj);
		/** @type {TokenOrNestedTokens[]} */
		const entries = [];
		let i = 0;
		for (const key of keys) entries[i++] = [objectToTokens(key, options, refStack), objectToTokens(isMap ? obj.get(key) : obj[key], options, refStack)];
		sortMapEntries(entries, options);
		if (options.addBreakTokens) return [
			new Token(Type$1.map, length),
			entries,
			new Token(Type$1.break)
		];
		return [new Token(Type$1.map, length), entries];
	}
};
typeEncoders.Map = typeEncoders.Object;
typeEncoders.Buffer = typeEncoders.Uint8Array;
for (const typ of "Uint8Clamped Uint16 Uint32 Int8 Int16 Int32 BigUint64 BigInt64 Float32 Float64".split(" ")) typeEncoders[`${typ}Array`] = typeEncoders.DataView;
/**
* @param {any} obj
* @param {EncodeOptions} [options]
* @param {Reference} [refStack]
* @returns {TokenOrNestedTokens}
*/
function objectToTokens(obj, options = {}, refStack) {
	const typ = is(obj);
	const customTypeEncoder = options && options.typeEncoders && options.typeEncoders[typ] || typeEncoders[typ];
	if (typeof customTypeEncoder === "function") {
		const tokens = customTypeEncoder(obj, typ, options, refStack);
		if (tokens != null) return tokens;
	}
	const typeEncoder = typeEncoders[typ];
	if (!typeEncoder) throw new Error(`${encodeErrPrefix} unsupported type: ${typ}`);
	return typeEncoder(obj, typ, options, refStack);
}
/**
* @param {TokenOrNestedTokens[]} entries
* @param {EncodeOptions} options
*/
function sortMapEntries(entries, options) {
	if (options.mapSorter) entries.sort(options.mapSorter);
}
/**
* @param {(Token|Token[])[]} e1
* @param {(Token|Token[])[]} e2
* @returns {number}
*/
function mapSorter(e1, e2) {
	const keyToken1 = Array.isArray(e1[0]) ? e1[0][0] : e1[0];
	const keyToken2 = Array.isArray(e2[0]) ? e2[0][0] : e2[0];
	if (keyToken1.type !== keyToken2.type) return keyToken1.type.compare(keyToken2.type);
	const major = keyToken1.type.major;
	const tcmp = cborEncoders[major].compareTokens(keyToken1, keyToken2);
	if (tcmp === 0) console.warn("WARNING: complex key types used, CBOR key sorting guarantees are gone");
	return tcmp;
}
/**
* @param {Bl} buf
* @param {TokenOrNestedTokens} tokens
* @param {TokenTypeEncoder[]} encoders
* @param {EncodeOptions} options
*/
function tokensToEncoded(buf$1, tokens, encoders, options) {
	if (Array.isArray(tokens)) for (const token of tokens) tokensToEncoded(buf$1, token, encoders, options);
else encoders[tokens.type.major](buf$1, tokens, options);
}
/**
* @param {any} data
* @param {TokenTypeEncoder[]} encoders
* @param {EncodeOptions} options
* @returns {Uint8Array}
*/
function encodeCustom(data, encoders, options) {
	const tokens = objectToTokens(data, options);
	if (!Array.isArray(tokens) && options.quickEncodeToken) {
		const quickBytes = options.quickEncodeToken(tokens);
		if (quickBytes) return quickBytes;
		const encoder = encoders[tokens.type.major];
		if (encoder.encodedSize) {
			const size = encoder.encodedSize(tokens, options);
			const buf$1 = new Bl(size);
			encoder(buf$1, tokens, options);
			if (buf$1.chunks.length !== 1) throw new Error(`Unexpected error: pre-calculated length for ${tokens} was wrong`);
			return asU8A(buf$1.chunks[0]);
		}
	}
	buf.reset();
	tokensToEncoded(buf, tokens, encoders, options);
	return buf.toBytes(true);
}
/**
* @param {any} data
* @param {EncodeOptions} [options]
* @returns {Uint8Array}
*/
function encode(data, options) {
	options = Object.assign({}, defaultEncodeOptions, options);
	return encodeCustom(data, cborEncoders, options);
}
/**
* @typedef {import('./token.js').Token} Token
* @typedef {import('../interface').DecodeOptions} DecodeOptions
* @typedef {import('../interface').DecodeTokenizer} DecodeTokenizer
*/
const defaultDecodeOptions = {
	strict: false,
	allowIndefinite: true,
	allowUndefined: true,
	allowBigInt: true
};
var Tokeniser = class {
	/**
	* @param {Uint8Array} data
	* @param {DecodeOptions} options
	*/
	constructor(data, options = {}) {
		this._pos = 0;
		this.data = data;
		this.options = options;
	}
	pos() {
		return this._pos;
	}
	done() {
		return this._pos >= this.data.length;
	}
	next() {
		const byt = this.data[this._pos];
		let token = quick[byt];
		if (token === undefined) {
			const decoder = jump[byt];
			if (!decoder) throw new Error(`${decodeErrPrefix} no decoder for major type ${byt >>> 5} (byte 0x${byt.toString(16).padStart(2, "0")})`);
			const minor = byt & 31;
			token = decoder(this.data, this._pos, minor, this.options);
		}
		this._pos += token.encodedLength;
		return token;
	}
};
const DONE = Symbol.for("DONE");
const BREAK = Symbol.for("BREAK");
/**
* @param {Token} token
* @param {DecodeTokenizer} tokeniser
* @param {DecodeOptions} options
* @returns {any|BREAK|DONE}
*/
function tokenToArray(token, tokeniser, options) {
	const arr = [];
	for (let i = 0; i < token.value; i++) {
		const value = tokensToObject(tokeniser, options);
		if (value === BREAK) {
			if (token.value === Infinity) break;
			throw new Error(`${decodeErrPrefix} got unexpected break to lengthed array`);
		}
		if (value === DONE) throw new Error(`${decodeErrPrefix} found array but not enough entries (got ${i}, expected ${token.value})`);
		arr[i] = value;
	}
	return arr;
}
/**
* @param {Token} token
* @param {DecodeTokenizer} tokeniser
* @param {DecodeOptions} options
* @returns {any|BREAK|DONE}
*/
function tokenToMap(token, tokeniser, options) {
	const useMaps = options.useMaps === true;
	const obj = useMaps ? undefined : {};
	const m = useMaps ? new Map() : undefined;
	for (let i = 0; i < token.value; i++) {
		const key = tokensToObject(tokeniser, options);
		if (key === BREAK) {
			if (token.value === Infinity) break;
			throw new Error(`${decodeErrPrefix} got unexpected break to lengthed map`);
		}
		if (key === DONE) throw new Error(`${decodeErrPrefix} found map but not enough entries (got ${i} [no key], expected ${token.value})`);
		if (useMaps !== true && typeof key !== "string") throw new Error(`${decodeErrPrefix} non-string keys not supported (got ${typeof key})`);
		if (options.rejectDuplicateMapKeys === true) {
			if (useMaps && m.has(key) || !useMaps && key in obj) throw new Error(`${decodeErrPrefix} found repeat map key "${key}"`);
		}
		const value = tokensToObject(tokeniser, options);
		if (value === DONE) throw new Error(`${decodeErrPrefix} found map but not enough entries (got ${i} [no value], expected ${token.value})`);
		if (useMaps) m.set(key, value);
else obj[key] = value;
	}
	return useMaps ? m : obj;
}
/**
* @param {DecodeTokenizer} tokeniser
* @param {DecodeOptions} options
* @returns {any|BREAK|DONE}
*/
function tokensToObject(tokeniser, options) {
	if (tokeniser.done()) return DONE;
	const token = tokeniser.next();
	if (token.type === Type$1.break) return BREAK;
	if (token.type.terminal) return token.value;
	if (token.type === Type$1.array) return tokenToArray(token, tokeniser, options);
	if (token.type === Type$1.map) return tokenToMap(token, tokeniser, options);
	if (token.type === Type$1.tag) {
		if (options.tags && typeof options.tags[token.value] === "function") {
			const tagged = tokensToObject(tokeniser, options);
			return options.tags[token.value](tagged);
		}
		throw new Error(`${decodeErrPrefix} tag not supported (${token.value})`);
	}
	throw new Error("unsupported");
}
/**
* @param {Uint8Array} data
* @param {DecodeOptions} [options]
* @returns {[any, Uint8Array]}
*/
function decodeFirst(data, options) {
	if (!(data instanceof Uint8Array)) throw new Error(`${decodeErrPrefix} data to decode must be a Uint8Array`);
	options = Object.assign({}, defaultDecodeOptions, options);
	const tokeniser = options.tokenizer || new Tokeniser(data, options);
	const decoded = tokensToObject(tokeniser, options);
	if (decoded === DONE) throw new Error(`${decodeErrPrefix} did not find any content to decode`);
	if (decoded === BREAK) throw new Error(`${decodeErrPrefix} got unexpected break`);
	return [decoded, data.subarray(tokeniser.pos())];
}
/**
* @param {Uint8Array} data
* @param {DecodeOptions} [options]
* @returns {any}
*/
function decode(data, options) {
	const [decoded, remainder] = decodeFirst(data, options);
	if (remainder.length > 0) throw new Error(`${decodeErrPrefix} too many terminals, data makes no sense`);
	return decoded;
}

//#endregion
//#region src/common/api/worker/rest/CustomCacheHandler.ts
var CustomCacheHandlerMap = class {
	handlers;
	constructor(...args) {
		const handlers = new Map();
		for (const { ref, handler } of args) {
			const key = getTypeId(ref);
			handlers.set(key, handler);
		}
		this.handlers = freezeMap(handlers);
	}
	get(typeRef) {
		const typeId = getTypeId(typeRef);
		return this.handlers.get(typeId);
	}
};
var CustomCalendarEventCacheHandler = class {
	constructor(entityRestClient) {
		this.entityRestClient = entityRestClient;
	}
	async loadRange(storage, listId, start, count, reverse) {
		const range = await storage.getRangeForList(CalendarEventTypeRef, listId);
		let rawList = [];
		if (range == null) {
			let chunk = [];
			let currentMin = CUSTOM_MIN_ID;
			while (true) {
				chunk = await this.entityRestClient.loadRange(CalendarEventTypeRef, listId, currentMin, LOAD_MULTIPLE_LIMIT, false);
				rawList.push(...chunk);
				if (chunk.length < LOAD_MULTIPLE_LIMIT) break;
				currentMin = getElementId(chunk[chunk.length - 1]);
			}
			for (const event of rawList) await storage.put(event);
			await storage.setNewRangeForList(CalendarEventTypeRef, listId, CUSTOM_MIN_ID, CUSTOM_MAX_ID);
		} else {
			this.assertCorrectRange(range);
			rawList = await storage.getWholeList(CalendarEventTypeRef, listId);
			console.log(`CalendarEvent list ${listId} has ${rawList.length} events`);
		}
		const typeModel = await resolveTypeReference(CalendarEventTypeRef);
		const sortedList = reverse ? rawList.filter((calendarEvent) => firstBiggerThanSecond(start, getElementId(calendarEvent), typeModel)).sort((a, b) => firstBiggerThanSecond(getElementId(b), getElementId(a), typeModel) ? 1 : -1) : rawList.filter((calendarEvent) => firstBiggerThanSecond(getElementId(calendarEvent), start, typeModel)).sort((a, b) => firstBiggerThanSecond(getElementId(a), getElementId(b), typeModel) ? 1 : -1);
		return sortedList.slice(0, count);
	}
	assertCorrectRange(range) {
		if (range.lower !== CUSTOM_MIN_ID || range.upper !== CUSTOM_MAX_ID) throw new ProgrammingError(`Invalid range for CalendarEvent: ${JSON.stringify(range)}`);
	}
	async getElementIdsInCacheRange(storage, listId, ids) {
		const range = await storage.getRangeForList(CalendarEventTypeRef, listId);
		if (range) {
			this.assertCorrectRange(range);
			return ids;
		} else return [];
	}
};
var CustomMailEventCacheHandler = class {
	async shouldLoadOnCreateEvent() {
		return true;
	}
};

//#endregion
//#region src/common/api/worker/offline/SqlValue.ts
let SqlType = function(SqlType$1) {
	SqlType$1["Null"] = "SqlNull";
	SqlType$1["Number"] = "SqlNum";
	SqlType$1["String"] = "SqlStr";
	SqlType$1["Bytes"] = "SqlBytes";
	return SqlType$1;
}({});
function tagSqlValue(param) {
	if (typeof param === "string") return {
		type: SqlType.String,
		value: param
	};
else if (typeof param === "number") return {
		type: SqlType.Number,
		value: param
	};
else if (param == null) return {
		type: SqlType.Null,
		value: null
	};
else return {
		type: SqlType.Bytes,
		value: param
	};
}
function untagSqlObject(tagged) {
	return mapObject((p) => p.value, tagged);
}

//#endregion
//#region src/common/api/worker/offline/Sql.ts
function sql(queryParts, ...paramInstances) {
	let query = "";
	let params = [];
	let i;
	for (i = 0; i < paramInstances.length; i++) {
		query += queryParts[i];
		const param = paramInstances[i];
		if (param instanceof SqlFragment) {
			query += param.text;
			params.push(...param.params.map(tagSqlValue));
		} else {
			query += "?";
			params.push(tagSqlValue(param));
		}
	}
	query += queryParts[i];
	return {
		query,
		params
	};
}
var SqlFragment = class {
	constructor(text, params) {
		this.text = text;
		this.params = params;
	}
};

//#endregion
//#region src/common/api/worker/offline/OfflineStorage.ts
/**
* this is the value of SQLITE_MAX_VARIABLE_NUMBER in sqlite3.c
* it may change if the sqlite version is updated.
* */
const MAX_SAFE_SQL_VARS = 32766;
function dateEncoder(data, typ, options) {
	const time = data.getTime();
	return [new Token(Type$1.tag, 100), new Token(time < 0 ? Type$1.negint : Type$1.uint, time)];
}
function dateDecoder(bytes) {
	return new Date(bytes);
}
const customTypeEncoders = Object.freeze({ Date: dateEncoder });
const customTypeDecoders = (() => {
	const tags = [];
	tags[100] = dateDecoder;
	return tags;
})();
const TableDefinitions = Object.freeze({
	list_entities: "type TEXT NOT NULL, listId TEXT NOT NULL, elementId TEXT NOT NULL, ownerGroup TEXT, entity BLOB NOT NULL, PRIMARY KEY (type, listId, elementId)",
	element_entities: "type TEXT NOT NULL, elementId TEXT NOT NULL, ownerGroup TEXT, entity BLOB NOT NULL, PRIMARY KEY (type, elementId)",
	ranges: "type TEXT NOT NULL, listId TEXT NOT NULL, lower TEXT NOT NULL, upper TEXT NOT NULL, PRIMARY KEY (type, listId)",
	lastUpdateBatchIdPerGroupId: "groupId TEXT NOT NULL, batchId TEXT NOT NULL, PRIMARY KEY (groupId)",
	metadata: "key TEXT NOT NULL, value BLOB, PRIMARY KEY (key)",
	blob_element_entities: "type TEXT NOT NULL, listId TEXT NOT NULL, elementId TEXT NOT NULL, ownerGroup TEXT, entity BLOB NOT NULL, PRIMARY KEY (type, listId, elementId)"
});
var OfflineStorage = class {
	customCacheHandler = null;
	userId = null;
	timeRangeDays = null;
	constructor(sqlCipherFacade, interWindowEventSender, dateProvider, migrator, cleaner) {
		this.sqlCipherFacade = sqlCipherFacade;
		this.interWindowEventSender = interWindowEventSender;
		this.dateProvider = dateProvider;
		this.migrator = migrator;
		this.cleaner = cleaner;
		assert(isOfflineStorageAvailable() || isTest(), "Offline storage is not available.");
	}
	/**
	* @return {boolean} whether the database was newly created or not
	*/
	async init({ userId, databaseKey, timeRangeDays, forceNewDatabase }) {
		this.userId = userId;
		this.timeRangeDays = timeRangeDays;
		if (forceNewDatabase) {
			if (isDesktop()) await this.interWindowEventSender.localUserDataInvalidated(userId);
			await this.sqlCipherFacade.deleteDb(userId);
		}
		await this.sqlCipherFacade.openDb(userId, databaseKey);
		await this.createTables();
		try {
			await this.migrator.migrate(this, this.sqlCipherFacade);
		} catch (e) {
			if (e instanceof OutOfSyncError) {
				console.warn("Offline db is out of sync!", e);
				await this.recreateDbFile(userId, databaseKey);
				await this.migrator.migrate(this, this.sqlCipherFacade);
			} else throw e;
		}
		return (await this.getLastUpdateTime()).type === "never";
	}
	async recreateDbFile(userId, databaseKey) {
		console.log(`recreating DB file for userId ${userId}`);
		await this.sqlCipherFacade.closeDb();
		await this.sqlCipherFacade.deleteDb(userId);
		await this.sqlCipherFacade.openDb(userId, databaseKey);
		await this.createTables();
	}
	/**
	* currently, we close DBs from the native side (mainly on things like reload and on android's onDestroy)
	*/
	async deinit() {
		this.userId = null;
		await this.sqlCipherFacade.closeDb();
	}
	async deleteIfExists(typeRef, listId, elementId) {
		const type = getTypeId(typeRef);
		const typeModel = await resolveTypeReference(typeRef);
		const encodedElementId = ensureBase64Ext(typeModel, elementId);
		let formattedQuery;
		switch (typeModel.type) {
			case Type.Element:
				formattedQuery = sql`DELETE
									 FROM element_entities
									 WHERE type = ${type}
									   AND elementId = ${encodedElementId}`;
				break;
			case Type.ListElement:
				formattedQuery = sql`DELETE
									 FROM list_entities
									 WHERE type = ${type}
									   AND listId = ${listId}
									   AND elementId = ${encodedElementId}`;
				break;
			case Type.BlobElement:
				formattedQuery = sql`DELETE
									 FROM blob_element_entities
									 WHERE type = ${type}
									   AND listId = ${listId}
									   AND elementId = ${encodedElementId}`;
				break;
			default: throw new Error("must be a persistent type");
		}
		await this.sqlCipherFacade.run(formattedQuery.query, formattedQuery.params);
	}
	async deleteAllOfType(typeRef) {
		const type = getTypeId(typeRef);
		let typeModel;
		typeModel = await resolveTypeReference(typeRef);
		let formattedQuery;
		switch (typeModel.type) {
			case Type.Element:
				formattedQuery = sql`DELETE
									 FROM element_entities
									 WHERE type = ${type}`;
				break;
			case Type.ListElement:
				formattedQuery = sql`DELETE
									 FROM list_entities
									 WHERE type = ${type}`;
				await this.sqlCipherFacade.run(formattedQuery.query, formattedQuery.params);
				await this.deleteAllRangesForType(type);
				return;
			case Type.BlobElement:
				formattedQuery = sql`DELETE
									 FROM blob_element_entities
									 WHERE type = ${type}`;
				break;
			default: throw new Error("must be a persistent type");
		}
		await this.sqlCipherFacade.run(formattedQuery.query, formattedQuery.params);
	}
	async deleteAllRangesForType(type) {
		const { query, params } = sql`DELETE
									  FROM ranges
									  WHERE type = ${type}`;
		await this.sqlCipherFacade.run(query, params);
	}
	async get(typeRef, listId, elementId) {
		const type = getTypeId(typeRef);
		const typeModel = await resolveTypeReference(typeRef);
		const encodedElementId = ensureBase64Ext(typeModel, elementId);
		let formattedQuery;
		switch (typeModel.type) {
			case Type.Element:
				formattedQuery = sql`SELECT entity
									 from element_entities
									 WHERE type = ${type}
									   AND elementId = ${encodedElementId}`;
				break;
			case Type.ListElement:
				formattedQuery = sql`SELECT entity
									 from list_entities
									 WHERE type = ${type}
									   AND listId = ${listId}
									   AND elementId = ${encodedElementId}`;
				break;
			case Type.BlobElement:
				formattedQuery = sql`SELECT entity
									 from blob_element_entities
									 WHERE type = ${type}
									   AND listId = ${listId}
									   AND elementId = ${encodedElementId}`;
				break;
			default: throw new Error("must be a persistent type");
		}
		const result = await this.sqlCipherFacade.get(formattedQuery.query, formattedQuery.params);
		return result?.entity ? await this.deserialize(typeRef, result.entity.value) : null;
	}
	async provideMultiple(typeRef, listId, elementIds) {
		if (elementIds.length === 0) return [];
		const typeModel = await resolveTypeReference(typeRef);
		const encodedElementIds = elementIds.map((elementId) => ensureBase64Ext(typeModel, elementId));
		const type = getTypeId(typeRef);
		const serializedList = await this.allChunked(MAX_SAFE_SQL_VARS - 2, encodedElementIds, (c) => sql`SELECT entity
					   FROM list_entities
					   WHERE type = ${type}
						 AND listId = ${listId}
						 AND elementId IN ${paramList(c)}`);
		return await this.deserializeList(typeRef, serializedList.map((r) => r.entity.value));
	}
	async getIdsInRange(typeRef, listId) {
		const type = getTypeId(typeRef);
		const typeModel = await resolveTypeReference(typeRef);
		const range = await this.getRange(typeRef, listId);
		if (range == null) throw new Error(`no range exists for ${type} and list ${listId}`);
		const { query, params } = sql`SELECT elementId
									  FROM list_entities
									  WHERE type = ${type}
										AND listId = ${listId}
										AND (elementId = ${range.lower}
										  OR ${firstIdBigger("elementId", range.lower)})
										AND NOT (${firstIdBigger("elementId", range.upper)})`;
		const rows = await this.sqlCipherFacade.all(query, params);
		return rows.map((row) => customIdToBase64Url(typeModel, row.elementId.value));
	}
	/** don't use this internally in this class, use OfflineStorage::getRange instead. OfflineStorage is
	* using converted custom IDs internally which is undone when using this to access the range.
	*/
	async getRangeForList(typeRef, listId) {
		let range = await this.getRange(typeRef, listId);
		if (range == null) return range;
		const typeModel = await resolveTypeReference(typeRef);
		return {
			lower: customIdToBase64Url(typeModel, range.lower),
			upper: customIdToBase64Url(typeModel, range.upper)
		};
	}
	async isElementIdInCacheRange(typeRef, listId, elementId) {
		const typeModel = await resolveTypeReference(typeRef);
		const encodedElementId = ensureBase64Ext(typeModel, elementId);
		const range = await this.getRange(typeRef, listId);
		return range != null && !firstBiggerThanSecond(encodedElementId, range.upper) && !firstBiggerThanSecond(range.lower, encodedElementId);
	}
	async provideFromRange(typeRef, listId, start, count, reverse) {
		const typeModel = await resolveTypeReference(typeRef);
		const encodedStartId = ensureBase64Ext(typeModel, start);
		const type = getTypeId(typeRef);
		let formattedQuery;
		if (reverse) formattedQuery = sql`SELECT entity
								 FROM list_entities
								 WHERE type = ${type}
								   AND listId = ${listId}
								   AND ${firstIdBigger(encodedStartId, "elementId")}
								 ORDER BY LENGTH(elementId) DESC, elementId DESC LIMIT ${count}`;
else formattedQuery = sql`SELECT entity
								 FROM list_entities
								 WHERE type = ${type}
								   AND listId = ${listId}
								   AND ${firstIdBigger("elementId", encodedStartId)}
								 ORDER BY LENGTH(elementId) ASC, elementId ASC LIMIT ${count}`;
		const { query, params } = formattedQuery;
		const serializedList = await this.sqlCipherFacade.all(query, params);
		return await this.deserializeList(typeRef, serializedList.map((r) => r.entity.value));
	}
	async put(originalEntity) {
		const serializedEntity = this.serialize(originalEntity);
		const { listId, elementId } = expandId(originalEntity._id);
		const type = getTypeId(originalEntity._type);
		const ownerGroup = originalEntity._ownerGroup;
		const typeModel = await resolveTypeReference(originalEntity._type);
		const encodedElementId = ensureBase64Ext(typeModel, elementId);
		let formattedQuery;
		switch (typeModel.type) {
			case Type.Element:
				formattedQuery = sql`INSERT
				OR REPLACE INTO element_entities (type, elementId, ownerGroup, entity) VALUES (
				${type},
				${encodedElementId},
				${ownerGroup},
				${serializedEntity}
				)`;
				break;
			case Type.ListElement:
				formattedQuery = sql`INSERT
				OR REPLACE INTO list_entities (type, listId, elementId, ownerGroup, entity) VALUES (
				${type},
				${listId},
				${encodedElementId},
				${ownerGroup},
				${serializedEntity}
				)`;
				break;
			case Type.BlobElement:
				formattedQuery = sql`INSERT
				OR REPLACE INTO blob_element_entities (type, listId, elementId, ownerGroup, entity) VALUES (
				${type},
				${listId},
				${encodedElementId},
				${ownerGroup},
				${serializedEntity}
				)`;
				break;
			default: throw new Error("must be a persistent type");
		}
		await this.sqlCipherFacade.run(formattedQuery.query, formattedQuery.params);
	}
	async setLowerRangeForList(typeRef, listId, lowerId) {
		lowerId = ensureBase64Ext(await resolveTypeReference(typeRef), lowerId);
		const type = getTypeId(typeRef);
		const { query, params } = sql`UPDATE ranges
									  SET lower = ${lowerId}
									  WHERE type = ${type}
										AND listId = ${listId}`;
		await this.sqlCipherFacade.run(query, params);
	}
	async setUpperRangeForList(typeRef, listId, upperId) {
		upperId = ensureBase64Ext(await resolveTypeReference(typeRef), upperId);
		const type = getTypeId(typeRef);
		const { query, params } = sql`UPDATE ranges
									  SET upper = ${upperId}
									  WHERE type = ${type}
										AND listId = ${listId}`;
		await this.sqlCipherFacade.run(query, params);
	}
	async setNewRangeForList(typeRef, listId, lower, upper) {
		const typeModel = await resolveTypeReference(typeRef);
		lower = ensureBase64Ext(typeModel, lower);
		upper = ensureBase64Ext(typeModel, upper);
		const type = getTypeId(typeRef);
		const { query, params } = sql`INSERT
		OR REPLACE INTO ranges VALUES (
		${type},
		${listId},
		${lower},
		${upper}
		)`;
		return this.sqlCipherFacade.run(query, params);
	}
	async getLastBatchIdForGroup(groupId) {
		const { query, params } = sql`SELECT batchId
									  from lastUpdateBatchIdPerGroupId
									  WHERE groupId = ${groupId}`;
		const row = await this.sqlCipherFacade.get(query, params);
		return row?.batchId?.value ?? null;
	}
	async putLastBatchIdForGroup(groupId, batchId) {
		const { query, params } = sql`INSERT
		OR REPLACE INTO lastUpdateBatchIdPerGroupId VALUES (
		${groupId},
		${batchId}
		)`;
		await this.sqlCipherFacade.run(query, params);
	}
	async getLastUpdateTime() {
		const time = await this.getMetadata("lastUpdateTime");
		return time ? {
			type: "recorded",
			time
		} : { type: "never" };
	}
	async putLastUpdateTime(ms) {
		await this.putMetadata("lastUpdateTime", ms);
	}
	async purgeStorage() {
		for (let name of Object.keys(TableDefinitions)) await this.sqlCipherFacade.run(`DELETE
				 FROM ${name}`, []);
	}
	async deleteRange(typeRef, listId) {
		const { query, params } = sql`DELETE
									  FROM ranges
									  WHERE type = ${getTypeId(typeRef)}
										AND listId = ${listId}`;
		await this.sqlCipherFacade.run(query, params);
	}
	async getRawListElementsOfType(typeRef) {
		const { query, params } = sql`SELECT entity
									  from list_entities
									  WHERE type = ${getTypeId(typeRef)}`;
		const items = await this.sqlCipherFacade.all(query, params) ?? [];
		return items.map((item) => this.decodeCborEntity(item.entity.value));
	}
	async getRawElementsOfType(typeRef) {
		const { query, params } = sql`SELECT entity
									  from element_entities
									  WHERE type = ${getTypeId(typeRef)}`;
		const items = await this.sqlCipherFacade.all(query, params) ?? [];
		return items.map((item) => this.decodeCborEntity(item.entity.value));
	}
	async getElementsOfType(typeRef) {
		const { query, params } = sql`SELECT entity
									  from element_entities
									  WHERE type = ${getTypeId(typeRef)}`;
		const items = await this.sqlCipherFacade.all(query, params) ?? [];
		return await this.deserializeList(typeRef, items.map((row) => row.entity.value));
	}
	async getWholeList(typeRef, listId) {
		const { query, params } = sql`SELECT entity
									  FROM list_entities
									  WHERE type = ${getTypeId(typeRef)}
										AND listId = ${listId}`;
		const items = await this.sqlCipherFacade.all(query, params) ?? [];
		return await this.deserializeList(typeRef, items.map((row) => row.entity.value));
	}
	async dumpMetadata() {
		const query = "SELECT * from metadata";
		const stored = (await this.sqlCipherFacade.all(query, [])).map((row) => [row.key.value, row.value.value]);
		return Object.fromEntries(stored.map(([key, value]) => [key, decode(value)]));
	}
	async setStoredModelVersion(model, version) {
		return this.putMetadata(`${model}-version`, version);
	}
	getCustomCacheHandlerMap(entityRestClient) {
		if (this.customCacheHandler == null) this.customCacheHandler = new CustomCacheHandlerMap({
			ref: CalendarEventTypeRef,
			handler: new CustomCalendarEventCacheHandler(entityRestClient)
		}, {
			ref: MailTypeRef,
			handler: new CustomMailEventCacheHandler()
		});
		return this.customCacheHandler;
	}
	getUserId() {
		return assertNotNull(this.userId, "No user id, not initialized?");
	}
	async deleteAllOwnedBy(owner) {
		{
			const { query, params } = sql`DELETE
										  FROM element_entities
										  WHERE ownerGroup = ${owner}`;
			await this.sqlCipherFacade.run(query, params);
		}
		{
			const { query, params } = sql`SELECT listId, type
										  FROM list_entities
										  WHERE ownerGroup = ${owner}`;
			const rangeRows = await this.sqlCipherFacade.all(query, params);
			const rows = rangeRows.map((row) => untagSqlObject(row));
			const listIdsByType = groupByAndMapUniquely(rows, (row) => row.type, (row) => row.listId);
			for (const [type, listIds] of listIdsByType.entries()) {
				const safeChunkSize = MAX_SAFE_SQL_VARS - 1;
				const listIdArr = Array.from(listIds);
				await this.runChunked(safeChunkSize, listIdArr, (c) => sql`DELETE
							   FROM ranges
							   WHERE type = ${type}
								 AND listId IN ${paramList(c)}`);
				await this.runChunked(safeChunkSize, listIdArr, (c) => sql`DELETE
							   FROM list_entities
							   WHERE type = ${type}
								 AND listId IN ${paramList(c)}`);
			}
		}
		{
			const { query, params } = sql`DELETE
										  FROM blob_element_entities
										  WHERE ownerGroup = ${owner}`;
			await this.sqlCipherFacade.run(query, params);
		}
		{
			const { query, params } = sql`DELETE
										  FROM lastUpdateBatchIdPerGroupId
										  WHERE groupId = ${owner}`;
			await this.sqlCipherFacade.run(query, params);
		}
	}
	async deleteWholeList(typeRef, listId) {
		await this.lockRangesDbAccess(listId);
		await this.deleteRange(typeRef, listId);
		const { query, params } = sql`DELETE
									  FROM list_entities
									  WHERE listId = ${listId}`;
		await this.sqlCipherFacade.run(query, params);
		await this.unlockRangesDbAccess(listId);
	}
	async putMetadata(key, value) {
		let encodedValue;
		try {
			encodedValue = encode(value);
		} catch (e) {
			console.log("[OfflineStorage] failed to encode metadata for key", key, "with value", value);
			throw e;
		}
		const { query, params } = sql`INSERT
		OR REPLACE INTO metadata VALUES (
		${key},
		${encodedValue}
		)`;
		await this.sqlCipherFacade.run(query, params);
	}
	async getMetadata(key) {
		const { query, params } = sql`SELECT value
									  from metadata
									  WHERE key = ${key}`;
		const encoded = await this.sqlCipherFacade.get(query, params);
		return encoded && decode(encoded.value.value);
	}
	/**
	* Clear out unneeded data from the offline database (i.e. trash and spam lists, old data).
	* This will be called after login (CachePostLoginActions.ts) to ensure fast login time.
	* @param timeRangeDays: the maximum age of days that mails should be to be kept in the database. if null, will use a default value
	* @param userId id of the current user. default, last stored userId
	*/
	async clearExcludedData(timeRangeDays = this.timeRangeDays, userId = this.getUserId()) {
		await this.cleaner.cleanOfflineDb(this, timeRangeDays, userId, this.dateProvider.now());
	}
	async createTables() {
		for (let [name, definition] of Object.entries(TableDefinitions)) await this.sqlCipherFacade.run(`CREATE TABLE IF NOT EXISTS ${name}
				 (
					 ${definition}
				 )`, []);
	}
	async getRange(typeRef, listId) {
		const type = getTypeId(typeRef);
		const { query, params } = sql`SELECT upper, lower
									  FROM ranges
									  WHERE type = ${type}
										AND listId = ${listId}`;
		const row = await this.sqlCipherFacade.get(query, params) ?? null;
		return mapNullable(row, untagSqlObject);
	}
	async deleteIn(typeRef, listId, elementIds) {
		if (elementIds.length === 0) return;
		const typeModel = await resolveTypeReference(typeRef);
		const encodedElementIds = elementIds.map((elementIds$1) => ensureBase64Ext(typeModel, elementIds$1));
		switch (typeModel.type) {
			case Type.Element: return await this.runChunked(MAX_SAFE_SQL_VARS - 1, encodedElementIds, (c) => sql`DELETE
							   FROM element_entities
							   WHERE type = ${getTypeId(typeRef)}
								 AND elementId IN ${paramList(c)}`);
			case Type.ListElement: return await this.runChunked(MAX_SAFE_SQL_VARS - 2, encodedElementIds, (c) => sql`DELETE
							   FROM list_entities
							   WHERE type = ${getTypeId(typeRef)}
								 AND listId = ${listId}
								 AND elementId IN ${paramList(c)}`);
			case Type.BlobElement: return await this.runChunked(MAX_SAFE_SQL_VARS - 2, encodedElementIds, (c) => sql`DELETE
							   FROM blob_element_entities
							   WHERE type = ${getTypeId(typeRef)}
								 AND listId = ${listId}
								 AND elementId IN ${paramList(c)}`);
			default: throw new Error("must be a persistent type");
		}
	}
	/**
	* We want to lock the access to the "ranges" db when updating / reading the
	* offline available mail list / mailset ranges for each mail list (referenced using the listId).
	* @param listId the mail list or mail set entry list that we want to lock
	*/
	async lockRangesDbAccess(listId) {
		await this.sqlCipherFacade.lockRangesDbAccess(listId);
	}
	/**
	* This is the counterpart to the function "lockRangesDbAccess(listId)".
	* @param listId the mail list that we want to unlock
	*/
	async unlockRangesDbAccess(listId) {
		await this.sqlCipherFacade.unlockRangesDbAccess(listId);
	}
	async updateRangeForListAndDeleteObsoleteData(typeRef, listId, rawCutoffId) {
		const typeModel = await resolveTypeReference(typeRef);
		const isCustomId = isCustomIdType(typeModel);
		const encodedCutoffId = ensureBase64Ext(typeModel, rawCutoffId);
		const range = await this.getRange(typeRef, listId);
		if (range == null) return;
		const expectedMinId = isCustomId ? CUSTOM_MIN_ID : GENERATED_MIN_ID;
		if (range.lower === expectedMinId) {
			const entities = await this.provideFromRange(typeRef, listId, expectedMinId, 1, false);
			const id = mapNullable(entities[0], getElementId);
			const rangeWontBeModified = id == null || firstBiggerThanSecond(id, encodedCutoffId) || id === encodedCutoffId;
			if (rangeWontBeModified) return;
		}
		if (firstBiggerThanSecond(encodedCutoffId, range.lower)) if (firstBiggerThanSecond(encodedCutoffId, range.upper)) await this.deleteRange(typeRef, listId);
else await this.setLowerRangeForList(typeRef, listId, rawCutoffId);
	}
	serialize(originalEntity) {
		try {
			return encode(originalEntity, { typeEncoders: customTypeEncoders });
		} catch (e) {
			console.log("[OfflineStorage] failed to encode entity of type", originalEntity._type, "with id", originalEntity._id);
			throw e;
		}
	}
	/**
	* Convert the type from CBOR representation to the runtime type
	*/
	async deserialize(typeRef, loaded) {
		let deserialized;
		try {
			deserialized = this.decodeCborEntity(loaded);
		} catch (e) {
			console.log(e);
			console.log(`Error with CBOR decode. Trying to decode (of type: ${typeof loaded}): ${loaded}`);
			return null;
		}
		const typeModel = await resolveTypeReference(typeRef);
		return await this.fixupTypeRefs(typeModel, deserialized);
	}
	decodeCborEntity(loaded) {
		return decode(loaded, { tags: customTypeDecoders });
	}
	async fixupTypeRefs(typeModel, deserialized) {
		deserialized._type = new TypeRef(typeModel.app, typeModel.name);
		for (const [associationName, associationModel] of Object.entries(typeModel.associations)) if (associationModel.type === AssociationType.Aggregation) {
			const aggregateTypeRef = new TypeRef(associationModel.dependency ?? typeModel.app, associationModel.refType);
			const aggregateTypeModel = await resolveTypeReference(aggregateTypeRef);
			switch (associationModel.cardinality) {
				case Cardinality.One:
				case Cardinality.ZeroOrOne: {
					const aggregate = deserialized[associationName];
					if (aggregate) await this.fixupTypeRefs(aggregateTypeModel, aggregate);
					break;
				}
				case Cardinality.Any: {
					const aggregateList = deserialized[associationName];
					for (const aggregate of aggregateList) await this.fixupTypeRefs(aggregateTypeModel, aggregate);
					break;
				}
			}
		}
		return deserialized;
	}
	async deserializeList(typeRef, loaded) {
		const result = [];
		for (const entity of loaded) {
			const deserialized = await this.deserialize(typeRef, entity);
			if (deserialized != null) result.push(deserialized);
		}
		return result;
	}
	/**
	* convenience method to run a potentially too large query over several chunks.
	* chunkSize must be chosen such that the total number of SQL variables in the final query does not exceed MAX_SAFE_SQL_VARS
	* */
	async runChunked(chunkSize, originalList, formatter) {
		for (const chunk of splitInChunks(chunkSize, originalList)) {
			const formattedQuery = formatter(chunk);
			await this.sqlCipherFacade.run(formattedQuery.query, formattedQuery.params);
		}
	}
	/**
	* convenience method to execute a potentially too large query over several chunks.
	* chunkSize must be chosen such that the total number of SQL variables in the final query does not exceed MAX_SAFE_SQL_VARS
	* */
	async allChunked(chunkSize, originalList, formatter) {
		const result = [];
		for (const chunk of splitInChunks(chunkSize, originalList)) {
			const formattedQuery = formatter(chunk);
			result.push(...await this.sqlCipherFacade.all(formattedQuery.query, formattedQuery.params));
		}
		return result;
	}
};
function paramList(params) {
	const qs = params.map(() => "?").join(",");
	return new SqlFragment(`(${qs})`, params);
}
/**
* comparison to select ids that are bigger or smaller than a parameter id
* must be used within sql`<query>` template string to inline the logic into the query.
*
* will always insert 3 constants and 3 SQL variables into the query.
*/
function firstIdBigger(...args) {
	let [l, r] = args;
	let v;
	if (l === "elementId") {
		v = r;
		r = "?";
	} else {
		v = l;
		l = "?";
	}
	return new SqlFragment(`(CASE WHEN length(${l}) > length(${r}) THEN 1 WHEN length(${l}) < length(${r}) THEN 0 ELSE ${l} > ${r} END)`, [
		v,
		v,
		v
	]);
}
function isCustomIdType(typeModel) {
	return typeModel.values._id.type === ValueType.CustomId;
}
function ensureBase64Ext(typeModel, elementId) {
	if (isCustomIdType(typeModel)) return base64ToBase64Ext(base64UrlToBase64(elementId));
	return elementId;
}
function customIdToBase64Url(typeModel, elementId) {
	if (isCustomIdType(typeModel)) return base64ToBase64Url(base64ExtToBase64(elementId));
	return elementId;
}

//#endregion
//#region src/common/api/worker/rest/DefaultEntityRestCache.ts
assertWorkerOrNode();
const EXTEND_RANGE_MIN_CHUNK_SIZE = 40;
const IGNORED_TYPES = [
	EntityEventBatchTypeRef,
	PermissionTypeRef,
	BucketPermissionTypeRef,
	SessionTypeRef,
	SecondFactorTypeRef,
	RecoverCodeTypeRef,
	RejectedSenderTypeRef,
	CalendarEventUidIndexTypeRef,
	KeyRotationTypeRef,
	UserGroupRootTypeRef,
	UserGroupKeyDistributionTypeRef,
	AuditLogEntryTypeRef
];
/**
* List of types containing a customId that we want to explicitly enable caching for.
* CustomId types are not cached by default because their id is using base64UrlEncoding while GeneratedUId types are using base64Ext encoding.
* base64Url encoding results in a different sort order of elements that we have on the server, this is problematic for caching LET and their ranges.
* When enabling caching for customId types we convert the id that we store in cache from base64Url to base64Ext so we have the same sort order. (see function
* OfflineStorage.ensureBase64Ext). In theory, we can try to enable caching for all types but as of now we enable it for a limited amount of types because there
* are other ways to cache customId types (see implementation of CustomCacheHandler)
*/
const CACHEABLE_CUSTOMID_TYPES = [MailSetEntryTypeRef, GroupKeyTypeRef];
var DefaultEntityRestCache = class {
	constructor(entityRestClient, storage) {
		this.entityRestClient = entityRestClient;
		this.storage = storage;
	}
	async load(typeRef, id, opts = {}) {
		const useCache = await this.shouldUseCache(typeRef, opts);
		if (!useCache) return await this.entityRestClient.load(typeRef, id, opts);
		const { listId, elementId } = expandId(id);
		const cachingBehavior = getCacheModeBehavior(opts.cacheMode);
		const cachedEntity = cachingBehavior.readsFromCache ? await this.storage.get(typeRef, listId, elementId) : null;
		if (cachedEntity == null) {
			const entity = await this.entityRestClient.load(typeRef, id, opts);
			if (cachingBehavior.writesToCache) await this.storage.put(entity);
			return entity;
		}
		return cachedEntity;
	}
	async loadMultiple(typeRef, listId, ids, ownerEncSessionKeyProvider, opts = {}) {
		const useCache = await this.shouldUseCache(typeRef, opts);
		if (!useCache) return await this.entityRestClient.loadMultiple(typeRef, listId, ids, ownerEncSessionKeyProvider, opts);
		return await this._loadMultiple(typeRef, listId, ids, ownerEncSessionKeyProvider, opts);
	}
	setup(listId, instance, extraHeaders, options) {
		return this.entityRestClient.setup(listId, instance, extraHeaders, options);
	}
	setupMultiple(listId, instances) {
		return this.entityRestClient.setupMultiple(listId, instances);
	}
	update(instance) {
		return this.entityRestClient.update(instance);
	}
	erase(instance, options) {
		return this.entityRestClient.erase(instance, options);
	}
	getLastEntityEventBatchForGroup(groupId) {
		return this.storage.getLastBatchIdForGroup(groupId);
	}
	setLastEntityEventBatchForGroup(groupId, batchId) {
		return this.storage.putLastBatchIdForGroup(groupId, batchId);
	}
	purgeStorage() {
		console.log("Purging the user's offline database");
		return this.storage.purgeStorage();
	}
	async isOutOfSync() {
		const timeSinceLastSync = await this.timeSinceLastSyncMs();
		return timeSinceLastSync != null && timeSinceLastSync > ENTITY_EVENT_BATCH_EXPIRE_MS;
	}
	async recordSyncTime() {
		const timestamp = this.getServerTimestampMs();
		await this.storage.putLastUpdateTime(timestamp);
	}
	async timeSinceLastSyncMs() {
		const lastUpdate = await this.storage.getLastUpdateTime();
		let lastUpdateTime;
		switch (lastUpdate.type) {
			case "recorded":
				lastUpdateTime = lastUpdate.time;
				break;
			case "never": return null;
			case "uninitialized": throw new ProgrammingError("Offline storage is not initialized");
		}
		const now = this.getServerTimestampMs();
		return now - lastUpdateTime;
	}
	getServerTimestampMs() {
		return this.entityRestClient.getRestClient().getServerTimestampMs();
	}
	/**
	* Delete a cached entity. Sometimes this is necessary to do to ensure you always load the new version
	*/
	deleteFromCacheIfExists(typeRef, listId, elementId) {
		return this.storage.deleteIfExists(typeRef, listId, elementId);
	}
	async _loadMultiple(typeRef, listId, ids, ownerEncSessionKeyProvider, opts = {}) {
		const cachingBehavior = getCacheModeBehavior(opts.cacheMode);
		const entitiesInCache = [];
		let idsToLoad;
		if (cachingBehavior.readsFromCache) {
			idsToLoad = [];
			for (const id of ids) {
				const cachedEntity = await this.storage.get(typeRef, listId, id);
				if (cachedEntity != null) entitiesInCache.push(cachedEntity);
else idsToLoad.push(id);
			}
		} else idsToLoad = ids;
		if (idsToLoad.length > 0) {
			const entitiesFromServer = await this.entityRestClient.loadMultiple(typeRef, listId, idsToLoad, ownerEncSessionKeyProvider, opts);
			if (cachingBehavior.writesToCache) for (const entity of entitiesFromServer) await this.storage.put(entity);
			return entitiesFromServer.concat(entitiesInCache);
		} else return entitiesInCache;
	}
	async loadRange(typeRef, listId, start, count, reverse, opts = {}) {
		const customHandler = this.storage.getCustomCacheHandlerMap(this.entityRestClient).get(typeRef);
		if (customHandler && customHandler.loadRange) return await customHandler.loadRange(this.storage, listId, start, count, reverse);
		const typeModel = await resolveTypeReference(typeRef);
		const useCache = await this.shouldUseCache(typeRef, opts) && isCachedRangeType(typeModel, typeRef);
		if (!useCache) return await this.entityRestClient.loadRange(typeRef, listId, start, count, reverse, opts);
		const behavior = getCacheModeBehavior(opts.cacheMode);
		if (!behavior.readsFromCache) throw new ProgrammingError("cannot write to cache without reading with range requests");
		await this.storage.lockRangesDbAccess(listId);
		try {
			const range = await this.storage.getRangeForList(typeRef, listId);
			if (behavior.writesToCache) {
				if (range == null) await this.populateNewListWithRange(typeRef, listId, start, count, reverse, opts);
else if (isStartIdWithinRange(range, start, typeModel)) await this.extendFromWithinRange(typeRef, listId, start, count, reverse, opts);
else if (isRangeRequestAwayFromExistingRange(range, reverse, start, typeModel)) await this.extendAwayFromRange(typeRef, listId, start, count, reverse, opts);
else await this.extendTowardsRange(typeRef, listId, start, count, reverse, opts);
				return await this.storage.provideFromRange(typeRef, listId, start, count, reverse);
			} else if (range && isStartIdWithinRange(range, start, typeModel)) {
				const provided = await this.storage.provideFromRange(typeRef, listId, start, count, reverse);
				const { newStart, newCount } = await this.recalculateRangeRequest(typeRef, listId, start, count, reverse);
				const newElements = newCount > 0 ? await this.entityRestClient.loadRange(typeRef, listId, newStart, newCount, reverse) : [];
				return provided.concat(newElements);
			} else return await this.entityRestClient.loadRange(typeRef, listId, start, count, reverse, opts);
		} finally {
			await this.storage.unlockRangesDbAccess(listId);
		}
	}
	/**
	* Creates a new list range, reading everything from the server that it can
	* range:         (none)
	* request:       *--------->
	* range becomes: |---------|
	* @private
	*/
	async populateNewListWithRange(typeRef, listId, start, count, reverse, opts) {
		const entities = await this.entityRestClient.loadRange(typeRef, listId, start, count, reverse, opts);
		await this.storage.setNewRangeForList(typeRef, listId, start, start);
		await this.updateRangeInStorage(typeRef, listId, count, reverse, entities);
	}
	/**
	* Returns part of a request from the cache, and the remainder is loaded from the server
	* range:          |---------|
	* request:             *-------------->
	* range becomes: |--------------------|
	*/
	async extendFromWithinRange(typeRef, listId, start, count, reverse, opts) {
		const { newStart, newCount } = await this.recalculateRangeRequest(typeRef, listId, start, count, reverse);
		if (newCount > 0) {
			const entities = await this.entityRestClient.loadRange(typeRef, listId, newStart, newCount, reverse, opts);
			await this.updateRangeInStorage(typeRef, listId, newCount, reverse, entities);
		}
	}
	/**
	* Start was outside the range, and we are loading away from the range
	* Keeps loading elements from the end of the range in the direction of the startId.
	* Returns once all available elements have been loaded or the requested number is in cache
	* range:          |---------|
	* request:                     *------->
	* range becomes:  |--------------------|
	*/
	async extendAwayFromRange(typeRef, listId, start, count, reverse, opts) {
		while (true) {
			const range = assertNotNull(await this.storage.getRangeForList(typeRef, listId));
			const loadStartId = reverse ? range.lower : range.upper;
			const requestCount = Math.max(count, EXTEND_RANGE_MIN_CHUNK_SIZE);
			const entities = await this.entityRestClient.loadRange(typeRef, listId, loadStartId, requestCount, reverse, opts);
			await this.updateRangeInStorage(typeRef, listId, requestCount, reverse, entities);
			if (entities.length < requestCount) break;
			const entitiesFromCache = await this.storage.provideFromRange(typeRef, listId, start, count, reverse);
			if (entitiesFromCache.length === count) break;
		}
	}
	/**
	* Loads all elements from the startId in the direction of the range
	* Once complete, returns as many elements as it can from the original request
	* range:         |---------|
	* request:                     <------*
	* range becomes: |--------------------|
	* or
	* range:              |---------|
	* request:       <-------------------*
	* range becomes: |--------------------|
	*/
	async extendTowardsRange(typeRef, listId, start, count, reverse, opts) {
		while (true) {
			const range = assertNotNull(await this.storage.getRangeForList(typeRef, listId));
			const loadStartId = reverse ? range.upper : range.lower;
			const requestCount = Math.max(count, EXTEND_RANGE_MIN_CHUNK_SIZE);
			const entities = await this.entityRestClient.loadRange(typeRef, listId, loadStartId, requestCount, !reverse, opts);
			await this.updateRangeInStorage(typeRef, listId, requestCount, !reverse, entities);
			if (await this.storage.isElementIdInCacheRange(typeRef, listId, start)) break;
		}
		await this.extendFromWithinRange(typeRef, listId, start, count, reverse, opts);
	}
	/**
	* Given the parameters and result of a range request,
	* Inserts the result into storage, and updates the range bounds
	* based on number of entities requested and the actual amount that were received
	*/
	async updateRangeInStorage(typeRef, listId, countRequested, wasReverseRequest, receivedEntities) {
		const isCustomId = isCustomIdType(await resolveTypeReference(typeRef));
		let elementsToAdd = receivedEntities;
		if (wasReverseRequest) {
			elementsToAdd = receivedEntities.reverse();
			if (receivedEntities.length < countRequested) {
				console.log("finished loading, setting min id");
				await this.storage.setLowerRangeForList(typeRef, listId, isCustomId ? CUSTOM_MIN_ID : GENERATED_MIN_ID);
			} else await this.storage.setLowerRangeForList(typeRef, listId, getElementId(getFirstOrThrow(receivedEntities)));
		} else if (receivedEntities.length < countRequested) {
			console.log("finished loading, setting max id");
			await this.storage.setUpperRangeForList(typeRef, listId, isCustomId ? CUSTOM_MAX_ID : GENERATED_MAX_ID);
		} else await this.storage.setUpperRangeForList(typeRef, listId, getElementId(lastThrow(receivedEntities)));
		await Promise.all(elementsToAdd.map((element) => this.storage.put(element)));
	}
	/**
	* Calculates the new start value for the getElementRange request and the number of elements to read in
	* order to read no duplicate values.
	* @return returns the new start and count value. Important: count can be negative if everything is cached
	*/
	async recalculateRangeRequest(typeRef, listId, start, count, reverse) {
		let allRangeList = await this.storage.getIdsInRange(typeRef, listId);
		let elementsToRead = count;
		let startElementId = start;
		const range = await this.storage.getRangeForList(typeRef, listId);
		if (range == null) return {
			newStart: start,
			newCount: count
		};
		const { lower, upper } = range;
		let indexOfStart = allRangeList.indexOf(start);
		const typeModel = await resolveTypeReference(typeRef);
		const isCustomId = isCustomIdType(typeModel);
		if (!reverse && (isCustomId ? upper === CUSTOM_MAX_ID : upper === GENERATED_MAX_ID) || reverse && (isCustomId ? lower === CUSTOM_MIN_ID : lower === GENERATED_MIN_ID)) elementsToRead = 0;
else if (allRangeList.length === 0) elementsToRead = count;
else if (indexOfStart !== -1) if (reverse) {
			elementsToRead = count - indexOfStart;
			startElementId = allRangeList[0];
		} else {
			elementsToRead = count - (allRangeList.length - 1 - indexOfStart);
			startElementId = allRangeList[allRangeList.length - 1];
		}
else if (lower === start || firstBiggerThanSecond(start, lower, typeModel) && firstBiggerThanSecond(allRangeList[0], start, typeModel)) {
			if (!reverse) {
				startElementId = allRangeList[allRangeList.length - 1];
				elementsToRead = count - allRangeList.length;
			}
		} else if (upper === start || firstBiggerThanSecond(start, allRangeList[allRangeList.length - 1], typeModel) && firstBiggerThanSecond(upper, start, typeModel)) {
			if (reverse) {
				startElementId = allRangeList[0];
				elementsToRead = count - allRangeList.length;
			}
		}
		return {
			newStart: startElementId,
			newCount: elementsToRead
		};
	}
	/**
	* Resolves when the entity is loaded from the server if necessary
	* @pre The last call of this function must be resolved. This is needed to avoid that e.g. while
	* loading a created instance from the server we receive an update of that instance and ignore it because the instance is not in the cache yet.
	*
	* @return Promise, which resolves to the array of valid events (if response is NotFound or NotAuthorized we filter it out)
	*/
	async entityEventsReceived(batch) {
		await this.recordSyncTime();
		const createUpdatesForLETs = [];
		const regularUpdates = [];
		const updatesArray = batch.events;
		for (const update of updatesArray) {
			const typeRef = new TypeRef(update.application, update.type);
			if (update.application === "monitor") continue;
			if (update.operation === OperationType.CREATE && getUpdateInstanceId(update).instanceListId != null && !isSameTypeRef(typeRef, MailTypeRef) && !isSameTypeRef(typeRef, MailSetEntryTypeRef)) createUpdatesForLETs.push(update);
else regularUpdates.push(update);
		}
		const createUpdatesForLETsPerList = groupBy(createUpdatesForLETs, (update) => update.instanceListId);
		const postMultipleEventUpdates = [];
		for (let [instanceListId, updates] of createUpdatesForLETsPerList) {
			const firstUpdate = updates[0];
			const typeRef = new TypeRef(firstUpdate.application, firstUpdate.type);
			const ids = updates.map((update) => update.instanceId);
			const customHandler = this.storage.getCustomCacheHandlerMap(this.entityRestClient).get(typeRef);
			const idsInCacheRange = customHandler && customHandler.getElementIdsInCacheRange ? await customHandler.getElementIdsInCacheRange(this.storage, instanceListId, ids) : await this.getElementIdsInCacheRange(typeRef, instanceListId, ids);
			if (idsInCacheRange.length === 0) postMultipleEventUpdates.push(updates);
else {
				const updatesNotInCacheRange = idsInCacheRange.length === updates.length ? [] : updates.filter((update) => !idsInCacheRange.includes(update.instanceId));
				try {
					const returnedInstances = await this._loadMultiple(typeRef, instanceListId, idsInCacheRange, undefined, { cacheMode: CacheMode.WriteOnly });
					if (returnedInstances.length !== idsInCacheRange.length) {
						const returnedIds = returnedInstances.map((instance) => getElementId(instance));
						postMultipleEventUpdates.push(updates.filter((update) => returnedIds.includes(update.instanceId)).concat(updatesNotInCacheRange));
					} else postMultipleEventUpdates.push(updates);
				} catch (e) {
					if (e instanceof NotAuthorizedError) postMultipleEventUpdates.push(updatesNotInCacheRange);
else throw e;
				}
			}
		}
		const otherEventUpdates = [];
		for (let update of regularUpdates) {
			const { operation, type, application } = update;
			const { instanceListId, instanceId } = getUpdateInstanceId(update);
			const typeRef = new TypeRef(application, type);
			switch (operation) {
				case OperationType.UPDATE: {
					const handledUpdate = await this.processUpdateEvent(typeRef, update);
					if (handledUpdate) otherEventUpdates.push(handledUpdate);
					break;
				}
				case OperationType.DELETE: {
					if (isSameTypeRef(MailSetEntryTypeRef, typeRef) && containsEventOfType(updatesArray, OperationType.CREATE, instanceId)) {} else if (isSameTypeRef(MailTypeRef, typeRef)) {
						const mail = await this.storage.get(MailTypeRef, instanceListId, instanceId);
						await this.storage.deleteIfExists(typeRef, instanceListId, instanceId);
						if (mail?.mailDetails != null) await this.storage.deleteIfExists(MailDetailsBlobTypeRef, mail.mailDetails[0], mail.mailDetails[1]);
					} else await this.storage.deleteIfExists(typeRef, instanceListId, instanceId);
					otherEventUpdates.push(update);
					break;
				}
				case OperationType.CREATE: {
					const handledUpdate = await this.processCreateEvent(typeRef, update, updatesArray);
					if (handledUpdate) otherEventUpdates.push(handledUpdate);
					break;
				}
				default: throw new ProgrammingError("Unknown operation type: " + operation);
			}
		}
		await this.storage.putLastBatchIdForGroup(batch.groupId, batch.batchId);
		return otherEventUpdates.concat(postMultipleEventUpdates.flat());
	}
	/** Returns {null} when the update should be skipped. */
	async processCreateEvent(typeRef, update, batch) {
		const { instanceId, instanceListId } = getUpdateInstanceId(update);
		if (instanceListId != null) {
			const deleteEvent = getEventOfType(batch, OperationType.DELETE, instanceId);
			const mailSetEntry = deleteEvent && isSameTypeRef(MailSetEntryTypeRef, typeRef) ? await this.storage.get(MailSetEntryTypeRef, deleteEvent.instanceListId, instanceId) : null;
			if (deleteEvent != null && mailSetEntry != null) {
				await this.storage.deleteIfExists(typeRef, deleteEvent.instanceListId, instanceId);
				await this.updateListIdOfMailSetEntryAndUpdateCache(mailSetEntry, instanceListId, instanceId);
				return update;
			} else {
				const shouldLoad = await this.storage.getCustomCacheHandlerMap(this.entityRestClient).get(typeRef)?.shouldLoadOnCreateEvent?.(update) ?? await this.storage.isElementIdInCacheRange(typeRef, instanceListId, instanceId);
				if (shouldLoad) {
					console.log("downloading create event for", getTypeId(typeRef), instanceListId, instanceId);
					return this.entityRestClient.load(typeRef, [instanceListId, instanceId]).then((entity) => this.storage.put(entity)).then(() => update).catch((e) => {
						if (isExpectedErrorForSynchronization(e)) return null;
else throw e;
					});
				} else return update;
			}
		} else return update;
	}
	/**
	* Updates the given mailSetEntry with the new list id and add it to the cache.
	*/
	async updateListIdOfMailSetEntryAndUpdateCache(mailSetEntry, newListId, elementId) {
		mailSetEntry._id = [newListId, elementId];
		await this.storage.put(mailSetEntry);
	}
	/** Returns {null} when the update should be skipped. */
	async processUpdateEvent(typeRef, update) {
		const { instanceId, instanceListId } = getUpdateInstanceId(update);
		const cached = await this.storage.get(typeRef, instanceListId, instanceId);
		if (cached != null) try {
			const newEntity = await this.entityRestClient.load(typeRef, collapseId(instanceListId, instanceId));
			if (isSameTypeRef(typeRef, UserTypeRef)) await this.handleUpdatedUser(cached, newEntity);
			await this.storage.put(newEntity);
			return update;
		} catch (e) {
			if (isExpectedErrorForSynchronization(e)) {
				console.log(`Instance not found when processing update for ${JSON.stringify(update)}, deleting from the cache.`);
				await this.storage.deleteIfExists(typeRef, instanceListId, instanceId);
				return null;
			} else throw e;
		}
		return update;
	}
	async handleUpdatedUser(cached, newEntity) {
		const oldUser = cached;
		if (oldUser._id !== this.storage.getUserId()) return;
		const newUser = newEntity;
		const removedShips = difference(oldUser.memberships, newUser.memberships, (l, r) => l._id === r._id);
		for (const ship of removedShips) {
			console.log("Lost membership on ", ship._id, ship.groupType);
			await this.storage.deleteAllOwnedBy(ship.group);
		}
	}
	/**
	*
	* @returns {Array<Id>} the ids that are in cache range and therefore should be cached
	*/
	async getElementIdsInCacheRange(typeRef, listId, ids) {
		const ret = [];
		for (let i = 0; i < ids.length; i++) if (await this.storage.isElementIdInCacheRange(typeRef, listId, ids[i])) ret.push(ids[i]);
		return ret;
	}
	/**
	* Check if the given request should use the cache
	* @param typeRef typeref of the type
	* @param opts entity rest client options, if any
	* @return true if the cache can be used, false if a direct network request should be performed
	*/
	shouldUseCache(typeRef, opts) {
		if (isIgnoredType(typeRef)) return false;
		return opts?.queryParams?.version == null;
	}
};
/**
* Returns whether the error is expected for the cases where our local state might not be up-to-date with the server yet. E.g. we might be processing an update
* for the instance that was already deleted. Normally this would be optimized away but it might still happen due to timing.
*/
function isExpectedErrorForSynchronization(e) {
	return e instanceof NotFoundError || e instanceof NotAuthorizedError;
}
function expandId(id) {
	if (typeof id === "string") return {
		listId: null,
		elementId: id
	};
else {
		const [listId, elementId] = id;
		return {
			listId,
			elementId
		};
	}
}
function collapseId(listId, elementId) {
	if (listId != null) return [listId, elementId];
else return elementId;
}
function getUpdateInstanceId(update) {
	let instanceListId;
	if (update.instanceListId === "") instanceListId = null;
else instanceListId = update.instanceListId;
	return {
		instanceListId,
		instanceId: update.instanceId
	};
}
/**
* Check if a range request begins inside an existing range
*/
function isStartIdWithinRange(range, startId, typeModel) {
	return !firstBiggerThanSecond(startId, range.upper, typeModel) && !firstBiggerThanSecond(range.lower, startId, typeModel);
}
/**
* Check if a range request is going away from an existing range
* Assumes that the range request doesn't start inside the range
*/
function isRangeRequestAwayFromExistingRange(range, reverse, start, typeModel) {
	return reverse ? firstBiggerThanSecond(range.lower, start, typeModel) : firstBiggerThanSecond(start, range.upper, typeModel);
}
/**
* some types are completely ignored by the cache and always served from a request.
* Note:
* isCachedRangeType(ref) ---> !isIgnoredType(ref) but
* isIgnoredType(ref) -/-> !isCachedRangeType(ref) because of opted-in CustomId types.
*/
function isIgnoredType(typeRef) {
	return typeRef.app === "monitor" || IGNORED_TYPES.some((ref) => isSameTypeRef(typeRef, ref));
}
/**
* Checks if for the given type, that contains a customId,  caching is enabled.
*/
function isCachableCustomIdType(typeRef) {
	return CACHEABLE_CUSTOMID_TYPES.some((ref) => isSameTypeRef(typeRef, ref));
}
/**
* Ranges for customId types are normally not cached, but some are opted in.
* Note:
* isCachedRangeType(ref) ---> !isIgnoredType(ref) but
* isIgnoredType(ref) -/-> !isCachedRangeType(ref)
*/
function isCachedRangeType(typeModel, typeRef) {
	return !isIgnoredType(typeRef) && isGeneratedIdType(typeModel) || isCachableCustomIdType(typeRef);
}
function isGeneratedIdType(typeModel) {
	return typeModel.values._id.type === ValueType.GeneratedId;
}

//#endregion
//#region src/common/api/worker/rest/EntityRestClient.ts
assertWorkerOrNode();
function typeRefToPath(typeRef) {
	return `/rest/${typeRef.app}/${typeRef.type.toLowerCase()}`;
}
let CacheMode = function(CacheMode$1) {
	/** Prefer cached value if it's there, or fall back to network and write it to cache. */
	CacheMode$1[CacheMode$1["ReadAndWrite"] = 0] = "ReadAndWrite";
	/**
	* Always retrieve from the network, but still save to cache.
	*
	* NOTE: This cannot be used with ranged requests.
	*/
	CacheMode$1[CacheMode$1["WriteOnly"] = 1] = "WriteOnly";
	/** Prefer cached value, but in case of a cache miss, retrieve the value from network without writing it to cache. */
	CacheMode$1[CacheMode$1["ReadOnly"] = 2] = "ReadOnly";
	return CacheMode$1;
}({});
function getCacheModeBehavior(cacheMode) {
	switch (cacheMode ?? CacheMode.ReadAndWrite) {
		case CacheMode.ReadAndWrite: return {
			readsFromCache: true,
			writesToCache: true
		};
		case CacheMode.WriteOnly: return {
			readsFromCache: false,
			writesToCache: true
		};
		case CacheMode.ReadOnly: return {
			readsFromCache: true,
			writesToCache: false
		};
	}
}
var EntityRestClient = class {
	get _crypto() {
		return this.lazyCrypto();
	}
	constructor(authDataProvider, restClient, lazyCrypto, instanceMapper, blobAccessTokenFacade) {
		this.authDataProvider = authDataProvider;
		this.restClient = restClient;
		this.lazyCrypto = lazyCrypto;
		this.instanceMapper = instanceMapper;
		this.blobAccessTokenFacade = blobAccessTokenFacade;
	}
	async load(typeRef, id, opts = {}) {
		const { listId, elementId } = expandId(id);
		const { path, queryParams, headers, typeModel } = await this._validateAndPrepareRestRequest(typeRef, listId, elementId, opts.queryParams, opts.extraHeaders, opts.ownerKeyProvider);
		const json = await this.restClient.request(path, HttpMethod.GET, {
			queryParams,
			headers,
			responseType: MediaType.Json,
			baseUrl: opts.baseUrl
		});
		const entity = JSON.parse(json);
		const migratedEntity = await this._crypto.applyMigrations(typeRef, entity);
		const sessionKey = await this.resolveSessionKey(opts.ownerKeyProvider, migratedEntity, typeModel);
		const instance = await this.instanceMapper.decryptAndMapToInstance(typeModel, migratedEntity, sessionKey);
		return this._crypto.applyMigrationsForInstance(instance);
	}
	async resolveSessionKey(ownerKeyProvider, migratedEntity, typeModel) {
		try {
			if (ownerKeyProvider && migratedEntity._ownerEncSessionKey) {
				const ownerKey = await ownerKeyProvider(parseKeyVersion(migratedEntity._ownerKeyVersion ?? 0));
				return this._crypto.resolveSessionKeyWithOwnerKey(migratedEntity, ownerKey);
			} else return await this._crypto.resolveSessionKey(typeModel, migratedEntity);
		} catch (e) {
			if (e instanceof SessionKeyNotFoundError) {
				console.log(`could not resolve session key for instance of type ${typeModel.app}/${typeModel.name}`, e);
				return null;
			} else throw e;
		}
	}
	async loadRange(typeRef, listId, start, count, reverse, opts = {}) {
		const rangeRequestParams = {
			start: String(start),
			count: String(count),
			reverse: String(reverse)
		};
		const { path, headers, typeModel, queryParams } = await this._validateAndPrepareRestRequest(typeRef, listId, null, Object.assign(rangeRequestParams, opts.queryParams), opts.extraHeaders, opts.ownerKeyProvider);
		if (typeModel.type !== Type.ListElement) throw new Error("only ListElement types are permitted");
		const json = await this.restClient.request(path, HttpMethod.GET, {
			queryParams,
			headers,
			responseType: MediaType.Json,
			baseUrl: opts.baseUrl,
			suspensionBehavior: opts.suspensionBehavior
		});
		return this._handleLoadMultipleResult(typeRef, JSON.parse(json));
	}
	async loadMultiple(typeRef, listId, elementIds, ownerEncSessionKeyProvider, opts = {}) {
		const { path, headers } = await this._validateAndPrepareRestRequest(typeRef, listId, null, opts.queryParams, opts.extraHeaders, opts.ownerKeyProvider);
		const idChunks = splitInChunks(LOAD_MULTIPLE_LIMIT, elementIds);
		const typeModel = await resolveTypeReference(typeRef);
		const loadedChunks = await pMap(idChunks, async (idChunk) => {
			let queryParams = { ids: idChunk.join(",") };
			let json;
			if (typeModel.type === Type.BlobElement) json = await this.loadMultipleBlobElements(listId, queryParams, headers, path, typeRef, opts.suspensionBehavior);
else json = await this.restClient.request(path, HttpMethod.GET, {
				queryParams,
				headers,
				responseType: MediaType.Json,
				baseUrl: opts.baseUrl,
				suspensionBehavior: opts.suspensionBehavior
			});
			return this._handleLoadMultipleResult(typeRef, JSON.parse(json), ownerEncSessionKeyProvider);
		});
		return loadedChunks.flat();
	}
	async loadMultipleBlobElements(archiveId, queryParams, headers, path, typeRef, suspensionBehavior) {
		if (archiveId == null) throw new Error("archiveId must be set to load BlobElementTypes");
		const doBlobRequest = async () => {
			const blobServerAccessInfo = await this.blobAccessTokenFacade.requestReadTokenArchive(archiveId);
			const additionalRequestParams = Object.assign({}, headers, queryParams);
			const allParams = await this.blobAccessTokenFacade.createQueryParams(blobServerAccessInfo, additionalRequestParams, typeRef);
			return tryServers(blobServerAccessInfo.servers, async (serverUrl) => this.restClient.request(path, HttpMethod.GET, {
				queryParams: allParams,
				headers: {},
				responseType: MediaType.Json,
				baseUrl: serverUrl,
				noCORS: true,
				suspensionBehavior
			}), `can't load instances from server `);
		};
		const doEvictToken = () => this.blobAccessTokenFacade.evictArchiveToken(archiveId);
		return doBlobRequestWithRetry(doBlobRequest, doEvictToken);
	}
	async _handleLoadMultipleResult(typeRef, loadedEntities, ownerEncSessionKeyProvider) {
		const model = await resolveTypeReference(typeRef);
		if (isSameTypeRef(typeRef, PushIdentifierTypeRef)) await pMap(loadedEntities, (instance) => this._crypto.applyMigrations(typeRef, instance), { concurrency: 5 });
		return pMap(loadedEntities, (instance) => {
			return this._decryptMapAndMigrate(instance, model, ownerEncSessionKeyProvider);
		}, { concurrency: 5 });
	}
	async _decryptMapAndMigrate(instance, model, ownerEncSessionKeyProvider) {
		let sessionKey;
		if (ownerEncSessionKeyProvider) sessionKey = await this._crypto.decryptSessionKey(instance, await ownerEncSessionKeyProvider(getElementId(instance)));
else try {
			sessionKey = await this._crypto.resolveSessionKey(model, instance);
		} catch (e) {
			if (e instanceof SessionKeyNotFoundError) {
				console.log("could not resolve session key", e, e.message, e.stack);
				sessionKey = null;
			} else throw e;
		}
		const decryptedInstance = await this.instanceMapper.decryptAndMapToInstance(model, instance, sessionKey);
		return this._crypto.applyMigrationsForInstance(decryptedInstance);
	}
	async setup(listId, instance, extraHeaders, options) {
		const typeRef = instance._type;
		const { typeModel, path, headers, queryParams } = await this._validateAndPrepareRestRequest(typeRef, listId, null, undefined, extraHeaders, options?.ownerKey);
		if (typeModel.type === Type.ListElement) {
			if (!listId) throw new Error("List id must be defined for LETs");
		} else if (listId) throw new Error("List id must not be defined for ETs");
		const sk = await this._crypto.setNewOwnerEncSessionKey(typeModel, instance, options?.ownerKey);
		const encryptedEntity = await this.instanceMapper.encryptAndMapToLiteral(typeModel, instance, sk);
		const persistencePostReturn = await this.restClient.request(path, HttpMethod.POST, {
			baseUrl: options?.baseUrl,
			queryParams,
			headers,
			body: JSON.stringify(encryptedEntity),
			responseType: MediaType.Json
		});
		return JSON.parse(persistencePostReturn).generatedId;
	}
	async setupMultiple(listId, instances) {
		const count = instances.length;
		if (count < 1) return [];
		const instanceChunks = splitInChunks(POST_MULTIPLE_LIMIT, instances);
		const typeRef = instances[0]._type;
		const { typeModel, path, headers } = await this._validateAndPrepareRestRequest(typeRef, listId, null, undefined, undefined, undefined);
		if (typeModel.type === Type.ListElement) {
			if (!listId) throw new Error("List id must be defined for LETs");
		} else if (listId) throw new Error("List id must not be defined for ETs");
		const errors = [];
		const failedInstances = [];
		const idChunks = await pMap(instanceChunks, async (instanceChunk) => {
			try {
				const encryptedEntities = await pMap(instanceChunk, async (e) => {
					const sk = await this._crypto.setNewOwnerEncSessionKey(typeModel, e);
					return this.instanceMapper.encryptAndMapToLiteral(typeModel, e, sk);
				});
				const queryParams = { count: String(instanceChunk.length) };
				const persistencePostReturn = await this.restClient.request(path, HttpMethod.POST, {
					queryParams,
					headers,
					body: JSON.stringify(encryptedEntities),
					responseType: MediaType.Json
				});
				return this.parseSetupMultiple(persistencePostReturn);
			} catch (e) {
				if (e instanceof PayloadTooLargeError) {
					const returnedIds = await pMap(instanceChunk, (instance) => {
						return this.setup(listId, instance).catch((e$1) => {
							errors.push(e$1);
							failedInstances.push(instance);
						});
					});
					return returnedIds.filter(Boolean);
				} else {
					errors.push(e);
					failedInstances.push(...instanceChunk);
					return [];
				}
			}
		});
		if (errors.length) {
			if (errors.some(isOfflineError)) throw new ConnectionError("Setup multiple entities failed");
			throw new SetupMultipleError("Setup multiple entities failed", errors, failedInstances);
		} else return idChunks.flat();
	}
	async update(instance, options) {
		if (!instance._id) throw new Error("Id must be defined");
		const { listId, elementId } = expandId(instance._id);
		const { path, queryParams, headers, typeModel } = await this._validateAndPrepareRestRequest(instance._type, listId, elementId, undefined, undefined, options?.ownerKeyProvider);
		const sessionKey = await this.resolveSessionKey(options?.ownerKeyProvider, instance, typeModel);
		const encryptedEntity = await this.instanceMapper.encryptAndMapToLiteral(typeModel, instance, sessionKey);
		await this.restClient.request(path, HttpMethod.PUT, {
			baseUrl: options?.baseUrl,
			queryParams,
			headers,
			body: JSON.stringify(encryptedEntity),
			responseType: MediaType.Json
		});
	}
	async erase(instance, options) {
		const { listId, elementId } = expandId(instance._id);
		const { path, queryParams, headers } = await this._validateAndPrepareRestRequest(instance._type, listId, elementId, undefined, options?.extraHeaders, undefined);
		await this.restClient.request(path, HttpMethod.DELETE, {
			queryParams,
			headers
		});
	}
	async _validateAndPrepareRestRequest(typeRef, listId, elementId, queryParams, extraHeaders, ownerKey) {
		const typeModel = await resolveTypeReference(typeRef);
		_verifyType(typeModel);
		if (ownerKey == undefined && !this.authDataProvider.isFullyLoggedIn() && typeModel.encrypted) throw new LoginIncompleteError(`Trying to do a network request with encrypted entity but is not fully logged in yet, type: ${typeModel.name}`);
		let path = typeRefToPath(typeRef);
		if (listId) path += "/" + listId;
		if (elementId) path += "/" + elementId;
		const headers = Object.assign({}, this.authDataProvider.createAuthHeaders(), extraHeaders);
		if (Object.keys(headers).length === 0) throw new NotAuthenticatedError("user must be authenticated for entity requests");
		headers.v = typeModel.version;
		return {
			path,
			queryParams,
			headers,
			typeModel
		};
	}
	/**
	* for the admin area (no cache available)
	*/
	entityEventsReceived(batch) {
		return Promise.resolve(batch.events);
	}
	getRestClient() {
		return this.restClient;
	}
	parseSetupMultiple(result) {
		try {
			return JSON.parse(result).map((r) => r.generatedId);
		} catch (e) {
			throw new Error(`Invalid response: ${result}, ${e}`);
		}
	}
};
async function tryServers(servers, mapper, errorMsg) {
	let index = 0;
	let error = null;
	for (const server of servers) {
		try {
			return await mapper(server.url, index);
		} catch (e) {
			if (e instanceof ConnectionError || e instanceof InternalServerError || e instanceof NotFoundError) {
				console.log(`${errorMsg} ${server.url}`, e);
				error = e;
			} else throw e;
		}
		index++;
	}
	throw error;
}
async function doBlobRequestWithRetry(doBlobRequest, doEvictTokenBeforeRetry) {
	return doBlobRequest().catch(
		// in case one of the chunks could not be uploaded because of an invalid/expired token we upload all chunks again in order to guarantee that they are uploaded to the same archive.
		// we don't have to take care of already uploaded chunks, as they are unreferenced and will be cleaned up by the server automatically.
		ofClass(NotAuthorizedError, (e) => {
			doEvictTokenBeforeRetry();
			return doBlobRequest();
		})
);
}

//#endregion
export { CacheMode, ConnectMode, CustomCacheHandlerMap, DefaultEntityRestCache, EntityRestClient, EventBusClient, OfflineStorage, WebWorkerTransport, WsConnectionState, bootstrapWorker, customIdToBase64Url, decode, doBlobRequestWithRetry, ensureBase64Ext, expandId, tryServers, typeRefToPath };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW50aXR5UmVzdENsaWVudC1jaHVuay5qcyIsIm5hbWVzIjpbInByb2dyZXNzVHJhY2tlcjogRXhwb3NlZFByb2dyZXNzVHJhY2tlciIsInRvdGFsV29yazogbnVtYmVyIiwiYW1vdW50OiBudW1iZXIiLCJ0b3RhbEFtb3VudDogbnVtYmVyIiwid29ya2VyOiBXb3JrZXIgfCBEZWRpY2F0ZWRXb3JrZXJHbG9iYWxTY29wZSIsIm1lc3NhZ2U6IE1lc3NhZ2U8T3V0Z29pbmdDb21tYW5kVHlwZT4iLCJoYW5kbGVyOiAobWVzc2FnZTogTWVzc2FnZTxJbmNvbWluZ0NvbW1hbmRUeXBlPikgPT4gdW5rbm93biIsImV2OiBhbnkiLCJsb2NhdG9yOiBDb21tb25Mb2NhdG9yIiwiZTogYW55IiwibXNnOiBhbnkiLCJtZXNzYWdlOiBNYWluUmVxdWVzdCIsIm1zZzogUmVxdWVzdDxXb3JrZXJSZXF1ZXN0VHlwZT4iLCJlbnRyb3B5OiBBcnJheTxFbnRyb3B5RGF0YUNodW5rPiIsImxpc3RlbmVyOiBFdmVudEJ1c0xpc3RlbmVyIiwiY2FjaGU6IEVudGl0eVJlc3RDYWNoZSIsInVzZXJGYWNhZGU6IFVzZXJGYWNhZGUiLCJlbnRpdHk6IEVudGl0eUNsaWVudCIsImluc3RhbmNlTWFwcGVyOiBJbnN0YW5jZU1hcHBlciIsInNvY2tldEZhY3Rvcnk6IChwYXRoOiBzdHJpbmcpID0+IFdlYlNvY2tldCIsInNsZWVwRGV0ZWN0b3I6IFNsZWVwRGV0ZWN0b3IiLCJwcm9ncmVzc1RyYWNrZXI6IEV4cG9zZWRQcm9ncmVzc1RyYWNrZXIiLCJjb25uZWN0TW9kZTogQ29ubmVjdE1vZGUiLCJzeXNNb2RlbEluZm8iLCJ0dXRhbm90YU1vZGVsSW5mbyIsImV2ZW50OiBDbG9zZUV2ZW50IiwiZXJyb3I6IGFueSIsIm1lc3NhZ2U6IE1lc3NhZ2VFdmVudDxzdHJpbmc+IiwiY2xvc2VPcHRpb246IENsb3NlRXZlbnRCdXNPcHRpb24iLCJjbG9zZUlmT3BlbjogYm9vbGVhbiIsImVuYWJsZUF1dG9tYXRpY1N0YXRlOiBib29sZWFuIiwiZGVsYXk6IG51bWJlciB8IG51bGwiLCJkZWxheSIsImNvdW50ZXJEYXRhOiBXZWJzb2NrZXRDb3VudGVyRGF0YSIsImRhdGE6IFBoaXNoaW5nTWFya2VyV2Vic29ja2V0RGF0YSIsImRhdGE6IFdlYnNvY2tldExlYWRlclN0YXR1cyIsImV2ZW50QmF0Y2g6IEVudGl0eVVwZGF0ZVtdIiwicmVjb25uZWN0aW9uSW50ZXJ2YWw6IHJlYWRvbmx5IFtudW1iZXIsIG51bWJlcl0iLCJsYXN0SWRzOiBNYXA8SWQsIEFycmF5PElkPj4iLCJldmVudFF1ZXVlOiBFdmVudFF1ZXVlIiwiZXZlbnRCYXRjaGVzOiBFbnRpdHlFdmVudEJhdGNoW10iLCJncm91cElkOiBJZCIsIm1vZGlmaWNhdGlvbjogUXVldWVkQmF0Y2giLCJiYXRjaDogUXVldWVkQmF0Y2giLCJiYXRjaElkOiBJZCIsImV2ZW50czogUmVhZG9ubHlBcnJheTxFbnRpdHlVcGRhdGU+IiwiVHlwZSIsImJ1ZiIsInVpOGEiLCJoYW5kbGVyczogTWFwPHN0cmluZywgQ3VzdG9tQ2FjaGVIYW5kbGVyPExpc3RFbGVtZW50RW50aXR5Pj4iLCJ0eXBlUmVmOiBUeXBlUmVmPFQ+IiwiZW50aXR5UmVzdENsaWVudDogRW50aXR5UmVzdENsaWVudCIsInN0b3JhZ2U6IENhY2hlU3RvcmFnZSIsImxpc3RJZDogSWQiLCJzdGFydDogSWQiLCJjb3VudDogbnVtYmVyIiwicmV2ZXJzZTogYm9vbGVhbiIsInJhd0xpc3Q6IEFycmF5PENhbGVuZGFyRXZlbnQ+IiwiY2h1bms6IEFycmF5PENhbGVuZGFyRXZlbnQ+IiwicmFuZ2U6IFJhbmdlIiwiaWRzOiBBcnJheTxJZD4iLCJwYXJhbTogU3FsVmFsdWUiLCJ0YWdnZWQ6IFJlY29yZDxzdHJpbmcsIFRhZ2dlZFNxbFZhbHVlPiIsInA6IFRhZ2dlZFNxbFZhbHVlIiwicXVlcnlQYXJ0czogVGVtcGxhdGVTdHJpbmdzQXJyYXkiLCJwYXJhbXM6IFRhZ2dlZFNxbFZhbHVlW10iLCJpOiBudW1iZXIiLCJ0ZXh0OiBzdHJpbmciLCJwYXJhbXM6IFNxbFZhbHVlW10iLCJkYXRhOiBEYXRlIiwidHlwOiBzdHJpbmciLCJvcHRpb25zOiBFbmNvZGVPcHRpb25zIiwiVHlwZSIsImJ5dGVzOiBudW1iZXIiLCJjdXN0b21UeXBlRW5jb2RlcnM6IHsgW3R5cGVOYW1lOiBzdHJpbmddOiB0eXBlb2YgZGF0ZUVuY29kZXIgfSIsImN1c3RvbVR5cGVEZWNvZGVyczogQXJyYXk8VHlwZURlY29kZXI+IiwidGFnczogQXJyYXk8VHlwZURlY29kZXI+Iiwic3FsQ2lwaGVyRmFjYWRlOiBTcWxDaXBoZXJGYWNhZGUiLCJpbnRlcldpbmRvd0V2ZW50U2VuZGVyOiBJbnRlcldpbmRvd0V2ZW50RmFjYWRlU2VuZERpc3BhdGNoZXIiLCJkYXRlUHJvdmlkZXI6IERhdGVQcm92aWRlciIsIm1pZ3JhdG9yOiBPZmZsaW5lU3RvcmFnZU1pZ3JhdG9yIiwiY2xlYW5lcjogT2ZmbGluZVN0b3JhZ2VDbGVhbmVyIiwidXNlcklkOiBzdHJpbmciLCJkYXRhYmFzZUtleTogVWludDhBcnJheSIsInR5cGVSZWY6IFR5cGVSZWY8U29tZUVudGl0eT4iLCJsaXN0SWQ6IElkIHwgbnVsbCIsImVsZW1lbnRJZDogSWQiLCJ0eXBlTW9kZWw6IFR5cGVNb2RlbCIsIlR5cGVJZCIsInR5cGU6IHN0cmluZyIsInR5cGVSZWY6IFR5cGVSZWY8VD4iLCJsaXN0SWQ6IElkIiwiZWxlbWVudElkczogSWRbXSIsInNlcmlhbGl6ZWRMaXN0OiBSZWFkb25seUFycmF5PFJlY29yZDxzdHJpbmcsIFRhZ2dlZFNxbFZhbHVlPj4iLCJzdGFydDogSWQiLCJjb3VudDogbnVtYmVyIiwicmV2ZXJzZTogYm9vbGVhbiIsIm9yaWdpbmFsRW50aXR5OiBTb21lRW50aXR5IiwiZm9ybWF0dGVkUXVlcnk6IEZvcm1hdHRlZFF1ZXJ5IiwibG93ZXJJZDogSWQiLCJ1cHBlcklkOiBJZCIsImxvd2VyOiBJZCIsInVwcGVyOiBJZCIsImdyb3VwSWQ6IElkIiwiYmF0Y2hJZDogSWQiLCJtczogbnVtYmVyIiwidHlwZVJlZjogVHlwZVJlZjx1bmtub3duPiIsImxpc3RJZDogc3RyaW5nIiwidHlwZVJlZjogVHlwZVJlZjxMaXN0RWxlbWVudEVudGl0eT4iLCJ0eXBlUmVmOiBUeXBlUmVmPEVsZW1lbnRFbnRpdHk+IiwibW9kZWw6IFZlcnNpb25NZXRhZGF0YUJhc2VLZXkiLCJ2ZXJzaW9uOiBudW1iZXIiLCJlbnRpdHlSZXN0Q2xpZW50OiBFbnRpdHlSZXN0Q2xpZW50Iiwib3duZXI6IElkIiwibGlzdElkc0J5VHlwZTogTWFwPHN0cmluZywgU2V0PElkPj4iLCJrZXk6IEsiLCJ2YWx1ZTogT2ZmbGluZURiTWV0YVtLXSIsInRpbWVSYW5nZURheXM6IG51bWJlciB8IG51bGwiLCJ1c2VySWQ6IElkIiwidHlwZVJlZjogVHlwZVJlZjxFbGVtZW50RW50aXR5IHwgTGlzdEVsZW1lbnRFbnRpdHk+IiwiZWxlbWVudElkcyIsInJhd0N1dG9mZklkOiBJZCIsImxvYWRlZDogVWludDhBcnJheSIsImRlc2VyaWFsaXplZDogYW55IiwibG9hZGVkOiBBcnJheTxVaW50OEFycmF5PiIsInJlc3VsdDogQXJyYXk8VD4iLCJjaHVua1NpemU6IG51bWJlciIsIm9yaWdpbmFsTGlzdDogU3FsVmFsdWVbXSIsImZvcm1hdHRlcjogKGNodW5rOiBTcWxWYWx1ZVtdKSA9PiBGb3JtYXR0ZWRRdWVyeSIsInJlc3VsdDogQXJyYXk8UmVjb3JkPHN0cmluZywgVGFnZ2VkU3FsVmFsdWU+PiIsInBhcmFtczogU3FsVmFsdWVbXSIsImVudGl0eVJlc3RDbGllbnQ6IEVudGl0eVJlc3RDbGllbnQiLCJzdG9yYWdlOiBDYWNoZVN0b3JhZ2UiLCJ0eXBlUmVmOiBUeXBlUmVmPFQ+IiwiaWQ6IFByb3BlcnR5VHlwZTxULCBcIl9pZFwiPiIsIm9wdHM6IEVudGl0eVJlc3RDbGllbnRMb2FkT3B0aW9ucyIsImxpc3RJZDogSWQgfCBudWxsIiwiaWRzOiBBcnJheTxJZD4iLCJvd25lckVuY1Nlc3Npb25LZXlQcm92aWRlcj86IE93bmVyRW5jU2Vzc2lvbktleVByb3ZpZGVyIiwiaW5zdGFuY2U6IFQiLCJleHRyYUhlYWRlcnM/OiBEaWN0Iiwib3B0aW9ucz86IEVudGl0eVJlc3RDbGllbnRTZXR1cE9wdGlvbnMiLCJpbnN0YW5jZXM6IEFycmF5PFQ+Iiwib3B0aW9ucz86IEVudGl0eVJlc3RDbGllbnRFcmFzZU9wdGlvbnMiLCJncm91cElkOiBJZCIsImJhdGNoSWQ6IElkIiwibGFzdFVwZGF0ZVRpbWU6IG51bWJlciIsImVsZW1lbnRJZDogSWQiLCJlbnRpdGllc0luQ2FjaGU6IFRbXSIsImlkc1RvTG9hZDogSWRbXSIsImxpc3RJZDogSWQiLCJzdGFydDogSWQiLCJjb3VudDogbnVtYmVyIiwicmV2ZXJzZTogYm9vbGVhbiIsImNvdW50UmVxdWVzdGVkOiBudW1iZXIiLCJ3YXNSZXZlcnNlUmVxdWVzdDogYm9vbGVhbiIsInJlY2VpdmVkRW50aXRpZXM6IFRbXSIsImJhdGNoOiBRdWV1ZWRCYXRjaCIsImNyZWF0ZVVwZGF0ZXNGb3JMRVRzOiBFbnRpdHlVcGRhdGVbXSIsInJlZ3VsYXJVcGRhdGVzOiBFbnRpdHlVcGRhdGVbXSIsInBvc3RNdWx0aXBsZUV2ZW50VXBkYXRlczogRW50aXR5VXBkYXRlW11bXSIsIm90aGVyRXZlbnRVcGRhdGVzOiBFbnRpdHlVcGRhdGVbXSIsInR5cGVSZWY6IFR5cGVSZWY8YW55PiIsInVwZGF0ZTogRW50aXR5VXBkYXRlIiwiYmF0Y2g6IFJlYWRvbmx5QXJyYXk8RW50aXR5VXBkYXRlPiIsIm1haWxTZXRFbnRyeTogTWFpbFNldEVudHJ5IiwibmV3TGlzdElkOiBJZCIsInR5cGVSZWY6IFR5cGVSZWY8U29tZUVudGl0eT4iLCJjYWNoZWQ6IFNvbWVFbnRpdHkiLCJuZXdFbnRpdHk6IFNvbWVFbnRpdHkiLCJpZHM6IElkW10iLCJyZXQ6IElkW10iLCJvcHRzPzogRW50aXR5UmVzdENsaWVudExvYWRPcHRpb25zIiwiZTogRXJyb3IiLCJpZDogSWQgfCBJZFR1cGxlIiwicmFuZ2U6IFJhbmdlIiwic3RhcnRJZDogSWQiLCJ0eXBlTW9kZWw6IFR5cGVNb2RlbCIsInN0YXJ0OiBzdHJpbmciLCJ0eXBlUmVmOiBUeXBlUmVmPHVua25vd24+IiwidHlwZVJlZjogVHlwZVJlZjxhbnk+IiwiY2FjaGVNb2RlOiBDYWNoZU1vZGUgfCB1bmRlZmluZWQiLCJhdXRoRGF0YVByb3ZpZGVyOiBBdXRoRGF0YVByb3ZpZGVyIiwicmVzdENsaWVudDogUmVzdENsaWVudCIsImxhenlDcnlwdG86IGxhenk8Q3J5cHRvRmFjYWRlPiIsImluc3RhbmNlTWFwcGVyOiBJbnN0YW5jZU1hcHBlciIsImJsb2JBY2Nlc3NUb2tlbkZhY2FkZTogQmxvYkFjY2Vzc1Rva2VuRmFjYWRlIiwidHlwZVJlZjogVHlwZVJlZjxUPiIsImlkOiBQcm9wZXJ0eVR5cGU8VCwgXCJfaWRcIj4iLCJvcHRzOiBFbnRpdHlSZXN0Q2xpZW50TG9hZE9wdGlvbnMiLCJvd25lcktleVByb3ZpZGVyOiBPd25lcktleVByb3ZpZGVyIHwgdW5kZWZpbmVkIiwibWlncmF0ZWRFbnRpdHk6IFJlY29yZDxzdHJpbmcsIGFueT4iLCJ0eXBlTW9kZWw6IFR5cGVNb2RlbCIsImxpc3RJZDogSWQiLCJzdGFydDogSWQiLCJjb3VudDogbnVtYmVyIiwicmV2ZXJzZTogYm9vbGVhbiIsImxpc3RJZDogSWQgfCBudWxsIiwiZWxlbWVudElkczogQXJyYXk8SWQ+Iiwib3duZXJFbmNTZXNzaW9uS2V5UHJvdmlkZXI/OiBPd25lckVuY1Nlc3Npb25LZXlQcm92aWRlciIsImpzb246IHN0cmluZyIsImFyY2hpdmVJZDogSWQgfCBudWxsIiwicXVlcnlQYXJhbXM6IHsgaWRzOiBzdHJpbmcgfSIsImhlYWRlcnM6IERpY3QgfCB1bmRlZmluZWQiLCJwYXRoOiBzdHJpbmciLCJzdXNwZW5zaW9uQmVoYXZpb3I/OiBTdXNwZW5zaW9uQmVoYXZpb3IiLCJsb2FkZWRFbnRpdGllczogQXJyYXk8YW55PiIsImluc3RhbmNlOiBhbnkiLCJtb2RlbDogVHlwZU1vZGVsIiwic2Vzc2lvbktleTogQWVzS2V5IHwgbnVsbCIsImluc3RhbmNlOiBUIiwiZXh0cmFIZWFkZXJzPzogRGljdCIsIm9wdGlvbnM/OiBFbnRpdHlSZXN0Q2xpZW50U2V0dXBPcHRpb25zIiwiaW5zdGFuY2VzOiBBcnJheTxUPiIsImVycm9yczogRXJyb3JbXSIsImZhaWxlZEluc3RhbmNlczogVFtdIiwiaWRDaHVua3M6IEFycmF5PEFycmF5PElkPj4iLCJlIiwib3B0aW9ucz86IEVudGl0eVJlc3RDbGllbnRVcGRhdGVPcHRpb25zIiwib3B0aW9ucz86IEVudGl0eVJlc3RDbGllbnRFcmFzZU9wdGlvbnMiLCJlbGVtZW50SWQ6IElkIHwgbnVsbCIsInF1ZXJ5UGFyYW1zOiBEaWN0IHwgdW5kZWZpbmVkIiwiZXh0cmFIZWFkZXJzOiBEaWN0IHwgdW5kZWZpbmVkIiwib3duZXJLZXk6IE93bmVyS2V5UHJvdmlkZXIgfCBWZXJzaW9uZWRLZXkgfCB1bmRlZmluZWQiLCJiYXRjaDogUXVldWVkQmF0Y2giLCJyZXN1bHQ6IGFueSIsInI6IGFueSIsInNlcnZlcnM6IEJsb2JTZXJ2ZXJVcmxbXSIsIm1hcHBlcjogTWFwcGVyPHN0cmluZywgVD4iLCJlcnJvck1zZzogc3RyaW5nIiwiZXJyb3I6IEVycm9yIHwgbnVsbCIsImRvQmxvYlJlcXVlc3Q6ICgpID0+IFByb21pc2U8VD4iLCJkb0V2aWN0VG9rZW5CZWZvcmVSZXRyeTogKCkgPT4gdm9pZCJdLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9Qcm9ncmVzc01vbml0b3JEZWxlZ2F0ZS50cyIsIi4uL3NyYy9jb21tb24vYXBpL2NvbW1vbi90aHJlYWRpbmcvVHJhbnNwb3J0LnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvbWFpbi9Xb3JrZXJDbGllbnQudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvRXZlbnRCdXNDbGllbnQudHMiLCIuLi9saWJzL2Nib3JnLmpzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL3Jlc3QvQ3VzdG9tQ2FjaGVIYW5kbGVyLnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL29mZmxpbmUvU3FsVmFsdWUudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9TcWwudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9PZmZsaW5lU3RvcmFnZS50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9yZXN0L0RlZmF1bHRFbnRpdHlSZXN0Q2FjaGUudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvcmVzdC9FbnRpdHlSZXN0Q2xpZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgSVByb2dyZXNzTW9uaXRvciwgUHJvZ3Jlc3NNb25pdG9ySWQgfSBmcm9tIFwiLi4vY29tbW9uL3V0aWxzL1Byb2dyZXNzTW9uaXRvclwiXG5pbXBvcnQgeyBFeHBvc2VkUHJvZ3Jlc3NUcmFja2VyIH0gZnJvbSBcIi4uL21haW4vUHJvZ3Jlc3NUcmFja2VyLmpzXCJcblxuLyoqIEEgd3JhcHBlciB0aGF0IHdpbGwgc2VuZCBjb21wbGV0ZWQgd29yayByZW1vdGVseSAqL1xuZXhwb3J0IGNsYXNzIFByb2dyZXNzTW9uaXRvckRlbGVnYXRlIGltcGxlbWVudHMgSVByb2dyZXNzTW9uaXRvciB7XG5cdHByaXZhdGUgcmVhZG9ubHkgcmVmOiBQcm9taXNlPFByb2dyZXNzTW9uaXRvcklkPlxuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgcHJvZ3Jlc3NUcmFja2VyOiBFeHBvc2VkUHJvZ3Jlc3NUcmFja2VyLCByZWFkb25seSB0b3RhbFdvcms6IG51bWJlcikge1xuXHRcdHRoaXMucmVmID0gcHJvZ3Jlc3NUcmFja2VyLnJlZ2lzdGVyTW9uaXRvcih0b3RhbFdvcmspXG5cdH1cblxuXHRhc3luYyB3b3JrRG9uZShhbW91bnQ6IG51bWJlcikge1xuXHRcdGF3YWl0IHRoaXMucHJvZ3Jlc3NUcmFja2VyLndvcmtEb25lRm9yTW9uaXRvcihhd2FpdCB0aGlzLnJlZiwgYW1vdW50KVxuXHR9XG5cblx0YXN5bmMgdG90YWxXb3JrRG9uZSh0b3RhbEFtb3VudDogbnVtYmVyKSB7XG5cdFx0YXdhaXQgdGhpcy5wcm9ncmVzc1RyYWNrZXIud29ya0RvbmVGb3JNb25pdG9yKGF3YWl0IHRoaXMucmVmLCB0aGlzLnRvdGFsV29yayAtIHRvdGFsQW1vdW50KVxuXHR9XG5cblx0YXN5bmMgY29tcGxldGVkKCkge1xuXHRcdGF3YWl0IHRoaXMucHJvZ3Jlc3NUcmFja2VyLndvcmtEb25lRm9yTW9uaXRvcihhd2FpdCB0aGlzLnJlZiwgdGhpcy50b3RhbFdvcmspXG5cdH1cbn1cbiIsImltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiLi9NZXNzYWdlRGlzcGF0Y2hlci5qc1wiXG5pbXBvcnQgeyBkb3duY2FzdCB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuXG5leHBvcnQgaW50ZXJmYWNlIFRyYW5zcG9ydDxPdXRnb2luZ0NvbW1hbmRUeXBlLCBJbmNvbWluZ0NvbW1hbmRUeXBlPiB7XG5cdC8qKlxuXHQgKiBQb3N0IGEgbWVzc2FnZSB0byB0aGUgb3RoZXIgc2lkZSBvZiB0aGUgdHJhbnNwb3J0XG5cdCAqL1xuXHRwb3N0TWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlPE91dGdvaW5nQ29tbWFuZFR5cGU+KTogdm9pZFxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIGhhbmRsZXIgZm9yIG1lc3NhZ2VzIGNvbWluZyBmcm9tIHRoZSBvdGhlciBlbmQgb2YgdGhlIHRyYW5zcG9ydFxuXHQgKi9cblx0c2V0TWVzc2FnZUhhbmRsZXIoaGFuZGxlcjogKG1lc3NhZ2U6IE1lc3NhZ2U8SW5jb21pbmdDb21tYW5kVHlwZT4pID0+IHVua25vd24pOiB1bmtub3duXG59XG5cbi8qKlxuICogUXVldWUgdHJhbnNwb3J0IGZvciBib3RoIFdvcmtlckNsaWVudCBhbmQgV29ya2VySW1wbFxuICovXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyVHJhbnNwb3J0PE91dGdvaW5nQ29tbWFuZFR5cGUsIEluY29taW5nQ29tbWFuZFR5cGU+IGltcGxlbWVudHMgVHJhbnNwb3J0PE91dGdvaW5nQ29tbWFuZFR5cGUsIEluY29taW5nQ29tbWFuZFR5cGU+IHtcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSB3b3JrZXI6IFdvcmtlciB8IERlZGljYXRlZFdvcmtlckdsb2JhbFNjb3BlKSB7fVxuXG5cdHBvc3RNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2U8T3V0Z29pbmdDb21tYW5kVHlwZT4pOiB2b2lkIHtcblx0XHRyZXR1cm4gdGhpcy53b3JrZXIucG9zdE1lc3NhZ2UobWVzc2FnZSlcblx0fVxuXG5cdHNldE1lc3NhZ2VIYW5kbGVyKGhhbmRsZXI6IChtZXNzYWdlOiBNZXNzYWdlPEluY29taW5nQ29tbWFuZFR5cGU+KSA9PiB1bmtub3duKSB7XG5cdFx0dGhpcy53b3JrZXIub25tZXNzYWdlID0gKGV2OiBhbnkpID0+IGhhbmRsZXIoZG93bmNhc3QoZXYuZGF0YSkpXG5cdH1cbn1cbiIsImltcG9ydCB0eXBlIHsgQ29tbWFuZHMgfSBmcm9tIFwiLi4vY29tbW9uL3RocmVhZGluZy9NZXNzYWdlRGlzcGF0Y2hlci5qc1wiXG5pbXBvcnQgeyBNZXNzYWdlRGlzcGF0Y2hlciwgUmVxdWVzdCB9IGZyb20gXCIuLi9jb21tb24vdGhyZWFkaW5nL01lc3NhZ2VEaXNwYXRjaGVyLmpzXCJcbmltcG9ydCB7IFRyYW5zcG9ydCwgV2ViV29ya2VyVHJhbnNwb3J0IH0gZnJvbSBcIi4uL2NvbW1vbi90aHJlYWRpbmcvVHJhbnNwb3J0LmpzXCJcbmltcG9ydCB7IGFzc2VydE1haW5Pck5vZGUgfSBmcm9tIFwiLi4vY29tbW9uL0VudlwiXG5pbXBvcnQgeyBjbGllbnQgfSBmcm9tIFwiLi4vLi4vbWlzYy9DbGllbnREZXRlY3RvclwiXG5pbXBvcnQgdHlwZSB7IERlZmVycmVkT2JqZWN0IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBkZWZlciwgZG93bmNhc3QgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IGhhbmRsZVVuY2F1Z2h0RXJyb3IgfSBmcm9tIFwiLi4vLi4vbWlzYy9FcnJvckhhbmRsZXJcIlxuaW1wb3J0IHsgRGVsYXllZEltcGxzLCBleHBvc2VMb2NhbERlbGF5ZWQsIGV4cG9zZVJlbW90ZSB9IGZyb20gXCIuLi9jb21tb24vV29ya2VyUHJveHlcIlxuaW1wb3J0IHR5cGUgeyBSZXN0Q2xpZW50IH0gZnJvbSBcIi4uL3dvcmtlci9yZXN0L1Jlc3RDbGllbnRcIlxuaW1wb3J0IHsgRW50cm9weURhdGFDaHVuayB9IGZyb20gXCIuLi93b3JrZXIvZmFjYWRlcy9FbnRyb3B5RmFjYWRlLmpzXCJcbmltcG9ydCB7IG9ialRvRXJyb3IgfSBmcm9tIFwiLi4vY29tbW9uL3V0aWxzL0Vycm9yVXRpbHMuanNcIlxuaW1wb3J0IHsgQ29tbW9uTG9jYXRvciB9IGZyb20gXCIuL0NvbW1vbkxvY2F0b3IuanNcIlxuaW1wb3J0IHsgQ29tbW9uV29ya2VySW50ZXJmYWNlLCBNYWluSW50ZXJmYWNlIH0gZnJvbSBcIi4uL3dvcmtlci93b3JrZXJJbnRlcmZhY2VzLmpzXCJcblxuYXNzZXJ0TWFpbk9yTm9kZSgpXG5cbnR5cGUgUHJvZ3Jlc3NVcGRhdGVyID0gKHByb2dyZXNzOiBudW1iZXIpID0+IHVua25vd25cbnR5cGUgTWFpblJlcXVlc3QgPSBSZXF1ZXN0PE1haW5SZXF1ZXN0VHlwZT5cblxuZXhwb3J0IGNvbnN0IGVudW0gV3NDb25uZWN0aW9uU3RhdGUge1xuXHRjb25uZWN0aW5nLFxuXHRjb25uZWN0ZWQsXG5cdHRlcm1pbmF0ZWQsXG59XG5cbmV4cG9ydCBjbGFzcyBXb3JrZXJDbGllbnQge1xuXHRwcml2YXRlIF9kZWZlcnJlZEluaXRpYWxpemVkOiBEZWZlcnJlZE9iamVjdDx2b2lkPiA9IGRlZmVyKClcblx0cHJpdmF0ZSBfaXNJbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlXG5cblx0cHJpdmF0ZSBfZGlzcGF0Y2hlciE6IE1lc3NhZ2VEaXNwYXRjaGVyPFdvcmtlclJlcXVlc3RUeXBlLCBNYWluUmVxdWVzdFR5cGU+XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5pbml0aWFsaXplZC50aGVuKCgpID0+IHtcblx0XHRcdHRoaXMuX2lzSW5pdGlhbGl6ZWQgPSB0cnVlXG5cdFx0fSlcblx0fVxuXG5cdGdldCBpbml0aWFsaXplZCgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5fZGVmZXJyZWRJbml0aWFsaXplZC5wcm9taXNlXG5cdH1cblxuXHRhc3luYyBpbml0KGxvY2F0b3I6IENvbW1vbkxvY2F0b3IpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoZW52Lm1vZGUgIT09IFwiVGVzdFwiKSB7XG5cdFx0XHRjb25zdCB7IHByZWZpeFdpdGhvdXRGaWxlIH0gPSB3aW5kb3cudHV0YW8uYXBwU3RhdGVcblx0XHRcdC8vIEluIGFwcHMvZGVza3RvcCB3ZSBsb2FkIEhUTUwgZmlsZSBhbmQgdXJsIGVuZHMgb24gcGF0aC9pbmRleC5odG1sIHNvIHdlIHdhbnQgdG8gbG9hZCBwYXRoL1dvcmtlckJvb3RzdHJhcC5qcy5cblx0XHRcdC8vIEluIGJyb3dzZXIgd2UgbG9hZCBhdCBkb21haW4uY29tIG9yIGxvY2FsaG9zdC9wYXRoIChsb2NhbGx5KSBhbmQgd2Ugd2FudCB0byBsb2FkIGRvbWFpbi5jb20vV29ya2VyQm9vdHN0cmFwLmpzIG9yXG5cdFx0XHQvLyBsb2NhbGhvc3QvcGF0aC9Xb3JrZXJCb290c3RyYXAuanMgcmVzcGVjdGl2ZWx5LlxuXHRcdFx0Ly8gU2VydmljZSB3b3JrZXIgaGFzIHNpbWlsYXIgbG9naWMgYnV0IGl0IGhhcyBsdXh1cnkgb2Yga25vd2luZyB0aGF0IGl0J3Mgc2VydmVkIGFzIHN3LmpzLlxuXHRcdFx0Y29uc3Qgd29ya2VyVXJsID0gcHJlZml4V2l0aG91dEZpbGUgKyBcIi93b3JrZXItYm9vdHN0cmFwLmpzXCJcblx0XHRcdGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIod29ya2VyVXJsLCB7IHR5cGU6IFwibW9kdWxlXCIgfSlcblx0XHRcdHRoaXMuX2Rpc3BhdGNoZXIgPSBuZXcgTWVzc2FnZURpc3BhdGNoZXIobmV3IFdlYldvcmtlclRyYW5zcG9ydCh3b3JrZXIpLCB0aGlzLnF1ZXVlQ29tbWFuZHMobG9jYXRvciksIFwibWFpbi13b3JrZXJcIilcblx0XHRcdGF3YWl0IHRoaXMuX2Rpc3BhdGNoZXIucG9zdFJlcXVlc3QobmV3IFJlcXVlc3QoXCJzZXR1cFwiLCBbd2luZG93LmVudiwgdGhpcy5nZXRJbml0aWFsRW50cm9weSgpLCBjbGllbnQuYnJvd3NlckRhdGEoKV0pKVxuXG5cdFx0XHR3b3JrZXIub25lcnJvciA9IChlOiBhbnkpID0+IHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBjb3VsZCBub3Qgc2V0dXAgd29ya2VyOiAke2UubmFtZX0gJHtlLnN0YWNrfSAke2UubWVzc2FnZX0gJHtlfWApXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIG5vZGU6IHdlIGRvIG5vdCB1c2Ugd29ya2VycyBidXQgY29ubmVjdCB0aGUgY2xpZW50IGFuZCB0aGUgd29ya2VyIHF1ZXVlcyBkaXJlY3RseSB3aXRoIGVhY2ggb3RoZXJcblx0XHRcdC8vIGF0dGVudGlvbjogZG8gbm90IGxvYWQgZGlyZWN0bHkgd2l0aCByZXF1aXJlKCkgaGVyZSBiZWNhdXNlIGluIHRoZSBicm93c2VyIFN5c3RlbUpTIHdvdWxkIGxvYWQgdGhlIFdvcmtlckltcGwgaW4gdGhlIGNsaWVudCBhbHRob3VnaCB0aGlzIGNvZGUgaXMgbm90IGV4ZWN1dGVkXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRjb25zdCBXb3JrZXJJbXBsID0gZ2xvYmFsVGhpcy50ZXN0V29ya2VyXG5cdFx0XHRjb25zdCB3b3JrZXJJbXBsID0gbmV3IFdvcmtlckltcGwodGhpcywgdHJ1ZSlcblx0XHRcdGF3YWl0IHdvcmtlckltcGwuaW5pdChjbGllbnQuYnJvd3NlckRhdGEoKSlcblx0XHRcdHdvcmtlckltcGwuX3F1ZXVlLl90cmFuc3BvcnQgPSB7XG5cdFx0XHRcdHBvc3RNZXNzYWdlOiAobXNnOiBhbnkpID0+IHRoaXMuX2Rpc3BhdGNoZXIuaGFuZGxlTWVzc2FnZShtc2cpLFxuXHRcdFx0fVxuXHRcdFx0dGhpcy5fZGlzcGF0Y2hlciA9IG5ldyBNZXNzYWdlRGlzcGF0Y2hlcihcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBvc3RNZXNzYWdlOiBmdW5jdGlvbiAobXNnOiBhbnkpIHtcblx0XHRcdFx0XHRcdHdvcmtlckltcGwuX3F1ZXVlLmhhbmRsZU1lc3NhZ2UobXNnKVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0gYXMgVHJhbnNwb3J0PFdvcmtlclJlcXVlc3RUeXBlLCBNYWluUmVxdWVzdFR5cGU+LFxuXHRcdFx0XHR0aGlzLnF1ZXVlQ29tbWFuZHMobG9jYXRvciksXG5cdFx0XHRcdFwibWFpbi13b3JrZXJcIixcblx0XHRcdClcblx0XHR9XG5cblx0XHR0aGlzLl9kZWZlcnJlZEluaXRpYWxpemVkLnJlc29sdmUoKVxuXHR9XG5cblx0cXVldWVDb21tYW5kcyhsb2NhdG9yOiBDb21tb25Mb2NhdG9yKTogQ29tbWFuZHM8TWFpblJlcXVlc3RUeXBlPiB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGV4ZWNOYXRpdmU6IChtZXNzYWdlOiBNYWluUmVxdWVzdCkgPT4gbG9jYXRvci5uYXRpdmUuaW52b2tlTmF0aXZlKGRvd25jYXN0KG1lc3NhZ2UuYXJnc1swXSksIGRvd25jYXN0KG1lc3NhZ2UuYXJnc1sxXSkpLFxuXHRcdFx0ZXJyb3I6IChtZXNzYWdlOiBNYWluUmVxdWVzdCkgPT4ge1xuXHRcdFx0XHRoYW5kbGVVbmNhdWdodEVycm9yKG9ialRvRXJyb3IobWVzc2FnZS5hcmdzWzBdKSlcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cdFx0XHR9LFxuXHRcdFx0ZmFjYWRlOiBleHBvc2VMb2NhbERlbGF5ZWQ8RGVsYXllZEltcGxzPE1haW5JbnRlcmZhY2U+LCBNYWluUmVxdWVzdFR5cGU+KHtcblx0XHRcdFx0YXN5bmMgbG9naW5MaXN0ZW5lcigpIHtcblx0XHRcdFx0XHRyZXR1cm4gbG9jYXRvci5sb2dpbkxpc3RlbmVyXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFzeW5jIHdzQ29ubmVjdGl2aXR5TGlzdGVuZXIoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGxvY2F0b3IuY29ubmVjdGl2aXR5TW9kZWxcblx0XHRcdFx0fSxcblx0XHRcdFx0YXN5bmMgcHJvZ3Jlc3NUcmFja2VyKCkge1xuXHRcdFx0XHRcdHJldHVybiBsb2NhdG9yLnByb2dyZXNzVHJhY2tlclxuXHRcdFx0XHR9LFxuXHRcdFx0XHRhc3luYyBldmVudENvbnRyb2xsZXIoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGxvY2F0b3IuZXZlbnRDb250cm9sbGVyXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFzeW5jIG9wZXJhdGlvblByb2dyZXNzVHJhY2tlcigpIHtcblx0XHRcdFx0XHRyZXR1cm4gbG9jYXRvci5vcGVyYXRpb25Qcm9ncmVzc1RyYWNrZXJcblx0XHRcdFx0fSxcblx0XHRcdFx0YXN5bmMgaW5mb01lc3NhZ2VIYW5kbGVyKCkge1xuXHRcdFx0XHRcdHJldHVybiBsb2NhdG9yLmluZm9NZXNzYWdlSGFuZGxlclxuXHRcdFx0XHR9LFxuXHRcdFx0fSksXG5cdFx0fVxuXHR9XG5cblx0Z2V0V29ya2VySW50ZXJmYWNlKCk6IENvbW1vbldvcmtlckludGVyZmFjZSB7XG5cdFx0cmV0dXJuIGV4cG9zZVJlbW90ZTxDb21tb25Xb3JrZXJJbnRlcmZhY2U+KGFzeW5jIChyZXF1ZXN0KSA9PiB0aGlzLl9wb3N0UmVxdWVzdChyZXF1ZXN0KSlcblx0fVxuXG5cdHJlc3RSZXF1ZXN0KC4uLmFyZ3M6IFBhcmFtZXRlcnM8UmVzdENsaWVudFtcInJlcXVlc3RcIl0+KTogUHJvbWlzZTxhbnkgfCBudWxsPiB7XG5cdFx0cmV0dXJuIHRoaXMuX3Bvc3RSZXF1ZXN0KG5ldyBSZXF1ZXN0KFwicmVzdFJlcXVlc3RcIiwgYXJncykpXG5cdH1cblxuXHQvKiogQHByaXZhdGUgdmlzaWJsZSBmb3IgdGVzdHMgKi9cblx0YXN5bmMgX3Bvc3RSZXF1ZXN0KG1zZzogUmVxdWVzdDxXb3JrZXJSZXF1ZXN0VHlwZT4pOiBQcm9taXNlPGFueT4ge1xuXHRcdGF3YWl0IHRoaXMuaW5pdGlhbGl6ZWRcblx0XHRyZXR1cm4gdGhpcy5fZGlzcGF0Y2hlci5wb3N0UmVxdWVzdChtc2cpXG5cdH1cblxuXHRyZXNldCgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5fcG9zdFJlcXVlc3QobmV3IFJlcXVlc3QoXCJyZXNldFwiLCBbXSkpXG5cdH1cblxuXHQvKipcblx0ICogQWRkIGRhdGEgZnJvbSBlaXRoZXIgc2VjdXJlIHJhbmRvbSBzb3VyY2Ugb3IgTWF0aC5yYW5kb20gYXMgZW50cm9weS5cblx0ICovXG5cdHByaXZhdGUgZ2V0SW5pdGlhbEVudHJvcHkoKTogQXJyYXk8RW50cm9weURhdGFDaHVuaz4ge1xuXHRcdGNvbnN0IHZhbHVlTGlzdCA9IG5ldyBVaW50MzJBcnJheSgxNilcblx0XHRjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHZhbHVlTGlzdClcblx0XHRjb25zdCBlbnRyb3B5OiBBcnJheTxFbnRyb3B5RGF0YUNodW5rPiA9IFtdXG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlTGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0Ly8gMzIgYmVjYXVzZSB3ZSBoYXZlIDMyLWJpdCB2YWx1ZXMgVWludDMyQXJyYXlcblx0XHRcdGVudHJvcHkucHVzaCh7XG5cdFx0XHRcdHNvdXJjZTogXCJyYW5kb21cIixcblx0XHRcdFx0ZW50cm9weTogMzIsXG5cdFx0XHRcdGRhdGE6IHZhbHVlTGlzdFtpXSxcblx0XHRcdH0pXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGVudHJvcHlcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYm9vdHN0cmFwV29ya2VyKGxvY2F0b3I6IENvbW1vbkxvY2F0b3IpOiBXb3JrZXJDbGllbnQge1xuXHRjb25zdCB3b3JrZXIgPSBuZXcgV29ya2VyQ2xpZW50KClcblx0Y29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpXG5cdHdvcmtlci5pbml0KGxvY2F0b3IpLnRoZW4oKCkgPT4gY29uc29sZS5sb2coXCJ3b3JrZXIgaW5pdCB0aW1lIChtcyk6XCIsIERhdGUubm93KCkgLSBzdGFydCkpXG5cdHJldHVybiB3b3JrZXJcbn1cbiIsImltcG9ydCB7IGFzc2VydFdvcmtlck9yTm9kZSB9IGZyb20gXCIuLi9jb21tb24vRW52XCJcbmltcG9ydCB7XG5cdEFjY2Vzc0Jsb2NrZWRFcnJvcixcblx0QWNjZXNzRGVhY3RpdmF0ZWRFcnJvcixcblx0Q29ubmVjdGlvbkVycm9yLFxuXHRoYW5kbGVSZXN0RXJyb3IsXG5cdE5vdEF1dGhvcml6ZWRFcnJvcixcblx0U2VydmljZVVuYXZhaWxhYmxlRXJyb3IsXG5cdFNlc3Npb25FeHBpcmVkRXJyb3IsXG59IGZyb20gXCIuLi9jb21tb24vZXJyb3IvUmVzdEVycm9yXCJcbmltcG9ydCB7XG5cdGNyZWF0ZVdlYnNvY2tldExlYWRlclN0YXR1cyxcblx0RW50aXR5RXZlbnRCYXRjaCxcblx0RW50aXR5RXZlbnRCYXRjaFR5cGVSZWYsXG5cdEVudGl0eVVwZGF0ZSxcblx0V2Vic29ja2V0Q291bnRlckRhdGEsXG5cdFdlYnNvY2tldENvdW50ZXJEYXRhVHlwZVJlZixcblx0V2Vic29ja2V0RW50aXR5RGF0YSxcblx0V2Vic29ja2V0RW50aXR5RGF0YVR5cGVSZWYsXG5cdFdlYnNvY2tldExlYWRlclN0YXR1cyxcblx0V2Vic29ja2V0TGVhZGVyU3RhdHVzVHlwZVJlZixcbn0gZnJvbSBcIi4uL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBiaW5hcnlTZWFyY2gsIGRlbGF5LCBnZXRUeXBlSWQsIGlkZW50aXR5LCBsYXN0VGhyb3csIG9mQ2xhc3MsIHByb21pc2VGaWx0ZXIsIHJhbmRvbUludEZyb21JbnRlcnZhbCwgVHlwZVJlZiB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgT3V0T2ZTeW5jRXJyb3IgfSBmcm9tIFwiLi4vY29tbW9uL2Vycm9yL091dE9mU3luY0Vycm9yXCJcbmltcG9ydCB7IENsb3NlRXZlbnRCdXNPcHRpb24sIEdyb3VwVHlwZSwgU0VDT05EX01TIH0gZnJvbSBcIi4uL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50c1wiXG5pbXBvcnQgeyBDYW5jZWxsZWRFcnJvciB9IGZyb20gXCIuLi9jb21tb24vZXJyb3IvQ2FuY2VsbGVkRXJyb3JcIlxuaW1wb3J0IHsgRW50aXR5Q2xpZW50IH0gZnJvbSBcIi4uL2NvbW1vbi9FbnRpdHlDbGllbnRcIlxuaW1wb3J0IHR5cGUgeyBRdWV1ZWRCYXRjaCB9IGZyb20gXCIuL0V2ZW50UXVldWUuanNcIlxuaW1wb3J0IHsgRXZlbnRRdWV1ZSB9IGZyb20gXCIuL0V2ZW50UXVldWUuanNcIlxuaW1wb3J0IHsgUHJvZ3Jlc3NNb25pdG9yRGVsZWdhdGUgfSBmcm9tIFwiLi9Qcm9ncmVzc01vbml0b3JEZWxlZ2F0ZVwiXG5pbXBvcnQgeyBjb21wYXJlT2xkZXN0Rmlyc3QsIEdFTkVSQVRFRF9NQVhfSUQsIEdFTkVSQVRFRF9NSU5fSUQsIGdldEVsZW1lbnRJZCwgZ2V0TGlzdElkIH0gZnJvbSBcIi4uL2NvbW1vbi91dGlscy9FbnRpdHlVdGlsc1wiXG5pbXBvcnQgeyBJbnN0YW5jZU1hcHBlciB9IGZyb20gXCIuL2NyeXB0by9JbnN0YW5jZU1hcHBlclwiXG5pbXBvcnQgeyBXc0Nvbm5lY3Rpb25TdGF0ZSB9IGZyb20gXCIuLi9tYWluL1dvcmtlckNsaWVudFwiXG5pbXBvcnQgeyBFbnRpdHlSZXN0Q2FjaGUgfSBmcm9tIFwiLi9yZXN0L0RlZmF1bHRFbnRpdHlSZXN0Q2FjaGUuanNcIlxuaW1wb3J0IHsgU2xlZXBEZXRlY3RvciB9IGZyb20gXCIuL3V0aWxzL1NsZWVwRGV0ZWN0b3IuanNcIlxuaW1wb3J0IHN5c01vZGVsSW5mbyBmcm9tIFwiLi4vZW50aXRpZXMvc3lzL01vZGVsSW5mby5qc1wiXG5pbXBvcnQgdHV0YW5vdGFNb2RlbEluZm8gZnJvbSBcIi4uL2VudGl0aWVzL3R1dGFub3RhL01vZGVsSW5mby5qc1wiXG5pbXBvcnQgeyByZXNvbHZlVHlwZVJlZmVyZW5jZSB9IGZyb20gXCIuLi9jb21tb24vRW50aXR5RnVuY3Rpb25zLmpzXCJcbmltcG9ydCB7IFBoaXNoaW5nTWFya2VyV2Vic29ja2V0RGF0YSwgUGhpc2hpbmdNYXJrZXJXZWJzb2NrZXREYXRhVHlwZVJlZiwgUmVwb3J0ZWRNYWlsRmllbGRNYXJrZXIgfSBmcm9tIFwiLi4vZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnNcIlxuaW1wb3J0IHsgVXNlckZhY2FkZSB9IGZyb20gXCIuL2ZhY2FkZXMvVXNlckZhY2FkZVwiXG5pbXBvcnQgeyBFeHBvc2VkUHJvZ3Jlc3NUcmFja2VyIH0gZnJvbSBcIi4uL21haW4vUHJvZ3Jlc3NUcmFja2VyLmpzXCJcblxuYXNzZXJ0V29ya2VyT3JOb2RlKClcblxuZXhwb3J0IGNvbnN0IGVudW0gRXZlbnRCdXNTdGF0ZSB7XG5cdEF1dG9tYXRpYyA9IFwiYXV0b21hdGljXCIsXG5cdC8vIGF1dG9tYXRpYyByZWNvbm5lY3Rpb24gaXMgZW5hYmxlZFxuXHRTdXNwZW5kZWQgPSBcInN1c3BlbmRlZFwiLFxuXHQvLyBhdXRvbWF0aWMgcmVjb25uZWN0aW9uIGlzIHN1c3BlbmRlZCBidXQgY2FuIGJlIGVuYWJsZWQgYWdhaW5cblx0VGVybWluYXRlZCA9IFwidGVybWluYXRlZFwiLCAvLyBhdXRvbWF0aWMgcmVjb25uZWN0aW9uIGlzIGRpc2FibGVkIGFuZCB3ZWJzb2NrZXQgaXMgY2xvc2VkIGJ1dCBjYW4gYmUgb3BlbmVkIGFnYWluIGJ5IGNhbGxpbmcgY29ubmVjdCBleHBsaWNpdFxufVxuXG4vLyBFbnRpdHlFdmVudEJhdGNoZXMgZXhwaXJlIGFmdGVyIDQ1IGRheXMuIGtlZXAgYSB0aW1lIGRpZmYgc2VjdXJpdHkgb2Ygb25lIGRheS5cbmV4cG9ydCBjb25zdCBFTlRJVFlfRVZFTlRfQkFUQ0hfRVhQSVJFX01TID0gNDQgKiAyNCAqIDYwICogNjAgKiAxMDAwXG5jb25zdCBSRVRSWV9BRlRFUl9TRVJWSUNFX1VOQVZBSUxBQkxFX0VSUk9SX01TID0gMzAwMDBcbmNvbnN0IE5PUk1BTF9TSFVURE9XTl9DTE9TRV9DT0RFID0gMVxuLyoqXG4gKiBSZWNvbm5lY3Rpb24gaW50ZXJ2YWwgYm91bmRzLiBXaGVuIHdlIHJlY29ubmVjdCB3ZSBwaWNrIGEgcmFuZG9tIG51bWJlciBvZiBzZWNvbmRzIGluIGEgcmFuZ2UgdG8gcHJldmVudCB0aGF0IGFsbCB0aGUgY2xpZW50cyBjb25uZWN0IGF0IHRoZSBzYW1lIHRpbWUgd2hpY2hcbiAqIHdvdWxkIHB1dCB1bm5lY2Vzc2FyeSBsb2FkIG9uIHRoZSBzZXJ2ZXIuXG4gKiBUaGUgcmFuZ2UgZGVwZW5kcyBvbiB0aGUgbnVtYmVyIG9mIGF0dGVtcHRzIGFuZCB0aGUgc2VydmVyIHJlc3BvbnNlLlxuICogKi9cbmNvbnN0IFJFQ09OTkVDVF9JTlRFUlZBTCA9IE9iamVjdC5mcmVlemUoe1xuXHRTTUFMTDogWzUsIDEwXSxcblx0TUVESVVNOiBbMjAsIDQwXSxcblx0TEFSR0U6IFs2MCwgMTIwXSxcbn0gYXMgY29uc3QpXG4vLyB3ZSBzdG9yZSB0aGUgbGFzdCAxMDAwIGV2ZW50IGlkcyBwZXIgZ3JvdXAsIHNvIHdlIGtub3cgaWYgYW4gZXZlbnQgd2FzIGFscmVhZHkgcHJvY2Vzc2VkLlxuLy8gaXQgaXMgbm90IHN1ZmZpY2llbnQgdG8gY2hlY2sgdGhlIGxhc3QgZXZlbnQgaWQgYmVjYXVzZSBhIHNtYWxsZXIgZXZlbnQgaWQgbWF5IGFycml2ZSBsYXRlclxuLy8gdGhhbiBhIGJpZ2dlciBvbmUgaWYgdGhlIHJlcXVlc3RzIGFyZSBwcm9jZXNzZWQgaW4gcGFyYWxsZWwgb24gdGhlIHNlcnZlclxuY29uc3QgTUFYX0VWRU5UX0lEU19RVUVVRV9MRU5HVEggPSAxMDAwXG5cbi8qKiBLbm93biB0eXBlcyBvZiBtZXNzYWdlcyB0aGF0IGNhbiBiZSByZWNlaXZlZCBvdmVyIHdlYnNvY2tldC4gKi9cbmNvbnN0IGVudW0gTWVzc2FnZVR5cGUge1xuXHRFbnRpdHlVcGRhdGUgPSBcImVudGl0eVVwZGF0ZVwiLFxuXHRVbnJlYWRDb3VudGVyVXBkYXRlID0gXCJ1bnJlYWRDb3VudGVyVXBkYXRlXCIsXG5cdFBoaXNoaW5nTWFya2VycyA9IFwicGhpc2hpbmdNYXJrZXJzXCIsXG5cdExlYWRlclN0YXR1cyA9IFwibGVhZGVyU3RhdHVzXCIsXG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIENvbm5lY3RNb2RlIHtcblx0SW5pdGlhbCxcblx0UmVjb25uZWN0LFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEV2ZW50QnVzTGlzdGVuZXIge1xuXHRvbldlYnNvY2tldFN0YXRlQ2hhbmdlZChzdGF0ZTogV3NDb25uZWN0aW9uU3RhdGUpOiB1bmtub3duXG5cblx0b25Db3VudGVyQ2hhbmdlZChjb3VudGVyOiBXZWJzb2NrZXRDb3VudGVyRGF0YSk6IHVua25vd25cblxuXHRvbkxlYWRlclN0YXR1c0NoYW5nZWQobGVhZGVyU3RhdHVzOiBXZWJzb2NrZXRMZWFkZXJTdGF0dXMpOiB1bmtub3duXG5cblx0b25FbnRpdHlFdmVudHNSZWNlaXZlZChldmVudHM6IEVudGl0eVVwZGF0ZVtdLCBiYXRjaElkOiBJZCwgZ3JvdXBJZDogSWQpOiBQcm9taXNlPHZvaWQ+XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBtYXJrZXJzIG9ubHkgcGhpc2hpbmcgKG5vdCBzcGFtKSBtYXJrZXJzIHdpbGwgYmUgc2VudCBhcyBldmVudCBidXMgdXBkYXRlc1xuXHQgKi9cblx0b25QaGlzaGluZ01hcmtlcnNSZWNlaXZlZChtYXJrZXJzOiBSZXBvcnRlZE1haWxGaWVsZE1hcmtlcltdKTogdW5rbm93blxuXG5cdG9uRXJyb3IodHV0YW5vdGFFcnJvcjogRXJyb3IpOiB2b2lkXG59XG5cbmV4cG9ydCBjbGFzcyBFdmVudEJ1c0NsaWVudCB7XG5cdHByaXZhdGUgc3RhdGU6IEV2ZW50QnVzU3RhdGVcblx0cHJpdmF0ZSBzb2NrZXQ6IFdlYlNvY2tldCB8IG51bGxcblx0cHJpdmF0ZSBpbW1lZGlhdGVSZWNvbm5lY3Q6IGJvb2xlYW4gPSBmYWxzZSAvLyBpZiB0cnVlIHRyaWVzIHRvIHJlY29ubmVjdCBpbW1lZGlhdGVseSBhZnRlciB0aGUgd2Vic29ja2V0IGlzIGNsb3NlZFxuXG5cdC8qKlxuXHQgKiBNYXAgZnJvbSBncm91cCBpZCB0byBsYXN0IGV2ZW50IGlkcyAobWF4LiBfTUFYX0VWRU5UX0lEU19RVUVVRV9MRU5HVEgpLiBXZSBrZWVwIHRoZW0gdG8gYXZvaWQgcHJvY2Vzc2luZyB0aGUgc2FtZSBldmVudCB0d2ljZSBpZlxuXHQgKiBpdCBjb21lcyBvdXQgb2Ygb3JkZXIgZnJvbSB0aGUgc2VydmVyKSBhbmQgZm9yIHJlcXVlc3RpbmcgbWlzc2VkIGVudGl0eSBldmVudHMgb24gcmVjb25uZWN0LlxuXHQgKlxuXHQgKiBXZSBkbyBub3QgaGF2ZSB0byB1cGRhdGUgdGhlc2UgZXZlbnQgaWRzIGlmIHRoZSBncm91cHMgb2YgdGhlIHVzZXIgY2hhbmdlIGJlY2F1c2Ugd2UgYWx3YXlzIHRha2UgdGhlIGN1cnJlbnQgdXNlcnMgZ3JvdXBzIGZyb20gdGhlXG5cdCAqIExvZ2luRmFjYWRlLlxuXHQgKi9cblx0cHJpdmF0ZSBsYXN0RW50aXR5RXZlbnRJZHM6IE1hcDxJZCwgQXJyYXk8SWQ+PlxuXG5cdC8qKlxuXHQgKiBMYXN0IGJhdGNoIHdoaWNoIHdhcyBhY3R1YWxseSBhZGRlZCB0byB0aGUgcXVldWUuIFdlIG5lZWQgaXQgdG8gZmluZCBvdXQgd2hlbiB0aGUgZ3JvdXAgaXMgcHJvY2Vzc2VkXG5cdCAqL1xuXHRwcml2YXRlIGxhc3RBZGRlZEJhdGNoRm9yR3JvdXA6IE1hcDxJZCwgSWQ+XG5cblx0cHJpdmF0ZSBsYXN0QW50aXBoaXNoaW5nTWFya2Vyc0lkOiBJZCB8IG51bGwgPSBudWxsXG5cblx0LyoqIFF1ZXVlIHRvIHByb2Nlc3MgYWxsIGV2ZW50cy4gKi9cblx0cHJpdmF0ZSByZWFkb25seSBldmVudFF1ZXVlOiBFdmVudFF1ZXVlXG5cblx0LyoqIFF1ZXVlIHRoYXQgaGFuZGxlcyBpbmNvbWluZyB3ZWJzb2NrZXQgbWVzc2FnZXMgb25seS4gQ2FjaGVzIHRoZW0gdW50aWwgd2UgcHJvY2VzcyBkb3dubG9hZGVkIG9uZXMgYW5kIHRoZW4gYWRkcyB0aGVtIHRvIGV2ZW50UXVldWUuICovXG5cdHByaXZhdGUgcmVhZG9ubHkgZW50aXR5VXBkYXRlTWVzc2FnZVF1ZXVlOiBFdmVudFF1ZXVlXG5cdHByaXZhdGUgcmVjb25uZWN0VGltZXI6IFRpbWVvdXRJRCB8IG51bGxcblx0cHJpdmF0ZSBjb25uZWN0VGltZXI6IFRpbWVvdXRJRCB8IG51bGxcblxuXHQvKipcblx0ICogUmVwcmVzZW50cyBhIGN1cnJlbnRseSByZXRyaWVkIGV4ZWN1dGluZyBkdWUgdG8gYSBTZXJ2aWNlVW5hdmFpbGFibGVFcnJvclxuXHQgKi9cblx0cHJpdmF0ZSBzZXJ2aWNlVW5hdmFpbGFibGVSZXRyeTogUHJvbWlzZTx2b2lkPiB8IG51bGwgPSBudWxsXG5cdHByaXZhdGUgZmFpbGVkQ29ubmVjdGlvbkF0dGVtcHRzOiBudW1iZXIgPSAwXG5cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSBsaXN0ZW5lcjogRXZlbnRCdXNMaXN0ZW5lcixcblx0XHRwcml2YXRlIHJlYWRvbmx5IGNhY2hlOiBFbnRpdHlSZXN0Q2FjaGUsXG5cdFx0cHJpdmF0ZSByZWFkb25seSB1c2VyRmFjYWRlOiBVc2VyRmFjYWRlLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZW50aXR5OiBFbnRpdHlDbGllbnQsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBpbnN0YW5jZU1hcHBlcjogSW5zdGFuY2VNYXBwZXIsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBzb2NrZXRGYWN0b3J5OiAocGF0aDogc3RyaW5nKSA9PiBXZWJTb2NrZXQsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBzbGVlcERldGVjdG9yOiBTbGVlcERldGVjdG9yLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgcHJvZ3Jlc3NUcmFja2VyOiBFeHBvc2VkUHJvZ3Jlc3NUcmFja2VyLFxuXHQpIHtcblx0XHQvLyBXZSBhcmUgbm90IGNvbm5lY3RlZCBieSBkZWZhdWx0IGFuZCB3aWxsIG5vdCB0cnkgdG8gdW5sZXNzIGNvbm5lY3QoKSBpcyBjYWxsZWRcblx0XHR0aGlzLnN0YXRlID0gRXZlbnRCdXNTdGF0ZS5UZXJtaW5hdGVkXG5cdFx0dGhpcy5sYXN0RW50aXR5RXZlbnRJZHMgPSBuZXcgTWFwKClcblx0XHR0aGlzLmxhc3RBZGRlZEJhdGNoRm9yR3JvdXAgPSBuZXcgTWFwKClcblx0XHR0aGlzLnNvY2tldCA9IG51bGxcblx0XHR0aGlzLnJlY29ubmVjdFRpbWVyID0gbnVsbFxuXHRcdHRoaXMuY29ubmVjdFRpbWVyID0gbnVsbFxuXHRcdHRoaXMuZXZlbnRRdWV1ZSA9IG5ldyBFdmVudFF1ZXVlKFwid3Nfb3B0XCIsIHRydWUsIChtb2RpZmljYXRpb24pID0+IHRoaXMuZXZlbnRRdWV1ZUNhbGxiYWNrKG1vZGlmaWNhdGlvbikpXG5cdFx0dGhpcy5lbnRpdHlVcGRhdGVNZXNzYWdlUXVldWUgPSBuZXcgRXZlbnRRdWV1ZShcIndzX21zZ1wiLCBmYWxzZSwgKGJhdGNoKSA9PiB0aGlzLmVudGl0eVVwZGF0ZU1lc3NhZ2VRdWV1ZUNhbGxiYWNrKGJhdGNoKSlcblx0XHR0aGlzLnJlc2V0KClcblx0fVxuXG5cdHByaXZhdGUgcmVzZXQoKSB7XG5cdFx0dGhpcy5pbW1lZGlhdGVSZWNvbm5lY3QgPSBmYWxzZVxuXG5cdFx0dGhpcy5sYXN0RW50aXR5RXZlbnRJZHMuY2xlYXIoKVxuXG5cdFx0dGhpcy5sYXN0QWRkZWRCYXRjaEZvckdyb3VwLmNsZWFyKClcblxuXHRcdHRoaXMuZXZlbnRRdWV1ZS5wYXVzZSgpXG5cblx0XHR0aGlzLmV2ZW50UXVldWUuY2xlYXIoKVxuXG5cdFx0dGhpcy5zZXJ2aWNlVW5hdmFpbGFibGVSZXRyeSA9IG51bGxcblx0fVxuXG5cdC8qKlxuXHQgKiBPcGVucyBhIFdlYlNvY2tldCBjb25uZWN0aW9uIHRvIHJlY2VpdmUgc2VydmVyIGV2ZW50cy5cblx0ICogQHBhcmFtIGNvbm5lY3RNb2RlXG5cdCAqL1xuXHRjb25uZWN0KGNvbm5lY3RNb2RlOiBDb25uZWN0TW9kZSkge1xuXHRcdGNvbnNvbGUubG9nKFwid3MgY29ubmVjdCByZWNvbm5lY3Q6XCIsIGNvbm5lY3RNb2RlID09PSBDb25uZWN0TW9kZS5SZWNvbm5lY3QsIFwic3RhdGU6XCIsIHRoaXMuc3RhdGUpXG5cdFx0Ly8gbWFrZSBzdXJlIGEgcmV0cnkgd2lsbCBiZSBjYW5jZWxsZWQgYnkgc2V0dGluZyBfc2VydmljZVVuYXZhaWxhYmxlUmV0cnkgdG8gbnVsbFxuXHRcdHRoaXMuc2VydmljZVVuYXZhaWxhYmxlUmV0cnkgPSBudWxsXG5cblx0XHR0aGlzLmxpc3RlbmVyLm9uV2Vic29ja2V0U3RhdGVDaGFuZ2VkKFdzQ29ubmVjdGlvblN0YXRlLmNvbm5lY3RpbmcpXG5cblx0XHR0aGlzLnN0YXRlID0gRXZlbnRCdXNTdGF0ZS5BdXRvbWF0aWNcblx0XHR0aGlzLmNvbm5lY3RUaW1lciA9IG51bGxcblxuXHRcdGNvbnN0IGF1dGhIZWFkZXJzID0gdGhpcy51c2VyRmFjYWRlLmNyZWF0ZUF1dGhIZWFkZXJzKClcblxuXHRcdC8vIE5hdGl2ZSBxdWVyeSBidWlsZGluZyBpcyBub3Qgc3VwcG9ydGVkIGluIG9sZCBicm93c2VyLCBtaXRocmlsIGlzIG5vdCBhdmFpbGFibGUgaW4gdGhlIHdvcmtlclxuXHRcdGNvbnN0IGF1dGhRdWVyeSA9XG5cdFx0XHRcIm1vZGVsVmVyc2lvbnM9XCIgK1xuXHRcdFx0c3lzTW9kZWxJbmZvLnZlcnNpb24gK1xuXHRcdFx0XCIuXCIgK1xuXHRcdFx0dHV0YW5vdGFNb2RlbEluZm8udmVyc2lvbiArXG5cdFx0XHRcIiZjbGllbnRWZXJzaW9uPVwiICtcblx0XHRcdGVudi52ZXJzaW9uTnVtYmVyICtcblx0XHRcdFwiJnVzZXJJZD1cIiArXG5cdFx0XHR0aGlzLnVzZXJGYWNhZGUuZ2V0TG9nZ2VkSW5Vc2VyKCkuX2lkICtcblx0XHRcdFwiJmFjY2Vzc1Rva2VuPVwiICtcblx0XHRcdGF1dGhIZWFkZXJzLmFjY2Vzc1Rva2VuICtcblx0XHRcdCh0aGlzLmxhc3RBbnRpcGhpc2hpbmdNYXJrZXJzSWQgPyBcIiZsYXN0UGhpc2hpbmdNYXJrZXJzSWQ9XCIgKyB0aGlzLmxhc3RBbnRpcGhpc2hpbmdNYXJrZXJzSWQgOiBcIlwiKVxuXHRcdGNvbnN0IHBhdGggPSBcIi9ldmVudD9cIiArIGF1dGhRdWVyeVxuXG5cdFx0dGhpcy51bnN1YnNjcmliZUZyb21PbGRXZWJzb2NrZXQoKVxuXG5cdFx0dGhpcy5zb2NrZXQgPSB0aGlzLnNvY2tldEZhY3RvcnkocGF0aClcblx0XHR0aGlzLnNvY2tldC5vbm9wZW4gPSAoKSA9PiB0aGlzLm9uT3Blbihjb25uZWN0TW9kZSlcblx0XHR0aGlzLnNvY2tldC5vbmNsb3NlID0gKGV2ZW50OiBDbG9zZUV2ZW50KSA9PiB0aGlzLm9uQ2xvc2UoZXZlbnQpXG5cdFx0dGhpcy5zb2NrZXQub25lcnJvciA9IChlcnJvcjogYW55KSA9PiB0aGlzLm9uRXJyb3IoZXJyb3IpXG5cdFx0dGhpcy5zb2NrZXQub25tZXNzYWdlID0gKG1lc3NhZ2U6IE1lc3NhZ2VFdmVudDxzdHJpbmc+KSA9PiB0aGlzLm9uTWVzc2FnZShtZXNzYWdlKVxuXG5cdFx0dGhpcy5zbGVlcERldGVjdG9yLnN0YXJ0KCgpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKFwid3Mgc2xlZXAgZGV0ZWN0ZWQsIHJlY29ubmVjdGluZy4uLlwiKVxuXHRcdFx0dGhpcy50cnlSZWNvbm5lY3QodHJ1ZSwgdHJ1ZSlcblx0XHR9KVxuXHR9XG5cblx0LyoqXG5cdCAqIFNlbmRzIGEgY2xvc2UgZXZlbnQgdG8gdGhlIHNlcnZlciBhbmQgZmluYWxseSBjbG9zZXMgdGhlIGNvbm5lY3Rpb24uXG5cdCAqIFRoZSBzdGF0ZSBvZiB0aGlzIGV2ZW50IGJ1cyBjbGllbnQgaXMgcmVzZXQgYW5kIHRoZSBjbGllbnQgaXMgdGVybWluYXRlZCAoZG9lcyBub3QgYXV0b21hdGljYWxseSByZWNvbm5lY3QpIGV4Y2VwdCByZWNvbm5lY3QgPT0gdHJ1ZVxuXHQgKi9cblx0YXN5bmMgY2xvc2UoY2xvc2VPcHRpb246IENsb3NlRXZlbnRCdXNPcHRpb24pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zb2xlLmxvZyhcIndzIGNsb3NlIGNsb3NlT3B0aW9uOiBcIiwgY2xvc2VPcHRpb24sIFwic3RhdGU6XCIsIHRoaXMuc3RhdGUpXG5cblx0XHRzd2l0Y2ggKGNsb3NlT3B0aW9uKSB7XG5cdFx0XHRjYXNlIENsb3NlRXZlbnRCdXNPcHRpb24uVGVybWluYXRlOlxuXHRcdFx0XHR0aGlzLnRlcm1pbmF0ZSgpXG5cblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Y2FzZSBDbG9zZUV2ZW50QnVzT3B0aW9uLlBhdXNlOlxuXHRcdFx0XHR0aGlzLnN0YXRlID0gRXZlbnRCdXNTdGF0ZS5TdXNwZW5kZWRcblxuXHRcdFx0XHR0aGlzLmxpc3RlbmVyLm9uV2Vic29ja2V0U3RhdGVDaGFuZ2VkKFdzQ29ubmVjdGlvblN0YXRlLmNvbm5lY3RpbmcpXG5cblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Y2FzZSBDbG9zZUV2ZW50QnVzT3B0aW9uLlJlY29ubmVjdDpcblx0XHRcdFx0dGhpcy5saXN0ZW5lci5vbldlYnNvY2tldFN0YXRlQ2hhbmdlZChXc0Nvbm5lY3Rpb25TdGF0ZS5jb25uZWN0aW5nKVxuXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0dGhpcy5zb2NrZXQ/LmNsb3NlKClcblx0fVxuXG5cdGFzeW5jIHRyeVJlY29ubmVjdChjbG9zZUlmT3BlbjogYm9vbGVhbiwgZW5hYmxlQXV0b21hdGljU3RhdGU6IGJvb2xlYW4sIGRlbGF5OiBudW1iZXIgfCBudWxsID0gbnVsbCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnNvbGUubG9nKFwid3MgdHJ5UmVjb25uZWN0IGNsb3NlSWZPcGVuOlwiLCBjbG9zZUlmT3BlbiwgXCJlbmFibGVBdXRvbWF0aWNTdGF0ZTpcIiwgZW5hYmxlQXV0b21hdGljU3RhdGUsIFwiZGVsYXk6XCIsIGRlbGF5KVxuXG5cdFx0aWYgKHRoaXMucmVjb25uZWN0VGltZXIpIHtcblx0XHRcdC8vIHByZXZlbnQgcmVjb25uZWN0IHJhY2UtY29uZGl0aW9uXG5cdFx0XHRjbGVhclRpbWVvdXQodGhpcy5yZWNvbm5lY3RUaW1lcilcblx0XHRcdHRoaXMucmVjb25uZWN0VGltZXIgPSBudWxsXG5cdFx0fVxuXG5cdFx0aWYgKCFkZWxheSkge1xuXHRcdFx0dGhpcy5yZWNvbm5lY3QoY2xvc2VJZk9wZW4sIGVuYWJsZUF1dG9tYXRpY1N0YXRlKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnJlY29ubmVjdFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLnJlY29ubmVjdChjbG9zZUlmT3BlbiwgZW5hYmxlQXV0b21hdGljU3RhdGUpLCBkZWxheSlcblx0XHR9XG5cdH1cblxuXHQvLyBSZXR1cm5pbmcgcHJvbWlzZSBmb3IgdGVzdHNcblx0cHJpdmF0ZSBvbk9wZW4oY29ubmVjdE1vZGU6IENvbm5lY3RNb2RlKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dGhpcy5mYWlsZWRDb25uZWN0aW9uQXR0ZW1wdHMgPSAwXG5cdFx0Y29uc29sZS5sb2coXCJ3cyBvcGVuIHN0YXRlOlwiLCB0aGlzLnN0YXRlKVxuXG5cdFx0Y29uc3QgcCA9IHRoaXMuaW5pdEVudGl0eUV2ZW50cyhjb25uZWN0TW9kZSlcblxuXHRcdHRoaXMubGlzdGVuZXIub25XZWJzb2NrZXRTdGF0ZUNoYW5nZWQoV3NDb25uZWN0aW9uU3RhdGUuY29ubmVjdGVkKVxuXG5cdFx0cmV0dXJuIHBcblx0fVxuXG5cdHByaXZhdGUgb25FcnJvcihlcnJvcjogYW55KSB7XG5cdFx0Y29uc29sZS5sb2coXCJ3cyBlcnJvcjpcIiwgZXJyb3IsIEpTT04uc3RyaW5naWZ5KGVycm9yKSwgXCJzdGF0ZTpcIiwgdGhpcy5zdGF0ZSlcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgb25NZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2VFdmVudDxzdHJpbmc+KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgW3R5cGUsIHZhbHVlXSA9IG1lc3NhZ2UuZGF0YS5zcGxpdChcIjtcIilcblxuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0Y2FzZSBNZXNzYWdlVHlwZS5FbnRpdHlVcGRhdGU6IHtcblx0XHRcdFx0Y29uc3QgeyBldmVudEJhdGNoSWQsIGV2ZW50QmF0Y2hPd25lciwgZXZlbnRCYXRjaCB9OiBXZWJzb2NrZXRFbnRpdHlEYXRhID0gYXdhaXQgdGhpcy5pbnN0YW5jZU1hcHBlci5kZWNyeXB0QW5kTWFwVG9JbnN0YW5jZShcblx0XHRcdFx0XHRhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZShXZWJzb2NrZXRFbnRpdHlEYXRhVHlwZVJlZiksXG5cdFx0XHRcdFx0SlNPTi5wYXJzZSh2YWx1ZSksXG5cdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0KVxuXHRcdFx0XHRjb25zdCBmaWx0ZXJlZEVudGl0eVVwZGF0ZXMgPSBhd2FpdCB0aGlzLnJlbW92ZVVua25vd25UeXBlcyhldmVudEJhdGNoKVxuXHRcdFx0XHR0aGlzLmVudGl0eVVwZGF0ZU1lc3NhZ2VRdWV1ZS5hZGQoZXZlbnRCYXRjaElkLCBldmVudEJhdGNoT3duZXIsIGZpbHRlcmVkRW50aXR5VXBkYXRlcylcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGNhc2UgTWVzc2FnZVR5cGUuVW5yZWFkQ291bnRlclVwZGF0ZToge1xuXHRcdFx0XHRjb25zdCBjb3VudGVyRGF0YTogV2Vic29ja2V0Q291bnRlckRhdGEgPSBhd2FpdCB0aGlzLmluc3RhbmNlTWFwcGVyLmRlY3J5cHRBbmRNYXBUb0luc3RhbmNlKFxuXHRcdFx0XHRcdGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKFdlYnNvY2tldENvdW50ZXJEYXRhVHlwZVJlZiksXG5cdFx0XHRcdFx0SlNPTi5wYXJzZSh2YWx1ZSksXG5cdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0KVxuXHRcdFx0XHR0aGlzLmxpc3RlbmVyLm9uQ291bnRlckNoYW5nZWQoY291bnRlckRhdGEpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRjYXNlIE1lc3NhZ2VUeXBlLlBoaXNoaW5nTWFya2Vyczoge1xuXHRcdFx0XHRjb25zdCBkYXRhOiBQaGlzaGluZ01hcmtlcldlYnNvY2tldERhdGEgPSBhd2FpdCB0aGlzLmluc3RhbmNlTWFwcGVyLmRlY3J5cHRBbmRNYXBUb0luc3RhbmNlKFxuXHRcdFx0XHRcdGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKFBoaXNoaW5nTWFya2VyV2Vic29ja2V0RGF0YVR5cGVSZWYpLFxuXHRcdFx0XHRcdEpTT04ucGFyc2UodmFsdWUpLFxuXHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdClcblx0XHRcdFx0dGhpcy5sYXN0QW50aXBoaXNoaW5nTWFya2Vyc0lkID0gZGF0YS5sYXN0SWRcblx0XHRcdFx0dGhpcy5saXN0ZW5lci5vblBoaXNoaW5nTWFya2Vyc1JlY2VpdmVkKGRhdGEubWFya2Vycylcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGNhc2UgTWVzc2FnZVR5cGUuTGVhZGVyU3RhdHVzOiB7XG5cdFx0XHRcdGNvbnN0IGRhdGE6IFdlYnNvY2tldExlYWRlclN0YXR1cyA9IGF3YWl0IHRoaXMuaW5zdGFuY2VNYXBwZXIuZGVjcnlwdEFuZE1hcFRvSW5zdGFuY2UoXG5cdFx0XHRcdFx0YXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UoV2Vic29ja2V0TGVhZGVyU3RhdHVzVHlwZVJlZiksXG5cdFx0XHRcdFx0SlNPTi5wYXJzZSh2YWx1ZSksXG5cdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0KVxuXHRcdFx0XHRhd2FpdCB0aGlzLnVzZXJGYWNhZGUuc2V0TGVhZGVyU3RhdHVzKGRhdGEpXG5cdFx0XHRcdGF3YWl0IHRoaXMubGlzdGVuZXIub25MZWFkZXJTdGF0dXNDaGFuZ2VkKGRhdGEpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRjb25zb2xlLmxvZyhcIndzIG1lc3NhZ2Ugd2l0aCB1bmtub3duIHR5cGVcIiwgdHlwZSlcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRmlsdGVycyBvdXQgc3BlY2lmaWMgdHlwZXMgZnJvbSBAcGFyYW0gZW50aXR5VXBkYXRlcyB0aGF0IHRoZSBjbGllbnQgZG9lcyBub3QgYWN0dWFsbHkga25vdyBhYm91dFxuXHQgKiAodGhhdCBhcmUgbm90IGluIHR1dGFub3RhVHlwZXMpLCBhbmQgd2hpY2ggc2hvdWxkIHRoZXJlZm9yZSBub3QgYmUgcHJvY2Vzc2VkLlxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyByZW1vdmVVbmtub3duVHlwZXMoZXZlbnRCYXRjaDogRW50aXR5VXBkYXRlW10pOiBQcm9taXNlPEVudGl0eVVwZGF0ZVtdPiB7XG5cdFx0cmV0dXJuIHByb21pc2VGaWx0ZXIoZXZlbnRCYXRjaCwgYXN5bmMgKGVudGl0eVVwZGF0ZSkgPT4ge1xuXHRcdFx0Y29uc3QgdHlwZVJlZiA9IG5ldyBUeXBlUmVmKGVudGl0eVVwZGF0ZS5hcHBsaWNhdGlvbiwgZW50aXR5VXBkYXRlLnR5cGUpXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZSh0eXBlUmVmKVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0fSBjYXRjaCAoX2Vycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihcImlnbm9yaW5nIGVudGl0eUV2ZW50VXBkYXRlIGZvciB1bmtub3duIHR5cGUgd2l0aCB0eXBlSWRcIiwgZ2V0VHlwZUlkKHR5cGVSZWYpKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdH1cblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSBvbkNsb3NlKGV2ZW50OiBDbG9zZUV2ZW50KSB7XG5cdFx0dGhpcy5mYWlsZWRDb25uZWN0aW9uQXR0ZW1wdHMrK1xuXHRcdGNvbnNvbGUubG9nKFwid3MgY2xvc2UgZXZlbnQ6XCIsIGV2ZW50LCBcInN0YXRlOlwiLCB0aGlzLnN0YXRlKVxuXG5cdFx0dGhpcy51c2VyRmFjYWRlLnNldExlYWRlclN0YXR1cyhcblx0XHRcdGNyZWF0ZVdlYnNvY2tldExlYWRlclN0YXR1cyh7XG5cdFx0XHRcdGxlYWRlclN0YXR1czogZmFsc2UsXG5cdFx0XHR9KSxcblx0XHQpXG5cblx0XHR0aGlzLnNsZWVwRGV0ZWN0b3Iuc3RvcCgpXG5cblx0XHQvLyBBdm9pZCBydW5uaW5nIGludG8gcGVuYWx0aWVzIHdoZW4gdHJ5aW5nIHRvIGF1dGhlbnRpY2F0ZSB3aXRoIGFuIGludmFsaWQgc2Vzc2lvblxuXHRcdC8vIE5vdEF1dGhlbnRpY2F0ZWRFeGNlcHRpb24gNDAxLCBBY2Nlc3NEZWFjdGl2YXRlZEV4Y2VwdGlvbiA0NzAsIEFjY2Vzc0Jsb2NrZWQgNDcyXG5cdFx0Ly8gZG8gbm90IGNhdGNoIHNlc3Npb24gZXhwaXJlZCBoZXJlIGJlY2F1c2Ugd2Vic29ja2V0IHdpbGwgYmUgcmV1c2VkIHdoZW4gd2UgYXV0aGVudGljYXRlIGFnYWluXG5cdFx0Y29uc3Qgc2VydmVyQ29kZSA9IGV2ZW50LmNvZGUgLSA0MDAwXG5cblx0XHRpZiAoW05vdEF1dGhvcml6ZWRFcnJvci5DT0RFLCBBY2Nlc3NEZWFjdGl2YXRlZEVycm9yLkNPREUsIEFjY2Vzc0Jsb2NrZWRFcnJvci5DT0RFXS5pbmNsdWRlcyhzZXJ2ZXJDb2RlKSkge1xuXHRcdFx0dGhpcy50ZXJtaW5hdGUoKVxuXHRcdFx0dGhpcy5saXN0ZW5lci5vbkVycm9yKGhhbmRsZVJlc3RFcnJvcihzZXJ2ZXJDb2RlLCBcIndlYiBzb2NrZXQgZXJyb3JcIiwgbnVsbCwgbnVsbCkpXG5cdFx0fSBlbHNlIGlmIChzZXJ2ZXJDb2RlID09PSBTZXNzaW9uRXhwaXJlZEVycm9yLkNPREUpIHtcblx0XHRcdC8vIHNlc3Npb24gaXMgZXhwaXJlZC4gZG8gbm90IHRyeSB0byByZWNvbm5lY3QgdW50aWwgdGhlIHVzZXIgY3JlYXRlcyBhIG5ldyBzZXNzaW9uXG5cdFx0XHR0aGlzLnN0YXRlID0gRXZlbnRCdXNTdGF0ZS5TdXNwZW5kZWRcblx0XHRcdHRoaXMubGlzdGVuZXIub25XZWJzb2NrZXRTdGF0ZUNoYW5nZWQoV3NDb25uZWN0aW9uU3RhdGUuY29ubmVjdGluZylcblx0XHR9IGVsc2UgaWYgKHRoaXMuc3RhdGUgPT09IEV2ZW50QnVzU3RhdGUuQXV0b21hdGljICYmIHRoaXMudXNlckZhY2FkZS5pc0Z1bGx5TG9nZ2VkSW4oKSkge1xuXHRcdFx0dGhpcy5saXN0ZW5lci5vbldlYnNvY2tldFN0YXRlQ2hhbmdlZChXc0Nvbm5lY3Rpb25TdGF0ZS5jb25uZWN0aW5nKVxuXG5cdFx0XHRpZiAodGhpcy5pbW1lZGlhdGVSZWNvbm5lY3QpIHtcblx0XHRcdFx0dGhpcy5pbW1lZGlhdGVSZWNvbm5lY3QgPSBmYWxzZVxuXHRcdFx0XHR0aGlzLnRyeVJlY29ubmVjdChmYWxzZSwgZmFsc2UpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsZXQgcmVjb25uZWN0aW9uSW50ZXJ2YWw6IHJlYWRvbmx5IFtudW1iZXIsIG51bWJlcl1cblxuXHRcdFx0XHRpZiAoc2VydmVyQ29kZSA9PT0gTk9STUFMX1NIVVRET1dOX0NMT1NFX0NPREUpIHtcblx0XHRcdFx0XHRyZWNvbm5lY3Rpb25JbnRlcnZhbCA9IFJFQ09OTkVDVF9JTlRFUlZBTC5MQVJHRVxuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMuZmFpbGVkQ29ubmVjdGlvbkF0dGVtcHRzID09PSAxKSB7XG5cdFx0XHRcdFx0cmVjb25uZWN0aW9uSW50ZXJ2YWwgPSBSRUNPTk5FQ1RfSU5URVJWQUwuU01BTExcblx0XHRcdFx0fSBlbHNlIGlmICh0aGlzLmZhaWxlZENvbm5lY3Rpb25BdHRlbXB0cyA9PT0gMikge1xuXHRcdFx0XHRcdHJlY29ubmVjdGlvbkludGVydmFsID0gUkVDT05ORUNUX0lOVEVSVkFMLk1FRElVTVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlY29ubmVjdGlvbkludGVydmFsID0gUkVDT05ORUNUX0lOVEVSVkFMLkxBUkdFXG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLnRyeVJlY29ubmVjdChmYWxzZSwgZmFsc2UsIFNFQ09ORF9NUyAqIHJhbmRvbUludEZyb21JbnRlcnZhbChyZWNvbm5lY3Rpb25JbnRlcnZhbFswXSwgcmVjb25uZWN0aW9uSW50ZXJ2YWxbMV0pKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgaW5pdEVudGl0eUV2ZW50cyhjb25uZWN0TW9kZTogQ29ubmVjdE1vZGUpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyBwYXVzZSBwcm9jZXNzaW5nIGVudGl0eSB1cGRhdGUgbWVzc2FnZSB3aGlsZSBpbml0aWFsaXppbmcgZXZlbnQgcXVldWVcblx0XHR0aGlzLmVudGl0eVVwZGF0ZU1lc3NhZ2VRdWV1ZS5wYXVzZSgpXG5cblx0XHQvLyBwYXVzZSBldmVudCBxdWV1ZSBhbmQgYWRkIGFsbCBtaXNzZWQgZW50aXR5IGV2ZW50cyBmaXJzdFxuXHRcdHRoaXMuZXZlbnRRdWV1ZS5wYXVzZSgpXG5cblx0XHRjb25zdCBleGlzdGluZ0Nvbm5lY3Rpb24gPSBjb25uZWN0TW9kZSA9PSBDb25uZWN0TW9kZS5SZWNvbm5lY3QgJiYgdGhpcy5sYXN0RW50aXR5RXZlbnRJZHMuc2l6ZSA+IDBcblx0XHRjb25zdCBwID0gZXhpc3RpbmdDb25uZWN0aW9uID8gdGhpcy5sb2FkTWlzc2VkRW50aXR5RXZlbnRzKHRoaXMuZXZlbnRRdWV1ZSkgOiB0aGlzLmluaXRPbk5ld0Nvbm5lY3Rpb24oKVxuXG5cdFx0cmV0dXJuIHBcblx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0dGhpcy5lbnRpdHlVcGRhdGVNZXNzYWdlUXVldWUucmVzdW1lKClcblx0XHRcdFx0dGhpcy5ldmVudFF1ZXVlLnJlc3VtZSgpXG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKFxuXHRcdFx0XHRvZkNsYXNzKENvbm5lY3Rpb25FcnJvciwgKGUpID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIndzIG5vdCBjb25uZWN0ZWQgaW4gY29ubmVjdCgpLCBjbG9zZSB3ZWJzb2NrZXRcIiwgZSlcblx0XHRcdFx0XHR0aGlzLmNsb3NlKENsb3NlRXZlbnRCdXNPcHRpb24uUmVjb25uZWN0KVxuXHRcdFx0XHR9KSxcblx0XHRcdClcblx0XHRcdC5jYXRjaChcblx0XHRcdFx0b2ZDbGFzcyhDYW5jZWxsZWRFcnJvciwgKCkgPT4ge1xuXHRcdFx0XHRcdC8vIHRoZSBwcm9jZXNzaW5nIHdhcyBhYm9ydGVkIGR1ZSB0byBhIHJlY29ubmVjdC4gZG8gbm90IHJlc2V0IGFueSBhdHRyaWJ1dGVzIGJlY2F1c2UgdGhleSBtaWdodCBhbHJlYWR5IGJlIGluIHVzZSBzaW5jZSByZWNvbm5lY3Rpb25cblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIndzIGNhbmNlbGxlZCByZXRyeSBwcm9jZXNzIGVudGl0eSBldmVudHMgYWZ0ZXIgcmVjb25uZWN0XCIpXG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXHRcdFx0LmNhdGNoKFxuXHRcdFx0XHRvZkNsYXNzKFNlcnZpY2VVbmF2YWlsYWJsZUVycm9yLCBhc3luYyAoZSkgPT4ge1xuXHRcdFx0XHRcdC8vIGEgU2VydmljZVVuYXZhaWxhYmxlRXJyb3IgaXMgYSB0ZW1wb3JhcnkgZXJyb3IgYW5kIHdlIGhhdmUgdG8gcmV0cnkgdG8gYXZvaWQgZGF0YSBpbmNvbnNpc3RlbmNpZXNcblx0XHRcdFx0XHQvLyBzb21lIEV2ZW50QmF0Y2hlcy9taXNzZWQgZXZlbnRzIGFyZSBwcm9jZXNzZWQgYWxyZWFkeSBub3dcblx0XHRcdFx0XHQvLyBmb3IgYW4gZXhpc3RpbmcgY29ubmVjdGlvbiB3ZSBqdXN0IGtlZXAgdGhlIGN1cnJlbnQgc3RhdGUgYW5kIGNvbnRpbnVlIGxvYWRpbmcgbWlzc2VkIGV2ZW50cyBmb3IgdGhlIG90aGVyIGdyb3Vwc1xuXHRcdFx0XHRcdC8vIGZvciBhIG5ldyBjb25uZWN0aW9uIHdlIHJlc2V0IHRoZSBsYXN0IGVudGl0eSBldmVudCBpZHMgYmVjYXVzZSBvdGhlcndpc2UgdGhpcyB3b3VsZCBub3QgYmUgY29tcGxldGVkIGluIHRoZSBuZXh0IHRyeVxuXHRcdFx0XHRcdGlmICghZXhpc3RpbmdDb25uZWN0aW9uKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmxhc3RFbnRpdHlFdmVudElkcy5jbGVhcigpXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJ3cyByZXRyeSBpbml0IGVudGl0eSBldmVudHMgaW4gXCIsIFJFVFJZX0FGVEVSX1NFUlZJQ0VfVU5BVkFJTEFCTEVfRVJST1JfTVMsIGUpXG5cdFx0XHRcdFx0bGV0IHByb21pc2UgPSBkZWxheShSRVRSWV9BRlRFUl9TRVJWSUNFX1VOQVZBSUxBQkxFX0VSUk9SX01TKS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdC8vIGlmIHdlIGhhdmUgYSB3ZWJzb2NrZXQgcmVjb25uZWN0IHdlIGhhdmUgdG8gc3RvcCByZXRyeWluZ1xuXHRcdFx0XHRcdFx0aWYgKHRoaXMuc2VydmljZVVuYXZhaWxhYmxlUmV0cnkgPT09IHByb21pc2UpIHtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coXCJ3cyByZXRyeSBpbml0aWFsaXppbmcgZW50aXR5IGV2ZW50c1wiKVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5pbml0RW50aXR5RXZlbnRzKGNvbm5lY3RNb2RlKVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coXCJ3cyBjYW5jZWwgaW5pdGlhbGl6aW5nIGVudGl0eSBldmVudHNcIilcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdHRoaXMuc2VydmljZVVuYXZhaWxhYmxlUmV0cnkgPSBwcm9taXNlXG5cdFx0XHRcdFx0cmV0dXJuIHByb21pc2Vcblx0XHRcdFx0fSksXG5cdFx0XHQpXG5cdFx0XHQuY2F0Y2goXG5cdFx0XHRcdG9mQ2xhc3MoT3V0T2ZTeW5jRXJyb3IsIGFzeW5jIChlKSA9PiB7XG5cdFx0XHRcdFx0Ly8gd2UgZGlkIG5vdCBjaGVjayBmb3IgdXBkYXRlcyBmb3IgdG9vIGxvbmcsIHNvIHNvbWUgbWlzc2VkIEVudGl0eUV2ZW50QmF0Y2hlcyBjYW4gbm90IGJlIGxvYWRlZCBhbnkgbW9yZVxuXHRcdFx0XHRcdC8vIHB1cmdlIGNhY2hlIGlmIG91dCBvZiBzeW5jXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5jYWNoZS5wdXJnZVN0b3JhZ2UoKVxuXHRcdFx0XHRcdC8vIFdlIHdhbnQgdXNlcnMgdG8gcmUtbG9naW4uIEJ5IHRoZSB0aW1lIHdlIGdldCBoZXJlIHRoZXkgcHJvYmFibHkgYWxyZWFkeSBoYXZlIGxvYWRlZCBzb21lIGVudGl0aWVzIHdoaWNoIHdlIGNhbm5vdCB1cGRhdGVcblx0XHRcdFx0XHR0aHJvdyBlXG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXHRcdFx0LmNhdGNoKChlKSA9PiB7XG5cdFx0XHRcdHRoaXMuZW50aXR5VXBkYXRlTWVzc2FnZVF1ZXVlLnJlc3VtZSgpXG5cblx0XHRcdFx0dGhpcy5ldmVudFF1ZXVlLnJlc3VtZSgpXG5cblx0XHRcdFx0dGhpcy5saXN0ZW5lci5vbkVycm9yKGUpXG5cdFx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBpbml0T25OZXdDb25uZWN0aW9uKCkge1xuXHRcdGNvbnN0IHsgbGFzdElkcywgc29tZUlkc1dlcmVDYWNoZWQgfSA9IGF3YWl0IHRoaXMucmV0cmlldmVMYXN0RW50aXR5RXZlbnRJZHMoKVxuXHRcdC8vIEZpcnN0LCB3ZSByZWNvcmQgbGFzdEVudGl0eUV2ZW50SWRzLiBXZSBuZWVkIHRoaXMgdG8ga25vdyB3aGF0IHdlIG5lZWQgdG8gcmUtZmV0Y2guXG5cdFx0Ly8gVGhpcyBpcyBub3QgdGhlIHNhbWUgYXMgdGhlIGNhY2hlIGJlY2F1c2Ugd2UgbWlnaHQgaGF2ZSBhbHJlYWR5IGRvd25sb2FkZWQgdGhlbSBidXQgY2FjaGUgbWlnaHQgbm90IGhhdmUgcHJvY2Vzc2VkIHRoZW0geWV0LlxuXHRcdC8vIEltcG9ydGFudDogZG8gaXQgaW4gb25lIHN0ZXAgc28gdGhhdCB3ZSBkb24ndCBoYXZlIHBhcnRpYWwgSURzIGluIHRoZSBtYXAgaW4gY2FzZSBhbiBlcnJvciBvY2N1cnMuXG5cdFx0dGhpcy5sYXN0RW50aXR5RXZlbnRJZHMgPSBsYXN0SWRzXG5cblx0XHQvLyBTZWNvbmQsIHdlIG5lZWQgdG8gaW5pdGlhbGl6ZSB0aGUgY2FjaGUgdG9vLlxuXHRcdGlmIChzb21lSWRzV2VyZUNhY2hlZCkge1xuXHRcdFx0Ly8gSWYgc29tZSBvZiB0aGUgbGFzdCBJRHMgd2VyZSByZXRyaWV2ZWQgZnJvbSB0aGUgY2FjaGUgdGhlbiB3ZSB3YW50IHRvIGxvYWQgZnJvbSB0aGF0IHBvaW50IHRvIGJyaW5nIGNhY2hlIHVwLXRvLWRhdGUuIFRoaXMgaXMgbW9zdGx5IGltcG9ydGFudCBmb3Jcblx0XHRcdC8vIHBlcnNpc3RlbnQgY2FjaGUuXG5cdFx0XHRhd2FpdCB0aGlzLmxvYWRNaXNzZWRFbnRpdHlFdmVudHModGhpcy5ldmVudFF1ZXVlKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBJZiB0aGUgY2FjaGUgaXMgY2xlYW4gdGhlbiB0aGlzIGlzIGEgY2xlYW4gY2FjaGUgKGVpdGhlciBlcGhlbWVyYWwgYWZ0ZXIgZmlyc3QgY29ubmVjdCBvciBwZXJzaXN0ZW50IHdpdGggZW1wdHkgREIpLlxuXHRcdFx0Ly8gV2UgbmVlZCB0byByZWNvcmQgdGhlIHRpbWUgZXZlbiBpZiB3ZSBkb24ndCBwcm9jZXNzIGFueXRoaW5nIHRvIGxhdGVyIGtub3cgaWYgd2UgYXJlIG91dCBvZiBzeW5jIG9yIG5vdC5cblx0XHRcdGF3YWl0IHRoaXMuY2FjaGUucmVjb3JkU3luY1RpbWUoKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBsYXRlc3QgZXZlbnQgYmF0Y2ggaWRzIGZvciBlYWNoIG9mIHRoZSB1c2VycyBncm91cHMgb3IgbWluIGlkIGlmIHRoZXJlIGlzIG5vIGV2ZW50IGJhdGNoIHlldC5cblx0ICogVGhpcyBpcyBuZWVkZWQgdG8ga25vdyBmcm9tIHdoZXJlIHRvIHN0YXJ0IGxvYWRpbmcgbWlzc2VkIGV2ZW50cyB3aGVuIHdlIGNvbm5lY3QuXG5cdCAqL1xuXHRwcml2YXRlIGFzeW5jIHJldHJpZXZlTGFzdEVudGl0eUV2ZW50SWRzKCk6IFByb21pc2U8eyBsYXN0SWRzOiBNYXA8SWQsIEFycmF5PElkPj47IHNvbWVJZHNXZXJlQ2FjaGVkOiBib29sZWFuIH0+IHtcblx0XHQvLyBzZXQgYWxsIGxhc3QgZXZlbnQgaWRzIGluIG9uZSBzdGVwIHRvIGF2b2lkIHRoYXQgd2UgaGF2ZSBqdXN0IHNldCB0aGVtIGZvciBhIGZldyBncm91cHMgd2hlbiBhIFNlcnZpY2VVbmF2YWlsYWJsZUVycm9yIG9jY3Vyc1xuXHRcdGNvbnN0IGxhc3RJZHM6IE1hcDxJZCwgQXJyYXk8SWQ+PiA9IG5ldyBNYXAoKVxuXHRcdGxldCBzb21lSWRzV2VyZUNhY2hlZCA9IGZhbHNlXG5cdFx0Zm9yIChjb25zdCBncm91cElkIG9mIHRoaXMuZXZlbnRHcm91cHMoKSkge1xuXHRcdFx0Y29uc3QgY2FjaGVkQmF0Y2hJZCA9IGF3YWl0IHRoaXMuY2FjaGUuZ2V0TGFzdEVudGl0eUV2ZW50QmF0Y2hGb3JHcm91cChncm91cElkKVxuXHRcdFx0aWYgKGNhY2hlZEJhdGNoSWQgIT0gbnVsbCkge1xuXHRcdFx0XHRsYXN0SWRzLnNldChncm91cElkLCBbY2FjaGVkQmF0Y2hJZF0pXG5cdFx0XHRcdHNvbWVJZHNXZXJlQ2FjaGVkID0gdHJ1ZVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgYmF0Y2hlcyA9IGF3YWl0IHRoaXMuZW50aXR5LmxvYWRSYW5nZShFbnRpdHlFdmVudEJhdGNoVHlwZVJlZiwgZ3JvdXBJZCwgR0VORVJBVEVEX01BWF9JRCwgMSwgdHJ1ZSlcblx0XHRcdFx0Y29uc3QgYmF0Y2hJZCA9IGJhdGNoZXMubGVuZ3RoID09PSAxID8gZ2V0RWxlbWVudElkKGJhdGNoZXNbMF0pIDogR0VORVJBVEVEX01JTl9JRFxuXHRcdFx0XHRsYXN0SWRzLnNldChncm91cElkLCBbYmF0Y2hJZF0pXG5cdFx0XHRcdC8vIEluIGNhc2Ugd2UgZG9uJ3QgcmVjZWl2ZSBhbnkgZXZlbnRzIGZvciB0aGUgZ3JvdXAgdGhpcyB0aW1lIHdlIHdhbnQgdG8gc3RpbGwgZG93bmxvYWQgZnJvbSB0aGlzIHBvaW50IG5leHQgdGltZS5cblx0XHRcdFx0YXdhaXQgdGhpcy5jYWNoZS5zZXRMYXN0RW50aXR5RXZlbnRCYXRjaEZvckdyb3VwKGdyb3VwSWQsIGJhdGNoSWQpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHsgbGFzdElkcywgc29tZUlkc1dlcmVDYWNoZWQgfVxuXHR9XG5cblx0LyoqIExvYWQgZXZlbnQgYmF0Y2hlcyBzaW5jZSB0aGUgbGFzdCB0aW1lIHdlIHdlcmUgY29ubmVjdGVkIHRvIGJyaW5nIGNhY2hlIGFuZCBvdGhlciB0aGluZ3MgdXAtdG8tZGF0ZS5cblx0ICogQHBhcmFtIGV2ZW50UXVldWUgaXMgcGFzc2VkIGluIGZvciB0ZXN0aW5nXG5cdCAqIEBWaXNpYmxlRm9yVGVzdGluZ1xuXHQgKiAqL1xuXHRhc3luYyBsb2FkTWlzc2VkRW50aXR5RXZlbnRzKGV2ZW50UXVldWU6IEV2ZW50UXVldWUpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoIXRoaXMudXNlckZhY2FkZS5pc0Z1bGx5TG9nZ2VkSW4oKSkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0YXdhaXQgdGhpcy5jaGVja091dE9mU3luYygpXG5cblx0XHRsZXQgZXZlbnRCYXRjaGVzOiBFbnRpdHlFdmVudEJhdGNoW10gPSBbXVxuXHRcdGZvciAobGV0IGdyb3VwSWQgb2YgdGhpcy5ldmVudEdyb3VwcygpKSB7XG5cdFx0XHRjb25zdCBldmVudEJhdGNoRm9yR3JvdXAgPSBhd2FpdCB0aGlzLmxvYWRFbnRpdHlFdmVudHNGb3JHcm91cChncm91cElkKVxuXHRcdFx0ZXZlbnRCYXRjaGVzID0gZXZlbnRCYXRjaGVzLmNvbmNhdChldmVudEJhdGNoRm9yR3JvdXApXG5cdFx0fVxuXG5cdFx0Y29uc3QgdGltZVNvcnRlZEV2ZW50QmF0Y2hlcyA9IGV2ZW50QmF0Y2hlcy5zb3J0KChhLCBiKSA9PiBjb21wYXJlT2xkZXN0Rmlyc3QoZ2V0RWxlbWVudElkKGEpLCBnZXRFbGVtZW50SWQoYikpKVxuXHRcdC8vIENvdW50IGFsbCBiYXRjaGVzIHRoYXQgd2lsbCBhY3R1YWxseSBiZSBwcm9jZXNzZWQgc28gdGhhdCB0aGUgcHJvZ3Jlc3MgaXMgY29ycmVjdFxuXHRcdGxldCB0b3RhbEV4cGVjdGVkQmF0Y2hlcyA9IDBcblx0XHRmb3IgKGNvbnN0IGJhdGNoIG9mIHRpbWVTb3J0ZWRFdmVudEJhdGNoZXMpIHtcblx0XHRcdGNvbnN0IGZpbHRlcmVkRW50aXR5VXBkYXRlcyA9IGF3YWl0IHRoaXMucmVtb3ZlVW5rbm93blR5cGVzKGJhdGNoLmV2ZW50cylcblx0XHRcdGNvbnN0IGJhdGNoV2FzQWRkZWRUb1F1ZXVlID0gdGhpcy5hZGRCYXRjaChnZXRFbGVtZW50SWQoYmF0Y2gpLCBnZXRMaXN0SWQoYmF0Y2gpLCBmaWx0ZXJlZEVudGl0eVVwZGF0ZXMsIGV2ZW50UXVldWUpXG5cdFx0XHRpZiAoYmF0Y2hXYXNBZGRlZFRvUXVldWUpIHtcblx0XHRcdFx0dG90YWxFeHBlY3RlZEJhdGNoZXMrK1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFdlIG9ubHkgaGF2ZSB0aGUgY29ycmVjdCBhbW91bnQgb2YgdG90YWwgd29yayBhZnRlciBhZGRpbmcgYWxsIGVudGl0eSBldmVudCBiYXRjaGVzLlxuXHRcdC8vIFRoZSBwcm9ncmVzcyBmb3IgcHJvY2Vzc2VkIGJhdGNoZXMgaXMgdHJhY2tlZCBpbnNpZGUgdGhlIGV2ZW50IHF1ZXVlLlxuXHRcdGNvbnN0IHByb2dyZXNzTW9uaXRvciA9IG5ldyBQcm9ncmVzc01vbml0b3JEZWxlZ2F0ZSh0aGlzLnByb2dyZXNzVHJhY2tlciwgdG90YWxFeHBlY3RlZEJhdGNoZXMgKyAxKVxuXHRcdGNvbnNvbGUubG9nKFwid3NcIiwgYHByb2dyZXNzIG1vbml0b3IgZXhwZWN0cyAke3RvdGFsRXhwZWN0ZWRCYXRjaGVzfSBldmVudHNgKVxuXHRcdGF3YWl0IHByb2dyZXNzTW9uaXRvci53b3JrRG9uZSgxKSAvLyBzaG93IHByb2dyZXNzIHJpZ2h0IGF3YXlcblx0XHRldmVudFF1ZXVlLnNldFByb2dyZXNzTW9uaXRvcihwcm9ncmVzc01vbml0b3IpXG5cblx0XHQvLyBXZSd2ZSBsb2FkZWQgYWxsIHRoZSBiYXRjaGVzLCB3ZSd2ZSBhZGRlZCB0aGVtIHRvIHRoZSBxdWV1ZSwgd2UgY2FuIGxldCB0aGUgY2FjaGUgcmVtZW1iZXIgc3luYyBwb2ludCBmb3IgdXMgdG8gZGV0ZWN0IG91dCBvZiBzeW5jIG5vdy5cblx0XHQvLyBJdCBpcyBwb3NzaWJsZSB0aGF0IHdlIHdpbGwgcmVjb3JkIHRoZSB0aW1lIGJlZm9yZSB0aGUgYmF0Y2ggd2lsbCBiZSBwcm9jZXNzZWQgYnV0IHRoZSByaXNrIGlzIGxvdy5cblx0XHRhd2FpdCB0aGlzLmNhY2hlLnJlY29yZFN5bmNUaW1lKClcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgbG9hZEVudGl0eUV2ZW50c0Zvckdyb3VwKGdyb3VwSWQ6IElkKTogUHJvbWlzZTxFbnRpdHlFdmVudEJhdGNoW10+IHtcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIGF3YWl0IHRoaXMuZW50aXR5LmxvYWRBbGwoRW50aXR5RXZlbnRCYXRjaFR5cGVSZWYsIGdyb3VwSWQsIHRoaXMuZ2V0TGFzdEV2ZW50QmF0Y2hJZE9yTWluSWRGb3JHcm91cChncm91cElkKSlcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoZSBpbnN0YW5jZW9mIE5vdEF1dGhvcml6ZWRFcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIndzIGNvdWxkIG5vdCBkb3dubG9hZCBlbnRpdHkgdXBkYXRlcywgbG9zdCBwZXJtaXNzaW9uXCIpXG5cdFx0XHRcdHJldHVybiBbXVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgY2hlY2tPdXRPZlN5bmMoKSB7XG5cdFx0Ly8gV2UgdHJ5IHRvIGRldGVjdCB3aGV0aGVyIGV2ZW50IGJhdGNoZXMgaGF2ZSBhbHJlYWR5IGV4cGlyZWQuXG5cdFx0Ly8gSWYgdGhpcyBoYXBwZW5lZCB3ZSBkb24ndCBuZWVkIHRvIGRvd25sb2FkIGFueXRoaW5nLCB3ZSBuZWVkIHRvIHB1cmdlIHRoZSBjYWNoZSBhbmQgc3RhcnQgYWxsIG92ZXIuXG5cdFx0aWYgKGF3YWl0IHRoaXMuY2FjaGUuaXNPdXRPZlN5bmMoKSkge1xuXHRcdFx0Ly8gV2UgaGFuZGxlIGl0IHdoZXJlIHdlIGluaXRpYWxpemUgdGhlIGNvbm5lY3Rpb24gYW5kIHB1cmdlIHRoZSBjYWNoZSB0aGVyZS5cblx0XHRcdHRocm93IG5ldyBPdXRPZlN5bmNFcnJvcihcInNvbWUgbWlzc2VkIEVudGl0eUV2ZW50QmF0Y2hlcyBjYW5ub3QgYmUgbG9hZGVkIGFueSBtb3JlXCIpXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBldmVudFF1ZXVlQ2FsbGJhY2sobW9kaWZpY2F0aW9uOiBRdWV1ZWRCYXRjaCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCB0aGlzLnByb2Nlc3NFdmVudEJhdGNoKG1vZGlmaWNhdGlvbilcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIndzIGVycm9yIHdoaWxlIHByb2Nlc3NpbmcgZXZlbnQgYmF0Y2hlc1wiLCBlKVxuXHRcdFx0dGhpcy5saXN0ZW5lci5vbkVycm9yKGUpXG5cdFx0XHR0aHJvdyBlXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBlbnRpdHlVcGRhdGVNZXNzYWdlUXVldWVDYWxsYmFjayhiYXRjaDogUXVldWVkQmF0Y2gpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0aGlzLmFkZEJhdGNoKGJhdGNoLmJhdGNoSWQsIGJhdGNoLmdyb3VwSWQsIGJhdGNoLmV2ZW50cywgdGhpcy5ldmVudFF1ZXVlKVxuXHRcdHRoaXMuZXZlbnRRdWV1ZS5yZXN1bWUoKVxuXHR9XG5cblx0cHJpdmF0ZSB1bnN1YnNjcmliZUZyb21PbGRXZWJzb2NrZXQoKSB7XG5cdFx0aWYgKHRoaXMuc29ja2V0KSB7XG5cdFx0XHQvLyBSZW1vdmUgbGlzdGVuZXJzLiBXZSBkb24ndCB3YW50IG9sZCBzb2NrZXQgdG8gbWVzcyBvdXIgc3RhdGVcblx0XHRcdHRoaXMuc29ja2V0Lm9ub3BlbiA9IHRoaXMuc29ja2V0Lm9uY2xvc2UgPSB0aGlzLnNvY2tldC5vbmVycm9yID0gdGhpcy5zb2NrZXQub25tZXNzYWdlID0gaWRlbnRpdHlcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHRlcm1pbmF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0aGlzLnN0YXRlID0gRXZlbnRCdXNTdGF0ZS5UZXJtaW5hdGVkXG5cblx0XHR0aGlzLnJlc2V0KClcblxuXHRcdHRoaXMubGlzdGVuZXIub25XZWJzb2NrZXRTdGF0ZUNoYW5nZWQoV3NDb25uZWN0aW9uU3RhdGUudGVybWluYXRlZClcblx0fVxuXG5cdC8qKlxuXHQgKiBUcmllcyB0byByZWNvbm5lY3QgdGhlIHdlYnNvY2tldCBpZiBpdCBpcyBub3QgY29ubmVjdGVkLlxuXHQgKi9cblx0cHJpdmF0ZSByZWNvbm5lY3QoY2xvc2VJZk9wZW46IGJvb2xlYW4sIGVuYWJsZUF1dG9tYXRpY1N0YXRlOiBib29sZWFuKSB7XG5cdFx0Y29uc29sZS5sb2coXG5cdFx0XHRcIndzIHJlY29ubmVjdCBzb2NrZXQucmVhZHlTdGF0ZTogKENPTk5FQ1RJTkc9MCwgT1BFTj0xLCBDTE9TSU5HPTIsIENMT1NFRD0zKTogXCIgKyAodGhpcy5zb2NrZXQgPyB0aGlzLnNvY2tldC5yZWFkeVN0YXRlIDogXCJudWxsXCIpLFxuXHRcdFx0XCJzdGF0ZTpcIixcblx0XHRcdHRoaXMuc3RhdGUsXG5cdFx0XHRcImNsb3NlSWZPcGVuOlwiLFxuXHRcdFx0Y2xvc2VJZk9wZW4sXG5cdFx0XHRcImVuYWJsZUF1dG9tYXRpY1N0YXRlOlwiLFxuXHRcdFx0ZW5hYmxlQXV0b21hdGljU3RhdGUsXG5cdFx0KVxuXG5cdFx0aWYgKHRoaXMuc3RhdGUgIT09IEV2ZW50QnVzU3RhdGUuVGVybWluYXRlZCAmJiBlbmFibGVBdXRvbWF0aWNTdGF0ZSkge1xuXHRcdFx0dGhpcy5zdGF0ZSA9IEV2ZW50QnVzU3RhdGUuQXV0b21hdGljXG5cdFx0fVxuXG5cdFx0aWYgKGNsb3NlSWZPcGVuICYmIHRoaXMuc29ja2V0ICYmIHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5PUEVOKSB7XG5cdFx0XHR0aGlzLmltbWVkaWF0ZVJlY29ubmVjdCA9IHRydWVcblx0XHRcdHRoaXMuc29ja2V0LmNsb3NlKClcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0KHRoaXMuc29ja2V0ID09IG51bGwgfHwgdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NFRCB8fCB0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0lORykgJiZcblx0XHRcdHRoaXMuc3RhdGUgIT09IEV2ZW50QnVzU3RhdGUuVGVybWluYXRlZCAmJlxuXHRcdFx0dGhpcy51c2VyRmFjYWRlLmlzRnVsbHlMb2dnZWRJbigpXG5cdFx0KSB7XG5cdFx0XHQvLyBEb24ndCB0cnkgdG8gY29ubmVjdCByaWdodCBhd2F5IGJlY2F1c2UgY29ubmVjdGlvbiBtYXkgbm90IGJlIGFjdHVhbGx5IHRoZXJlXG5cdFx0XHQvLyBzZWUgIzExNjVcblx0XHRcdGlmICh0aGlzLmNvbm5lY3RUaW1lcikge1xuXHRcdFx0XHRjbGVhclRpbWVvdXQodGhpcy5jb25uZWN0VGltZXIpXG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuY29ubmVjdFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLmNvbm5lY3QoQ29ubmVjdE1vZGUuUmVjb25uZWN0KSwgMTAwKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYWRkQmF0Y2goYmF0Y2hJZDogSWQsIGdyb3VwSWQ6IElkLCBldmVudHM6IFJlYWRvbmx5QXJyYXk8RW50aXR5VXBkYXRlPiwgZXZlbnRRdWV1ZTogRXZlbnRRdWV1ZSk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGxhc3RGb3JHcm91cCA9IHRoaXMubGFzdEVudGl0eUV2ZW50SWRzLmdldChncm91cElkKSB8fCBbXVxuXHRcdC8vIGZpbmQgdGhlIHBvc2l0aW9uIGZvciBpbnNlcnRpbmcgaW50byBsYXN0IGVudGl0eSBldmVudHMgKG5lZ2F0aXZlIHZhbHVlIGlzIGNvbnNpZGVyZWQgYXMgbm90IHByZXNlbnQgaW4gdGhlIGFycmF5KVxuXHRcdGNvbnN0IGluZGV4ID0gYmluYXJ5U2VhcmNoKGxhc3RGb3JHcm91cCwgYmF0Y2hJZCwgY29tcGFyZU9sZGVzdEZpcnN0KVxuXHRcdGxldCB3YXNBZGRlZFxuXG5cdFx0aWYgKGluZGV4IDwgMCkge1xuXHRcdFx0bGFzdEZvckdyb3VwLnNwbGljZSgtaW5kZXgsIDAsIGJhdGNoSWQpXG5cdFx0XHQvLyBvbmx5IGFkZCB0aGUgYmF0Y2ggaWYgaXQgd2FzIG5vdCBwcm9jZXNzIGJlZm9yZVxuXHRcdFx0d2FzQWRkZWQgPSBldmVudFF1ZXVlLmFkZChiYXRjaElkLCBncm91cElkLCBldmVudHMpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHdhc0FkZGVkID0gZmFsc2Vcblx0XHR9XG5cblx0XHRpZiAobGFzdEZvckdyb3VwLmxlbmd0aCA+IE1BWF9FVkVOVF9JRFNfUVVFVUVfTEVOR1RIKSB7XG5cdFx0XHRsYXN0Rm9yR3JvdXAuc2hpZnQoKVxuXHRcdH1cblxuXHRcdHRoaXMubGFzdEVudGl0eUV2ZW50SWRzLnNldChiYXRjaElkLCBsYXN0Rm9yR3JvdXApXG5cblx0XHRpZiAod2FzQWRkZWQpIHtcblx0XHRcdHRoaXMubGFzdEFkZGVkQmF0Y2hGb3JHcm91cC5zZXQoZ3JvdXBJZCwgYmF0Y2hJZClcblx0XHR9XG5cdFx0cmV0dXJuIHdhc0FkZGVkXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHByb2Nlc3NFdmVudEJhdGNoKGJhdGNoOiBRdWV1ZWRCYXRjaCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAodGhpcy5pc1Rlcm1pbmF0ZWQoKSkgcmV0dXJuXG5cdFx0XHRjb25zdCBmaWx0ZXJlZEV2ZW50cyA9IGF3YWl0IHRoaXMuY2FjaGUuZW50aXR5RXZlbnRzUmVjZWl2ZWQoYmF0Y2gpXG5cdFx0XHRpZiAoIXRoaXMuaXNUZXJtaW5hdGVkKCkpIGF3YWl0IHRoaXMubGlzdGVuZXIub25FbnRpdHlFdmVudHNSZWNlaXZlZChmaWx0ZXJlZEV2ZW50cywgYmF0Y2guYmF0Y2hJZCwgYmF0Y2guZ3JvdXBJZClcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoZSBpbnN0YW5jZW9mIFNlcnZpY2VVbmF2YWlsYWJsZUVycm9yKSB7XG5cdFx0XHRcdC8vIGEgU2VydmljZVVuYXZhaWxhYmxlRXJyb3IgaXMgYSB0ZW1wb3JhcnkgZXJyb3IgYW5kIHdlIGhhdmUgdG8gcmV0cnkgdG8gYXZvaWQgZGF0YSBpbmNvbnNpc3RlbmNpZXNcblx0XHRcdFx0Y29uc29sZS5sb2coXCJ3cyByZXRyeSBwcm9jZXNzaW5nIGV2ZW50IGluIDMwc1wiLCBlKVxuXHRcdFx0XHRjb25zdCByZXRyeVByb21pc2UgPSBkZWxheShSRVRSWV9BRlRFUl9TRVJWSUNFX1VOQVZBSUxBQkxFX0VSUk9SX01TKS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHQvLyBpZiB3ZSBoYXZlIGEgd2Vic29ja2V0IHJlY29ubmVjdCB3ZSBoYXZlIHRvIHN0b3AgcmV0cnlpbmdcblx0XHRcdFx0XHRpZiAodGhpcy5zZXJ2aWNlVW5hdmFpbGFibGVSZXRyeSA9PT0gcmV0cnlQcm9taXNlKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5wcm9jZXNzRXZlbnRCYXRjaChiYXRjaClcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IENhbmNlbGxlZEVycm9yKFwic3RvcCByZXRyeSBwcm9jZXNzaW5nIGFmdGVyIHNlcnZpY2UgdW5hdmFpbGFibGUgZHVlIHRvIHJlY29ubmVjdFwiKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0dGhpcy5zZXJ2aWNlVW5hdmFpbGFibGVSZXRyeSA9IHJldHJ5UHJvbWlzZVxuXHRcdFx0XHRyZXR1cm4gcmV0cnlQcm9taXNlXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIkVWRU5UXCIsIFwiZXJyb3JcIiwgZSlcblx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgZ2V0TGFzdEV2ZW50QmF0Y2hJZE9yTWluSWRGb3JHcm91cChncm91cElkOiBJZCk6IElkIHtcblx0XHRjb25zdCBsYXN0SWRzID0gdGhpcy5sYXN0RW50aXR5RXZlbnRJZHMuZ2V0KGdyb3VwSWQpXG5cblx0XHRyZXR1cm4gbGFzdElkcyAmJiBsYXN0SWRzLmxlbmd0aCA+IDAgPyBsYXN0VGhyb3cobGFzdElkcykgOiBHRU5FUkFURURfTUlOX0lEXG5cdH1cblxuXHRwcml2YXRlIGlzVGVybWluYXRlZCgpIHtcblx0XHRyZXR1cm4gdGhpcy5zdGF0ZSA9PT0gRXZlbnRCdXNTdGF0ZS5UZXJtaW5hdGVkXG5cdH1cblxuXHRwcml2YXRlIGV2ZW50R3JvdXBzKCk6IElkW10ge1xuXHRcdHJldHVybiB0aGlzLnVzZXJGYWNhZGVcblx0XHRcdC5nZXRMb2dnZWRJblVzZXIoKVxuXHRcdFx0Lm1lbWJlcnNoaXBzLmZpbHRlcigobWVtYmVyc2hpcCkgPT4gbWVtYmVyc2hpcC5ncm91cFR5cGUgIT09IEdyb3VwVHlwZS5NYWlsaW5nTGlzdClcblx0XHRcdC5tYXAoKG1lbWJlcnNoaXApID0+IG1lbWJlcnNoaXAuZ3JvdXApXG5cdFx0XHQuY29uY2F0KHRoaXMudXNlckZhY2FkZS5nZXRMb2dnZWRJblVzZXIoKS51c2VyR3JvdXAuZ3JvdXApXG5cdH1cbn1cbiIsIi8vIFRoaXMgaXMgYW4gdW5mb3J0dW5hdGUgcmVwbGFjZW1lbnQgZm9yIEBzaW5kcmVzb3JodXMvaXMgdGhhdCB3ZSBuZWVkIHRvXG4vLyByZS1pbXBsZW1lbnQgZm9yIHBlcmZvcm1hbmNlIHB1cnBvc2VzLiBJbiBwYXJ0aWN1bGFyIHRoZSBpcy5vYnNlcnZhYmxlKClcbi8vIGNoZWNrIGlzIGV4cGVuc2l2ZSwgYW5kIHVubmVjZXNzYXJ5IGZvciBvdXIgcHVycG9zZXMuIFRoZSB2YWx1ZXMgcmV0dXJuZWRcbi8vIGFyZSBjb21wYXRpYmxlIHdpdGggQHNpbmRyZXNvcmh1cy9pcywgaG93ZXZlci5cblxuY29uc3QgdHlwZW9mcyA9IFtcbiAgJ3N0cmluZycsXG4gICdudW1iZXInLFxuICAnYmlnaW50JyxcbiAgJ3N5bWJvbCdcbl07XG5cbmNvbnN0IG9iamVjdFR5cGVOYW1lcyA9IFtcbiAgJ0Z1bmN0aW9uJyxcbiAgJ0dlbmVyYXRvcicsXG4gICdBc3luY0dlbmVyYXRvcicsXG4gICdHZW5lcmF0b3JGdW5jdGlvbicsXG4gICdBc3luY0dlbmVyYXRvckZ1bmN0aW9uJyxcbiAgJ0FzeW5jRnVuY3Rpb24nLFxuICAnT2JzZXJ2YWJsZScsXG4gICdBcnJheScsXG4gICdCdWZmZXInLFxuICAnT2JqZWN0JyxcbiAgJ1JlZ0V4cCcsXG4gICdEYXRlJyxcbiAgJ0Vycm9yJyxcbiAgJ01hcCcsXG4gICdTZXQnLFxuICAnV2Vha01hcCcsXG4gICdXZWFrU2V0JyxcbiAgJ0FycmF5QnVmZmVyJyxcbiAgJ1NoYXJlZEFycmF5QnVmZmVyJyxcbiAgJ0RhdGFWaWV3JyxcbiAgJ1Byb21pc2UnLFxuICAnVVJMJyxcbiAgJ0hUTUxFbGVtZW50JyxcbiAgJ0ludDhBcnJheScsXG4gICdVaW50OEFycmF5JyxcbiAgJ1VpbnQ4Q2xhbXBlZEFycmF5JyxcbiAgJ0ludDE2QXJyYXknLFxuICAnVWludDE2QXJyYXknLFxuICAnSW50MzJBcnJheScsXG4gICdVaW50MzJBcnJheScsXG4gICdGbG9hdDMyQXJyYXknLFxuICAnRmxvYXQ2NEFycmF5JyxcbiAgJ0JpZ0ludDY0QXJyYXknLFxuICAnQmlnVWludDY0QXJyYXknXG5dO1xuXG4vKipcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gaXMgKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiAnbnVsbCdcbiAgfVxuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiAndW5kZWZpbmVkJ1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gJ2Jvb2xlYW4nXG4gIH1cbiAgY29uc3QgdHlwZU9mID0gdHlwZW9mIHZhbHVlO1xuICBpZiAodHlwZW9mcy5pbmNsdWRlcyh0eXBlT2YpKSB7XG4gICAgcmV0dXJuIHR5cGVPZlxuICB9XG4gIC8qIGM4IGlnbm9yZSBuZXh0IDQgKi9cbiAgLy8gbm90IGdvaW5nIHRvIGJvdGhlciB0ZXN0aW5nIHRoaXMsIGl0J3Mgbm90IGdvaW5nIHRvIGJlIHZhbGlkIGFueXdheVxuICBpZiAodHlwZU9mID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuICdGdW5jdGlvbidcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gJ0FycmF5J1xuICB9XG4gIGlmIChpc0J1ZmZlciQxKHZhbHVlKSkge1xuICAgIHJldHVybiAnQnVmZmVyJ1xuICB9XG4gIGNvbnN0IG9iamVjdFR5cGUgPSBnZXRPYmplY3RUeXBlKHZhbHVlKTtcbiAgaWYgKG9iamVjdFR5cGUpIHtcbiAgICByZXR1cm4gb2JqZWN0VHlwZVxuICB9XG4gIC8qIGM4IGlnbm9yZSBuZXh0ICovXG4gIHJldHVybiAnT2JqZWN0J1xufVxuXG4vKipcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyJDEgKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAmJiB2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5pc0J1ZmZlciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5pc0J1ZmZlci5jYWxsKG51bGwsIHZhbHVlKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuICogQHJldHVybnMge3N0cmluZ3x1bmRlZmluZWR9XG4gKi9cbmZ1bmN0aW9uIGdldE9iamVjdFR5cGUgKHZhbHVlKSB7XG4gIGNvbnN0IG9iamVjdFR5cGVOYW1lID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKS5zbGljZSg4LCAtMSk7XG4gIGlmIChvYmplY3RUeXBlTmFtZXMuaW5jbHVkZXMob2JqZWN0VHlwZU5hbWUpKSB7XG4gICAgcmV0dXJuIG9iamVjdFR5cGVOYW1lXG4gIH1cbiAgLyogYzggaWdub3JlIG5leHQgKi9cbiAgcmV0dXJuIHVuZGVmaW5lZFxufVxuXG5jbGFzcyBUeXBlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYWpvclxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHRlcm1pbmFsXG4gICAqL1xuICBjb25zdHJ1Y3RvciAobWFqb3IsIG5hbWUsIHRlcm1pbmFsKSB7XG4gICAgdGhpcy5tYWpvciA9IG1ham9yO1xuICAgIHRoaXMubWFqb3JFbmNvZGVkID0gbWFqb3IgPDwgNTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMudGVybWluYWwgPSB0ZXJtaW5hbDtcbiAgfVxuXG4gIC8qIGM4IGlnbm9yZSBuZXh0IDMgKi9cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBgVHlwZVske3RoaXMubWFqb3J9XS4ke3RoaXMubmFtZX1gXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtUeXBlfSB0eXBcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIGNvbXBhcmUgKHR5cCkge1xuICAgIC8qIGM4IGlnbm9yZSBuZXh0IDEgKi9cbiAgICByZXR1cm4gdGhpcy5tYWpvciA8IHR5cC5tYWpvciA/IC0xIDogdGhpcy5tYWpvciA+IHR5cC5tYWpvciA/IDEgOiAwXG4gIH1cbn1cblxuLy8gY29udmVydCB0byBzdGF0aWMgZmllbGRzIHdoZW4gYmV0dGVyIHN1cHBvcnRlZFxuVHlwZS51aW50ID0gbmV3IFR5cGUoMCwgJ3VpbnQnLCB0cnVlKTtcblR5cGUubmVnaW50ID0gbmV3IFR5cGUoMSwgJ25lZ2ludCcsIHRydWUpO1xuVHlwZS5ieXRlcyA9IG5ldyBUeXBlKDIsICdieXRlcycsIHRydWUpO1xuVHlwZS5zdHJpbmcgPSBuZXcgVHlwZSgzLCAnc3RyaW5nJywgdHJ1ZSk7XG5UeXBlLmFycmF5ID0gbmV3IFR5cGUoNCwgJ2FycmF5JywgZmFsc2UpO1xuVHlwZS5tYXAgPSBuZXcgVHlwZSg1LCAnbWFwJywgZmFsc2UpO1xuVHlwZS50YWcgPSBuZXcgVHlwZSg2LCAndGFnJywgZmFsc2UpOyAvLyB0ZXJtaW5hbD9cblR5cGUuZmxvYXQgPSBuZXcgVHlwZSg3LCAnZmxvYXQnLCB0cnVlKTtcblR5cGUuZmFsc2UgPSBuZXcgVHlwZSg3LCAnZmFsc2UnLCB0cnVlKTtcblR5cGUudHJ1ZSA9IG5ldyBUeXBlKDcsICd0cnVlJywgdHJ1ZSk7XG5UeXBlLm51bGwgPSBuZXcgVHlwZSg3LCAnbnVsbCcsIHRydWUpO1xuVHlwZS51bmRlZmluZWQgPSBuZXcgVHlwZSg3LCAndW5kZWZpbmVkJywgdHJ1ZSk7XG5UeXBlLmJyZWFrID0gbmV3IFR5cGUoNywgJ2JyZWFrJywgdHJ1ZSk7XG4vLyBUeXBlLmluZGVmaW5pdGVMZW5ndGggPSBuZXcgVHlwZSgwLCAnaW5kZWZpbml0ZUxlbmd0aCcsIHRydWUpXG5cbmNsYXNzIFRva2VuIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7VHlwZX0gdHlwZVxuICAgKiBAcGFyYW0ge2FueX0gW3ZhbHVlXVxuICAgKiBAcGFyYW0ge251bWJlcn0gW2VuY29kZWRMZW5ndGhdXG4gICAqL1xuICBjb25zdHJ1Y3RvciAodHlwZSwgdmFsdWUsIGVuY29kZWRMZW5ndGgpIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmVuY29kZWRMZW5ndGggPSBlbmNvZGVkTGVuZ3RoO1xuICAgIC8qKiBAdHlwZSB7VWludDhBcnJheXx1bmRlZmluZWR9ICovXG4gICAgdGhpcy5lbmNvZGVkQnl0ZXMgPSB1bmRlZmluZWQ7XG4gICAgLyoqIEB0eXBlIHtVaW50OEFycmF5fHVuZGVmaW5lZH0gKi9cbiAgICB0aGlzLmJ5dGVWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qIGM4IGlnbm9yZSBuZXh0IDMgKi9cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBgVG9rZW5bJHt0aGlzLnR5cGV9XS4ke3RoaXMudmFsdWV9YFxuICB9XG59XG5cbi8vIFVzZSBVaW50OEFycmF5IGRpcmVjdGx5IGluIHRoZSBicm93c2VyLCB1c2UgQnVmZmVyIGluIE5vZGUuanMgYnV0IGRvbid0XG4vLyBzcGVhayBpdHMgbmFtZSBkaXJlY3RseSB0byBhdm9pZCBidW5kbGVycyBwdWxsaW5nIGluIHRoZSBgQnVmZmVyYCBwb2x5ZmlsbFxuXG4vLyBAdHMtaWdub3JlXG5jb25zdCB1c2VCdWZmZXIgPSBnbG9iYWxUaGlzLnByb2Nlc3MgJiZcbiAgLy8gQHRzLWlnbm9yZVxuICAhZ2xvYmFsVGhpcy5wcm9jZXNzLmJyb3dzZXIgJiZcbiAgLy8gQHRzLWlnbm9yZVxuICBnbG9iYWxUaGlzLkJ1ZmZlciAmJlxuICAvLyBAdHMtaWdub3JlXG4gIHR5cGVvZiBnbG9iYWxUaGlzLkJ1ZmZlci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJztcblxuY29uc3QgdGV4dERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcbmNvbnN0IHRleHRFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBidWZcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0J1ZmZlciAoYnVmKSB7XG4gIC8vIEB0cy1pZ25vcmVcbiAgcmV0dXJuIHVzZUJ1ZmZlciAmJiBnbG9iYWxUaGlzLkJ1ZmZlci5pc0J1ZmZlcihidWYpXG59XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fG51bWJlcltdfSBidWZcbiAqIEByZXR1cm5zIHtVaW50OEFycmF5fVxuICovXG5mdW5jdGlvbiBhc1U4QSAoYnVmKSB7XG4gIC8qIGM4IGlnbm9yZSBuZXh0ICovXG4gIGlmICghKGJ1ZiBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpKSB7XG4gICAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbShidWYpXG4gIH1cbiAgcmV0dXJuIGlzQnVmZmVyKGJ1ZikgPyBuZXcgVWludDhBcnJheShidWYuYnVmZmVyLCBidWYuYnl0ZU9mZnNldCwgYnVmLmJ5dGVMZW5ndGgpIDogYnVmXG59XG5cbmNvbnN0IHRvU3RyaW5nID0gdXNlQnVmZmVyXG4gID8gLy8gZXNsaW50LWRpc2FibGUtbGluZSBvcGVyYXRvci1saW5lYnJlYWtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGJ5dGVzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVuZFxuICAgICAqL1xuICAgIChieXRlcywgc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgcmV0dXJuIGVuZCAtIHN0YXJ0ID4gNjRcbiAgICAgICAgPyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG9wZXJhdG9yLWxpbmVicmVha1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBnbG9iYWxUaGlzLkJ1ZmZlci5mcm9tKGJ5dGVzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKS50b1N0cmluZygndXRmOCcpXG4gICAgICAgIDogdXRmOFNsaWNlKGJ5dGVzLCBzdGFydCwgZW5kKVxuICAgIH1cbiAgLyogYzggaWdub3JlIG5leHQgMTEgKi9cbiAgOiAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG9wZXJhdG9yLWxpbmVicmVha1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7VWludDhBcnJheX0gYnl0ZXNcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnRcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZW5kXG4gICAgICovXG4gICAgKGJ5dGVzLCBzdGFydCwgZW5kKSA9PiB7XG4gICAgICByZXR1cm4gZW5kIC0gc3RhcnQgPiA2NFxuICAgICAgICA/IHRleHREZWNvZGVyLmRlY29kZShieXRlcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgICAgICAgOiB1dGY4U2xpY2UoYnl0ZXMsIHN0YXJ0LCBlbmQpXG4gICAgfTtcblxuY29uc3QgZnJvbVN0cmluZyA9IHVzZUJ1ZmZlclxuICA/IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgb3BlcmF0b3ItbGluZWJyZWFrXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZ1xuICAgICAqL1xuICAgIChzdHJpbmcpID0+IHtcbiAgICAgIHJldHVybiBzdHJpbmcubGVuZ3RoID4gNjRcbiAgICAgICAgPyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG9wZXJhdG9yLWxpbmVicmVha1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBnbG9iYWxUaGlzLkJ1ZmZlci5mcm9tKHN0cmluZylcbiAgICAgICAgOiB1dGY4VG9CeXRlcyhzdHJpbmcpXG4gICAgfVxuICAvKiBjOCBpZ25vcmUgbmV4dCA3ICovXG4gIDogLy8gZXNsaW50LWRpc2FibGUtbGluZSBvcGVyYXRvci1saW5lYnJlYWtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nXG4gICAgICovXG4gICAgKHN0cmluZykgPT4ge1xuICAgICAgcmV0dXJuIHN0cmluZy5sZW5ndGggPiA2NCA/IHRleHRFbmNvZGVyLmVuY29kZShzdHJpbmcpIDogdXRmOFRvQnl0ZXMoc3RyaW5nKVxuICAgIH07XG5cbi8qKlxuICogQnVmZmVyIHZhcmlhbnQgbm90IGZhc3QgZW5vdWdoIGZvciB3aGF0IHdlIG5lZWRcbiAqIEBwYXJhbSB7bnVtYmVyW119IGFyclxuICogQHJldHVybnMge1VpbnQ4QXJyYXl9XG4gKi9cbmNvbnN0IGZyb21BcnJheSA9IChhcnIpID0+IHtcbiAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbShhcnIpXG59O1xuXG5jb25zdCBzbGljZSA9IHVzZUJ1ZmZlclxuICA/IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgb3BlcmF0b3ItbGluZWJyZWFrXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtVaW50OEFycmF5fSBieXRlc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBlbmRcbiAgICAgKi9cbiAgICAoYnl0ZXMsIHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgIGlmIChpc0J1ZmZlcihieXRlcykpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJ5dGVzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJ5dGVzLnNsaWNlKHN0YXJ0LCBlbmQpXG4gICAgfVxuICAvKiBjOCBpZ25vcmUgbmV4dCA5ICovXG4gIDogLy8gZXNsaW50LWRpc2FibGUtbGluZSBvcGVyYXRvci1saW5lYnJlYWtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGJ5dGVzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGVuZFxuICAgICAqL1xuICAgIChieXRlcywgc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgcmV0dXJuIGJ5dGVzLnNsaWNlKHN0YXJ0LCBlbmQpXG4gICAgfTtcblxuY29uc3QgY29uY2F0ID0gdXNlQnVmZmVyXG4gID8gLy8gZXNsaW50LWRpc2FibGUtbGluZSBvcGVyYXRvci1saW5lYnJlYWtcbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge1VpbnQ4QXJyYXlbXX0gY2h1bmtzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aFxuICAgICAqIEByZXR1cm5zIHtVaW50OEFycmF5fVxuICAgICAqL1xuICAgIChjaHVua3MsIGxlbmd0aCkgPT4ge1xuICAgICAgLy8gbWlnaHQgZ2V0IGEgc3RyYXkgcGxhaW4gQXJyYXkgaGVyZVxuICAgICAgLyogYzggaWdub3JlIG5leHQgMSAqL1xuICAgICAgY2h1bmtzID0gY2h1bmtzLm1hcCgoYykgPT4gYyBpbnN0YW5jZW9mIFVpbnQ4QXJyYXlcbiAgICAgICAgPyBjXG4gICAgICAgIC8vIHRoaXMgY2FzZSBpcyBvY2Nhc2lvbmFsbHkgbWlzc2VkIGR1cmluZyB0ZXN0IHJ1bnMgc28gYmVjb21lcyBjb3ZlcmFnZS1mbGFreVxuICAgICAgICAvKiBjOCBpZ25vcmUgbmV4dCA0ICovXG4gICAgICAgIDogLy8gZXNsaW50LWRpc2FibGUtbGluZSBvcGVyYXRvci1saW5lYnJlYWtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBnbG9iYWxUaGlzLkJ1ZmZlci5mcm9tKGMpKTtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHJldHVybiBhc1U4QShnbG9iYWxUaGlzLkJ1ZmZlci5jb25jYXQoY2h1bmtzLCBsZW5ndGgpKVxuICAgIH1cbiAgLyogYzggaWdub3JlIG5leHQgMTkgKi9cbiAgOiAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG9wZXJhdG9yLWxpbmVicmVha1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7VWludDhBcnJheVtdfSBjaHVua3NcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoXG4gICAgICogQHJldHVybnMge1VpbnQ4QXJyYXl9XG4gICAgICovXG4gICAgKGNodW5rcywgbGVuZ3RoKSA9PiB7XG4gICAgICBjb25zdCBvdXQgPSBuZXcgVWludDhBcnJheShsZW5ndGgpO1xuICAgICAgbGV0IG9mZiA9IDA7XG4gICAgICBmb3IgKGxldCBiIG9mIGNodW5rcykge1xuICAgICAgICBpZiAob2ZmICsgYi5sZW5ndGggPiBvdXQubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gZmluYWwgY2h1bmsgdGhhdCdzIGJpZ2dlciB0aGFuIHdlIG5lZWRcbiAgICAgICAgICBiID0gYi5zdWJhcnJheSgwLCBvdXQubGVuZ3RoIC0gb2ZmKTtcbiAgICAgICAgfVxuICAgICAgICBvdXQuc2V0KGIsIG9mZik7XG4gICAgICAgIG9mZiArPSBiLmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRcbiAgICB9O1xuXG5jb25zdCBhbGxvYyA9IHVzZUJ1ZmZlclxuICA/IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgb3BlcmF0b3ItbGluZWJyZWFrXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNpemVcbiAgICAgKiBAcmV0dXJucyB7VWludDhBcnJheX1cbiAgICAgKi9cbiAgICAoc2l6ZSkgPT4ge1xuICAgICAgLy8gd2UgYWx3YXlzIHdyaXRlIG92ZXIgdGhlIGNvbnRlbnRzIHdlIGV4cG9zZSBzbyB0aGlzIHNob3VsZCBiZSBzYWZlXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICByZXR1cm4gZ2xvYmFsVGhpcy5CdWZmZXIuYWxsb2NVbnNhZmUoc2l6ZSlcbiAgICB9XG4gIC8qIGM4IGlnbm9yZSBuZXh0IDggKi9cbiAgOiAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG9wZXJhdG9yLWxpbmVicmVha1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzaXplXG4gICAgICogQHJldHVybnMge1VpbnQ4QXJyYXl9XG4gICAgICovXG4gICAgKHNpemUpID0+IHtcbiAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShzaXplKVxuICAgIH07XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBiMVxuICogQHBhcmFtIHtVaW50OEFycmF5fSBiMlxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gY29tcGFyZSAoYjEsIGIyKSB7XG4gIC8qIGM4IGlnbm9yZSBuZXh0IDUgKi9cbiAgaWYgKGlzQnVmZmVyKGIxKSAmJiBpc0J1ZmZlcihiMikpIHtcbiAgICAvLyBwcm9iYWJseSBub3QgcG9zc2libGUgdG8gZ2V0IGhlcmUgaW4gdGhlIGN1cnJlbnQgQVBJXG4gICAgLy8gQHRzLWlnbm9yZSBCdWZmZXJcbiAgICByZXR1cm4gYjEuY29tcGFyZShiMilcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGIxLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGIxW2ldID09PSBiMltpXSkge1xuICAgICAgY29udGludWVcbiAgICB9XG4gICAgcmV0dXJuIGIxW2ldIDwgYjJbaV0gPyAtMSA6IDFcbiAgfSAvKiBjOCBpZ25vcmUgbmV4dCAzICovXG4gIHJldHVybiAwXG59XG5cbi8vIFRoZSBiZWxvdyBjb2RlIGlzIHRha2VuIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9jbG9zdXJlLWxpYnJhcnkvYmxvYi84NTk4ZDg3MjQyYWY1OWFhYzIzMzI3MDc0MmM4OTg0ZTJiMmJkYmUwL2Nsb3N1cmUvZ29vZy9jcnlwdC9jcnlwdC5qcyNMMTE3LUwxNDNcbi8vIExpY2Vuc2VkIEFwYWNoZS0yLjAuXG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICogQHJldHVybnMge251bWJlcltdfVxuICovXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIGNvbnN0IG91dCA9IFtdO1xuICBsZXQgcCA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGMgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICBpZiAoYyA8IDEyOCkge1xuICAgICAgb3V0W3ArK10gPSBjO1xuICAgIH0gZWxzZSBpZiAoYyA8IDIwNDgpIHtcbiAgICAgIG91dFtwKytdID0gKGMgPj4gNikgfCAxOTI7XG4gICAgICBvdXRbcCsrXSA9IChjICYgNjMpIHwgMTI4O1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAoKGMgJiAweEZDMDApID09PSAweEQ4MDApICYmIChpICsgMSkgPCBzdHIubGVuZ3RoICYmXG4gICAgICAoKHN0ci5jaGFyQ29kZUF0KGkgKyAxKSAmIDB4RkMwMCkgPT09IDB4REMwMCkpIHtcbiAgICAgIC8vIFN1cnJvZ2F0ZSBQYWlyXG4gICAgICBjID0gMHgxMDAwMCArICgoYyAmIDB4MDNGRikgPDwgMTApICsgKHN0ci5jaGFyQ29kZUF0KCsraSkgJiAweDAzRkYpO1xuICAgICAgb3V0W3ArK10gPSAoYyA+PiAxOCkgfCAyNDA7XG4gICAgICBvdXRbcCsrXSA9ICgoYyA+PiAxMikgJiA2MykgfCAxMjg7XG4gICAgICBvdXRbcCsrXSA9ICgoYyA+PiA2KSAmIDYzKSB8IDEyODtcbiAgICAgIG91dFtwKytdID0gKGMgJiA2MykgfCAxMjg7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dFtwKytdID0gKGMgPj4gMTIpIHwgMjI0O1xuICAgICAgb3V0W3ArK10gPSAoKGMgPj4gNikgJiA2MykgfCAxMjg7XG4gICAgICBvdXRbcCsrXSA9IChjICYgNjMpIHwgMTI4O1xuICAgIH1cbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbi8vIFRoZSBiZWxvdyBjb2RlIGlzIG1vc3RseSB0YWtlbiBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyXG4vLyBMaWNlbnNlZCBNSVQuIENvcHlyaWdodCAoYykgRmVyb3NzIEFib3VraGFkaWplaFxuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gYnVmXG4gKiBAcGFyYW0ge251bWJlcn0gb2Zmc2V0XG4gKiBAcGFyYW0ge251bWJlcn0gZW5kXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgb2Zmc2V0LCBlbmQpIHtcbiAgY29uc3QgcmVzID0gW107XG5cbiAgd2hpbGUgKG9mZnNldCA8IGVuZCkge1xuICAgIGNvbnN0IGZpcnN0Qnl0ZSA9IGJ1ZltvZmZzZXRdO1xuICAgIGxldCBjb2RlUG9pbnQgPSBudWxsO1xuICAgIGxldCBieXRlc1BlclNlcXVlbmNlID0gKGZpcnN0Qnl0ZSA+IDB4ZWYpID8gNCA6IChmaXJzdEJ5dGUgPiAweGRmKSA/IDMgOiAoZmlyc3RCeXRlID4gMHhiZikgPyAyIDogMTtcblxuICAgIGlmIChvZmZzZXQgKyBieXRlc1BlclNlcXVlbmNlIDw9IGVuZCkge1xuICAgICAgbGV0IHNlY29uZEJ5dGUsIHRoaXJkQnl0ZSwgZm91cnRoQnl0ZSwgdGVtcENvZGVQb2ludDtcblxuICAgICAgc3dpdGNoIChieXRlc1BlclNlcXVlbmNlKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAoZmlyc3RCeXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgY29kZVBvaW50ID0gZmlyc3RCeXRlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltvZmZzZXQgKyAxXTtcbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweGMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweDFmKSA8PCAweDYgfCAoc2Vjb25kQnl0ZSAmIDB4M2YpO1xuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdmKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW29mZnNldCArIDFdO1xuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltvZmZzZXQgKyAyXTtcbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweGMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhjMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhmKSA8PCAweGMgfCAoc2Vjb25kQnl0ZSAmIDB4M2YpIDw8IDB4NiB8ICh0aGlyZEJ5dGUgJiAweDNmKTtcbiAgICAgICAgICAgIC8qIGM4IGlnbm9yZSBuZXh0IDMgKi9cbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3ZmYgJiYgKHRlbXBDb2RlUG9pbnQgPCAweGQ4MDAgfHwgdGVtcENvZGVQb2ludCA+IDB4ZGZmZikpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbb2Zmc2V0ICsgMV07XG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW29mZnNldCArIDJdO1xuICAgICAgICAgIGZvdXJ0aEJ5dGUgPSBidWZbb2Zmc2V0ICsgM107XG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhjMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4YzApID09PSAweDgwICYmIChmb3VydGhCeXRlICYgMHhjMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhmKSA8PCAweDEyIHwgKHNlY29uZEJ5dGUgJiAweDNmKSA8PCAweGMgfCAodGhpcmRCeXRlICYgMHgzZikgPDwgMHg2IHwgKGZvdXJ0aEJ5dGUgJiAweDNmKTtcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHhmZmZmICYmIHRlbXBDb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBjOCBpZ25vcmUgbmV4dCA1ICovXG4gICAgaWYgKGNvZGVQb2ludCA9PT0gbnVsbCkge1xuICAgICAgLy8gd2UgZGlkIG5vdCBnZW5lcmF0ZSBhIHZhbGlkIGNvZGVQb2ludCBzbyBpbnNlcnQgYVxuICAgICAgLy8gcmVwbGFjZW1lbnQgY2hhciAoVStGRkZEKSBhbmQgYWR2YW5jZSBvbmx5IDEgYnl0ZVxuICAgICAgY29kZVBvaW50ID0gMHhmZmZkO1xuICAgICAgYnl0ZXNQZXJTZXF1ZW5jZSA9IDE7XG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPiAweGZmZmYpIHtcbiAgICAgIC8vIGVuY29kZSB0byB1dGYxNiAoc3Vycm9nYXRlIHBhaXIgZGFuY2UpXG4gICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMDtcbiAgICAgIHJlcy5wdXNoKGNvZGVQb2ludCA+Pj4gMTAgJiAweDNmZiB8IDB4ZDgwMCk7XG4gICAgICBjb2RlUG9pbnQgPSAweGRjMDAgfCBjb2RlUG9pbnQgJiAweDNmZjtcbiAgICB9XG5cbiAgICByZXMucHVzaChjb2RlUG9pbnQpO1xuICAgIG9mZnNldCArPSBieXRlc1BlclNlcXVlbmNlO1xuICB9XG5cbiAgcmV0dXJuIGRlY29kZUNvZGVQb2ludHNBcnJheShyZXMpXG59XG5cbi8vIEJhc2VkIG9uIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyNzQ3MjcyLzY4MDc0MiwgdGhlIGJyb3dzZXIgd2l0aFxuLy8gdGhlIGxvd2VzdCBsaW1pdCBpcyBDaHJvbWUsIHdpdGggMHgxMDAwMCBhcmdzLlxuLy8gV2UgZ28gMSBtYWduaXR1ZGUgbGVzcywgZm9yIHNhZmV0eVxuY29uc3QgTUFYX0FSR1VNRU5UU19MRU5HVEggPSAweDEwMDA7XG5cbi8qKlxuICogQHBhcmFtIHtudW1iZXJbXX0gY29kZVBvaW50c1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZGVjb2RlQ29kZVBvaW50c0FycmF5IChjb2RlUG9pbnRzKSB7XG4gIGNvbnN0IGxlbiA9IGNvZGVQb2ludHMubGVuZ3RoO1xuICBpZiAobGVuIDw9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBjb2RlUG9pbnRzKSAvLyBhdm9pZCBleHRyYSBzbGljZSgpXG4gIH1cbiAgLyogYzggaWdub3JlIG5leHQgMTAgKi9cbiAgLy8gRGVjb2RlIGluIGNodW5rcyB0byBhdm9pZCBcImNhbGwgc3RhY2sgc2l6ZSBleGNlZWRlZFwiLlxuICBsZXQgcmVzID0gJyc7XG4gIGxldCBpID0gMDtcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShcbiAgICAgIFN0cmluZyxcbiAgICAgIGNvZGVQb2ludHMuc2xpY2UoaSwgaSArPSBNQVhfQVJHVU1FTlRTX0xFTkdUSClcbiAgICApO1xuICB9XG4gIHJldHVybiByZXNcbn1cblxuLyoqXG4gKiBCbCBpcyBhIGxpc3Qgb2YgYnl0ZSBjaHVua3MsIHNpbWlsYXIgdG8gaHR0cHM6Ly9naXRodWIuY29tL3J2YWdnL2JsIGJ1dCBmb3JcbiAqIHdyaXRpbmcgcmF0aGVyIHRoYW4gcmVhZGluZy5cbiAqIEEgQmwgb2JqZWN0IGFjY2VwdHMgc2V0KCkgb3BlcmF0aW9ucyBmb3IgaW5kaXZpZHVhbCBieXRlcyBhbmQgY29weVRvKCkgZm9yXG4gKiBpbnNlcnRpbmcgYnl0ZSBhcnJheXMuIFRoZXNlIHdyaXRlIG9wZXJhdGlvbnMgZG9uJ3QgYXV0b21hdGljYWxseSBpbmNyZW1lbnRcbiAqIHRoZSBpbnRlcm5hbCBjdXJzb3Igc28gaXRzIFwibGVuZ3RoXCIgd29uJ3QgYmUgY2hhbmdlZC4gSW5zdGVhZCwgaW5jcmVtZW50KClcbiAqIG11c3QgYmUgY2FsbGVkIHRvIGV4dGVuZCBpdHMgbGVuZ3RoIHRvIGNvdmVyIHRoZSBpbnNlcnRlZCBkYXRhLlxuICogVGhlIHRvQnl0ZXMoKSBjYWxsIHdpbGwgY29udmVydCBhbGwgaW50ZXJuYWwgbWVtb3J5IHRvIGEgc2luZ2xlIFVpbnQ4QXJyYXkgb2ZcbiAqIHRoZSBjb3JyZWN0IGxlbmd0aCwgdHJ1bmNhdGluZyBhbnkgZGF0YSB0aGF0IGlzIHN0b3JlZCBidXQgaGFzbid0IGJlZW5cbiAqIGluY2x1ZGVkIGJ5IGFuIGluY3JlbWVudCgpLlxuICogZ2V0KCkgY2FuIHJldHJpZXZlIGEgc2luZ2xlIGJ5dGUuXG4gKiBBbGwgb3BlcmF0aW9ucyAoZXhjZXB0IHRvQnl0ZXMoKSkgdGFrZSBhbiBcIm9mZnNldFwiIGFyZ3VtZW50IHRoYXQgd2lsbCBwZXJmb3JtXG4gKiB0aGUgd3JpdGUgYXQgdGhlIG9mZnNldCBfZnJvbSB0aGUgY3VycmVudCBjdXJzb3JfLiBGb3IgbW9zdCBvcGVyYXRpb25zIHRoaXNcbiAqIHdpbGwgYmUgYDBgIHRvIHdyaXRlIGF0IHRoZSBjdXJyZW50IGN1cnNvciBwb3NpdGlvbiBidXQgaXQgY2FuIGJlIGFoZWFkIG9mXG4gKiB0aGUgY3VycmVudCBjdXJzb3IuIE5lZ2F0aXZlIG9mZnNldHMgcHJvYmFibHkgd29yayBidXQgYXJlIHVudGVzdGVkLlxuICovXG5cblxuLy8gdGhlIHRzLWlnbm9yZXMgaW4gdGhpcyBmaWxlIGFyZSBhbG1vc3QgYWxsIGZvciB0aGUgYFVpbnQ4QXJyYXl8bnVtYmVyW11gIGR1YWxpdHkgdGhhdCBleGlzdHNcbi8vIGZvciBwZXJmIHJlYXNvbnMuIENvbnNpZGVyIGJldHRlciBhcHByb2FjaGVzIHRvIHRoaXMgb3IgcmVtb3ZpbmcgaXQgZW50aXJlbHksIGl0IGlzIHF1aXRlXG4vLyByaXNreSBiZWNhdXNlIG9mIHNvbWUgYXNzdW1wdGlvbnMgYWJvdXQgc21hbGwgY2h1bmtzID09PSBudW1iZXJbXSBhbmQgZXZlcnl0aGluZyBlbHNlID09PSBVaW50OEFycmF5LlxuXG5jb25zdCBkZWZhdWx0Q2h1bmtTaXplID0gMjU2O1xuXG5jbGFzcyBCbCB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gW2NodW5rU2l6ZV1cbiAgICovXG4gIGNvbnN0cnVjdG9yIChjaHVua1NpemUgPSBkZWZhdWx0Q2h1bmtTaXplKSB7XG4gICAgdGhpcy5jaHVua1NpemUgPSBjaHVua1NpemU7XG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgdGhpcy5jdXJzb3IgPSAwO1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMubWF4Q3Vyc29yID0gLTE7XG4gICAgLyoqIEB0eXBlIHsoVWludDhBcnJheXxudW1iZXJbXSlbXX0gKi9cbiAgICB0aGlzLmNodW5rcyA9IFtdO1xuICAgIC8vIGtlZXAgdGhlIGZpcnN0IGNodW5rIGFyb3VuZCBpZiB3ZSBjYW4gdG8gc2F2ZSBhbGxvY2F0aW9ucyBmb3IgZnV0dXJlIGVuY29kZXNcbiAgICAvKiogQHR5cGUge1VpbnQ4QXJyYXl8bnVtYmVyW118bnVsbH0gKi9cbiAgICB0aGlzLl9pbml0UmV1c2VDaHVuayA9IG51bGw7XG4gIH1cblxuICByZXNldCAoKSB7XG4gICAgdGhpcy5jdXJzb3IgPSAwO1xuICAgIHRoaXMubWF4Q3Vyc29yID0gLTE7XG4gICAgaWYgKHRoaXMuY2h1bmtzLmxlbmd0aCkge1xuICAgICAgdGhpcy5jaHVua3MgPSBbXTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2luaXRSZXVzZUNodW5rICE9PSBudWxsKSB7XG4gICAgICB0aGlzLmNodW5rcy5wdXNoKHRoaXMuX2luaXRSZXVzZUNodW5rKTtcbiAgICAgIHRoaXMubWF4Q3Vyc29yID0gdGhpcy5faW5pdFJldXNlQ2h1bmsubGVuZ3RoIC0gMTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtVaW50OEFycmF5fG51bWJlcltdfSBieXRlc1xuICAgKi9cbiAgcHVzaCAoYnl0ZXMpIHtcbiAgICBsZXQgdG9wQ2h1bmsgPSB0aGlzLmNodW5rc1t0aGlzLmNodW5rcy5sZW5ndGggLSAxXTtcbiAgICBjb25zdCBuZXdNYXggPSB0aGlzLmN1cnNvciArIGJ5dGVzLmxlbmd0aDtcbiAgICBpZiAobmV3TWF4IDw9IHRoaXMubWF4Q3Vyc29yICsgMSkge1xuICAgICAgLy8gd2UgaGF2ZSBhdCBsZWFzdCBvbmUgY2h1bmsgYW5kIHdlIGNhbiBmaXQgdGhlc2UgYnl0ZXMgaW50byB0aGF0IGNodW5rXG4gICAgICBjb25zdCBjaHVua1BvcyA9IHRvcENodW5rLmxlbmd0aCAtICh0aGlzLm1heEN1cnNvciAtIHRoaXMuY3Vyc29yKSAtIDE7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB0b3BDaHVuay5zZXQoYnl0ZXMsIGNodW5rUG9zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY2FuJ3QgZml0IGl0IGluXG4gICAgICBpZiAodG9wQ2h1bmspIHtcbiAgICAgICAgLy8gdHJpcCB0aGUgbGFzdCBjaHVuayB0byBgY3Vyc29yYCBpZiB3ZSBuZWVkIHRvXG4gICAgICAgIGNvbnN0IGNodW5rUG9zID0gdG9wQ2h1bmsubGVuZ3RoIC0gKHRoaXMubWF4Q3Vyc29yIC0gdGhpcy5jdXJzb3IpIC0gMTtcbiAgICAgICAgaWYgKGNodW5rUG9zIDwgdG9wQ2h1bmsubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgIHRoaXMuY2h1bmtzW3RoaXMuY2h1bmtzLmxlbmd0aCAtIDFdID0gdG9wQ2h1bmsuc3ViYXJyYXkoMCwgY2h1bmtQb3MpO1xuICAgICAgICAgIHRoaXMubWF4Q3Vyc29yID0gdGhpcy5jdXJzb3IgLSAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoYnl0ZXMubGVuZ3RoIDwgNjQgJiYgYnl0ZXMubGVuZ3RoIDwgdGhpcy5jaHVua1NpemUpIHtcbiAgICAgICAgLy8gbWFrZSBhIG5ldyBjaHVuayBhbmQgY29weSB0aGUgbmV3IG9uZSBpbnRvIGl0XG4gICAgICAgIHRvcENodW5rID0gYWxsb2ModGhpcy5jaHVua1NpemUpO1xuICAgICAgICB0aGlzLmNodW5rcy5wdXNoKHRvcENodW5rKTtcbiAgICAgICAgdGhpcy5tYXhDdXJzb3IgKz0gdG9wQ2h1bmsubGVuZ3RoO1xuICAgICAgICBpZiAodGhpcy5faW5pdFJldXNlQ2h1bmsgPT09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9pbml0UmV1c2VDaHVuayA9IHRvcENodW5rO1xuICAgICAgICB9XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdG9wQ2h1bmsuc2V0KGJ5dGVzLCAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHB1c2ggdGhlIG5ldyBieXRlcyBpbiBhcyBpdHMgb3duIGNodW5rXG4gICAgICAgIHRoaXMuY2h1bmtzLnB1c2goYnl0ZXMpO1xuICAgICAgICB0aGlzLm1heEN1cnNvciArPSBieXRlcy5sZW5ndGg7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY3Vyc29yICs9IGJ5dGVzLmxlbmd0aDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtyZXNldF1cbiAgICogQHJldHVybnMge1VpbnQ4QXJyYXl9XG4gICAqL1xuICB0b0J5dGVzIChyZXNldCA9IGZhbHNlKSB7XG4gICAgbGV0IGJ5dHM7XG4gICAgaWYgKHRoaXMuY2h1bmtzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgY29uc3QgY2h1bmsgPSB0aGlzLmNodW5rc1swXTtcbiAgICAgIGlmIChyZXNldCAmJiB0aGlzLmN1cnNvciA+IGNodW5rLmxlbmd0aCAvIDIpIHtcbiAgICAgICAgLyogYzggaWdub3JlIG5leHQgMiAqL1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGJ5dHMgPSB0aGlzLmN1cnNvciA9PT0gY2h1bmsubGVuZ3RoID8gY2h1bmsgOiBjaHVuay5zdWJhcnJheSgwLCB0aGlzLmN1cnNvcik7XG4gICAgICAgIHRoaXMuX2luaXRSZXVzZUNodW5rID0gbnVsbDtcbiAgICAgICAgdGhpcy5jaHVua3MgPSBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgYnl0cyA9IHNsaWNlKGNodW5rLCAwLCB0aGlzLmN1cnNvcik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGJ5dHMgPSBjb25jYXQodGhpcy5jaHVua3MsIHRoaXMuY3Vyc29yKTtcbiAgICB9XG4gICAgaWYgKHJlc2V0KSB7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgfVxuICAgIHJldHVybiBieXRzXG4gIH1cbn1cblxuY29uc3QgZGVjb2RlRXJyUHJlZml4ID0gJ0NCT1IgZGVjb2RlIGVycm9yOic7XG5jb25zdCBlbmNvZGVFcnJQcmVmaXggPSAnQ0JPUiBlbmNvZGUgZXJyb3I6JztcblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWVkXG4gKi9cbmZ1bmN0aW9uIGFzc2VydEVub3VnaERhdGEgKGRhdGEsIHBvcywgbmVlZCkge1xuICBpZiAoZGF0YS5sZW5ndGggLSBwb3MgPCBuZWVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2RlY29kZUVyclByZWZpeH0gbm90IGVub3VnaCBkYXRhIGZvciB0eXBlYClcbiAgfVxufVxuXG4vKiBnbG9iYWxzIEJpZ0ludCAqL1xuXG5cbmNvbnN0IHVpbnRCb3VuZGFyaWVzID0gWzI0LCAyNTYsIDY1NTM2LCA0Mjk0OTY3Mjk2LCBCaWdJbnQoJzE4NDQ2NzQ0MDczNzA5NTUxNjE2JyldO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4vYmwuanMnKS5CbH0gQmxcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4uL2ludGVyZmFjZScpLkRlY29kZU9wdGlvbnN9IERlY29kZU9wdGlvbnNcbiAqL1xuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IG9mZnNldFxuICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiByZWFkVWludDggKGRhdGEsIG9mZnNldCwgb3B0aW9ucykge1xuICBhc3NlcnRFbm91Z2hEYXRhKGRhdGEsIG9mZnNldCwgMSk7XG4gIGNvbnN0IHZhbHVlID0gZGF0YVtvZmZzZXRdO1xuICBpZiAob3B0aW9ucy5zdHJpY3QgPT09IHRydWUgJiYgdmFsdWUgPCB1aW50Qm91bmRhcmllc1swXSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtkZWNvZGVFcnJQcmVmaXh9IGludGVnZXIgZW5jb2RlZCBpbiBtb3JlIGJ5dGVzIHRoYW4gbmVjZXNzYXJ5IChzdHJpY3QgZGVjb2RlKWApXG4gIH1cbiAgcmV0dXJuIHZhbHVlXG59XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gb2Zmc2V0XG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIHJlYWRVaW50MTYgKGRhdGEsIG9mZnNldCwgb3B0aW9ucykge1xuICBhc3NlcnRFbm91Z2hEYXRhKGRhdGEsIG9mZnNldCwgMik7XG4gIGNvbnN0IHZhbHVlID0gKGRhdGFbb2Zmc2V0XSA8PCA4KSB8IGRhdGFbb2Zmc2V0ICsgMV07XG4gIGlmIChvcHRpb25zLnN0cmljdCA9PT0gdHJ1ZSAmJiB2YWx1ZSA8IHVpbnRCb3VuZGFyaWVzWzFdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2RlY29kZUVyclByZWZpeH0gaW50ZWdlciBlbmNvZGVkIGluIG1vcmUgYnl0ZXMgdGhhbiBuZWNlc3NhcnkgKHN0cmljdCBkZWNvZGUpYClcbiAgfVxuICByZXR1cm4gdmFsdWVcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBvZmZzZXRcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gcmVhZFVpbnQzMiAoZGF0YSwgb2Zmc2V0LCBvcHRpb25zKSB7XG4gIGFzc2VydEVub3VnaERhdGEoZGF0YSwgb2Zmc2V0LCA0KTtcbiAgY29uc3QgdmFsdWUgPSAoZGF0YVtvZmZzZXRdICogMTY3NzcyMTYgLyogMiAqKiAyNCAqLykgKyAoZGF0YVtvZmZzZXQgKyAxXSA8PCAxNikgKyAoZGF0YVtvZmZzZXQgKyAyXSA8PCA4KSArIGRhdGFbb2Zmc2V0ICsgM107XG4gIGlmIChvcHRpb25zLnN0cmljdCA9PT0gdHJ1ZSAmJiB2YWx1ZSA8IHVpbnRCb3VuZGFyaWVzWzJdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2RlY29kZUVyclByZWZpeH0gaW50ZWdlciBlbmNvZGVkIGluIG1vcmUgYnl0ZXMgdGhhbiBuZWNlc3NhcnkgKHN0cmljdCBkZWNvZGUpYClcbiAgfVxuICByZXR1cm4gdmFsdWVcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBvZmZzZXRcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge251bWJlcnxiaWdpbnR9XG4gKi9cbmZ1bmN0aW9uIHJlYWRVaW50NjQgKGRhdGEsIG9mZnNldCwgb3B0aW9ucykge1xuICAvLyBhc3N1bWUgQmlnSW50LCBjb252ZXJ0IGJhY2sgdG8gTnVtYmVyIGlmIHdpdGhpbiBzYWZlIHJhbmdlXG4gIGFzc2VydEVub3VnaERhdGEoZGF0YSwgb2Zmc2V0LCA4KTtcbiAgY29uc3QgaGkgPSAoZGF0YVtvZmZzZXRdICogMTY3NzcyMTYgLyogMiAqKiAyNCAqLykgKyAoZGF0YVtvZmZzZXQgKyAxXSA8PCAxNikgKyAoZGF0YVtvZmZzZXQgKyAyXSA8PCA4KSArIGRhdGFbb2Zmc2V0ICsgM107XG4gIGNvbnN0IGxvID0gKGRhdGFbb2Zmc2V0ICsgNF0gKiAxNjc3NzIxNiAvKiAyICoqIDI0ICovKSArIChkYXRhW29mZnNldCArIDVdIDw8IDE2KSArIChkYXRhW29mZnNldCArIDZdIDw8IDgpICsgZGF0YVtvZmZzZXQgKyA3XTtcbiAgY29uc3QgdmFsdWUgPSAoQmlnSW50KGhpKSA8PCBCaWdJbnQoMzIpKSArIEJpZ0ludChsbyk7XG4gIGlmIChvcHRpb25zLnN0cmljdCA9PT0gdHJ1ZSAmJiB2YWx1ZSA8IHVpbnRCb3VuZGFyaWVzWzNdKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2RlY29kZUVyclByZWZpeH0gaW50ZWdlciBlbmNvZGVkIGluIG1vcmUgYnl0ZXMgdGhhbiBuZWNlc3NhcnkgKHN0cmljdCBkZWNvZGUpYClcbiAgfVxuICBpZiAodmFsdWUgPD0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHtcbiAgICByZXR1cm4gTnVtYmVyKHZhbHVlKVxuICB9XG4gIGlmIChvcHRpb25zLmFsbG93QmlnSW50ID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGAke2RlY29kZUVyclByZWZpeH0gaW50ZWdlcnMgb3V0c2lkZSBvZiB0aGUgc2FmZSBpbnRlZ2VyIHJhbmdlIGFyZSBub3Qgc3VwcG9ydGVkYClcbn1cblxuLyogbm90IHJlcXVpcmVkIHRoYW5rcyB0byBxdWlja1tdIGxpc3RcbmNvbnN0IG9uZUJ5dGVUb2tlbnMgPSBuZXcgQXJyYXkoMjQpLmZpbGwoMCkubWFwKCh2LCBpKSA9PiBuZXcgVG9rZW4oVHlwZS51aW50LCBpLCAxKSlcbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVVaW50Q29tcGFjdCAoZGF0YSwgcG9zLCBtaW5vciwgb3B0aW9ucykge1xuICByZXR1cm4gb25lQnl0ZVRva2Vuc1ttaW5vcl1cbn1cbiovXG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gcG9zXG4gKiBAcGFyYW0ge251bWJlcn0gX21pbm9yXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtUb2tlbn1cbiAqL1xuZnVuY3Rpb24gZGVjb2RlVWludDggKGRhdGEsIHBvcywgX21pbm9yLCBvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgVG9rZW4oVHlwZS51aW50LCByZWFkVWludDgoZGF0YSwgcG9zICsgMSwgb3B0aW9ucyksIDIpXG59XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gcG9zXG4gKiBAcGFyYW0ge251bWJlcn0gX21pbm9yXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtUb2tlbn1cbiAqL1xuZnVuY3Rpb24gZGVjb2RlVWludDE2IChkYXRhLCBwb3MsIF9taW5vciwgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IFRva2VuKFR5cGUudWludCwgcmVhZFVpbnQxNihkYXRhLCBwb3MgKyAxLCBvcHRpb25zKSwgMylcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBfbWlub3JcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiBkZWNvZGVVaW50MzIgKGRhdGEsIHBvcywgX21pbm9yLCBvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgVG9rZW4oVHlwZS51aW50LCByZWFkVWludDMyKGRhdGEsIHBvcyArIDEsIG9wdGlvbnMpLCA1KVxufVxuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IHBvc1xuICogQHBhcmFtIHtudW1iZXJ9IF9taW5vclxuICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7VG9rZW59XG4gKi9cbmZ1bmN0aW9uIGRlY29kZVVpbnQ2NCAoZGF0YSwgcG9zLCBfbWlub3IsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG5ldyBUb2tlbihUeXBlLnVpbnQsIHJlYWRVaW50NjQoZGF0YSwgcG9zICsgMSwgb3B0aW9ucyksIDkpXG59XG5cbi8qKlxuICogQHBhcmFtIHtCbH0gYnVmXG4gKiBAcGFyYW0ge1Rva2VufSB0b2tlblxuICovXG5mdW5jdGlvbiBlbmNvZGVVaW50IChidWYsIHRva2VuKSB7XG4gIHJldHVybiBlbmNvZGVVaW50VmFsdWUoYnVmLCAwLCB0b2tlbi52YWx1ZSlcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0JsfSBidWZcbiAqIEBwYXJhbSB7bnVtYmVyfSBtYWpvclxuICogQHBhcmFtIHtudW1iZXJ8YmlnaW50fSB1aW50XG4gKi9cbmZ1bmN0aW9uIGVuY29kZVVpbnRWYWx1ZSAoYnVmLCBtYWpvciwgdWludCkge1xuICBpZiAodWludCA8IHVpbnRCb3VuZGFyaWVzWzBdKSB7XG4gICAgY29uc3QgbnVpbnQgPSBOdW1iZXIodWludCk7XG4gICAgLy8gcGFjayBpbnRvIG9uZSBieXRlLCBtaW5vcj0wLCBhZGRpdGlvbmFsPXZhbHVlXG4gICAgYnVmLnB1c2goW21ham9yIHwgbnVpbnRdKTtcbiAgfSBlbHNlIGlmICh1aW50IDwgdWludEJvdW5kYXJpZXNbMV0pIHtcbiAgICBjb25zdCBudWludCA9IE51bWJlcih1aW50KTtcbiAgICAvLyBwYWNrIGludG8gdHdvIGJ5dGUsIG1pbm9yPTAsIGFkZGl0aW9uYWw9MjRcbiAgICBidWYucHVzaChbbWFqb3IgfCAyNCwgbnVpbnRdKTtcbiAgfSBlbHNlIGlmICh1aW50IDwgdWludEJvdW5kYXJpZXNbMl0pIHtcbiAgICBjb25zdCBudWludCA9IE51bWJlcih1aW50KTtcbiAgICAvLyBwYWNrIGludG8gdGhyZWUgYnl0ZSwgbWlub3I9MCwgYWRkaXRpb25hbD0yNVxuICAgIGJ1Zi5wdXNoKFttYWpvciB8IDI1LCBudWludCA+Pj4gOCwgbnVpbnQgJiAweGZmXSk7XG4gIH0gZWxzZSBpZiAodWludCA8IHVpbnRCb3VuZGFyaWVzWzNdKSB7XG4gICAgY29uc3QgbnVpbnQgPSBOdW1iZXIodWludCk7XG4gICAgLy8gcGFjayBpbnRvIGZpdmUgYnl0ZSwgbWlub3I9MCwgYWRkaXRpb25hbD0yNlxuICAgIGJ1Zi5wdXNoKFttYWpvciB8IDI2LCAobnVpbnQgPj4+IDI0KSAmIDB4ZmYsIChudWludCA+Pj4gMTYpICYgMHhmZiwgKG51aW50ID4+PiA4KSAmIDB4ZmYsIG51aW50ICYgMHhmZl0pO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGJ1aW50ID0gQmlnSW50KHVpbnQpO1xuICAgIGlmIChidWludCA8IHVpbnRCb3VuZGFyaWVzWzRdKSB7XG4gICAgICAvLyBwYWNrIGludG8gbmluZSBieXRlLCBtaW5vcj0wLCBhZGRpdGlvbmFsPTI3XG4gICAgICBjb25zdCBzZXQgPSBbbWFqb3IgfCAyNywgMCwgMCwgMCwgMCwgMCwgMCwgMF07XG4gICAgICAvLyBzaW11bGF0ZSBiaXR3aXNlIGFib3ZlIDMyIGJpdHNcbiAgICAgIGxldCBsbyA9IE51bWJlcihidWludCAmIEJpZ0ludCgweGZmZmZmZmZmKSk7XG4gICAgICBsZXQgaGkgPSBOdW1iZXIoYnVpbnQgPj4gQmlnSW50KDMyKSAmIEJpZ0ludCgweGZmZmZmZmZmKSk7XG4gICAgICBzZXRbOF0gPSBsbyAmIDB4ZmY7XG4gICAgICBsbyA9IGxvID4+IDg7XG4gICAgICBzZXRbN10gPSBsbyAmIDB4ZmY7XG4gICAgICBsbyA9IGxvID4+IDg7XG4gICAgICBzZXRbNl0gPSBsbyAmIDB4ZmY7XG4gICAgICBsbyA9IGxvID4+IDg7XG4gICAgICBzZXRbNV0gPSBsbyAmIDB4ZmY7XG4gICAgICBzZXRbNF0gPSBoaSAmIDB4ZmY7XG4gICAgICBoaSA9IGhpID4+IDg7XG4gICAgICBzZXRbM10gPSBoaSAmIDB4ZmY7XG4gICAgICBoaSA9IGhpID4+IDg7XG4gICAgICBzZXRbMl0gPSBoaSAmIDB4ZmY7XG4gICAgICBoaSA9IGhpID4+IDg7XG4gICAgICBzZXRbMV0gPSBoaSAmIDB4ZmY7XG4gICAgICBidWYucHVzaChzZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVjb2RlRXJyUHJlZml4fSBlbmNvdW50ZXJlZCBCaWdJbnQgbGFyZ2VyIHRoYW4gYWxsb3dhYmxlIHJhbmdlYClcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge1Rva2VufSB0b2tlblxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZW5jb2RlVWludC5lbmNvZGVkU2l6ZSA9IGZ1bmN0aW9uIGVuY29kZWRTaXplICh0b2tlbikge1xuICByZXR1cm4gZW5jb2RlVWludFZhbHVlLmVuY29kZWRTaXplKHRva2VuLnZhbHVlKVxufTtcblxuLyoqXG4gKiBAcGFyYW0ge251bWJlcn0gdWludFxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZW5jb2RlVWludFZhbHVlLmVuY29kZWRTaXplID0gZnVuY3Rpb24gZW5jb2RlZFNpemUgKHVpbnQpIHtcbiAgaWYgKHVpbnQgPCB1aW50Qm91bmRhcmllc1swXSkge1xuICAgIHJldHVybiAxXG4gIH1cbiAgaWYgKHVpbnQgPCB1aW50Qm91bmRhcmllc1sxXSkge1xuICAgIHJldHVybiAyXG4gIH1cbiAgaWYgKHVpbnQgPCB1aW50Qm91bmRhcmllc1syXSkge1xuICAgIHJldHVybiAzXG4gIH1cbiAgaWYgKHVpbnQgPCB1aW50Qm91bmRhcmllc1szXSkge1xuICAgIHJldHVybiA1XG4gIH1cbiAgcmV0dXJuIDlcbn07XG5cbi8qKlxuICogQHBhcmFtIHtUb2tlbn0gdG9rMVxuICogQHBhcmFtIHtUb2tlbn0gdG9rMlxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZW5jb2RlVWludC5jb21wYXJlVG9rZW5zID0gZnVuY3Rpb24gY29tcGFyZVRva2VucyAodG9rMSwgdG9rMikge1xuICByZXR1cm4gdG9rMS52YWx1ZSA8IHRvazIudmFsdWUgPyAtMSA6IHRvazEudmFsdWUgPiB0b2syLnZhbHVlID8gMSA6IC8qIGM4IGlnbm9yZSBuZXh0ICovIDBcbn07XG5cbi8qIGVzbGludC1lbnYgZXMyMDIwICovXG5cblxuLyoqXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCcuL2JsLmpzJykuQmx9IEJsXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCcuLi9pbnRlcmZhY2UnKS5EZWNvZGVPcHRpb25zfSBEZWNvZGVPcHRpb25zXG4gKi9cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBfbWlub3JcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiBkZWNvZGVOZWdpbnQ4IChkYXRhLCBwb3MsIF9taW5vciwgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IFRva2VuKFR5cGUubmVnaW50LCAtMSAtIHJlYWRVaW50OChkYXRhLCBwb3MgKyAxLCBvcHRpb25zKSwgMilcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBfbWlub3JcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiBkZWNvZGVOZWdpbnQxNiAoZGF0YSwgcG9zLCBfbWlub3IsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG5ldyBUb2tlbihUeXBlLm5lZ2ludCwgLTEgLSByZWFkVWludDE2KGRhdGEsIHBvcyArIDEsIG9wdGlvbnMpLCAzKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IHBvc1xuICogQHBhcmFtIHtudW1iZXJ9IF9taW5vclxuICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7VG9rZW59XG4gKi9cbmZ1bmN0aW9uIGRlY29kZU5lZ2ludDMyIChkYXRhLCBwb3MsIF9taW5vciwgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IFRva2VuKFR5cGUubmVnaW50LCAtMSAtIHJlYWRVaW50MzIoZGF0YSwgcG9zICsgMSwgb3B0aW9ucyksIDUpXG59XG5cbmNvbnN0IG5lZzFiID0gQmlnSW50KC0xKTtcbmNvbnN0IHBvczFiID0gQmlnSW50KDEpO1xuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IHBvc1xuICogQHBhcmFtIHtudW1iZXJ9IF9taW5vclxuICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7VG9rZW59XG4gKi9cbmZ1bmN0aW9uIGRlY29kZU5lZ2ludDY0IChkYXRhLCBwb3MsIF9taW5vciwgb3B0aW9ucykge1xuICBjb25zdCBpbnQgPSByZWFkVWludDY0KGRhdGEsIHBvcyArIDEsIG9wdGlvbnMpO1xuICBpZiAodHlwZW9mIGludCAhPT0gJ2JpZ2ludCcpIHtcbiAgICBjb25zdCB2YWx1ZSA9IC0xIC0gaW50O1xuICAgIGlmICh2YWx1ZSA+PSBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUikge1xuICAgICAgcmV0dXJuIG5ldyBUb2tlbihUeXBlLm5lZ2ludCwgdmFsdWUsIDkpXG4gICAgfVxuICB9XG4gIGlmIChvcHRpb25zLmFsbG93QmlnSW50ICE9PSB0cnVlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2RlY29kZUVyclByZWZpeH0gaW50ZWdlcnMgb3V0c2lkZSBvZiB0aGUgc2FmZSBpbnRlZ2VyIHJhbmdlIGFyZSBub3Qgc3VwcG9ydGVkYClcbiAgfVxuICByZXR1cm4gbmV3IFRva2VuKFR5cGUubmVnaW50LCBuZWcxYiAtIEJpZ0ludChpbnQpLCA5KVxufVxuXG4vKipcbiAqIEBwYXJhbSB7Qmx9IGJ1ZlxuICogQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiAqL1xuZnVuY3Rpb24gZW5jb2RlTmVnaW50IChidWYsIHRva2VuKSB7XG4gIGNvbnN0IG5lZ2ludCA9IHRva2VuLnZhbHVlO1xuICBjb25zdCB1bnNpZ25lZCA9ICh0eXBlb2YgbmVnaW50ID09PSAnYmlnaW50JyA/IChuZWdpbnQgKiBuZWcxYiAtIHBvczFiKSA6IChuZWdpbnQgKiAtMSAtIDEpKTtcbiAgZW5jb2RlVWludFZhbHVlKGJ1ZiwgdG9rZW4udHlwZS5tYWpvckVuY29kZWQsIHVuc2lnbmVkKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1Rva2VufSB0b2tlblxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZW5jb2RlTmVnaW50LmVuY29kZWRTaXplID0gZnVuY3Rpb24gZW5jb2RlZFNpemUgKHRva2VuKSB7XG4gIGNvbnN0IG5lZ2ludCA9IHRva2VuLnZhbHVlO1xuICBjb25zdCB1bnNpZ25lZCA9ICh0eXBlb2YgbmVnaW50ID09PSAnYmlnaW50JyA/IChuZWdpbnQgKiBuZWcxYiAtIHBvczFiKSA6IChuZWdpbnQgKiAtMSAtIDEpKTtcbiAgLyogYzggaWdub3JlIG5leHQgNCAqL1xuICAvLyBoYW5kbGVkIGJ5IHF1aWNrRW5jb2RlLCB3ZSBzaG91bGRuJ3QgZ2V0IGhlcmUgYnV0IGl0J3MgaW5jbHVkZWQgZm9yIGNvbXBsZXRlbmVzc1xuICBpZiAodW5zaWduZWQgPCB1aW50Qm91bmRhcmllc1swXSkge1xuICAgIHJldHVybiAxXG4gIH1cbiAgaWYgKHVuc2lnbmVkIDwgdWludEJvdW5kYXJpZXNbMV0pIHtcbiAgICByZXR1cm4gMlxuICB9XG4gIGlmICh1bnNpZ25lZCA8IHVpbnRCb3VuZGFyaWVzWzJdKSB7XG4gICAgcmV0dXJuIDNcbiAgfVxuICBpZiAodW5zaWduZWQgPCB1aW50Qm91bmRhcmllc1szXSkge1xuICAgIHJldHVybiA1XG4gIH1cbiAgcmV0dXJuIDlcbn07XG5cbi8qKlxuICogQHBhcmFtIHtUb2tlbn0gdG9rMVxuICogQHBhcmFtIHtUb2tlbn0gdG9rMlxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZW5jb2RlTmVnaW50LmNvbXBhcmVUb2tlbnMgPSBmdW5jdGlvbiBjb21wYXJlVG9rZW5zICh0b2sxLCB0b2syKSB7XG4gIC8vIG9wcG9zaXRlIG9mIHRoZSB1aW50IGNvbXBhcmlzb24gc2luY2Ugd2Ugc3RvcmUgdGhlIHVpbnQgdmVyc2lvbiBpbiBieXRlc1xuICByZXR1cm4gdG9rMS52YWx1ZSA8IHRvazIudmFsdWUgPyAxIDogdG9rMS52YWx1ZSA+IHRvazIudmFsdWUgPyAtMSA6IC8qIGM4IGlnbm9yZSBuZXh0ICovIDBcbn07XG5cbi8qKlxuICogQHR5cGVkZWYge2ltcG9ydCgnLi9ibC5qcycpLkJsfSBCbFxuICogQHR5cGVkZWYge2ltcG9ydCgnLi4vaW50ZXJmYWNlJykuRGVjb2RlT3B0aW9uc30gRGVjb2RlT3B0aW9uc1xuICovXG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gcG9zXG4gKiBAcGFyYW0ge251bWJlcn0gcHJlZml4XG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoXG4gKiBAcmV0dXJucyB7VG9rZW59XG4gKi9cbmZ1bmN0aW9uIHRvVG9rZW4kMyAoZGF0YSwgcG9zLCBwcmVmaXgsIGxlbmd0aCkge1xuICBhc3NlcnRFbm91Z2hEYXRhKGRhdGEsIHBvcywgcHJlZml4ICsgbGVuZ3RoKTtcbiAgY29uc3QgYnVmID0gc2xpY2UoZGF0YSwgcG9zICsgcHJlZml4LCBwb3MgKyBwcmVmaXggKyBsZW5ndGgpO1xuICByZXR1cm4gbmV3IFRva2VuKFR5cGUuYnl0ZXMsIGJ1ZiwgcHJlZml4ICsgbGVuZ3RoKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IHBvc1xuICogQHBhcmFtIHtudW1iZXJ9IG1pbm9yXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IF9vcHRpb25zXG4gKiBAcmV0dXJucyB7VG9rZW59XG4gKi9cbmZ1bmN0aW9uIGRlY29kZUJ5dGVzQ29tcGFjdCAoZGF0YSwgcG9zLCBtaW5vciwgX29wdGlvbnMpIHtcbiAgcmV0dXJuIHRvVG9rZW4kMyhkYXRhLCBwb3MsIDEsIG1pbm9yKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IHBvc1xuICogQHBhcmFtIHtudW1iZXJ9IF9taW5vclxuICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7VG9rZW59XG4gKi9cbmZ1bmN0aW9uIGRlY29kZUJ5dGVzOCAoZGF0YSwgcG9zLCBfbWlub3IsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHRvVG9rZW4kMyhkYXRhLCBwb3MsIDIsIHJlYWRVaW50OChkYXRhLCBwb3MgKyAxLCBvcHRpb25zKSlcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBfbWlub3JcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiBkZWNvZGVCeXRlczE2IChkYXRhLCBwb3MsIF9taW5vciwgb3B0aW9ucykge1xuICByZXR1cm4gdG9Ub2tlbiQzKGRhdGEsIHBvcywgMywgcmVhZFVpbnQxNihkYXRhLCBwb3MgKyAxLCBvcHRpb25zKSlcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBfbWlub3JcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiBkZWNvZGVCeXRlczMyIChkYXRhLCBwb3MsIF9taW5vciwgb3B0aW9ucykge1xuICByZXR1cm4gdG9Ub2tlbiQzKGRhdGEsIHBvcywgNSwgcmVhZFVpbnQzMihkYXRhLCBwb3MgKyAxLCBvcHRpb25zKSlcbn1cblxuLy8gVE9ETzogbWF5YmUgd2Ugc2hvdWxkbid0IHN1cHBvcnQgdGhpcyAuLlxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBfbWlub3JcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiBkZWNvZGVCeXRlczY0IChkYXRhLCBwb3MsIF9taW5vciwgb3B0aW9ucykge1xuICBjb25zdCBsID0gcmVhZFVpbnQ2NChkYXRhLCBwb3MgKyAxLCBvcHRpb25zKTtcbiAgaWYgKHR5cGVvZiBsID09PSAnYmlnaW50Jykge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtkZWNvZGVFcnJQcmVmaXh9IDY0LWJpdCBpbnRlZ2VyIGJ5dGVzIGxlbmd0aHMgbm90IHN1cHBvcnRlZGApXG4gIH1cbiAgcmV0dXJuIHRvVG9rZW4kMyhkYXRhLCBwb3MsIDksIGwpXG59XG5cbi8qKlxuICogYGVuY29kZWRCeXRlc2AgYWxsb3dzIGZvciBjYWNoaW5nIHdoZW4gd2UgZG8gYSBieXRlIHZlcnNpb24gb2YgYSBzdHJpbmdcbiAqIGZvciBrZXkgc29ydGluZyBwdXJwb3Nlc1xuICogQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiAqIEByZXR1cm5zIHtVaW50OEFycmF5fVxuICovXG5mdW5jdGlvbiB0b2tlbkJ5dGVzICh0b2tlbikge1xuICBpZiAodG9rZW4uZW5jb2RlZEJ5dGVzID09PSB1bmRlZmluZWQpIHtcbiAgICB0b2tlbi5lbmNvZGVkQnl0ZXMgPSB0b2tlbi50eXBlID09PSBUeXBlLnN0cmluZyA/IGZyb21TdHJpbmcodG9rZW4udmFsdWUpIDogdG9rZW4udmFsdWU7XG4gIH1cbiAgLy8gQHRzLWlnbm9yZSBjJ21vblxuICByZXR1cm4gdG9rZW4uZW5jb2RlZEJ5dGVzXG59XG5cbi8qKlxuICogQHBhcmFtIHtCbH0gYnVmXG4gKiBAcGFyYW0ge1Rva2VufSB0b2tlblxuICovXG5mdW5jdGlvbiBlbmNvZGVCeXRlcyAoYnVmLCB0b2tlbikge1xuICBjb25zdCBieXRlcyA9IHRva2VuQnl0ZXModG9rZW4pO1xuICBlbmNvZGVVaW50VmFsdWUoYnVmLCB0b2tlbi50eXBlLm1ham9yRW5jb2RlZCwgYnl0ZXMubGVuZ3RoKTtcbiAgYnVmLnB1c2goYnl0ZXMpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7VG9rZW59IHRva2VuXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5lbmNvZGVCeXRlcy5lbmNvZGVkU2l6ZSA9IGZ1bmN0aW9uIGVuY29kZWRTaXplICh0b2tlbikge1xuICBjb25zdCBieXRlcyA9IHRva2VuQnl0ZXModG9rZW4pO1xuICByZXR1cm4gZW5jb2RlVWludFZhbHVlLmVuY29kZWRTaXplKGJ5dGVzLmxlbmd0aCkgKyBieXRlcy5sZW5ndGhcbn07XG5cbi8qKlxuICogQHBhcmFtIHtUb2tlbn0gdG9rMVxuICogQHBhcmFtIHtUb2tlbn0gdG9rMlxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZW5jb2RlQnl0ZXMuY29tcGFyZVRva2VucyA9IGZ1bmN0aW9uIGNvbXBhcmVUb2tlbnMgKHRvazEsIHRvazIpIHtcbiAgcmV0dXJuIGNvbXBhcmVCeXRlcyh0b2tlbkJ5dGVzKHRvazEpLCB0b2tlbkJ5dGVzKHRvazIpKVxufTtcblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGIxXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGIyXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBjb21wYXJlQnl0ZXMgKGIxLCBiMikge1xuICByZXR1cm4gYjEubGVuZ3RoIDwgYjIubGVuZ3RoID8gLTEgOiBiMS5sZW5ndGggPiBiMi5sZW5ndGggPyAxIDogY29tcGFyZShiMSwgYjIpXG59XG5cbi8qKlxuICogQHR5cGVkZWYge2ltcG9ydCgnLi9ibC5qcycpLkJsfSBCbFxuICogQHR5cGVkZWYge2ltcG9ydCgnLi4vaW50ZXJmYWNlJykuRGVjb2RlT3B0aW9uc30gRGVjb2RlT3B0aW9uc1xuICovXG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gcG9zXG4gKiBAcGFyYW0ge251bWJlcn0gcHJlZml4XG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtUb2tlbn1cbiAqL1xuZnVuY3Rpb24gdG9Ub2tlbiQyIChkYXRhLCBwb3MsIHByZWZpeCwgbGVuZ3RoLCBvcHRpb25zKSB7XG4gIGNvbnN0IHRvdExlbmd0aCA9IHByZWZpeCArIGxlbmd0aDtcbiAgYXNzZXJ0RW5vdWdoRGF0YShkYXRhLCBwb3MsIHRvdExlbmd0aCk7XG4gIGNvbnN0IHRvayA9IG5ldyBUb2tlbihUeXBlLnN0cmluZywgdG9TdHJpbmcoZGF0YSwgcG9zICsgcHJlZml4LCBwb3MgKyB0b3RMZW5ndGgpLCB0b3RMZW5ndGgpO1xuICBpZiAob3B0aW9ucy5yZXRhaW5TdHJpbmdCeXRlcyA9PT0gdHJ1ZSkge1xuICAgIHRvay5ieXRlVmFsdWUgPSBzbGljZShkYXRhLCBwb3MgKyBwcmVmaXgsIHBvcyArIHRvdExlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIHRva1xufVxuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IHBvc1xuICogQHBhcmFtIHtudW1iZXJ9IG1pbm9yXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtUb2tlbn1cbiAqL1xuZnVuY3Rpb24gZGVjb2RlU3RyaW5nQ29tcGFjdCAoZGF0YSwgcG9zLCBtaW5vciwgb3B0aW9ucykge1xuICByZXR1cm4gdG9Ub2tlbiQyKGRhdGEsIHBvcywgMSwgbWlub3IsIG9wdGlvbnMpXG59XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gcG9zXG4gKiBAcGFyYW0ge251bWJlcn0gX21pbm9yXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtUb2tlbn1cbiAqL1xuZnVuY3Rpb24gZGVjb2RlU3RyaW5nOCAoZGF0YSwgcG9zLCBfbWlub3IsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHRvVG9rZW4kMihkYXRhLCBwb3MsIDIsIHJlYWRVaW50OChkYXRhLCBwb3MgKyAxLCBvcHRpb25zKSwgb3B0aW9ucylcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBfbWlub3JcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiBkZWNvZGVTdHJpbmcxNiAoZGF0YSwgcG9zLCBfbWlub3IsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHRvVG9rZW4kMihkYXRhLCBwb3MsIDMsIHJlYWRVaW50MTYoZGF0YSwgcG9zICsgMSwgb3B0aW9ucyksIG9wdGlvbnMpXG59XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gcG9zXG4gKiBAcGFyYW0ge251bWJlcn0gX21pbm9yXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtUb2tlbn1cbiAqL1xuZnVuY3Rpb24gZGVjb2RlU3RyaW5nMzIgKGRhdGEsIHBvcywgX21pbm9yLCBvcHRpb25zKSB7XG4gIHJldHVybiB0b1Rva2VuJDIoZGF0YSwgcG9zLCA1LCByZWFkVWludDMyKGRhdGEsIHBvcyArIDEsIG9wdGlvbnMpLCBvcHRpb25zKVxufVxuXG4vLyBUT0RPOiBtYXliZSB3ZSBzaG91bGRuJ3Qgc3VwcG9ydCB0aGlzIC4uXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IHBvc1xuICogQHBhcmFtIHtudW1iZXJ9IF9taW5vclxuICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7VG9rZW59XG4gKi9cbmZ1bmN0aW9uIGRlY29kZVN0cmluZzY0IChkYXRhLCBwb3MsIF9taW5vciwgb3B0aW9ucykge1xuICBjb25zdCBsID0gcmVhZFVpbnQ2NChkYXRhLCBwb3MgKyAxLCBvcHRpb25zKTtcbiAgaWYgKHR5cGVvZiBsID09PSAnYmlnaW50Jykge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtkZWNvZGVFcnJQcmVmaXh9IDY0LWJpdCBpbnRlZ2VyIHN0cmluZyBsZW5ndGhzIG5vdCBzdXBwb3J0ZWRgKVxuICB9XG4gIHJldHVybiB0b1Rva2VuJDIoZGF0YSwgcG9zLCA5LCBsLCBvcHRpb25zKVxufVxuXG5jb25zdCBlbmNvZGVTdHJpbmcgPSBlbmNvZGVCeXRlcztcblxuLyoqXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCcuL2JsLmpzJykuQmx9IEJsXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCcuLi9pbnRlcmZhY2UnKS5EZWNvZGVPcHRpb25zfSBEZWNvZGVPcHRpb25zXG4gKi9cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IF9kYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gX3Bvc1xuICogQHBhcmFtIHtudW1iZXJ9IHByZWZpeFxuICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aFxuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiB0b1Rva2VuJDEgKF9kYXRhLCBfcG9zLCBwcmVmaXgsIGxlbmd0aCkge1xuICByZXR1cm4gbmV3IFRva2VuKFR5cGUuYXJyYXksIGxlbmd0aCwgcHJlZml4KVxufVxuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IHBvc1xuICogQHBhcmFtIHtudW1iZXJ9IG1pbm9yXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IF9vcHRpb25zXG4gKiBAcmV0dXJucyB7VG9rZW59XG4gKi9cbmZ1bmN0aW9uIGRlY29kZUFycmF5Q29tcGFjdCAoZGF0YSwgcG9zLCBtaW5vciwgX29wdGlvbnMpIHtcbiAgcmV0dXJuIHRvVG9rZW4kMShkYXRhLCBwb3MsIDEsIG1pbm9yKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IHBvc1xuICogQHBhcmFtIHtudW1iZXJ9IF9taW5vclxuICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7VG9rZW59XG4gKi9cbmZ1bmN0aW9uIGRlY29kZUFycmF5OCAoZGF0YSwgcG9zLCBfbWlub3IsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHRvVG9rZW4kMShkYXRhLCBwb3MsIDIsIHJlYWRVaW50OChkYXRhLCBwb3MgKyAxLCBvcHRpb25zKSlcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBfbWlub3JcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiBkZWNvZGVBcnJheTE2IChkYXRhLCBwb3MsIF9taW5vciwgb3B0aW9ucykge1xuICByZXR1cm4gdG9Ub2tlbiQxKGRhdGEsIHBvcywgMywgcmVhZFVpbnQxNihkYXRhLCBwb3MgKyAxLCBvcHRpb25zKSlcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBfbWlub3JcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiBkZWNvZGVBcnJheTMyIChkYXRhLCBwb3MsIF9taW5vciwgb3B0aW9ucykge1xuICByZXR1cm4gdG9Ub2tlbiQxKGRhdGEsIHBvcywgNSwgcmVhZFVpbnQzMihkYXRhLCBwb3MgKyAxLCBvcHRpb25zKSlcbn1cblxuLy8gVE9ETzogbWF5YmUgd2Ugc2hvdWxkbid0IHN1cHBvcnQgdGhpcyAuLlxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBfbWlub3JcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiBkZWNvZGVBcnJheTY0IChkYXRhLCBwb3MsIF9taW5vciwgb3B0aW9ucykge1xuICBjb25zdCBsID0gcmVhZFVpbnQ2NChkYXRhLCBwb3MgKyAxLCBvcHRpb25zKTtcbiAgaWYgKHR5cGVvZiBsID09PSAnYmlnaW50Jykge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtkZWNvZGVFcnJQcmVmaXh9IDY0LWJpdCBpbnRlZ2VyIGFycmF5IGxlbmd0aHMgbm90IHN1cHBvcnRlZGApXG4gIH1cbiAgcmV0dXJuIHRvVG9rZW4kMShkYXRhLCBwb3MsIDksIGwpXG59XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gcG9zXG4gKiBAcGFyYW0ge251bWJlcn0gX21pbm9yXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtUb2tlbn1cbiAqL1xuZnVuY3Rpb24gZGVjb2RlQXJyYXlJbmRlZmluaXRlIChkYXRhLCBwb3MsIF9taW5vciwgb3B0aW9ucykge1xuICBpZiAob3B0aW9ucy5hbGxvd0luZGVmaW5pdGUgPT09IGZhbHNlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2RlY29kZUVyclByZWZpeH0gaW5kZWZpbml0ZSBsZW5ndGggaXRlbXMgbm90IGFsbG93ZWRgKVxuICB9XG4gIHJldHVybiB0b1Rva2VuJDEoZGF0YSwgcG9zLCAxLCBJbmZpbml0eSlcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0JsfSBidWZcbiAqIEBwYXJhbSB7VG9rZW59IHRva2VuXG4gKi9cbmZ1bmN0aW9uIGVuY29kZUFycmF5IChidWYsIHRva2VuKSB7XG4gIGVuY29kZVVpbnRWYWx1ZShidWYsIFR5cGUuYXJyYXkubWFqb3JFbmNvZGVkLCB0b2tlbi52YWx1ZSk7XG59XG5cbi8vIHVzaW5nIGFuIGFycmF5IGFzIGEgbWFwIGtleSwgYXJlIHlvdSBzdXJlIGFib3V0IHRoaXM/IHdlIGNhbiBvbmx5IHNvcnRcbi8vIGJ5IG1hcCBsZW5ndGggaGVyZSwgaXQncyB1cCB0byB0aGUgZW5jb2RlciB0byBkZWNpZGUgdG8gbG9vayBkZWVwZXJcbmVuY29kZUFycmF5LmNvbXBhcmVUb2tlbnMgPSBlbmNvZGVVaW50LmNvbXBhcmVUb2tlbnM7XG5cbi8qKlxuICogQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmVuY29kZUFycmF5LmVuY29kZWRTaXplID0gZnVuY3Rpb24gZW5jb2RlZFNpemUgKHRva2VuKSB7XG4gIHJldHVybiBlbmNvZGVVaW50VmFsdWUuZW5jb2RlZFNpemUodG9rZW4udmFsdWUpXG59O1xuXG4vKipcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4vYmwuanMnKS5CbH0gQmxcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4uL2ludGVyZmFjZScpLkRlY29kZU9wdGlvbnN9IERlY29kZU9wdGlvbnNcbiAqL1xuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gX2RhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBfcG9zXG4gKiBAcGFyYW0ge251bWJlcn0gcHJlZml4XG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoXG4gKiBAcmV0dXJucyB7VG9rZW59XG4gKi9cbmZ1bmN0aW9uIHRvVG9rZW4gKF9kYXRhLCBfcG9zLCBwcmVmaXgsIGxlbmd0aCkge1xuICByZXR1cm4gbmV3IFRva2VuKFR5cGUubWFwLCBsZW5ndGgsIHByZWZpeClcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBtaW5vclxuICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBfb3B0aW9uc1xuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiBkZWNvZGVNYXBDb21wYWN0IChkYXRhLCBwb3MsIG1pbm9yLCBfb3B0aW9ucykge1xuICByZXR1cm4gdG9Ub2tlbihkYXRhLCBwb3MsIDEsIG1pbm9yKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IHBvc1xuICogQHBhcmFtIHtudW1iZXJ9IF9taW5vclxuICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7VG9rZW59XG4gKi9cbmZ1bmN0aW9uIGRlY29kZU1hcDggKGRhdGEsIHBvcywgX21pbm9yLCBvcHRpb25zKSB7XG4gIHJldHVybiB0b1Rva2VuKGRhdGEsIHBvcywgMiwgcmVhZFVpbnQ4KGRhdGEsIHBvcyArIDEsIG9wdGlvbnMpKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IHBvc1xuICogQHBhcmFtIHtudW1iZXJ9IF9taW5vclxuICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7VG9rZW59XG4gKi9cbmZ1bmN0aW9uIGRlY29kZU1hcDE2IChkYXRhLCBwb3MsIF9taW5vciwgb3B0aW9ucykge1xuICByZXR1cm4gdG9Ub2tlbihkYXRhLCBwb3MsIDMsIHJlYWRVaW50MTYoZGF0YSwgcG9zICsgMSwgb3B0aW9ucykpXG59XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gcG9zXG4gKiBAcGFyYW0ge251bWJlcn0gX21pbm9yXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtUb2tlbn1cbiAqL1xuZnVuY3Rpb24gZGVjb2RlTWFwMzIgKGRhdGEsIHBvcywgX21pbm9yLCBvcHRpb25zKSB7XG4gIHJldHVybiB0b1Rva2VuKGRhdGEsIHBvcywgNSwgcmVhZFVpbnQzMihkYXRhLCBwb3MgKyAxLCBvcHRpb25zKSlcbn1cblxuLy8gVE9ETzogbWF5YmUgd2Ugc2hvdWxkbid0IHN1cHBvcnQgdGhpcyAuLlxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBfbWlub3JcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiBkZWNvZGVNYXA2NCAoZGF0YSwgcG9zLCBfbWlub3IsIG9wdGlvbnMpIHtcbiAgY29uc3QgbCA9IHJlYWRVaW50NjQoZGF0YSwgcG9zICsgMSwgb3B0aW9ucyk7XG4gIGlmICh0eXBlb2YgbCA9PT0gJ2JpZ2ludCcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVjb2RlRXJyUHJlZml4fSA2NC1iaXQgaW50ZWdlciBtYXAgbGVuZ3RocyBub3Qgc3VwcG9ydGVkYClcbiAgfVxuICByZXR1cm4gdG9Ub2tlbihkYXRhLCBwb3MsIDksIGwpXG59XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gcG9zXG4gKiBAcGFyYW0ge251bWJlcn0gX21pbm9yXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtUb2tlbn1cbiAqL1xuZnVuY3Rpb24gZGVjb2RlTWFwSW5kZWZpbml0ZSAoZGF0YSwgcG9zLCBfbWlub3IsIG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMuYWxsb3dJbmRlZmluaXRlID09PSBmYWxzZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtkZWNvZGVFcnJQcmVmaXh9IGluZGVmaW5pdGUgbGVuZ3RoIGl0ZW1zIG5vdCBhbGxvd2VkYClcbiAgfVxuICByZXR1cm4gdG9Ub2tlbihkYXRhLCBwb3MsIDEsIEluZmluaXR5KVxufVxuXG4vKipcbiAqIEBwYXJhbSB7Qmx9IGJ1ZlxuICogQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiAqL1xuZnVuY3Rpb24gZW5jb2RlTWFwIChidWYsIHRva2VuKSB7XG4gIGVuY29kZVVpbnRWYWx1ZShidWYsIFR5cGUubWFwLm1ham9yRW5jb2RlZCwgdG9rZW4udmFsdWUpO1xufVxuXG4vLyB1c2luZyBhIG1hcCBhcyBhIG1hcCBrZXksIGFyZSB5b3Ugc3VyZSBhYm91dCB0aGlzPyB3ZSBjYW4gb25seSBzb3J0XG4vLyBieSBtYXAgbGVuZ3RoIGhlcmUsIGl0J3MgdXAgdG8gdGhlIGVuY29kZXIgdG8gZGVjaWRlIHRvIGxvb2sgZGVlcGVyXG5lbmNvZGVNYXAuY29tcGFyZVRva2VucyA9IGVuY29kZVVpbnQuY29tcGFyZVRva2VucztcblxuLyoqXG4gKiBAcGFyYW0ge1Rva2VufSB0b2tlblxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZW5jb2RlTWFwLmVuY29kZWRTaXplID0gZnVuY3Rpb24gZW5jb2RlZFNpemUgKHRva2VuKSB7XG4gIHJldHVybiBlbmNvZGVVaW50VmFsdWUuZW5jb2RlZFNpemUodG9rZW4udmFsdWUpXG59O1xuXG4vKipcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4vYmwuanMnKS5CbH0gQmxcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4uL2ludGVyZmFjZScpLkRlY29kZU9wdGlvbnN9IERlY29kZU9wdGlvbnNcbiAqL1xuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gX2RhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBfcG9zXG4gKiBAcGFyYW0ge251bWJlcn0gbWlub3JcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gX29wdGlvbnNcbiAqIEByZXR1cm5zIHtUb2tlbn1cbiAqL1xuZnVuY3Rpb24gZGVjb2RlVGFnQ29tcGFjdCAoX2RhdGEsIF9wb3MsIG1pbm9yLCBfb3B0aW9ucykge1xuICByZXR1cm4gbmV3IFRva2VuKFR5cGUudGFnLCBtaW5vciwgMSlcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBfbWlub3JcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiBkZWNvZGVUYWc4IChkYXRhLCBwb3MsIF9taW5vciwgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IFRva2VuKFR5cGUudGFnLCByZWFkVWludDgoZGF0YSwgcG9zICsgMSwgb3B0aW9ucyksIDIpXG59XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gcG9zXG4gKiBAcGFyYW0ge251bWJlcn0gX21pbm9yXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtUb2tlbn1cbiAqL1xuZnVuY3Rpb24gZGVjb2RlVGFnMTYgKGRhdGEsIHBvcywgX21pbm9yLCBvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgVG9rZW4oVHlwZS50YWcsIHJlYWRVaW50MTYoZGF0YSwgcG9zICsgMSwgb3B0aW9ucyksIDMpXG59XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gcG9zXG4gKiBAcGFyYW0ge251bWJlcn0gX21pbm9yXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtUb2tlbn1cbiAqL1xuZnVuY3Rpb24gZGVjb2RlVGFnMzIgKGRhdGEsIHBvcywgX21pbm9yLCBvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgVG9rZW4oVHlwZS50YWcsIHJlYWRVaW50MzIoZGF0YSwgcG9zICsgMSwgb3B0aW9ucyksIDUpXG59XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gcG9zXG4gKiBAcGFyYW0ge251bWJlcn0gX21pbm9yXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtUb2tlbn1cbiAqL1xuZnVuY3Rpb24gZGVjb2RlVGFnNjQgKGRhdGEsIHBvcywgX21pbm9yLCBvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgVG9rZW4oVHlwZS50YWcsIHJlYWRVaW50NjQoZGF0YSwgcG9zICsgMSwgb3B0aW9ucyksIDkpXG59XG5cbi8qKlxuICogQHBhcmFtIHtCbH0gYnVmXG4gKiBAcGFyYW0ge1Rva2VufSB0b2tlblxuICovXG5mdW5jdGlvbiBlbmNvZGVUYWcgKGJ1ZiwgdG9rZW4pIHtcbiAgZW5jb2RlVWludFZhbHVlKGJ1ZiwgVHlwZS50YWcubWFqb3JFbmNvZGVkLCB0b2tlbi52YWx1ZSk7XG59XG5cbmVuY29kZVRhZy5jb21wYXJlVG9rZW5zID0gZW5jb2RlVWludC5jb21wYXJlVG9rZW5zO1xuXG4vKipcbiAqIEBwYXJhbSB7VG9rZW59IHRva2VuXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5lbmNvZGVUYWcuZW5jb2RlZFNpemUgPSBmdW5jdGlvbiBlbmNvZGVkU2l6ZSAodG9rZW4pIHtcbiAgcmV0dXJuIGVuY29kZVVpbnRWYWx1ZS5lbmNvZGVkU2l6ZSh0b2tlbi52YWx1ZSlcbn07XG5cbi8vIFRPRE86IHNoaWZ0IHNvbWUgb2YgdGhlIGJ5dGVzIGxvZ2ljIHRvIGJ5dGVzLXV0aWxzIHNvIHdlIGNhbiB1c2UgQnVmZmVyXG4vLyB3aGVyZSBwb3NzaWJsZVxuXG5cbi8qKlxuICogQHR5cGVkZWYge2ltcG9ydCgnLi9ibC5qcycpLkJsfSBCbFxuICogQHR5cGVkZWYge2ltcG9ydCgnLi4vaW50ZXJmYWNlJykuRGVjb2RlT3B0aW9uc30gRGVjb2RlT3B0aW9uc1xuICogQHR5cGVkZWYge2ltcG9ydCgnLi4vaW50ZXJmYWNlJykuRW5jb2RlT3B0aW9uc30gRW5jb2RlT3B0aW9uc1xuICovXG5cbmNvbnN0IE1JTk9SX0ZBTFNFID0gMjA7XG5jb25zdCBNSU5PUl9UUlVFID0gMjE7XG5jb25zdCBNSU5PUl9OVUxMID0gMjI7XG5jb25zdCBNSU5PUl9VTkRFRklORUQgPSAyMztcblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IF9kYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gX3Bvc1xuICogQHBhcmFtIHtudW1iZXJ9IF9taW5vclxuICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7VG9rZW59XG4gKi9cbmZ1bmN0aW9uIGRlY29kZVVuZGVmaW5lZCAoX2RhdGEsIF9wb3MsIF9taW5vciwgb3B0aW9ucykge1xuICBpZiAob3B0aW9ucy5hbGxvd1VuZGVmaW5lZCA9PT0gZmFsc2UpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVjb2RlRXJyUHJlZml4fSB1bmRlZmluZWQgdmFsdWVzIGFyZSBub3Qgc3VwcG9ydGVkYClcbiAgfSBlbHNlIGlmIChvcHRpb25zLmNvZXJjZVVuZGVmaW5lZFRvTnVsbCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBuZXcgVG9rZW4oVHlwZS5udWxsLCBudWxsLCAxKVxuICB9XG4gIHJldHVybiBuZXcgVG9rZW4oVHlwZS51bmRlZmluZWQsIHVuZGVmaW5lZCwgMSlcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IF9kYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gX3Bvc1xuICogQHBhcmFtIHtudW1iZXJ9IF9taW5vclxuICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7VG9rZW59XG4gKi9cbmZ1bmN0aW9uIGRlY29kZUJyZWFrIChfZGF0YSwgX3BvcywgX21pbm9yLCBvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zLmFsbG93SW5kZWZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVjb2RlRXJyUHJlZml4fSBpbmRlZmluaXRlIGxlbmd0aCBpdGVtcyBub3QgYWxsb3dlZGApXG4gIH1cbiAgcmV0dXJuIG5ldyBUb2tlbihUeXBlLmJyZWFrLCB1bmRlZmluZWQsIDEpXG59XG5cbi8qKlxuICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gKiBAcGFyYW0ge251bWJlcn0gYnl0ZXNcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiBjcmVhdGVUb2tlbiAodmFsdWUsIGJ5dGVzLCBvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuYWxsb3dOYU4gPT09IGZhbHNlICYmIE51bWJlci5pc05hTih2YWx1ZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtkZWNvZGVFcnJQcmVmaXh9IE5hTiB2YWx1ZXMgYXJlIG5vdCBzdXBwb3J0ZWRgKVxuICAgIH1cbiAgICBpZiAob3B0aW9ucy5hbGxvd0luZmluaXR5ID09PSBmYWxzZSAmJiAodmFsdWUgPT09IEluZmluaXR5IHx8IHZhbHVlID09PSAtSW5maW5pdHkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVjb2RlRXJyUHJlZml4fSBJbmZpbml0eSB2YWx1ZXMgYXJlIG5vdCBzdXBwb3J0ZWRgKVxuICAgIH1cbiAgfVxuICByZXR1cm4gbmV3IFRva2VuKFR5cGUuZmxvYXQsIHZhbHVlLCBieXRlcylcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBfbWlub3JcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge1Rva2VufVxuICovXG5mdW5jdGlvbiBkZWNvZGVGbG9hdDE2IChkYXRhLCBwb3MsIF9taW5vciwgb3B0aW9ucykge1xuICByZXR1cm4gY3JlYXRlVG9rZW4ocmVhZEZsb2F0MTYoZGF0YSwgcG9zICsgMSksIDMsIG9wdGlvbnMpXG59XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gKiBAcGFyYW0ge251bWJlcn0gcG9zXG4gKiBAcGFyYW0ge251bWJlcn0gX21pbm9yXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHtUb2tlbn1cbiAqL1xuZnVuY3Rpb24gZGVjb2RlRmxvYXQzMiAoZGF0YSwgcG9zLCBfbWlub3IsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNyZWF0ZVRva2VuKHJlYWRGbG9hdDMyKGRhdGEsIHBvcyArIDEpLCA1LCBvcHRpb25zKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YVxuICogQHBhcmFtIHtudW1iZXJ9IHBvc1xuICogQHBhcmFtIHtudW1iZXJ9IF9taW5vclxuICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7VG9rZW59XG4gKi9cbmZ1bmN0aW9uIGRlY29kZUZsb2F0NjQgKGRhdGEsIHBvcywgX21pbm9yLCBvcHRpb25zKSB7XG4gIHJldHVybiBjcmVhdGVUb2tlbihyZWFkRmxvYXQ2NChkYXRhLCBwb3MgKyAxKSwgOSwgb3B0aW9ucylcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0JsfSBidWZcbiAqIEBwYXJhbSB7VG9rZW59IHRva2VuXG4gKiBAcGFyYW0ge0VuY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqL1xuZnVuY3Rpb24gZW5jb2RlRmxvYXQgKGJ1ZiwgdG9rZW4sIG9wdGlvbnMpIHtcbiAgY29uc3QgZmxvYXQgPSB0b2tlbi52YWx1ZTtcblxuICBpZiAoZmxvYXQgPT09IGZhbHNlKSB7XG4gICAgYnVmLnB1c2goW1R5cGUuZmxvYXQubWFqb3JFbmNvZGVkIHwgTUlOT1JfRkFMU0VdKTtcbiAgfSBlbHNlIGlmIChmbG9hdCA9PT0gdHJ1ZSkge1xuICAgIGJ1Zi5wdXNoKFtUeXBlLmZsb2F0Lm1ham9yRW5jb2RlZCB8IE1JTk9SX1RSVUVdKTtcbiAgfSBlbHNlIGlmIChmbG9hdCA9PT0gbnVsbCkge1xuICAgIGJ1Zi5wdXNoKFtUeXBlLmZsb2F0Lm1ham9yRW5jb2RlZCB8IE1JTk9SX05VTExdKTtcbiAgfSBlbHNlIGlmIChmbG9hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYnVmLnB1c2goW1R5cGUuZmxvYXQubWFqb3JFbmNvZGVkIHwgTUlOT1JfVU5ERUZJTkVEXSk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGRlY29kZWQ7XG4gICAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICBpZiAoIW9wdGlvbnMgfHwgb3B0aW9ucy5mbG9hdDY0ICE9PSB0cnVlKSB7XG4gICAgICBlbmNvZGVGbG9hdDE2KGZsb2F0KTtcbiAgICAgIGRlY29kZWQgPSByZWFkRmxvYXQxNih1aThhLCAxKTtcbiAgICAgIGlmIChmbG9hdCA9PT0gZGVjb2RlZCB8fCBOdW1iZXIuaXNOYU4oZmxvYXQpKSB7XG4gICAgICAgIHVpOGFbMF0gPSAweGY5O1xuICAgICAgICBidWYucHVzaCh1aThhLnNsaWNlKDAsIDMpKTtcbiAgICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbmNvZGVGbG9hdDMyKGZsb2F0KTtcbiAgICAgICAgZGVjb2RlZCA9IHJlYWRGbG9hdDMyKHVpOGEsIDEpO1xuICAgICAgICBpZiAoZmxvYXQgPT09IGRlY29kZWQpIHtcbiAgICAgICAgICB1aThhWzBdID0gMHhmYTtcbiAgICAgICAgICBidWYucHVzaCh1aThhLnNsaWNlKDAsIDUpKTtcbiAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAgIGVuY29kZUZsb2F0NjQoZmxvYXQpO1xuICAgICAgZGVjb2RlZCA9IHJlYWRGbG9hdDY0KHVpOGEsIDEpO1xuICAgICAgdWk4YVswXSA9IDB4ZmI7XG4gICAgICBidWYucHVzaCh1aThhLnNsaWNlKDAsIDkpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge1Rva2VufSB0b2tlblxuICogQHBhcmFtIHtFbmNvZGVPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5lbmNvZGVGbG9hdC5lbmNvZGVkU2l6ZSA9IGZ1bmN0aW9uIGVuY29kZWRTaXplICh0b2tlbiwgb3B0aW9ucykge1xuICBjb25zdCBmbG9hdCA9IHRva2VuLnZhbHVlO1xuXG4gIGlmIChmbG9hdCA9PT0gZmFsc2UgfHwgZmxvYXQgPT09IHRydWUgfHwgZmxvYXQgPT09IG51bGwgfHwgZmxvYXQgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiAxXG4gIH1cblxuICBpZiAoIW9wdGlvbnMgfHwgb3B0aW9ucy5mbG9hdDY0ICE9PSB0cnVlKSB7XG4gICAgZW5jb2RlRmxvYXQxNihmbG9hdCk7XG4gICAgbGV0IGRlY29kZWQgPSByZWFkRmxvYXQxNih1aThhLCAxKTtcbiAgICBpZiAoZmxvYXQgPT09IGRlY29kZWQgfHwgTnVtYmVyLmlzTmFOKGZsb2F0KSkge1xuICAgICAgcmV0dXJuIDNcbiAgICB9XG4gICAgZW5jb2RlRmxvYXQzMihmbG9hdCk7XG4gICAgZGVjb2RlZCA9IHJlYWRGbG9hdDMyKHVpOGEsIDEpO1xuICAgIGlmIChmbG9hdCA9PT0gZGVjb2RlZCkge1xuICAgICAgcmV0dXJuIDVcbiAgICB9XG4gIH1cbiAgcmV0dXJuIDlcbn07XG5cbmNvbnN0IGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcig5KTtcbmNvbnN0IGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlciwgMSk7XG5jb25zdCB1aThhID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyLCAwKTtcblxuLyoqXG4gKiBAcGFyYW0ge251bWJlcn0gaW5wXG4gKi9cbmZ1bmN0aW9uIGVuY29kZUZsb2F0MTYgKGlucCkge1xuICBpZiAoaW5wID09PSBJbmZpbml0eSkge1xuICAgIGRhdGFWaWV3LnNldFVpbnQxNigwLCAweDdjMDAsIGZhbHNlKTtcbiAgfSBlbHNlIGlmIChpbnAgPT09IC1JbmZpbml0eSkge1xuICAgIGRhdGFWaWV3LnNldFVpbnQxNigwLCAweGZjMDAsIGZhbHNlKTtcbiAgfSBlbHNlIGlmIChOdW1iZXIuaXNOYU4oaW5wKSkge1xuICAgIGRhdGFWaWV3LnNldFVpbnQxNigwLCAweDdlMDAsIGZhbHNlKTtcbiAgfSBlbHNlIHtcbiAgICBkYXRhVmlldy5zZXRGbG9hdDMyKDAsIGlucCk7XG4gICAgY29uc3QgdmFsdTMyID0gZGF0YVZpZXcuZ2V0VWludDMyKDApO1xuICAgIGNvbnN0IGV4cG9uZW50ID0gKHZhbHUzMiAmIDB4N2Y4MDAwMDApID4+IDIzO1xuICAgIGNvbnN0IG1hbnRpc3NhID0gdmFsdTMyICYgMHg3ZmZmZmY7XG5cbiAgICAvKiBjOCBpZ25vcmUgbmV4dCA2ICovXG4gICAgaWYgKGV4cG9uZW50ID09PSAweGZmKSB7XG4gICAgICAvLyB0b28gYmlnLCBJbmZpbml0eSwgYnV0IHRoaXMgc2hvdWxkIGJlIGhhcmQgKGltcG9zc2libGU/KSB0byB0cmlnZ2VyXG4gICAgICBkYXRhVmlldy5zZXRVaW50MTYoMCwgMHg3YzAwLCBmYWxzZSk7XG4gICAgfSBlbHNlIGlmIChleHBvbmVudCA9PT0gMHgwMCkge1xuICAgICAgLy8gMC4wLCAtMC4wIGFuZCBzdWJub3JtYWxzLCBzaG91bGRuJ3QgYmUgcG9zc2libGUgdG8gZ2V0IGhlcmUgYmVjYXVzZSAwLjAgc2hvdWxkIGJlIGNvdW50ZWQgYXMgYW4gaW50XG4gICAgICBkYXRhVmlldy5zZXRVaW50MTYoMCwgKChpbnAgJiAweDgwMDAwMDAwKSA+PiAxNikgfCAobWFudGlzc2EgPj4gMTMpLCBmYWxzZSk7XG4gICAgfSBlbHNlIHsgLy8gc3RhbmRhcmQgbnVtYmVyc1xuICAgICAgLy8gY2h1bmtzIG9mIGxvZ2ljIGhlcmUgYm9ycm93ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vUEpLL2xpYmNib3IvYmxvYi9jNzhmNDM3MTgyNTMzZTNlZmE4ZDk2M2ZmNGI5NDViYjYzNWMyMjg0L3NyYy9jYm9yL2VuY29kaW5nLmMjTDEyN1xuICAgICAgY29uc3QgbG9naWNhbEV4cG9uZW50ID0gZXhwb25lbnQgLSAxMjc7XG4gICAgICAvLyBOb3cgd2Uga25vdyB0aGF0IDJeZXhwb25lbnQgPD0gMCBsb2dpY2FsbHlcbiAgICAgIC8qIGM4IGlnbm9yZSBuZXh0IDYgKi9cbiAgICAgIGlmIChsb2dpY2FsRXhwb25lbnQgPCAtMjQpIHtcbiAgICAgICAgLyogTm8gdW5hbWJpZ3VvdXMgcmVwcmVzZW50YXRpb24gZXhpc3RzLCB0aGlzIGZsb2F0IGlzIG5vdCBhIGhhbGYgZmxvYXRcbiAgICAgICAgICBhbmQgaXMgdG9vIHNtYWxsIHRvIGJlIHJlcHJlc2VudGVkIHVzaW5nIGEgaGFsZiwgcm91bmQgb2ZmIHRvIHplcm8uXG4gICAgICAgICAgQ29uc2lzdGVudCB3aXRoIHRoZSByZWZlcmVuY2UgaW1wbGVtZW50YXRpb24uICovXG4gICAgICAgIC8vIHNob3VsZCBiZSBkaWZmaWN1bHQgKGltcG9zc2libGU/KSB0byBnZXQgaGVyZSBpbiBKU1xuICAgICAgICBkYXRhVmlldy5zZXRVaW50MTYoMCwgMCk7XG4gICAgICB9IGVsc2UgaWYgKGxvZ2ljYWxFeHBvbmVudCA8IC0xNCkge1xuICAgICAgICAvKiBPZmZzZXQgdGhlIHJlbWFpbmluZyBkZWNpbWFsIHBsYWNlcyBieSBzaGlmdGluZyB0aGUgc2lnbmlmaWNhbmQsIHRoZVxuICAgICAgICAgIHZhbHVlIGlzIGxvc3QuIFRoaXMgaXMgYW4gaW1wbGVtZW50YXRpb24gZGVjaXNpb24gdGhhdCB3b3JrcyBhcm91bmQgdGhlXG4gICAgICAgICAgYWJzZW5jZSBvZiBzdGFuZGFyZCBoYWxmLWZsb2F0IGluIHRoZSBsYW5ndWFnZS4gKi9cbiAgICAgICAgZGF0YVZpZXcuc2V0VWludDE2KDAsICgodmFsdTMyICYgMHg4MDAwMDAwMCkgPj4gMTYpIHwgLyogc2lnbiBiaXQgKi8gKDEgPDwgKDI0ICsgbG9naWNhbEV4cG9uZW50KSksIGZhbHNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdGFWaWV3LnNldFVpbnQxNigwLCAoKHZhbHUzMiAmIDB4ODAwMDAwMDApID4+IDE2KSB8ICgobG9naWNhbEV4cG9uZW50ICsgMTUpIDw8IDEwKSB8IChtYW50aXNzYSA+PiAxMyksIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IHVpOGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIHJlYWRGbG9hdDE2ICh1aThhLCBwb3MpIHtcbiAgaWYgKHVpOGEubGVuZ3RoIC0gcG9zIDwgMikge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtkZWNvZGVFcnJQcmVmaXh9IG5vdCBlbm91Z2ggZGF0YSBmb3IgZmxvYXQxNmApXG4gIH1cblxuICBjb25zdCBoYWxmID0gKHVpOGFbcG9zXSA8PCA4KSArIHVpOGFbcG9zICsgMV07XG4gIGlmIChoYWxmID09PSAweDdjMDApIHtcbiAgICByZXR1cm4gSW5maW5pdHlcbiAgfVxuICBpZiAoaGFsZiA9PT0gMHhmYzAwKSB7XG4gICAgcmV0dXJuIC1JbmZpbml0eVxuICB9XG4gIGlmIChoYWxmID09PSAweDdlMDApIHtcbiAgICByZXR1cm4gTmFOXG4gIH1cbiAgY29uc3QgZXhwID0gKGhhbGYgPj4gMTApICYgMHgxZjtcbiAgY29uc3QgbWFudCA9IGhhbGYgJiAweDNmZjtcbiAgbGV0IHZhbDtcbiAgaWYgKGV4cCA9PT0gMCkge1xuICAgIHZhbCA9IG1hbnQgKiAoMiAqKiAtMjQpO1xuICB9IGVsc2UgaWYgKGV4cCAhPT0gMzEpIHtcbiAgICB2YWwgPSAobWFudCArIDEwMjQpICogKDIgKiogKGV4cCAtIDI1KSk7XG4gIC8qIGM4IGlnbm9yZSBuZXh0IDQgKi9cbiAgfSBlbHNlIHtcbiAgICAvLyBtYXkgbm90IGJlIHBvc3NpYmxlIHRvIGdldCBoZXJlXG4gICAgdmFsID0gbWFudCA9PT0gMCA/IEluZmluaXR5IDogTmFOO1xuICB9XG4gIHJldHVybiAoaGFsZiAmIDB4ODAwMCkgPyAtdmFsIDogdmFsXG59XG5cbi8qKlxuICogQHBhcmFtIHtudW1iZXJ9IGlucFxuICovXG5mdW5jdGlvbiBlbmNvZGVGbG9hdDMyIChpbnApIHtcbiAgZGF0YVZpZXcuc2V0RmxvYXQzMigwLCBpbnAsIGZhbHNlKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IHVpOGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIHJlYWRGbG9hdDMyICh1aThhLCBwb3MpIHtcbiAgaWYgKHVpOGEubGVuZ3RoIC0gcG9zIDwgNCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtkZWNvZGVFcnJQcmVmaXh9IG5vdCBlbm91Z2ggZGF0YSBmb3IgZmxvYXQzMmApXG4gIH1cbiAgY29uc3Qgb2Zmc2V0ID0gKHVpOGEuYnl0ZU9mZnNldCB8fCAwKSArIHBvcztcbiAgcmV0dXJuIG5ldyBEYXRhVmlldyh1aThhLmJ1ZmZlciwgb2Zmc2V0LCA0KS5nZXRGbG9hdDMyKDAsIGZhbHNlKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbnBcbiAqL1xuZnVuY3Rpb24gZW5jb2RlRmxvYXQ2NCAoaW5wKSB7XG4gIGRhdGFWaWV3LnNldEZsb2F0NjQoMCwgaW5wLCBmYWxzZSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSB1aThhXG4gKiBAcGFyYW0ge251bWJlcn0gcG9zXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiByZWFkRmxvYXQ2NCAodWk4YSwgcG9zKSB7XG4gIGlmICh1aThhLmxlbmd0aCAtIHBvcyA8IDgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVjb2RlRXJyUHJlZml4fSBub3QgZW5vdWdoIGRhdGEgZm9yIGZsb2F0NjRgKVxuICB9XG4gIGNvbnN0IG9mZnNldCA9ICh1aThhLmJ5dGVPZmZzZXQgfHwgMCkgKyBwb3M7XG4gIHJldHVybiBuZXcgRGF0YVZpZXcodWk4YS5idWZmZXIsIG9mZnNldCwgOCkuZ2V0RmxvYXQ2NCgwLCBmYWxzZSlcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1Rva2VufSBfdG9rMVxuICogQHBhcmFtIHtUb2tlbn0gX3RvazJcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmVuY29kZUZsb2F0LmNvbXBhcmVUb2tlbnMgPSBlbmNvZGVVaW50LmNvbXBhcmVUb2tlbnM7XG4vKlxuZW5jb2RlRmxvYXQuY29tcGFyZVRva2VucyA9IGZ1bmN0aW9uIGNvbXBhcmVUb2tlbnMgKF90b2sxLCBfdG9rMikge1xuICByZXR1cm4gX3RvazFcbiAgdGhyb3cgbmV3IEVycm9yKGAke2VuY29kZUVyclByZWZpeH0gY2Fubm90IHVzZSBmbG9hdHMgYXMgbWFwIGtleXNgKVxufVxuKi9cblxuLyoqXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCcuLi9pbnRlcmZhY2UnKS5EZWNvZGVPcHRpb25zfSBEZWNvZGVPcHRpb25zXG4gKi9cblxuLyoqXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcbiAqIEBwYXJhbSB7bnVtYmVyfSBtaW5vclxuICovXG5mdW5jdGlvbiBpbnZhbGlkTWlub3IgKGRhdGEsIHBvcywgbWlub3IpIHtcbiAgdGhyb3cgbmV3IEVycm9yKGAke2RlY29kZUVyclByZWZpeH0gZW5jb3VudGVyZWQgaW52YWxpZCBtaW5vciAoJHttaW5vcn0pIGZvciBtYWpvciAke2RhdGFbcG9zXSA+Pj4gNX1gKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBtc2dcbiAqIEByZXR1cm5zIHsoKT0+YW55fVxuICovXG5mdW5jdGlvbiBlcnJvcmVyIChtc2cpIHtcbiAgcmV0dXJuICgpID0+IHsgdGhyb3cgbmV3IEVycm9yKGAke2RlY29kZUVyclByZWZpeH0gJHttc2d9YCkgfVxufVxuXG4vKiogQHR5cGUgeygoZGF0YTpVaW50OEFycmF5LCBwb3M6bnVtYmVyLCBtaW5vcjpudW1iZXIsIG9wdGlvbnM/OkRlY29kZU9wdGlvbnMpID0+IGFueSlbXX0gKi9cbmNvbnN0IGp1bXAgPSBbXTtcblxuLy8gdW5zaWduZWQgaW50ZWdlciwgMHgwMC4uMHgxNyAoMC4uMjMpXG5mb3IgKGxldCBpID0gMDsgaSA8PSAweDE3OyBpKyspIHtcbiAganVtcFtpXSA9IGludmFsaWRNaW5vcjsgLy8gdWludC5kZWNvZGVVaW50Q29tcGFjdCwgaGFuZGxlZCBieSBxdWlja1tdXG59XG5qdW1wWzB4MThdID0gZGVjb2RlVWludDg7IC8vIHVuc2lnbmVkIGludGVnZXIsIG9uZS1ieXRlIHVpbnQ4X3QgZm9sbG93c1xuanVtcFsweDE5XSA9IGRlY29kZVVpbnQxNjsgLy8gdW5zaWduZWQgaW50ZWdlciwgdHdvLWJ5dGUgdWludDE2X3QgZm9sbG93c1xuanVtcFsweDFhXSA9IGRlY29kZVVpbnQzMjsgLy8gdW5zaWduZWQgaW50ZWdlciwgZm91ci1ieXRlIHVpbnQzMl90IGZvbGxvd3Ncbmp1bXBbMHgxYl0gPSBkZWNvZGVVaW50NjQ7IC8vIHVuc2lnbmVkIGludGVnZXIsIGVpZ2h0LWJ5dGUgdWludDY0X3QgZm9sbG93c1xuanVtcFsweDFjXSA9IGludmFsaWRNaW5vcjtcbmp1bXBbMHgxZF0gPSBpbnZhbGlkTWlub3I7XG5qdW1wWzB4MWVdID0gaW52YWxpZE1pbm9yO1xuanVtcFsweDFmXSA9IGludmFsaWRNaW5vcjtcbi8vIG5lZ2F0aXZlIGludGVnZXIsIC0xLTB4MDAuLi0xLTB4MTcgKC0xLi4tMjQpXG5mb3IgKGxldCBpID0gMHgyMDsgaSA8PSAweDM3OyBpKyspIHtcbiAganVtcFtpXSA9IGludmFsaWRNaW5vcjsgLy8gbmVnaW50RGVjb2RlLCBoYW5kbGVkIGJ5IHF1aWNrW11cbn1cbmp1bXBbMHgzOF0gPSBkZWNvZGVOZWdpbnQ4OyAvLyBuZWdhdGl2ZSBpbnRlZ2VyLCAtMS1uIG9uZS1ieXRlIHVpbnQ4X3QgZm9yIG4gZm9sbG93c1xuanVtcFsweDM5XSA9IGRlY29kZU5lZ2ludDE2OyAvLyBuZWdhdGl2ZSBpbnRlZ2VyLCAtMS1uIHR3by1ieXRlIHVpbnQxNl90IGZvciBuIGZvbGxvd3Ncbmp1bXBbMHgzYV0gPSBkZWNvZGVOZWdpbnQzMjsgLy8gbmVnYXRpdmUgaW50ZWdlciwgLTEtbiBmb3VyLWJ5dGUgdWludDMyX3QgZm9yIGZvbGxvd3Ncbmp1bXBbMHgzYl0gPSBkZWNvZGVOZWdpbnQ2NDsgLy8gbmVnYXRpdmUgaW50ZWdlciwgLTEtbiBlaWdodC1ieXRlIHVpbnQ2NF90IGZvciBmb2xsb3dzXG5qdW1wWzB4M2NdID0gaW52YWxpZE1pbm9yO1xuanVtcFsweDNkXSA9IGludmFsaWRNaW5vcjtcbmp1bXBbMHgzZV0gPSBpbnZhbGlkTWlub3I7XG5qdW1wWzB4M2ZdID0gaW52YWxpZE1pbm9yO1xuLy8gYnl0ZSBzdHJpbmcsIDB4MDAuLjB4MTcgYnl0ZXMgZm9sbG93XG5mb3IgKGxldCBpID0gMHg0MDsgaSA8PSAweDU3OyBpKyspIHtcbiAganVtcFtpXSA9IGRlY29kZUJ5dGVzQ29tcGFjdDtcbn1cbmp1bXBbMHg1OF0gPSBkZWNvZGVCeXRlczg7IC8vIGJ5dGUgc3RyaW5nLCBvbmUtYnl0ZSB1aW50OF90IGZvciBuLCBhbmQgdGhlbiBuIGJ5dGVzIGZvbGxvd1xuanVtcFsweDU5XSA9IGRlY29kZUJ5dGVzMTY7IC8vIGJ5dGUgc3RyaW5nLCB0d28tYnl0ZSB1aW50MTZfdCBmb3IgbiwgYW5kIHRoZW4gbiBieXRlcyBmb2xsb3dcbmp1bXBbMHg1YV0gPSBkZWNvZGVCeXRlczMyOyAvLyBieXRlIHN0cmluZywgZm91ci1ieXRlIHVpbnQzMl90IGZvciBuLCBhbmQgdGhlbiBuIGJ5dGVzIGZvbGxvd1xuanVtcFsweDViXSA9IGRlY29kZUJ5dGVzNjQ7IC8vIGJ5dGUgc3RyaW5nLCBlaWdodC1ieXRlIHVpbnQ2NF90IGZvciBuLCBhbmQgdGhlbiBuIGJ5dGVzIGZvbGxvd1xuanVtcFsweDVjXSA9IGludmFsaWRNaW5vcjtcbmp1bXBbMHg1ZF0gPSBpbnZhbGlkTWlub3I7XG5qdW1wWzB4NWVdID0gaW52YWxpZE1pbm9yO1xuanVtcFsweDVmXSA9IGVycm9yZXIoJ2luZGVmaW5pdGUgbGVuZ3RoIGJ5dGVzL3N0cmluZ3MgYXJlIG5vdCBzdXBwb3J0ZWQnKTsgLy8gYnl0ZSBzdHJpbmcsIGJ5dGUgc3RyaW5ncyBmb2xsb3csIHRlcm1pbmF0ZWQgYnkgXCJicmVha1wiXG4vLyBVVEYtOCBzdHJpbmcgMHgwMC4uMHgxNyBieXRlcyBmb2xsb3dcbmZvciAobGV0IGkgPSAweDYwOyBpIDw9IDB4Nzc7IGkrKykge1xuICBqdW1wW2ldID0gZGVjb2RlU3RyaW5nQ29tcGFjdDtcbn1cbmp1bXBbMHg3OF0gPSBkZWNvZGVTdHJpbmc4OyAvLyBVVEYtOCBzdHJpbmcsIG9uZS1ieXRlIHVpbnQ4X3QgZm9yIG4sIGFuZCB0aGVuIG4gYnl0ZXMgZm9sbG93XG5qdW1wWzB4NzldID0gZGVjb2RlU3RyaW5nMTY7IC8vIFVURi04IHN0cmluZywgdHdvLWJ5dGUgdWludDE2X3QgZm9yIG4sIGFuZCB0aGVuIG4gYnl0ZXMgZm9sbG93XG5qdW1wWzB4N2FdID0gZGVjb2RlU3RyaW5nMzI7IC8vIFVURi04IHN0cmluZywgZm91ci1ieXRlIHVpbnQzMl90IGZvciBuLCBhbmQgdGhlbiBuIGJ5dGVzIGZvbGxvd1xuanVtcFsweDdiXSA9IGRlY29kZVN0cmluZzY0OyAvLyBVVEYtOCBzdHJpbmcsIGVpZ2h0LWJ5dGUgdWludDY0X3QgZm9yIG4sIGFuZCB0aGVuIG4gYnl0ZXMgZm9sbG93XG5qdW1wWzB4N2NdID0gaW52YWxpZE1pbm9yO1xuanVtcFsweDdkXSA9IGludmFsaWRNaW5vcjtcbmp1bXBbMHg3ZV0gPSBpbnZhbGlkTWlub3I7XG5qdW1wWzB4N2ZdID0gZXJyb3JlcignaW5kZWZpbml0ZSBsZW5ndGggYnl0ZXMvc3RyaW5ncyBhcmUgbm90IHN1cHBvcnRlZCcpOyAvLyBVVEYtOCBzdHJpbmdzIGZvbGxvdywgdGVybWluYXRlZCBieSBcImJyZWFrXCJcbi8vIGFycmF5LCAweDAwLi4weDE3IGRhdGEgaXRlbXMgZm9sbG93XG5mb3IgKGxldCBpID0gMHg4MDsgaSA8PSAweDk3OyBpKyspIHtcbiAganVtcFtpXSA9IGRlY29kZUFycmF5Q29tcGFjdDtcbn1cbmp1bXBbMHg5OF0gPSBkZWNvZGVBcnJheTg7IC8vIGFycmF5LCBvbmUtYnl0ZSB1aW50OF90IGZvciBuLCBhbmQgdGhlbiBuIGRhdGEgaXRlbXMgZm9sbG93XG5qdW1wWzB4OTldID0gZGVjb2RlQXJyYXkxNjsgLy8gYXJyYXksIHR3by1ieXRlIHVpbnQxNl90IGZvciBuLCBhbmQgdGhlbiBuIGRhdGEgaXRlbXMgZm9sbG93XG5qdW1wWzB4OWFdID0gZGVjb2RlQXJyYXkzMjsgLy8gYXJyYXksIGZvdXItYnl0ZSB1aW50MzJfdCBmb3IgbiwgYW5kIHRoZW4gbiBkYXRhIGl0ZW1zIGZvbGxvd1xuanVtcFsweDliXSA9IGRlY29kZUFycmF5NjQ7IC8vIGFycmF5LCBlaWdodC1ieXRlIHVpbnQ2NF90IGZvciBuLCBhbmQgdGhlbiBuIGRhdGEgaXRlbXMgZm9sbG93XG5qdW1wWzB4OWNdID0gaW52YWxpZE1pbm9yO1xuanVtcFsweDlkXSA9IGludmFsaWRNaW5vcjtcbmp1bXBbMHg5ZV0gPSBpbnZhbGlkTWlub3I7XG5qdW1wWzB4OWZdID0gZGVjb2RlQXJyYXlJbmRlZmluaXRlOyAvLyBhcnJheSwgZGF0YSBpdGVtcyBmb2xsb3csIHRlcm1pbmF0ZWQgYnkgXCJicmVha1wiXG4vLyBtYXAsIDB4MDAuLjB4MTcgcGFpcnMgb2YgZGF0YSBpdGVtcyBmb2xsb3dcbmZvciAobGV0IGkgPSAweGEwOyBpIDw9IDB4Yjc7IGkrKykge1xuICBqdW1wW2ldID0gZGVjb2RlTWFwQ29tcGFjdDtcbn1cbmp1bXBbMHhiOF0gPSBkZWNvZGVNYXA4OyAvLyBtYXAsIG9uZS1ieXRlIHVpbnQ4X3QgZm9yIG4sIGFuZCB0aGVuIG4gcGFpcnMgb2YgZGF0YSBpdGVtcyBmb2xsb3dcbmp1bXBbMHhiOV0gPSBkZWNvZGVNYXAxNjsgLy8gbWFwLCB0d28tYnl0ZSB1aW50MTZfdCBmb3IgbiwgYW5kIHRoZW4gbiBwYWlycyBvZiBkYXRhIGl0ZW1zIGZvbGxvd1xuanVtcFsweGJhXSA9IGRlY29kZU1hcDMyOyAvLyBtYXAsIGZvdXItYnl0ZSB1aW50MzJfdCBmb3IgbiwgYW5kIHRoZW4gbiBwYWlycyBvZiBkYXRhIGl0ZW1zIGZvbGxvd1xuanVtcFsweGJiXSA9IGRlY29kZU1hcDY0OyAvLyBtYXAsIGVpZ2h0LWJ5dGUgdWludDY0X3QgZm9yIG4sIGFuZCB0aGVuIG4gcGFpcnMgb2YgZGF0YSBpdGVtcyBmb2xsb3dcbmp1bXBbMHhiY10gPSBpbnZhbGlkTWlub3I7XG5qdW1wWzB4YmRdID0gaW52YWxpZE1pbm9yO1xuanVtcFsweGJlXSA9IGludmFsaWRNaW5vcjtcbmp1bXBbMHhiZl0gPSBkZWNvZGVNYXBJbmRlZmluaXRlOyAvLyBtYXAsIHBhaXJzIG9mIGRhdGEgaXRlbXMgZm9sbG93LCB0ZXJtaW5hdGVkIGJ5IFwiYnJlYWtcIlxuLy8gdGFnc1xuZm9yIChsZXQgaSA9IDB4YzA7IGkgPD0gMHhkNzsgaSsrKSB7XG4gIGp1bXBbaV0gPSBkZWNvZGVUYWdDb21wYWN0O1xufVxuanVtcFsweGQ4XSA9IGRlY29kZVRhZzg7XG5qdW1wWzB4ZDldID0gZGVjb2RlVGFnMTY7XG5qdW1wWzB4ZGFdID0gZGVjb2RlVGFnMzI7XG5qdW1wWzB4ZGJdID0gZGVjb2RlVGFnNjQ7XG5qdW1wWzB4ZGNdID0gaW52YWxpZE1pbm9yO1xuanVtcFsweGRkXSA9IGludmFsaWRNaW5vcjtcbmp1bXBbMHhkZV0gPSBpbnZhbGlkTWlub3I7XG5qdW1wWzB4ZGZdID0gaW52YWxpZE1pbm9yO1xuLy8gMHhlMC4uMHhmMyBzaW1wbGUgdmFsdWVzLCB1bnN1cHBvcnRlZFxuZm9yIChsZXQgaSA9IDB4ZTA7IGkgPD0gMHhmMzsgaSsrKSB7XG4gIGp1bXBbaV0gPSBlcnJvcmVyKCdzaW1wbGUgdmFsdWVzIGFyZSBub3Qgc3VwcG9ydGVkJyk7XG59XG5qdW1wWzB4ZjRdID0gaW52YWxpZE1pbm9yOyAvLyBmYWxzZSwgaGFuZGxlZCBieSBxdWlja1tdXG5qdW1wWzB4ZjVdID0gaW52YWxpZE1pbm9yOyAvLyB0cnVlLCBoYW5kbGVkIGJ5IHF1aWNrW11cbmp1bXBbMHhmNl0gPSBpbnZhbGlkTWlub3I7IC8vIG51bGwsIGhhbmRsZWQgYnkgcXVpY2tbXVxuanVtcFsweGY3XSA9IGRlY29kZVVuZGVmaW5lZDsgLy8gdW5kZWZpbmVkXG5qdW1wWzB4ZjhdID0gZXJyb3Jlcignc2ltcGxlIHZhbHVlcyBhcmUgbm90IHN1cHBvcnRlZCcpOyAvLyBzaW1wbGUgdmFsdWUsIG9uZSBieXRlIGZvbGxvd3MsIHVuc3VwcG9ydGVkXG5qdW1wWzB4ZjldID0gZGVjb2RlRmxvYXQxNjsgLy8gaGFsZi1wcmVjaXNpb24gZmxvYXQgKHR3by1ieXRlIElFRUUgNzU0KVxuanVtcFsweGZhXSA9IGRlY29kZUZsb2F0MzI7IC8vIHNpbmdsZS1wcmVjaXNpb24gZmxvYXQgKGZvdXItYnl0ZSBJRUVFIDc1NClcbmp1bXBbMHhmYl0gPSBkZWNvZGVGbG9hdDY0OyAvLyBkb3VibGUtcHJlY2lzaW9uIGZsb2F0IChlaWdodC1ieXRlIElFRUUgNzU0KVxuanVtcFsweGZjXSA9IGludmFsaWRNaW5vcjtcbmp1bXBbMHhmZF0gPSBpbnZhbGlkTWlub3I7XG5qdW1wWzB4ZmVdID0gaW52YWxpZE1pbm9yO1xuanVtcFsweGZmXSA9IGRlY29kZUJyZWFrOyAvLyBcImJyZWFrXCIgc3RvcCBjb2RlXG5cbi8qKiBAdHlwZSB7VG9rZW5bXX0gKi9cbmNvbnN0IHF1aWNrID0gW107XG4vLyBpbnRzIDwyNFxuZm9yIChsZXQgaSA9IDA7IGkgPCAyNDsgaSsrKSB7XG4gIHF1aWNrW2ldID0gbmV3IFRva2VuKFR5cGUudWludCwgaSwgMSk7XG59XG4vLyBuZWdpbnRzID49IC0yNFxuZm9yIChsZXQgaSA9IC0xOyBpID49IC0yNDsgaS0tKSB7XG4gIHF1aWNrWzMxIC0gaV0gPSBuZXcgVG9rZW4oVHlwZS5uZWdpbnQsIGksIDEpO1xufVxuLy8gZW1wdHkgYnl0ZXNcbnF1aWNrWzB4NDBdID0gbmV3IFRva2VuKFR5cGUuYnl0ZXMsIG5ldyBVaW50OEFycmF5KDApLCAxKTtcbi8vIGVtcHR5IHN0cmluZ1xucXVpY2tbMHg2MF0gPSBuZXcgVG9rZW4oVHlwZS5zdHJpbmcsICcnLCAxKTtcbi8vIGVtcHR5IGxpc3RcbnF1aWNrWzB4ODBdID0gbmV3IFRva2VuKFR5cGUuYXJyYXksIDAsIDEpO1xuLy8gZW1wdHkgbWFwXG5xdWlja1sweGEwXSA9IG5ldyBUb2tlbihUeXBlLm1hcCwgMCwgMSk7XG4vLyBmYWxzZVxucXVpY2tbMHhmNF0gPSBuZXcgVG9rZW4oVHlwZS5mYWxzZSwgZmFsc2UsIDEpO1xuLy8gdHJ1ZVxucXVpY2tbMHhmNV0gPSBuZXcgVG9rZW4oVHlwZS50cnVlLCB0cnVlLCAxKTtcbi8vIG51bGxcbnF1aWNrWzB4ZjZdID0gbmV3IFRva2VuKFR5cGUubnVsbCwgbnVsbCwgMSk7XG5cbi8qKlxuICogQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiAqIEByZXR1cm5zIHtVaW50OEFycmF5fHVuZGVmaW5lZH1cbiAqL1xuZnVuY3Rpb24gcXVpY2tFbmNvZGVUb2tlbiAodG9rZW4pIHtcbiAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgY2FzZSBUeXBlLmZhbHNlOlxuICAgICAgcmV0dXJuIGZyb21BcnJheShbMHhmNF0pXG4gICAgY2FzZSBUeXBlLnRydWU6XG4gICAgICByZXR1cm4gZnJvbUFycmF5KFsweGY1XSlcbiAgICBjYXNlIFR5cGUubnVsbDpcbiAgICAgIHJldHVybiBmcm9tQXJyYXkoWzB4ZjZdKVxuICAgIGNhc2UgVHlwZS5ieXRlczpcbiAgICAgIGlmICghdG9rZW4udmFsdWUubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmcm9tQXJyYXkoWzB4NDBdKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgY2FzZSBUeXBlLnN0cmluZzpcbiAgICAgIGlmICh0b2tlbi52YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuIGZyb21BcnJheShbMHg2MF0pXG4gICAgICB9XG4gICAgICByZXR1cm5cbiAgICBjYXNlIFR5cGUuYXJyYXk6XG4gICAgICBpZiAodG9rZW4udmFsdWUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZyb21BcnJheShbMHg4MF0pXG4gICAgICB9XG4gICAgICAvKiBjOCBpZ25vcmUgbmV4dCAyICovXG4gICAgICAvLyBzaG91bGRuJ3QgYmUgcG9zc2libGUgaWYgdGhpcyB3ZXJlIGNhbGxlZCB3aGVuIHRoZXJlIHdhcyBvbmx5IG9uZSB0b2tlblxuICAgICAgcmV0dXJuXG4gICAgY2FzZSBUeXBlLm1hcDpcbiAgICAgIGlmICh0b2tlbi52YWx1ZSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZnJvbUFycmF5KFsweGEwXSlcbiAgICAgIH1cbiAgICAgIC8qIGM4IGlnbm9yZSBuZXh0IDIgKi9cbiAgICAgIC8vIHNob3VsZG4ndCBiZSBwb3NzaWJsZSBpZiB0aGlzIHdlcmUgY2FsbGVkIHdoZW4gdGhlcmUgd2FzIG9ubHkgb25lIHRva2VuXG4gICAgICByZXR1cm5cbiAgICBjYXNlIFR5cGUudWludDpcbiAgICAgIGlmICh0b2tlbi52YWx1ZSA8IDI0KSB7XG4gICAgICAgIHJldHVybiBmcm9tQXJyYXkoW051bWJlcih0b2tlbi52YWx1ZSldKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgY2FzZSBUeXBlLm5lZ2ludDpcbiAgICAgIGlmICh0b2tlbi52YWx1ZSA+PSAtMjQpIHtcbiAgICAgICAgcmV0dXJuIGZyb21BcnJheShbMzEgLSBOdW1iZXIodG9rZW4udmFsdWUpXSlcbiAgICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4uL2ludGVyZmFjZScpLkVuY29kZU9wdGlvbnN9IEVuY29kZU9wdGlvbnNcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4uL2ludGVyZmFjZScpLk9wdGlvbmFsVHlwZUVuY29kZXJ9IE9wdGlvbmFsVHlwZUVuY29kZXJcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4uL2ludGVyZmFjZScpLlJlZmVyZW5jZX0gUmVmZXJlbmNlXG4gKiBAdHlwZWRlZiB7aW1wb3J0KCcuLi9pbnRlcmZhY2UnKS5TdHJpY3RUeXBlRW5jb2Rlcn0gU3RyaWN0VHlwZUVuY29kZXJcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4uL2ludGVyZmFjZScpLlRva2VuVHlwZUVuY29kZXJ9IFRva2VuVHlwZUVuY29kZXJcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4uL2ludGVyZmFjZScpLlRva2VuT3JOZXN0ZWRUb2tlbnN9IFRva2VuT3JOZXN0ZWRUb2tlbnNcbiAqL1xuXG4vKiogQHR5cGUge0VuY29kZU9wdGlvbnN9ICovXG5jb25zdCBkZWZhdWx0RW5jb2RlT3B0aW9ucyA9IHtcbiAgZmxvYXQ2NDogZmFsc2UsXG4gIG1hcFNvcnRlcixcbiAgcXVpY2tFbmNvZGVUb2tlblxufTtcblxuLyoqIEByZXR1cm5zIHtUb2tlblR5cGVFbmNvZGVyW119ICovXG5mdW5jdGlvbiBtYWtlQ2JvckVuY29kZXJzICgpIHtcbiAgY29uc3QgZW5jb2RlcnMgPSBbXTtcbiAgZW5jb2RlcnNbVHlwZS51aW50Lm1ham9yXSA9IGVuY29kZVVpbnQ7XG4gIGVuY29kZXJzW1R5cGUubmVnaW50Lm1ham9yXSA9IGVuY29kZU5lZ2ludDtcbiAgZW5jb2RlcnNbVHlwZS5ieXRlcy5tYWpvcl0gPSBlbmNvZGVCeXRlcztcbiAgZW5jb2RlcnNbVHlwZS5zdHJpbmcubWFqb3JdID0gZW5jb2RlU3RyaW5nO1xuICBlbmNvZGVyc1tUeXBlLmFycmF5Lm1ham9yXSA9IGVuY29kZUFycmF5O1xuICBlbmNvZGVyc1tUeXBlLm1hcC5tYWpvcl0gPSBlbmNvZGVNYXA7XG4gIGVuY29kZXJzW1R5cGUudGFnLm1ham9yXSA9IGVuY29kZVRhZztcbiAgZW5jb2RlcnNbVHlwZS5mbG9hdC5tYWpvcl0gPSBlbmNvZGVGbG9hdDtcbiAgcmV0dXJuIGVuY29kZXJzXG59XG5cbmNvbnN0IGNib3JFbmNvZGVycyA9IG1ha2VDYm9yRW5jb2RlcnMoKTtcblxuY29uc3QgYnVmID0gbmV3IEJsKCk7XG5cbi8qKiBAaW1wbGVtZW50cyB7UmVmZXJlbmNlfSAqL1xuY2xhc3MgUmVmIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7b2JqZWN0fGFueVtdfSBvYmpcbiAgICogQHBhcmFtIHtSZWZlcmVuY2V8dW5kZWZpbmVkfSBwYXJlbnRcbiAgICovXG4gIGNvbnN0cnVjdG9yIChvYmosIHBhcmVudCkge1xuICAgIHRoaXMub2JqID0gb2JqO1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7b2JqZWN0fGFueVtdfSBvYmpcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpbmNsdWRlcyAob2JqKSB7XG4gICAgLyoqIEB0eXBlIHtSZWZlcmVuY2V8dW5kZWZpbmVkfSAqL1xuICAgIGxldCBwID0gdGhpcztcbiAgICBkbyB7XG4gICAgICBpZiAocC5vYmogPT09IG9iaikge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH0gd2hpbGUgKHAgPSBwLnBhcmVudCkgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7UmVmZXJlbmNlfHVuZGVmaW5lZH0gc3RhY2tcbiAgICogQHBhcmFtIHtvYmplY3R8YW55W119IG9ialxuICAgKiBAcmV0dXJucyB7UmVmZXJlbmNlfVxuICAgKi9cbiAgc3RhdGljIGNyZWF0ZUNoZWNrIChzdGFjaywgb2JqKSB7XG4gICAgaWYgKHN0YWNrICYmIHN0YWNrLmluY2x1ZGVzKG9iaikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtlbmNvZGVFcnJQcmVmaXh9IG9iamVjdCBjb250YWlucyBjaXJjdWxhciByZWZlcmVuY2VzYClcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBSZWYob2JqLCBzdGFjaylcbiAgfVxufVxuXG5jb25zdCBzaW1wbGVUb2tlbnMgPSB7XG4gIG51bGw6IG5ldyBUb2tlbihUeXBlLm51bGwsIG51bGwpLFxuICB1bmRlZmluZWQ6IG5ldyBUb2tlbihUeXBlLnVuZGVmaW5lZCwgdW5kZWZpbmVkKSxcbiAgdHJ1ZTogbmV3IFRva2VuKFR5cGUudHJ1ZSwgdHJ1ZSksXG4gIGZhbHNlOiBuZXcgVG9rZW4oVHlwZS5mYWxzZSwgZmFsc2UpLFxuICBlbXB0eUFycmF5OiBuZXcgVG9rZW4oVHlwZS5hcnJheSwgMCksXG4gIGVtcHR5TWFwOiBuZXcgVG9rZW4oVHlwZS5tYXAsIDApXG59O1xuXG4vKiogQHR5cGUge3tbdHlwZU5hbWU6IHN0cmluZ106IFN0cmljdFR5cGVFbmNvZGVyfX0gKi9cbmNvbnN0IHR5cGVFbmNvZGVycyA9IHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7YW55fSBvYmpcbiAgICogQHBhcmFtIHtzdHJpbmd9IF90eXBcbiAgICogQHBhcmFtIHtFbmNvZGVPcHRpb25zfSBfb3B0aW9uc1xuICAgKiBAcGFyYW0ge1JlZmVyZW5jZX0gW19yZWZTdGFja11cbiAgICogQHJldHVybnMge1Rva2VuT3JOZXN0ZWRUb2tlbnN9XG4gICAqL1xuICBudW1iZXIgKG9iaiwgX3R5cCwgX29wdGlvbnMsIF9yZWZTdGFjaykge1xuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihvYmopIHx8ICFOdW1iZXIuaXNTYWZlSW50ZWdlcihvYmopKSB7XG4gICAgICByZXR1cm4gbmV3IFRva2VuKFR5cGUuZmxvYXQsIG9iailcbiAgICB9IGVsc2UgaWYgKG9iaiA+PSAwKSB7XG4gICAgICByZXR1cm4gbmV3IFRva2VuKFR5cGUudWludCwgb2JqKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFRva2VuKFR5cGUubmVnaW50LCBvYmopXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2FueX0gb2JqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBfdHlwXG4gICAqIEBwYXJhbSB7RW5jb2RlT3B0aW9uc30gX29wdGlvbnNcbiAgICogQHBhcmFtIHtSZWZlcmVuY2V9IFtfcmVmU3RhY2tdXG4gICAqIEByZXR1cm5zIHtUb2tlbk9yTmVzdGVkVG9rZW5zfVxuICAgKi9cbiAgYmlnaW50IChvYmosIF90eXAsIF9vcHRpb25zLCBfcmVmU3RhY2spIHtcbiAgICBpZiAob2JqID49IEJpZ0ludCgwKSkge1xuICAgICAgcmV0dXJuIG5ldyBUb2tlbihUeXBlLnVpbnQsIG9iailcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBUb2tlbihUeXBlLm5lZ2ludCwgb2JqKVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQHBhcmFtIHthbnl9IG9ialxuICAgKiBAcGFyYW0ge3N0cmluZ30gX3R5cFxuICAgKiBAcGFyYW0ge0VuY29kZU9wdGlvbnN9IF9vcHRpb25zXG4gICAqIEBwYXJhbSB7UmVmZXJlbmNlfSBbX3JlZlN0YWNrXVxuICAgKiBAcmV0dXJucyB7VG9rZW5Pck5lc3RlZFRva2Vuc31cbiAgICovXG4gIFVpbnQ4QXJyYXkgKG9iaiwgX3R5cCwgX29wdGlvbnMsIF9yZWZTdGFjaykge1xuICAgIHJldHVybiBuZXcgVG9rZW4oVHlwZS5ieXRlcywgb2JqKVxuICB9LFxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2FueX0gb2JqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBfdHlwXG4gICAqIEBwYXJhbSB7RW5jb2RlT3B0aW9uc30gX29wdGlvbnNcbiAgICogQHBhcmFtIHtSZWZlcmVuY2V9IFtfcmVmU3RhY2tdXG4gICAqIEByZXR1cm5zIHtUb2tlbk9yTmVzdGVkVG9rZW5zfVxuICAgKi9cbiAgc3RyaW5nIChvYmosIF90eXAsIF9vcHRpb25zLCBfcmVmU3RhY2spIHtcbiAgICByZXR1cm4gbmV3IFRva2VuKFR5cGUuc3RyaW5nLCBvYmopXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7YW55fSBvYmpcbiAgICogQHBhcmFtIHtzdHJpbmd9IF90eXBcbiAgICogQHBhcmFtIHtFbmNvZGVPcHRpb25zfSBfb3B0aW9uc1xuICAgKiBAcGFyYW0ge1JlZmVyZW5jZX0gW19yZWZTdGFja11cbiAgICogQHJldHVybnMge1Rva2VuT3JOZXN0ZWRUb2tlbnN9XG4gICAqL1xuICBib29sZWFuIChvYmosIF90eXAsIF9vcHRpb25zLCBfcmVmU3RhY2spIHtcbiAgICByZXR1cm4gb2JqID8gc2ltcGxlVG9rZW5zLnRydWUgOiBzaW1wbGVUb2tlbnMuZmFsc2VcbiAgfSxcblxuICAvKipcbiAgICogQHBhcmFtIHthbnl9IF9vYmpcbiAgICogQHBhcmFtIHtzdHJpbmd9IF90eXBcbiAgICogQHBhcmFtIHtFbmNvZGVPcHRpb25zfSBfb3B0aW9uc1xuICAgKiBAcGFyYW0ge1JlZmVyZW5jZX0gW19yZWZTdGFja11cbiAgICogQHJldHVybnMge1Rva2VuT3JOZXN0ZWRUb2tlbnN9XG4gICAqL1xuICBudWxsIChfb2JqLCBfdHlwLCBfb3B0aW9ucywgX3JlZlN0YWNrKSB7XG4gICAgcmV0dXJuIHNpbXBsZVRva2Vucy5udWxsXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7YW55fSBfb2JqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBfdHlwXG4gICAqIEBwYXJhbSB7RW5jb2RlT3B0aW9uc30gX29wdGlvbnNcbiAgICogQHBhcmFtIHtSZWZlcmVuY2V9IFtfcmVmU3RhY2tdXG4gICAqIEByZXR1cm5zIHtUb2tlbk9yTmVzdGVkVG9rZW5zfVxuICAgKi9cbiAgdW5kZWZpbmVkIChfb2JqLCBfdHlwLCBfb3B0aW9ucywgX3JlZlN0YWNrKSB7XG4gICAgcmV0dXJuIHNpbXBsZVRva2Vucy51bmRlZmluZWRcbiAgfSxcblxuICAvKipcbiAgICogQHBhcmFtIHthbnl9IG9ialxuICAgKiBAcGFyYW0ge3N0cmluZ30gX3R5cFxuICAgKiBAcGFyYW0ge0VuY29kZU9wdGlvbnN9IF9vcHRpb25zXG4gICAqIEBwYXJhbSB7UmVmZXJlbmNlfSBbX3JlZlN0YWNrXVxuICAgKiBAcmV0dXJucyB7VG9rZW5Pck5lc3RlZFRva2Vuc31cbiAgICovXG4gIEFycmF5QnVmZmVyIChvYmosIF90eXAsIF9vcHRpb25zLCBfcmVmU3RhY2spIHtcbiAgICByZXR1cm4gbmV3IFRva2VuKFR5cGUuYnl0ZXMsIG5ldyBVaW50OEFycmF5KG9iaikpXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7YW55fSBvYmpcbiAgICogQHBhcmFtIHtzdHJpbmd9IF90eXBcbiAgICogQHBhcmFtIHtFbmNvZGVPcHRpb25zfSBfb3B0aW9uc1xuICAgKiBAcGFyYW0ge1JlZmVyZW5jZX0gW19yZWZTdGFja11cbiAgICogQHJldHVybnMge1Rva2VuT3JOZXN0ZWRUb2tlbnN9XG4gICAqL1xuICBEYXRhVmlldyAob2JqLCBfdHlwLCBfb3B0aW9ucywgX3JlZlN0YWNrKSB7XG4gICAgcmV0dXJuIG5ldyBUb2tlbihUeXBlLmJ5dGVzLCBuZXcgVWludDhBcnJheShvYmouYnVmZmVyLCBvYmouYnl0ZU9mZnNldCwgb2JqLmJ5dGVMZW5ndGgpKVxuICB9LFxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2FueX0gb2JqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBfdHlwXG4gICAqIEBwYXJhbSB7RW5jb2RlT3B0aW9uc30gb3B0aW9uc1xuICAgKiBAcGFyYW0ge1JlZmVyZW5jZX0gW3JlZlN0YWNrXVxuICAgKiBAcmV0dXJucyB7VG9rZW5Pck5lc3RlZFRva2Vuc31cbiAgICovXG4gIEFycmF5IChvYmosIF90eXAsIG9wdGlvbnMsIHJlZlN0YWNrKSB7XG4gICAgaWYgKCFvYmoubGVuZ3RoKSB7XG4gICAgICBpZiAob3B0aW9ucy5hZGRCcmVha1Rva2VucyA9PT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm4gW3NpbXBsZVRva2Vucy5lbXB0eUFycmF5LCBuZXcgVG9rZW4oVHlwZS5icmVhayldXG4gICAgICB9XG4gICAgICByZXR1cm4gc2ltcGxlVG9rZW5zLmVtcHR5QXJyYXlcbiAgICB9XG4gICAgcmVmU3RhY2sgPSBSZWYuY3JlYXRlQ2hlY2socmVmU3RhY2ssIG9iaik7XG4gICAgY29uc3QgZW50cmllcyA9IFtdO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IGUgb2Ygb2JqKSB7XG4gICAgICBlbnRyaWVzW2krK10gPSBvYmplY3RUb1Rva2VucyhlLCBvcHRpb25zLCByZWZTdGFjayk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmFkZEJyZWFrVG9rZW5zKSB7XG4gICAgICByZXR1cm4gW25ldyBUb2tlbihUeXBlLmFycmF5LCBvYmoubGVuZ3RoKSwgZW50cmllcywgbmV3IFRva2VuKFR5cGUuYnJlYWspXVxuICAgIH1cbiAgICByZXR1cm4gW25ldyBUb2tlbihUeXBlLmFycmF5LCBvYmoubGVuZ3RoKSwgZW50cmllc11cbiAgfSxcblxuICAvKipcbiAgICogQHBhcmFtIHthbnl9IG9ialxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwXG4gICAqIEBwYXJhbSB7RW5jb2RlT3B0aW9uc30gb3B0aW9uc1xuICAgKiBAcGFyYW0ge1JlZmVyZW5jZX0gW3JlZlN0YWNrXVxuICAgKiBAcmV0dXJucyB7VG9rZW5Pck5lc3RlZFRva2Vuc31cbiAgICovXG4gIE9iamVjdCAob2JqLCB0eXAsIG9wdGlvbnMsIHJlZlN0YWNrKSB7XG4gICAgLy8gY291bGQgYmUgYW4gT2JqZWN0IG9yIGEgTWFwXG4gICAgY29uc3QgaXNNYXAgPSB0eXAgIT09ICdPYmplY3QnO1xuICAgIC8vIGl0J3Mgc2xpZ2h0bHkgcXVpY2tlciB0byB1c2UgT2JqZWN0LmtleXMoKSB0aGFuIE9iamVjdC5lbnRyaWVzKClcbiAgICBjb25zdCBrZXlzID0gaXNNYXAgPyBvYmoua2V5cygpIDogT2JqZWN0LmtleXMob2JqKTtcbiAgICBjb25zdCBsZW5ndGggPSBpc01hcCA/IG9iai5zaXplIDoga2V5cy5sZW5ndGg7XG4gICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgIGlmIChvcHRpb25zLmFkZEJyZWFrVG9rZW5zID09PSB0cnVlKSB7XG4gICAgICAgIHJldHVybiBbc2ltcGxlVG9rZW5zLmVtcHR5TWFwLCBuZXcgVG9rZW4oVHlwZS5icmVhayldXG4gICAgICB9XG4gICAgICByZXR1cm4gc2ltcGxlVG9rZW5zLmVtcHR5TWFwXG4gICAgfVxuICAgIHJlZlN0YWNrID0gUmVmLmNyZWF0ZUNoZWNrKHJlZlN0YWNrLCBvYmopO1xuICAgIC8qKiBAdHlwZSB7VG9rZW5Pck5lc3RlZFRva2Vuc1tdfSAqL1xuICAgIGNvbnN0IGVudHJpZXMgPSBbXTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgZW50cmllc1tpKytdID0gW1xuICAgICAgICBvYmplY3RUb1Rva2VucyhrZXksIG9wdGlvbnMsIHJlZlN0YWNrKSxcbiAgICAgICAgb2JqZWN0VG9Ub2tlbnMoaXNNYXAgPyBvYmouZ2V0KGtleSkgOiBvYmpba2V5XSwgb3B0aW9ucywgcmVmU3RhY2spXG4gICAgICBdO1xuICAgIH1cbiAgICBzb3J0TWFwRW50cmllcyhlbnRyaWVzLCBvcHRpb25zKTtcbiAgICBpZiAob3B0aW9ucy5hZGRCcmVha1Rva2Vucykge1xuICAgICAgcmV0dXJuIFtuZXcgVG9rZW4oVHlwZS5tYXAsIGxlbmd0aCksIGVudHJpZXMsIG5ldyBUb2tlbihUeXBlLmJyZWFrKV1cbiAgICB9XG4gICAgcmV0dXJuIFtuZXcgVG9rZW4oVHlwZS5tYXAsIGxlbmd0aCksIGVudHJpZXNdXG4gIH1cbn07XG5cbnR5cGVFbmNvZGVycy5NYXAgPSB0eXBlRW5jb2RlcnMuT2JqZWN0O1xudHlwZUVuY29kZXJzLkJ1ZmZlciA9IHR5cGVFbmNvZGVycy5VaW50OEFycmF5O1xuZm9yIChjb25zdCB0eXAgb2YgJ1VpbnQ4Q2xhbXBlZCBVaW50MTYgVWludDMyIEludDggSW50MTYgSW50MzIgQmlnVWludDY0IEJpZ0ludDY0IEZsb2F0MzIgRmxvYXQ2NCcuc3BsaXQoJyAnKSkge1xuICB0eXBlRW5jb2RlcnNbYCR7dHlwfUFycmF5YF0gPSB0eXBlRW5jb2RlcnMuRGF0YVZpZXc7XG59XG5cbi8qKlxuICogQHBhcmFtIHthbnl9IG9ialxuICogQHBhcmFtIHtFbmNvZGVPcHRpb25zfSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7UmVmZXJlbmNlfSBbcmVmU3RhY2tdXG4gKiBAcmV0dXJucyB7VG9rZW5Pck5lc3RlZFRva2Vuc31cbiAqL1xuZnVuY3Rpb24gb2JqZWN0VG9Ub2tlbnMgKG9iaiwgb3B0aW9ucyA9IHt9LCByZWZTdGFjaykge1xuICBjb25zdCB0eXAgPSBpcyhvYmopO1xuICBjb25zdCBjdXN0b21UeXBlRW5jb2RlciA9IChvcHRpb25zICYmIG9wdGlvbnMudHlwZUVuY29kZXJzICYmIC8qKiBAdHlwZSB7T3B0aW9uYWxUeXBlRW5jb2Rlcn0gKi8gb3B0aW9ucy50eXBlRW5jb2RlcnNbdHlwXSkgfHwgdHlwZUVuY29kZXJzW3R5cF07XG4gIGlmICh0eXBlb2YgY3VzdG9tVHlwZUVuY29kZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zdCB0b2tlbnMgPSBjdXN0b21UeXBlRW5jb2RlcihvYmosIHR5cCwgb3B0aW9ucywgcmVmU3RhY2spO1xuICAgIGlmICh0b2tlbnMgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRva2Vuc1xuICAgIH1cbiAgfVxuICBjb25zdCB0eXBlRW5jb2RlciA9IHR5cGVFbmNvZGVyc1t0eXBdO1xuICBpZiAoIXR5cGVFbmNvZGVyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2VuY29kZUVyclByZWZpeH0gdW5zdXBwb3J0ZWQgdHlwZTogJHt0eXB9YClcbiAgfVxuICByZXR1cm4gdHlwZUVuY29kZXIob2JqLCB0eXAsIG9wdGlvbnMsIHJlZlN0YWNrKVxufVxuXG4vKlxuQ0JPUiBrZXkgc29ydGluZyBpcyBhIG1lc3MuXG5cblRoZSBjYW5vbmljYWxpc2F0aW9uIHJlY29tbWVuZGF0aW9uIGZyb20gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzcwNDkjc2VjdGlvbi0zLjlcbmluY2x1ZGVzIHRoZSB3b3JkaW5nOlxuXG4+IFRoZSBrZXlzIGluIGV2ZXJ5IG1hcCBtdXN0IGJlIHNvcnRlZCBsb3dlc3QgdmFsdWUgdG8gaGlnaGVzdC5cbj4gU29ydGluZyBpcyBwZXJmb3JtZWQgb24gdGhlIGJ5dGVzIG9mIHRoZSByZXByZXNlbnRhdGlvbiBvZiB0aGUga2V5XG4+IGRhdGEgaXRlbXMgd2l0aG91dCBwYXlpbmcgYXR0ZW50aW9uIHRvIHRoZSAzLzUgYml0IHNwbGl0dGluZyBmb3Jcbj4gbWFqb3IgdHlwZXMuXG4+IC4uLlxuPiAgKiAgSWYgdHdvIGtleXMgaGF2ZSBkaWZmZXJlbnQgbGVuZ3RocywgdGhlIHNob3J0ZXIgb25lIHNvcnRzXG4gICAgICBlYXJsaWVyO1xuPiAgKiAgSWYgdHdvIGtleXMgaGF2ZSB0aGUgc2FtZSBsZW5ndGgsIHRoZSBvbmUgd2l0aCB0aGUgbG93ZXIgdmFsdWVcbiAgICAgIGluIChieXRlLXdpc2UpIGxleGljYWwgb3JkZXIgc29ydHMgZWFybGllci5cblxuMS4gSXQgaXMgbm90IGNsZWFyIHdoYXQgXCJieXRlcyBvZiB0aGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGtleVwiIG1lYW5zOiBpcyBpdFxuICAgdGhlIENCT1IgcmVwcmVzZW50YXRpb24sIG9yIHRoZSBiaW5hcnkgcmVwcmVzZW50YXRpb24gb2YgdGhlIG9iamVjdCBpdHNlbGY/XG4gICBDb25zaWRlciB0aGUgaW50IGFuZCB1aW50IGRpZmZlcmVuY2UgaGVyZS5cbjIuIEl0IGlzIG5vdCBjbGVhciB3aGF0IFwid2l0aG91dCBwYXlpbmcgYXR0ZW50aW9uIHRvXCIgbWVhbnM6IGRvIHdlIGluY2x1ZGUgaXRcbiAgIGFuZCBjb21wYXJlIG9uIHRoYXQ/IE9yIGRvIHdlIG9taXQgdGhlIHNwZWNpYWwgcHJlZml4IGJ5dGUsIChtb3N0bHkpIHRyZWF0aW5nXG4gICB0aGUga2V5IGluIGl0cyBwbGFpbiBiaW5hcnkgcmVwcmVzZW50YXRpb24gZm9ybS5cblxuVGhlIEZJRE8gMi4wOiBDbGllbnQgVG8gQXV0aGVudGljYXRvciBQcm90b2NvbCBzcGVjIHRha2VzIHRoZSBvcmlnaW5hbCBDQk9SXG53b3JkaW5nIGFuZCBjbGFyaWZpZXMgaXQgYWNjb3JkaW5nIHRvIHRoZWlyIHVuZGVyc3RhbmRpbmcuXG5odHRwczovL2ZpZG9hbGxpYW5jZS5vcmcvc3BlY3MvZmlkby12Mi4wLXJkLTIwMTcwOTI3L2ZpZG8tY2xpZW50LXRvLWF1dGhlbnRpY2F0b3ItcHJvdG9jb2wtdjIuMC1yZC0yMDE3MDkyNy5odG1sI21lc3NhZ2UtZW5jb2RpbmdcblxuPiBUaGUga2V5cyBpbiBldmVyeSBtYXAgbXVzdCBiZSBzb3J0ZWQgbG93ZXN0IHZhbHVlIHRvIGhpZ2hlc3QuIFNvcnRpbmcgaXNcbj4gcGVyZm9ybWVkIG9uIHRoZSBieXRlcyBvZiB0aGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGtleSBkYXRhIGl0ZW1zIHdpdGhvdXRcbj4gcGF5aW5nIGF0dGVudGlvbiB0byB0aGUgMy81IGJpdCBzcGxpdHRpbmcgZm9yIG1ham9yIHR5cGVzLiBUaGUgc29ydGluZyBydWxlc1xuPiBhcmU6XG4+ICAqIElmIHRoZSBtYWpvciB0eXBlcyBhcmUgZGlmZmVyZW50LCB0aGUgb25lIHdpdGggdGhlIGxvd2VyIHZhbHVlIGluIG51bWVyaWNhbFxuPiAgICBvcmRlciBzb3J0cyBlYXJsaWVyLlxuPiAgKiBJZiB0d28ga2V5cyBoYXZlIGRpZmZlcmVudCBsZW5ndGhzLCB0aGUgc2hvcnRlciBvbmUgc29ydHMgZWFybGllcjtcbj4gICogSWYgdHdvIGtleXMgaGF2ZSB0aGUgc2FtZSBsZW5ndGgsIHRoZSBvbmUgd2l0aCB0aGUgbG93ZXIgdmFsdWUgaW5cbj4gICAgKGJ5dGUtd2lzZSkgbGV4aWNhbCBvcmRlciBzb3J0cyBlYXJsaWVyLlxuXG5Tb21lIG90aGVyIGltcGxlbWVudGF0aW9ucywgc3VjaCBhcyBib3JjLCBkbyBhIGZ1bGwgZW5jb2RlIHRoZW4gZG8gYVxubGVuZ3RoLWZpcnN0LCBieXRlLXdpc2Utc2Vjb25kIGNvbXBhcmlzb246XG5odHRwczovL2dpdGh1Yi5jb20vZGlnbmlmaWVkcXVpcmUvYm9yYy9ibG9iL2I2YmFlOGIwYmNkZTdjMzk3NmIwZjBmMDk1NzIwODA5NWMzOTJhMzYvc3JjL2VuY29kZXIuanMjTDM1OFxuaHR0cHM6Ly9naXRodWIuY29tL2RpZ25pZmllZHF1aXJlL2JvcmMvYmxvYi9iNmJhZThiMGJjZGU3YzM5NzZiMGYwZjA5NTcyMDgwOTVjMzkyYTM2L3NyYy91dGlscy5qcyNMMTQzLUwxNTFcblxuVGhpcyBoYXMgdGhlIGJlbmVmaXQgb2YgYmVpbmcgYWJsZSB0byBlYXNpbHkgaGFuZGxlIGFyYml0cmFyeSBrZXlzLCBpbmNsdWRpbmdcbmNvbXBsZXggdHlwZXMgKG1hcHMgYW5kIGFycmF5cykuXG5cbldlJ2xsIG9wdCBmb3IgdGhlIEZJRE8gYXBwcm9hY2gsIHNpbmNlIGl0IGFmZm9yZHMgc29tZSBlZmZpY2llcyBzaW5jZSB3ZSBkb24ndFxubmVlZCBhIGZ1bGwgZW5jb2RlIG9mIGVhY2gga2V5IHRvIGRldGVybWluZSBvcmRlciBhbmQgY2FuIGRlZmVyIHRvIHRoZSB0eXBlc1xudG8gZGV0ZXJtaW5lIGhvdyB0byBtb3N0IGVmZmljaWVudGx5IG9yZGVyIHRoZWlyIHZhbHVlcyAoaS5lLiBpbnQgYW5kIHVpbnRcbm9yZGVyaW5nIGNhbiBiZSBkb25lIG9uIHRoZSBudW1iZXJzLCBubyBuZWVkIGZvciBieXRlLXdpc2UsIGZvciBleGFtcGxlKS5cblxuUmVjb21tZW5kYXRpb246IHN0aWNrIHRvIHNpbmdsZSBrZXkgdHlwZXMgb3IgeW91J2xsIGdldCBpbnRvIHRyb3VibGUsIGFuZCBwcmVmZXJcbnN0cmluZyBrZXlzIGJlY2F1c2UgaXQncyBtdWNoIHNpbXBsZXIgdGhhdCB3YXkuXG4qL1xuXG4vKlxuKFVQREFURSwgRGVjIDIwMjApXG5odHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjODk0OSBpcyB0aGUgdXBkYXRlZCBDQk9SIHNwZWMgYW5kIGNsYXJpZmllcyBzb21lXG5vZiB0aGUgcXVlc3Rpb25zIGFib3ZlIHdpdGggYSBuZXcgcmVjb21tZW5kYXRpb24gZm9yIHNvcnRpbmcgb3JkZXIgYmVpbmcgbXVjaFxuY2xvc2VyIHRvIHdoYXQgd291bGQgYmUgZXhwZWN0ZWQgaW4gb3RoZXIgZW52aXJvbm1lbnRzIChpLmUuIG5vIGxlbmd0aC1maXJzdFxud2VpcmRuZXNzKS5cblRoaXMgbmV3IHNvcnRpbmcgb3JkZXIgaXMgbm90IHlldCBpbXBsZW1lbnRlZCBoZXJlIGJ1dCBjb3VsZCBiZSBhZGRlZCBhcyBhblxub3B0aW9uLiBcIkRldGVybWluaXNtXCIgKGNhbm9uaWNpdHkpIGlzIHN5c3RlbSBkZXBlbmRlbnQgYW5kIGl0J3MgZGlmZmljdWx0IHRvXG5jaGFuZ2UgZXhpc3Rpbmcgc3lzdGVtcyB0aGF0IGFyZSBidWlsdCB3aXRoIGV4aXN0aW5nIGV4cGVjdGF0aW9ucy4gU28gaWYgYSBuZXdcbm9yZGVyaW5nIGlzIGludHJvZHVjZWQgaGVyZSwgdGhlIG9sZCBuZWVkcyB0byBiZSBrZXB0IGFzIHdlbGwgd2l0aCB0aGUgdXNlclxuaGF2aW5nIHRoZSBvcHRpb24uXG4qL1xuXG4vKipcbiAqIEBwYXJhbSB7VG9rZW5Pck5lc3RlZFRva2Vuc1tdfSBlbnRyaWVzXG4gKiBAcGFyYW0ge0VuY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqL1xuZnVuY3Rpb24gc29ydE1hcEVudHJpZXMgKGVudHJpZXMsIG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMubWFwU29ydGVyKSB7XG4gICAgZW50cmllcy5zb3J0KG9wdGlvbnMubWFwU29ydGVyKTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7KFRva2VufFRva2VuW10pW119IGUxXG4gKiBAcGFyYW0geyhUb2tlbnxUb2tlbltdKVtdfSBlMlxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gbWFwU29ydGVyIChlMSwgZTIpIHtcbiAgLy8gdGhlIGtleSBwb3NpdGlvbiAoWzBdKSBjb3VsZCBoYXZlIGEgc2luZ2xlIHRva2VuIG9yIGFuIGFycmF5XG4gIC8vIGFsbW9zdCBhbHdheXMgaXQnbGwgYmUgYSBzaW5nbGUgdG9rZW4gYnV0IGNvbXBsZXgga2V5IG1pZ2h0IGdldCBpbnZvbHZlZFxuICAvKiBjOCBpZ25vcmUgbmV4dCAyICovXG4gIGNvbnN0IGtleVRva2VuMSA9IEFycmF5LmlzQXJyYXkoZTFbMF0pID8gZTFbMF1bMF0gOiBlMVswXTtcbiAgY29uc3Qga2V5VG9rZW4yID0gQXJyYXkuaXNBcnJheShlMlswXSkgPyBlMlswXVswXSA6IGUyWzBdO1xuXG4gIC8vIGRpZmZlcmVudCBrZXkgdHlwZXNcbiAgaWYgKGtleVRva2VuMS50eXBlICE9PSBrZXlUb2tlbjIudHlwZSkge1xuICAgIHJldHVybiBrZXlUb2tlbjEudHlwZS5jb21wYXJlKGtleVRva2VuMi50eXBlKVxuICB9XG5cbiAgY29uc3QgbWFqb3IgPSBrZXlUb2tlbjEudHlwZS5tYWpvcjtcbiAgLy8gVE9ETzogaGFuZGxlIGNhc2Ugd2hlcmUgY21wID09PSAwIGJ1dCB0aGVyZSBhcmUgbW9yZSBrZXlUb2tlbiBlLiBjb21wbGV4IHR5cGUpXG4gIGNvbnN0IHRjbXAgPSBjYm9yRW5jb2RlcnNbbWFqb3JdLmNvbXBhcmVUb2tlbnMoa2V5VG9rZW4xLCBrZXlUb2tlbjIpO1xuICAvKiBjOCBpZ25vcmUgbmV4dCA1ICovXG4gIGlmICh0Y21wID09PSAwKSB7XG4gICAgLy8gZHVwbGljYXRlIGtleSBvciBjb21wbGV4IHR5cGUgd2hlcmUgdGhlIGZpcnN0IHRva2VuIG1hdGNoZWQsXG4gICAgLy8gaS5lLiBhIG1hcCBvciBhcnJheSBhbmQgd2UncmUgb25seSBjb21wYXJpbmcgdGhlIG9wZW5pbmcgdG9rZW5cbiAgICBjb25zb2xlLndhcm4oJ1dBUk5JTkc6IGNvbXBsZXgga2V5IHR5cGVzIHVzZWQsIENCT1Iga2V5IHNvcnRpbmcgZ3VhcmFudGVlcyBhcmUgZ29uZScpO1xuICB9XG4gIHJldHVybiB0Y21wXG59XG5cbi8qKlxuICogQHBhcmFtIHtCbH0gYnVmXG4gKiBAcGFyYW0ge1Rva2VuT3JOZXN0ZWRUb2tlbnN9IHRva2Vuc1xuICogQHBhcmFtIHtUb2tlblR5cGVFbmNvZGVyW119IGVuY29kZXJzXG4gKiBAcGFyYW0ge0VuY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqL1xuZnVuY3Rpb24gdG9rZW5zVG9FbmNvZGVkIChidWYsIHRva2VucywgZW5jb2RlcnMsIG9wdGlvbnMpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodG9rZW5zKSkge1xuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgICB0b2tlbnNUb0VuY29kZWQoYnVmLCB0b2tlbiwgZW5jb2RlcnMsIG9wdGlvbnMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBlbmNvZGVyc1t0b2tlbnMudHlwZS5tYWpvcl0oYnVmLCB0b2tlbnMsIG9wdGlvbnMpO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHthbnl9IGRhdGFcbiAqIEBwYXJhbSB7VG9rZW5UeXBlRW5jb2RlcltdfSBlbmNvZGVyc1xuICogQHBhcmFtIHtFbmNvZGVPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7VWludDhBcnJheX1cbiAqL1xuZnVuY3Rpb24gZW5jb2RlQ3VzdG9tIChkYXRhLCBlbmNvZGVycywgb3B0aW9ucykge1xuICBjb25zdCB0b2tlbnMgPSBvYmplY3RUb1Rva2VucyhkYXRhLCBvcHRpb25zKTtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHRva2VucykgJiYgb3B0aW9ucy5xdWlja0VuY29kZVRva2VuKSB7XG4gICAgY29uc3QgcXVpY2tCeXRlcyA9IG9wdGlvbnMucXVpY2tFbmNvZGVUb2tlbih0b2tlbnMpO1xuICAgIGlmIChxdWlja0J5dGVzKSB7XG4gICAgICByZXR1cm4gcXVpY2tCeXRlc1xuICAgIH1cbiAgICBjb25zdCBlbmNvZGVyID0gZW5jb2RlcnNbdG9rZW5zLnR5cGUubWFqb3JdO1xuICAgIGlmIChlbmNvZGVyLmVuY29kZWRTaXplKSB7XG4gICAgICBjb25zdCBzaXplID0gZW5jb2Rlci5lbmNvZGVkU2l6ZSh0b2tlbnMsIG9wdGlvbnMpO1xuICAgICAgY29uc3QgYnVmID0gbmV3IEJsKHNpemUpO1xuICAgICAgZW5jb2RlcihidWYsIHRva2Vucywgb3B0aW9ucyk7XG4gICAgICAvKiBjOCBpZ25vcmUgbmV4dCA0ICovXG4gICAgICAvLyB0aGlzIHdvdWxkIGJlIGEgcHJvYmxlbSB3aXRoIGVuY29kZWRTaXplKCkgZnVuY3Rpb25zXG4gICAgICBpZiAoYnVmLmNodW5rcy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIGVycm9yOiBwcmUtY2FsY3VsYXRlZCBsZW5ndGggZm9yICR7dG9rZW5zfSB3YXMgd3JvbmdgKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGFzVThBKGJ1Zi5jaHVua3NbMF0pXG4gICAgfVxuICB9XG4gIGJ1Zi5yZXNldCgpO1xuICB0b2tlbnNUb0VuY29kZWQoYnVmLCB0b2tlbnMsIGVuY29kZXJzLCBvcHRpb25zKTtcbiAgcmV0dXJuIGJ1Zi50b0J5dGVzKHRydWUpXG59XG5cbi8qKlxuICogQHBhcmFtIHthbnl9IGRhdGFcbiAqIEBwYXJhbSB7RW5jb2RlT3B0aW9uc30gW29wdGlvbnNdXG4gKiBAcmV0dXJucyB7VWludDhBcnJheX1cbiAqL1xuZnVuY3Rpb24gZW5jb2RlIChkYXRhLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0RW5jb2RlT3B0aW9ucywgb3B0aW9ucyk7XG4gIHJldHVybiBlbmNvZGVDdXN0b20oZGF0YSwgY2JvckVuY29kZXJzLCBvcHRpb25zKVxufVxuXG4vKipcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4vdG9rZW4uanMnKS5Ub2tlbn0gVG9rZW5cbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4uL2ludGVyZmFjZScpLkRlY29kZU9wdGlvbnN9IERlY29kZU9wdGlvbnNcbiAqIEB0eXBlZGVmIHtpbXBvcnQoJy4uL2ludGVyZmFjZScpLkRlY29kZVRva2VuaXplcn0gRGVjb2RlVG9rZW5pemVyXG4gKi9cblxuY29uc3QgZGVmYXVsdERlY29kZU9wdGlvbnMgPSB7XG4gIHN0cmljdDogZmFsc2UsXG4gIGFsbG93SW5kZWZpbml0ZTogdHJ1ZSxcbiAgYWxsb3dVbmRlZmluZWQ6IHRydWUsXG4gIGFsbG93QmlnSW50OiB0cnVlXG59O1xuXG4vKipcbiAqIEBpbXBsZW1lbnRzIHtEZWNvZGVUb2tlbml6ZXJ9XG4gKi9cbmNsYXNzIFRva2VuaXNlciB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IGRhdGFcbiAgICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBvcHRpb25zXG4gICAqL1xuICBjb25zdHJ1Y3RvciAoZGF0YSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5fcG9zID0gMDtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIH1cblxuICBwb3MgKCkge1xuICAgIHJldHVybiB0aGlzLl9wb3NcbiAgfVxuXG4gIGRvbmUgKCkge1xuICAgIHJldHVybiB0aGlzLl9wb3MgPj0gdGhpcy5kYXRhLmxlbmd0aFxuICB9XG5cbiAgbmV4dCAoKSB7XG4gICAgY29uc3QgYnl0ID0gdGhpcy5kYXRhW3RoaXMuX3Bvc107XG4gICAgbGV0IHRva2VuID0gcXVpY2tbYnl0XTtcbiAgICBpZiAodG9rZW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgZGVjb2RlciA9IGp1bXBbYnl0XTtcbiAgICAgIC8qIGM4IGlnbm9yZSBuZXh0IDQgKi9cbiAgICAgIC8vIGlmIHdlJ3JlIGhlcmUgdGhlbiB0aGVyZSdzIHNvbWV0aGluZyB3cm9uZyB3aXRoIG91ciBqdW1wIG9yIHF1aWNrIGxpc3RzIVxuICAgICAgaWYgKCFkZWNvZGVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtkZWNvZGVFcnJQcmVmaXh9IG5vIGRlY29kZXIgZm9yIG1ham9yIHR5cGUgJHtieXQgPj4+IDV9IChieXRlIDB4JHtieXQudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJyl9KWApXG4gICAgICB9XG4gICAgICBjb25zdCBtaW5vciA9IGJ5dCAmIDMxO1xuICAgICAgdG9rZW4gPSBkZWNvZGVyKHRoaXMuZGF0YSwgdGhpcy5fcG9zLCBtaW5vciwgdGhpcy5vcHRpb25zKTtcbiAgICB9XG4gICAgLy8gQHRzLWlnbm9yZSB3ZSBnZXQgdG8gYXNzdW1lIGVuY29kZWRMZW5ndGggaXMgc2V0IChjcm9zc2luZyBmaW5nZXJzIHNsaWdodGx5KVxuICAgIHRoaXMuX3BvcyArPSB0b2tlbi5lbmNvZGVkTGVuZ3RoO1xuICAgIHJldHVybiB0b2tlblxuICB9XG59XG5cbmNvbnN0IERPTkUgPSBTeW1ib2wuZm9yKCdET05FJyk7XG5jb25zdCBCUkVBSyA9IFN5bWJvbC5mb3IoJ0JSRUFLJyk7XG5cbi8qKlxuICogQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiAqIEBwYXJhbSB7RGVjb2RlVG9rZW5pemVyfSB0b2tlbmlzZXJcbiAqIEBwYXJhbSB7RGVjb2RlT3B0aW9uc30gb3B0aW9uc1xuICogQHJldHVybnMge2FueXxCUkVBS3xET05FfVxuICovXG5mdW5jdGlvbiB0b2tlblRvQXJyYXkgKHRva2VuLCB0b2tlbmlzZXIsIG9wdGlvbnMpIHtcbiAgY29uc3QgYXJyID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW4udmFsdWU7IGkrKykge1xuICAgIGNvbnN0IHZhbHVlID0gdG9rZW5zVG9PYmplY3QodG9rZW5pc2VyLCBvcHRpb25zKTtcbiAgICBpZiAodmFsdWUgPT09IEJSRUFLKSB7XG4gICAgICBpZiAodG9rZW4udmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgICAgIC8vIG5vcm1hbCBlbmQgdG8gaW5kZWZpbml0ZSBsZW5ndGggYXJyYXlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtkZWNvZGVFcnJQcmVmaXh9IGdvdCB1bmV4cGVjdGVkIGJyZWFrIHRvIGxlbmd0aGVkIGFycmF5YClcbiAgICB9XG4gICAgaWYgKHZhbHVlID09PSBET05FKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVjb2RlRXJyUHJlZml4fSBmb3VuZCBhcnJheSBidXQgbm90IGVub3VnaCBlbnRyaWVzIChnb3QgJHtpfSwgZXhwZWN0ZWQgJHt0b2tlbi52YWx1ZX0pYClcbiAgICB9XG4gICAgYXJyW2ldID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIGFyclxufVxuXG4vKipcbiAqIEBwYXJhbSB7VG9rZW59IHRva2VuXG4gKiBAcGFyYW0ge0RlY29kZVRva2VuaXplcn0gdG9rZW5pc2VyXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IG9wdGlvbnNcbiAqIEByZXR1cm5zIHthbnl8QlJFQUt8RE9ORX1cbiAqL1xuZnVuY3Rpb24gdG9rZW5Ub01hcCAodG9rZW4sIHRva2VuaXNlciwgb3B0aW9ucykge1xuICBjb25zdCB1c2VNYXBzID0gb3B0aW9ucy51c2VNYXBzID09PSB0cnVlO1xuICBjb25zdCBvYmogPSB1c2VNYXBzID8gdW5kZWZpbmVkIDoge307XG4gIGNvbnN0IG0gPSB1c2VNYXBzID8gbmV3IE1hcCgpIDogdW5kZWZpbmVkO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2VuLnZhbHVlOyBpKyspIHtcbiAgICBjb25zdCBrZXkgPSB0b2tlbnNUb09iamVjdCh0b2tlbmlzZXIsIG9wdGlvbnMpO1xuICAgIGlmIChrZXkgPT09IEJSRUFLKSB7XG4gICAgICBpZiAodG9rZW4udmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgICAgIC8vIG5vcm1hbCBlbmQgdG8gaW5kZWZpbml0ZSBsZW5ndGggbWFwXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVjb2RlRXJyUHJlZml4fSBnb3QgdW5leHBlY3RlZCBicmVhayB0byBsZW5ndGhlZCBtYXBgKVxuICAgIH1cbiAgICBpZiAoa2V5ID09PSBET05FKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVjb2RlRXJyUHJlZml4fSBmb3VuZCBtYXAgYnV0IG5vdCBlbm91Z2ggZW50cmllcyAoZ290ICR7aX0gW25vIGtleV0sIGV4cGVjdGVkICR7dG9rZW4udmFsdWV9KWApXG4gICAgfVxuICAgIGlmICh1c2VNYXBzICE9PSB0cnVlICYmIHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVjb2RlRXJyUHJlZml4fSBub24tc3RyaW5nIGtleXMgbm90IHN1cHBvcnRlZCAoZ290ICR7dHlwZW9mIGtleX0pYClcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMucmVqZWN0RHVwbGljYXRlTWFwS2V5cyA9PT0gdHJ1ZSkge1xuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgaWYgKCh1c2VNYXBzICYmIG0uaGFzKGtleSkpIHx8ICghdXNlTWFwcyAmJiAoa2V5IGluIG9iaikpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtkZWNvZGVFcnJQcmVmaXh9IGZvdW5kIHJlcGVhdCBtYXAga2V5IFwiJHtrZXl9XCJgKVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IHRva2Vuc1RvT2JqZWN0KHRva2VuaXNlciwgb3B0aW9ucyk7XG4gICAgaWYgKHZhbHVlID09PSBET05FKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVjb2RlRXJyUHJlZml4fSBmb3VuZCBtYXAgYnV0IG5vdCBlbm91Z2ggZW50cmllcyAoZ290ICR7aX0gW25vIHZhbHVlXSwgZXhwZWN0ZWQgJHt0b2tlbi52YWx1ZX0pYClcbiAgICB9XG4gICAgaWYgKHVzZU1hcHMpIHtcbiAgICAgIC8vIEB0cy1pZ25vcmUgVE9ETyByZWNvbnNpZGVyIHRoaXMgLi4gbWF5YmUgbmVlZHMgdG8gYmUgc3RyaWN0IGFib3V0IGtleSB0eXBlc1xuICAgICAgbS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEB0cy1pZ25vcmUgVE9ETyByZWNvbnNpZGVyIHRoaXMgLi4gbWF5YmUgbmVlZHMgdG8gYmUgc3RyaWN0IGFib3V0IGtleSB0eXBlc1xuICAgICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgLy8gQHRzLWlnbm9yZSBjJ21vbiBtYW5cbiAgcmV0dXJuIHVzZU1hcHMgPyBtIDogb2JqXG59XG5cbi8qKlxuICogQHBhcmFtIHtEZWNvZGVUb2tlbml6ZXJ9IHRva2VuaXNlclxuICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBvcHRpb25zXG4gKiBAcmV0dXJucyB7YW55fEJSRUFLfERPTkV9XG4gKi9cbmZ1bmN0aW9uIHRva2Vuc1RvT2JqZWN0ICh0b2tlbmlzZXIsIG9wdGlvbnMpIHtcbiAgLy8gc2hvdWxkIHdlIHN1cHBvcnQgYXJyYXkgYXMgYW4gYXJndW1lbnQ/XG4gIC8vIGNoZWNrIGZvciB0b2tlbkl0ZXJbU3ltYm9sLml0ZXJhdG9yXSBhbmQgcmVwbGFjZSB0b2tlbkl0ZXIgd2l0aCB3aGF0IHRoYXQgcmV0dXJucz9cbiAgaWYgKHRva2VuaXNlci5kb25lKCkpIHtcbiAgICByZXR1cm4gRE9ORVxuICB9XG5cbiAgY29uc3QgdG9rZW4gPSB0b2tlbmlzZXIubmV4dCgpO1xuXG4gIGlmICh0b2tlbi50eXBlID09PSBUeXBlLmJyZWFrKSB7XG4gICAgcmV0dXJuIEJSRUFLXG4gIH1cblxuICBpZiAodG9rZW4udHlwZS50ZXJtaW5hbCkge1xuICAgIHJldHVybiB0b2tlbi52YWx1ZVxuICB9XG5cbiAgaWYgKHRva2VuLnR5cGUgPT09IFR5cGUuYXJyYXkpIHtcbiAgICByZXR1cm4gdG9rZW5Ub0FycmF5KHRva2VuLCB0b2tlbmlzZXIsIG9wdGlvbnMpXG4gIH1cblxuICBpZiAodG9rZW4udHlwZSA9PT0gVHlwZS5tYXApIHtcbiAgICByZXR1cm4gdG9rZW5Ub01hcCh0b2tlbiwgdG9rZW5pc2VyLCBvcHRpb25zKVxuICB9XG5cbiAgaWYgKHRva2VuLnR5cGUgPT09IFR5cGUudGFnKSB7XG4gICAgaWYgKG9wdGlvbnMudGFncyAmJiB0eXBlb2Ygb3B0aW9ucy50YWdzW3Rva2VuLnZhbHVlXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc3QgdGFnZ2VkID0gdG9rZW5zVG9PYmplY3QodG9rZW5pc2VyLCBvcHRpb25zKTtcbiAgICAgIHJldHVybiBvcHRpb25zLnRhZ3NbdG9rZW4udmFsdWVdKHRhZ2dlZClcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2RlY29kZUVyclByZWZpeH0gdGFnIG5vdCBzdXBwb3J0ZWQgKCR7dG9rZW4udmFsdWV9KWApXG4gIH1cbiAgLyogYzggaWdub3JlIG5leHQgKi9cbiAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCcpXG59XG5cbi8qKlxuICogQHBhcmFtIHtVaW50OEFycmF5fSBkYXRhXG4gKiBAcGFyYW0ge0RlY29kZU9wdGlvbnN9IFtvcHRpb25zXVxuICogQHJldHVybnMge1thbnksIFVpbnQ4QXJyYXldfVxuICovXG5mdW5jdGlvbiBkZWNvZGVGaXJzdCAoZGF0YSwgb3B0aW9ucykge1xuICBpZiAoIShkYXRhIGluc3RhbmNlb2YgVWludDhBcnJheSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVjb2RlRXJyUHJlZml4fSBkYXRhIHRvIGRlY29kZSBtdXN0IGJlIGEgVWludDhBcnJheWApXG4gIH1cbiAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHREZWNvZGVPcHRpb25zLCBvcHRpb25zKTtcbiAgY29uc3QgdG9rZW5pc2VyID0gb3B0aW9ucy50b2tlbml6ZXIgfHwgbmV3IFRva2VuaXNlcihkYXRhLCBvcHRpb25zKTtcbiAgY29uc3QgZGVjb2RlZCA9IHRva2Vuc1RvT2JqZWN0KHRva2VuaXNlciwgb3B0aW9ucyk7XG4gIGlmIChkZWNvZGVkID09PSBET05FKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2RlY29kZUVyclByZWZpeH0gZGlkIG5vdCBmaW5kIGFueSBjb250ZW50IHRvIGRlY29kZWApXG4gIH1cbiAgaWYgKGRlY29kZWQgPT09IEJSRUFLKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke2RlY29kZUVyclByZWZpeH0gZ290IHVuZXhwZWN0ZWQgYnJlYWtgKVxuICB9XG4gIHJldHVybiBbZGVjb2RlZCwgZGF0YS5zdWJhcnJheSh0b2tlbmlzZXIucG9zKCkpXVxufVxuXG4vKipcbiAqIEBwYXJhbSB7VWludDhBcnJheX0gZGF0YVxuICogQHBhcmFtIHtEZWNvZGVPcHRpb25zfSBbb3B0aW9uc11cbiAqIEByZXR1cm5zIHthbnl9XG4gKi9cbmZ1bmN0aW9uIGRlY29kZSAoZGF0YSwgb3B0aW9ucykge1xuICBjb25zdCBbZGVjb2RlZCwgcmVtYWluZGVyXSA9IGRlY29kZUZpcnN0KGRhdGEsIG9wdGlvbnMpO1xuICBpZiAocmVtYWluZGVyLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVjb2RlRXJyUHJlZml4fSB0b28gbWFueSB0ZXJtaW5hbHMsIGRhdGEgbWFrZXMgbm8gc2Vuc2VgKVxuICB9XG4gIHJldHVybiBkZWNvZGVkXG59XG5cbmV4cG9ydCB7IFRva2VuLCBUb2tlbmlzZXIgYXMgVG9rZW5pemVyLCBUeXBlLCBkZWNvZGUsIGRlY29kZUZpcnN0LCBlbmNvZGUsIHRva2Vuc1RvT2JqZWN0IH07XG4iLCJpbXBvcnQgeyBMaXN0RWxlbWVudEVudGl0eSB9IGZyb20gXCIuLi8uLi9jb21tb24vRW50aXR5VHlwZXMuanNcIlxuaW1wb3J0IHsgQ2FsZW5kYXJFdmVudCwgQ2FsZW5kYXJFdmVudFR5cGVSZWYsIE1haWwgfSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgZnJlZXplTWFwLCBnZXRUeXBlSWQsIFR5cGVSZWYgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IENVU1RPTV9NQVhfSUQsIENVU1RPTV9NSU5fSUQsIGZpcnN0QmlnZ2VyVGhhblNlY29uZCwgZ2V0RWxlbWVudElkLCBMT0FEX01VTFRJUExFX0xJTUlUIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi91dGlscy9FbnRpdHlVdGlscy5qc1wiXG5pbXBvcnQgeyByZXNvbHZlVHlwZVJlZmVyZW5jZSB9IGZyb20gXCIuLi8uLi9jb21tb24vRW50aXR5RnVuY3Rpb25zLmpzXCJcbmltcG9ydCB7IENhY2hlU3RvcmFnZSwgRXhwb3NlZENhY2hlU3RvcmFnZSwgUmFuZ2UgfSBmcm9tIFwiLi9EZWZhdWx0RW50aXR5UmVzdENhY2hlLmpzXCJcbmltcG9ydCB7IEVudGl0eVJlc3RDbGllbnQgfSBmcm9tIFwiLi9FbnRpdHlSZXN0Q2xpZW50LmpzXCJcbmltcG9ydCB7IFByb2dyYW1taW5nRXJyb3IgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2Vycm9yL1Byb2dyYW1taW5nRXJyb3IuanNcIlxuaW1wb3J0IHsgRW50aXR5VXBkYXRlIH0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL3N5cy9UeXBlUmVmc1wiXG5cbi8qKlxuICogdXBkYXRlIHdoZW4gaW1wbGVtZW50aW5nIGN1c3RvbSBjYWNoZSBoYW5kbGVycy5cbiAqIGFkZCBuZXcgdHlwZXMgdG8gdGhlIHVuaW9uIHdoZW4gaW1wbGVtZW50aW5nIG5ld1xuICogY3VzdG9tIGNhY2hlIGhhbmRsZXJzLlxuICovXG50eXBlIEN1c3RvbUNhY2hlSGFuZGxlZFR5cGUgPSBuZXZlciB8IENhbGVuZGFyRXZlbnQgfCBNYWlsXG5cbi8qKlxuICogbWFrZXMgc3VyZSB0aGF0IGFueSB7cmVmPEE+LCBoYW5kbGVyPEE+fSBwYWlyIHBhc3NlZCB0b1xuICogdGhlIGNvbnN0cnVjdG9yIHVzZXMgdGhlIHNhbWUgQSBmb3IgYm90aCBwcm9wcyBhbmQgdGhhdCB0aGV5XG4gKiBhcmUgdHlwZXMgZm9yIHdoaWNoIHdlIGFjdHVhbGx5IGRvIGN1c3RvbSBoYW5kbGluZy5cbiAqL1xudHlwZSBDdXN0b21DYWNoZUhhbmRsZXJNYXBwaW5nID0gQ3VzdG9tQ2FjaGVIYW5kbGVkVHlwZSBleHRlbmRzIGluZmVyIEFcblx0PyBBIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHlcblx0XHQ/IHsgcmVmOiBUeXBlUmVmPEE+OyBoYW5kbGVyOiBDdXN0b21DYWNoZUhhbmRsZXI8QT4gfVxuXHRcdDogbmV2ZXJcblx0OiBuZXZlclxuXG4vKipcbiAqIHdyYXBwZXIgZm9yIGEgVHlwZVJlZiAtPiBDdXN0b21DYWNoZUhhbmRsZXIgbWFwIHRoYXQncyBuZWVkZWQgYmVjYXVzZSB3ZSBjYW4ndFxuICogdXNlIFR5cGVSZWZzIGRpcmVjdGx5IGFzIG1hcCBrZXlzIGR1ZSB0byBvYmplY3QgaWRlbnRpdHkgbm90IG1hdGNoaW5nLlxuICpcbiAqIGl0IGlzIG1vc3RseSByZWFkLW9ubHlcbiAqL1xuZXhwb3J0IGNsYXNzIEN1c3RvbUNhY2hlSGFuZGxlck1hcCB7XG5cdHByaXZhdGUgcmVhZG9ubHkgaGFuZGxlcnM6IFJlYWRvbmx5TWFwPHN0cmluZywgQ3VzdG9tQ2FjaGVIYW5kbGVyPExpc3RFbGVtZW50RW50aXR5Pj5cblxuXHRjb25zdHJ1Y3RvciguLi5hcmdzOiBSZWFkb25seUFycmF5PEN1c3RvbUNhY2hlSGFuZGxlck1hcHBpbmc+KSB7XG5cdFx0Y29uc3QgaGFuZGxlcnM6IE1hcDxzdHJpbmcsIEN1c3RvbUNhY2hlSGFuZGxlcjxMaXN0RWxlbWVudEVudGl0eT4+ID0gbmV3IE1hcCgpXG5cdFx0Zm9yIChjb25zdCB7IHJlZiwgaGFuZGxlciB9IG9mIGFyZ3MpIHtcblx0XHRcdGNvbnN0IGtleSA9IGdldFR5cGVJZChyZWYpXG5cdFx0XHRoYW5kbGVycy5zZXQoa2V5LCBoYW5kbGVyKVxuXHRcdH1cblx0XHR0aGlzLmhhbmRsZXJzID0gZnJlZXplTWFwKGhhbmRsZXJzKVxuXHR9XG5cblx0Z2V0PFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPik6IEN1c3RvbUNhY2hlSGFuZGxlcjxUPiB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgdHlwZUlkID0gZ2V0VHlwZUlkKHR5cGVSZWYpXG5cdFx0Ly8gbWFwIGlzIGZyb3plbiBhZnRlciB0aGUgY29uc3RydWN0b3IuIGNvbnN0cnVjdG9yIGFyZyB0eXBlcyBhcmUgc2V0IHVwIHRvIHVwaG9sZCB0aGlzIGludmFyaWFudC5cblx0XHRyZXR1cm4gdGhpcy5oYW5kbGVycy5nZXQodHlwZUlkKSBhcyBDdXN0b21DYWNoZUhhbmRsZXI8VD4gfCB1bmRlZmluZWRcblx0fVxufVxuXG4vKipcbiAqIFNvbWUgdHlwZXMgYXJlIG5vdCBjYWNoZWQgbGlrZSBvdGhlciB0eXBlcywgZm9yIGV4YW1wbGUgYmVjYXVzZSB0aGVpciBjdXN0b20gSWRzIGFyZSBub3Qgc29ydGFibGUuXG4gKiBtYWtlIHN1cmUgdG8gdXBkYXRlIEN1c3RvbUhhbmRsZWRUeXBlIHdoZW4gaW1wbGVtZW50aW5nIHRoaXMgZm9yIGEgbmV3IHR5cGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ3VzdG9tQ2FjaGVIYW5kbGVyPFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4ge1xuXHRsb2FkUmFuZ2U/OiAoc3RvcmFnZTogRXhwb3NlZENhY2hlU3RvcmFnZSwgbGlzdElkOiBJZCwgc3RhcnQ6IElkLCBjb3VudDogbnVtYmVyLCByZXZlcnNlOiBib29sZWFuKSA9PiBQcm9taXNlPFRbXT5cblxuXHRnZXRFbGVtZW50SWRzSW5DYWNoZVJhbmdlPzogKHN0b3JhZ2U6IEV4cG9zZWRDYWNoZVN0b3JhZ2UsIGxpc3RJZDogSWQsIGlkczogQXJyYXk8SWQ+KSA9PiBQcm9taXNlPEFycmF5PElkPj5cblxuXHRzaG91bGRMb2FkT25DcmVhdGVFdmVudD86IChldmVudDogRW50aXR5VXBkYXRlKSA9PiBQcm9taXNlPGJvb2xlYW4+XG59XG5cbi8qKlxuICogaW1wbGVtZW50cyByYW5nZSBsb2FkaW5nIGluIEpTIGJlY2F1c2UgdGhlIGN1c3RvbSBJZHMgb2YgY2FsZW5kYXIgZXZlbnRzIHByZXZlbnQgdXMgZnJvbSBkb2luZ1xuICogdGhpcyBlZmZlY3RpdmVseSBpbiB0aGUgZGF0YWJhc2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXN0b21DYWxlbmRhckV2ZW50Q2FjaGVIYW5kbGVyIGltcGxlbWVudHMgQ3VzdG9tQ2FjaGVIYW5kbGVyPENhbGVuZGFyRXZlbnQ+IHtcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBlbnRpdHlSZXN0Q2xpZW50OiBFbnRpdHlSZXN0Q2xpZW50KSB7fVxuXG5cdGFzeW5jIGxvYWRSYW5nZShzdG9yYWdlOiBDYWNoZVN0b3JhZ2UsIGxpc3RJZDogSWQsIHN0YXJ0OiBJZCwgY291bnQ6IG51bWJlciwgcmV2ZXJzZTogYm9vbGVhbik6IFByb21pc2U8Q2FsZW5kYXJFdmVudFtdPiB7XG5cdFx0Y29uc3QgcmFuZ2UgPSBhd2FpdCBzdG9yYWdlLmdldFJhbmdlRm9yTGlzdChDYWxlbmRhckV2ZW50VHlwZVJlZiwgbGlzdElkKVxuXG5cdFx0Ly9pZiBvZmZsaW5lIGRiIGZvciB0aGlzIGxpc3QgaXMgZW1wdHkgbG9hZCBmcm9tIHNlcnZlclxuXHRcdGxldCByYXdMaXN0OiBBcnJheTxDYWxlbmRhckV2ZW50PiA9IFtdXG5cdFx0aWYgKHJhbmdlID09IG51bGwpIHtcblx0XHRcdGxldCBjaHVuazogQXJyYXk8Q2FsZW5kYXJFdmVudD4gPSBbXVxuXHRcdFx0bGV0IGN1cnJlbnRNaW4gPSBDVVNUT01fTUlOX0lEXG5cdFx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0XHRjaHVuayA9IGF3YWl0IHRoaXMuZW50aXR5UmVzdENsaWVudC5sb2FkUmFuZ2UoQ2FsZW5kYXJFdmVudFR5cGVSZWYsIGxpc3RJZCwgY3VycmVudE1pbiwgTE9BRF9NVUxUSVBMRV9MSU1JVCwgZmFsc2UpXG5cdFx0XHRcdHJhd0xpc3QucHVzaCguLi5jaHVuaylcblx0XHRcdFx0aWYgKGNodW5rLmxlbmd0aCA8IExPQURfTVVMVElQTEVfTElNSVQpIGJyZWFrXG5cdFx0XHRcdGN1cnJlbnRNaW4gPSBnZXRFbGVtZW50SWQoY2h1bmtbY2h1bmsubGVuZ3RoIC0gMV0pXG5cdFx0XHR9XG5cdFx0XHRmb3IgKGNvbnN0IGV2ZW50IG9mIHJhd0xpc3QpIHtcblx0XHRcdFx0YXdhaXQgc3RvcmFnZS5wdXQoZXZlbnQpXG5cdFx0XHR9XG5cblx0XHRcdC8vIHdlIGhhdmUgYWxsIGV2ZW50cyBub3dcblx0XHRcdGF3YWl0IHN0b3JhZ2Uuc2V0TmV3UmFuZ2VGb3JMaXN0KENhbGVuZGFyRXZlbnRUeXBlUmVmLCBsaXN0SWQsIENVU1RPTV9NSU5fSUQsIENVU1RPTV9NQVhfSUQpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuYXNzZXJ0Q29ycmVjdFJhbmdlKHJhbmdlKVxuXHRcdFx0cmF3TGlzdCA9IGF3YWl0IHN0b3JhZ2UuZ2V0V2hvbGVMaXN0KENhbGVuZGFyRXZlbnRUeXBlUmVmLCBsaXN0SWQpXG5cdFx0XHRjb25zb2xlLmxvZyhgQ2FsZW5kYXJFdmVudCBsaXN0ICR7bGlzdElkfSBoYXMgJHtyYXdMaXN0Lmxlbmd0aH0gZXZlbnRzYClcblx0XHR9XG5cdFx0Y29uc3QgdHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UoQ2FsZW5kYXJFdmVudFR5cGVSZWYpXG5cdFx0Y29uc3Qgc29ydGVkTGlzdCA9IHJldmVyc2Vcblx0XHRcdD8gcmF3TGlzdFxuXHRcdFx0XHRcdC5maWx0ZXIoKGNhbGVuZGFyRXZlbnQpID0+IGZpcnN0QmlnZ2VyVGhhblNlY29uZChzdGFydCwgZ2V0RWxlbWVudElkKGNhbGVuZGFyRXZlbnQpLCB0eXBlTW9kZWwpKVxuXHRcdFx0XHRcdC5zb3J0KChhLCBiKSA9PiAoZmlyc3RCaWdnZXJUaGFuU2Vjb25kKGdldEVsZW1lbnRJZChiKSwgZ2V0RWxlbWVudElkKGEpLCB0eXBlTW9kZWwpID8gMSA6IC0xKSlcblx0XHRcdDogcmF3TGlzdFxuXHRcdFx0XHRcdC5maWx0ZXIoKGNhbGVuZGFyRXZlbnQpID0+IGZpcnN0QmlnZ2VyVGhhblNlY29uZChnZXRFbGVtZW50SWQoY2FsZW5kYXJFdmVudCksIHN0YXJ0LCB0eXBlTW9kZWwpKVxuXHRcdFx0XHRcdC5zb3J0KChhLCBiKSA9PiAoZmlyc3RCaWdnZXJUaGFuU2Vjb25kKGdldEVsZW1lbnRJZChhKSwgZ2V0RWxlbWVudElkKGIpLCB0eXBlTW9kZWwpID8gMSA6IC0xKSlcblx0XHRyZXR1cm4gc29ydGVkTGlzdC5zbGljZSgwLCBjb3VudClcblx0fVxuXG5cdHByaXZhdGUgYXNzZXJ0Q29ycmVjdFJhbmdlKHJhbmdlOiBSYW5nZSkge1xuXHRcdGlmIChyYW5nZS5sb3dlciAhPT0gQ1VTVE9NX01JTl9JRCB8fCByYW5nZS51cHBlciAhPT0gQ1VTVE9NX01BWF9JRCkge1xuXHRcdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoYEludmFsaWQgcmFuZ2UgZm9yIENhbGVuZGFyRXZlbnQ6ICR7SlNPTi5zdHJpbmdpZnkocmFuZ2UpfWApXG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgZ2V0RWxlbWVudElkc0luQ2FjaGVSYW5nZShzdG9yYWdlOiBDYWNoZVN0b3JhZ2UsIGxpc3RJZDogSWQsIGlkczogQXJyYXk8SWQ+KTogUHJvbWlzZTxBcnJheTxJZD4+IHtcblx0XHRjb25zdCByYW5nZSA9IGF3YWl0IHN0b3JhZ2UuZ2V0UmFuZ2VGb3JMaXN0KENhbGVuZGFyRXZlbnRUeXBlUmVmLCBsaXN0SWQpXG5cdFx0aWYgKHJhbmdlKSB7XG5cdFx0XHR0aGlzLmFzc2VydENvcnJlY3RSYW5nZShyYW5nZSlcblx0XHRcdC8vIGFzc3VtZSBub25lIG9mIHRoZSBnaXZlbiBJZHMgYXJlIGFscmVhZHkgY2FjaGVkIHRvIG1ha2Ugc3VyZSB0aGV5IGFyZSBsb2FkZWQgbm93XG5cdFx0XHRyZXR1cm4gaWRzXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBbXVxuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgY2xhc3MgQ3VzdG9tTWFpbEV2ZW50Q2FjaGVIYW5kbGVyIGltcGxlbWVudHMgQ3VzdG9tQ2FjaGVIYW5kbGVyPE1haWw+IHtcblx0YXN5bmMgc2hvdWxkTG9hZE9uQ3JlYXRlRXZlbnQoKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Ly8gTmV3IGVtYWlscyBzaG91bGQgYmUgcHJlLWNhY2hlZC5cblx0XHQvLyAgLSB3ZSBuZWVkIHRoZW0gdG8gZGlzcGxheSB0aGUgZm9sZGVyIGNvbnRlbnRzXG5cdFx0Ly8gIC0gd2lsbCB2ZXJ5IGxpa2VseSBiZSBsb2FkZWQgYnkgaW5kZXhlciBsYXRlclxuXHRcdC8vICAtIHdlIG1pZ2h0IGhhdmUgdGhlIGluc3RhbmNlIGluIG9mZmxpbmUgY2FjaGUgYWxyZWFkeSBiZWNhdXNlIG9mIG5vdGlmaWNhdGlvbiBwcm9jZXNzXG5cdFx0cmV0dXJuIHRydWVcblx0fVxufVxuIiwiaW1wb3J0IHsgbWFwT2JqZWN0IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5cbmV4cG9ydCB0eXBlIFNxbFZhbHVlID0gbnVsbCB8IHN0cmluZyB8IG51bWJlciB8IFVpbnQ4QXJyYXlcblxuLyoqXG4gKiBUeXBlIHRhZyBmb3IgdmFsdWVzIGJlaW5nIHBhc3NlZCB0byBTUUwgc3RhdGVtZW50c1xuICovXG5leHBvcnQgY29uc3QgZW51bSBTcWxUeXBlIHtcblx0TnVsbCA9IFwiU3FsTnVsbFwiLFxuXHROdW1iZXIgPSBcIlNxbE51bVwiLFxuXHRTdHJpbmcgPSBcIlNxbFN0clwiLFxuXHRCeXRlcyA9IFwiU3FsQnl0ZXNcIixcbn1cblxuZXhwb3J0IHR5cGUgRm9ybWF0dGVkUXVlcnkgPSB7IHF1ZXJ5OiBzdHJpbmc7IHBhcmFtczogVGFnZ2VkU3FsVmFsdWVbXSB9XG5leHBvcnQgdHlwZSBUYWdnZWRTcWxWYWx1ZSA9XG5cdHwgeyB0eXBlOiBTcWxUeXBlLk51bGw7IHZhbHVlOiBudWxsIH1cblx0fCB7IHR5cGU6IFNxbFR5cGUuU3RyaW5nOyB2YWx1ZTogc3RyaW5nIH1cblx0fCB7IHR5cGU6IFNxbFR5cGUuTnVtYmVyOyB2YWx1ZTogbnVtYmVyIH1cblx0fCB7IHR5cGU6IFNxbFR5cGUuQnl0ZXM7IHZhbHVlOiBVaW50OEFycmF5IH1cblxuZXhwb3J0IGZ1bmN0aW9uIHRhZ1NxbE9iamVjdChwYXJhbXM6IFJlY29yZDxzdHJpbmcsIFNxbFZhbHVlPik6IFJlY29yZDxzdHJpbmcsIFRhZ2dlZFNxbFZhbHVlPiB7XG5cdHJldHVybiBtYXBPYmplY3QoKHA6IFNxbFZhbHVlKSA9PiB0YWdTcWxWYWx1ZShwKSwgcGFyYW1zKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGFnU3FsVmFsdWUocGFyYW06IFNxbFZhbHVlKTogVGFnZ2VkU3FsVmFsdWUge1xuXHRpZiAodHlwZW9mIHBhcmFtID09PSBcInN0cmluZ1wiKSB7XG5cdFx0cmV0dXJuIHsgdHlwZTogU3FsVHlwZS5TdHJpbmcsIHZhbHVlOiBwYXJhbSB9XG5cdH0gZWxzZSBpZiAodHlwZW9mIHBhcmFtID09PSBcIm51bWJlclwiKSB7XG5cdFx0cmV0dXJuIHsgdHlwZTogU3FsVHlwZS5OdW1iZXIsIHZhbHVlOiBwYXJhbSB9XG5cdH0gZWxzZSBpZiAocGFyYW0gPT0gbnVsbCkge1xuXHRcdHJldHVybiB7IHR5cGU6IFNxbFR5cGUuTnVsbCwgdmFsdWU6IG51bGwgfVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB7IHR5cGU6IFNxbFR5cGUuQnl0ZXMsIHZhbHVlOiBwYXJhbSB9XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVudGFnU3FsVmFsdWUodGFnZ2VkOiBUYWdnZWRTcWxWYWx1ZSk6IFNxbFZhbHVlIHtcblx0cmV0dXJuIHRhZ2dlZC52YWx1ZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdW50YWdTcWxPYmplY3QodGFnZ2VkOiBSZWNvcmQ8c3RyaW5nLCBUYWdnZWRTcWxWYWx1ZT4pOiBSZWNvcmQ8c3RyaW5nLCBTcWxWYWx1ZT4ge1xuXHRyZXR1cm4gbWFwT2JqZWN0KChwOiBUYWdnZWRTcWxWYWx1ZSkgPT4gcC52YWx1ZSwgdGFnZ2VkKVxufVxuIiwiaW1wb3J0IHsgRm9ybWF0dGVkUXVlcnksIFNxbFZhbHVlLCBUYWdnZWRTcWxWYWx1ZSwgdGFnU3FsVmFsdWUgfSBmcm9tIFwiLi9TcWxWYWx1ZS5qc1wiXG5cbi8qKlxuICogdGhpcyB0YWdnZWQgdGVtcGxhdGUgZnVuY3Rpb24gZXhpc3RzIGJlY2F1c2UgYW5kcm9pZCBkb2Vzbid0IGFsbG93IHVzIHRvIGRlZmluZSBTUUwgZnVuY3Rpb25zLCBzbyB3ZSBoYXZlIG1hZGUgYSB3YXkgdG8gaW5saW5lXG4gKiBTUUwgZnJhZ21lbnRzIGludG8gcXVlcmllcy5cbiAqIHRvIG1ha2UgaXQgbGVzcyBlcnJvci1wcm9uZSwgd2UgYXV0b21hdGUgdGhlIGdlbmVyYXRpb24gb2YgdGhlIHBhcmFtcyBhcnJheSBmb3IgdGhlIGFjdHVhbCBzcWwgY2FsbC5cbiAqIEluIHRoaXMgd2F5LCB3ZSBvZmZsb2FkIHRoZSBlc2NhcGluZyBvZiBhY3R1YWwgdXNlciBjb250ZW50IHRvIHRoZSBTUUwgZW5naW5lLCB3aGljaCBtYWtlcyB0aGlzIHNhZmUgZnJvbSBhbiBTUUxJIHBvaW50IG9mIHZpZXcuXG4gKlxuICogdXNhZ2UgZXhhbXBsZTpcbiAqIGNvbnN0IHR5cGUgPSBcInN5cy9Vc2VyXCJcbiAqIGNvbnN0IGxpc3RJZCA9IFwic29tZUxpc3RcIlxuICogY29uc3Qgc3RhcnRJZCA9IFwiQUJDXCJcbiAqIHNxbGBTRUxFQ1QgZW50aXR5IEZST00gbGlzdF9lbnRpdGllcyBXSEVSRSB0eXBlID0gJHt0eXBlfSBBTkQgbGlzdElkID0gJHtsaXN0SWR9IEFORCAke2ZpcnN0SWRCaWdnZXIoc3RhcnRJZCwgXCJlbGVtZW50SWRcIil9YFxuICpcbiAqIHRoaXMgd2lsbCByZXN1bHQgaW5cbiAqIGNvbnN0IHtxdWVyeSwgcGFyYW1zfSA9IHtcbiAqICAgICBxdWVyeTogYFNFTEVDVCBlbnRpdHkgRlJPTSBsaXN0X2VudGl0aWVzIFdIRVJFIHR5cGUgPSA/IEFORCBsaXN0SWQgPSA/IEFORCAoQ0FTRSBXSEVOIGxlbmd0aCg/KSA+IGxlbmd0aChlbGVtZW50SWQpIFRIRU4gMSBXSEVOIGxlbmd0aCg/KSA8IGxlbmd0aChlbGVtZW50SWQpIFRIRU4gMCBFTFNFID8gPiBlbGVtZW50SWQgRU5EKWAsXG4gKiAgICAgcGFyYW1zOiBbXG4gKiAgICAgXHRcdHt0eXBlOiBTcWxUeXBlLlN0cmluZywgdmFsdWU6IFwic3lzL1VzZXJcIn0sXG4gKiAgICAgXHRcdHt0eXBlOiBTcWxUeXBlLlN0cmluZywgdmFsdWU6IFwic29tZUxpc3RcIn0sXG4gKiAgICAgXHRcdHt0eXBlOiBTcWxUeXBlLlN0cmluZywgdmFsdWU6IFwiQUJDXCJ9LFxuICogICAgIFx0XHR7dHlwZTogU3FsVHlwZS5TdHJpbmcsIHZhbHVlOiBcIkFCQ1wifSxcbiAqICAgICBcdFx0e3R5cGU6IFNxbFR5cGUuU3RyaW5nLCB2YWx1ZTogXCJBQkNcIn1cbiAqICAgICBdXG4gKiB9XG4gKlxuICogd2hpY2ggY2FuIGJlIGNvbnN1bWVkIGJ5IHNxbC5ydW4ocXVlcnksIHBhcmFtcykuXG4gKlxuICogSXQgaXMgaW1wb3J0YW50IHRoYXQgdGhlIGNhbGxlciBlbnN1cmVzIHRoYXQgdGhlIGFtb3VudCBvZiBTUUwgdmFyaWFibGVzIGRvZXMgbm90IGV4Y2VlZCBNQVhfU0FGRV9TUUxfVkFSUyFcbiAqIFZpb2xhdGluZyB0aGlzIHJ1bGUgd2lsbCBsZWFkIHRvIGFuIHVuY2F1Z2h0IGVycm9yIHdpdGggYmFkIHN0YWNrIHRyYWNlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxbChxdWVyeVBhcnRzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4ucGFyYW1JbnN0YW5jZXM6IChTcWxWYWx1ZSB8IFNxbEZyYWdtZW50KVtdKTogRm9ybWF0dGVkUXVlcnkge1xuXHRsZXQgcXVlcnkgPSBcIlwiXG5cdGxldCBwYXJhbXM6IFRhZ2dlZFNxbFZhbHVlW10gPSBbXVxuXHRsZXQgaTogbnVtYmVyXG5cdGZvciAoaSA9IDA7IGkgPCBwYXJhbUluc3RhbmNlcy5sZW5ndGg7IGkrKykge1xuXHRcdHF1ZXJ5ICs9IHF1ZXJ5UGFydHNbaV1cblx0XHRjb25zdCBwYXJhbSA9IHBhcmFtSW5zdGFuY2VzW2ldXG5cdFx0aWYgKHBhcmFtIGluc3RhbmNlb2YgU3FsRnJhZ21lbnQpIHtcblx0XHRcdHF1ZXJ5ICs9IHBhcmFtLnRleHRcblx0XHRcdHBhcmFtcy5wdXNoKC4uLnBhcmFtLnBhcmFtcy5tYXAodGFnU3FsVmFsdWUpKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRxdWVyeSArPSBcIj9cIlxuXHRcdFx0cGFyYW1zLnB1c2godGFnU3FsVmFsdWUocGFyYW0pKVxuXHRcdH1cblx0fVxuXHRxdWVyeSArPSBxdWVyeVBhcnRzW2ldXG5cdHJldHVybiB7IHF1ZXJ5LCBwYXJhbXMgfVxufVxuXG5leHBvcnQgdHlwZSBVbnRhZ2dlZFF1ZXJ5ID0geyBxdWVyeTogc3RyaW5nOyBwYXJhbXM6IHJlYWRvbmx5IFNxbFZhbHVlW10gfVxuXG4vKipcbiAqIExpa2Uge0BsaW5rIHNxbH0gYnV0IHdpdGhvdXQgdGFnZ2luZyB0aGUgdmFsdWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c3FsKHF1ZXJ5UGFydHM6IFRlbXBsYXRlU3RyaW5nc0FycmF5LCAuLi5wYXJhbUluc3RhbmNlczogKFNxbFZhbHVlIHwgU3FsRnJhZ21lbnQpW10pOiBVbnRhZ2dlZFF1ZXJ5IHtcblx0bGV0IHF1ZXJ5ID0gXCJcIlxuXHRsZXQgcGFyYW1zOiBTcWxWYWx1ZVtdID0gW11cblx0bGV0IGk6IG51bWJlclxuXHRmb3IgKGkgPSAwOyBpIDwgcGFyYW1JbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcblx0XHRxdWVyeSArPSBxdWVyeVBhcnRzW2ldXG5cdFx0Y29uc3QgcGFyYW0gPSBwYXJhbUluc3RhbmNlc1tpXVxuXHRcdGlmIChwYXJhbSBpbnN0YW5jZW9mIFNxbEZyYWdtZW50KSB7XG5cdFx0XHRxdWVyeSArPSBwYXJhbS50ZXh0XG5cdFx0XHRwYXJhbXMucHVzaCguLi5wYXJhbS5wYXJhbXMpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHF1ZXJ5ICs9IFwiP1wiXG5cdFx0XHRwYXJhbXMucHVzaChwYXJhbSlcblx0XHR9XG5cdH1cblx0cXVlcnkgKz0gcXVlcnlQYXJ0c1tpXVxuXHRyZXR1cm4geyBxdWVyeSwgcGFyYW1zIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNxbEZyYWdtZW50IHtcblx0Y29uc3RydWN0b3IocmVhZG9ubHkgdGV4dDogc3RyaW5nLCByZWFkb25seSBwYXJhbXM6IFNxbFZhbHVlW10pIHt9XG59XG4iLCJpbXBvcnQgeyBFbGVtZW50RW50aXR5LCBMaXN0RWxlbWVudEVudGl0eSwgU29tZUVudGl0eSwgVHlwZU1vZGVsIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnRpdHlUeXBlcy5qc1wiXG5pbXBvcnQgeyBDVVNUT01fTUlOX0lELCBmaXJzdEJpZ2dlclRoYW5TZWNvbmQsIEdFTkVSQVRFRF9NSU5fSUQsIGdldEVsZW1lbnRJZCB9IGZyb20gXCIuLi8uLi9jb21tb24vdXRpbHMvRW50aXR5VXRpbHMuanNcIlxuaW1wb3J0IHsgQ2FjaGVTdG9yYWdlLCBleHBhbmRJZCwgRXhwb3NlZENhY2hlU3RvcmFnZSwgTGFzdFVwZGF0ZVRpbWUgfSBmcm9tIFwiLi4vcmVzdC9EZWZhdWx0RW50aXR5UmVzdENhY2hlLmpzXCJcbmltcG9ydCAqIGFzIGNib3JnIGZyb20gXCJjYm9yZ1wiXG5pbXBvcnQgeyBFbmNvZGVPcHRpb25zLCBUb2tlbiwgVHlwZSB9IGZyb20gXCJjYm9yZ1wiXG5pbXBvcnQge1xuXHRhc3NlcnQsXG5cdGFzc2VydE5vdE51bGwsXG5cdGJhc2U2NEV4dFRvQmFzZTY0LFxuXHRiYXNlNjRUb0Jhc2U2NEV4dCxcblx0YmFzZTY0VG9CYXNlNjRVcmwsXG5cdGJhc2U2NFVybFRvQmFzZTY0LFxuXHRnZXRUeXBlSWQsXG5cdGdyb3VwQnlBbmRNYXBVbmlxdWVseSxcblx0bWFwTnVsbGFibGUsXG5cdHNwbGl0SW5DaHVua3MsXG5cdFR5cGVSZWYsXG59IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgaXNEZXNrdG9wLCBpc09mZmxpbmVTdG9yYWdlQXZhaWxhYmxlLCBpc1Rlc3QgfSBmcm9tIFwiLi4vLi4vY29tbW9uL0Vudi5qc1wiXG5pbXBvcnQgeyBtb2RlbEluZm9zLCByZXNvbHZlVHlwZVJlZmVyZW5jZSB9IGZyb20gXCIuLi8uLi9jb21tb24vRW50aXR5RnVuY3Rpb25zLmpzXCJcbmltcG9ydCB7IERhdGVQcm92aWRlciB9IGZyb20gXCIuLi8uLi9jb21tb24vRGF0ZVByb3ZpZGVyLmpzXCJcbmltcG9ydCB7IFRva2VuT3JOZXN0ZWRUb2tlbnMgfSBmcm9tIFwiY2JvcmcvaW50ZXJmYWNlXCJcbmltcG9ydCB7IENhbGVuZGFyRXZlbnRUeXBlUmVmLCBNYWlsVHlwZVJlZiB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBPZmZsaW5lU3RvcmFnZU1pZ3JhdG9yIH0gZnJvbSBcIi4vT2ZmbGluZVN0b3JhZ2VNaWdyYXRvci5qc1wiXG5pbXBvcnQgeyBDdXN0b21DYWNoZUhhbmRsZXJNYXAsIEN1c3RvbUNhbGVuZGFyRXZlbnRDYWNoZUhhbmRsZXIsIEN1c3RvbU1haWxFdmVudENhY2hlSGFuZGxlciB9IGZyb20gXCIuLi9yZXN0L0N1c3RvbUNhY2hlSGFuZGxlci5qc1wiXG5pbXBvcnQgeyBFbnRpdHlSZXN0Q2xpZW50IH0gZnJvbSBcIi4uL3Jlc3QvRW50aXR5UmVzdENsaWVudC5qc1wiXG5pbXBvcnQgeyBJbnRlcldpbmRvd0V2ZW50RmFjYWRlU2VuZERpc3BhdGNoZXIgfSBmcm9tIFwiLi4vLi4vLi4vbmF0aXZlL2NvbW1vbi9nZW5lcmF0ZWRpcGMvSW50ZXJXaW5kb3dFdmVudEZhY2FkZVNlbmREaXNwYXRjaGVyLmpzXCJcbmltcG9ydCB7IFNxbENpcGhlckZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9uYXRpdmUvY29tbW9uL2dlbmVyYXRlZGlwYy9TcWxDaXBoZXJGYWNhZGUuanNcIlxuaW1wb3J0IHsgRm9ybWF0dGVkUXVlcnksIFNxbFZhbHVlLCBUYWdnZWRTcWxWYWx1ZSwgdW50YWdTcWxPYmplY3QgfSBmcm9tIFwiLi9TcWxWYWx1ZS5qc1wiXG5pbXBvcnQgeyBBc3NvY2lhdGlvblR5cGUsIENhcmRpbmFsaXR5LCBUeXBlIGFzIFR5cGVJZCwgVmFsdWVUeXBlIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnRpdHlDb25zdGFudHMuanNcIlxuaW1wb3J0IHsgT3V0T2ZTeW5jRXJyb3IgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2Vycm9yL091dE9mU3luY0Vycm9yLmpzXCJcbmltcG9ydCB7IHNxbCwgU3FsRnJhZ21lbnQgfSBmcm9tIFwiLi9TcWwuanNcIlxuXG4vKipcbiAqIHRoaXMgaXMgdGhlIHZhbHVlIG9mIFNRTElURV9NQVhfVkFSSUFCTEVfTlVNQkVSIGluIHNxbGl0ZTMuY1xuICogaXQgbWF5IGNoYW5nZSBpZiB0aGUgc3FsaXRlIHZlcnNpb24gaXMgdXBkYXRlZC5cbiAqICovXG5jb25zdCBNQVhfU0FGRV9TUUxfVkFSUyA9IDMyNzY2XG5cbmZ1bmN0aW9uIGRhdGVFbmNvZGVyKGRhdGE6IERhdGUsIHR5cDogc3RyaW5nLCBvcHRpb25zOiBFbmNvZGVPcHRpb25zKTogVG9rZW5Pck5lc3RlZFRva2VucyB8IG51bGwge1xuXHRjb25zdCB0aW1lID0gZGF0YS5nZXRUaW1lKClcblx0cmV0dXJuIFtcblx0XHQvLyBodHRwczovL2RhdGF0cmFja2VyLmlldGYub3JnL2RvYy9yZmM4OTQzL1xuXHRcdG5ldyBUb2tlbihUeXBlLnRhZywgMTAwKSxcblx0XHRuZXcgVG9rZW4odGltZSA8IDAgPyBUeXBlLm5lZ2ludCA6IFR5cGUudWludCwgdGltZSksXG5cdF1cbn1cblxuZnVuY3Rpb24gZGF0ZURlY29kZXIoYnl0ZXM6IG51bWJlcik6IERhdGUge1xuXHRyZXR1cm4gbmV3IERhdGUoYnl0ZXMpXG59XG5cbmV4cG9ydCBjb25zdCBjdXN0b21UeXBlRW5jb2RlcnM6IHsgW3R5cGVOYW1lOiBzdHJpbmddOiB0eXBlb2YgZGF0ZUVuY29kZXIgfSA9IE9iamVjdC5mcmVlemUoe1xuXHREYXRlOiBkYXRlRW5jb2Rlcixcbn0pXG5cbnR5cGUgVHlwZURlY29kZXIgPSAoXzogYW55KSA9PiBhbnlcbmV4cG9ydCBjb25zdCBjdXN0b21UeXBlRGVjb2RlcnM6IEFycmF5PFR5cGVEZWNvZGVyPiA9ICgoKSA9PiB7XG5cdGNvbnN0IHRhZ3M6IEFycmF5PFR5cGVEZWNvZGVyPiA9IFtdXG5cdHRhZ3NbMTAwXSA9IGRhdGVEZWNvZGVyXG5cdHJldHVybiB0YWdzXG59KSgpXG5cbi8qKlxuICogRm9yIGVhY2ggb2YgdGhlc2Uga2V5cyB3ZSB0cmFjayB0aGUgY3VycmVudCB2ZXJzaW9uIGluIHRoZSBkYXRhYmFzZS5cbiAqIFRoZSBrZXlzIGFyZSBkaWZmZXJlbnQgbW9kZWwgdmVyc2lvbnMgKGJlY2F1c2Ugd2UgbmVlZCB0byBtaWdyYXRlIHRoZSBkYXRhIHdpdGggY2VydGFpbiBtb2RlbCB2ZXJzaW9uIGNoYW5nZXMpIGFuZCBcIm9mZmxpbmVcIiBrZXkgd2hpY2ggaXMgdXNlZCB0byB0cmFja1xuICogbWlncmF0aW9ucyB0aGF0IGFyZSBuZWVkZWQgZm9yIG90aGVyIHJlYXNvbnMgZS5nLiBpZiBEQiBzdHJ1Y3R1cmUgY2hhbmdlcyBvciBpZiB3ZSBuZWVkIHRvIGludmFsaWRhdGUgc29tZSB0YWJsZXMuXG4gKi9cbmV4cG9ydCB0eXBlIFZlcnNpb25NZXRhZGF0YUJhc2VLZXkgPSBrZXlvZiB0eXBlb2YgbW9kZWxJbmZvcyB8IFwib2ZmbGluZVwiXG5cbnR5cGUgVmVyc2lvbk1ldGFkYXRhRW50cmllcyA9IHtcblx0Ly8gWWVzIHRoaXMgaXMgY3Vyc2VkLCBnaXZlIG1lIGEgYnJlYWtcblx0W1AgaW4gVmVyc2lvbk1ldGFkYXRhQmFzZUtleSBhcyBgJHtQfS12ZXJzaW9uYF06IG51bWJlclxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9mZmxpbmVEYk1ldGEgZXh0ZW5kcyBWZXJzaW9uTWV0YWRhdGFFbnRyaWVzIHtcblx0bGFzdFVwZGF0ZVRpbWU6IG51bWJlclxuXHR0aW1lUmFuZ2VEYXlzOiBudW1iZXJcbn1cblxuY29uc3QgVGFibGVEZWZpbml0aW9ucyA9IE9iamVjdC5mcmVlemUoe1xuXHQvLyBwbHVzIG93bmVyR3JvdXAgYWRkZWQgaW4gYSBtaWdyYXRpb25cblx0bGlzdF9lbnRpdGllczpcblx0XHRcInR5cGUgVEVYVCBOT1QgTlVMTCwgbGlzdElkIFRFWFQgTk9UIE5VTEwsIGVsZW1lbnRJZCBURVhUIE5PVCBOVUxMLCBvd25lckdyb3VwIFRFWFQsIGVudGl0eSBCTE9CIE5PVCBOVUxMLCBQUklNQVJZIEtFWSAodHlwZSwgbGlzdElkLCBlbGVtZW50SWQpXCIsXG5cdC8vIHBsdXMgb3duZXJHcm91cCBhZGRlZCBpbiBhIG1pZ3JhdGlvblxuXHRlbGVtZW50X2VudGl0aWVzOiBcInR5cGUgVEVYVCBOT1QgTlVMTCwgZWxlbWVudElkIFRFWFQgTk9UIE5VTEwsIG93bmVyR3JvdXAgVEVYVCwgZW50aXR5IEJMT0IgTk9UIE5VTEwsIFBSSU1BUlkgS0VZICh0eXBlLCBlbGVtZW50SWQpXCIsXG5cdHJhbmdlczogXCJ0eXBlIFRFWFQgTk9UIE5VTEwsIGxpc3RJZCBURVhUIE5PVCBOVUxMLCBsb3dlciBURVhUIE5PVCBOVUxMLCB1cHBlciBURVhUIE5PVCBOVUxMLCBQUklNQVJZIEtFWSAodHlwZSwgbGlzdElkKVwiLFxuXHRsYXN0VXBkYXRlQmF0Y2hJZFBlckdyb3VwSWQ6IFwiZ3JvdXBJZCBURVhUIE5PVCBOVUxMLCBiYXRjaElkIFRFWFQgTk9UIE5VTEwsIFBSSU1BUlkgS0VZIChncm91cElkKVwiLFxuXHRtZXRhZGF0YTogXCJrZXkgVEVYVCBOT1QgTlVMTCwgdmFsdWUgQkxPQiwgUFJJTUFSWSBLRVkgKGtleSlcIixcblx0YmxvYl9lbGVtZW50X2VudGl0aWVzOlxuXHRcdFwidHlwZSBURVhUIE5PVCBOVUxMLCBsaXN0SWQgVEVYVCBOT1QgTlVMTCwgZWxlbWVudElkIFRFWFQgTk9UIE5VTEwsIG93bmVyR3JvdXAgVEVYVCwgZW50aXR5IEJMT0IgTk9UIE5VTEwsIFBSSU1BUlkgS0VZICh0eXBlLCBsaXN0SWQsIGVsZW1lbnRJZClcIixcbn0gYXMgY29uc3QpXG5cbnR5cGUgUmFuZ2UgPSB7IGxvd2VyOiBJZDsgdXBwZXI6IElkIH1cblxuZXhwb3J0IGludGVyZmFjZSBPZmZsaW5lU3RvcmFnZUluaXRBcmdzIHtcblx0dXNlcklkOiBJZFxuXHRkYXRhYmFzZUtleTogVWludDhBcnJheVxuXHR0aW1lUmFuZ2VEYXlzOiBudW1iZXIgfCBudWxsXG5cdGZvcmNlTmV3RGF0YWJhc2U6IGJvb2xlYW5cbn1cblxuZXhwb3J0IGNsYXNzIE9mZmxpbmVTdG9yYWdlIGltcGxlbWVudHMgQ2FjaGVTdG9yYWdlLCBFeHBvc2VkQ2FjaGVTdG9yYWdlIHtcblx0cHJpdmF0ZSBjdXN0b21DYWNoZUhhbmRsZXI6IEN1c3RvbUNhY2hlSGFuZGxlck1hcCB8IG51bGwgPSBudWxsXG5cdHByaXZhdGUgdXNlcklkOiBJZCB8IG51bGwgPSBudWxsXG5cdHByaXZhdGUgdGltZVJhbmdlRGF5czogbnVtYmVyIHwgbnVsbCA9IG51bGxcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIHJlYWRvbmx5IHNxbENpcGhlckZhY2FkZTogU3FsQ2lwaGVyRmFjYWRlLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgaW50ZXJXaW5kb3dFdmVudFNlbmRlcjogSW50ZXJXaW5kb3dFdmVudEZhY2FkZVNlbmREaXNwYXRjaGVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZGF0ZVByb3ZpZGVyOiBEYXRlUHJvdmlkZXIsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBtaWdyYXRvcjogT2ZmbGluZVN0b3JhZ2VNaWdyYXRvcixcblx0XHRwcml2YXRlIHJlYWRvbmx5IGNsZWFuZXI6IE9mZmxpbmVTdG9yYWdlQ2xlYW5lcixcblx0KSB7XG5cdFx0YXNzZXJ0KGlzT2ZmbGluZVN0b3JhZ2VBdmFpbGFibGUoKSB8fCBpc1Rlc3QoKSwgXCJPZmZsaW5lIHN0b3JhZ2UgaXMgbm90IGF2YWlsYWJsZS5cIilcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIHtib29sZWFufSB3aGV0aGVyIHRoZSBkYXRhYmFzZSB3YXMgbmV3bHkgY3JlYXRlZCBvciBub3Rcblx0ICovXG5cdGFzeW5jIGluaXQoeyB1c2VySWQsIGRhdGFiYXNlS2V5LCB0aW1lUmFuZ2VEYXlzLCBmb3JjZU5ld0RhdGFiYXNlIH06IE9mZmxpbmVTdG9yYWdlSW5pdEFyZ3MpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHR0aGlzLnVzZXJJZCA9IHVzZXJJZFxuXHRcdHRoaXMudGltZVJhbmdlRGF5cyA9IHRpbWVSYW5nZURheXNcblx0XHRpZiAoZm9yY2VOZXdEYXRhYmFzZSkge1xuXHRcdFx0aWYgKGlzRGVza3RvcCgpKSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMuaW50ZXJXaW5kb3dFdmVudFNlbmRlci5sb2NhbFVzZXJEYXRhSW52YWxpZGF0ZWQodXNlcklkKVxuXHRcdFx0fVxuXHRcdFx0YXdhaXQgdGhpcy5zcWxDaXBoZXJGYWNhZGUuZGVsZXRlRGIodXNlcklkKVxuXHRcdH1cblx0XHQvLyBXZSBvcGVuIGRhdGFiYXNlIGhlcmUsIGFuZCBpdCBpcyBjbG9zZWQgaW4gdGhlIG5hdGl2ZSBzaWRlIHdoZW4gdGhlIHdpbmRvdyBpcyBjbG9zZWQgb3IgdGhlIHBhZ2UgaXMgcmVsb2FkZWRcblx0XHRhd2FpdCB0aGlzLnNxbENpcGhlckZhY2FkZS5vcGVuRGIodXNlcklkLCBkYXRhYmFzZUtleSlcblx0XHRhd2FpdCB0aGlzLmNyZWF0ZVRhYmxlcygpXG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgdGhpcy5taWdyYXRvci5taWdyYXRlKHRoaXMsIHRoaXMuc3FsQ2lwaGVyRmFjYWRlKVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGlmIChlIGluc3RhbmNlb2YgT3V0T2ZTeW5jRXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKFwiT2ZmbGluZSBkYiBpcyBvdXQgb2Ygc3luYyFcIiwgZSlcblx0XHRcdFx0YXdhaXQgdGhpcy5yZWNyZWF0ZURiRmlsZSh1c2VySWQsIGRhdGFiYXNlS2V5KVxuXHRcdFx0XHRhd2FpdCB0aGlzLm1pZ3JhdG9yLm1pZ3JhdGUodGhpcywgdGhpcy5zcWxDaXBoZXJGYWNhZGUpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBlXG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGlmIG5vdGhpbmcgaXMgd3JpdHRlbiBoZXJlLCBpdCBtZWFucyBpdCdzIGEgbmV3IGRhdGFiYXNlXG5cdFx0cmV0dXJuIChhd2FpdCB0aGlzLmdldExhc3RVcGRhdGVUaW1lKCkpLnR5cGUgPT09IFwibmV2ZXJcIlxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyByZWNyZWF0ZURiRmlsZSh1c2VySWQ6IHN0cmluZywgZGF0YWJhc2VLZXk6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zb2xlLmxvZyhgcmVjcmVhdGluZyBEQiBmaWxlIGZvciB1c2VySWQgJHt1c2VySWR9YClcblx0XHRhd2FpdCB0aGlzLnNxbENpcGhlckZhY2FkZS5jbG9zZURiKClcblx0XHRhd2FpdCB0aGlzLnNxbENpcGhlckZhY2FkZS5kZWxldGVEYih1c2VySWQpXG5cdFx0YXdhaXQgdGhpcy5zcWxDaXBoZXJGYWNhZGUub3BlbkRiKHVzZXJJZCwgZGF0YWJhc2VLZXkpXG5cdFx0YXdhaXQgdGhpcy5jcmVhdGVUYWJsZXMoKVxuXHR9XG5cblx0LyoqXG5cdCAqIGN1cnJlbnRseSwgd2UgY2xvc2UgREJzIGZyb20gdGhlIG5hdGl2ZSBzaWRlIChtYWlubHkgb24gdGhpbmdzIGxpa2UgcmVsb2FkIGFuZCBvbiBhbmRyb2lkJ3Mgb25EZXN0cm95KVxuXHQgKi9cblx0YXN5bmMgZGVpbml0KCkge1xuXHRcdHRoaXMudXNlcklkID0gbnVsbFxuXHRcdGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLmNsb3NlRGIoKVxuXHR9XG5cblx0YXN5bmMgZGVsZXRlSWZFeGlzdHModHlwZVJlZjogVHlwZVJlZjxTb21lRW50aXR5PiwgbGlzdElkOiBJZCB8IG51bGwsIGVsZW1lbnRJZDogSWQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCB0eXBlID0gZ2V0VHlwZUlkKHR5cGVSZWYpXG5cdFx0Y29uc3QgdHlwZU1vZGVsOiBUeXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZSh0eXBlUmVmKVxuXHRcdGNvbnN0IGVuY29kZWRFbGVtZW50SWQgPSBlbnN1cmVCYXNlNjRFeHQodHlwZU1vZGVsLCBlbGVtZW50SWQpXG5cdFx0bGV0IGZvcm1hdHRlZFF1ZXJ5XG5cdFx0c3dpdGNoICh0eXBlTW9kZWwudHlwZSkge1xuXHRcdFx0Y2FzZSBUeXBlSWQuRWxlbWVudDpcblx0XHRcdFx0Zm9ybWF0dGVkUXVlcnkgPSBzcWxgREVMRVRFXG5cdFx0XHRcdFx0XHRcdFx0XHQgRlJPTSBlbGVtZW50X2VudGl0aWVzXG5cdFx0XHRcdFx0XHRcdFx0XHQgV0hFUkUgdHlwZSA9ICR7dHlwZX1cblx0XHRcdFx0XHRcdFx0XHRcdCAgIEFORCBlbGVtZW50SWQgPSAke2VuY29kZWRFbGVtZW50SWR9YFxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBUeXBlSWQuTGlzdEVsZW1lbnQ6XG5cdFx0XHRcdGZvcm1hdHRlZFF1ZXJ5ID0gc3FsYERFTEVURVxuXHRcdFx0XHRcdFx0XHRcdFx0IEZST00gbGlzdF9lbnRpdGllc1xuXHRcdFx0XHRcdFx0XHRcdFx0IFdIRVJFIHR5cGUgPSAke3R5cGV9XG5cdFx0XHRcdFx0XHRcdFx0XHQgICBBTkQgbGlzdElkID0gJHtsaXN0SWR9XG5cdFx0XHRcdFx0XHRcdFx0XHQgICBBTkQgZWxlbWVudElkID0gJHtlbmNvZGVkRWxlbWVudElkfWBcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgVHlwZUlkLkJsb2JFbGVtZW50OlxuXHRcdFx0XHRmb3JtYXR0ZWRRdWVyeSA9IHNxbGBERUxFVEVcblx0XHRcdFx0XHRcdFx0XHRcdCBGUk9NIGJsb2JfZWxlbWVudF9lbnRpdGllc1xuXHRcdFx0XHRcdFx0XHRcdFx0IFdIRVJFIHR5cGUgPSAke3R5cGV9XG5cdFx0XHRcdFx0XHRcdFx0XHQgICBBTkQgbGlzdElkID0gJHtsaXN0SWR9XG5cdFx0XHRcdFx0XHRcdFx0XHQgICBBTkQgZWxlbWVudElkID0gJHtlbmNvZGVkRWxlbWVudElkfWBcblx0XHRcdFx0YnJlYWtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIm11c3QgYmUgYSBwZXJzaXN0ZW50IHR5cGVcIilcblx0XHR9XG5cdFx0YXdhaXQgdGhpcy5zcWxDaXBoZXJGYWNhZGUucnVuKGZvcm1hdHRlZFF1ZXJ5LnF1ZXJ5LCBmb3JtYXR0ZWRRdWVyeS5wYXJhbXMpXG5cdH1cblxuXHRhc3luYyBkZWxldGVBbGxPZlR5cGUodHlwZVJlZjogVHlwZVJlZjxTb21lRW50aXR5Pik6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHR5cGUgPSBnZXRUeXBlSWQodHlwZVJlZilcblx0XHRsZXQgdHlwZU1vZGVsOiBUeXBlTW9kZWxcblx0XHR0eXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZSh0eXBlUmVmKVxuXHRcdGxldCBmb3JtYXR0ZWRRdWVyeVxuXHRcdHN3aXRjaCAodHlwZU1vZGVsLnR5cGUpIHtcblx0XHRcdGNhc2UgVHlwZUlkLkVsZW1lbnQ6XG5cdFx0XHRcdGZvcm1hdHRlZFF1ZXJ5ID0gc3FsYERFTEVURVxuXHRcdFx0XHRcdFx0XHRcdFx0IEZST00gZWxlbWVudF9lbnRpdGllc1xuXHRcdFx0XHRcdFx0XHRcdFx0IFdIRVJFIHR5cGUgPSAke3R5cGV9YFxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBUeXBlSWQuTGlzdEVsZW1lbnQ6XG5cdFx0XHRcdGZvcm1hdHRlZFF1ZXJ5ID0gc3FsYERFTEVURVxuXHRcdFx0XHRcdFx0XHRcdFx0IEZST00gbGlzdF9lbnRpdGllc1xuXHRcdFx0XHRcdFx0XHRcdFx0IFdIRVJFIHR5cGUgPSAke3R5cGV9YFxuXHRcdFx0XHRhd2FpdCB0aGlzLnNxbENpcGhlckZhY2FkZS5ydW4oZm9ybWF0dGVkUXVlcnkucXVlcnksIGZvcm1hdHRlZFF1ZXJ5LnBhcmFtcylcblx0XHRcdFx0YXdhaXQgdGhpcy5kZWxldGVBbGxSYW5nZXNGb3JUeXBlKHR5cGUpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0Y2FzZSBUeXBlSWQuQmxvYkVsZW1lbnQ6XG5cdFx0XHRcdGZvcm1hdHRlZFF1ZXJ5ID0gc3FsYERFTEVURVxuXHRcdFx0XHRcdFx0XHRcdFx0IEZST00gYmxvYl9lbGVtZW50X2VudGl0aWVzXG5cdFx0XHRcdFx0XHRcdFx0XHQgV0hFUkUgdHlwZSA9ICR7dHlwZX1gXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJtdXN0IGJlIGEgcGVyc2lzdGVudCB0eXBlXCIpXG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLnJ1bihmb3JtYXR0ZWRRdWVyeS5xdWVyeSwgZm9ybWF0dGVkUXVlcnkucGFyYW1zKVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBkZWxldGVBbGxSYW5nZXNGb3JUeXBlKHR5cGU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHsgcXVlcnksIHBhcmFtcyB9ID0gc3FsYERFTEVURVxuXHRcdFx0XHRcdFx0XHRcdFx0ICBGUk9NIHJhbmdlc1xuXHRcdFx0XHRcdFx0XHRcdFx0ICBXSEVSRSB0eXBlID0gJHt0eXBlfWBcblx0XHRhd2FpdCB0aGlzLnNxbENpcGhlckZhY2FkZS5ydW4ocXVlcnksIHBhcmFtcylcblx0fVxuXG5cdGFzeW5jIGdldDxUIGV4dGVuZHMgU29tZUVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCB8IG51bGwsIGVsZW1lbnRJZDogSWQpOiBQcm9taXNlPFQgfCBudWxsPiB7XG5cdFx0Y29uc3QgdHlwZSA9IGdldFR5cGVJZCh0eXBlUmVmKVxuXHRcdGNvbnN0IHR5cGVNb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGVSZWYpXG5cdFx0Y29uc3QgZW5jb2RlZEVsZW1lbnRJZCA9IGVuc3VyZUJhc2U2NEV4dCh0eXBlTW9kZWwsIGVsZW1lbnRJZClcblx0XHRsZXQgZm9ybWF0dGVkUXVlcnlcblx0XHRzd2l0Y2ggKHR5cGVNb2RlbC50eXBlKSB7XG5cdFx0XHRjYXNlIFR5cGVJZC5FbGVtZW50OlxuXHRcdFx0XHRmb3JtYXR0ZWRRdWVyeSA9IHNxbGBTRUxFQ1QgZW50aXR5XG5cdFx0XHRcdFx0XHRcdFx0XHQgZnJvbSBlbGVtZW50X2VudGl0aWVzXG5cdFx0XHRcdFx0XHRcdFx0XHQgV0hFUkUgdHlwZSA9ICR7dHlwZX1cblx0XHRcdFx0XHRcdFx0XHRcdCAgIEFORCBlbGVtZW50SWQgPSAke2VuY29kZWRFbGVtZW50SWR9YFxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBUeXBlSWQuTGlzdEVsZW1lbnQ6XG5cdFx0XHRcdGZvcm1hdHRlZFF1ZXJ5ID0gc3FsYFNFTEVDVCBlbnRpdHlcblx0XHRcdFx0XHRcdFx0XHRcdCBmcm9tIGxpc3RfZW50aXRpZXNcblx0XHRcdFx0XHRcdFx0XHRcdCBXSEVSRSB0eXBlID0gJHt0eXBlfVxuXHRcdFx0XHRcdFx0XHRcdFx0ICAgQU5EIGxpc3RJZCA9ICR7bGlzdElkfVxuXHRcdFx0XHRcdFx0XHRcdFx0ICAgQU5EIGVsZW1lbnRJZCA9ICR7ZW5jb2RlZEVsZW1lbnRJZH1gXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIFR5cGVJZC5CbG9iRWxlbWVudDpcblx0XHRcdFx0Zm9ybWF0dGVkUXVlcnkgPSBzcWxgU0VMRUNUIGVudGl0eVxuXHRcdFx0XHRcdFx0XHRcdFx0IGZyb20gYmxvYl9lbGVtZW50X2VudGl0aWVzXG5cdFx0XHRcdFx0XHRcdFx0XHQgV0hFUkUgdHlwZSA9ICR7dHlwZX1cblx0XHRcdFx0XHRcdFx0XHRcdCAgIEFORCBsaXN0SWQgPSAke2xpc3RJZH1cblx0XHRcdFx0XHRcdFx0XHRcdCAgIEFORCBlbGVtZW50SWQgPSAke2VuY29kZWRFbGVtZW50SWR9YFxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibXVzdCBiZSBhIHBlcnNpc3RlbnQgdHlwZVwiKVxuXHRcdH1cblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnNxbENpcGhlckZhY2FkZS5nZXQoZm9ybWF0dGVkUXVlcnkucXVlcnksIGZvcm1hdHRlZFF1ZXJ5LnBhcmFtcylcblx0XHRyZXR1cm4gcmVzdWx0Py5lbnRpdHkgPyBhd2FpdCB0aGlzLmRlc2VyaWFsaXplKHR5cGVSZWYsIHJlc3VsdC5lbnRpdHkudmFsdWUgYXMgVWludDhBcnJheSkgOiBudWxsXG5cdH1cblxuXHRhc3luYyBwcm92aWRlTXVsdGlwbGU8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkLCBlbGVtZW50SWRzOiBJZFtdKTogUHJvbWlzZTxBcnJheTxUPj4ge1xuXHRcdGlmIChlbGVtZW50SWRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG5cdFx0Y29uc3QgdHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UodHlwZVJlZilcblx0XHRjb25zdCBlbmNvZGVkRWxlbWVudElkcyA9IGVsZW1lbnRJZHMubWFwKChlbGVtZW50SWQpID0+IGVuc3VyZUJhc2U2NEV4dCh0eXBlTW9kZWwsIGVsZW1lbnRJZCkpXG5cblx0XHRjb25zdCB0eXBlID0gZ2V0VHlwZUlkKHR5cGVSZWYpXG5cdFx0Y29uc3Qgc2VyaWFsaXplZExpc3Q6IFJlYWRvbmx5QXJyYXk8UmVjb3JkPHN0cmluZywgVGFnZ2VkU3FsVmFsdWU+PiA9IGF3YWl0IHRoaXMuYWxsQ2h1bmtlZChcblx0XHRcdE1BWF9TQUZFX1NRTF9WQVJTIC0gMixcblx0XHRcdGVuY29kZWRFbGVtZW50SWRzLFxuXHRcdFx0KGMpID0+IHNxbGBTRUxFQ1QgZW50aXR5XG5cdFx0XHRcdFx0ICAgRlJPTSBsaXN0X2VudGl0aWVzXG5cdFx0XHRcdFx0ICAgV0hFUkUgdHlwZSA9ICR7dHlwZX1cblx0XHRcdFx0XHRcdCBBTkQgbGlzdElkID0gJHtsaXN0SWR9XG5cdFx0XHRcdFx0XHQgQU5EIGVsZW1lbnRJZCBJTiAke3BhcmFtTGlzdChjKX1gLFxuXHRcdClcblx0XHRyZXR1cm4gYXdhaXQgdGhpcy5kZXNlcmlhbGl6ZUxpc3QoXG5cdFx0XHR0eXBlUmVmLFxuXHRcdFx0c2VyaWFsaXplZExpc3QubWFwKChyKSA9PiByLmVudGl0eS52YWx1ZSBhcyBVaW50OEFycmF5KSxcblx0XHQpXG5cdH1cblxuXHRhc3luYyBnZXRJZHNJblJhbmdlPFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCk6IFByb21pc2U8QXJyYXk8SWQ+PiB7XG5cdFx0Y29uc3QgdHlwZSA9IGdldFR5cGVJZCh0eXBlUmVmKVxuXHRcdGNvbnN0IHR5cGVNb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGVSZWYpXG5cdFx0Y29uc3QgcmFuZ2UgPSBhd2FpdCB0aGlzLmdldFJhbmdlKHR5cGVSZWYsIGxpc3RJZClcblx0XHRpZiAocmFuZ2UgPT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBubyByYW5nZSBleGlzdHMgZm9yICR7dHlwZX0gYW5kIGxpc3QgJHtsaXN0SWR9YClcblx0XHR9XG5cdFx0Y29uc3QgeyBxdWVyeSwgcGFyYW1zIH0gPSBzcWxgU0VMRUNUIGVsZW1lbnRJZFxuXHRcdFx0XHRcdFx0XHRcdFx0ICBGUk9NIGxpc3RfZW50aXRpZXNcblx0XHRcdFx0XHRcdFx0XHRcdCAgV0hFUkUgdHlwZSA9ICR7dHlwZX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0QU5EIGxpc3RJZCA9ICR7bGlzdElkfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRBTkQgKGVsZW1lbnRJZCA9ICR7cmFuZ2UubG93ZXJ9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdCAgT1IgJHtmaXJzdElkQmlnZ2VyKFwiZWxlbWVudElkXCIsIHJhbmdlLmxvd2VyKX0pXG5cdFx0XHRcdFx0XHRcdFx0XHRcdEFORCBOT1QgKCR7Zmlyc3RJZEJpZ2dlcihcImVsZW1lbnRJZFwiLCByYW5nZS51cHBlcil9KWBcblx0XHRjb25zdCByb3dzID0gYXdhaXQgdGhpcy5zcWxDaXBoZXJGYWNhZGUuYWxsKHF1ZXJ5LCBwYXJhbXMpXG5cdFx0cmV0dXJuIHJvd3MubWFwKChyb3cpID0+IGN1c3RvbUlkVG9CYXNlNjRVcmwodHlwZU1vZGVsLCByb3cuZWxlbWVudElkLnZhbHVlIGFzIHN0cmluZykpXG5cdH1cblxuXHQvKiogZG9uJ3QgdXNlIHRoaXMgaW50ZXJuYWxseSBpbiB0aGlzIGNsYXNzLCB1c2UgT2ZmbGluZVN0b3JhZ2U6OmdldFJhbmdlIGluc3RlYWQuIE9mZmxpbmVTdG9yYWdlIGlzXG5cdCAqIHVzaW5nIGNvbnZlcnRlZCBjdXN0b20gSURzIGludGVybmFsbHkgd2hpY2ggaXMgdW5kb25lIHdoZW4gdXNpbmcgdGhpcyB0byBhY2Nlc3MgdGhlIHJhbmdlLlxuXHQgKi9cblx0YXN5bmMgZ2V0UmFuZ2VGb3JMaXN0PFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCk6IFByb21pc2U8UmFuZ2UgfCBudWxsPiB7XG5cdFx0bGV0IHJhbmdlID0gYXdhaXQgdGhpcy5nZXRSYW5nZSh0eXBlUmVmLCBsaXN0SWQpXG5cdFx0aWYgKHJhbmdlID09IG51bGwpIHJldHVybiByYW5nZVxuXHRcdGNvbnN0IHR5cGVNb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGVSZWYpXG5cdFx0cmV0dXJuIHtcblx0XHRcdGxvd2VyOiBjdXN0b21JZFRvQmFzZTY0VXJsKHR5cGVNb2RlbCwgcmFuZ2UubG93ZXIpLFxuXHRcdFx0dXBwZXI6IGN1c3RvbUlkVG9CYXNlNjRVcmwodHlwZU1vZGVsLCByYW5nZS51cHBlciksXG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgaXNFbGVtZW50SWRJbkNhY2hlUmFuZ2U8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkLCBlbGVtZW50SWQ6IElkKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgdHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UodHlwZVJlZilcblx0XHRjb25zdCBlbmNvZGVkRWxlbWVudElkID0gZW5zdXJlQmFzZTY0RXh0KHR5cGVNb2RlbCwgZWxlbWVudElkKVxuXG5cdFx0Y29uc3QgcmFuZ2UgPSBhd2FpdCB0aGlzLmdldFJhbmdlKHR5cGVSZWYsIGxpc3RJZClcblx0XHRyZXR1cm4gcmFuZ2UgIT0gbnVsbCAmJiAhZmlyc3RCaWdnZXJUaGFuU2Vjb25kKGVuY29kZWRFbGVtZW50SWQsIHJhbmdlLnVwcGVyKSAmJiAhZmlyc3RCaWdnZXJUaGFuU2Vjb25kKHJhbmdlLmxvd2VyLCBlbmNvZGVkRWxlbWVudElkKVxuXHR9XG5cblx0YXN5bmMgcHJvdmlkZUZyb21SYW5nZTxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQsIHN0YXJ0OiBJZCwgY291bnQ6IG51bWJlciwgcmV2ZXJzZTogYm9vbGVhbik6IFByb21pc2U8VFtdPiB7XG5cdFx0Y29uc3QgdHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UodHlwZVJlZilcblx0XHRjb25zdCBlbmNvZGVkU3RhcnRJZCA9IGVuc3VyZUJhc2U2NEV4dCh0eXBlTW9kZWwsIHN0YXJ0KVxuXHRcdGNvbnN0IHR5cGUgPSBnZXRUeXBlSWQodHlwZVJlZilcblx0XHRsZXQgZm9ybWF0dGVkUXVlcnlcblx0XHRpZiAocmV2ZXJzZSkge1xuXHRcdFx0Zm9ybWF0dGVkUXVlcnkgPSBzcWxgU0VMRUNUIGVudGl0eVxuXHRcdFx0XHRcdFx0XHRcdCBGUk9NIGxpc3RfZW50aXRpZXNcblx0XHRcdFx0XHRcdFx0XHQgV0hFUkUgdHlwZSA9ICR7dHlwZX1cblx0XHRcdFx0XHRcdFx0XHQgICBBTkQgbGlzdElkID0gJHtsaXN0SWR9XG5cdFx0XHRcdFx0XHRcdFx0ICAgQU5EICR7Zmlyc3RJZEJpZ2dlcihlbmNvZGVkU3RhcnRJZCwgXCJlbGVtZW50SWRcIil9XG5cdFx0XHRcdFx0XHRcdFx0IE9SREVSIEJZIExFTkdUSChlbGVtZW50SWQpIERFU0MsIGVsZW1lbnRJZCBERVNDIExJTUlUICR7Y291bnR9YFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmb3JtYXR0ZWRRdWVyeSA9IHNxbGBTRUxFQ1QgZW50aXR5XG5cdFx0XHRcdFx0XHRcdFx0IEZST00gbGlzdF9lbnRpdGllc1xuXHRcdFx0XHRcdFx0XHRcdCBXSEVSRSB0eXBlID0gJHt0eXBlfVxuXHRcdFx0XHRcdFx0XHRcdCAgIEFORCBsaXN0SWQgPSAke2xpc3RJZH1cblx0XHRcdFx0XHRcdFx0XHQgICBBTkQgJHtmaXJzdElkQmlnZ2VyKFwiZWxlbWVudElkXCIsIGVuY29kZWRTdGFydElkKX1cblx0XHRcdFx0XHRcdFx0XHQgT1JERVIgQlkgTEVOR1RIKGVsZW1lbnRJZCkgQVNDLCBlbGVtZW50SWQgQVNDIExJTUlUICR7Y291bnR9YFxuXHRcdH1cblx0XHRjb25zdCB7IHF1ZXJ5LCBwYXJhbXMgfSA9IGZvcm1hdHRlZFF1ZXJ5XG5cdFx0Y29uc3Qgc2VyaWFsaXplZExpc3Q6IFJlYWRvbmx5QXJyYXk8UmVjb3JkPHN0cmluZywgVGFnZ2VkU3FsVmFsdWU+PiA9IGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLmFsbChxdWVyeSwgcGFyYW1zKVxuXHRcdHJldHVybiBhd2FpdCB0aGlzLmRlc2VyaWFsaXplTGlzdChcblx0XHRcdHR5cGVSZWYsXG5cdFx0XHRzZXJpYWxpemVkTGlzdC5tYXAoKHIpID0+IHIuZW50aXR5LnZhbHVlIGFzIFVpbnQ4QXJyYXkpLFxuXHRcdClcblx0fVxuXG5cdGFzeW5jIHB1dChvcmlnaW5hbEVudGl0eTogU29tZUVudGl0eSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHNlcmlhbGl6ZWRFbnRpdHkgPSB0aGlzLnNlcmlhbGl6ZShvcmlnaW5hbEVudGl0eSlcblx0XHRjb25zdCB7IGxpc3RJZCwgZWxlbWVudElkIH0gPSBleHBhbmRJZChvcmlnaW5hbEVudGl0eS5faWQpXG5cdFx0Y29uc3QgdHlwZSA9IGdldFR5cGVJZChvcmlnaW5hbEVudGl0eS5fdHlwZSlcblx0XHRjb25zdCBvd25lckdyb3VwID0gb3JpZ2luYWxFbnRpdHkuX293bmVyR3JvdXBcblx0XHRjb25zdCB0eXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZShvcmlnaW5hbEVudGl0eS5fdHlwZSlcblx0XHRjb25zdCBlbmNvZGVkRWxlbWVudElkID0gZW5zdXJlQmFzZTY0RXh0KHR5cGVNb2RlbCwgZWxlbWVudElkKVxuXHRcdGxldCBmb3JtYXR0ZWRRdWVyeTogRm9ybWF0dGVkUXVlcnlcblx0XHRzd2l0Y2ggKHR5cGVNb2RlbC50eXBlKSB7XG5cdFx0XHRjYXNlIFR5cGVJZC5FbGVtZW50OlxuXHRcdFx0XHRmb3JtYXR0ZWRRdWVyeSA9IHNxbGBJTlNFUlRcblx0XHRcdFx0T1IgUkVQTEFDRSBJTlRPIGVsZW1lbnRfZW50aXRpZXMgKHR5cGUsIGVsZW1lbnRJZCwgb3duZXJHcm91cCwgZW50aXR5KSBWQUxVRVMgKFxuXHRcdFx0XHQke3R5cGV9LFxuXHRcdFx0XHQke2VuY29kZWRFbGVtZW50SWR9LFxuXHRcdFx0XHQke293bmVyR3JvdXB9LFxuXHRcdFx0XHQke3NlcmlhbGl6ZWRFbnRpdHl9XG5cdFx0XHRcdClgXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIFR5cGVJZC5MaXN0RWxlbWVudDpcblx0XHRcdFx0Zm9ybWF0dGVkUXVlcnkgPSBzcWxgSU5TRVJUXG5cdFx0XHRcdE9SIFJFUExBQ0UgSU5UTyBsaXN0X2VudGl0aWVzICh0eXBlLCBsaXN0SWQsIGVsZW1lbnRJZCwgb3duZXJHcm91cCwgZW50aXR5KSBWQUxVRVMgKFxuXHRcdFx0XHQke3R5cGV9LFxuXHRcdFx0XHQke2xpc3RJZH0sXG5cdFx0XHRcdCR7ZW5jb2RlZEVsZW1lbnRJZH0sXG5cdFx0XHRcdCR7b3duZXJHcm91cH0sXG5cdFx0XHRcdCR7c2VyaWFsaXplZEVudGl0eX1cblx0XHRcdFx0KWBcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgVHlwZUlkLkJsb2JFbGVtZW50OlxuXHRcdFx0XHRmb3JtYXR0ZWRRdWVyeSA9IHNxbGBJTlNFUlRcblx0XHRcdFx0T1IgUkVQTEFDRSBJTlRPIGJsb2JfZWxlbWVudF9lbnRpdGllcyAodHlwZSwgbGlzdElkLCBlbGVtZW50SWQsIG93bmVyR3JvdXAsIGVudGl0eSkgVkFMVUVTIChcblx0XHRcdFx0JHt0eXBlfSxcblx0XHRcdFx0JHtsaXN0SWR9LFxuXHRcdFx0XHQke2VuY29kZWRFbGVtZW50SWR9LFxuXHRcdFx0XHQke293bmVyR3JvdXB9LFxuXHRcdFx0XHQke3NlcmlhbGl6ZWRFbnRpdHl9XG5cdFx0XHRcdClgXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJtdXN0IGJlIGEgcGVyc2lzdGVudCB0eXBlXCIpXG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLnJ1bihmb3JtYXR0ZWRRdWVyeS5xdWVyeSwgZm9ybWF0dGVkUXVlcnkucGFyYW1zKVxuXHR9XG5cblx0YXN5bmMgc2V0TG93ZXJSYW5nZUZvckxpc3Q8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkLCBsb3dlcklkOiBJZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGxvd2VySWQgPSBlbnN1cmVCYXNlNjRFeHQoYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UodHlwZVJlZiksIGxvd2VySWQpXG5cdFx0Y29uc3QgdHlwZSA9IGdldFR5cGVJZCh0eXBlUmVmKVxuXHRcdGNvbnN0IHsgcXVlcnksIHBhcmFtcyB9ID0gc3FsYFVQREFURSByYW5nZXNcblx0XHRcdFx0XHRcdFx0XHRcdCAgU0VUIGxvd2VyID0gJHtsb3dlcklkfVxuXHRcdFx0XHRcdFx0XHRcdFx0ICBXSEVSRSB0eXBlID0gJHt0eXBlfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRBTkQgbGlzdElkID0gJHtsaXN0SWR9YFxuXHRcdGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLnJ1bihxdWVyeSwgcGFyYW1zKVxuXHR9XG5cblx0YXN5bmMgc2V0VXBwZXJSYW5nZUZvckxpc3Q8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkLCB1cHBlcklkOiBJZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHVwcGVySWQgPSBlbnN1cmVCYXNlNjRFeHQoYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UodHlwZVJlZiksIHVwcGVySWQpXG5cdFx0Y29uc3QgdHlwZSA9IGdldFR5cGVJZCh0eXBlUmVmKVxuXHRcdGNvbnN0IHsgcXVlcnksIHBhcmFtcyB9ID0gc3FsYFVQREFURSByYW5nZXNcblx0XHRcdFx0XHRcdFx0XHRcdCAgU0VUIHVwcGVyID0gJHt1cHBlcklkfVxuXHRcdFx0XHRcdFx0XHRcdFx0ICBXSEVSRSB0eXBlID0gJHt0eXBlfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRBTkQgbGlzdElkID0gJHtsaXN0SWR9YFxuXHRcdGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLnJ1bihxdWVyeSwgcGFyYW1zKVxuXHR9XG5cblx0YXN5bmMgc2V0TmV3UmFuZ2VGb3JMaXN0PFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCwgbG93ZXI6IElkLCB1cHBlcjogSWQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCB0eXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZSh0eXBlUmVmKVxuXHRcdGxvd2VyID0gZW5zdXJlQmFzZTY0RXh0KHR5cGVNb2RlbCwgbG93ZXIpXG5cdFx0dXBwZXIgPSBlbnN1cmVCYXNlNjRFeHQodHlwZU1vZGVsLCB1cHBlcilcblxuXHRcdGNvbnN0IHR5cGUgPSBnZXRUeXBlSWQodHlwZVJlZilcblx0XHRjb25zdCB7IHF1ZXJ5LCBwYXJhbXMgfSA9IHNxbGBJTlNFUlRcblx0XHRPUiBSRVBMQUNFIElOVE8gcmFuZ2VzIFZBTFVFUyAoXG5cdFx0JHt0eXBlfSxcblx0XHQke2xpc3RJZH0sXG5cdFx0JHtsb3dlcn0sXG5cdFx0JHt1cHBlcn1cblx0XHQpYFxuXHRcdHJldHVybiB0aGlzLnNxbENpcGhlckZhY2FkZS5ydW4ocXVlcnksIHBhcmFtcylcblx0fVxuXG5cdGFzeW5jIGdldExhc3RCYXRjaElkRm9yR3JvdXAoZ3JvdXBJZDogSWQpOiBQcm9taXNlPElkIHwgbnVsbD4ge1xuXHRcdGNvbnN0IHsgcXVlcnksIHBhcmFtcyB9ID0gc3FsYFNFTEVDVCBiYXRjaElkXG5cdFx0XHRcdFx0XHRcdFx0XHQgIGZyb20gbGFzdFVwZGF0ZUJhdGNoSWRQZXJHcm91cElkXG5cdFx0XHRcdFx0XHRcdFx0XHQgIFdIRVJFIGdyb3VwSWQgPSAke2dyb3VwSWR9YFxuXHRcdGNvbnN0IHJvdyA9IChhd2FpdCB0aGlzLnNxbENpcGhlckZhY2FkZS5nZXQocXVlcnksIHBhcmFtcykpIGFzIHsgYmF0Y2hJZDogVGFnZ2VkU3FsVmFsdWUgfSB8IG51bGxcblx0XHRyZXR1cm4gKHJvdz8uYmF0Y2hJZD8udmFsdWUgPz8gbnVsbCkgYXMgSWQgfCBudWxsXG5cdH1cblxuXHRhc3luYyBwdXRMYXN0QmF0Y2hJZEZvckdyb3VwKGdyb3VwSWQ6IElkLCBiYXRjaElkOiBJZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHsgcXVlcnksIHBhcmFtcyB9ID0gc3FsYElOU0VSVFxuXHRcdE9SIFJFUExBQ0UgSU5UTyBsYXN0VXBkYXRlQmF0Y2hJZFBlckdyb3VwSWQgVkFMVUVTIChcblx0XHQke2dyb3VwSWR9LFxuXHRcdCR7YmF0Y2hJZH1cblx0XHQpYFxuXHRcdGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLnJ1bihxdWVyeSwgcGFyYW1zKVxuXHR9XG5cblx0YXN5bmMgZ2V0TGFzdFVwZGF0ZVRpbWUoKTogUHJvbWlzZTxMYXN0VXBkYXRlVGltZT4ge1xuXHRcdGNvbnN0IHRpbWUgPSBhd2FpdCB0aGlzLmdldE1ldGFkYXRhKFwibGFzdFVwZGF0ZVRpbWVcIilcblx0XHRyZXR1cm4gdGltZSA/IHsgdHlwZTogXCJyZWNvcmRlZFwiLCB0aW1lIH0gOiB7IHR5cGU6IFwibmV2ZXJcIiB9XG5cdH1cblxuXHRhc3luYyBwdXRMYXN0VXBkYXRlVGltZShtczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0YXdhaXQgdGhpcy5wdXRNZXRhZGF0YShcImxhc3RVcGRhdGVUaW1lXCIsIG1zKVxuXHR9XG5cblx0YXN5bmMgcHVyZ2VTdG9yYWdlKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGZvciAobGV0IG5hbWUgb2YgT2JqZWN0LmtleXMoVGFibGVEZWZpbml0aW9ucykpIHtcblx0XHRcdGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLnJ1bihcblx0XHRcdFx0YERFTEVURVxuXHRcdFx0XHQgRlJPTSAke25hbWV9YCxcblx0XHRcdFx0W10sXG5cdFx0XHQpXG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgZGVsZXRlUmFuZ2UodHlwZVJlZjogVHlwZVJlZjx1bmtub3duPiwgbGlzdElkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCB7IHF1ZXJ5LCBwYXJhbXMgfSA9IHNxbGBERUxFVEVcblx0XHRcdFx0XHRcdFx0XHRcdCAgRlJPTSByYW5nZXNcblx0XHRcdFx0XHRcdFx0XHRcdCAgV0hFUkUgdHlwZSA9ICR7Z2V0VHlwZUlkKHR5cGVSZWYpfVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRBTkQgbGlzdElkID0gJHtsaXN0SWR9YFxuXHRcdGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLnJ1bihxdWVyeSwgcGFyYW1zKVxuXHR9XG5cblx0YXN5bmMgZ2V0UmF3TGlzdEVsZW1lbnRzT2ZUeXBlKHR5cGVSZWY6IFR5cGVSZWY8TGlzdEVsZW1lbnRFbnRpdHk+KTogUHJvbWlzZTxBcnJheTxMaXN0RWxlbWVudEVudGl0eT4+IHtcblx0XHRjb25zdCB7IHF1ZXJ5LCBwYXJhbXMgfSA9IHNxbGBTRUxFQ1QgZW50aXR5XG5cdFx0XHRcdFx0XHRcdFx0XHQgIGZyb20gbGlzdF9lbnRpdGllc1xuXHRcdFx0XHRcdFx0XHRcdFx0ICBXSEVSRSB0eXBlID0gJHtnZXRUeXBlSWQodHlwZVJlZil9YFxuXHRcdGNvbnN0IGl0ZW1zID0gKGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLmFsbChxdWVyeSwgcGFyYW1zKSkgPz8gW11cblx0XHRyZXR1cm4gaXRlbXMubWFwKChpdGVtKSA9PiB0aGlzLmRlY29kZUNib3JFbnRpdHkoaXRlbS5lbnRpdHkudmFsdWUgYXMgVWludDhBcnJheSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4gJiBMaXN0RWxlbWVudEVudGl0eSlcblx0fVxuXG5cdGFzeW5jIGdldFJhd0VsZW1lbnRzT2ZUeXBlKHR5cGVSZWY6IFR5cGVSZWY8RWxlbWVudEVudGl0eT4pOiBQcm9taXNlPEFycmF5PEVsZW1lbnRFbnRpdHk+PiB7XG5cdFx0Y29uc3QgeyBxdWVyeSwgcGFyYW1zIH0gPSBzcWxgU0VMRUNUIGVudGl0eVxuXHRcdFx0XHRcdFx0XHRcdFx0ICBmcm9tIGVsZW1lbnRfZW50aXRpZXNcblx0XHRcdFx0XHRcdFx0XHRcdCAgV0hFUkUgdHlwZSA9ICR7Z2V0VHlwZUlkKHR5cGVSZWYpfWBcblx0XHRjb25zdCBpdGVtcyA9IChhd2FpdCB0aGlzLnNxbENpcGhlckZhY2FkZS5hbGwocXVlcnksIHBhcmFtcykpID8/IFtdXG5cdFx0cmV0dXJuIGl0ZW1zLm1hcCgoaXRlbSkgPT4gdGhpcy5kZWNvZGVDYm9yRW50aXR5KGl0ZW0uZW50aXR5LnZhbHVlIGFzIFVpbnQ4QXJyYXkpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+ICYgRWxlbWVudEVudGl0eSlcblx0fVxuXG5cdGFzeW5jIGdldEVsZW1lbnRzT2ZUeXBlPFQgZXh0ZW5kcyBFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+KTogUHJvbWlzZTxBcnJheTxUPj4ge1xuXHRcdGNvbnN0IHsgcXVlcnksIHBhcmFtcyB9ID0gc3FsYFNFTEVDVCBlbnRpdHlcblx0XHRcdFx0XHRcdFx0XHRcdCAgZnJvbSBlbGVtZW50X2VudGl0aWVzXG5cdFx0XHRcdFx0XHRcdFx0XHQgIFdIRVJFIHR5cGUgPSAke2dldFR5cGVJZCh0eXBlUmVmKX1gXG5cdFx0Y29uc3QgaXRlbXMgPSAoYXdhaXQgdGhpcy5zcWxDaXBoZXJGYWNhZGUuYWxsKHF1ZXJ5LCBwYXJhbXMpKSA/PyBbXVxuXHRcdHJldHVybiBhd2FpdCB0aGlzLmRlc2VyaWFsaXplTGlzdChcblx0XHRcdHR5cGVSZWYsXG5cdFx0XHRpdGVtcy5tYXAoKHJvdykgPT4gcm93LmVudGl0eS52YWx1ZSBhcyBVaW50OEFycmF5KSxcblx0XHQpXG5cdH1cblxuXHRhc3luYyBnZXRXaG9sZUxpc3Q8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkKTogUHJvbWlzZTxBcnJheTxUPj4ge1xuXHRcdGNvbnN0IHsgcXVlcnksIHBhcmFtcyB9ID0gc3FsYFNFTEVDVCBlbnRpdHlcblx0XHRcdFx0XHRcdFx0XHRcdCAgRlJPTSBsaXN0X2VudGl0aWVzXG5cdFx0XHRcdFx0XHRcdFx0XHQgIFdIRVJFIHR5cGUgPSAke2dldFR5cGVJZCh0eXBlUmVmKX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0QU5EIGxpc3RJZCA9ICR7bGlzdElkfWBcblx0XHRjb25zdCBpdGVtcyA9IChhd2FpdCB0aGlzLnNxbENpcGhlckZhY2FkZS5hbGwocXVlcnksIHBhcmFtcykpID8/IFtdXG5cdFx0cmV0dXJuIGF3YWl0IHRoaXMuZGVzZXJpYWxpemVMaXN0KFxuXHRcdFx0dHlwZVJlZixcblx0XHRcdGl0ZW1zLm1hcCgocm93KSA9PiByb3cuZW50aXR5LnZhbHVlIGFzIFVpbnQ4QXJyYXkpLFxuXHRcdClcblx0fVxuXG5cdGFzeW5jIGR1bXBNZXRhZGF0YSgpOiBQcm9taXNlPFBhcnRpYWw8T2ZmbGluZURiTWV0YT4+IHtcblx0XHRjb25zdCBxdWVyeSA9IFwiU0VMRUNUICogZnJvbSBtZXRhZGF0YVwiXG5cdFx0Y29uc3Qgc3RvcmVkID0gKGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLmFsbChxdWVyeSwgW10pKS5tYXAoKHJvdykgPT4gW3Jvdy5rZXkudmFsdWUgYXMgc3RyaW5nLCByb3cudmFsdWUudmFsdWUgYXMgVWludDhBcnJheV0gYXMgY29uc3QpXG5cdFx0cmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhzdG9yZWQubWFwKChba2V5LCB2YWx1ZV0pID0+IFtrZXksIGNib3JnLmRlY29kZSh2YWx1ZSldKSkgYXMgT2ZmbGluZURiTWV0YVxuXHR9XG5cblx0YXN5bmMgc2V0U3RvcmVkTW9kZWxWZXJzaW9uKG1vZGVsOiBWZXJzaW9uTWV0YWRhdGFCYXNlS2V5LCB2ZXJzaW9uOiBudW1iZXIpIHtcblx0XHRyZXR1cm4gdGhpcy5wdXRNZXRhZGF0YShgJHttb2RlbH0tdmVyc2lvbmAsIHZlcnNpb24pXG5cdH1cblxuXHRnZXRDdXN0b21DYWNoZUhhbmRsZXJNYXAoZW50aXR5UmVzdENsaWVudDogRW50aXR5UmVzdENsaWVudCk6IEN1c3RvbUNhY2hlSGFuZGxlck1hcCB7XG5cdFx0aWYgKHRoaXMuY3VzdG9tQ2FjaGVIYW5kbGVyID09IG51bGwpIHtcblx0XHRcdHRoaXMuY3VzdG9tQ2FjaGVIYW5kbGVyID0gbmV3IEN1c3RvbUNhY2hlSGFuZGxlck1hcChcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJlZjogQ2FsZW5kYXJFdmVudFR5cGVSZWYsXG5cdFx0XHRcdFx0aGFuZGxlcjogbmV3IEN1c3RvbUNhbGVuZGFyRXZlbnRDYWNoZUhhbmRsZXIoZW50aXR5UmVzdENsaWVudCksXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHsgcmVmOiBNYWlsVHlwZVJlZiwgaGFuZGxlcjogbmV3IEN1c3RvbU1haWxFdmVudENhY2hlSGFuZGxlcigpIH0sXG5cdFx0XHQpXG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmN1c3RvbUNhY2hlSGFuZGxlclxuXHR9XG5cblx0Z2V0VXNlcklkKCk6IElkIHtcblx0XHRyZXR1cm4gYXNzZXJ0Tm90TnVsbCh0aGlzLnVzZXJJZCwgXCJObyB1c2VyIGlkLCBub3QgaW5pdGlhbGl6ZWQ/XCIpXG5cdH1cblxuXHRhc3luYyBkZWxldGVBbGxPd25lZEJ5KG93bmVyOiBJZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHtcblx0XHRcdGNvbnN0IHsgcXVlcnksIHBhcmFtcyB9ID0gc3FsYERFTEVURVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQgIEZST00gZWxlbWVudF9lbnRpdGllc1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQgIFdIRVJFIG93bmVyR3JvdXAgPSAke293bmVyfWBcblx0XHRcdGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLnJ1bihxdWVyeSwgcGFyYW1zKVxuXHRcdH1cblx0XHR7XG5cdFx0XHQvLyBmaXJzdCwgY2hlY2sgd2hpY2ggbGlzdCBJZHMgY29udGFpbiBlbnRpdGllcyBvd25lZCBieSB0aGUgbG9zdCBncm91cFxuXHRcdFx0Y29uc3QgeyBxdWVyeSwgcGFyYW1zIH0gPSBzcWxgU0VMRUNUIGxpc3RJZCwgdHlwZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQgIEZST00gbGlzdF9lbnRpdGllc1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQgIFdIRVJFIG93bmVyR3JvdXAgPSAke293bmVyfWBcblx0XHRcdGNvbnN0IHJhbmdlUm93cyA9IGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLmFsbChxdWVyeSwgcGFyYW1zKVxuXHRcdFx0Y29uc3Qgcm93cyA9IHJhbmdlUm93cy5tYXAoKHJvdykgPT4gdW50YWdTcWxPYmplY3Qocm93KSBhcyB7IGxpc3RJZDogc3RyaW5nOyB0eXBlOiBzdHJpbmcgfSlcblx0XHRcdGNvbnN0IGxpc3RJZHNCeVR5cGU6IE1hcDxzdHJpbmcsIFNldDxJZD4+ID0gZ3JvdXBCeUFuZE1hcFVuaXF1ZWx5KFxuXHRcdFx0XHRyb3dzLFxuXHRcdFx0XHQocm93KSA9PiByb3cudHlwZSxcblx0XHRcdFx0KHJvdykgPT4gcm93Lmxpc3RJZCxcblx0XHRcdClcblx0XHRcdC8vIGRlbGV0ZSB0aGUgcmFuZ2VzIGZvciB0aG9zZSBsaXN0SWRzXG5cdFx0XHRmb3IgKGNvbnN0IFt0eXBlLCBsaXN0SWRzXSBvZiBsaXN0SWRzQnlUeXBlLmVudHJpZXMoKSkge1xuXHRcdFx0XHQvLyB0aGlzIHBhcnRpY3VsYXIgcXVlcnkgdXNlcyBvbmUgb3RoZXIgU1FMIHZhciBmb3IgdGhlIHR5cGUuXG5cdFx0XHRcdGNvbnN0IHNhZmVDaHVua1NpemUgPSBNQVhfU0FGRV9TUUxfVkFSUyAtIDFcblx0XHRcdFx0Y29uc3QgbGlzdElkQXJyID0gQXJyYXkuZnJvbShsaXN0SWRzKVxuXHRcdFx0XHRhd2FpdCB0aGlzLnJ1bkNodW5rZWQoXG5cdFx0XHRcdFx0c2FmZUNodW5rU2l6ZSxcblx0XHRcdFx0XHRsaXN0SWRBcnIsXG5cdFx0XHRcdFx0KGMpID0+IHNxbGBERUxFVEVcblx0XHRcdFx0XHRcdFx0ICAgRlJPTSByYW5nZXNcblx0XHRcdFx0XHRcdFx0ICAgV0hFUkUgdHlwZSA9ICR7dHlwZX1cblx0XHRcdFx0XHRcdFx0XHQgQU5EIGxpc3RJZCBJTiAke3BhcmFtTGlzdChjKX1gLFxuXHRcdFx0XHQpXG5cdFx0XHRcdGF3YWl0IHRoaXMucnVuQ2h1bmtlZChcblx0XHRcdFx0XHRzYWZlQ2h1bmtTaXplLFxuXHRcdFx0XHRcdGxpc3RJZEFycixcblx0XHRcdFx0XHQoYykgPT4gc3FsYERFTEVURVxuXHRcdFx0XHRcdFx0XHQgICBGUk9NIGxpc3RfZW50aXRpZXNcblx0XHRcdFx0XHRcdFx0ICAgV0hFUkUgdHlwZSA9ICR7dHlwZX1cblx0XHRcdFx0XHRcdFx0XHQgQU5EIGxpc3RJZCBJTiAke3BhcmFtTGlzdChjKX1gLFxuXHRcdFx0XHQpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHtcblx0XHRcdGNvbnN0IHsgcXVlcnksIHBhcmFtcyB9ID0gc3FsYERFTEVURVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQgIEZST00gYmxvYl9lbGVtZW50X2VudGl0aWVzXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCAgV0hFUkUgb3duZXJHcm91cCA9ICR7b3duZXJ9YFxuXHRcdFx0YXdhaXQgdGhpcy5zcWxDaXBoZXJGYWNhZGUucnVuKHF1ZXJ5LCBwYXJhbXMpXG5cdFx0fVxuXHRcdHtcblx0XHRcdGNvbnN0IHsgcXVlcnksIHBhcmFtcyB9ID0gc3FsYERFTEVURVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQgIEZST00gbGFzdFVwZGF0ZUJhdGNoSWRQZXJHcm91cElkXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCAgV0hFUkUgZ3JvdXBJZCA9ICR7b3duZXJ9YFxuXHRcdFx0YXdhaXQgdGhpcy5zcWxDaXBoZXJGYWNhZGUucnVuKHF1ZXJ5LCBwYXJhbXMpXG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgZGVsZXRlV2hvbGVMaXN0PFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGF3YWl0IHRoaXMubG9ja1Jhbmdlc0RiQWNjZXNzKGxpc3RJZClcblx0XHRhd2FpdCB0aGlzLmRlbGV0ZVJhbmdlKHR5cGVSZWYsIGxpc3RJZClcblx0XHRjb25zdCB7IHF1ZXJ5LCBwYXJhbXMgfSA9IHNxbGBERUxFVEVcblx0XHRcdFx0XHRcdFx0XHRcdCAgRlJPTSBsaXN0X2VudGl0aWVzXG5cdFx0XHRcdFx0XHRcdFx0XHQgIFdIRVJFIGxpc3RJZCA9ICR7bGlzdElkfWBcblx0XHRhd2FpdCB0aGlzLnNxbENpcGhlckZhY2FkZS5ydW4ocXVlcnksIHBhcmFtcylcblx0XHRhd2FpdCB0aGlzLnVubG9ja1Jhbmdlc0RiQWNjZXNzKGxpc3RJZClcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgcHV0TWV0YWRhdGE8SyBleHRlbmRzIGtleW9mIE9mZmxpbmVEYk1ldGE+KGtleTogSywgdmFsdWU6IE9mZmxpbmVEYk1ldGFbS10pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRsZXQgZW5jb2RlZFZhbHVlXG5cdFx0dHJ5IHtcblx0XHRcdGVuY29kZWRWYWx1ZSA9IGNib3JnLmVuY29kZSh2YWx1ZSlcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIltPZmZsaW5lU3RvcmFnZV0gZmFpbGVkIHRvIGVuY29kZSBtZXRhZGF0YSBmb3Iga2V5XCIsIGtleSwgXCJ3aXRoIHZhbHVlXCIsIHZhbHVlKVxuXHRcdFx0dGhyb3cgZVxuXHRcdH1cblx0XHRjb25zdCB7IHF1ZXJ5LCBwYXJhbXMgfSA9IHNxbGBJTlNFUlRcblx0XHRPUiBSRVBMQUNFIElOVE8gbWV0YWRhdGEgVkFMVUVTIChcblx0XHQke2tleX0sXG5cdFx0JHtlbmNvZGVkVmFsdWV9XG5cdFx0KWBcblx0XHRhd2FpdCB0aGlzLnNxbENpcGhlckZhY2FkZS5ydW4ocXVlcnksIHBhcmFtcylcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgZ2V0TWV0YWRhdGE8SyBleHRlbmRzIGtleW9mIE9mZmxpbmVEYk1ldGE+KGtleTogSyk6IFByb21pc2U8T2ZmbGluZURiTWV0YVtLXSB8IG51bGw+IHtcblx0XHRjb25zdCB7IHF1ZXJ5LCBwYXJhbXMgfSA9IHNxbGBTRUxFQ1QgdmFsdWVcblx0XHRcdFx0XHRcdFx0XHRcdCAgZnJvbSBtZXRhZGF0YVxuXHRcdFx0XHRcdFx0XHRcdFx0ICBXSEVSRSBrZXkgPSAke2tleX1gXG5cdFx0Y29uc3QgZW5jb2RlZCA9IGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLmdldChxdWVyeSwgcGFyYW1zKVxuXHRcdHJldHVybiBlbmNvZGVkICYmIGNib3JnLmRlY29kZShlbmNvZGVkLnZhbHVlLnZhbHVlIGFzIFVpbnQ4QXJyYXkpXG5cdH1cblxuXHQvKipcblx0ICogQ2xlYXIgb3V0IHVubmVlZGVkIGRhdGEgZnJvbSB0aGUgb2ZmbGluZSBkYXRhYmFzZSAoaS5lLiB0cmFzaCBhbmQgc3BhbSBsaXN0cywgb2xkIGRhdGEpLlxuXHQgKiBUaGlzIHdpbGwgYmUgY2FsbGVkIGFmdGVyIGxvZ2luIChDYWNoZVBvc3RMb2dpbkFjdGlvbnMudHMpIHRvIGVuc3VyZSBmYXN0IGxvZ2luIHRpbWUuXG5cdCAqIEBwYXJhbSB0aW1lUmFuZ2VEYXlzOiB0aGUgbWF4aW11bSBhZ2Ugb2YgZGF5cyB0aGF0IG1haWxzIHNob3VsZCBiZSB0byBiZSBrZXB0IGluIHRoZSBkYXRhYmFzZS4gaWYgbnVsbCwgd2lsbCB1c2UgYSBkZWZhdWx0IHZhbHVlXG5cdCAqIEBwYXJhbSB1c2VySWQgaWQgb2YgdGhlIGN1cnJlbnQgdXNlci4gZGVmYXVsdCwgbGFzdCBzdG9yZWQgdXNlcklkXG5cdCAqL1xuXHRhc3luYyBjbGVhckV4Y2x1ZGVkRGF0YSh0aW1lUmFuZ2VEYXlzOiBudW1iZXIgfCBudWxsID0gdGhpcy50aW1lUmFuZ2VEYXlzLCB1c2VySWQ6IElkID0gdGhpcy5nZXRVc2VySWQoKSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGF3YWl0IHRoaXMuY2xlYW5lci5jbGVhbk9mZmxpbmVEYih0aGlzLCB0aW1lUmFuZ2VEYXlzLCB1c2VySWQsIHRoaXMuZGF0ZVByb3ZpZGVyLm5vdygpKVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBjcmVhdGVUYWJsZXMoKSB7XG5cdFx0Zm9yIChsZXQgW25hbWUsIGRlZmluaXRpb25dIG9mIE9iamVjdC5lbnRyaWVzKFRhYmxlRGVmaW5pdGlvbnMpKSB7XG5cdFx0XHRhd2FpdCB0aGlzLnNxbENpcGhlckZhY2FkZS5ydW4oXG5cdFx0XHRcdGBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyAke25hbWV9XG5cdFx0XHRcdCAoXG5cdFx0XHRcdFx0ICR7ZGVmaW5pdGlvbn1cblx0XHRcdFx0IClgLFxuXHRcdFx0XHRbXSxcblx0XHRcdClcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGdldFJhbmdlKHR5cGVSZWY6IFR5cGVSZWY8RWxlbWVudEVudGl0eSB8IExpc3RFbGVtZW50RW50aXR5PiwgbGlzdElkOiBJZCk6IFByb21pc2U8UmFuZ2UgfCBudWxsPiB7XG5cdFx0Y29uc3QgdHlwZSA9IGdldFR5cGVJZCh0eXBlUmVmKVxuXHRcdGNvbnN0IHsgcXVlcnksIHBhcmFtcyB9ID0gc3FsYFNFTEVDVCB1cHBlciwgbG93ZXJcblx0XHRcdFx0XHRcdFx0XHRcdCAgRlJPTSByYW5nZXNcblx0XHRcdFx0XHRcdFx0XHRcdCAgV0hFUkUgdHlwZSA9ICR7dHlwZX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0QU5EIGxpc3RJZCA9ICR7bGlzdElkfWBcblx0XHRjb25zdCByb3cgPSAoYXdhaXQgdGhpcy5zcWxDaXBoZXJGYWNhZGUuZ2V0KHF1ZXJ5LCBwYXJhbXMpKSA/PyBudWxsXG5cblx0XHRyZXR1cm4gbWFwTnVsbGFibGUocm93LCB1bnRhZ1NxbE9iamVjdCkgYXMgUmFuZ2UgfCBudWxsXG5cdH1cblxuXHRhc3luYyBkZWxldGVJbih0eXBlUmVmOiBUeXBlUmVmPHVua25vd24+LCBsaXN0SWQ6IElkIHwgbnVsbCwgZWxlbWVudElkczogSWRbXSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmIChlbGVtZW50SWRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cdFx0Y29uc3QgdHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UodHlwZVJlZilcblx0XHRjb25zdCBlbmNvZGVkRWxlbWVudElkcyA9IGVsZW1lbnRJZHMubWFwKChlbGVtZW50SWRzKSA9PiBlbnN1cmVCYXNlNjRFeHQodHlwZU1vZGVsLCBlbGVtZW50SWRzKSlcblx0XHRzd2l0Y2ggKHR5cGVNb2RlbC50eXBlKSB7XG5cdFx0XHRjYXNlIFR5cGVJZC5FbGVtZW50OlxuXHRcdFx0XHRyZXR1cm4gYXdhaXQgdGhpcy5ydW5DaHVua2VkKFxuXHRcdFx0XHRcdE1BWF9TQUZFX1NRTF9WQVJTIC0gMSxcblx0XHRcdFx0XHRlbmNvZGVkRWxlbWVudElkcyxcblx0XHRcdFx0XHQoYykgPT4gc3FsYERFTEVURVxuXHRcdFx0XHRcdFx0XHQgICBGUk9NIGVsZW1lbnRfZW50aXRpZXNcblx0XHRcdFx0XHRcdFx0ICAgV0hFUkUgdHlwZSA9ICR7Z2V0VHlwZUlkKHR5cGVSZWYpfVxuXHRcdFx0XHRcdFx0XHRcdCBBTkQgZWxlbWVudElkIElOICR7cGFyYW1MaXN0KGMpfWAsXG5cdFx0XHRcdClcblx0XHRcdGNhc2UgVHlwZUlkLkxpc3RFbGVtZW50OlxuXHRcdFx0XHRyZXR1cm4gYXdhaXQgdGhpcy5ydW5DaHVua2VkKFxuXHRcdFx0XHRcdE1BWF9TQUZFX1NRTF9WQVJTIC0gMixcblx0XHRcdFx0XHRlbmNvZGVkRWxlbWVudElkcyxcblx0XHRcdFx0XHQoYykgPT4gc3FsYERFTEVURVxuXHRcdFx0XHRcdFx0XHQgICBGUk9NIGxpc3RfZW50aXRpZXNcblx0XHRcdFx0XHRcdFx0ICAgV0hFUkUgdHlwZSA9ICR7Z2V0VHlwZUlkKHR5cGVSZWYpfVxuXHRcdFx0XHRcdFx0XHRcdCBBTkQgbGlzdElkID0gJHtsaXN0SWR9XG5cdFx0XHRcdFx0XHRcdFx0IEFORCBlbGVtZW50SWQgSU4gJHtwYXJhbUxpc3QoYyl9YCxcblx0XHRcdFx0KVxuXHRcdFx0Y2FzZSBUeXBlSWQuQmxvYkVsZW1lbnQ6XG5cdFx0XHRcdHJldHVybiBhd2FpdCB0aGlzLnJ1bkNodW5rZWQoXG5cdFx0XHRcdFx0TUFYX1NBRkVfU1FMX1ZBUlMgLSAyLFxuXHRcdFx0XHRcdGVuY29kZWRFbGVtZW50SWRzLFxuXHRcdFx0XHRcdChjKSA9PiBzcWxgREVMRVRFXG5cdFx0XHRcdFx0XHRcdCAgIEZST00gYmxvYl9lbGVtZW50X2VudGl0aWVzXG5cdFx0XHRcdFx0XHRcdCAgIFdIRVJFIHR5cGUgPSAke2dldFR5cGVJZCh0eXBlUmVmKX1cblx0XHRcdFx0XHRcdFx0XHQgQU5EIGxpc3RJZCA9ICR7bGlzdElkfVxuXHRcdFx0XHRcdFx0XHRcdCBBTkQgZWxlbWVudElkIElOICR7cGFyYW1MaXN0KGMpfWAsXG5cdFx0XHRcdClcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIm11c3QgYmUgYSBwZXJzaXN0ZW50IHR5cGVcIilcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogV2Ugd2FudCB0byBsb2NrIHRoZSBhY2Nlc3MgdG8gdGhlIFwicmFuZ2VzXCIgZGIgd2hlbiB1cGRhdGluZyAvIHJlYWRpbmcgdGhlXG5cdCAqIG9mZmxpbmUgYXZhaWxhYmxlIG1haWwgbGlzdCAvIG1haWxzZXQgcmFuZ2VzIGZvciBlYWNoIG1haWwgbGlzdCAocmVmZXJlbmNlZCB1c2luZyB0aGUgbGlzdElkKS5cblx0ICogQHBhcmFtIGxpc3RJZCB0aGUgbWFpbCBsaXN0IG9yIG1haWwgc2V0IGVudHJ5IGxpc3QgdGhhdCB3ZSB3YW50IHRvIGxvY2tcblx0ICovXG5cdGFzeW5jIGxvY2tSYW5nZXNEYkFjY2VzcyhsaXN0SWQ6IElkKSB7XG5cdFx0YXdhaXQgdGhpcy5zcWxDaXBoZXJGYWNhZGUubG9ja1Jhbmdlc0RiQWNjZXNzKGxpc3RJZClcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGlzIHRoZSBjb3VudGVycGFydCB0byB0aGUgZnVuY3Rpb24gXCJsb2NrUmFuZ2VzRGJBY2Nlc3MobGlzdElkKVwiLlxuXHQgKiBAcGFyYW0gbGlzdElkIHRoZSBtYWlsIGxpc3QgdGhhdCB3ZSB3YW50IHRvIHVubG9ja1xuXHQgKi9cblx0YXN5bmMgdW5sb2NrUmFuZ2VzRGJBY2Nlc3MobGlzdElkOiBJZCkge1xuXHRcdGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLnVubG9ja1Jhbmdlc0RiQWNjZXNzKGxpc3RJZClcblx0fVxuXG5cdGFzeW5jIHVwZGF0ZVJhbmdlRm9yTGlzdEFuZERlbGV0ZU9ic29sZXRlRGF0YTxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQsIHJhd0N1dG9mZklkOiBJZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHR5cGVNb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGVSZWYpXG5cdFx0Y29uc3QgaXNDdXN0b21JZCA9IGlzQ3VzdG9tSWRUeXBlKHR5cGVNb2RlbClcblx0XHRjb25zdCBlbmNvZGVkQ3V0b2ZmSWQgPSBlbnN1cmVCYXNlNjRFeHQodHlwZU1vZGVsLCByYXdDdXRvZmZJZClcblxuXHRcdGNvbnN0IHJhbmdlID0gYXdhaXQgdGhpcy5nZXRSYW5nZSh0eXBlUmVmLCBsaXN0SWQpXG5cdFx0aWYgKHJhbmdlID09IG51bGwpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdC8vIElmIHRoZSByYW5nZSBmb3IgYSBnaXZlbiBsaXN0IGlzIGNvbXBsZXRlIGZyb20gdGhlIGJlZ2lubmluZyAoc3RhcnRzIGF0IEdFTkVSQVRFRF9NSU5fSUQpLCB0aGVuIHdlIG9ubHkgd2FudCB0byBhY3R1YWxseSBtb2RpZnkgdGhlXG5cdFx0Ly8gc2F2ZWQgcmFuZ2UgaWYgd2Ugd291bGQgYmUgcmVtb3ZpbmcgZWxlbWVudHMgZnJvbSB0aGUgbGlzdCwgaW4gb3JkZXIgdG8gbm90IGxvc2UgdGhlIGluZm9ybWF0aW9uIHRoYXQgdGhlIHJhbmdlIGlzIGNvbXBsZXRlIGluIHN0b3JhZ2UuXG5cdFx0Ly8gU28gd2UgaGF2ZSB0byBjaGVjayBob3cgb2xkIHRoZSBvbGRlc3QgZWxlbWVudCBpbiBzYWlkIHJhbmdlIGlzLiBJZiBpdCBpcyBuZXdlciB0aGFuIGN1dG9mZklkLCB0aGVuIHdlIHdpbGwgbm90IG1vZGlmeSB0aGUgcmFuZ2UsXG5cdFx0Ly8gb3RoZXJ3aXNlIHdlIHdpbGwganVzdCBtb2RpZnkgaXQgbm9ybWFsbHlcblx0XHRjb25zdCBleHBlY3RlZE1pbklkID0gaXNDdXN0b21JZCA/IENVU1RPTV9NSU5fSUQgOiBHRU5FUkFURURfTUlOX0lEXG5cdFx0aWYgKHJhbmdlLmxvd2VyID09PSBleHBlY3RlZE1pbklkKSB7XG5cdFx0XHRjb25zdCBlbnRpdGllcyA9IGF3YWl0IHRoaXMucHJvdmlkZUZyb21SYW5nZSh0eXBlUmVmLCBsaXN0SWQsIGV4cGVjdGVkTWluSWQsIDEsIGZhbHNlKVxuXHRcdFx0Y29uc3QgaWQgPSBtYXBOdWxsYWJsZShlbnRpdGllc1swXSwgZ2V0RWxlbWVudElkKVxuXHRcdFx0Y29uc3QgcmFuZ2VXb250QmVNb2RpZmllZCA9IGlkID09IG51bGwgfHwgZmlyc3RCaWdnZXJUaGFuU2Vjb25kKGlkLCBlbmNvZGVkQ3V0b2ZmSWQpIHx8IGlkID09PSBlbmNvZGVkQ3V0b2ZmSWRcblx0XHRcdGlmIChyYW5nZVdvbnRCZU1vZGlmaWVkKSB7XG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChmaXJzdEJpZ2dlclRoYW5TZWNvbmQoZW5jb2RlZEN1dG9mZklkLCByYW5nZS5sb3dlcikpIHtcblx0XHRcdC8vIElmIHRoZSB1cHBlciBpZCBvZiB0aGUgcmFuZ2UgaXMgYmVsb3cgdGhlIGN1dG9mZiwgdGhlbiB0aGUgZW50aXJlIHJhbmdlIHdpbGwgYmUgZGVsZXRlZCBmcm9tIHRoZSBzdG9yYWdlXG5cdFx0XHQvLyBzbyB3ZSBqdXN0IGRlbGV0ZSB0aGUgcmFuZ2UgYXMgd2VsbFxuXHRcdFx0Ly8gT3RoZXJ3aXNlLCB3ZSBvbmx5IHdhbnQgdG8gbW9kaWZ5XG5cdFx0XHRpZiAoZmlyc3RCaWdnZXJUaGFuU2Vjb25kKGVuY29kZWRDdXRvZmZJZCwgcmFuZ2UudXBwZXIpKSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMuZGVsZXRlUmFuZ2UodHlwZVJlZiwgbGlzdElkKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5zZXRMb3dlclJhbmdlRm9yTGlzdCh0eXBlUmVmLCBsaXN0SWQsIHJhd0N1dG9mZklkKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgc2VyaWFsaXplKG9yaWdpbmFsRW50aXR5OiBTb21lRW50aXR5KTogVWludDhBcnJheSB7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiBjYm9yZy5lbmNvZGUob3JpZ2luYWxFbnRpdHksIHsgdHlwZUVuY29kZXJzOiBjdXN0b21UeXBlRW5jb2RlcnMgfSlcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIltPZmZsaW5lU3RvcmFnZV0gZmFpbGVkIHRvIGVuY29kZSBlbnRpdHkgb2YgdHlwZVwiLCBvcmlnaW5hbEVudGl0eS5fdHlwZSwgXCJ3aXRoIGlkXCIsIG9yaWdpbmFsRW50aXR5Ll9pZClcblx0XHRcdHRocm93IGVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydCB0aGUgdHlwZSBmcm9tIENCT1IgcmVwcmVzZW50YXRpb24gdG8gdGhlIHJ1bnRpbWUgdHlwZVxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBkZXNlcmlhbGl6ZTxUIGV4dGVuZHMgU29tZUVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbG9hZGVkOiBVaW50OEFycmF5KTogUHJvbWlzZTxUIHwgbnVsbD4ge1xuXHRcdGxldCBkZXNlcmlhbGl6ZWRcblx0XHR0cnkge1xuXHRcdFx0ZGVzZXJpYWxpemVkID0gdGhpcy5kZWNvZGVDYm9yRW50aXR5KGxvYWRlZClcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhlKVxuXHRcdFx0Y29uc29sZS5sb2coYEVycm9yIHdpdGggQ0JPUiBkZWNvZGUuIFRyeWluZyB0byBkZWNvZGUgKG9mIHR5cGU6ICR7dHlwZW9mIGxvYWRlZH0pOiAke2xvYWRlZH1gKVxuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cblx0XHRjb25zdCB0eXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZSh0eXBlUmVmKVxuXHRcdHJldHVybiAoYXdhaXQgdGhpcy5maXh1cFR5cGVSZWZzKHR5cGVNb2RlbCwgZGVzZXJpYWxpemVkKSkgYXMgVFxuXHR9XG5cblx0cHJpdmF0ZSBkZWNvZGVDYm9yRW50aXR5KGxvYWRlZDogVWludDhBcnJheSk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcblx0XHRyZXR1cm4gY2JvcmcuZGVjb2RlKGxvYWRlZCwgeyB0YWdzOiBjdXN0b21UeXBlRGVjb2RlcnMgfSlcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgZml4dXBUeXBlUmVmcyh0eXBlTW9kZWw6IFR5cGVNb2RlbCwgZGVzZXJpYWxpemVkOiBhbnkpOiBQcm9taXNlPHVua25vd24+IHtcblx0XHQvLyBUeXBlUmVmIGNhbm5vdCBiZSBkZXNlcmlhbGl6ZWQgYmFjayBhdXRvbWF0aWNhbGx5LiBXZSBjb3VsZCB3cml0ZSBhIGNvZGVjIGZvciBpdCBidXQgd2UgZG9uJ3QgYWN0dWFsbHkgbmVlZCB0byBzdG9yZSBpdCBzbyB3ZSBqdXN0IFwicGF0Y2hcIiBpdC5cblx0XHQvLyBTb21lIHBsYWNlcyByZWx5IG9uIFR5cGVSZWYgYmVpbmcgYSBjbGFzcyBhbmQgbm90IGEgcGxhaW4gb2JqZWN0LlxuXHRcdC8vIFdlIGFsc28gaGF2ZSB0byB1cGRhdGUgYWxsIGFnZ3JlZ2F0ZXMsIHJlY3Vyc2l2ZWx5LlxuXHRcdGRlc2VyaWFsaXplZC5fdHlwZSA9IG5ldyBUeXBlUmVmKHR5cGVNb2RlbC5hcHAsIHR5cGVNb2RlbC5uYW1lKVxuXHRcdGZvciAoY29uc3QgW2Fzc29jaWF0aW9uTmFtZSwgYXNzb2NpYXRpb25Nb2RlbF0gb2YgT2JqZWN0LmVudHJpZXModHlwZU1vZGVsLmFzc29jaWF0aW9ucykpIHtcblx0XHRcdGlmIChhc3NvY2lhdGlvbk1vZGVsLnR5cGUgPT09IEFzc29jaWF0aW9uVHlwZS5BZ2dyZWdhdGlvbikge1xuXHRcdFx0XHRjb25zdCBhZ2dyZWdhdGVUeXBlUmVmID0gbmV3IFR5cGVSZWYoYXNzb2NpYXRpb25Nb2RlbC5kZXBlbmRlbmN5ID8/IHR5cGVNb2RlbC5hcHAsIGFzc29jaWF0aW9uTW9kZWwucmVmVHlwZSlcblx0XHRcdFx0Y29uc3QgYWdncmVnYXRlVHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UoYWdncmVnYXRlVHlwZVJlZilcblx0XHRcdFx0c3dpdGNoIChhc3NvY2lhdGlvbk1vZGVsLmNhcmRpbmFsaXR5KSB7XG5cdFx0XHRcdFx0Y2FzZSBDYXJkaW5hbGl0eS5PbmU6XG5cdFx0XHRcdFx0Y2FzZSBDYXJkaW5hbGl0eS5aZXJvT3JPbmU6IHtcblx0XHRcdFx0XHRcdGNvbnN0IGFnZ3JlZ2F0ZSA9IGRlc2VyaWFsaXplZFthc3NvY2lhdGlvbk5hbWVdXG5cdFx0XHRcdFx0XHRpZiAoYWdncmVnYXRlKSB7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuZml4dXBUeXBlUmVmcyhhZ2dyZWdhdGVUeXBlTW9kZWwsIGFnZ3JlZ2F0ZSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhc2UgQ2FyZGluYWxpdHkuQW55OiB7XG5cdFx0XHRcdFx0XHRjb25zdCBhZ2dyZWdhdGVMaXN0ID0gZGVzZXJpYWxpemVkW2Fzc29jaWF0aW9uTmFtZV1cblx0XHRcdFx0XHRcdGZvciAoY29uc3QgYWdncmVnYXRlIG9mIGFnZ3JlZ2F0ZUxpc3QpIHtcblx0XHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5maXh1cFR5cGVSZWZzKGFnZ3JlZ2F0ZVR5cGVNb2RlbCwgYWdncmVnYXRlKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGRlc2VyaWFsaXplZFxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBkZXNlcmlhbGl6ZUxpc3Q8VCBleHRlbmRzIFNvbWVFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxvYWRlZDogQXJyYXk8VWludDhBcnJheT4pOiBQcm9taXNlPEFycmF5PFQ+PiB7XG5cdFx0Ly8gbWFudWFsbHkgcmVpbXBsZW1lbnRpbmcgcHJvbWlzZU1hcCB0byBtYWtlIHN1cmUgd2UgZG9uJ3QgaGl0IHRoZSBzY2hlZHVsZXIgc2luY2UgdGhlcmUncyBub3RoaW5nIGFjdHVhbGx5IGFzeW5jIGhhcHBlbmluZ1xuXHRcdGNvbnN0IHJlc3VsdDogQXJyYXk8VD4gPSBbXVxuXHRcdGZvciAoY29uc3QgZW50aXR5IG9mIGxvYWRlZCkge1xuXHRcdFx0Y29uc3QgZGVzZXJpYWxpemVkID0gYXdhaXQgdGhpcy5kZXNlcmlhbGl6ZSh0eXBlUmVmLCBlbnRpdHkpXG5cdFx0XHRpZiAoZGVzZXJpYWxpemVkICE9IG51bGwpIHtcblx0XHRcdFx0cmVzdWx0LnB1c2goZGVzZXJpYWxpemVkKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0XG5cdH1cblxuXHQvKipcblx0ICogY29udmVuaWVuY2UgbWV0aG9kIHRvIHJ1biBhIHBvdGVudGlhbGx5IHRvbyBsYXJnZSBxdWVyeSBvdmVyIHNldmVyYWwgY2h1bmtzLlxuXHQgKiBjaHVua1NpemUgbXVzdCBiZSBjaG9zZW4gc3VjaCB0aGF0IHRoZSB0b3RhbCBudW1iZXIgb2YgU1FMIHZhcmlhYmxlcyBpbiB0aGUgZmluYWwgcXVlcnkgZG9lcyBub3QgZXhjZWVkIE1BWF9TQUZFX1NRTF9WQVJTXG5cdCAqICovXG5cdHByaXZhdGUgYXN5bmMgcnVuQ2h1bmtlZChjaHVua1NpemU6IG51bWJlciwgb3JpZ2luYWxMaXN0OiBTcWxWYWx1ZVtdLCBmb3JtYXR0ZXI6IChjaHVuazogU3FsVmFsdWVbXSkgPT4gRm9ybWF0dGVkUXVlcnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRmb3IgKGNvbnN0IGNodW5rIG9mIHNwbGl0SW5DaHVua3MoY2h1bmtTaXplLCBvcmlnaW5hbExpc3QpKSB7XG5cdFx0XHRjb25zdCBmb3JtYXR0ZWRRdWVyeSA9IGZvcm1hdHRlcihjaHVuaylcblx0XHRcdGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLnJ1bihmb3JtYXR0ZWRRdWVyeS5xdWVyeSwgZm9ybWF0dGVkUXVlcnkucGFyYW1zKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBjb252ZW5pZW5jZSBtZXRob2QgdG8gZXhlY3V0ZSBhIHBvdGVudGlhbGx5IHRvbyBsYXJnZSBxdWVyeSBvdmVyIHNldmVyYWwgY2h1bmtzLlxuXHQgKiBjaHVua1NpemUgbXVzdCBiZSBjaG9zZW4gc3VjaCB0aGF0IHRoZSB0b3RhbCBudW1iZXIgb2YgU1FMIHZhcmlhYmxlcyBpbiB0aGUgZmluYWwgcXVlcnkgZG9lcyBub3QgZXhjZWVkIE1BWF9TQUZFX1NRTF9WQVJTXG5cdCAqICovXG5cdHByaXZhdGUgYXN5bmMgYWxsQ2h1bmtlZChcblx0XHRjaHVua1NpemU6IG51bWJlcixcblx0XHRvcmlnaW5hbExpc3Q6IFNxbFZhbHVlW10sXG5cdFx0Zm9ybWF0dGVyOiAoY2h1bms6IFNxbFZhbHVlW10pID0+IEZvcm1hdHRlZFF1ZXJ5LFxuXHQpOiBQcm9taXNlPEFycmF5PFJlY29yZDxzdHJpbmcsIFRhZ2dlZFNxbFZhbHVlPj4+IHtcblx0XHRjb25zdCByZXN1bHQ6IEFycmF5PFJlY29yZDxzdHJpbmcsIFRhZ2dlZFNxbFZhbHVlPj4gPSBbXVxuXHRcdGZvciAoY29uc3QgY2h1bmsgb2Ygc3BsaXRJbkNodW5rcyhjaHVua1NpemUsIG9yaWdpbmFsTGlzdCkpIHtcblx0XHRcdGNvbnN0IGZvcm1hdHRlZFF1ZXJ5ID0gZm9ybWF0dGVyKGNodW5rKVxuXHRcdFx0cmVzdWx0LnB1c2goLi4uKGF3YWl0IHRoaXMuc3FsQ2lwaGVyRmFjYWRlLmFsbChmb3JtYXR0ZWRRdWVyeS5xdWVyeSwgZm9ybWF0dGVkUXVlcnkucGFyYW1zKSkpXG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHRcblx0fVxufVxuXG4vKlxuICogdXNlZCB0byBhdXRvbWF0aWNhbGx5IGNyZWF0ZSB0aGUgcmlnaHQgYW1vdW50IG9mIFNRTCB2YXJpYWJsZXMgZm9yIHNlbGVjdGluZyBpZHMgZnJvbSBhIGR5bmFtaWMgbGlzdC5cbiAqIG11c3QgYmUgdXNlZCB3aXRoaW4gc3FsYDxxdWVyeT5gIHRlbXBsYXRlIHN0cmluZyB0byBpbmxpbmUgdGhlIGxvZ2ljIGludG8gdGhlIHF1ZXJ5LlxuICpcbiAqIEl0IGlzIHZlcnkgaW1wb3J0YW50IHRoYXQgcGFyYW1zIGlzIGtlcHQgdG8gYSBzaXplIHN1Y2ggdGhhdCB0aGUgdG90YWwgYW1vdW50IG9mIFNRTCB2YXJpYWJsZXMgaXNcbiAqIGxlc3MgdGhhbiBNQVhfU0FGRV9TUUxfVkFSUy5cbiAqL1xuZnVuY3Rpb24gcGFyYW1MaXN0KHBhcmFtczogU3FsVmFsdWVbXSk6IFNxbEZyYWdtZW50IHtcblx0Y29uc3QgcXMgPSBwYXJhbXMubWFwKCgpID0+IFwiP1wiKS5qb2luKFwiLFwiKVxuXHRyZXR1cm4gbmV3IFNxbEZyYWdtZW50KGAoJHtxc30pYCwgcGFyYW1zKVxufVxuXG4vKipcbiAqIGNvbXBhcmlzb24gdG8gc2VsZWN0IGlkcyB0aGF0IGFyZSBiaWdnZXIgb3Igc21hbGxlciB0aGFuIGEgcGFyYW1ldGVyIGlkXG4gKiBtdXN0IGJlIHVzZWQgd2l0aGluIHNxbGA8cXVlcnk+YCB0ZW1wbGF0ZSBzdHJpbmcgdG8gaW5saW5lIHRoZSBsb2dpYyBpbnRvIHRoZSBxdWVyeS5cbiAqXG4gKiB3aWxsIGFsd2F5cyBpbnNlcnQgMyBjb25zdGFudHMgYW5kIDMgU1FMIHZhcmlhYmxlcyBpbnRvIHRoZSBxdWVyeS5cbiAqL1xuZnVuY3Rpb24gZmlyc3RJZEJpZ2dlciguLi5hcmdzOiBbc3RyaW5nLCBcImVsZW1lbnRJZFwiXSB8IFtcImVsZW1lbnRJZFwiLCBzdHJpbmddKTogU3FsRnJhZ21lbnQge1xuXHRsZXQgW2wsIHJdOiBbc3RyaW5nLCBzdHJpbmddID0gYXJnc1xuXHRsZXQgdlxuXHRpZiAobCA9PT0gXCJlbGVtZW50SWRcIikge1xuXHRcdHYgPSByXG5cdFx0ciA9IFwiP1wiXG5cdH0gZWxzZSB7XG5cdFx0diA9IGxcblx0XHRsID0gXCI/XCJcblx0fVxuXHRyZXR1cm4gbmV3IFNxbEZyYWdtZW50KGAoQ0FTRSBXSEVOIGxlbmd0aCgke2x9KSA+IGxlbmd0aCgke3J9KSBUSEVOIDEgV0hFTiBsZW5ndGgoJHtsfSkgPCBsZW5ndGgoJHtyfSkgVEhFTiAwIEVMU0UgJHtsfSA+ICR7cn0gRU5EKWAsIFt2LCB2LCB2XSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ3VzdG9tSWRUeXBlKHR5cGVNb2RlbDogVHlwZU1vZGVsKTogYm9vbGVhbiB7XG5cdHJldHVybiB0eXBlTW9kZWwudmFsdWVzLl9pZC50eXBlID09PSBWYWx1ZVR5cGUuQ3VzdG9tSWRcbn1cblxuLyoqXG4gKiBXZSBzdG9yZSBjdXN0b21JZHMgYXMgYmFzZTY0ZXh0IGluIHRoZSBkYiB0byBtYWtlIHRoZW0gc29ydGFibGUsIGJ1dCB3ZSBnZXQgdGhlbSBhcyBiYXNlNjR1cmwgZnJvbSB0aGUgc2VydmVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlQmFzZTY0RXh0KHR5cGVNb2RlbDogVHlwZU1vZGVsLCBlbGVtZW50SWQ6IElkKTogSWQge1xuXHRpZiAoaXNDdXN0b21JZFR5cGUodHlwZU1vZGVsKSkge1xuXHRcdHJldHVybiBiYXNlNjRUb0Jhc2U2NEV4dChiYXNlNjRVcmxUb0Jhc2U2NChlbGVtZW50SWQpKVxuXHR9XG5cdHJldHVybiBlbGVtZW50SWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN1c3RvbUlkVG9CYXNlNjRVcmwodHlwZU1vZGVsOiBUeXBlTW9kZWwsIGVsZW1lbnRJZDogSWQpOiBJZCB7XG5cdGlmIChpc0N1c3RvbUlkVHlwZSh0eXBlTW9kZWwpKSB7XG5cdFx0cmV0dXJuIGJhc2U2NFRvQmFzZTY0VXJsKGJhc2U2NEV4dFRvQmFzZTY0KGVsZW1lbnRJZCkpXG5cdH1cblx0cmV0dXJuIGVsZW1lbnRJZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9mZmxpbmVTdG9yYWdlQ2xlYW5lciB7XG5cdGNsZWFuT2ZmbGluZURiKG9mZmxpbmVTdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSwgdGltZVJhbmdlRGF5czogbnVtYmVyIHwgbnVsbCwgdXNlcklkOiBJZCwgbm93OiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+XG59XG4iLCJpbXBvcnQge1xuXHRDYWNoZU1vZGUsXG5cdEVudGl0eVJlc3RDbGllbnQsXG5cdEVudGl0eVJlc3RDbGllbnRFcmFzZU9wdGlvbnMsXG5cdEVudGl0eVJlc3RDbGllbnRMb2FkT3B0aW9ucyxcblx0RW50aXR5UmVzdENsaWVudFNldHVwT3B0aW9ucyxcblx0RW50aXR5UmVzdEludGVyZmFjZSxcblx0Z2V0Q2FjaGVNb2RlQmVoYXZpb3IsXG5cdE93bmVyRW5jU2Vzc2lvbktleVByb3ZpZGVyLFxufSBmcm9tIFwiLi9FbnRpdHlSZXN0Q2xpZW50XCJcbmltcG9ydCB7IHJlc29sdmVUeXBlUmVmZXJlbmNlIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnRpdHlGdW5jdGlvbnNcIlxuaW1wb3J0IHsgT3BlcmF0aW9uVHlwZSB9IGZyb20gXCIuLi8uLi9jb21tb24vVHV0YW5vdGFDb25zdGFudHNcIlxuaW1wb3J0IHsgYXNzZXJ0Tm90TnVsbCwgZGlmZmVyZW5jZSwgZ2V0Rmlyc3RPclRocm93LCBnZXRUeXBlSWQsIGdyb3VwQnksIGlzU2FtZVR5cGVSZWYsIGxhc3RUaHJvdywgVHlwZVJlZiB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHtcblx0QXVkaXRMb2dFbnRyeVR5cGVSZWYsXG5cdEJ1Y2tldFBlcm1pc3Npb25UeXBlUmVmLFxuXHRFbnRpdHlFdmVudEJhdGNoVHlwZVJlZixcblx0RW50aXR5VXBkYXRlLFxuXHRHcm91cEtleVR5cGVSZWYsXG5cdEtleVJvdGF0aW9uVHlwZVJlZixcblx0UGVybWlzc2lvblR5cGVSZWYsXG5cdFJlY292ZXJDb2RlVHlwZVJlZixcblx0UmVqZWN0ZWRTZW5kZXJUeXBlUmVmLFxuXHRTZWNvbmRGYWN0b3JUeXBlUmVmLFxuXHRTZXNzaW9uVHlwZVJlZixcblx0VXNlcixcblx0VXNlckdyb3VwS2V5RGlzdHJpYnV0aW9uVHlwZVJlZixcblx0VXNlckdyb3VwUm9vdFR5cGVSZWYsXG5cdFVzZXJUeXBlUmVmLFxufSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvc3lzL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IFZhbHVlVHlwZSB9IGZyb20gXCIuLi8uLi9jb21tb24vRW50aXR5Q29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IE5vdEF1dGhvcml6ZWRFcnJvciwgTm90Rm91bmRFcnJvciB9IGZyb20gXCIuLi8uLi9jb21tb24vZXJyb3IvUmVzdEVycm9yXCJcbmltcG9ydCB7IENhbGVuZGFyRXZlbnRVaWRJbmRleFR5cGVSZWYsIE1haWxEZXRhaWxzQmxvYlR5cGVSZWYsIE1haWxTZXRFbnRyeSwgTWFpbFNldEVudHJ5VHlwZVJlZiwgTWFpbFR5cGVSZWYgfSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgQ1VTVE9NX01BWF9JRCwgQ1VTVE9NX01JTl9JRCwgZmlyc3RCaWdnZXJUaGFuU2Vjb25kLCBHRU5FUkFURURfTUFYX0lELCBHRU5FUkFURURfTUlOX0lELCBnZXRFbGVtZW50SWQgfSBmcm9tIFwiLi4vLi4vY29tbW9uL3V0aWxzL0VudGl0eVV0aWxzXCJcbmltcG9ydCB7IFByb2dyYW1taW5nRXJyb3IgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2Vycm9yL1Byb2dyYW1taW5nRXJyb3JcIlxuaW1wb3J0IHsgYXNzZXJ0V29ya2VyT3JOb2RlIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnZcIlxuaW1wb3J0IHR5cGUgeyBMaXN0RWxlbWVudEVudGl0eSwgU29tZUVudGl0eSwgVHlwZU1vZGVsIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnRpdHlUeXBlc1wiXG5pbXBvcnQgeyBRdWV1ZWRCYXRjaCB9IGZyb20gXCIuLi9FdmVudFF1ZXVlLmpzXCJcbmltcG9ydCB7IEVOVElUWV9FVkVOVF9CQVRDSF9FWFBJUkVfTVMgfSBmcm9tIFwiLi4vRXZlbnRCdXNDbGllbnRcIlxuaW1wb3J0IHsgQ3VzdG9tQ2FjaGVIYW5kbGVyTWFwIH0gZnJvbSBcIi4vQ3VzdG9tQ2FjaGVIYW5kbGVyLmpzXCJcbmltcG9ydCB7IGNvbnRhaW5zRXZlbnRPZlR5cGUsIEVudGl0eVVwZGF0ZURhdGEsIGdldEV2ZW50T2ZUeXBlIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi91dGlscy9FbnRpdHlVcGRhdGVVdGlscy5qc1wiXG5pbXBvcnQgeyBpc0N1c3RvbUlkVHlwZSB9IGZyb20gXCIuLi9vZmZsaW5lL09mZmxpbmVTdG9yYWdlLmpzXCJcblxuYXNzZXJ0V29ya2VyT3JOb2RlKClcblxuLyoqXG4gKlxuICogVGhlIG1pbmltdW0gc2l6ZSBvZiBhIHJhbmdlIHJlcXVlc3Qgd2hlbiBleHRlbmRpbmcgYW4gZXhpc3RpbmcgcmFuZ2VcbiAqIEJlY2F1c2Ugd2UgZXh0ZW5kIGJ5IG1ha2luZyAocG90ZW50aWFsbHkpIG1hbnkgcmFuZ2UgcmVxdWVzdHMgdW50aWwgd2UgcmVhY2ggdGhlIHN0YXJ0SWRcbiAqIFdlIHdhbnQgdG8gYXZvaWQgdGhhdCB0aGUgcmVxdWVzdHMgYXJlIHRvbyBzbWFsbFxuICovXG5leHBvcnQgY29uc3QgRVhURU5EX1JBTkdFX01JTl9DSFVOS19TSVpFID0gNDBcbmNvbnN0IElHTk9SRURfVFlQRVMgPSBbXG5cdEVudGl0eUV2ZW50QmF0Y2hUeXBlUmVmLFxuXHRQZXJtaXNzaW9uVHlwZVJlZixcblx0QnVja2V0UGVybWlzc2lvblR5cGVSZWYsXG5cdFNlc3Npb25UeXBlUmVmLFxuXHRTZWNvbmRGYWN0b3JUeXBlUmVmLFxuXHRSZWNvdmVyQ29kZVR5cGVSZWYsXG5cdFJlamVjdGVkU2VuZGVyVHlwZVJlZixcblx0Ly8gd2hlbiBkb2luZyBhdXRvbWF0aWMgY2FsZW5kYXIgdXBkYXRlcywgd2Ugd2lsbCBtaXNzIHVpZCBpbmRleCBlbnRpdHkgdXBkYXRlcyBpZiB3ZSdyZSB1c2luZyB0aGUgY2FjaGUuXG5cdC8vIHRoaXMgaXMgbWFpbmx5IGNhdXNlZCBieSBzb21lIGNhbGVuZGFyaW5nIGFwcHMgc2VuZGluZyB0aGUgc2FtZSB1cGRhdGUgbXVsdGlwbGUgdGltZXMgaW4gdGhlIHNhbWUgbWFpbC5cblx0Ly8gdGhlIGVhcmxpZXN0IHBsYWNlIHdoZXJlIHdlIGNvdWxkIGRlZHVwbGljYXRlIHdvdWxkIGJlIGluIGVudGl0eUV2ZW50c1JlY2VpdmVkIG9uIHRoZSBjYWxlbmRhck1vZGVsLlxuXHRDYWxlbmRhckV2ZW50VWlkSW5kZXhUeXBlUmVmLFxuXHRLZXlSb3RhdGlvblR5cGVSZWYsXG5cdFVzZXJHcm91cFJvb3RUeXBlUmVmLFxuXHRVc2VyR3JvdXBLZXlEaXN0cmlidXRpb25UeXBlUmVmLFxuXHRBdWRpdExvZ0VudHJ5VHlwZVJlZiwgLy8gU2hvdWxkIG5vdCBiZSBwYXJ0IG9mIGNhY2hlZCBkYXRhIGJlY2F1c2UgdGhlcmUgYXJlIGVycm9ycyBpbnNpZGUgZW50aXR5IGV2ZW50IHByb2Nlc3NpbmcgYWZ0ZXIgcm90YXRpbmcgdGhlIGFkbWluIGdyb3VwIGtleVxuXSBhcyBjb25zdFxuXG4vKipcbiAqIExpc3Qgb2YgdHlwZXMgY29udGFpbmluZyBhIGN1c3RvbUlkIHRoYXQgd2Ugd2FudCB0byBleHBsaWNpdGx5IGVuYWJsZSBjYWNoaW5nIGZvci5cbiAqIEN1c3RvbUlkIHR5cGVzIGFyZSBub3QgY2FjaGVkIGJ5IGRlZmF1bHQgYmVjYXVzZSB0aGVpciBpZCBpcyB1c2luZyBiYXNlNjRVcmxFbmNvZGluZyB3aGlsZSBHZW5lcmF0ZWRVSWQgdHlwZXMgYXJlIHVzaW5nIGJhc2U2NEV4dCBlbmNvZGluZy5cbiAqIGJhc2U2NFVybCBlbmNvZGluZyByZXN1bHRzIGluIGEgZGlmZmVyZW50IHNvcnQgb3JkZXIgb2YgZWxlbWVudHMgdGhhdCB3ZSBoYXZlIG9uIHRoZSBzZXJ2ZXIsIHRoaXMgaXMgcHJvYmxlbWF0aWMgZm9yIGNhY2hpbmcgTEVUIGFuZCB0aGVpciByYW5nZXMuXG4gKiBXaGVuIGVuYWJsaW5nIGNhY2hpbmcgZm9yIGN1c3RvbUlkIHR5cGVzIHdlIGNvbnZlcnQgdGhlIGlkIHRoYXQgd2Ugc3RvcmUgaW4gY2FjaGUgZnJvbSBiYXNlNjRVcmwgdG8gYmFzZTY0RXh0IHNvIHdlIGhhdmUgdGhlIHNhbWUgc29ydCBvcmRlci4gKHNlZSBmdW5jdGlvblxuICogT2ZmbGluZVN0b3JhZ2UuZW5zdXJlQmFzZTY0RXh0KS4gSW4gdGhlb3J5LCB3ZSBjYW4gdHJ5IHRvIGVuYWJsZSBjYWNoaW5nIGZvciBhbGwgdHlwZXMgYnV0IGFzIG9mIG5vdyB3ZSBlbmFibGUgaXQgZm9yIGEgbGltaXRlZCBhbW91bnQgb2YgdHlwZXMgYmVjYXVzZSB0aGVyZVxuICogYXJlIG90aGVyIHdheXMgdG8gY2FjaGUgY3VzdG9tSWQgdHlwZXMgKHNlZSBpbXBsZW1lbnRhdGlvbiBvZiBDdXN0b21DYWNoZUhhbmRsZXIpXG4gKi9cbmNvbnN0IENBQ0hFQUJMRV9DVVNUT01JRF9UWVBFUyA9IFtNYWlsU2V0RW50cnlUeXBlUmVmLCBHcm91cEtleVR5cGVSZWZdIGFzIGNvbnN0XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5UmVzdENhY2hlIGV4dGVuZHMgRW50aXR5UmVzdEludGVyZmFjZSB7XG5cdC8qKlxuXHQgKiBDbGVhciBvdXQgdGhlIGNvbnRlbnRzIG9mIHRoZSBjYWNoZS5cblx0ICovXG5cdHB1cmdlU3RvcmFnZSgpOiBQcm9taXNlPHZvaWQ+XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgYmF0Y2ggaWQgb2YgdGhlIG1vc3QgcmVjZW50bHkgcHJvY2Vzc2VkIGJhdGNoIGZvciB0aGUgZ2l2ZW4gZ3JvdXAuXG5cdCAqL1xuXHRnZXRMYXN0RW50aXR5RXZlbnRCYXRjaEZvckdyb3VwKGdyb3VwSWQ6IElkKTogUHJvbWlzZTxJZCB8IG51bGw+XG5cblx0LyoqXG5cdCAqIFNhdmVkIHRoYSBiYXRjaCBpZCBvZiB0aGUgbW9zdCByZWNlbnRseSBwcm9jZXNzZWQgYmF0Y2ggbWFudWFsbHkuXG5cdCAqXG5cdCAqIElzIG5lZWRlZCB3aGVuIHRoZSBjYWNoZSBpcyBuZXcgYnV0IHdlIHdhbnQgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIG5leHQgdGltZSB3ZSB3aWxsIGRvd25sb2FkIGZyb20gdGhpcyBtb21lbnQsIGV2ZW4gaWYgd2UgZG9uJ3QgcmVjZWl2ZSBhbnkgZXZlbnRzLlxuXHQgKi9cblx0c2V0TGFzdEVudGl0eUV2ZW50QmF0Y2hGb3JHcm91cChncm91cElkOiBJZCwgYmF0Y2hJZDogSWQpOiBQcm9taXNlPHZvaWQ+XG5cblx0LyoqXG5cdCAqIFBlcnNpc3QgdGhlIGxhc3QgdGltZSBjbGllbnQgZG93bmxvYWRlZCBldmVudCBiYXRjaGVzLiBUaGlzIGlzIG5vdCB0aGUgbGFzdCAqcHJvY2Vzc2VkKiBpdGVtLCBtZXJlbHkgd2hlbiB0aGluZ3Mgd2VyZSAqZG93bmxvYWRlZCouIFdlIHVzZSBpdCB0b1xuXHQgKiBkZXRlY3Qgb3V0LW9mLXN5bmMuXG5cdCAqL1xuXHRyZWNvcmRTeW5jVGltZSgpOiBQcm9taXNlPHZvaWQ+XG5cblx0LyoqXG5cdCAqIEZldGNoIHRoZSB0aW1lIHNpbmNlIGxhc3QgdGltZSB3ZSBkb3dubG9hZGVkIGV2ZW50IGJhdGNoZXMuXG5cdCAqL1xuXHR0aW1lU2luY2VMYXN0U3luY01zKCk6IFByb21pc2U8bnVtYmVyIHwgbnVsbD5cblxuXHQvKipcblx0ICogRGV0ZWN0IGlmIG91dCBvZiBzeW5jIGJhc2VkIG9uIHN0b3JlZCBcImxhc3RVcGRhdGVUaW1lXCIgYW5kIHRoZSBjdXJyZW50IHNlcnZlciB0aW1lXG5cdCAqL1xuXHRpc091dE9mU3luYygpOiBQcm9taXNlPGJvb2xlYW4+XG59XG5cbmV4cG9ydCB0eXBlIFJhbmdlID0geyBsb3dlcjogSWQ7IHVwcGVyOiBJZCB9XG5cbmV4cG9ydCB0eXBlIExhc3RVcGRhdGVUaW1lID0geyB0eXBlOiBcInJlY29yZGVkXCI7IHRpbWU6IG51bWJlciB9IHwgeyB0eXBlOiBcIm5ldmVyXCIgfSB8IHsgdHlwZTogXCJ1bmluaXRpYWxpemVkXCIgfVxuXG4vKipcbiAqIFBhcnQgb2YgdGhlIGNhY2hlIHN0b3JhZ2Ugb25seSB3aXRoIHN1YnNldCBvZiBDYWNoZVN0b3JhZ2UgZnVuY3Rpb25hbGl0eVxuICpcbiAqIFNlcGFyYXRlIGZyb20gdGhlIHJlc3Qgb2YgdGhlIGNhY2hlIGFzIGEgbmFycm93IGludGVyZmFjZSB0byBub3QgZXhwb3NlIHRoZSB3aG9sZSBzdG9yYWdlIGZvciBjYXNlcyB3aGVyZSB3ZSB3YW50IHRvIG9ubHkgZ2V0IHRoZSBjYWNoZWQgcGFydCBvZiB0aGUgbGlzdCB0b1xuICogZGlzcGxheSBpdCBldmVuIGlmIHdlIGNhbid0IGxvYWQgdGhlIGZ1bGwgcGFnZSBmcm9tIHRoZSBzZXJ2ZXIgb3IgbmVlZCBzb21lIG1ldGFkYXRhLlxuICpcbiAqIGFsc28gZXhwb3NlcyBmdW5jdGlvbnMgdG8gcmVwYWlyIGFuIG91dGRhdGVkIGNhY2hlIGluIGNhc2Ugd2UgY2FuJ3QgYWNjZXNzIHRoZSBzZXJ2ZXIgd2l0aG91dCBnZXR0aW5nIGEgbmV3IHZlcnNpb24gb2YgYSBjYWNoZWQgZW50aXR5XG4gKiAobWFpbmx5IHBhc3N3b3JkIGNoYW5nZXMpXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhwb3NlZENhY2hlU3RvcmFnZSB7XG5cdGdldDxUIGV4dGVuZHMgU29tZUVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCB8IG51bGwsIGlkOiBJZCk6IFByb21pc2U8VCB8IG51bGw+XG5cblx0LyoqXG5cdCAqIExvYWQgcmFuZ2Ugb2YgZW50aXRpZXMuIERvZXMgbm90IGluY2x1ZGUge0BwYXJhbSBzdGFydH0uXG5cdCAqIElmIHtAcGFyYW0gcmV2ZXJzZX0gaXMgZmFsc2UgdGhlbiByZXR1cm5zIGVudGl0aWVzIG5ld2VyIHRoYW4ge0BwYXJhbSBzdGFydH0gaW4gYXNjZW5kaW5nIG9yZGVyIHNvcnRlZCBieVxuXHQgKiBlbGVtZW50SWQuXG5cdCAqIElmIHtAcGFyYW0gcmV2ZXJzZX0gaXMgdHJ1ZSB0aGVuIHJldHVybnMgZW50aXRpZXMgb2xkZXIgdGhhbiB7QHBhcmFtIHN0YXJ0fSBpbiBkZXNjZW5kaW5nIG9yZGVyIHNvcnRlZCBieVxuXHQgKiBlbGVtZW50SWQuXG5cdCAqL1xuXHRwcm92aWRlRnJvbVJhbmdlPFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCwgc3RhcnQ6IElkLCBjb3VudDogbnVtYmVyLCByZXZlcnNlOiBib29sZWFuKTogUHJvbWlzZTxUW10+XG5cblx0LyoqXG5cdCAqIExvYWQgYSBzZXQgb2YgbGlzdCBlbGVtZW50IGVudGl0aWVzIGJ5IGlkLiBNaXNzaW5nIGVsZW1lbnRzIGFyZSBub3QgcmV0dXJuZWQsIG5vIGVycm9yIGlzIHRocm93bi5cblx0ICovXG5cdHByb3ZpZGVNdWx0aXBsZTxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQsIGVsZW1lbnRJZHM6IElkW10pOiBQcm9taXNlPEFycmF5PFQ+PlxuXG5cdC8qKlxuXHQgKiByZXRyaWV2ZSBhbGwgbGlzdCBlbGVtZW50cyB0aGF0IGFyZSBpbiB0aGUgY2FjaGVcblx0ICogQHBhcmFtIHR5cGVSZWZcblx0ICogQHBhcmFtIGxpc3RJZFxuXHQgKi9cblx0Z2V0V2hvbGVMaXN0PFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCk6IFByb21pc2U8QXJyYXk8VD4+XG5cblx0Z2V0TGFzdFVwZGF0ZVRpbWUoKTogUHJvbWlzZTxMYXN0VXBkYXRlVGltZT5cblxuXHRjbGVhckV4Y2x1ZGVkRGF0YSgpOiBQcm9taXNlPHZvaWQ+XG5cblx0LyoqXG5cdCAqIHJlbW92ZSBhbiBFbGVtZW50RW50aXR5IGZyb20gdGhlIGNhY2hlIGJ5IHR5cGVSZWYgYW5kIElkLlxuXHQgKiB0aGUgZXhwb3NlZCBpbnRlcmZhY2UgaXMgaW50ZW50aW9uYWxseSBtb3JlIG5hcnJvdyB0aGFuIHRoZSBpbnRlcm5hbCBjYWNoZVN0b3JhZ2UgYmVjYXVzZVxuXHQgKiB3ZSBtdXN0IG1haW50YWluIHRoZSBpbnRlZ3JpdHkgb2Ygb3VyIGxpc3QgcmFuZ2VzLlxuXHQgKiAqL1xuXHRkZWxldGVJZkV4aXN0czxUIGV4dGVuZHMgU29tZUVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCB8IG51bGwsIGlkOiBJZCk6IFByb21pc2U8dm9pZD5cblxuXHQvKiogZGVsZXRlIGFsbCBpbnN0YW5jZXMgb2YgdGhlIGdpdmVuIHR5cGUgdGhhdCBzaGFyZSB7QHBhcmFtIGxpc3RJZH0uIGFsc28gZGVsZXRlcyB0aGUgcmFuZ2Ugb2YgdGhhdCBsaXN0LiAqL1xuXHRkZWxldGVXaG9sZUxpc3Q8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkKTogUHJvbWlzZTx2b2lkPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENhY2hlU3RvcmFnZSBleHRlbmRzIEV4cG9zZWRDYWNoZVN0b3JhZ2Uge1xuXHQvKipcblx0ICogR2V0IGEgZ2l2ZW4gZW50aXR5IGZyb20gdGhlIGNhY2hlLCBleHBlY3RzIHRoYXQgeW91IGhhdmUgYWxyZWFkeSBjaGVja2VkIGZvciBleGlzdGVuY2Vcblx0ICovXG5cdGdldDxUIGV4dGVuZHMgU29tZUVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCB8IG51bGwsIGlkOiBJZCk6IFByb21pc2U8VCB8IG51bGw+XG5cblx0LyoqXG5cdCAqIGdldCBhIG1hcCB3aXRoIGNhY2hlIGhhbmRsZXJzIGZvciB0aGUgY3VzdG9tSWQgdHlwZXMgdGhpcyBzdG9yYWdlIGltcGxlbWVudGF0aW9uIHN1cHBvcnRzXG5cdCAqIGN1c3RvbUlkIHR5cGVzIHRoYXQgZG9uJ3QgaGF2ZSBhIGN1c3RvbSBoYW5kbGVyIGRvbid0IGdldCBzZXJ2ZWQgZnJvbSB0aGUgY2FjaGVcblx0ICovXG5cdGdldEN1c3RvbUNhY2hlSGFuZGxlck1hcChlbnRpdHlSZXN0Q2xpZW50OiBFbnRpdHlSZXN0Q2xpZW50KTogQ3VzdG9tQ2FjaGVIYW5kbGVyTWFwXG5cblx0aXNFbGVtZW50SWRJbkNhY2hlUmFuZ2U8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkLCBpZDogSWQpOiBQcm9taXNlPGJvb2xlYW4+XG5cblx0cHV0KG9yaWdpbmFsRW50aXR5OiBTb21lRW50aXR5KTogUHJvbWlzZTx2b2lkPlxuXG5cdGdldFJhbmdlRm9yTGlzdDxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQpOiBQcm9taXNlPFJhbmdlIHwgbnVsbD5cblxuXHRzZXRVcHBlclJhbmdlRm9yTGlzdDxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQsIGlkOiBJZCk6IFByb21pc2U8dm9pZD5cblxuXHRzZXRMb3dlclJhbmdlRm9yTGlzdDxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQsIGlkOiBJZCk6IFByb21pc2U8dm9pZD5cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBsaXN0IGNhY2hlIGlmIHRoZXJlIGlzIG5vbmUuIFJlc2V0cyBldmVyeXRoaW5nIGJ1dCBlbGVtZW50cy5cblx0ICogQHBhcmFtIHR5cGVSZWZcblx0ICogQHBhcmFtIGxpc3RJZFxuXHQgKiBAcGFyYW0gbG93ZXJcblx0ICogQHBhcmFtIHVwcGVyXG5cdCAqL1xuXHRzZXROZXdSYW5nZUZvckxpc3Q8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkLCBsb3dlcjogSWQsIHVwcGVyOiBJZCk6IFByb21pc2U8dm9pZD5cblxuXHRnZXRJZHNJblJhbmdlPFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCk6IFByb21pc2U8QXJyYXk8SWQ+PlxuXG5cdC8qKlxuXHQgKiBQZXJzaXN0IHRoZSBsYXN0IHByb2Nlc3NlZCBiYXRjaCBmb3IgYSBnaXZlbiBncm91cCBpZC5cblx0ICovXG5cdHB1dExhc3RCYXRjaElkRm9yR3JvdXAoZ3JvdXBJZDogSWQsIGJhdGNoSWQ6IElkKTogUHJvbWlzZTx2b2lkPlxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSB0aGUgbGVhc3QgcHJvY2Vzc2VkIGJhdGNoIGlkIGZvciBhIGdpdmVuIGdyb3VwLlxuXHQgKi9cblx0Z2V0TGFzdEJhdGNoSWRGb3JHcm91cChncm91cElkOiBJZCk6IFByb21pc2U8SWQgfCBudWxsPlxuXG5cdGRlbGV0ZUlmRXhpc3RzPFQgZXh0ZW5kcyBTb21lRW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkIHwgbnVsbCwgaWQ6IElkKTogUHJvbWlzZTx2b2lkPlxuXG5cdHB1cmdlU3RvcmFnZSgpOiBQcm9taXNlPHZvaWQ+XG5cblx0cHV0TGFzdFVwZGF0ZVRpbWUodmFsdWU6IG51bWJlcik6IFByb21pc2U8dm9pZD5cblxuXHRnZXRVc2VySWQoKTogSWRcblxuXHRkZWxldGVBbGxPd25lZEJ5KG93bmVyOiBJZCk6IFByb21pc2U8dm9pZD5cblxuXHQvKipcblx0ICogV2Ugd2FudCB0byBsb2NrIHRoZSBhY2Nlc3MgdG8gdGhlIFwicmFuZ2VzXCIgZGIgd2hlbiB1cGRhdGluZyAvIHJlYWRpbmcgdGhlXG5cdCAqIG9mZmxpbmUgYXZhaWxhYmxlIG1haWwgbGlzdCByYW5nZXMgZm9yIGVhY2ggbWFpbCBsaXN0IChyZWZlcmVuY2VkIHVzaW5nIHRoZSBsaXN0SWQpXG5cdCAqIEBwYXJhbSBsaXN0SWQgdGhlIG1haWwgbGlzdCB0aGF0IHdlIHdhbnQgdG8gbG9ja1xuXHQgKi9cblx0bG9ja1Jhbmdlc0RiQWNjZXNzKGxpc3RJZDogSWQpOiBQcm9taXNlPHZvaWQ+XG5cblx0LyoqXG5cdCAqIFRoaXMgaXMgdGhlIGNvdW50ZXJwYXJ0IHRvIHRoZSBmdW5jdGlvbiBcImxvY2tSYW5nZXNEYkFjY2VzcyhsaXN0SWQpXCJcblx0ICogQHBhcmFtIGxpc3RJZCB0aGUgbWFpbCBsaXN0IHRoYXQgd2Ugd2FudCB0byB1bmxvY2tcblx0ICovXG5cdHVubG9ja1Jhbmdlc0RiQWNjZXNzKGxpc3RJZDogSWQpOiBQcm9taXNlPHZvaWQ+XG59XG5cbi8qKlxuICogVGhpcyBpbXBsZW1lbnRhdGlvbiBwcm92aWRlcyBhIGNhY2hpbmcgbWVjaGFuaXNtIHRvIHRoZSByZXN0IGNoYWluLlxuICogSXQgZm9yd2FyZHMgcmVxdWVzdHMgdG8gdGhlIGVudGl0eSByZXN0IGNsaWVudC5cbiAqIFRoZSBjYWNoZSB3b3JrcyBhcyBmb2xsb3dzOlxuICogSWYgYSByZWFkIGZyb20gdGhlIHRhcmdldCBmYWlscywgdGhlIHJlcXVlc3QgZmFpbHMuXG4gKiBJZiBhIHJlYWQgZnJvbSB0aGUgdGFyZ2V0IGlzIHN1Y2Nlc3NmdWwsIHRoZSBjYWNoZSBpcyB3cml0dGVuIGFuZCB0aGUgZWxlbWVudCByZXR1cm5lZC5cbiAqIEZvciBMRVRzIHRoZSBjYWNoZSBzdG9yZXMgb25lIHJhbmdlIHBlciBsaXN0IGlkLiBpZiBhIHJhbmdlIGlzIHJlcXVlc3RlZCBzdGFydGluZyBpbiB0aGUgc3RvcmVkIHJhbmdlIG9yIGF0IHRoZSByYW5nZSBlbmRzIHRoZSBtaXNzaW5nIGVsZW1lbnRzIGFyZSBsb2FkZWQgZnJvbSB0aGUgc2VydmVyLlxuICogT25seSByYW5nZXMgd2l0aCBlbGVtZW50cyB3aXRoIGdlbmVyYXRlZCBpZHMgYXJlIHN0b3JlZCBpbiB0aGUgY2FjaGUuIEN1c3RvbSBpZCBlbGVtZW50cyBhcmUgb25seSBzdG9yZWQgYXMgc2luZ2xlIGVsZW1lbnQgY3VycmVudGx5LiBJZiBuZWVkZWQgdGhpcyBoYXMgdG8gYmUgZXh0ZW5kZWQgZm9yIHJhbmdlcy5cbiAqIFJhbmdlIHJlcXVlc3RzIHN0YXJ0aW5nIG91dHNpZGUgdGhlIHN0b3JlZCByYW5nZSBhcmUgb25seSBhbGxvd2VkIGlmIHRoZSBkaXJlY3Rpb24gaXMgYXdheSBmcm9tIHRoZSBzdG9yZWQgcmFuZ2UuIEluIHRoaXMgY2FzZSB3ZSBsb2FkIGZyb20gdGhlIHJhbmdlIGVuZCB0byBhdm9pZCBnYXBzIGluIHRoZSBzdG9yZWQgcmFuZ2UuXG4gKiBSZXF1ZXN0cyBmb3IgY3JlYXRpbmcgb3IgdXBkYXRpbmcgZWxlbWVudHMgYXJlIGFsd2F5cyBmb3J3YXJkZWQgYW5kIG5vdCBkaXJlY3RseSBzdG9yZWQgaW4gdGhlIGNhY2hlLlxuICogT24gRXZlbnRCdXNDbGllbnQgbm90aWZpY2F0aW9ucyB1cGRhdGVkIGVsZW1lbnRzIGFyZSBzdG9yZWQgaW4gdGhlIGNhY2hlIGlmIHRoZSBlbGVtZW50IGFscmVhZHkgZXhpc3RzIGluIHRoZSBjYWNoZS5cbiAqIE9uIEV2ZW50QnVzQ2xpZW50IG5vdGlmaWNhdGlvbnMgbmV3IGVsZW1lbnRzIGFyZSBvbmx5IHN0b3JlZCBpbiB0aGUgY2FjaGUgaWYgdGhleSBhcmUgTEVUcyBhbmQgaW4gdGhlIHN0b3JlZCByYW5nZS5cbiAqIE9uIEV2ZW50QnVzQ2xpZW50IG5vdGlmaWNhdGlvbnMgZGVsZXRlZCBlbGVtZW50cyBhcmUgcmVtb3ZlZCBmcm9tIHRoZSBjYWNoZS5cbiAqXG4gKiBSYW5nZSBoYW5kbGluZzpcbiAqIHwgICAgICAgICAgPHw+ICAgICAgICBjIGQgZSBmIGcgaCBpIGogayAgICAgIDx8PiAgICAgICAgICAgICB8XG4gKiBNSU5fSUQgIGxvd2VyUmFuZ2VJZCAgICAgaWRzIGluIHJhbmdlICAgIHVwcGVyUmFuZ2VJZCAgICBNQVhfSURcbiAqIGxvd2VyUmFuZ2VJZCBtYXkgYmUgYW55dGhpbmcgZnJvbSBNSU5fSUQgdG8gYywgdXBwZXJSYW5nZUlkIG1heSBiZSBhbnl0aGluZyBmcm9tIGsgdG8gTUFYX0lEXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWZhdWx0RW50aXR5UmVzdENhY2hlIGltcGxlbWVudHMgRW50aXR5UmVzdENhY2hlIHtcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBlbnRpdHlSZXN0Q2xpZW50OiBFbnRpdHlSZXN0Q2xpZW50LCBwcml2YXRlIHJlYWRvbmx5IHN0b3JhZ2U6IENhY2hlU3RvcmFnZSkge31cblxuXHRhc3luYyBsb2FkPFQgZXh0ZW5kcyBTb21lRW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBpZDogUHJvcGVydHlUeXBlPFQsIFwiX2lkXCI+LCBvcHRzOiBFbnRpdHlSZXN0Q2xpZW50TG9hZE9wdGlvbnMgPSB7fSk6IFByb21pc2U8VD4ge1xuXHRcdGNvbnN0IHVzZUNhY2hlID0gYXdhaXQgdGhpcy5zaG91bGRVc2VDYWNoZSh0eXBlUmVmLCBvcHRzKVxuXHRcdGlmICghdXNlQ2FjaGUpIHtcblx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmVudGl0eVJlc3RDbGllbnQubG9hZCh0eXBlUmVmLCBpZCwgb3B0cylcblx0XHR9XG5cblx0XHRjb25zdCB7IGxpc3RJZCwgZWxlbWVudElkIH0gPSBleHBhbmRJZChpZClcblx0XHRjb25zdCBjYWNoaW5nQmVoYXZpb3IgPSBnZXRDYWNoZU1vZGVCZWhhdmlvcihvcHRzLmNhY2hlTW9kZSlcblx0XHRjb25zdCBjYWNoZWRFbnRpdHkgPSBjYWNoaW5nQmVoYXZpb3IucmVhZHNGcm9tQ2FjaGUgPyBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0KHR5cGVSZWYsIGxpc3RJZCwgZWxlbWVudElkKSA6IG51bGxcblxuXHRcdGlmIChjYWNoZWRFbnRpdHkgPT0gbnVsbCkge1xuXHRcdFx0Y29uc3QgZW50aXR5ID0gYXdhaXQgdGhpcy5lbnRpdHlSZXN0Q2xpZW50LmxvYWQodHlwZVJlZiwgaWQsIG9wdHMpXG5cdFx0XHRpZiAoY2FjaGluZ0JlaGF2aW9yLndyaXRlc1RvQ2FjaGUpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5zdG9yYWdlLnB1dChlbnRpdHkpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZW50aXR5XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNhY2hlZEVudGl0eVxuXHR9XG5cblx0YXN5bmMgbG9hZE11bHRpcGxlPFQgZXh0ZW5kcyBTb21lRW50aXR5Pihcblx0XHR0eXBlUmVmOiBUeXBlUmVmPFQ+LFxuXHRcdGxpc3RJZDogSWQgfCBudWxsLFxuXHRcdGlkczogQXJyYXk8SWQ+LFxuXHRcdG93bmVyRW5jU2Vzc2lvbktleVByb3ZpZGVyPzogT3duZXJFbmNTZXNzaW9uS2V5UHJvdmlkZXIsXG5cdFx0b3B0czogRW50aXR5UmVzdENsaWVudExvYWRPcHRpb25zID0ge30sXG5cdCk6IFByb21pc2U8QXJyYXk8VD4+IHtcblx0XHRjb25zdCB1c2VDYWNoZSA9IGF3YWl0IHRoaXMuc2hvdWxkVXNlQ2FjaGUodHlwZVJlZiwgb3B0cylcblx0XHRpZiAoIXVzZUNhY2hlKSB7XG5cdFx0XHRyZXR1cm4gYXdhaXQgdGhpcy5lbnRpdHlSZXN0Q2xpZW50LmxvYWRNdWx0aXBsZSh0eXBlUmVmLCBsaXN0SWQsIGlkcywgb3duZXJFbmNTZXNzaW9uS2V5UHJvdmlkZXIsIG9wdHMpXG5cdFx0fVxuXHRcdHJldHVybiBhd2FpdCB0aGlzLl9sb2FkTXVsdGlwbGUodHlwZVJlZiwgbGlzdElkLCBpZHMsIG93bmVyRW5jU2Vzc2lvbktleVByb3ZpZGVyLCBvcHRzKVxuXHR9XG5cblx0c2V0dXA8VCBleHRlbmRzIFNvbWVFbnRpdHk+KGxpc3RJZDogSWQgfCBudWxsLCBpbnN0YW5jZTogVCwgZXh0cmFIZWFkZXJzPzogRGljdCwgb3B0aW9ucz86IEVudGl0eVJlc3RDbGllbnRTZXR1cE9wdGlvbnMpOiBQcm9taXNlPElkPiB7XG5cdFx0cmV0dXJuIHRoaXMuZW50aXR5UmVzdENsaWVudC5zZXR1cChsaXN0SWQsIGluc3RhbmNlLCBleHRyYUhlYWRlcnMsIG9wdGlvbnMpXG5cdH1cblxuXHRzZXR1cE11bHRpcGxlPFQgZXh0ZW5kcyBTb21lRW50aXR5PihsaXN0SWQ6IElkIHwgbnVsbCwgaW5zdGFuY2VzOiBBcnJheTxUPik6IFByb21pc2U8QXJyYXk8SWQ+PiB7XG5cdFx0cmV0dXJuIHRoaXMuZW50aXR5UmVzdENsaWVudC5zZXR1cE11bHRpcGxlKGxpc3RJZCwgaW5zdGFuY2VzKVxuXHR9XG5cblx0dXBkYXRlPFQgZXh0ZW5kcyBTb21lRW50aXR5PihpbnN0YW5jZTogVCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLmVudGl0eVJlc3RDbGllbnQudXBkYXRlKGluc3RhbmNlKVxuXHR9XG5cblx0ZXJhc2U8VCBleHRlbmRzIFNvbWVFbnRpdHk+KGluc3RhbmNlOiBULCBvcHRpb25zPzogRW50aXR5UmVzdENsaWVudEVyYXNlT3B0aW9ucyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLmVudGl0eVJlc3RDbGllbnQuZXJhc2UoaW5zdGFuY2UsIG9wdGlvbnMpXG5cdH1cblxuXHRnZXRMYXN0RW50aXR5RXZlbnRCYXRjaEZvckdyb3VwKGdyb3VwSWQ6IElkKTogUHJvbWlzZTxJZCB8IG51bGw+IHtcblx0XHRyZXR1cm4gdGhpcy5zdG9yYWdlLmdldExhc3RCYXRjaElkRm9yR3JvdXAoZ3JvdXBJZClcblx0fVxuXG5cdHNldExhc3RFbnRpdHlFdmVudEJhdGNoRm9yR3JvdXAoZ3JvdXBJZDogSWQsIGJhdGNoSWQ6IElkKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRoaXMuc3RvcmFnZS5wdXRMYXN0QmF0Y2hJZEZvckdyb3VwKGdyb3VwSWQsIGJhdGNoSWQpXG5cdH1cblxuXHRwdXJnZVN0b3JhZ2UoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc29sZS5sb2coXCJQdXJnaW5nIHRoZSB1c2VyJ3Mgb2ZmbGluZSBkYXRhYmFzZVwiKVxuXHRcdHJldHVybiB0aGlzLnN0b3JhZ2UucHVyZ2VTdG9yYWdlKClcblx0fVxuXG5cdGFzeW5jIGlzT3V0T2ZTeW5jKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IHRpbWVTaW5jZUxhc3RTeW5jID0gYXdhaXQgdGhpcy50aW1lU2luY2VMYXN0U3luY01zKClcblx0XHRyZXR1cm4gdGltZVNpbmNlTGFzdFN5bmMgIT0gbnVsbCAmJiB0aW1lU2luY2VMYXN0U3luYyA+IEVOVElUWV9FVkVOVF9CQVRDSF9FWFBJUkVfTVNcblx0fVxuXG5cdGFzeW5jIHJlY29yZFN5bmNUaW1lKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHRpbWVzdGFtcCA9IHRoaXMuZ2V0U2VydmVyVGltZXN0YW1wTXMoKVxuXHRcdGF3YWl0IHRoaXMuc3RvcmFnZS5wdXRMYXN0VXBkYXRlVGltZSh0aW1lc3RhbXApXG5cdH1cblxuXHRhc3luYyB0aW1lU2luY2VMYXN0U3luY01zKCk6IFByb21pc2U8bnVtYmVyIHwgbnVsbD4ge1xuXHRcdGNvbnN0IGxhc3RVcGRhdGUgPSBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0TGFzdFVwZGF0ZVRpbWUoKVxuXHRcdGxldCBsYXN0VXBkYXRlVGltZTogbnVtYmVyXG5cdFx0c3dpdGNoIChsYXN0VXBkYXRlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJyZWNvcmRlZFwiOlxuXHRcdFx0XHRsYXN0VXBkYXRlVGltZSA9IGxhc3RVcGRhdGUudGltZVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBcIm5ldmVyXCI6XG5cdFx0XHRcdHJldHVybiBudWxsXG5cdFx0XHRjYXNlIFwidW5pbml0aWFsaXplZFwiOlxuXHRcdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcIk9mZmxpbmUgc3RvcmFnZSBpcyBub3QgaW5pdGlhbGl6ZWRcIilcblx0XHR9XG5cdFx0Y29uc3Qgbm93ID0gdGhpcy5nZXRTZXJ2ZXJUaW1lc3RhbXBNcygpXG5cdFx0cmV0dXJuIG5vdyAtIGxhc3RVcGRhdGVUaW1lXG5cdH1cblxuXHRwcml2YXRlIGdldFNlcnZlclRpbWVzdGFtcE1zKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuZW50aXR5UmVzdENsaWVudC5nZXRSZXN0Q2xpZW50KCkuZ2V0U2VydmVyVGltZXN0YW1wTXMoKVxuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZSBhIGNhY2hlZCBlbnRpdHkuIFNvbWV0aW1lcyB0aGlzIGlzIG5lY2Vzc2FyeSB0byBkbyB0byBlbnN1cmUgeW91IGFsd2F5cyBsb2FkIHRoZSBuZXcgdmVyc2lvblxuXHQgKi9cblx0ZGVsZXRlRnJvbUNhY2hlSWZFeGlzdHM8VCBleHRlbmRzIFNvbWVFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQgfCBudWxsLCBlbGVtZW50SWQ6IElkKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRoaXMuc3RvcmFnZS5kZWxldGVJZkV4aXN0cyh0eXBlUmVmLCBsaXN0SWQsIGVsZW1lbnRJZClcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgX2xvYWRNdWx0aXBsZTxUIGV4dGVuZHMgU29tZUVudGl0eT4oXG5cdFx0dHlwZVJlZjogVHlwZVJlZjxUPixcblx0XHRsaXN0SWQ6IElkIHwgbnVsbCxcblx0XHRpZHM6IEFycmF5PElkPixcblx0XHRvd25lckVuY1Nlc3Npb25LZXlQcm92aWRlcj86IE93bmVyRW5jU2Vzc2lvbktleVByb3ZpZGVyLFxuXHRcdG9wdHM6IEVudGl0eVJlc3RDbGllbnRMb2FkT3B0aW9ucyA9IHt9LFxuXHQpOiBQcm9taXNlPEFycmF5PFQ+PiB7XG5cdFx0Y29uc3QgY2FjaGluZ0JlaGF2aW9yID0gZ2V0Q2FjaGVNb2RlQmVoYXZpb3Iob3B0cy5jYWNoZU1vZGUpXG5cdFx0Y29uc3QgZW50aXRpZXNJbkNhY2hlOiBUW10gPSBbXVxuXG5cdFx0bGV0IGlkc1RvTG9hZDogSWRbXVxuXHRcdGlmIChjYWNoaW5nQmVoYXZpb3IucmVhZHNGcm9tQ2FjaGUpIHtcblx0XHRcdGlkc1RvTG9hZCA9IFtdXG5cdFx0XHRmb3IgKGNvbnN0IGlkIG9mIGlkcykge1xuXHRcdFx0XHRjb25zdCBjYWNoZWRFbnRpdHkgPSBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0KHR5cGVSZWYsIGxpc3RJZCwgaWQpXG5cdFx0XHRcdGlmIChjYWNoZWRFbnRpdHkgIT0gbnVsbCkge1xuXHRcdFx0XHRcdGVudGl0aWVzSW5DYWNoZS5wdXNoKGNhY2hlZEVudGl0eSlcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZHNUb0xvYWQucHVzaChpZClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZHNUb0xvYWQgPSBpZHNcblx0XHR9XG5cblx0XHRpZiAoaWRzVG9Mb2FkLmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IGVudGl0aWVzRnJvbVNlcnZlciA9IGF3YWl0IHRoaXMuZW50aXR5UmVzdENsaWVudC5sb2FkTXVsdGlwbGUodHlwZVJlZiwgbGlzdElkLCBpZHNUb0xvYWQsIG93bmVyRW5jU2Vzc2lvbktleVByb3ZpZGVyLCBvcHRzKVxuXHRcdFx0aWYgKGNhY2hpbmdCZWhhdmlvci53cml0ZXNUb0NhY2hlKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgZW50aXR5IG9mIGVudGl0aWVzRnJvbVNlcnZlcikge1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMuc3RvcmFnZS5wdXQoZW50aXR5KVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZW50aXRpZXNGcm9tU2VydmVyLmNvbmNhdChlbnRpdGllc0luQ2FjaGUpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBlbnRpdGllc0luQ2FjaGVcblx0XHR9XG5cdH1cblxuXHRhc3luYyBsb2FkUmFuZ2U8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pihcblx0XHR0eXBlUmVmOiBUeXBlUmVmPFQ+LFxuXHRcdGxpc3RJZDogSWQsXG5cdFx0c3RhcnQ6IElkLFxuXHRcdGNvdW50OiBudW1iZXIsXG5cdFx0cmV2ZXJzZTogYm9vbGVhbixcblx0XHRvcHRzOiBFbnRpdHlSZXN0Q2xpZW50TG9hZE9wdGlvbnMgPSB7fSxcblx0KTogUHJvbWlzZTxUW10+IHtcblx0XHRjb25zdCBjdXN0b21IYW5kbGVyID0gdGhpcy5zdG9yYWdlLmdldEN1c3RvbUNhY2hlSGFuZGxlck1hcCh0aGlzLmVudGl0eVJlc3RDbGllbnQpLmdldCh0eXBlUmVmKVxuXHRcdGlmIChjdXN0b21IYW5kbGVyICYmIGN1c3RvbUhhbmRsZXIubG9hZFJhbmdlKSB7XG5cdFx0XHRyZXR1cm4gYXdhaXQgY3VzdG9tSGFuZGxlci5sb2FkUmFuZ2UodGhpcy5zdG9yYWdlLCBsaXN0SWQsIHN0YXJ0LCBjb3VudCwgcmV2ZXJzZSlcblx0XHR9XG5cblx0XHRjb25zdCB0eXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZSh0eXBlUmVmKVxuXHRcdGNvbnN0IHVzZUNhY2hlID0gKGF3YWl0IHRoaXMuc2hvdWxkVXNlQ2FjaGUodHlwZVJlZiwgb3B0cykpICYmIGlzQ2FjaGVkUmFuZ2VUeXBlKHR5cGVNb2RlbCwgdHlwZVJlZilcblxuXHRcdGlmICghdXNlQ2FjaGUpIHtcblx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmVudGl0eVJlc3RDbGllbnQubG9hZFJhbmdlKHR5cGVSZWYsIGxpc3RJZCwgc3RhcnQsIGNvdW50LCByZXZlcnNlLCBvcHRzKVxuXHRcdH1cblxuXHRcdGNvbnN0IGJlaGF2aW9yID0gZ2V0Q2FjaGVNb2RlQmVoYXZpb3Iob3B0cy5jYWNoZU1vZGUpXG5cdFx0aWYgKCFiZWhhdmlvci5yZWFkc0Zyb21DYWNoZSkge1xuXHRcdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoXCJjYW5ub3Qgd3JpdGUgdG8gY2FjaGUgd2l0aG91dCByZWFkaW5nIHdpdGggcmFuZ2UgcmVxdWVzdHNcIilcblx0XHR9XG5cblx0XHQvLyBXZSBsb2NrIGFjY2VzcyB0byB0aGUgXCJyYW5nZXNcIiBkYiBoZXJlIGluIG9yZGVyIHRvIHByZXZlbnQgcmFjZSBjb25kaXRpb25zIHdoZW4gYWNjZXNzaW5nIHRoZSByYW5nZXMgZGF0YWJhc2UuXG5cdFx0YXdhaXQgdGhpcy5zdG9yYWdlLmxvY2tSYW5nZXNEYkFjY2VzcyhsaXN0SWQpXG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcmFuZ2UgPSBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0UmFuZ2VGb3JMaXN0KHR5cGVSZWYsIGxpc3RJZClcblxuXHRcdFx0aWYgKGJlaGF2aW9yLndyaXRlc1RvQ2FjaGUpIHtcblx0XHRcdFx0aWYgKHJhbmdlID09IG51bGwpIHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBvcHVsYXRlTmV3TGlzdFdpdGhSYW5nZSh0eXBlUmVmLCBsaXN0SWQsIHN0YXJ0LCBjb3VudCwgcmV2ZXJzZSwgb3B0cylcblx0XHRcdFx0fSBlbHNlIGlmIChpc1N0YXJ0SWRXaXRoaW5SYW5nZShyYW5nZSwgc3RhcnQsIHR5cGVNb2RlbCkpIHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLmV4dGVuZEZyb21XaXRoaW5SYW5nZSh0eXBlUmVmLCBsaXN0SWQsIHN0YXJ0LCBjb3VudCwgcmV2ZXJzZSwgb3B0cylcblx0XHRcdFx0fSBlbHNlIGlmIChpc1JhbmdlUmVxdWVzdEF3YXlGcm9tRXhpc3RpbmdSYW5nZShyYW5nZSwgcmV2ZXJzZSwgc3RhcnQsIHR5cGVNb2RlbCkpIHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLmV4dGVuZEF3YXlGcm9tUmFuZ2UodHlwZVJlZiwgbGlzdElkLCBzdGFydCwgY291bnQsIHJldmVyc2UsIG9wdHMpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5leHRlbmRUb3dhcmRzUmFuZ2UodHlwZVJlZiwgbGlzdElkLCBzdGFydCwgY291bnQsIHJldmVyc2UsIG9wdHMpXG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGF3YWl0IHRoaXMuc3RvcmFnZS5wcm92aWRlRnJvbVJhbmdlKHR5cGVSZWYsIGxpc3RJZCwgc3RhcnQsIGNvdW50LCByZXZlcnNlKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKHJhbmdlICYmIGlzU3RhcnRJZFdpdGhpblJhbmdlKHJhbmdlLCBzdGFydCwgdHlwZU1vZGVsKSkge1xuXHRcdFx0XHRcdGNvbnN0IHByb3ZpZGVkID0gYXdhaXQgdGhpcy5zdG9yYWdlLnByb3ZpZGVGcm9tUmFuZ2UodHlwZVJlZiwgbGlzdElkLCBzdGFydCwgY291bnQsIHJldmVyc2UpXG5cdFx0XHRcdFx0Y29uc3QgeyBuZXdTdGFydCwgbmV3Q291bnQgfSA9IGF3YWl0IHRoaXMucmVjYWxjdWxhdGVSYW5nZVJlcXVlc3QodHlwZVJlZiwgbGlzdElkLCBzdGFydCwgY291bnQsIHJldmVyc2UpXG5cdFx0XHRcdFx0Y29uc3QgbmV3RWxlbWVudHMgPSBuZXdDb3VudCA+IDAgPyBhd2FpdCB0aGlzLmVudGl0eVJlc3RDbGllbnQubG9hZFJhbmdlKHR5cGVSZWYsIGxpc3RJZCwgbmV3U3RhcnQsIG5ld0NvdW50LCByZXZlcnNlKSA6IFtdXG5cdFx0XHRcdFx0cmV0dXJuIHByb3ZpZGVkLmNvbmNhdChuZXdFbGVtZW50cylcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBTaW5jZSBvdXIgc3RhcnRpbmcgSUQgaXMgbm90IGluIG91ciByYW5nZSwgd2UgY2FuJ3QgdXNlIHRoZSBjYWNoZSBiZWNhdXNlIHdlIGRvbid0IGtub3cgZXhhY3RseSB3aGF0XG5cdFx0XHRcdFx0Ly8gZWxlbWVudHMgYXJlIG1pc3NpbmcuXG5cdFx0XHRcdFx0Ly9cblx0XHRcdFx0XHQvLyBUaGlzIGNhbiByZXN1bHQgaW4gdXMgcmUtcmV0cmlldmluZyBlbGVtZW50cyB3ZSBhbHJlYWR5IGhhdmUuIFNpbmNlIHdlIGFueXdheSBtdXN0IGRvIGEgcmVxdWVzdCxcblx0XHRcdFx0XHQvLyB0aGlzIGlzIGZpbmUuXG5cdFx0XHRcdFx0cmV0dXJuIGF3YWl0IHRoaXMuZW50aXR5UmVzdENsaWVudC5sb2FkUmFuZ2UodHlwZVJlZiwgbGlzdElkLCBzdGFydCwgY291bnQsIHJldmVyc2UsIG9wdHMpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0Ly8gV2UgdW5sb2NrIGFjY2VzcyB0byB0aGUgXCJyYW5nZXNcIiBkYiBoZXJlLiBXZSBsb2NrIGl0IGluIG9yZGVyIHRvIHByZXZlbnQgcmFjZSBjb25kaXRpb25zIHdoZW4gYWNjZXNzaW5nIHRoZSBcInJhbmdlc1wiIGRhdGFiYXNlLlxuXHRcdFx0YXdhaXQgdGhpcy5zdG9yYWdlLnVubG9ja1Jhbmdlc0RiQWNjZXNzKGxpc3RJZClcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBsaXN0IHJhbmdlLCByZWFkaW5nIGV2ZXJ5dGhpbmcgZnJvbSB0aGUgc2VydmVyIHRoYXQgaXQgY2FuXG5cdCAqIHJhbmdlOiAgICAgICAgIChub25lKVxuXHQgKiByZXF1ZXN0OiAgICAgICAqLS0tLS0tLS0tPlxuXHQgKiByYW5nZSBiZWNvbWVzOiB8LS0tLS0tLS0tfFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBwb3B1bGF0ZU5ld0xpc3RXaXRoUmFuZ2U8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pihcblx0XHR0eXBlUmVmOiBUeXBlUmVmPFQ+LFxuXHRcdGxpc3RJZDogSWQsXG5cdFx0c3RhcnQ6IElkLFxuXHRcdGNvdW50OiBudW1iZXIsXG5cdFx0cmV2ZXJzZTogYm9vbGVhbixcblx0XHRvcHRzOiBFbnRpdHlSZXN0Q2xpZW50TG9hZE9wdGlvbnMsXG5cdCkge1xuXHRcdC8vIENyZWF0ZSBhIG5ldyByYW5nZSBhbmQgbG9hZCBldmVyeXRoaW5nXG5cdFx0Y29uc3QgZW50aXRpZXMgPSBhd2FpdCB0aGlzLmVudGl0eVJlc3RDbGllbnQubG9hZFJhbmdlKHR5cGVSZWYsIGxpc3RJZCwgc3RhcnQsIGNvdW50LCByZXZlcnNlLCBvcHRzKVxuXG5cdFx0Ly8gSW5pdGlhbGl6ZSBhIG5ldyByYW5nZSBmb3IgdGhpcyBsaXN0XG5cdFx0YXdhaXQgdGhpcy5zdG9yYWdlLnNldE5ld1JhbmdlRm9yTGlzdCh0eXBlUmVmLCBsaXN0SWQsIHN0YXJ0LCBzdGFydClcblxuXHRcdC8vIFRoZSByYW5nZSBib3VuZHMgd2lsbCBiZSB1cGRhdGVkIGluIGhlcmVcblx0XHRhd2FpdCB0aGlzLnVwZGF0ZVJhbmdlSW5TdG9yYWdlKHR5cGVSZWYsIGxpc3RJZCwgY291bnQsIHJldmVyc2UsIGVudGl0aWVzKVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgcGFydCBvZiBhIHJlcXVlc3QgZnJvbSB0aGUgY2FjaGUsIGFuZCB0aGUgcmVtYWluZGVyIGlzIGxvYWRlZCBmcm9tIHRoZSBzZXJ2ZXJcblx0ICogcmFuZ2U6ICAgICAgICAgIHwtLS0tLS0tLS18XG5cdCAqIHJlcXVlc3Q6ICAgICAgICAgICAgICotLS0tLS0tLS0tLS0tLT5cblx0ICogcmFuZ2UgYmVjb21lczogfC0tLS0tLS0tLS0tLS0tLS0tLS0tfFxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBleHRlbmRGcm9tV2l0aGluUmFuZ2U8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pihcblx0XHR0eXBlUmVmOiBUeXBlUmVmPFQ+LFxuXHRcdGxpc3RJZDogSWQsXG5cdFx0c3RhcnQ6IElkLFxuXHRcdGNvdW50OiBudW1iZXIsXG5cdFx0cmV2ZXJzZTogYm9vbGVhbixcblx0XHRvcHRzOiBFbnRpdHlSZXN0Q2xpZW50TG9hZE9wdGlvbnMsXG5cdCkge1xuXHRcdGNvbnN0IHsgbmV3U3RhcnQsIG5ld0NvdW50IH0gPSBhd2FpdCB0aGlzLnJlY2FsY3VsYXRlUmFuZ2VSZXF1ZXN0KHR5cGVSZWYsIGxpc3RJZCwgc3RhcnQsIGNvdW50LCByZXZlcnNlKVxuXHRcdGlmIChuZXdDb3VudCA+IDApIHtcblx0XHRcdC8vIFdlIHdpbGwgYmUgYWJsZSB0byBwcm92aWRlIHNvbWUgZW50aXRpZXMgZnJvbSB0aGUgY2FjaGUsIHNvIHdlIGp1c3Qgd2FudCB0byBsb2FkIHRoZSByZW1haW5pbmcgZW50aXRpZXMgZnJvbSB0aGUgc2VydmVyXG5cdFx0XHRjb25zdCBlbnRpdGllcyA9IGF3YWl0IHRoaXMuZW50aXR5UmVzdENsaWVudC5sb2FkUmFuZ2UodHlwZVJlZiwgbGlzdElkLCBuZXdTdGFydCwgbmV3Q291bnQsIHJldmVyc2UsIG9wdHMpXG5cdFx0XHRhd2FpdCB0aGlzLnVwZGF0ZVJhbmdlSW5TdG9yYWdlKHR5cGVSZWYsIGxpc3RJZCwgbmV3Q291bnQsIHJldmVyc2UsIGVudGl0aWVzKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTdGFydCB3YXMgb3V0c2lkZSB0aGUgcmFuZ2UsIGFuZCB3ZSBhcmUgbG9hZGluZyBhd2F5IGZyb20gdGhlIHJhbmdlXG5cdCAqIEtlZXBzIGxvYWRpbmcgZWxlbWVudHMgZnJvbSB0aGUgZW5kIG9mIHRoZSByYW5nZSBpbiB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzdGFydElkLlxuXHQgKiBSZXR1cm5zIG9uY2UgYWxsIGF2YWlsYWJsZSBlbGVtZW50cyBoYXZlIGJlZW4gbG9hZGVkIG9yIHRoZSByZXF1ZXN0ZWQgbnVtYmVyIGlzIGluIGNhY2hlXG5cdCAqIHJhbmdlOiAgICAgICAgICB8LS0tLS0tLS0tfFxuXHQgKiByZXF1ZXN0OiAgICAgICAgICAgICAgICAgICAgICotLS0tLS0tPlxuXHQgKiByYW5nZSBiZWNvbWVzOiAgfC0tLS0tLS0tLS0tLS0tLS0tLS0tfFxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBleHRlbmRBd2F5RnJvbVJhbmdlPFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4oXG5cdFx0dHlwZVJlZjogVHlwZVJlZjxUPixcblx0XHRsaXN0SWQ6IElkLFxuXHRcdHN0YXJ0OiBJZCxcblx0XHRjb3VudDogbnVtYmVyLFxuXHRcdHJldmVyc2U6IGJvb2xlYW4sXG5cdFx0b3B0czogRW50aXR5UmVzdENsaWVudExvYWRPcHRpb25zLFxuXHQpIHtcblx0XHQvLyBTdGFydCBpcyBvdXRzaWRlIHRoZSByYW5nZSwgYW5kIHdlIGFyZSBsb2FkaW5nIGF3YXkgZnJvbSB0aGUgcmFuZ2UsIHNvIHdlIGdyb3cgdW50aWwgd2UgYXJlIGFibGUgdG8gcHJvdmlkZSBlbm91Z2hcblx0XHQvLyBlbnRpdGllcyBzdGFydGluZyBhdCBzdGFydElkXG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdGNvbnN0IHJhbmdlID0gYXNzZXJ0Tm90TnVsbChhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0UmFuZ2VGb3JMaXN0KHR5cGVSZWYsIGxpc3RJZCkpXG5cblx0XHRcdC8vIFdoaWNoIGVuZCBvZiB0aGUgcmFuZ2UgdG8gc3RhcnQgbG9hZGluZyBmcm9tXG5cdFx0XHRjb25zdCBsb2FkU3RhcnRJZCA9IHJldmVyc2UgPyByYW5nZS5sb3dlciA6IHJhbmdlLnVwcGVyXG5cblx0XHRcdGNvbnN0IHJlcXVlc3RDb3VudCA9IE1hdGgubWF4KGNvdW50LCBFWFRFTkRfUkFOR0VfTUlOX0NIVU5LX1NJWkUpXG5cblx0XHRcdC8vIExvYWQgc29tZSBlbnRpdGllc1xuXHRcdFx0Y29uc3QgZW50aXRpZXMgPSBhd2FpdCB0aGlzLmVudGl0eVJlc3RDbGllbnQubG9hZFJhbmdlKHR5cGVSZWYsIGxpc3RJZCwgbG9hZFN0YXJ0SWQsIHJlcXVlc3RDb3VudCwgcmV2ZXJzZSwgb3B0cylcblx0XHRcdGF3YWl0IHRoaXMudXBkYXRlUmFuZ2VJblN0b3JhZ2UodHlwZVJlZiwgbGlzdElkLCByZXF1ZXN0Q291bnQsIHJldmVyc2UsIGVudGl0aWVzKVxuXG5cdFx0XHQvLyBJZiB3ZSBleGhhdXN0ZWQgdGhlIGVudGl0aWVzIGZyb20gdGhlIHNlcnZlclxuXHRcdFx0aWYgKGVudGl0aWVzLmxlbmd0aCA8IHJlcXVlc3RDb3VudCkge1xuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBUcnkgdG8gZ2V0IGVub3VnaCBlbnRpdGllcyBmcm9tIGNhY2hlXG5cdFx0XHRjb25zdCBlbnRpdGllc0Zyb21DYWNoZSA9IGF3YWl0IHRoaXMuc3RvcmFnZS5wcm92aWRlRnJvbVJhbmdlKHR5cGVSZWYsIGxpc3RJZCwgc3RhcnQsIGNvdW50LCByZXZlcnNlKVxuXG5cdFx0XHQvLyBJZiBjYWNoZSBpcyBub3cgY2FwYWJsZSBvZiBwcm92aWRpbmcgdGhlIHdob2xlIHJlcXVlc3Rcblx0XHRcdGlmIChlbnRpdGllc0Zyb21DYWNoZS5sZW5ndGggPT09IGNvdW50KSB7XG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIExvYWRzIGFsbCBlbGVtZW50cyBmcm9tIHRoZSBzdGFydElkIGluIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHJhbmdlXG5cdCAqIE9uY2UgY29tcGxldGUsIHJldHVybnMgYXMgbWFueSBlbGVtZW50cyBhcyBpdCBjYW4gZnJvbSB0aGUgb3JpZ2luYWwgcmVxdWVzdFxuXHQgKiByYW5nZTogICAgICAgICB8LS0tLS0tLS0tfFxuXHQgKiByZXF1ZXN0OiAgICAgICAgICAgICAgICAgICAgIDwtLS0tLS0qXG5cdCAqIHJhbmdlIGJlY29tZXM6IHwtLS0tLS0tLS0tLS0tLS0tLS0tLXxcblx0ICogb3Jcblx0ICogcmFuZ2U6ICAgICAgICAgICAgICB8LS0tLS0tLS0tfFxuXHQgKiByZXF1ZXN0OiAgICAgICA8LS0tLS0tLS0tLS0tLS0tLS0tLSpcblx0ICogcmFuZ2UgYmVjb21lczogfC0tLS0tLS0tLS0tLS0tLS0tLS0tfFxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBleHRlbmRUb3dhcmRzUmFuZ2U8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pihcblx0XHR0eXBlUmVmOiBUeXBlUmVmPFQ+LFxuXHRcdGxpc3RJZDogSWQsXG5cdFx0c3RhcnQ6IElkLFxuXHRcdGNvdW50OiBudW1iZXIsXG5cdFx0cmV2ZXJzZTogYm9vbGVhbixcblx0XHRvcHRzOiBFbnRpdHlSZXN0Q2xpZW50TG9hZE9wdGlvbnMsXG5cdCkge1xuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRjb25zdCByYW5nZSA9IGFzc2VydE5vdE51bGwoYXdhaXQgdGhpcy5zdG9yYWdlLmdldFJhbmdlRm9yTGlzdCh0eXBlUmVmLCBsaXN0SWQpKVxuXG5cdFx0XHRjb25zdCBsb2FkU3RhcnRJZCA9IHJldmVyc2UgPyByYW5nZS51cHBlciA6IHJhbmdlLmxvd2VyXG5cblx0XHRcdGNvbnN0IHJlcXVlc3RDb3VudCA9IE1hdGgubWF4KGNvdW50LCBFWFRFTkRfUkFOR0VfTUlOX0NIVU5LX1NJWkUpXG5cblx0XHRcdGNvbnN0IGVudGl0aWVzID0gYXdhaXQgdGhpcy5lbnRpdHlSZXN0Q2xpZW50LmxvYWRSYW5nZSh0eXBlUmVmLCBsaXN0SWQsIGxvYWRTdGFydElkLCByZXF1ZXN0Q291bnQsICFyZXZlcnNlLCBvcHRzKVxuXG5cdFx0XHRhd2FpdCB0aGlzLnVwZGF0ZVJhbmdlSW5TdG9yYWdlKHR5cGVSZWYsIGxpc3RJZCwgcmVxdWVzdENvdW50LCAhcmV2ZXJzZSwgZW50aXRpZXMpXG5cblx0XHRcdC8vIFRoZSBjYWxsIHRvIGB1cGRhdGVSYW5nZUluU3RvcmFnZWAgd2lsbCBoYXZlIHNldCB0aGUgcmFuZ2UgYm91bmRzIHRvIEdFTkVSQVRFRF9NSU5fSUQvR0VORVJBVEVEX01BWF9JRFxuXHRcdFx0Ly8gaW4gdGhlIGNhc2UgdGhhdCB3ZSBoYXZlIGV4aGF1c3RlZCBhbGwgZWxlbWVudHMgZnJvbSB0aGUgc2VydmVyLCBzbyBpZiB0aGF0IGhhcHBlbnMsIHdlIHdpbGwgYWxzbyBlbmQgdXAgYnJlYWtpbmcgaGVyZVxuXHRcdFx0aWYgKGF3YWl0IHRoaXMuc3RvcmFnZS5pc0VsZW1lbnRJZEluQ2FjaGVSYW5nZSh0eXBlUmVmLCBsaXN0SWQsIHN0YXJ0KSkge1xuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGF3YWl0IHRoaXMuZXh0ZW5kRnJvbVdpdGhpblJhbmdlKHR5cGVSZWYsIGxpc3RJZCwgc3RhcnQsIGNvdW50LCByZXZlcnNlLCBvcHRzKVxuXHR9XG5cblx0LyoqXG5cdCAqIEdpdmVuIHRoZSBwYXJhbWV0ZXJzIGFuZCByZXN1bHQgb2YgYSByYW5nZSByZXF1ZXN0LFxuXHQgKiBJbnNlcnRzIHRoZSByZXN1bHQgaW50byBzdG9yYWdlLCBhbmQgdXBkYXRlcyB0aGUgcmFuZ2UgYm91bmRzXG5cdCAqIGJhc2VkIG9uIG51bWJlciBvZiBlbnRpdGllcyByZXF1ZXN0ZWQgYW5kIHRoZSBhY3R1YWwgYW1vdW50IHRoYXQgd2VyZSByZWNlaXZlZFxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyB1cGRhdGVSYW5nZUluU3RvcmFnZTxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KFxuXHRcdHR5cGVSZWY6IFR5cGVSZWY8VD4sXG5cdFx0bGlzdElkOiBJZCxcblx0XHRjb3VudFJlcXVlc3RlZDogbnVtYmVyLFxuXHRcdHdhc1JldmVyc2VSZXF1ZXN0OiBib29sZWFuLFxuXHRcdHJlY2VpdmVkRW50aXRpZXM6IFRbXSxcblx0KSB7XG5cdFx0Y29uc3QgaXNDdXN0b21JZCA9IGlzQ3VzdG9tSWRUeXBlKGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGVSZWYpKVxuXHRcdGxldCBlbGVtZW50c1RvQWRkID0gcmVjZWl2ZWRFbnRpdGllc1xuXHRcdGlmICh3YXNSZXZlcnNlUmVxdWVzdCkge1xuXHRcdFx0Ly8gRW5zdXJlIHRoYXQgZWxlbWVudHMgYXJlIGNhY2hlZCBpbiBhc2NlbmRpbmcgKG5vdCByZXZlcnNlKSBvcmRlclxuXHRcdFx0ZWxlbWVudHNUb0FkZCA9IHJlY2VpdmVkRW50aXRpZXMucmV2ZXJzZSgpXG5cdFx0XHRpZiAocmVjZWl2ZWRFbnRpdGllcy5sZW5ndGggPCBjb3VudFJlcXVlc3RlZCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcImZpbmlzaGVkIGxvYWRpbmcsIHNldHRpbmcgbWluIGlkXCIpXG5cdFx0XHRcdGF3YWl0IHRoaXMuc3RvcmFnZS5zZXRMb3dlclJhbmdlRm9yTGlzdCh0eXBlUmVmLCBsaXN0SWQsIGlzQ3VzdG9tSWQgPyBDVVNUT01fTUlOX0lEIDogR0VORVJBVEVEX01JTl9JRClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIEFmdGVyIHJldmVyc2luZyB0aGUgbGlzdCB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgbGlzdCBpcyB0aGUgbG93ZXIgcmFuZ2UgbGltaXRcblx0XHRcdFx0YXdhaXQgdGhpcy5zdG9yYWdlLnNldExvd2VyUmFuZ2VGb3JMaXN0KHR5cGVSZWYsIGxpc3RJZCwgZ2V0RWxlbWVudElkKGdldEZpcnN0T3JUaHJvdyhyZWNlaXZlZEVudGl0aWVzKSkpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIExhc3QgZWxlbWVudCBpbiB0aGUgbGlzdCBpcyB0aGUgdXBwZXIgcmFuZ2UgbGltaXRcblx0XHRcdGlmIChyZWNlaXZlZEVudGl0aWVzLmxlbmd0aCA8IGNvdW50UmVxdWVzdGVkKSB7XG5cdFx0XHRcdC8vIGFsbCBlbGVtZW50cyBoYXZlIGJlZW4gbG9hZGVkLCBzbyB0aGUgdXBwZXIgcmFuZ2UgbXVzdCBiZSBzZXQgdG8gTUFYX0lEXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiZmluaXNoZWQgbG9hZGluZywgc2V0dGluZyBtYXggaWRcIilcblx0XHRcdFx0YXdhaXQgdGhpcy5zdG9yYWdlLnNldFVwcGVyUmFuZ2VGb3JMaXN0KHR5cGVSZWYsIGxpc3RJZCwgaXNDdXN0b21JZCA/IENVU1RPTV9NQVhfSUQgOiBHRU5FUkFURURfTUFYX0lEKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5zdG9yYWdlLnNldFVwcGVyUmFuZ2VGb3JMaXN0KHR5cGVSZWYsIGxpc3RJZCwgZ2V0RWxlbWVudElkKGxhc3RUaHJvdyhyZWNlaXZlZEVudGl0aWVzKSkpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwoZWxlbWVudHNUb0FkZC5tYXAoKGVsZW1lbnQpID0+IHRoaXMuc3RvcmFnZS5wdXQoZWxlbWVudCkpKVxuXHR9XG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgdGhlIG5ldyBzdGFydCB2YWx1ZSBmb3IgdGhlIGdldEVsZW1lbnRSYW5nZSByZXF1ZXN0IGFuZCB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIHRvIHJlYWQgaW5cblx0ICogb3JkZXIgdG8gcmVhZCBubyBkdXBsaWNhdGUgdmFsdWVzLlxuXHQgKiBAcmV0dXJuIHJldHVybnMgdGhlIG5ldyBzdGFydCBhbmQgY291bnQgdmFsdWUuIEltcG9ydGFudDogY291bnQgY2FuIGJlIG5lZ2F0aXZlIGlmIGV2ZXJ5dGhpbmcgaXMgY2FjaGVkXG5cdCAqL1xuXHRwcml2YXRlIGFzeW5jIHJlY2FsY3VsYXRlUmFuZ2VSZXF1ZXN0PFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4oXG5cdFx0dHlwZVJlZjogVHlwZVJlZjxUPixcblx0XHRsaXN0SWQ6IElkLFxuXHRcdHN0YXJ0OiBJZCxcblx0XHRjb3VudDogbnVtYmVyLFxuXHRcdHJldmVyc2U6IGJvb2xlYW4sXG5cdCk6IFByb21pc2U8eyBuZXdTdGFydDogc3RyaW5nOyBuZXdDb3VudDogbnVtYmVyIH0+IHtcblx0XHRsZXQgYWxsUmFuZ2VMaXN0ID0gYXdhaXQgdGhpcy5zdG9yYWdlLmdldElkc0luUmFuZ2UodHlwZVJlZiwgbGlzdElkKVxuXHRcdGxldCBlbGVtZW50c1RvUmVhZCA9IGNvdW50XG5cdFx0bGV0IHN0YXJ0RWxlbWVudElkID0gc3RhcnRcblx0XHRjb25zdCByYW5nZSA9IGF3YWl0IHRoaXMuc3RvcmFnZS5nZXRSYW5nZUZvckxpc3QodHlwZVJlZiwgbGlzdElkKVxuXHRcdGlmIChyYW5nZSA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4geyBuZXdTdGFydDogc3RhcnQsIG5ld0NvdW50OiBjb3VudCB9XG5cdFx0fVxuXHRcdGNvbnN0IHsgbG93ZXIsIHVwcGVyIH0gPSByYW5nZVxuXHRcdGxldCBpbmRleE9mU3RhcnQgPSBhbGxSYW5nZUxpc3QuaW5kZXhPZihzdGFydClcblxuXHRcdGNvbnN0IHR5cGVNb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGVSZWYpXG5cdFx0Y29uc3QgaXNDdXN0b21JZCA9IGlzQ3VzdG9tSWRUeXBlKHR5cGVNb2RlbClcblx0XHRpZiAoXG5cdFx0XHQoIXJldmVyc2UgJiYgKGlzQ3VzdG9tSWQgPyB1cHBlciA9PT0gQ1VTVE9NX01BWF9JRCA6IHVwcGVyID09PSBHRU5FUkFURURfTUFYX0lEKSkgfHxcblx0XHRcdChyZXZlcnNlICYmIChpc0N1c3RvbUlkID8gbG93ZXIgPT09IENVU1RPTV9NSU5fSUQgOiBsb3dlciA9PT0gR0VORVJBVEVEX01JTl9JRCkpXG5cdFx0KSB7XG5cdFx0XHQvLyB3ZSBoYXZlIGFscmVhZHkgbG9hZGVkIHRoZSBjb21wbGV0ZSByYW5nZSBpbiB0aGUgZGVzaXJlZCBkaXJlY3Rpb24sIHNvIHdlIGRvIG5vdCBoYXZlIHRvIGxvYWQgZnJvbSBzZXJ2ZXJcblx0XHRcdGVsZW1lbnRzVG9SZWFkID0gMFxuXHRcdH0gZWxzZSBpZiAoYWxsUmFuZ2VMaXN0Lmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0Ly8gRWxlbWVudCByYW5nZSBpcyBlbXB0eSwgc28gcmVhZCBhbGwgZWxlbWVudHNcblx0XHRcdGVsZW1lbnRzVG9SZWFkID0gY291bnRcblx0XHR9IGVsc2UgaWYgKGluZGV4T2ZTdGFydCAhPT0gLTEpIHtcblx0XHRcdC8vIFN0YXJ0IGVsZW1lbnQgaXMgbG9jYXRlZCBpbiBhbGxSYW5nZSByZWFkIG9ubHkgZWxlbWVudHMgdGhhdCBhcmUgbm90IGluIGFsbFJhbmdlLlxuXHRcdFx0aWYgKHJldmVyc2UpIHtcblx0XHRcdFx0ZWxlbWVudHNUb1JlYWQgPSBjb3VudCAtIGluZGV4T2ZTdGFydFxuXHRcdFx0XHRzdGFydEVsZW1lbnRJZCA9IGFsbFJhbmdlTGlzdFswXSAvLyB1c2UgdGhlIGxvd2VzdCBpZCBpbiBhbGxSYW5nZSBhcyBzdGFydCBlbGVtZW50XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRlbGVtZW50c1RvUmVhZCA9IGNvdW50IC0gKGFsbFJhbmdlTGlzdC5sZW5ndGggLSAxIC0gaW5kZXhPZlN0YXJ0KVxuXHRcdFx0XHRzdGFydEVsZW1lbnRJZCA9IGFsbFJhbmdlTGlzdFthbGxSYW5nZUxpc3QubGVuZ3RoIC0gMV0gLy8gdXNlIHRoZSAgaGlnaGVzdCBpZCBpbiBhbGxSYW5nZSBhcyBzdGFydCBlbGVtZW50XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChsb3dlciA9PT0gc3RhcnQgfHwgKGZpcnN0QmlnZ2VyVGhhblNlY29uZChzdGFydCwgbG93ZXIsIHR5cGVNb2RlbCkgJiYgZmlyc3RCaWdnZXJUaGFuU2Vjb25kKGFsbFJhbmdlTGlzdFswXSwgc3RhcnQsIHR5cGVNb2RlbCkpKSB7XG5cdFx0XHQvLyBTdGFydCBlbGVtZW50IGlzIG5vdCBpbiBhbGxSYW5nZSBidXQgaGFzIGJlZW4gdXNlZCBoYXMgc3RhcnQgZWxlbWVudCBmb3IgYSByYW5nZSByZXF1ZXN0LCBlZy4gRW50aXR5UmVzdEludGVyZmFjZS5HRU5FUkFURURfTUlOX0lELCBvciBzdGFydCBpcyBiZXR3ZWVuIGxvd2VyIHJhbmdlIGlkIGFuZCBsb3dlc3QgZWxlbWVudCBpbiByYW5nZVxuXHRcdFx0aWYgKCFyZXZlcnNlKSB7XG5cdFx0XHRcdC8vIGlmIG5vdCByZXZlcnNlIHJlYWQgb25seSBlbGVtZW50cyB0aGF0IGFyZSBub3QgaW4gYWxsUmFuZ2Vcblx0XHRcdFx0c3RhcnRFbGVtZW50SWQgPSBhbGxSYW5nZUxpc3RbYWxsUmFuZ2VMaXN0Lmxlbmd0aCAtIDFdIC8vIHVzZSB0aGUgIGhpZ2hlc3QgaWQgaW4gYWxsUmFuZ2UgYXMgc3RhcnQgZWxlbWVudFxuXHRcdFx0XHRlbGVtZW50c1RvUmVhZCA9IGNvdW50IC0gYWxsUmFuZ2VMaXN0Lmxlbmd0aFxuXHRcdFx0fVxuXHRcdFx0Ly8gaWYgcmV2ZXJzZSByZWFkIGFsbCBlbGVtZW50c1xuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHR1cHBlciA9PT0gc3RhcnQgfHxcblx0XHRcdChmaXJzdEJpZ2dlclRoYW5TZWNvbmQoc3RhcnQsIGFsbFJhbmdlTGlzdFthbGxSYW5nZUxpc3QubGVuZ3RoIC0gMV0sIHR5cGVNb2RlbCkgJiYgZmlyc3RCaWdnZXJUaGFuU2Vjb25kKHVwcGVyLCBzdGFydCwgdHlwZU1vZGVsKSlcblx0XHQpIHtcblx0XHRcdC8vIFN0YXJ0IGVsZW1lbnQgaXMgbm90IGluIGFsbFJhbmdlIGJ1dCBoYXMgYmVlbiB1c2VkIGhhcyBzdGFydCBlbGVtZW50IGZvciBhIHJhbmdlIHJlcXVlc3QsIGVnLiBFbnRpdHlSZXN0SW50ZXJmYWNlLkdFTkVSQVRFRF9NQVhfSUQsIG9yIHN0YXJ0IGlzIGJldHdlZW4gdXBwZXIgcmFuZ2UgaWQgYW5kIGhpZ2hlc3QgZWxlbWVudCBpbiByYW5nZVxuXHRcdFx0aWYgKHJldmVyc2UpIHtcblx0XHRcdFx0Ly8gaWYgbm90IHJldmVyc2UgcmVhZCBvbmx5IGVsZW1lbnRzIHRoYXQgYXJlIG5vdCBpbiBhbGxSYW5nZVxuXHRcdFx0XHRzdGFydEVsZW1lbnRJZCA9IGFsbFJhbmdlTGlzdFswXSAvLyB1c2UgdGhlICBoaWdoZXN0IGlkIGluIGFsbFJhbmdlIGFzIHN0YXJ0IGVsZW1lbnRcblx0XHRcdFx0ZWxlbWVudHNUb1JlYWQgPSBjb3VudCAtIGFsbFJhbmdlTGlzdC5sZW5ndGhcblx0XHRcdH1cblx0XHRcdC8vIGlmIG5vdCByZXZlcnNlIHJlYWQgYWxsIGVsZW1lbnRzXG5cdFx0fVxuXHRcdHJldHVybiB7IG5ld1N0YXJ0OiBzdGFydEVsZW1lbnRJZCwgbmV3Q291bnQ6IGVsZW1lbnRzVG9SZWFkIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyB3aGVuIHRoZSBlbnRpdHkgaXMgbG9hZGVkIGZyb20gdGhlIHNlcnZlciBpZiBuZWNlc3Nhcnlcblx0ICogQHByZSBUaGUgbGFzdCBjYWxsIG9mIHRoaXMgZnVuY3Rpb24gbXVzdCBiZSByZXNvbHZlZC4gVGhpcyBpcyBuZWVkZWQgdG8gYXZvaWQgdGhhdCBlLmcuIHdoaWxlXG5cdCAqIGxvYWRpbmcgYSBjcmVhdGVkIGluc3RhbmNlIGZyb20gdGhlIHNlcnZlciB3ZSByZWNlaXZlIGFuIHVwZGF0ZSBvZiB0aGF0IGluc3RhbmNlIGFuZCBpZ25vcmUgaXQgYmVjYXVzZSB0aGUgaW5zdGFuY2UgaXMgbm90IGluIHRoZSBjYWNoZSB5ZXQuXG5cdCAqXG5cdCAqIEByZXR1cm4gUHJvbWlzZSwgd2hpY2ggcmVzb2x2ZXMgdG8gdGhlIGFycmF5IG9mIHZhbGlkIGV2ZW50cyAoaWYgcmVzcG9uc2UgaXMgTm90Rm91bmQgb3IgTm90QXV0aG9yaXplZCB3ZSBmaWx0ZXIgaXQgb3V0KVxuXHQgKi9cblx0YXN5bmMgZW50aXR5RXZlbnRzUmVjZWl2ZWQoYmF0Y2g6IFF1ZXVlZEJhdGNoKTogUHJvbWlzZTxBcnJheTxFbnRpdHlVcGRhdGU+PiB7XG5cdFx0YXdhaXQgdGhpcy5yZWNvcmRTeW5jVGltZSgpXG5cblx0XHQvLyB3ZSBoYW5kbGUgcG9zdCBtdWx0aXBsZSBjcmVhdGUgb3BlcmF0aW9ucyBzZXBhcmF0ZWx5IHRvIG9wdGltaXplIHRoZSBudW1iZXIgb2YgcmVxdWVzdHMgd2l0aCBnZXRNdWx0aXBsZVxuXHRcdGNvbnN0IGNyZWF0ZVVwZGF0ZXNGb3JMRVRzOiBFbnRpdHlVcGRhdGVbXSA9IFtdXG5cdFx0Y29uc3QgcmVndWxhclVwZGF0ZXM6IEVudGl0eVVwZGF0ZVtdID0gW10gLy8gYWxsIHVwZGF0ZXMgbm90IHJlc3VsdGluZyBmcm9tIHBvc3QgbXVsdGlwbGUgcmVxdWVzdHNcblx0XHRjb25zdCB1cGRhdGVzQXJyYXkgPSBiYXRjaC5ldmVudHNcblx0XHRmb3IgKGNvbnN0IHVwZGF0ZSBvZiB1cGRhdGVzQXJyYXkpIHtcblx0XHRcdGNvbnN0IHR5cGVSZWYgPSBuZXcgVHlwZVJlZih1cGRhdGUuYXBwbGljYXRpb24sIHVwZGF0ZS50eXBlKVxuXG5cdFx0XHQvLyBtb25pdG9yIGFwcGxpY2F0aW9uIGlzIGlnbm9yZWRcblx0XHRcdGlmICh1cGRhdGUuYXBwbGljYXRpb24gPT09IFwibW9uaXRvclwiKSBjb250aW51ZVxuXHRcdFx0Ly8gbWFpbFNldEVudHJpZXMgYXJlIGlnbm9yZWQgYmVjYXVzZSBtb3ZlIG9wZXJhdGlvbnMgYXJlIGhhbmRsZWQgYXMgYSBzcGVjaWFsIGV2ZW50IChhbmQgbm8gcG9zdCBtdWx0aXBsZSBpcyBwb3NzaWJsZSlcblx0XHRcdGlmIChcblx0XHRcdFx0dXBkYXRlLm9wZXJhdGlvbiA9PT0gT3BlcmF0aW9uVHlwZS5DUkVBVEUgJiZcblx0XHRcdFx0Z2V0VXBkYXRlSW5zdGFuY2VJZCh1cGRhdGUpLmluc3RhbmNlTGlzdElkICE9IG51bGwgJiZcblx0XHRcdFx0IWlzU2FtZVR5cGVSZWYodHlwZVJlZiwgTWFpbFR5cGVSZWYpICYmXG5cdFx0XHRcdCFpc1NhbWVUeXBlUmVmKHR5cGVSZWYsIE1haWxTZXRFbnRyeVR5cGVSZWYpXG5cdFx0XHQpIHtcblx0XHRcdFx0Y3JlYXRlVXBkYXRlc0ZvckxFVHMucHVzaCh1cGRhdGUpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZWd1bGFyVXBkYXRlcy5wdXNoKHVwZGF0ZSlcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBjcmVhdGVVcGRhdGVzRm9yTEVUc1Blckxpc3QgPSBncm91cEJ5KGNyZWF0ZVVwZGF0ZXNGb3JMRVRzLCAodXBkYXRlKSA9PiB1cGRhdGUuaW5zdGFuY2VMaXN0SWQpXG5cblx0XHRjb25zdCBwb3N0TXVsdGlwbGVFdmVudFVwZGF0ZXM6IEVudGl0eVVwZGF0ZVtdW10gPSBbXVxuXHRcdC8vIHdlIGZpcnN0IGhhbmRsZSBwb3RlbnRpYWwgcG9zdCBtdWx0aXBsZSB1cGRhdGVzIGluIGdldCBtdWx0aXBsZSByZXF1ZXN0c1xuXHRcdGZvciAobGV0IFtpbnN0YW5jZUxpc3RJZCwgdXBkYXRlc10gb2YgY3JlYXRlVXBkYXRlc0ZvckxFVHNQZXJMaXN0KSB7XG5cdFx0XHRjb25zdCBmaXJzdFVwZGF0ZSA9IHVwZGF0ZXNbMF1cblx0XHRcdGNvbnN0IHR5cGVSZWYgPSBuZXcgVHlwZVJlZjxMaXN0RWxlbWVudEVudGl0eT4oZmlyc3RVcGRhdGUuYXBwbGljYXRpb24sIGZpcnN0VXBkYXRlLnR5cGUpXG5cdFx0XHRjb25zdCBpZHMgPSB1cGRhdGVzLm1hcCgodXBkYXRlKSA9PiB1cGRhdGUuaW5zdGFuY2VJZClcblxuXHRcdFx0Ly8gV2Ugb25seSB3YW50IHRvIGxvYWQgdGhlIGluc3RhbmNlcyB0aGF0IGFyZSBpbiBjYWNoZSByYW5nZVxuXHRcdFx0Y29uc3QgY3VzdG9tSGFuZGxlciA9IHRoaXMuc3RvcmFnZS5nZXRDdXN0b21DYWNoZUhhbmRsZXJNYXAodGhpcy5lbnRpdHlSZXN0Q2xpZW50KS5nZXQodHlwZVJlZilcblx0XHRcdGNvbnN0IGlkc0luQ2FjaGVSYW5nZSA9XG5cdFx0XHRcdGN1c3RvbUhhbmRsZXIgJiYgY3VzdG9tSGFuZGxlci5nZXRFbGVtZW50SWRzSW5DYWNoZVJhbmdlXG5cdFx0XHRcdFx0PyBhd2FpdCBjdXN0b21IYW5kbGVyLmdldEVsZW1lbnRJZHNJbkNhY2hlUmFuZ2UodGhpcy5zdG9yYWdlLCBpbnN0YW5jZUxpc3RJZCwgaWRzKVxuXHRcdFx0XHRcdDogYXdhaXQgdGhpcy5nZXRFbGVtZW50SWRzSW5DYWNoZVJhbmdlKHR5cGVSZWYsIGluc3RhbmNlTGlzdElkLCBpZHMpXG5cblx0XHRcdGlmIChpZHNJbkNhY2hlUmFuZ2UubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdHBvc3RNdWx0aXBsZUV2ZW50VXBkYXRlcy5wdXNoKHVwZGF0ZXMpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCB1cGRhdGVzTm90SW5DYWNoZVJhbmdlID1cblx0XHRcdFx0XHRpZHNJbkNhY2hlUmFuZ2UubGVuZ3RoID09PSB1cGRhdGVzLmxlbmd0aCA/IFtdIDogdXBkYXRlcy5maWx0ZXIoKHVwZGF0ZSkgPT4gIWlkc0luQ2FjaGVSYW5nZS5pbmNsdWRlcyh1cGRhdGUuaW5zdGFuY2VJZCkpXG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHQvLyBsb2FkTXVsdGlwbGUgaXMgb25seSBjYWxsZWQgdG8gY2FjaGUgdGhlIGVsZW1lbnRzIGFuZCBjaGVjayB3aGljaCBvbmVzIHJldHVybiBlcnJvcnNcblx0XHRcdFx0XHRjb25zdCByZXR1cm5lZEluc3RhbmNlcyA9IGF3YWl0IHRoaXMuX2xvYWRNdWx0aXBsZSh0eXBlUmVmLCBpbnN0YW5jZUxpc3RJZCwgaWRzSW5DYWNoZVJhbmdlLCB1bmRlZmluZWQsIHsgY2FjaGVNb2RlOiBDYWNoZU1vZGUuV3JpdGVPbmx5IH0pXG5cdFx0XHRcdFx0Ly9XZSBkbyBub3Qgd2FudCB0byBwYXNzIHVwZGF0ZXMgdGhhdCBjYXVzZWQgYW4gZXJyb3Jcblx0XHRcdFx0XHRpZiAocmV0dXJuZWRJbnN0YW5jZXMubGVuZ3RoICE9PSBpZHNJbkNhY2hlUmFuZ2UubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRjb25zdCByZXR1cm5lZElkcyA9IHJldHVybmVkSW5zdGFuY2VzLm1hcCgoaW5zdGFuY2UpID0+IGdldEVsZW1lbnRJZChpbnN0YW5jZSkpXG5cdFx0XHRcdFx0XHRwb3N0TXVsdGlwbGVFdmVudFVwZGF0ZXMucHVzaCh1cGRhdGVzLmZpbHRlcigodXBkYXRlKSA9PiByZXR1cm5lZElkcy5pbmNsdWRlcyh1cGRhdGUuaW5zdGFuY2VJZCkpLmNvbmNhdCh1cGRhdGVzTm90SW5DYWNoZVJhbmdlKSlcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cG9zdE11bHRpcGxlRXZlbnRVcGRhdGVzLnB1c2godXBkYXRlcylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRpZiAoZSBpbnN0YW5jZW9mIE5vdEF1dGhvcml6ZWRFcnJvcikge1xuXHRcdFx0XHRcdFx0Ly8gcmV0dXJuIHVwZGF0ZXMgdGhhdCBhcmUgbm90IGluIGNhY2hlIFJhbmdlIGlmIE5vdEF1dGhvcml6ZWRFcnJvciAoZm9yIHRob3NlIHVwZGF0ZXMgdGhhdCBhcmUgaW4gY2FjaGUgcmFuZ2UpXG5cdFx0XHRcdFx0XHRwb3N0TXVsdGlwbGVFdmVudFVwZGF0ZXMucHVzaCh1cGRhdGVzTm90SW5DYWNoZVJhbmdlKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb3RoZXJFdmVudFVwZGF0ZXM6IEVudGl0eVVwZGF0ZVtdID0gW11cblx0XHRmb3IgKGxldCB1cGRhdGUgb2YgcmVndWxhclVwZGF0ZXMpIHtcblx0XHRcdGNvbnN0IHsgb3BlcmF0aW9uLCB0eXBlLCBhcHBsaWNhdGlvbiB9ID0gdXBkYXRlXG5cdFx0XHRjb25zdCB7IGluc3RhbmNlTGlzdElkLCBpbnN0YW5jZUlkIH0gPSBnZXRVcGRhdGVJbnN0YW5jZUlkKHVwZGF0ZSlcblx0XHRcdGNvbnN0IHR5cGVSZWYgPSBuZXcgVHlwZVJlZjxTb21lRW50aXR5PihhcHBsaWNhdGlvbiwgdHlwZSlcblxuXHRcdFx0c3dpdGNoIChvcGVyYXRpb24pIHtcblx0XHRcdFx0Y2FzZSBPcGVyYXRpb25UeXBlLlVQREFURToge1xuXHRcdFx0XHRcdGNvbnN0IGhhbmRsZWRVcGRhdGUgPSBhd2FpdCB0aGlzLnByb2Nlc3NVcGRhdGVFdmVudCh0eXBlUmVmLCB1cGRhdGUpXG5cdFx0XHRcdFx0aWYgKGhhbmRsZWRVcGRhdGUpIHtcblx0XHRcdFx0XHRcdG90aGVyRXZlbnRVcGRhdGVzLnB1c2goaGFuZGxlZFVwZGF0ZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWsgLy8gZG8gYnJlYWsgaW5zdGVhZCBvZiBjb250aW51ZSB0byBhdm9pZCBpZGUgd2FybmluZ3Ncblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlIE9wZXJhdGlvblR5cGUuREVMRVRFOiB7XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0aXNTYW1lVHlwZVJlZihNYWlsU2V0RW50cnlUeXBlUmVmLCB0eXBlUmVmKSAmJlxuXHRcdFx0XHRcdFx0Y29udGFpbnNFdmVudE9mVHlwZSh1cGRhdGVzQXJyYXkgYXMgUmVhZG9ubHk8RW50aXR5VXBkYXRlRGF0YVtdPiwgT3BlcmF0aW9uVHlwZS5DUkVBVEUsIGluc3RhbmNlSWQpXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHQvLyBtb3ZlIGZvciBtYWlsIGlzIGhhbmRsZWQgaW4gY3JlYXRlIGV2ZW50LlxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoaXNTYW1lVHlwZVJlZihNYWlsVHlwZVJlZiwgdHlwZVJlZikpIHtcblx0XHRcdFx0XHRcdC8vIGRlbGV0ZSBtYWlsRGV0YWlscyBpZiB0aGV5IGFyZSBhdmFpbGFibGUgKGFzIHdlIGRvbid0IHNlbmQgYW4gZXZlbnQgZm9yIHRoaXMgdHlwZSlcblx0XHRcdFx0XHRcdGNvbnN0IG1haWwgPSBhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0KE1haWxUeXBlUmVmLCBpbnN0YW5jZUxpc3RJZCwgaW5zdGFuY2VJZClcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuc3RvcmFnZS5kZWxldGVJZkV4aXN0cyh0eXBlUmVmLCBpbnN0YW5jZUxpc3RJZCwgaW5zdGFuY2VJZClcblx0XHRcdFx0XHRcdGlmIChtYWlsPy5tYWlsRGV0YWlscyAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuc3RvcmFnZS5kZWxldGVJZkV4aXN0cyhNYWlsRGV0YWlsc0Jsb2JUeXBlUmVmLCBtYWlsLm1haWxEZXRhaWxzWzBdLCBtYWlsLm1haWxEZXRhaWxzWzFdKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnN0b3JhZ2UuZGVsZXRlSWZFeGlzdHModHlwZVJlZiwgaW5zdGFuY2VMaXN0SWQsIGluc3RhbmNlSWQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG90aGVyRXZlbnRVcGRhdGVzLnB1c2godXBkYXRlKVxuXHRcdFx0XHRcdGJyZWFrIC8vIGRvIGJyZWFrIGluc3RlYWQgb2YgY29udGludWUgdG8gYXZvaWQgaWRlIHdhcm5pbmdzXG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FzZSBPcGVyYXRpb25UeXBlLkNSRUFURToge1xuXHRcdFx0XHRcdGNvbnN0IGhhbmRsZWRVcGRhdGUgPSBhd2FpdCB0aGlzLnByb2Nlc3NDcmVhdGVFdmVudCh0eXBlUmVmLCB1cGRhdGUsIHVwZGF0ZXNBcnJheSlcblx0XHRcdFx0XHRpZiAoaGFuZGxlZFVwZGF0ZSkge1xuXHRcdFx0XHRcdFx0b3RoZXJFdmVudFVwZGF0ZXMucHVzaChoYW5kbGVkVXBkYXRlKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhayAvLyBkbyBicmVhayBpbnN0ZWFkIG9mIGNvbnRpbnVlIHRvIGF2b2lkIGlkZSB3YXJuaW5nc1xuXHRcdFx0XHR9XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoXCJVbmtub3duIG9wZXJhdGlvbiB0eXBlOiBcIiArIG9wZXJhdGlvbilcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gdGhlIHdob2xlIGJhdGNoIGhhcyBiZWVuIHdyaXR0ZW4gc3VjY2Vzc2Z1bGx5XG5cdFx0YXdhaXQgdGhpcy5zdG9yYWdlLnB1dExhc3RCYXRjaElkRm9yR3JvdXAoYmF0Y2guZ3JvdXBJZCwgYmF0Y2guYmF0Y2hJZClcblx0XHQvLyBtZXJnZSB0aGUgcmVzdWx0c1xuXHRcdHJldHVybiBvdGhlckV2ZW50VXBkYXRlcy5jb25jYXQocG9zdE11bHRpcGxlRXZlbnRVcGRhdGVzLmZsYXQoKSlcblx0fVxuXG5cdC8qKiBSZXR1cm5zIHtudWxsfSB3aGVuIHRoZSB1cGRhdGUgc2hvdWxkIGJlIHNraXBwZWQuICovXG5cdHByaXZhdGUgYXN5bmMgcHJvY2Vzc0NyZWF0ZUV2ZW50KHR5cGVSZWY6IFR5cGVSZWY8YW55PiwgdXBkYXRlOiBFbnRpdHlVcGRhdGUsIGJhdGNoOiBSZWFkb25seUFycmF5PEVudGl0eVVwZGF0ZT4pOiBQcm9taXNlPEVudGl0eVVwZGF0ZSB8IG51bGw+IHtcblx0XHQvLyBkbyBub3QgcmV0dXJuIHVuZGVmaW5lZCB0byBhdm9pZCBpbXBsaWNpdCByZXR1cm5zXG5cdFx0Y29uc3QgeyBpbnN0YW5jZUlkLCBpbnN0YW5jZUxpc3RJZCB9ID0gZ2V0VXBkYXRlSW5zdGFuY2VJZCh1cGRhdGUpXG5cblx0XHQvLyBXZSBwdXQgbmV3IGluc3RhbmNlcyBpbnRvIGNhY2hlIG9ubHkgd2hlbiBpdCdzIGEgbmV3IGluc3RhbmNlIGluIHRoZSBjYWNoZWQgcmFuZ2Ugd2hpY2ggaXMgb25seSBmb3IgdGhlIGxpc3QgaW5zdGFuY2VzLlxuXHRcdGlmIChpbnN0YW5jZUxpc3RJZCAhPSBudWxsKSB7XG5cdFx0XHRjb25zdCBkZWxldGVFdmVudCA9IGdldEV2ZW50T2ZUeXBlKGJhdGNoLCBPcGVyYXRpb25UeXBlLkRFTEVURSwgaW5zdGFuY2VJZClcblx0XHRcdGNvbnN0IG1haWxTZXRFbnRyeSA9XG5cdFx0XHRcdGRlbGV0ZUV2ZW50ICYmIGlzU2FtZVR5cGVSZWYoTWFpbFNldEVudHJ5VHlwZVJlZiwgdHlwZVJlZilcblx0XHRcdFx0XHQ/IGF3YWl0IHRoaXMuc3RvcmFnZS5nZXQoTWFpbFNldEVudHJ5VHlwZVJlZiwgZGVsZXRlRXZlbnQuaW5zdGFuY2VMaXN0SWQsIGluc3RhbmNlSWQpXG5cdFx0XHRcdFx0OiBudWxsXG5cdFx0XHQvLyBhdm9pZCBkb3dubG9hZGluZyBuZXcgbWFpbFNldEVudHJ5IGluIGNhc2Ugb2YgbW92ZSBldmVudCAoREVMRVRFICsgQ1JFQVRFKVxuXHRcdFx0aWYgKGRlbGV0ZUV2ZW50ICE9IG51bGwgJiYgbWFpbFNldEVudHJ5ICE9IG51bGwpIHtcblx0XHRcdFx0Ly8gSXQgaXMgYSBtb3ZlIGV2ZW50IGZvciBjYWNoZWQgbWFpbFNldEVudHJ5XG5cdFx0XHRcdGF3YWl0IHRoaXMuc3RvcmFnZS5kZWxldGVJZkV4aXN0cyh0eXBlUmVmLCBkZWxldGVFdmVudC5pbnN0YW5jZUxpc3RJZCwgaW5zdGFuY2VJZClcblx0XHRcdFx0YXdhaXQgdGhpcy51cGRhdGVMaXN0SWRPZk1haWxTZXRFbnRyeUFuZFVwZGF0ZUNhY2hlKG1haWxTZXRFbnRyeSwgaW5zdGFuY2VMaXN0SWQsIGluc3RhbmNlSWQpXG5cdFx0XHRcdHJldHVybiB1cGRhdGVcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIElmIHRoZXJlIGlzIGEgY3VzdG9tIGhhbmRsZXIgd2UgZm9sbG93IGl0cyBkZWNpc2lvbi5cblx0XHRcdFx0Ly8gT3RoZXJ3aXNlLCB3ZSBkbyBhIHJhbmdlIGNoZWNrIHRvIHNlZSBpZiB3ZSBuZWVkIHRvIGtlZXAgdGhlIHJhbmdlIHVwLXRvLWRhdGUuXG5cdFx0XHRcdGNvbnN0IHNob3VsZExvYWQgPVxuXHRcdFx0XHRcdChhd2FpdCB0aGlzLnN0b3JhZ2UuZ2V0Q3VzdG9tQ2FjaGVIYW5kbGVyTWFwKHRoaXMuZW50aXR5UmVzdENsaWVudCkuZ2V0KHR5cGVSZWYpPy5zaG91bGRMb2FkT25DcmVhdGVFdmVudD8uKHVwZGF0ZSkpID8/XG5cdFx0XHRcdFx0KGF3YWl0IHRoaXMuc3RvcmFnZS5pc0VsZW1lbnRJZEluQ2FjaGVSYW5nZSh0eXBlUmVmLCBpbnN0YW5jZUxpc3RJZCwgaW5zdGFuY2VJZCkpXG5cdFx0XHRcdGlmIChzaG91bGRMb2FkKSB7XG5cdFx0XHRcdFx0Ly8gTm8gbmVlZCB0byB0cnkgdG8gZG93bmxvYWQgc29tZXRoaW5nIHRoYXQncyBub3QgdGhlcmUgYW55bW9yZVxuXHRcdFx0XHRcdC8vIFdlIGRvIG5vdCBjb25zdWx0IGN1c3RvbSBoYW5kbGVycyBoZXJlIGJlY2F1c2UgdGhleSBhcmUgb25seSBuZWVkZWQgZm9yIGxpc3QgZWxlbWVudHMuXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJkb3dubG9hZGluZyBjcmVhdGUgZXZlbnQgZm9yXCIsIGdldFR5cGVJZCh0eXBlUmVmKSwgaW5zdGFuY2VMaXN0SWQsIGluc3RhbmNlSWQpXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZW50aXR5UmVzdENsaWVudFxuXHRcdFx0XHRcdFx0LmxvYWQodHlwZVJlZiwgW2luc3RhbmNlTGlzdElkLCBpbnN0YW5jZUlkXSlcblx0XHRcdFx0XHRcdC50aGVuKChlbnRpdHkpID0+IHRoaXMuc3RvcmFnZS5wdXQoZW50aXR5KSlcblx0XHRcdFx0XHRcdC50aGVuKCgpID0+IHVwZGF0ZSlcblx0XHRcdFx0XHRcdC5jYXRjaCgoZSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRpZiAoaXNFeHBlY3RlZEVycm9yRm9yU3luY2hyb25pemF0aW9uKGUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG51bGxcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHR0aHJvdyBlXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHVwZGF0ZVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB1cGRhdGVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgZ2l2ZW4gbWFpbFNldEVudHJ5IHdpdGggdGhlIG5ldyBsaXN0IGlkIGFuZCBhZGQgaXQgdG8gdGhlIGNhY2hlLlxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyB1cGRhdGVMaXN0SWRPZk1haWxTZXRFbnRyeUFuZFVwZGF0ZUNhY2hlKG1haWxTZXRFbnRyeTogTWFpbFNldEVudHJ5LCBuZXdMaXN0SWQ6IElkLCBlbGVtZW50SWQ6IElkKSB7XG5cdFx0Ly8gSW4gY2FzZSBvZiBhIG1vdmUgb3BlcmF0aW9uIHdlIGhhdmUgdG8gcmVwbGFjZSB0aGUgbGlzdCBpZCBhbHdheXMsIGFzIHRoZSBtYWlsU2V0RW50cnkgaXMgc3RvcmVkIGluIGFub3RoZXIgZm9sZGVyLlxuXHRcdG1haWxTZXRFbnRyeS5faWQgPSBbbmV3TGlzdElkLCBlbGVtZW50SWRdXG5cdFx0YXdhaXQgdGhpcy5zdG9yYWdlLnB1dChtYWlsU2V0RW50cnkpXG5cdH1cblxuXHQvKiogUmV0dXJucyB7bnVsbH0gd2hlbiB0aGUgdXBkYXRlIHNob3VsZCBiZSBza2lwcGVkLiAqL1xuXHRwcml2YXRlIGFzeW5jIHByb2Nlc3NVcGRhdGVFdmVudCh0eXBlUmVmOiBUeXBlUmVmPFNvbWVFbnRpdHk+LCB1cGRhdGU6IEVudGl0eVVwZGF0ZSk6IFByb21pc2U8RW50aXR5VXBkYXRlIHwgbnVsbD4ge1xuXHRcdGNvbnN0IHsgaW5zdGFuY2VJZCwgaW5zdGFuY2VMaXN0SWQgfSA9IGdldFVwZGF0ZUluc3RhbmNlSWQodXBkYXRlKVxuXHRcdGNvbnN0IGNhY2hlZCA9IGF3YWl0IHRoaXMuc3RvcmFnZS5nZXQodHlwZVJlZiwgaW5zdGFuY2VMaXN0SWQsIGluc3RhbmNlSWQpXG5cdFx0Ly8gTm8gbmVlZCB0byB0cnkgdG8gZG93bmxvYWQgc29tZXRoaW5nIHRoYXQncyBub3QgdGhlcmUgYW55bW9yZVxuXHRcdGlmIChjYWNoZWQgIT0gbnVsbCkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Ly8gaW4gY2FzZSB0aGlzIGlzIGFuIHVwZGF0ZSBmb3IgdGhlIHVzZXIgaW5zdGFuY2U6IGlmIHRoZSBwYXNzd29yZCBjaGFuZ2VkIHdlJ2xsIGJlIGxvZ2dlZCBvdXQgYXQgdGhpcyBwb2ludFxuXHRcdFx0XHQvLyBpZiB3ZSBkb24ndCBjYXRjaCB0aGUgZXhwZWN0ZWQgTm90QXV0aGVudGljYXRlZCBFcnJvciB0aGF0IHJlc3VsdHMgZnJvbSB0cnlpbmcgdG8gbG9hZCBhbnl0aGluZyB3aXRoXG5cdFx0XHRcdC8vIHRoZSBvbGQgdXNlci5cblx0XHRcdFx0Ly8gTGV0dGluZyB0aGUgTm90QXV0aGVudGljYXRlZEVycm9yIHByb3BhZ2F0ZSB0byB0aGUgbWFpbiB0aHJlYWQgaW5zdGVhZCBvZiB0cnlpbmcgdG8gaGFuZGxlIGl0IG91cnNlbHZlc1xuXHRcdFx0XHQvLyBvciB0aHJvd2luZyBvdXQgdGhlIHVwZGF0ZSBkcm9wcyB1cyBvbnRvIHRoZSBsb2dpbiBwYWdlIGFuZCBpbnRvIHRoZSBzZXNzaW9uIHJlY292ZXJ5IGZsb3cgaWYgdGhlIHVzZXJcblx0XHRcdFx0Ly8gY2xpY2tzIHRoZWlyIHNhdmVkIGNyZWRlbnRpYWxzIGFnYWluLCBidXQgbGV0cyB0aGVtIHN0aWxsIHVzZSBvZmZsaW5lIGxvZ2luIGlmIHRoZXkgdHJ5IHRvIHVzZSB0aGVcblx0XHRcdFx0Ly8gb3V0ZGF0ZWQgY3JlZGVudGlhbHMgd2hpbGUgbm90IGNvbm5lY3RlZCB0byB0aGUgaW50ZXJuZXQuXG5cdFx0XHRcdGNvbnN0IG5ld0VudGl0eSA9IGF3YWl0IHRoaXMuZW50aXR5UmVzdENsaWVudC5sb2FkKHR5cGVSZWYsIGNvbGxhcHNlSWQoaW5zdGFuY2VMaXN0SWQsIGluc3RhbmNlSWQpKVxuXHRcdFx0XHRpZiAoaXNTYW1lVHlwZVJlZih0eXBlUmVmLCBVc2VyVHlwZVJlZikpIHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLmhhbmRsZVVwZGF0ZWRVc2VyKGNhY2hlZCwgbmV3RW50aXR5KVxuXHRcdFx0XHR9XG5cdFx0XHRcdGF3YWl0IHRoaXMuc3RvcmFnZS5wdXQobmV3RW50aXR5KVxuXHRcdFx0XHRyZXR1cm4gdXBkYXRlXG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdC8vIElmIHRoZSBlbnRpdHkgaXMgbm90IHRoZXJlIGFueW1vcmUgd2Ugc2hvdWxkIGV2aWN0IGl0IGZyb20gdGhlIGNhY2hlIGFuZCBub3Qga2VlcCB0aGUgb3V0ZGF0ZWQvbm9uZXhpc3RpbmcgaW5zdGFuY2UgYXJvdW5kLlxuXHRcdFx0XHQvLyBFdmVuIGZvciBsaXN0IGVsZW1lbnRzIHRoaXMgc2hvdWxkIGJlIHNhZmUgYXMgdGhlIGluc3RhbmNlIGlzIG5vdCB0aGVyZSBhbnltb3JlIGFuZCBpcyBkZWZpbml0ZWx5IG5vdCBpbiB0aGlzIHZlcnNpb25cblx0XHRcdFx0aWYgKGlzRXhwZWN0ZWRFcnJvckZvclN5bmNocm9uaXphdGlvbihlKSkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGBJbnN0YW5jZSBub3QgZm91bmQgd2hlbiBwcm9jZXNzaW5nIHVwZGF0ZSBmb3IgJHtKU09OLnN0cmluZ2lmeSh1cGRhdGUpfSwgZGVsZXRpbmcgZnJvbSB0aGUgY2FjaGUuYClcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnN0b3JhZ2UuZGVsZXRlSWZFeGlzdHModHlwZVJlZiwgaW5zdGFuY2VMaXN0SWQsIGluc3RhbmNlSWQpXG5cdFx0XHRcdFx0cmV0dXJuIG51bGxcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHVwZGF0ZVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBoYW5kbGVVcGRhdGVkVXNlcihjYWNoZWQ6IFNvbWVFbnRpdHksIG5ld0VudGl0eTogU29tZUVudGl0eSkge1xuXHRcdC8vIFdoZW4gd2UgYXJlIHJlbW92ZWQgZnJvbSBhIGdyb3VwIHdlIGp1c3QgZ2V0IGFuIHVwZGF0ZSBmb3Igb3VyIHVzZXJcblx0XHQvLyB3aXRoIG5vIG1lbWJlcnNoaXAgb24gaXQuIFdlIG5lZWQgdG8gY2xlYW4gdXAgYWxsIHRoZSBlbnRpdGllcyB0aGF0XG5cdFx0Ly8gYmVsb25nIHRvIHRoYXQgZ3JvdXAgc2luY2Ugd2Ugc2hvdWxkbid0IGJlIGFibGUgdG8gYWNjZXNzIHRoZW0gYW55bW9yZVxuXHRcdC8vIGFuZCB3ZSB3b24ndCBnZXQgYW55IHVwZGF0ZSBvciBhbm90aGVyIGNoYW5jZSB0byBjbGVhbiB0aGVtIHVwLlxuXHRcdGNvbnN0IG9sZFVzZXIgPSBjYWNoZWQgYXMgVXNlclxuXHRcdGlmIChvbGRVc2VyLl9pZCAhPT0gdGhpcy5zdG9yYWdlLmdldFVzZXJJZCgpKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0Y29uc3QgbmV3VXNlciA9IG5ld0VudGl0eSBhcyBVc2VyXG5cdFx0Y29uc3QgcmVtb3ZlZFNoaXBzID0gZGlmZmVyZW5jZShvbGRVc2VyLm1lbWJlcnNoaXBzLCBuZXdVc2VyLm1lbWJlcnNoaXBzLCAobCwgcikgPT4gbC5faWQgPT09IHIuX2lkKVxuXHRcdGZvciAoY29uc3Qgc2hpcCBvZiByZW1vdmVkU2hpcHMpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiTG9zdCBtZW1iZXJzaGlwIG9uIFwiLCBzaGlwLl9pZCwgc2hpcC5ncm91cFR5cGUpXG5cdFx0XHRhd2FpdCB0aGlzLnN0b3JhZ2UuZGVsZXRlQWxsT3duZWRCeShzaGlwLmdyb3VwKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7QXJyYXk8SWQ+fSB0aGUgaWRzIHRoYXQgYXJlIGluIGNhY2hlIHJhbmdlIGFuZCB0aGVyZWZvcmUgc2hvdWxkIGJlIGNhY2hlZFxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBnZXRFbGVtZW50SWRzSW5DYWNoZVJhbmdlPFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCwgaWRzOiBJZFtdKTogUHJvbWlzZTxJZFtdPiB7XG5cdFx0Y29uc3QgcmV0OiBJZFtdID0gW11cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGlkcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKGF3YWl0IHRoaXMuc3RvcmFnZS5pc0VsZW1lbnRJZEluQ2FjaGVSYW5nZSh0eXBlUmVmLCBsaXN0SWQsIGlkc1tpXSkpIHtcblx0XHRcdFx0cmV0LnB1c2goaWRzW2ldKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmV0XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgaWYgdGhlIGdpdmVuIHJlcXVlc3Qgc2hvdWxkIHVzZSB0aGUgY2FjaGVcblx0ICogQHBhcmFtIHR5cGVSZWYgdHlwZXJlZiBvZiB0aGUgdHlwZVxuXHQgKiBAcGFyYW0gb3B0cyBlbnRpdHkgcmVzdCBjbGllbnQgb3B0aW9ucywgaWYgYW55XG5cdCAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgY2FjaGUgY2FuIGJlIHVzZWQsIGZhbHNlIGlmIGEgZGlyZWN0IG5ldHdvcmsgcmVxdWVzdCBzaG91bGQgYmUgcGVyZm9ybWVkXG5cdCAqL1xuXHRwcml2YXRlIHNob3VsZFVzZUNhY2hlKHR5cGVSZWY6IFR5cGVSZWY8YW55Piwgb3B0cz86IEVudGl0eVJlc3RDbGllbnRMb2FkT3B0aW9ucyk6IGJvb2xlYW4ge1xuXHRcdC8vIHNvbWUgdHlwZXMgd29uJ3QgYmUgY2FjaGVkXG5cdFx0aWYgKGlzSWdub3JlZFR5cGUodHlwZVJlZikpIHtcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH1cblxuXHRcdC8vIGlmIGEgc3BlY2lmaWMgdmVyc2lvbiBpcyByZXF1ZXN0ZWQgd2UgaGF2ZSB0byBsb2FkIGFnYWluIGFuZCBkbyBub3Qgd2FudCB0byBzdG9yZSBpdCBpbiB0aGUgY2FjaGVcblx0XHRyZXR1cm4gb3B0cz8ucXVlcnlQYXJhbXM/LnZlcnNpb24gPT0gbnVsbFxuXHR9XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHRoZSBlcnJvciBpcyBleHBlY3RlZCBmb3IgdGhlIGNhc2VzIHdoZXJlIG91ciBsb2NhbCBzdGF0ZSBtaWdodCBub3QgYmUgdXAtdG8tZGF0ZSB3aXRoIHRoZSBzZXJ2ZXIgeWV0LiBFLmcuIHdlIG1pZ2h0IGJlIHByb2Nlc3NpbmcgYW4gdXBkYXRlXG4gKiBmb3IgdGhlIGluc3RhbmNlIHRoYXQgd2FzIGFscmVhZHkgZGVsZXRlZC4gTm9ybWFsbHkgdGhpcyB3b3VsZCBiZSBvcHRpbWl6ZWQgYXdheSBidXQgaXQgbWlnaHQgc3RpbGwgaGFwcGVuIGR1ZSB0byB0aW1pbmcuXG4gKi9cbmZ1bmN0aW9uIGlzRXhwZWN0ZWRFcnJvckZvclN5bmNocm9uaXphdGlvbihlOiBFcnJvcik6IGJvb2xlYW4ge1xuXHRyZXR1cm4gZSBpbnN0YW5jZW9mIE5vdEZvdW5kRXJyb3IgfHwgZSBpbnN0YW5jZW9mIE5vdEF1dGhvcml6ZWRFcnJvclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhwYW5kSWQoaWQ6IElkIHwgSWRUdXBsZSk6IHsgbGlzdElkOiBJZCB8IG51bGw7IGVsZW1lbnRJZDogSWQgfSB7XG5cdGlmICh0eXBlb2YgaWQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGlzdElkOiBudWxsLFxuXHRcdFx0ZWxlbWVudElkOiBpZCxcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgW2xpc3RJZCwgZWxlbWVudElkXSA9IGlkXG5cdFx0cmV0dXJuIHtcblx0XHRcdGxpc3RJZCxcblx0XHRcdGVsZW1lbnRJZCxcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbGxhcHNlSWQobGlzdElkOiBJZCB8IG51bGwsIGVsZW1lbnRJZDogSWQpOiBJZCB8IElkVHVwbGUge1xuXHRpZiAobGlzdElkICE9IG51bGwpIHtcblx0XHRyZXR1cm4gW2xpc3RJZCwgZWxlbWVudElkXVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBlbGVtZW50SWRcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VXBkYXRlSW5zdGFuY2VJZCh1cGRhdGU6IEVudGl0eVVwZGF0ZSk6IHsgaW5zdGFuY2VMaXN0SWQ6IElkIHwgbnVsbDsgaW5zdGFuY2VJZDogSWQgfSB7XG5cdGxldCBpbnN0YW5jZUxpc3RJZFxuXHRpZiAodXBkYXRlLmluc3RhbmNlTGlzdElkID09PSBcIlwiKSB7XG5cdFx0aW5zdGFuY2VMaXN0SWQgPSBudWxsXG5cdH0gZWxzZSB7XG5cdFx0aW5zdGFuY2VMaXN0SWQgPSB1cGRhdGUuaW5zdGFuY2VMaXN0SWRcblx0fVxuXHRyZXR1cm4geyBpbnN0YW5jZUxpc3RJZCwgaW5zdGFuY2VJZDogdXBkYXRlLmluc3RhbmNlSWQgfVxufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgcmFuZ2UgcmVxdWVzdCBiZWdpbnMgaW5zaWRlIGFuIGV4aXN0aW5nIHJhbmdlXG4gKi9cbmZ1bmN0aW9uIGlzU3RhcnRJZFdpdGhpblJhbmdlKHJhbmdlOiBSYW5nZSwgc3RhcnRJZDogSWQsIHR5cGVNb2RlbDogVHlwZU1vZGVsKTogYm9vbGVhbiB7XG5cdHJldHVybiAhZmlyc3RCaWdnZXJUaGFuU2Vjb25kKHN0YXJ0SWQsIHJhbmdlLnVwcGVyLCB0eXBlTW9kZWwpICYmICFmaXJzdEJpZ2dlclRoYW5TZWNvbmQocmFuZ2UubG93ZXIsIHN0YXJ0SWQsIHR5cGVNb2RlbClcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIHJhbmdlIHJlcXVlc3QgaXMgZ29pbmcgYXdheSBmcm9tIGFuIGV4aXN0aW5nIHJhbmdlXG4gKiBBc3N1bWVzIHRoYXQgdGhlIHJhbmdlIHJlcXVlc3QgZG9lc24ndCBzdGFydCBpbnNpZGUgdGhlIHJhbmdlXG4gKi9cbmZ1bmN0aW9uIGlzUmFuZ2VSZXF1ZXN0QXdheUZyb21FeGlzdGluZ1JhbmdlKHJhbmdlOiBSYW5nZSwgcmV2ZXJzZTogYm9vbGVhbiwgc3RhcnQ6IHN0cmluZywgdHlwZU1vZGVsOiBUeXBlTW9kZWwpIHtcblx0cmV0dXJuIHJldmVyc2UgPyBmaXJzdEJpZ2dlclRoYW5TZWNvbmQocmFuZ2UubG93ZXIsIHN0YXJ0LCB0eXBlTW9kZWwpIDogZmlyc3RCaWdnZXJUaGFuU2Vjb25kKHN0YXJ0LCByYW5nZS51cHBlciwgdHlwZU1vZGVsKVxufVxuXG4vKipcbiAqIHNvbWUgdHlwZXMgYXJlIGNvbXBsZXRlbHkgaWdub3JlZCBieSB0aGUgY2FjaGUgYW5kIGFsd2F5cyBzZXJ2ZWQgZnJvbSBhIHJlcXVlc3QuXG4gKiBOb3RlOlxuICogaXNDYWNoZWRSYW5nZVR5cGUocmVmKSAtLS0+ICFpc0lnbm9yZWRUeXBlKHJlZikgYnV0XG4gKiBpc0lnbm9yZWRUeXBlKHJlZikgLS8tPiAhaXNDYWNoZWRSYW5nZVR5cGUocmVmKSBiZWNhdXNlIG9mIG9wdGVkLWluIEN1c3RvbUlkIHR5cGVzLlxuICovXG5mdW5jdGlvbiBpc0lnbm9yZWRUeXBlKHR5cGVSZWY6IFR5cGVSZWY8dW5rbm93bj4pOiBib29sZWFuIHtcblx0cmV0dXJuIHR5cGVSZWYuYXBwID09PSBcIm1vbml0b3JcIiB8fCBJR05PUkVEX1RZUEVTLnNvbWUoKHJlZikgPT4gaXNTYW1lVHlwZVJlZih0eXBlUmVmLCByZWYpKVxufVxuXG4vKipcbiAqIENoZWNrcyBpZiBmb3IgdGhlIGdpdmVuIHR5cGUsIHRoYXQgY29udGFpbnMgYSBjdXN0b21JZCwgIGNhY2hpbmcgaXMgZW5hYmxlZC5cbiAqL1xuZnVuY3Rpb24gaXNDYWNoYWJsZUN1c3RvbUlkVHlwZSh0eXBlUmVmOiBUeXBlUmVmPHVua25vd24+KTogYm9vbGVhbiB7XG5cdHJldHVybiBDQUNIRUFCTEVfQ1VTVE9NSURfVFlQRVMuc29tZSgocmVmKSA9PiBpc1NhbWVUeXBlUmVmKHR5cGVSZWYsIHJlZikpXG59XG5cbi8qKlxuICogUmFuZ2VzIGZvciBjdXN0b21JZCB0eXBlcyBhcmUgbm9ybWFsbHkgbm90IGNhY2hlZCwgYnV0IHNvbWUgYXJlIG9wdGVkIGluLlxuICogTm90ZTpcbiAqIGlzQ2FjaGVkUmFuZ2VUeXBlKHJlZikgLS0tPiAhaXNJZ25vcmVkVHlwZShyZWYpIGJ1dFxuICogaXNJZ25vcmVkVHlwZShyZWYpIC0vLT4gIWlzQ2FjaGVkUmFuZ2VUeXBlKHJlZilcbiAqL1xuZnVuY3Rpb24gaXNDYWNoZWRSYW5nZVR5cGUodHlwZU1vZGVsOiBUeXBlTW9kZWwsIHR5cGVSZWY6IFR5cGVSZWY8dW5rbm93bj4pOiBib29sZWFuIHtcblx0cmV0dXJuICghaXNJZ25vcmVkVHlwZSh0eXBlUmVmKSAmJiBpc0dlbmVyYXRlZElkVHlwZSh0eXBlTW9kZWwpKSB8fCBpc0NhY2hhYmxlQ3VzdG9tSWRUeXBlKHR5cGVSZWYpXG59XG5cbmZ1bmN0aW9uIGlzR2VuZXJhdGVkSWRUeXBlKHR5cGVNb2RlbDogVHlwZU1vZGVsKTogYm9vbGVhbiB7XG5cdHJldHVybiB0eXBlTW9kZWwudmFsdWVzLl9pZC50eXBlID09PSBWYWx1ZVR5cGUuR2VuZXJhdGVkSWRcbn1cbiIsImltcG9ydCB7IFJlc3RDbGllbnQsIFN1c3BlbnNpb25CZWhhdmlvciB9IGZyb20gXCIuL1Jlc3RDbGllbnRcIlxuaW1wb3J0IHR5cGUgeyBDcnlwdG9GYWNhZGUgfSBmcm9tIFwiLi4vY3J5cHRvL0NyeXB0b0ZhY2FkZVwiXG5pbXBvcnQgeyBfdmVyaWZ5VHlwZSwgSHR0cE1ldGhvZCwgTWVkaWFUeXBlLCByZXNvbHZlVHlwZVJlZmVyZW5jZSB9IGZyb20gXCIuLi8uLi9jb21tb24vRW50aXR5RnVuY3Rpb25zXCJcbmltcG9ydCB7IFNlc3Npb25LZXlOb3RGb3VuZEVycm9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lcnJvci9TZXNzaW9uS2V5Tm90Rm91bmRFcnJvclwiXG5pbXBvcnQgdHlwZSB7IEVudGl0eVVwZGF0ZSB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgUHVzaElkZW50aWZpZXJUeXBlUmVmIH0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQge1xuXHRDb25uZWN0aW9uRXJyb3IsXG5cdEludGVybmFsU2VydmVyRXJyb3IsXG5cdE5vdEF1dGhlbnRpY2F0ZWRFcnJvcixcblx0Tm90QXV0aG9yaXplZEVycm9yLFxuXHROb3RGb3VuZEVycm9yLFxuXHRQYXlsb2FkVG9vTGFyZ2VFcnJvcixcbn0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lcnJvci9SZXN0RXJyb3JcIlxuaW1wb3J0IHR5cGUgeyBLZXlWZXJzaW9uLCBsYXp5IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBpc1NhbWVUeXBlUmVmLCBNYXBwZXIsIG9mQ2xhc3MsIHByb21pc2VNYXAsIHNwbGl0SW5DaHVua3MsIFR5cGVSZWYgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IGFzc2VydFdvcmtlck9yTm9kZSB9IGZyb20gXCIuLi8uLi9jb21tb24vRW52XCJcbmltcG9ydCB0eXBlIHsgTGlzdEVsZW1lbnRFbnRpdHksIFNvbWVFbnRpdHksIFR5cGVNb2RlbCB9IGZyb20gXCIuLi8uLi9jb21tb24vRW50aXR5VHlwZXNcIlxuaW1wb3J0IHsgZ2V0RWxlbWVudElkLCBMT0FEX01VTFRJUExFX0xJTUlULCBQT1NUX01VTFRJUExFX0xJTUlUIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi91dGlscy9FbnRpdHlVdGlsc1wiXG5pbXBvcnQgeyBUeXBlIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnRpdHlDb25zdGFudHMuanNcIlxuaW1wb3J0IHsgU2V0dXBNdWx0aXBsZUVycm9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lcnJvci9TZXR1cE11bHRpcGxlRXJyb3JcIlxuaW1wb3J0IHsgZXhwYW5kSWQgfSBmcm9tIFwiLi9EZWZhdWx0RW50aXR5UmVzdENhY2hlLmpzXCJcbmltcG9ydCB7IEluc3RhbmNlTWFwcGVyIH0gZnJvbSBcIi4uL2NyeXB0by9JbnN0YW5jZU1hcHBlclwiXG5pbXBvcnQgeyBRdWV1ZWRCYXRjaCB9IGZyb20gXCIuLi9FdmVudFF1ZXVlLmpzXCJcbmltcG9ydCB7IEF1dGhEYXRhUHJvdmlkZXIgfSBmcm9tIFwiLi4vZmFjYWRlcy9Vc2VyRmFjYWRlXCJcbmltcG9ydCB7IExvZ2luSW5jb21wbGV0ZUVycm9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lcnJvci9Mb2dpbkluY29tcGxldGVFcnJvci5qc1wiXG5pbXBvcnQgeyBCbG9iU2VydmVyVXJsIH0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL3N0b3JhZ2UvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgQmxvYkFjY2Vzc1Rva2VuRmFjYWRlIH0gZnJvbSBcIi4uL2ZhY2FkZXMvQmxvYkFjY2Vzc1Rva2VuRmFjYWRlLmpzXCJcbmltcG9ydCB7IEFlc0tleSB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtY3J5cHRvXCJcbmltcG9ydCB7IGlzT2ZmbGluZUVycm9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi91dGlscy9FcnJvclV0aWxzLmpzXCJcbmltcG9ydCB7IFZlcnNpb25lZEVuY3J5cHRlZEtleSwgVmVyc2lvbmVkS2V5IH0gZnJvbSBcIi4uL2NyeXB0by9DcnlwdG9XcmFwcGVyLmpzXCJcbmltcG9ydCB7IHBhcnNlS2V5VmVyc2lvbiB9IGZyb20gXCIuLi9mYWNhZGVzL0tleUxvYWRlckZhY2FkZS5qc1wiXG5cbmFzc2VydFdvcmtlck9yTm9kZSgpXG5cbmV4cG9ydCBmdW5jdGlvbiB0eXBlUmVmVG9QYXRoKHR5cGVSZWY6IFR5cGVSZWY8YW55Pik6IHN0cmluZyB7XG5cdHJldHVybiBgL3Jlc3QvJHt0eXBlUmVmLmFwcH0vJHt0eXBlUmVmLnR5cGUudG9Mb3dlckNhc2UoKX1gXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5UmVzdENsaWVudFNldHVwT3B0aW9ucyB7XG5cdGJhc2VVcmw/OiBzdHJpbmdcblx0LyoqIFVzZSB0aGlzIGtleSB0byBlbmNyeXB0IHNlc3Npb24ga2V5IGluc3RlYWQgb2YgdHJ5aW5nIHRvIHJlc29sdmUgdGhlIG93bmVyIGtleSBiYXNlZCBvbiB0aGUgb3duZXJHcm91cC4gKi9cblx0b3duZXJLZXk/OiBWZXJzaW9uZWRLZXlcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlSZXN0Q2xpZW50VXBkYXRlT3B0aW9ucyB7XG5cdGJhc2VVcmw/OiBzdHJpbmdcblx0LyoqIFVzZSB0aGUga2V5IHByb3ZpZGVkIGJ5IHRoaXMgdG8gZGVjcnlwdCB0aGUgZXhpc3Rpbmcgb3duZXJFbmNTZXNzaW9uS2V5IGluc3RlYWQgb2YgdHJ5aW5nIHRvIHJlc29sdmUgdGhlIG93bmVyIGtleSBiYXNlZCBvbiB0aGUgb3duZXJHcm91cC4gKi9cblx0b3duZXJLZXlQcm92aWRlcj86IE93bmVyS2V5UHJvdmlkZXJcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlSZXN0Q2xpZW50RXJhc2VPcHRpb25zIHtcblx0ZXh0cmFIZWFkZXJzPzogRGljdFxufVxuXG4vKipcbiAqIERldGVybWluZXMgaG93IHRvIGhhbmRsZSBjYWNoaW5nIGJlaGF2aW9yIChpLmUuIHJlYWRpbmcvd3JpdGluZykuXG4gKlxuICogVXNlIHtAbGluayBnZXRDYWNoZU1vZGVCZWhhdmlvcn0gdG8gcHJvZ3JhbW1hdGljYWxseSBjaGVjayB0aGUgYmVoYXZpb3Igb2YgdGhlIGNhY2hlIG1vZGUuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIENhY2hlTW9kZSB7XG5cdC8qKiBQcmVmZXIgY2FjaGVkIHZhbHVlIGlmIGl0J3MgdGhlcmUsIG9yIGZhbGwgYmFjayB0byBuZXR3b3JrIGFuZCB3cml0ZSBpdCB0byBjYWNoZS4gKi9cblx0UmVhZEFuZFdyaXRlLFxuXG5cdC8qKlxuXHQgKiBBbHdheXMgcmV0cmlldmUgZnJvbSB0aGUgbmV0d29yaywgYnV0IHN0aWxsIHNhdmUgdG8gY2FjaGUuXG5cdCAqXG5cdCAqIE5PVEU6IFRoaXMgY2Fubm90IGJlIHVzZWQgd2l0aCByYW5nZWQgcmVxdWVzdHMuXG5cdCAqL1xuXHRXcml0ZU9ubHksXG5cblx0LyoqIFByZWZlciBjYWNoZWQgdmFsdWUsIGJ1dCBpbiBjYXNlIG9mIGEgY2FjaGUgbWlzcywgcmV0cmlldmUgdGhlIHZhbHVlIGZyb20gbmV0d29yayB3aXRob3V0IHdyaXRpbmcgaXQgdG8gY2FjaGUuICovXG5cdFJlYWRPbmx5LFxufVxuXG4vKipcbiAqIEdldCB0aGUgYmVoYXZpb3Igb2YgdGhlIGNhY2hlIG1vZGUgZm9yIHRoZSBvcHRpb25zXG4gKiBAcGFyYW0gY2FjaGVNb2RlIGNhY2hlIG1vZGUgdG8gY2hlY2ssIG9yIGlmIGB1bmRlZmluZWRgLCBjaGVjayB0aGUgZGVmYXVsdCBjYWNoZSBtb2RlICh7QGxpbmsgQ2FjaGVNb2RlLlJlYWRBbmRXcml0ZX0pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDYWNoZU1vZGVCZWhhdmlvcihjYWNoZU1vZGU6IENhY2hlTW9kZSB8IHVuZGVmaW5lZCk6IHtcblx0cmVhZHNGcm9tQ2FjaGU6IGJvb2xlYW5cblx0d3JpdGVzVG9DYWNoZTogYm9vbGVhblxufSB7XG5cdHN3aXRjaCAoY2FjaGVNb2RlID8/IENhY2hlTW9kZS5SZWFkQW5kV3JpdGUpIHtcblx0XHRjYXNlIENhY2hlTW9kZS5SZWFkQW5kV3JpdGU6XG5cdFx0XHRyZXR1cm4geyByZWFkc0Zyb21DYWNoZTogdHJ1ZSwgd3JpdGVzVG9DYWNoZTogdHJ1ZSB9XG5cdFx0Y2FzZSBDYWNoZU1vZGUuV3JpdGVPbmx5OlxuXHRcdFx0cmV0dXJuIHsgcmVhZHNGcm9tQ2FjaGU6IGZhbHNlLCB3cml0ZXNUb0NhY2hlOiB0cnVlIH1cblx0XHRjYXNlIENhY2hlTW9kZS5SZWFkT25seTpcblx0XHRcdHJldHVybiB7IHJlYWRzRnJvbUNhY2hlOiB0cnVlLCB3cml0ZXNUb0NhY2hlOiBmYWxzZSB9XG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlSZXN0Q2xpZW50TG9hZE9wdGlvbnMge1xuXHRxdWVyeVBhcmFtcz86IERpY3Rcblx0ZXh0cmFIZWFkZXJzPzogRGljdFxuXHQvKiogVXNlIHRoZSBrZXkgcHJvdmlkZWQgYnkgdGhpcyB0byBkZWNyeXB0IHRoZSBleGlzdGluZyBvd25lckVuY1Nlc3Npb25LZXkgaW5zdGVhZCBvZiB0cnlpbmcgdG8gcmVzb2x2ZSB0aGUgb3duZXIga2V5IGJhc2VkIG9uIHRoZSBvd25lckdyb3VwLiAqL1xuXHRvd25lcktleVByb3ZpZGVyPzogT3duZXJLZXlQcm92aWRlclxuXHQvKiogRGVmYXVsdHMgdG8ge0BsaW5rIENhY2hlTW9kZS5SZWFkQW5kV3JpdGUgfSovXG5cdGNhY2hlTW9kZT86IENhY2hlTW9kZVxuXHRiYXNlVXJsPzogc3RyaW5nXG5cdHN1c3BlbnNpb25CZWhhdmlvcj86IFN1c3BlbnNpb25CZWhhdmlvclxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE93bmVyRW5jU2Vzc2lvbktleVByb3ZpZGVyIHtcblx0KGluc3RhbmNlRWxlbWVudElkOiBJZCk6IFByb21pc2U8VmVyc2lvbmVkRW5jcnlwdGVkS2V5PlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE93bmVyS2V5UHJvdmlkZXIge1xuXHQob3duZXJLZXlWZXJzaW9uOiBLZXlWZXJzaW9uKTogUHJvbWlzZTxBZXNLZXk+XG59XG5cbi8qKlxuICogVGhlIEVudGl0eVJlc3RJbnRlcmZhY2UgcHJvdmlkZXMgYSBjb252ZW5pZW50IGludGVyZmFjZSBmb3IgaW52b2tpbmcgc2VydmVyIHNpZGUgUkVTVCBzZXJ2aWNlcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlSZXN0SW50ZXJmYWNlIHtcblx0LyoqXG5cdCAqIFJlYWRzIGEgc2luZ2xlIGVsZW1lbnQgZnJvbSB0aGUgc2VydmVyIChvciBjYWNoZSkuIEVudGl0aWVzIGFyZSBkZWNyeXB0ZWQgYmVmb3JlIHRoZXkgYXJlIHJldHVybmVkLlxuXHQgKiBAcGFyYW0gb3duZXJLZXkgVXNlIHRoaXMga2V5IHRvIGRlY3J5cHQgc2Vzc2lvbiBrZXkgaW5zdGVhZCBvZiB0cnlpbmcgdG8gcmVzb2x2ZSB0aGUgb3duZXIga2V5IGJhc2VkIG9uIHRoZSBvd25lckdyb3VwLlxuXHQgKi9cblx0bG9hZDxUIGV4dGVuZHMgU29tZUVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgaWQ6IFByb3BlcnR5VHlwZTxULCBcIl9pZFwiPiwgbG9hZE9wdGlvbnM/OiBFbnRpdHlSZXN0Q2xpZW50TG9hZE9wdGlvbnMpOiBQcm9taXNlPFQ+XG5cblx0LyoqXG5cdCAqIFJlYWRzIGEgcmFuZ2Ugb2YgZWxlbWVudHMgZnJvbSB0aGUgc2VydmVyIChvciBjYWNoZSkuIEVudGl0aWVzIGFyZSBkZWNyeXB0ZWQgYmVmb3JlIHRoZXkgYXJlIHJldHVybmVkLlxuXHQgKi9cblx0bG9hZFJhbmdlPFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4oXG5cdFx0dHlwZVJlZjogVHlwZVJlZjxUPixcblx0XHRsaXN0SWQ6IElkLFxuXHRcdHN0YXJ0OiBJZCxcblx0XHRjb3VudDogbnVtYmVyLFxuXHRcdHJldmVyc2U6IGJvb2xlYW4sXG5cdFx0bG9hZE9wdGlvbnM/OiBFbnRpdHlSZXN0Q2xpZW50TG9hZE9wdGlvbnMsXG5cdCk6IFByb21pc2U8VFtdPlxuXG5cdC8qKlxuXHQgKiBSZWFkcyBtdWx0aXBsZSBlbGVtZW50cyBmcm9tIHRoZSBzZXJ2ZXIgKG9yIGNhY2hlKS4gRW50aXRpZXMgYXJlIGRlY3J5cHRlZCBiZWZvcmUgdGhleSBhcmUgcmV0dXJuZWQuXG5cdCAqIEBwYXJhbSBvd25lckVuY1Nlc3Npb25LZXlQcm92aWRlciB1c2UgdGhpcyB0byByZXNvbHZlIHRoZSBpbnN0YW5jZXMgc2Vzc2lvbiBrZXkgaW4gY2FzZSBpbnN0YW5jZS5vd25lckVuY1Nlc3Npb25LZXkgaXMgbm90IGRlZmluZWQgKHdoaWNoIG1pZ2h0IGJlIHVuZGVmaW5lZCBmb3IgTWFpbERldGFpbHMgLyBGaWxlcylcblx0ICovXG5cdGxvYWRNdWx0aXBsZTxUIGV4dGVuZHMgU29tZUVudGl0eT4oXG5cdFx0dHlwZVJlZjogVHlwZVJlZjxUPixcblx0XHRsaXN0SWQ6IElkIHwgbnVsbCxcblx0XHRlbGVtZW50SWRzOiBBcnJheTxJZD4sXG5cdFx0b3duZXJFbmNTZXNzaW9uS2V5UHJvdmlkZXI/OiBPd25lckVuY1Nlc3Npb25LZXlQcm92aWRlcixcblx0XHRsb2FkT3B0aW9ucz86IEVudGl0eVJlc3RDbGllbnRMb2FkT3B0aW9ucyxcblx0KTogUHJvbWlzZTxBcnJheTxUPj5cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHNpbmdsZSBlbGVtZW50IG9uIHRoZSBzZXJ2ZXIuIEVudGl0aWVzIGFyZSBlbmNyeXB0ZWQgYmVmb3JlIHRoZXkgYXJlIHNlbnQuXG5cdCAqL1xuXHRzZXR1cDxUIGV4dGVuZHMgU29tZUVudGl0eT4obGlzdElkOiBJZCB8IG51bGwsIGluc3RhbmNlOiBULCBleHRyYUhlYWRlcnM/OiBEaWN0LCBvcHRpb25zPzogRW50aXR5UmVzdENsaWVudFNldHVwT3B0aW9ucyk6IFByb21pc2U8SWQ+XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgbXVsdGlwbGUgZWxlbWVudHMgb24gdGhlIHNlcnZlci4gRW50aXRpZXMgYXJlIGVuY3J5cHRlZCBiZWZvcmUgdGhleSBhcmUgc2VudC5cblx0ICovXG5cdHNldHVwTXVsdGlwbGU8VCBleHRlbmRzIFNvbWVFbnRpdHk+KGxpc3RJZDogSWQgfCBudWxsLCBpbnN0YW5jZXM6IFJlYWRvbmx5QXJyYXk8VD4pOiBQcm9taXNlPEFycmF5PElkPj5cblxuXHQvKipcblx0ICogTW9kaWZpZXMgYSBzaW5nbGUgZWxlbWVudCBvbiB0aGUgc2VydmVyLiBFbnRpdGllcyBhcmUgZW5jcnlwdGVkIGJlZm9yZSB0aGV5IGFyZSBzZW50LlxuXHQgKiBAcGFyYW0gaW5zdGFuY2Vcblx0ICogQHBhcmFtIG9wdGlvbnNcblx0ICovXG5cdHVwZGF0ZTxUIGV4dGVuZHMgU29tZUVudGl0eT4oaW5zdGFuY2U6IFQsIG9wdGlvbnM/OiBFbnRpdHlSZXN0Q2xpZW50VXBkYXRlT3B0aW9ucyk6IFByb21pc2U8dm9pZD5cblxuXHQvKipcblx0ICogRGVsZXRlcyBhIHNpbmdsZSBlbGVtZW50IG9uIHRoZSBzZXJ2ZXIuXG5cdCAqL1xuXHRlcmFzZTxUIGV4dGVuZHMgU29tZUVudGl0eT4oaW5zdGFuY2U6IFQsIG9wdGlvbnM/OiBFbnRpdHlSZXN0Q2xpZW50RXJhc2VPcHRpb25zKTogUHJvbWlzZTx2b2lkPlxuXG5cdC8qKlxuXHQgKiBNdXN0IGJlIGNhbGxlZCB3aGVuIGVudGl0eSBldmVudHMgYXJlIHJlY2VpdmVkLlxuXHQgKiBAcGFyYW0gYmF0Y2ggVGhlIGVudGl0eSBldmVudHMgdGhhdCB3ZXJlIHJlY2VpdmVkLlxuXHQgKiBAcmV0dXJuIFNpbWlsYXIgdG8gdGhlIGV2ZW50cyBpbiB0aGUgZGF0YSBwYXJhbWV0ZXIsIGJ1dCByZWR1Y2VkIGJ5IHRoZSBldmVudHMgd2hpY2ggYXJlIG9ic29sZXRlLlxuXHQgKi9cblx0ZW50aXR5RXZlbnRzUmVjZWl2ZWQoYmF0Y2g6IFF1ZXVlZEJhdGNoKTogUHJvbWlzZTxBcnJheTxFbnRpdHlVcGRhdGU+PlxufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgaW5zdGFuY2VzIGZyb20gdGhlIGJhY2tlbmQgKGRiKSBhbmQgY29udmVydHMgdGhlbSB0byBlbnRpdGllcy5cbiAqXG4gKiBQYXJ0IG9mIHRoaXMgcHJvY2VzcyBpc1xuICogKiB0aGUgZGVjcnlwdGlvbiBmb3IgdGhlIHJldHVybmVkIGluc3RhbmNlcyAoR0VUKSBhbmQgdGhlIGVuY3J5cHRpb24gb2YgYWxsIGluc3RhbmNlcyBiZWZvcmUgdGhleSBhcmUgc2VudCAoUE9TVCwgUFVUKVxuICogKiB0aGUgaW5qZWN0aW9uIG9mIGFnZ3JlZ2F0ZSBpbnN0YW5jZXMgZm9yIHRoZSByZXR1cm5lZCBpbnN0YW5jZXMgKEdFVClcbiAqICogY2FjaGluZyBmb3IgcmV0cmlldmVkIGluc3RhbmNlcyAoR0VUKVxuICpcbiAqL1xuZXhwb3J0IGNsYXNzIEVudGl0eVJlc3RDbGllbnQgaW1wbGVtZW50cyBFbnRpdHlSZXN0SW50ZXJmYWNlIHtcblx0Z2V0IF9jcnlwdG8oKTogQ3J5cHRvRmFjYWRlIHtcblx0XHRyZXR1cm4gdGhpcy5sYXp5Q3J5cHRvKClcblx0fVxuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgYXV0aERhdGFQcm92aWRlcjogQXV0aERhdGFQcm92aWRlcixcblx0XHRwcml2YXRlIHJlYWRvbmx5IHJlc3RDbGllbnQ6IFJlc3RDbGllbnQsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBsYXp5Q3J5cHRvOiBsYXp5PENyeXB0b0ZhY2FkZT4sXG5cdFx0cHJpdmF0ZSByZWFkb25seSBpbnN0YW5jZU1hcHBlcjogSW5zdGFuY2VNYXBwZXIsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBibG9iQWNjZXNzVG9rZW5GYWNhZGU6IEJsb2JBY2Nlc3NUb2tlbkZhY2FkZSxcblx0KSB7fVxuXG5cdGFzeW5jIGxvYWQ8VCBleHRlbmRzIFNvbWVFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGlkOiBQcm9wZXJ0eVR5cGU8VCwgXCJfaWRcIj4sIG9wdHM6IEVudGl0eVJlc3RDbGllbnRMb2FkT3B0aW9ucyA9IHt9KTogUHJvbWlzZTxUPiB7XG5cdFx0Y29uc3QgeyBsaXN0SWQsIGVsZW1lbnRJZCB9ID0gZXhwYW5kSWQoaWQpXG5cdFx0Y29uc3QgeyBwYXRoLCBxdWVyeVBhcmFtcywgaGVhZGVycywgdHlwZU1vZGVsIH0gPSBhd2FpdCB0aGlzLl92YWxpZGF0ZUFuZFByZXBhcmVSZXN0UmVxdWVzdChcblx0XHRcdHR5cGVSZWYsXG5cdFx0XHRsaXN0SWQsXG5cdFx0XHRlbGVtZW50SWQsXG5cdFx0XHRvcHRzLnF1ZXJ5UGFyYW1zLFxuXHRcdFx0b3B0cy5leHRyYUhlYWRlcnMsXG5cdFx0XHRvcHRzLm93bmVyS2V5UHJvdmlkZXIsXG5cdFx0KVxuXHRcdGNvbnN0IGpzb24gPSBhd2FpdCB0aGlzLnJlc3RDbGllbnQucmVxdWVzdChwYXRoLCBIdHRwTWV0aG9kLkdFVCwge1xuXHRcdFx0cXVlcnlQYXJhbXMsXG5cdFx0XHRoZWFkZXJzLFxuXHRcdFx0cmVzcG9uc2VUeXBlOiBNZWRpYVR5cGUuSnNvbixcblx0XHRcdGJhc2VVcmw6IG9wdHMuYmFzZVVybCxcblx0XHR9KVxuXHRcdGNvbnN0IGVudGl0eSA9IEpTT04ucGFyc2UoanNvbilcblx0XHRjb25zdCBtaWdyYXRlZEVudGl0eSA9IGF3YWl0IHRoaXMuX2NyeXB0by5hcHBseU1pZ3JhdGlvbnModHlwZVJlZiwgZW50aXR5KVxuXHRcdGNvbnN0IHNlc3Npb25LZXkgPSBhd2FpdCB0aGlzLnJlc29sdmVTZXNzaW9uS2V5KG9wdHMub3duZXJLZXlQcm92aWRlciwgbWlncmF0ZWRFbnRpdHksIHR5cGVNb2RlbClcblxuXHRcdGNvbnN0IGluc3RhbmNlID0gYXdhaXQgdGhpcy5pbnN0YW5jZU1hcHBlci5kZWNyeXB0QW5kTWFwVG9JbnN0YW5jZTxUPih0eXBlTW9kZWwsIG1pZ3JhdGVkRW50aXR5LCBzZXNzaW9uS2V5KVxuXHRcdHJldHVybiB0aGlzLl9jcnlwdG8uYXBwbHlNaWdyYXRpb25zRm9ySW5zdGFuY2UoaW5zdGFuY2UpXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHJlc29sdmVTZXNzaW9uS2V5KG93bmVyS2V5UHJvdmlkZXI6IE93bmVyS2V5UHJvdmlkZXIgfCB1bmRlZmluZWQsIG1pZ3JhdGVkRW50aXR5OiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCB0eXBlTW9kZWw6IFR5cGVNb2RlbCkge1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAob3duZXJLZXlQcm92aWRlciAmJiBtaWdyYXRlZEVudGl0eS5fb3duZXJFbmNTZXNzaW9uS2V5KSB7XG5cdFx0XHRcdGNvbnN0IG93bmVyS2V5ID0gYXdhaXQgb3duZXJLZXlQcm92aWRlcihwYXJzZUtleVZlcnNpb24obWlncmF0ZWRFbnRpdHkuX293bmVyS2V5VmVyc2lvbiA/PyAwKSlcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2NyeXB0by5yZXNvbHZlU2Vzc2lvbktleVdpdGhPd25lcktleShtaWdyYXRlZEVudGl0eSwgb3duZXJLZXkpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gYXdhaXQgdGhpcy5fY3J5cHRvLnJlc29sdmVTZXNzaW9uS2V5KHR5cGVNb2RlbCwgbWlncmF0ZWRFbnRpdHkpXG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0aWYgKGUgaW5zdGFuY2VvZiBTZXNzaW9uS2V5Tm90Rm91bmRFcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhgY291bGQgbm90IHJlc29sdmUgc2Vzc2lvbiBrZXkgZm9yIGluc3RhbmNlIG9mIHR5cGUgJHt0eXBlTW9kZWwuYXBwfS8ke3R5cGVNb2RlbC5uYW1lfWAsIGUpXG5cdFx0XHRcdHJldHVybiBudWxsXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgbG9hZFJhbmdlPFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4oXG5cdFx0dHlwZVJlZjogVHlwZVJlZjxUPixcblx0XHRsaXN0SWQ6IElkLFxuXHRcdHN0YXJ0OiBJZCxcblx0XHRjb3VudDogbnVtYmVyLFxuXHRcdHJldmVyc2U6IGJvb2xlYW4sXG5cdFx0b3B0czogRW50aXR5UmVzdENsaWVudExvYWRPcHRpb25zID0ge30sXG5cdCk6IFByb21pc2U8VFtdPiB7XG5cdFx0Y29uc3QgcmFuZ2VSZXF1ZXN0UGFyYW1zID0ge1xuXHRcdFx0c3RhcnQ6IFN0cmluZyhzdGFydCksXG5cdFx0XHRjb3VudDogU3RyaW5nKGNvdW50KSxcblx0XHRcdHJldmVyc2U6IFN0cmluZyhyZXZlcnNlKSxcblx0XHR9XG5cdFx0Y29uc3QgeyBwYXRoLCBoZWFkZXJzLCB0eXBlTW9kZWwsIHF1ZXJ5UGFyYW1zIH0gPSBhd2FpdCB0aGlzLl92YWxpZGF0ZUFuZFByZXBhcmVSZXN0UmVxdWVzdChcblx0XHRcdHR5cGVSZWYsXG5cdFx0XHRsaXN0SWQsXG5cdFx0XHRudWxsLFxuXHRcdFx0T2JqZWN0LmFzc2lnbihyYW5nZVJlcXVlc3RQYXJhbXMsIG9wdHMucXVlcnlQYXJhbXMpLFxuXHRcdFx0b3B0cy5leHRyYUhlYWRlcnMsXG5cdFx0XHRvcHRzLm93bmVyS2V5UHJvdmlkZXIsXG5cdFx0KVxuXHRcdC8vIFRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbiBpZiB0eXBlIGNoZWNraW5nIGlzIG5vdCBieXBhc3NlZCB3aXRoIGFueVxuXHRcdGlmICh0eXBlTW9kZWwudHlwZSAhPT0gVHlwZS5MaXN0RWxlbWVudCkgdGhyb3cgbmV3IEVycm9yKFwib25seSBMaXN0RWxlbWVudCB0eXBlcyBhcmUgcGVybWl0dGVkXCIpXG5cdFx0Y29uc3QganNvbiA9IGF3YWl0IHRoaXMucmVzdENsaWVudC5yZXF1ZXN0KHBhdGgsIEh0dHBNZXRob2QuR0VULCB7XG5cdFx0XHRxdWVyeVBhcmFtcyxcblx0XHRcdGhlYWRlcnMsXG5cdFx0XHRyZXNwb25zZVR5cGU6IE1lZGlhVHlwZS5Kc29uLFxuXHRcdFx0YmFzZVVybDogb3B0cy5iYXNlVXJsLFxuXHRcdFx0c3VzcGVuc2lvbkJlaGF2aW9yOiBvcHRzLnN1c3BlbnNpb25CZWhhdmlvcixcblx0XHR9KVxuXHRcdHJldHVybiB0aGlzLl9oYW5kbGVMb2FkTXVsdGlwbGVSZXN1bHQodHlwZVJlZiwgSlNPTi5wYXJzZShqc29uKSlcblx0fVxuXG5cdGFzeW5jIGxvYWRNdWx0aXBsZTxUIGV4dGVuZHMgU29tZUVudGl0eT4oXG5cdFx0dHlwZVJlZjogVHlwZVJlZjxUPixcblx0XHRsaXN0SWQ6IElkIHwgbnVsbCxcblx0XHRlbGVtZW50SWRzOiBBcnJheTxJZD4sXG5cdFx0b3duZXJFbmNTZXNzaW9uS2V5UHJvdmlkZXI/OiBPd25lckVuY1Nlc3Npb25LZXlQcm92aWRlcixcblx0XHRvcHRzOiBFbnRpdHlSZXN0Q2xpZW50TG9hZE9wdGlvbnMgPSB7fSxcblx0KTogUHJvbWlzZTxBcnJheTxUPj4ge1xuXHRcdGNvbnN0IHsgcGF0aCwgaGVhZGVycyB9ID0gYXdhaXQgdGhpcy5fdmFsaWRhdGVBbmRQcmVwYXJlUmVzdFJlcXVlc3QodHlwZVJlZiwgbGlzdElkLCBudWxsLCBvcHRzLnF1ZXJ5UGFyYW1zLCBvcHRzLmV4dHJhSGVhZGVycywgb3B0cy5vd25lcktleVByb3ZpZGVyKVxuXHRcdGNvbnN0IGlkQ2h1bmtzID0gc3BsaXRJbkNodW5rcyhMT0FEX01VTFRJUExFX0xJTUlULCBlbGVtZW50SWRzKVxuXHRcdGNvbnN0IHR5cGVNb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGVSZWYpXG5cblx0XHRjb25zdCBsb2FkZWRDaHVua3MgPSBhd2FpdCBwcm9taXNlTWFwKGlkQ2h1bmtzLCBhc3luYyAoaWRDaHVuaykgPT4ge1xuXHRcdFx0bGV0IHF1ZXJ5UGFyYW1zID0ge1xuXHRcdFx0XHRpZHM6IGlkQ2h1bmsuam9pbihcIixcIiksXG5cdFx0XHR9XG5cdFx0XHRsZXQganNvbjogc3RyaW5nXG5cdFx0XHRpZiAodHlwZU1vZGVsLnR5cGUgPT09IFR5cGUuQmxvYkVsZW1lbnQpIHtcblx0XHRcdFx0anNvbiA9IGF3YWl0IHRoaXMubG9hZE11bHRpcGxlQmxvYkVsZW1lbnRzKGxpc3RJZCwgcXVlcnlQYXJhbXMsIGhlYWRlcnMsIHBhdGgsIHR5cGVSZWYsIG9wdHMuc3VzcGVuc2lvbkJlaGF2aW9yKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0anNvbiA9IGF3YWl0IHRoaXMucmVzdENsaWVudC5yZXF1ZXN0KHBhdGgsIEh0dHBNZXRob2QuR0VULCB7XG5cdFx0XHRcdFx0cXVlcnlQYXJhbXMsXG5cdFx0XHRcdFx0aGVhZGVycyxcblx0XHRcdFx0XHRyZXNwb25zZVR5cGU6IE1lZGlhVHlwZS5Kc29uLFxuXHRcdFx0XHRcdGJhc2VVcmw6IG9wdHMuYmFzZVVybCxcblx0XHRcdFx0XHRzdXNwZW5zaW9uQmVoYXZpb3I6IG9wdHMuc3VzcGVuc2lvbkJlaGF2aW9yLFxuXHRcdFx0XHR9KVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXMuX2hhbmRsZUxvYWRNdWx0aXBsZVJlc3VsdCh0eXBlUmVmLCBKU09OLnBhcnNlKGpzb24pLCBvd25lckVuY1Nlc3Npb25LZXlQcm92aWRlcilcblx0XHR9KVxuXHRcdHJldHVybiBsb2FkZWRDaHVua3MuZmxhdCgpXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGxvYWRNdWx0aXBsZUJsb2JFbGVtZW50cyhcblx0XHRhcmNoaXZlSWQ6IElkIHwgbnVsbCxcblx0XHRxdWVyeVBhcmFtczogeyBpZHM6IHN0cmluZyB9LFxuXHRcdGhlYWRlcnM6IERpY3QgfCB1bmRlZmluZWQsXG5cdFx0cGF0aDogc3RyaW5nLFxuXHRcdHR5cGVSZWY6IFR5cGVSZWY8YW55Pixcblx0XHRzdXNwZW5zaW9uQmVoYXZpb3I/OiBTdXNwZW5zaW9uQmVoYXZpb3IsXG5cdCk6IFByb21pc2U8c3RyaW5nPiB7XG5cdFx0aWYgKGFyY2hpdmVJZCA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJhcmNoaXZlSWQgbXVzdCBiZSBzZXQgdG8gbG9hZCBCbG9iRWxlbWVudFR5cGVzXCIpXG5cdFx0fVxuXHRcdGNvbnN0IGRvQmxvYlJlcXVlc3QgPSBhc3luYyAoKSA9PiB7XG5cdFx0XHRjb25zdCBibG9iU2VydmVyQWNjZXNzSW5mbyA9IGF3YWl0IHRoaXMuYmxvYkFjY2Vzc1Rva2VuRmFjYWRlLnJlcXVlc3RSZWFkVG9rZW5BcmNoaXZlKGFyY2hpdmVJZClcblx0XHRcdGNvbnN0IGFkZGl0aW9uYWxSZXF1ZXN0UGFyYW1zID0gT2JqZWN0LmFzc2lnbihcblx0XHRcdFx0e30sXG5cdFx0XHRcdGhlYWRlcnMsIC8vIHByZXZlbnQgQ09SUyByZXF1ZXN0IGR1ZSB0byBub24gc3RhbmRhcmQgaGVhZGVyIHVzYWdlXG5cdFx0XHRcdHF1ZXJ5UGFyYW1zLFxuXHRcdFx0KVxuXHRcdFx0Y29uc3QgYWxsUGFyYW1zID0gYXdhaXQgdGhpcy5ibG9iQWNjZXNzVG9rZW5GYWNhZGUuY3JlYXRlUXVlcnlQYXJhbXMoYmxvYlNlcnZlckFjY2Vzc0luZm8sIGFkZGl0aW9uYWxSZXF1ZXN0UGFyYW1zLCB0eXBlUmVmKVxuXHRcdFx0cmV0dXJuIHRyeVNlcnZlcnMoXG5cdFx0XHRcdGJsb2JTZXJ2ZXJBY2Nlc3NJbmZvLnNlcnZlcnMsXG5cdFx0XHRcdGFzeW5jIChzZXJ2ZXJVcmwpID0+XG5cdFx0XHRcdFx0dGhpcy5yZXN0Q2xpZW50LnJlcXVlc3QocGF0aCwgSHR0cE1ldGhvZC5HRVQsIHtcblx0XHRcdFx0XHRcdHF1ZXJ5UGFyYW1zOiBhbGxQYXJhbXMsXG5cdFx0XHRcdFx0XHRoZWFkZXJzOiB7fSwgLy8gcHJldmVudCBDT1JTIHJlcXVlc3QgZHVlIHRvIG5vbiBzdGFuZGFyZCBoZWFkZXIgdXNhZ2Vcblx0XHRcdFx0XHRcdHJlc3BvbnNlVHlwZTogTWVkaWFUeXBlLkpzb24sXG5cdFx0XHRcdFx0XHRiYXNlVXJsOiBzZXJ2ZXJVcmwsXG5cdFx0XHRcdFx0XHRub0NPUlM6IHRydWUsXG5cdFx0XHRcdFx0XHRzdXNwZW5zaW9uQmVoYXZpb3IsXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdGBjYW4ndCBsb2FkIGluc3RhbmNlcyBmcm9tIHNlcnZlciBgLFxuXHRcdFx0KVxuXHRcdH1cblx0XHRjb25zdCBkb0V2aWN0VG9rZW4gPSAoKSA9PiB0aGlzLmJsb2JBY2Nlc3NUb2tlbkZhY2FkZS5ldmljdEFyY2hpdmVUb2tlbihhcmNoaXZlSWQpXG5cblx0XHRyZXR1cm4gZG9CbG9iUmVxdWVzdFdpdGhSZXRyeShkb0Jsb2JSZXF1ZXN0LCBkb0V2aWN0VG9rZW4pXG5cdH1cblxuXHRhc3luYyBfaGFuZGxlTG9hZE11bHRpcGxlUmVzdWx0PFQgZXh0ZW5kcyBTb21lRW50aXR5Pihcblx0XHR0eXBlUmVmOiBUeXBlUmVmPFQ+LFxuXHRcdGxvYWRlZEVudGl0aWVzOiBBcnJheTxhbnk+LFxuXHRcdG93bmVyRW5jU2Vzc2lvbktleVByb3ZpZGVyPzogT3duZXJFbmNTZXNzaW9uS2V5UHJvdmlkZXIsXG5cdCk6IFByb21pc2U8QXJyYXk8VD4+IHtcblx0XHRjb25zdCBtb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGVSZWYpXG5cblx0XHQvLyBQdXNoSWRlbnRpZmllciB3YXMgY2hhbmdlZCBpbiB0aGUgc3lzdGVtIG1vZGVsIHY0MyB0byBlbmNyeXB0IHRoZSBuYW1lLlxuXHRcdC8vIFdlIGNoZWNrIGhlcmUgdG8gY2hlY2sgdGhlIHR5cGUgb25seSBvbmNlIHBlciBhcnJheSBhbmQgbm90IGZvciBlYWNoIGVsZW1lbnQuXG5cdFx0aWYgKGlzU2FtZVR5cGVSZWYodHlwZVJlZiwgUHVzaElkZW50aWZpZXJUeXBlUmVmKSkge1xuXHRcdFx0YXdhaXQgcHJvbWlzZU1hcChsb2FkZWRFbnRpdGllcywgKGluc3RhbmNlKSA9PiB0aGlzLl9jcnlwdG8uYXBwbHlNaWdyYXRpb25zKHR5cGVSZWYsIGluc3RhbmNlKSwge1xuXHRcdFx0XHRjb25jdXJyZW5jeTogNSxcblx0XHRcdH0pXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHByb21pc2VNYXAoXG5cdFx0XHRsb2FkZWRFbnRpdGllcyxcblx0XHRcdChpbnN0YW5jZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fZGVjcnlwdE1hcEFuZE1pZ3JhdGUoaW5zdGFuY2UsIG1vZGVsLCBvd25lckVuY1Nlc3Npb25LZXlQcm92aWRlcilcblx0XHRcdH0sXG5cdFx0XHR7IGNvbmN1cnJlbmN5OiA1IH0sXG5cdFx0KVxuXHR9XG5cblx0YXN5bmMgX2RlY3J5cHRNYXBBbmRNaWdyYXRlPFQ+KGluc3RhbmNlOiBhbnksIG1vZGVsOiBUeXBlTW9kZWwsIG93bmVyRW5jU2Vzc2lvbktleVByb3ZpZGVyPzogT3duZXJFbmNTZXNzaW9uS2V5UHJvdmlkZXIpOiBQcm9taXNlPFQ+IHtcblx0XHRsZXQgc2Vzc2lvbktleTogQWVzS2V5IHwgbnVsbFxuXHRcdGlmIChvd25lckVuY1Nlc3Npb25LZXlQcm92aWRlcikge1xuXHRcdFx0c2Vzc2lvbktleSA9IGF3YWl0IHRoaXMuX2NyeXB0by5kZWNyeXB0U2Vzc2lvbktleShpbnN0YW5jZSwgYXdhaXQgb3duZXJFbmNTZXNzaW9uS2V5UHJvdmlkZXIoZ2V0RWxlbWVudElkKGluc3RhbmNlKSkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHNlc3Npb25LZXkgPSBhd2FpdCB0aGlzLl9jcnlwdG8ucmVzb2x2ZVNlc3Npb25LZXkobW9kZWwsIGluc3RhbmNlKVxuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRpZiAoZSBpbnN0YW5jZW9mIFNlc3Npb25LZXlOb3RGb3VuZEVycm9yKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJjb3VsZCBub3QgcmVzb2x2ZSBzZXNzaW9uIGtleVwiLCBlLCBlLm1lc3NhZ2UsIGUuc3RhY2spXG5cdFx0XHRcdFx0c2Vzc2lvbktleSA9IG51bGwgLy8gd2lsbCByZXN1bHQgaW4gX2Vycm9ycyBiZWluZyBzZXQgb24gdGhlIGluc3RhbmNlXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnN0IGRlY3J5cHRlZEluc3RhbmNlID0gYXdhaXQgdGhpcy5pbnN0YW5jZU1hcHBlci5kZWNyeXB0QW5kTWFwVG9JbnN0YW5jZTxUPihtb2RlbCwgaW5zdGFuY2UsIHNlc3Npb25LZXkpXG5cdFx0cmV0dXJuIHRoaXMuX2NyeXB0by5hcHBseU1pZ3JhdGlvbnNGb3JJbnN0YW5jZTxUPihkZWNyeXB0ZWRJbnN0YW5jZSlcblx0fVxuXG5cdGFzeW5jIHNldHVwPFQgZXh0ZW5kcyBTb21lRW50aXR5PihsaXN0SWQ6IElkIHwgbnVsbCwgaW5zdGFuY2U6IFQsIGV4dHJhSGVhZGVycz86IERpY3QsIG9wdGlvbnM/OiBFbnRpdHlSZXN0Q2xpZW50U2V0dXBPcHRpb25zKTogUHJvbWlzZTxJZD4ge1xuXHRcdGNvbnN0IHR5cGVSZWYgPSBpbnN0YW5jZS5fdHlwZVxuXHRcdGNvbnN0IHsgdHlwZU1vZGVsLCBwYXRoLCBoZWFkZXJzLCBxdWVyeVBhcmFtcyB9ID0gYXdhaXQgdGhpcy5fdmFsaWRhdGVBbmRQcmVwYXJlUmVzdFJlcXVlc3QoXG5cdFx0XHR0eXBlUmVmLFxuXHRcdFx0bGlzdElkLFxuXHRcdFx0bnVsbCxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdGV4dHJhSGVhZGVycyxcblx0XHRcdG9wdGlvbnM/Lm93bmVyS2V5LFxuXHRcdClcblxuXHRcdGlmICh0eXBlTW9kZWwudHlwZSA9PT0gVHlwZS5MaXN0RWxlbWVudCkge1xuXHRcdFx0aWYgKCFsaXN0SWQpIHRocm93IG5ldyBFcnJvcihcIkxpc3QgaWQgbXVzdCBiZSBkZWZpbmVkIGZvciBMRVRzXCIpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmIChsaXN0SWQpIHRocm93IG5ldyBFcnJvcihcIkxpc3QgaWQgbXVzdCBub3QgYmUgZGVmaW5lZCBmb3IgRVRzXCIpXG5cdFx0fVxuXG5cdFx0Y29uc3Qgc2sgPSBhd2FpdCB0aGlzLl9jcnlwdG8uc2V0TmV3T3duZXJFbmNTZXNzaW9uS2V5KHR5cGVNb2RlbCwgaW5zdGFuY2UsIG9wdGlvbnM/Lm93bmVyS2V5KVxuXG5cdFx0Y29uc3QgZW5jcnlwdGVkRW50aXR5ID0gYXdhaXQgdGhpcy5pbnN0YW5jZU1hcHBlci5lbmNyeXB0QW5kTWFwVG9MaXRlcmFsKHR5cGVNb2RlbCwgaW5zdGFuY2UsIHNrKVxuXHRcdGNvbnN0IHBlcnNpc3RlbmNlUG9zdFJldHVybiA9IGF3YWl0IHRoaXMucmVzdENsaWVudC5yZXF1ZXN0KHBhdGgsIEh0dHBNZXRob2QuUE9TVCwge1xuXHRcdFx0YmFzZVVybDogb3B0aW9ucz8uYmFzZVVybCxcblx0XHRcdHF1ZXJ5UGFyYW1zLFxuXHRcdFx0aGVhZGVycyxcblx0XHRcdGJvZHk6IEpTT04uc3RyaW5naWZ5KGVuY3J5cHRlZEVudGl0eSksXG5cdFx0XHRyZXNwb25zZVR5cGU6IE1lZGlhVHlwZS5Kc29uLFxuXHRcdH0pXG5cdFx0cmV0dXJuIEpTT04ucGFyc2UocGVyc2lzdGVuY2VQb3N0UmV0dXJuKS5nZW5lcmF0ZWRJZFxuXHR9XG5cblx0YXN5bmMgc2V0dXBNdWx0aXBsZTxUIGV4dGVuZHMgU29tZUVudGl0eT4obGlzdElkOiBJZCB8IG51bGwsIGluc3RhbmNlczogQXJyYXk8VD4pOiBQcm9taXNlPEFycmF5PElkPj4ge1xuXHRcdGNvbnN0IGNvdW50ID0gaW5zdGFuY2VzLmxlbmd0aFxuXG5cdFx0aWYgKGNvdW50IDwgMSkge1xuXHRcdFx0cmV0dXJuIFtdXG5cdFx0fVxuXG5cdFx0Y29uc3QgaW5zdGFuY2VDaHVua3MgPSBzcGxpdEluQ2h1bmtzKFBPU1RfTVVMVElQTEVfTElNSVQsIGluc3RhbmNlcylcblx0XHRjb25zdCB0eXBlUmVmID0gaW5zdGFuY2VzWzBdLl90eXBlXG5cdFx0Y29uc3QgeyB0eXBlTW9kZWwsIHBhdGgsIGhlYWRlcnMgfSA9IGF3YWl0IHRoaXMuX3ZhbGlkYXRlQW5kUHJlcGFyZVJlc3RSZXF1ZXN0KHR5cGVSZWYsIGxpc3RJZCwgbnVsbCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZClcblxuXHRcdGlmICh0eXBlTW9kZWwudHlwZSA9PT0gVHlwZS5MaXN0RWxlbWVudCkge1xuXHRcdFx0aWYgKCFsaXN0SWQpIHRocm93IG5ldyBFcnJvcihcIkxpc3QgaWQgbXVzdCBiZSBkZWZpbmVkIGZvciBMRVRzXCIpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmIChsaXN0SWQpIHRocm93IG5ldyBFcnJvcihcIkxpc3QgaWQgbXVzdCBub3QgYmUgZGVmaW5lZCBmb3IgRVRzXCIpXG5cdFx0fVxuXG5cdFx0Y29uc3QgZXJyb3JzOiBFcnJvcltdID0gW11cblx0XHRjb25zdCBmYWlsZWRJbnN0YW5jZXM6IFRbXSA9IFtdXG5cdFx0Y29uc3QgaWRDaHVua3M6IEFycmF5PEFycmF5PElkPj4gPSBhd2FpdCBwcm9taXNlTWFwKGluc3RhbmNlQ2h1bmtzLCBhc3luYyAoaW5zdGFuY2VDaHVuaykgPT4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3QgZW5jcnlwdGVkRW50aXRpZXMgPSBhd2FpdCBwcm9taXNlTWFwKGluc3RhbmNlQ2h1bmssIGFzeW5jIChlKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3Qgc2sgPSBhd2FpdCB0aGlzLl9jcnlwdG8uc2V0TmV3T3duZXJFbmNTZXNzaW9uS2V5KHR5cGVNb2RlbCwgZSlcblxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmluc3RhbmNlTWFwcGVyLmVuY3J5cHRBbmRNYXBUb0xpdGVyYWwodHlwZU1vZGVsLCBlLCBzaylcblx0XHRcdFx0fSlcblx0XHRcdFx0Ly8gaW5mb3JtcyB0aGUgc2VydmVyIHRoYXQgdGhpcyBpcyBhIFBPU1RfTVVMVElQTEUgcmVxdWVzdFxuXHRcdFx0XHRjb25zdCBxdWVyeVBhcmFtcyA9IHtcblx0XHRcdFx0XHRjb3VudDogU3RyaW5nKGluc3RhbmNlQ2h1bmsubGVuZ3RoKSxcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBwZXJzaXN0ZW5jZVBvc3RSZXR1cm4gPSBhd2FpdCB0aGlzLnJlc3RDbGllbnQucmVxdWVzdChwYXRoLCBIdHRwTWV0aG9kLlBPU1QsIHtcblx0XHRcdFx0XHRxdWVyeVBhcmFtcyxcblx0XHRcdFx0XHRoZWFkZXJzLFxuXHRcdFx0XHRcdGJvZHk6IEpTT04uc3RyaW5naWZ5KGVuY3J5cHRlZEVudGl0aWVzKSxcblx0XHRcdFx0XHRyZXNwb25zZVR5cGU6IE1lZGlhVHlwZS5Kc29uLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5wYXJzZVNldHVwTXVsdGlwbGUocGVyc2lzdGVuY2VQb3N0UmV0dXJuKVxuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRpZiAoZSBpbnN0YW5jZW9mIFBheWxvYWRUb29MYXJnZUVycm9yKSB7XG5cdFx0XHRcdFx0Ly8gSWYgd2UgdHJ5IHRvIHBvc3QgdG9vIG1hbnkgbGFyZ2UgaW5zdGFuY2VzIHRoZW4gd2UgZ2V0IFBheWxvYWRUb29MYXJnZVxuXHRcdFx0XHRcdC8vIFNvIHdlIGZhbGwgYmFjayB0byBwb3N0aW5nIHNpbmdsZSBpbnN0YW5jZXNcblx0XHRcdFx0XHRjb25zdCByZXR1cm5lZElkcyA9IGF3YWl0IHByb21pc2VNYXAoaW5zdGFuY2VDaHVuaywgKGluc3RhbmNlKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5zZXR1cChsaXN0SWQsIGluc3RhbmNlKS5jYXRjaCgoZSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRlcnJvcnMucHVzaChlKVxuXHRcdFx0XHRcdFx0XHRmYWlsZWRJbnN0YW5jZXMucHVzaChpbnN0YW5jZSlcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRyZXR1cm4gcmV0dXJuZWRJZHMuZmlsdGVyKEJvb2xlYW4pIGFzIElkW11cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRlcnJvcnMucHVzaChlKVxuXHRcdFx0XHRcdGZhaWxlZEluc3RhbmNlcy5wdXNoKC4uLmluc3RhbmNlQ2h1bmspXG5cdFx0XHRcdFx0cmV0dXJuIFtdIGFzIElkW11cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pXG5cblx0XHRpZiAoZXJyb3JzLmxlbmd0aCkge1xuXHRcdFx0aWYgKGVycm9ycy5zb21lKGlzT2ZmbGluZUVycm9yKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgQ29ubmVjdGlvbkVycm9yKFwiU2V0dXAgbXVsdGlwbGUgZW50aXRpZXMgZmFpbGVkXCIpXG5cdFx0XHR9XG5cdFx0XHR0aHJvdyBuZXcgU2V0dXBNdWx0aXBsZUVycm9yPFQ+KFwiU2V0dXAgbXVsdGlwbGUgZW50aXRpZXMgZmFpbGVkXCIsIGVycm9ycywgZmFpbGVkSW5zdGFuY2VzKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gaWRDaHVua3MuZmxhdCgpXG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgdXBkYXRlPFQgZXh0ZW5kcyBTb21lRW50aXR5PihpbnN0YW5jZTogVCwgb3B0aW9ucz86IEVudGl0eVJlc3RDbGllbnRVcGRhdGVPcHRpb25zKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKCFpbnN0YW5jZS5faWQpIHRocm93IG5ldyBFcnJvcihcIklkIG11c3QgYmUgZGVmaW5lZFwiKVxuXHRcdGNvbnN0IHsgbGlzdElkLCBlbGVtZW50SWQgfSA9IGV4cGFuZElkKGluc3RhbmNlLl9pZClcblx0XHRjb25zdCB7IHBhdGgsIHF1ZXJ5UGFyYW1zLCBoZWFkZXJzLCB0eXBlTW9kZWwgfSA9IGF3YWl0IHRoaXMuX3ZhbGlkYXRlQW5kUHJlcGFyZVJlc3RSZXF1ZXN0KFxuXHRcdFx0aW5zdGFuY2UuX3R5cGUsXG5cdFx0XHRsaXN0SWQsXG5cdFx0XHRlbGVtZW50SWQsXG5cdFx0XHR1bmRlZmluZWQsXG5cdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRvcHRpb25zPy5vd25lcktleVByb3ZpZGVyLFxuXHRcdClcblx0XHRjb25zdCBzZXNzaW9uS2V5ID0gYXdhaXQgdGhpcy5yZXNvbHZlU2Vzc2lvbktleShvcHRpb25zPy5vd25lcktleVByb3ZpZGVyLCBpbnN0YW5jZSwgdHlwZU1vZGVsKVxuXHRcdGNvbnN0IGVuY3J5cHRlZEVudGl0eSA9IGF3YWl0IHRoaXMuaW5zdGFuY2VNYXBwZXIuZW5jcnlwdEFuZE1hcFRvTGl0ZXJhbCh0eXBlTW9kZWwsIGluc3RhbmNlLCBzZXNzaW9uS2V5KVxuXHRcdGF3YWl0IHRoaXMucmVzdENsaWVudC5yZXF1ZXN0KHBhdGgsIEh0dHBNZXRob2QuUFVULCB7XG5cdFx0XHRiYXNlVXJsOiBvcHRpb25zPy5iYXNlVXJsLFxuXHRcdFx0cXVlcnlQYXJhbXMsXG5cdFx0XHRoZWFkZXJzLFxuXHRcdFx0Ym9keTogSlNPTi5zdHJpbmdpZnkoZW5jcnlwdGVkRW50aXR5KSxcblx0XHRcdHJlc3BvbnNlVHlwZTogTWVkaWFUeXBlLkpzb24sXG5cdFx0fSlcblx0fVxuXG5cdGFzeW5jIGVyYXNlPFQgZXh0ZW5kcyBTb21lRW50aXR5PihpbnN0YW5jZTogVCwgb3B0aW9ucz86IEVudGl0eVJlc3RDbGllbnRFcmFzZU9wdGlvbnMpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCB7IGxpc3RJZCwgZWxlbWVudElkIH0gPSBleHBhbmRJZChpbnN0YW5jZS5faWQpXG5cdFx0Y29uc3QgeyBwYXRoLCBxdWVyeVBhcmFtcywgaGVhZGVycyB9ID0gYXdhaXQgdGhpcy5fdmFsaWRhdGVBbmRQcmVwYXJlUmVzdFJlcXVlc3QoXG5cdFx0XHRpbnN0YW5jZS5fdHlwZSxcblx0XHRcdGxpc3RJZCxcblx0XHRcdGVsZW1lbnRJZCxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdG9wdGlvbnM/LmV4dHJhSGVhZGVycyxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHQpXG5cdFx0YXdhaXQgdGhpcy5yZXN0Q2xpZW50LnJlcXVlc3QocGF0aCwgSHR0cE1ldGhvZC5ERUxFVEUsIHtcblx0XHRcdHF1ZXJ5UGFyYW1zLFxuXHRcdFx0aGVhZGVycyxcblx0XHR9KVxuXHR9XG5cblx0YXN5bmMgX3ZhbGlkYXRlQW5kUHJlcGFyZVJlc3RSZXF1ZXN0KFxuXHRcdHR5cGVSZWY6IFR5cGVSZWY8YW55Pixcblx0XHRsaXN0SWQ6IElkIHwgbnVsbCxcblx0XHRlbGVtZW50SWQ6IElkIHwgbnVsbCxcblx0XHRxdWVyeVBhcmFtczogRGljdCB8IHVuZGVmaW5lZCxcblx0XHRleHRyYUhlYWRlcnM6IERpY3QgfCB1bmRlZmluZWQsXG5cdFx0b3duZXJLZXk6IE93bmVyS2V5UHJvdmlkZXIgfCBWZXJzaW9uZWRLZXkgfCB1bmRlZmluZWQsXG5cdCk6IFByb21pc2U8e1xuXHRcdHBhdGg6IHN0cmluZ1xuXHRcdHF1ZXJ5UGFyYW1zOiBEaWN0IHwgdW5kZWZpbmVkXG5cdFx0aGVhZGVyczogRGljdCB8IHVuZGVmaW5lZFxuXHRcdHR5cGVNb2RlbDogVHlwZU1vZGVsXG5cdH0+IHtcblx0XHRjb25zdCB0eXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZSh0eXBlUmVmKVxuXG5cdFx0X3ZlcmlmeVR5cGUodHlwZU1vZGVsKVxuXG5cdFx0aWYgKG93bmVyS2V5ID09IHVuZGVmaW5lZCAmJiAhdGhpcy5hdXRoRGF0YVByb3ZpZGVyLmlzRnVsbHlMb2dnZWRJbigpICYmIHR5cGVNb2RlbC5lbmNyeXB0ZWQpIHtcblx0XHRcdC8vIFNob3J0LWNpcmN1aXQgYmVmb3JlIHdlIGRvIGFuIGFjdHVhbCByZXF1ZXN0IHdoaWNoIHdlIGNhbid0IGRlY3J5cHRcblx0XHRcdHRocm93IG5ldyBMb2dpbkluY29tcGxldGVFcnJvcihgVHJ5aW5nIHRvIGRvIGEgbmV0d29yayByZXF1ZXN0IHdpdGggZW5jcnlwdGVkIGVudGl0eSBidXQgaXMgbm90IGZ1bGx5IGxvZ2dlZCBpbiB5ZXQsIHR5cGU6ICR7dHlwZU1vZGVsLm5hbWV9YClcblx0XHR9XG5cblx0XHRsZXQgcGF0aCA9IHR5cGVSZWZUb1BhdGgodHlwZVJlZilcblxuXHRcdGlmIChsaXN0SWQpIHtcblx0XHRcdHBhdGggKz0gXCIvXCIgKyBsaXN0SWRcblx0XHR9XG5cblx0XHRpZiAoZWxlbWVudElkKSB7XG5cdFx0XHRwYXRoICs9IFwiL1wiICsgZWxlbWVudElkXG5cdFx0fVxuXG5cdFx0Y29uc3QgaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuYXV0aERhdGFQcm92aWRlci5jcmVhdGVBdXRoSGVhZGVycygpLCBleHRyYUhlYWRlcnMpXG5cblx0XHRpZiAoT2JqZWN0LmtleXMoaGVhZGVycykubGVuZ3RoID09PSAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgTm90QXV0aGVudGljYXRlZEVycm9yKFwidXNlciBtdXN0IGJlIGF1dGhlbnRpY2F0ZWQgZm9yIGVudGl0eSByZXF1ZXN0c1wiKVxuXHRcdH1cblxuXHRcdGhlYWRlcnMudiA9IHR5cGVNb2RlbC52ZXJzaW9uXG5cdFx0cmV0dXJuIHtcblx0XHRcdHBhdGgsXG5cdFx0XHRxdWVyeVBhcmFtcyxcblx0XHRcdGhlYWRlcnMsXG5cdFx0XHR0eXBlTW9kZWwsXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIGZvciB0aGUgYWRtaW4gYXJlYSAobm8gY2FjaGUgYXZhaWxhYmxlKVxuXHQgKi9cblx0ZW50aXR5RXZlbnRzUmVjZWl2ZWQoYmF0Y2g6IFF1ZXVlZEJhdGNoKTogUHJvbWlzZTxBcnJheTxFbnRpdHlVcGRhdGU+PiB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShiYXRjaC5ldmVudHMpXG5cdH1cblxuXHRnZXRSZXN0Q2xpZW50KCk6IFJlc3RDbGllbnQge1xuXHRcdHJldHVybiB0aGlzLnJlc3RDbGllbnRcblx0fVxuXG5cdHByaXZhdGUgcGFyc2VTZXR1cE11bHRpcGxlKHJlc3VsdDogYW55KTogSWRbXSB7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiBKU09OLnBhcnNlKHJlc3VsdCkubWFwKChyOiBhbnkpID0+IHIuZ2VuZXJhdGVkSWQpXG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHJlc3BvbnNlOiAke3Jlc3VsdH0sICR7ZX1gKVxuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqIFRyaWVzIHRvIHJ1biB0aGUgbWFwcGVyIGFjdGlvbiBhZ2FpbnN0IGEgbGlzdCBvZiBzZXJ2ZXJzLiBJZiB0aGUgYWN0aW9uIHJlc29sdmVzXG4gKiBzdWNjZXNzZnVsbHksIHRoZSByZXN1bHQgaXMgcmV0dXJuZWQuIEluIGNhc2Ugb2YgYW4gQ29ubmVjdGlvbkVycm9yIGFuZCBlcnJvcnNcbiAqIHRoYXQgbWlnaHQgb2NjdXIgb25seSBmb3IgYSBzaW5nbGUgYmxvYiBzZXJ2ZXIsIHRoZSBuZXh0IHNlcnZlciBpcyB0cmllZC5cbiAqIFRocm93cyBpbiBhbGwgb3RoZXIgY2FzZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0cnlTZXJ2ZXJzPFQ+KHNlcnZlcnM6IEJsb2JTZXJ2ZXJVcmxbXSwgbWFwcGVyOiBNYXBwZXI8c3RyaW5nLCBUPiwgZXJyb3JNc2c6IHN0cmluZyk6IFByb21pc2U8VD4ge1xuXHRsZXQgaW5kZXggPSAwXG5cdGxldCBlcnJvcjogRXJyb3IgfCBudWxsID0gbnVsbFxuXHRmb3IgKGNvbnN0IHNlcnZlciBvZiBzZXJ2ZXJzKSB7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiBhd2FpdCBtYXBwZXIoc2VydmVyLnVybCwgaW5kZXgpXG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0Ly8gSW50ZXJuYWxTZXJ2ZXJFcnJvciBpcyByZXR1cm5lZCB3aGVuIGFjY2Vzc2luZyBhIGNvcnJ1cHRlZCBhcmNoaXZlLCBzbyB3ZSByZXRyeVxuXHRcdFx0aWYgKGUgaW5zdGFuY2VvZiBDb25uZWN0aW9uRXJyb3IgfHwgZSBpbnN0YW5jZW9mIEludGVybmFsU2VydmVyRXJyb3IgfHwgZSBpbnN0YW5jZW9mIE5vdEZvdW5kRXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coYCR7ZXJyb3JNc2d9ICR7c2VydmVyLnVybH1gLCBlKVxuXHRcdFx0XHRlcnJvciA9IGVcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IGVcblx0XHRcdH1cblx0XHR9XG5cdFx0aW5kZXgrK1xuXHR9XG5cdHRocm93IGVycm9yXG59XG5cbi8qKlxuICogRG8gYSBibG9iIHJlcXVlc3QgYW5kIHJldHJ5IGl0IGluIGNhc2Ugb2YgYSBOb3RBdXRob3JpemVkRXJyb3IsIHBlcmZvcm1pbmcgc29tZSBjbGVhbnVwIGJlZm9yZSByZXRyeWluZy5cbiAqXG4gKiBUaGlzIGlzIHVzZWZ1bCBmb3IgYmxvYiByZXF1ZXN0cyB0byBoYW5kbGUgZXhwaXJlZCB0b2tlbnMsIHdoaWNoIGNhaCBvY2N1ciBpZiB0aGUgcmVxdWVzdHMgdGFrZSBhIGxvbmcgdGltZSwgdGhlIGNsaWVudCBnZXRzIHN1c3BlbmRlZCBvciBwYXVzZWQgYnkgdGhlIE9TLlxuICogQHBhcmFtIGRvQmxvYlJlcXVlc3RcbiAqIEBwYXJhbSBkb0V2aWN0VG9rZW5CZWZvcmVSZXRyeVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG9CbG9iUmVxdWVzdFdpdGhSZXRyeTxUPihkb0Jsb2JSZXF1ZXN0OiAoKSA9PiBQcm9taXNlPFQ+LCBkb0V2aWN0VG9rZW5CZWZvcmVSZXRyeTogKCkgPT4gdm9pZCk6IFByb21pc2U8VD4ge1xuXHRyZXR1cm4gZG9CbG9iUmVxdWVzdCgpLmNhdGNoKFxuXHRcdC8vIGluIGNhc2Ugb25lIG9mIHRoZSBjaHVua3MgY291bGQgbm90IGJlIHVwbG9hZGVkIGJlY2F1c2Ugb2YgYW4gaW52YWxpZC9leHBpcmVkIHRva2VuIHdlIHVwbG9hZCBhbGwgY2h1bmtzIGFnYWluIGluIG9yZGVyIHRvIGd1YXJhbnRlZSB0aGF0IHRoZXkgYXJlIHVwbG9hZGVkIHRvIHRoZSBzYW1lIGFyY2hpdmUuXG5cdFx0Ly8gd2UgZG9uJ3QgaGF2ZSB0byB0YWtlIGNhcmUgb2YgYWxyZWFkeSB1cGxvYWRlZCBjaHVua3MsIGFzIHRoZXkgYXJlIHVucmVmZXJlbmNlZCBhbmQgd2lsbCBiZSBjbGVhbmVkIHVwIGJ5IHRoZSBzZXJ2ZXIgYXV0b21hdGljYWxseS5cblx0XHRvZkNsYXNzKE5vdEF1dGhvcml6ZWRFcnJvciwgKGUpID0+IHtcblx0XHRcdGRvRXZpY3RUb2tlbkJlZm9yZVJldHJ5KClcblx0XHRcdHJldHVybiBkb0Jsb2JSZXF1ZXN0KClcblx0XHR9KSxcblx0KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SWRzKFxuXHRpbnN0YW5jZTogYW55LFxuXHR0eXBlTW9kZWw6IFR5cGVNb2RlbCxcbik6IHtcblx0bGlzdElkOiBzdHJpbmcgfCBudWxsXG5cdGlkOiBzdHJpbmdcbn0ge1xuXHRpZiAoIWluc3RhbmNlLl9pZCkgdGhyb3cgbmV3IEVycm9yKFwiSWQgbXVzdCBiZSBkZWZpbmVkXCIpXG5cdGxldCBsaXN0SWQgPSBudWxsXG5cdGxldCBpZFxuXG5cdGlmICh0eXBlTW9kZWwudHlwZSA9PT0gVHlwZS5MaXN0RWxlbWVudCkge1xuXHRcdGxpc3RJZCA9IGluc3RhbmNlLl9pZFswXVxuXHRcdGlkID0gaW5zdGFuY2UuX2lkWzFdXG5cdH0gZWxzZSB7XG5cdFx0aWQgPSBpbnN0YW5jZS5faWRcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0bGlzdElkLFxuXHRcdGlkLFxuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUlhLDBCQUFOLE1BQTBEO0NBQ2hFLEFBQWlCO0NBRWpCLFlBQTZCQSxpQkFBa0RDLFdBQW1CO0VBZ0JsRyxLQWhCNkI7RUFnQjVCLEtBaEI4RTtBQUM5RSxPQUFLLE1BQU0sZ0JBQWdCLGdCQUFnQixVQUFVO0NBQ3JEO0NBRUQsTUFBTSxTQUFTQyxRQUFnQjtBQUM5QixRQUFNLEtBQUssZ0JBQWdCLG1CQUFtQixNQUFNLEtBQUssS0FBSyxPQUFPO0NBQ3JFO0NBRUQsTUFBTSxjQUFjQyxhQUFxQjtBQUN4QyxRQUFNLEtBQUssZ0JBQWdCLG1CQUFtQixNQUFNLEtBQUssS0FBSyxLQUFLLFlBQVksWUFBWTtDQUMzRjtDQUVELE1BQU0sWUFBWTtBQUNqQixRQUFNLEtBQUssZ0JBQWdCLG1CQUFtQixNQUFNLEtBQUssS0FBSyxLQUFLLFVBQVU7Q0FDN0U7QUFDRDs7OztJQ0pZLHFCQUFOLE1BQWtJO0NBQ3hJLFlBQTZCQyxRQUE2QztFQVUxRSxLQVY2QjtDQUErQztDQUU1RSxZQUFZQyxTQUE2QztBQUN4RCxTQUFPLEtBQUssT0FBTyxZQUFZLFFBQVE7Q0FDdkM7Q0FFRCxrQkFBa0JDLFNBQTZEO0FBQzlFLE9BQUssT0FBTyxZQUFZLENBQUNDLE9BQVksUUFBUSxTQUFTLEdBQUcsS0FBSyxDQUFDO0NBQy9EO0FBQ0Q7Ozs7QUNiRCxrQkFBa0I7SUFLQSxrREFBWDtBQUNOO0FBQ0E7QUFDQTs7QUFDQTtJQUVZLGVBQU4sTUFBbUI7Q0FDekIsQUFBUSx1QkFBNkMsT0FBTztDQUM1RCxBQUFRLGlCQUEw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LEtBQUssTUFBUTtBQUNiLEtBQUssTUFBUTtBQUNiLEtBQUssTUFBUTtBQUNiLEtBQUssTUFBUTtBQUNiLEtBQUssTUFBUTtBQUNiLEtBQUssTUFBUSxRQUFRLG9EQUFvRDtBQUV6RSxLQUFLLElBQUksSUFBSSxJQUFNLEtBQUssS0FBTSxJQUM1QixNQUFLLEtBQUs7QUFFWixLQUFLLE9BQVE7QUFDYixLQUFLLE9BQVE7QUFDYixLQUFLLE9BQVE7QUFDYixLQUFLLE9BQVE7QUFDYixLQUFLLE9BQVE7QUFDYixLQUFLLE9BQVE7QUFDYixLQUFLLE9BQVE7QUFDYixLQUFLLE9BQVEsUUFBUSxvREFBb0Q7QUFFekUsS0FBSyxJQUFJLElBQUksS0FBTSxLQUFLLEtBQU0sSUFDNUIsTUFBSyxLQUFLO0FBRVosS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBRWIsS0FBSyxJQUFJLElBQUksS0FBTSxLQUFLLEtBQU0sSUFDNUIsTUFBSyxLQUFLO0FBRVosS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBRWIsS0FBSyxJQUFJLElBQUksS0FBTSxLQUFLLEtBQU0sSUFDNUIsTUFBSyxLQUFLO0FBRVosS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBQ2IsS0FBSyxPQUFRO0FBRWIsS0FBSyxJQUFJLElBQUksS0FBTSxLQUFLLEtBQU0sSUFDNUIsTUFBSyxLQUFLLFFBQVEsa0NBQWtDO0FBRXRELEtBQUssT0FBUTtBQUNiLEtBQUssT0FBUTtBQUNiLEtBQUss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