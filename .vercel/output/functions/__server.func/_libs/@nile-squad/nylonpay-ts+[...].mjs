import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "crypto";
import { arch, hostname, platform, release, type } from "os";
//#region node_modules/slang-ts/dist/index.js
var q = (G) => {
	let B = globalThis?.queueMicrotask;
	if (typeof B === "function") B(G);
	else Promise.resolve().then(G);
};
var P = (G) => G != null && typeof G === "object" && "type" in G && (G.type === "Ok" || G.type === "Err");
var M = (G) => G != null && typeof G === "object" && "isSome" in G && "isNone" in G;
var O = (G) => G != null && typeof G === "object" && typeof G.valueOf?.() === "symbol";
function N(G) {
	if (O(G)) return {
		ok: !0,
		value: G.valueOf().description
	};
	if (P(G)) {
		if (G.isOk) return {
			ok: !0,
			value: G.value
		};
		return {
			ok: !1,
			error: typeof G.error === "string" ? G.error : String(G.error)
		};
	}
	if (M(G)) {
		if (G.isSome) return {
			ok: !0,
			value: G.value
		};
		return {
			ok: !1,
			error: "Option was None"
		};
	}
	return {
		ok: !0,
		value: G
	};
}
function Z(G) {
	throw Error(G);
}
function L(G) {
	let B = Object.freeze({
		type: "Ok",
		value: G,
		isOk: !0,
		isErr: !1
	}), Y = {
		...B,
		expect: (D) => B.value,
		unwrap: () => {
			return q(() => {}), { else(X) {
				return B.value;
			} };
		},
		andThen: (D) => {
			try {
				let X = D(B.value);
				if (X instanceof Promise) return X.then(($) => {
					if ($ === void 0) return Y;
					return L($);
				}).catch(($) => {
					return I($ instanceof Error ? $.message : String($));
				});
				if (X === void 0) return Y;
				return L(X);
			} catch (X) {
				return I(X instanceof Error ? X.message : String(X));
			}
		}
	};
	return Y;
}
function I(G) {
	let Y = {
		...Object.freeze({
			type: "Err",
			error: G,
			isOk: !1,
			isErr: !0
		}),
		expect: (D) => {
			throw Error(D ?? G);
		},
		unwrap: () => {
			let D = !1;
			return q(() => {
				if (!D) throw Error(G);
			}), { else(X) {
				if (D = !0, typeof X === "function") return X(G);
				return X;
			} };
		},
		andThen: (D) => {
			return Y;
		}
	};
	return Y;
}
var K = (G) => {
	return G === null || G === void 0 || G === "" || Number.isNaN(G) || G === Infinity || G === -Infinity;
};
function b(G) {
	if (K(G)) throw Error("Cannot wrap null, undefined, NaN, or empty string in Some");
	return Object.freeze({
		type: "Some",
		value: G,
		isSome: !0,
		isNone: !1
	});
}
var g = Object.freeze({
	type: "None",
	isSome: !1,
	isNone: !0
});
var S = null;
function A(G) {
	S = G;
}
function W(G) {
	let B = K(G) ? g : b(G), $ = {
		...B,
		to: (J) => {
			if (!S) throw Error("Converter not initialized");
			return S(B, J);
		},
		expect: (J) => {
			if (B.isSome) return B.value;
			throw Error(J ?? "Expected Some, got None");
		},
		unwrap: () => {
			let J = !1, C = B;
			return q(() => {
				if (!J) throw Error("Expected else");
			}), { else(j) {
				if (J = !0, C.isSome) return C.value;
				let H = typeof j === "function" ? j(void 0) : j;
				if (K(H)) throw Error("Fallback must be truthy");
				return H;
			} };
		},
		andThen: (J) => {
			let C = B;
			if (C.isNone) return $;
			let j = C.value;
			try {
				let H = J(j);
				if (H instanceof Promise) return H.then((x) => {
					if (x === void 0) return $;
					return W(x);
				}).catch(() => W(null));
				if (H === void 0) return $;
				return W(H);
			} catch {
				return W(null);
			}
		}
	};
	return $;
}
var T = null;
function F(G) {
	T = G;
}
function U(G) {
	let B = Symbol(G), Q = Object(B), Y = (X) => {
		if (!T) throw Error("Converter not initialized");
		return T(B, X);
	}, D = (X) => {
		let $;
		try {
			$ = X(G);
		} catch (J) {
			Z(`Atom.andThen: fn threw an error: ${J instanceof Error ? J.message : String(J)}`);
		}
		if ($ === void 0) return Q;
		if (typeof $ !== "string") Z(`Atom.andThen: fn must return a string, got ${typeof $}`);
		return U($);
	};
	return Q.to = Y, Q.andThen = D, Q;
}
var V = (G) => G != null && typeof G === "object" && "isSome" in G && "isNone" in G;
function _(G, B) {
	if (G && (G.type === "Ok" || G.type === "Err")) throw Error("Cannot convert a Result to any other type");
	switch (B) {
		case "option":
			if (V(G)) return G;
			if (typeof G === "symbol") return W(G.description);
			return W(G);
		case "atom":
			if (V(G)) {
				if (G.isNone) throw Error("Cannot convert None to Atom");
				if (typeof G.value !== "string") throw Error("Only string values can be converted to Atom");
				return U(G.value);
			}
			if (typeof G === "symbol") return G;
			throw Error(`Cannot convert type ${typeof G} to Atom`);
		case "result":
			if (V(G)) return G.isSome ? L(G.value) : I("Value is None");
			if (typeof G === "symbol") return L(G.description);
			return L(G);
		default: throw Error(`Invalid target: ${B}`);
	}
}
A(_);
F(_);
async function c(G, B) {
	let Q = B?.throw ?? !1;
	try {
		let D = N(await G());
		if (D.ok) return L(D.value);
		return I(D.error);
	} catch (Y) {
		let D = Y instanceof Error ? Y.message : String(Y);
		if (Q) throw Y instanceof Error ? Y : Error(D);
		return I(D);
	}
}
//#endregion
//#region node_modules/@nile-squad/nylonpay-ts/dist/index.js
var TERMINAL_STATUSES = /* @__PURE__ */ new Set([
	"successful",
	"failed",
	"cancelled",
	"completed"
]);
function isTerminalTransactionStatus(status) {
	return TERMINAL_STATUSES.has(status);
}
function resolvePollIntervalMs(input) {
	const elapsed = (input.nowMs ?? Date.now()) - input.pollStartTimeMs;
	const twoMinutes = 12e4;
	if (elapsed < twoMinutes) return input.baseIntervalMs;
	const periods = Math.floor((elapsed - twoMinutes) / twoMinutes) + 1;
	return Math.min(input.baseIntervalMs * 2 ** periods, 15e3);
}
function createEmitter() {
	const state = { listeners: /* @__PURE__ */ new Map() };
	function on(event, handler) {
		if (!state.listeners.has(event)) state.listeners.set(event, /* @__PURE__ */ new Set());
		state.listeners.get(event)?.add(handler);
		return () => off(event, handler);
	}
	function once(event, handler) {
		const wrapper = (data) => {
			off(event, wrapper);
			handler(data);
		};
		on(event, wrapper);
		return emitter;
	}
	function off(event, handler) {
		const handlers = state.listeners.get(event);
		if (handlers) handlers.delete(handler);
	}
	function emit(event, data) {
		const handlers = state.listeners.get(event);
		if (!handlers || handlers.size === 0) return;
		for (const handler of handlers) try {
			handler(data);
		} catch {}
	}
	function clear(event) {
		if (event) state.listeners.delete(event);
		else state.listeners.clear();
	}
	function listenerCount(event) {
		return state.listeners.get(event)?.size ?? 0;
	}
	const emitter = {
		on,
		once,
		off,
		emit,
		clear,
		listenerCount
	};
	return emitter;
}
var DEFAULT_BASE_URL = "https://api.nylonpay.nilesquad.com/api/services";
var DEFAULT_TIMEOUT_MS = 9e4;
var DEFAULT_MAX_RETRIES = 3;
var DEFAULT_MAX_POLL_INTERVAL_MS = 2e3;
var POLL_JITTER_MS = 250;
var SDK_SERVICE = "sdk";
var SDK_ACTIONS = {
	collectPayment: "sdk-collect-payment",
	collectPaymentAndResolve: "sdk-collect-payment-and-resolve",
	makePayout: "sdk-make-payout",
	makePayoutAndResolve: "sdk-make-payout-and-resolve",
	getStatus: "sdk-get-status",
	getTransaction: "sdk-get-transaction",
	listTransactions: "sdk-list-transactions",
	verifyPhone: "sdk-verify-phone",
	createInvoice: "sdk-create-invoice"
};
var RETRYABLE_STATUS_CODES = /* @__PURE__ */ new Set([
	408,
	429,
	500,
	502,
	503,
	504
]);
var MAX_RESPONSE_BYTES = 10485760;
function generateFingerprint() {
	const components = [
		`type:${type()}`,
		`platform:${platform()}`,
		`arch:${arch()}`,
		`release:${release()}`,
		`hostname:${hostname()}`
	].join("|");
	return createHash("sha256").update(components).digest("hex");
}
function generateNonce(length = 16) {
	return randomBytes(length).toString("hex");
}
function compareByCodePoint(first, second) {
	if (first < second) return -1;
	if (first > second) return 1;
	return 0;
}
function sortValue(value) {
	if (Array.isArray(value)) return value.map((entry) => sortValue(entry));
	if (value && typeof value === "object") {
		const sortedEntries = Object.entries(value).sort(([firstKey], [secondKey]) => compareByCodePoint(firstKey, secondKey));
		return Object.fromEntries(sortedEntries.map(([entryKey, entryValue]) => [entryKey, sortValue(entryValue)]));
	}
	return value;
}
function createCanonicalPayload(payload) {
	return JSON.stringify(sortValue(payload));
}
function createSignaturePayload(input) {
	return `${input.fingerprint}.${input.nonce}.${input.timestamp}.${createCanonicalPayload(input.payload)}`;
}
function createSignature(input) {
	const payload = createSignaturePayload(input);
	return createHmac("sha256", input.secret).update(payload).digest("hex");
}
function createTimestamp() {
	return Date.now().toString();
}
function verifyResponseSignature(data, signature, secret) {
	const expectedSignature = createHmac("sha256", secret).update(createCanonicalPayload(data)).digest("hex");
	const providedBuffer = Buffer.from(signature, "hex");
	const expectedBuffer = Buffer.from(expectedSignature, "hex");
	if (providedBuffer.length !== expectedBuffer.length) return false;
	return timingSafeEqual(providedBuffer, expectedBuffer);
}
var CACHED_FINGERPRINT = generateFingerprint();
var KNOWN_CATEGORIES = /* @__PURE__ */ new Set([
	"auth",
	"validation",
	"limit",
	"rate_limit",
	"account",
	"provider",
	"duplicate",
	"not_found",
	"internal",
	"network",
	"timeout"
]);
var STATUS_CATEGORY = {
	408: "timeout",
	429: "rate_limit"
};
var ERROR_TYPE_SUFFIX = /^(.*?)\s*--\s*error-type:\s*([a-z_]+)\s*$/is;
function parseCategoryFromMessage(message) {
	const match = ERROR_TYPE_SUFFIX.exec(message);
	if (match?.[2] && KNOWN_CATEGORIES.has(match[2])) return {
		category: match[2],
		message: match[1] ?? message
	};
	return {
		category: null,
		message
	};
}
function buildHttpError(params) {
	const parsed = parseCategoryFromMessage(params.message);
	return {
		category: parsed.category ?? STATUS_CATEGORY[params.statusCode] ?? (params.statusCode >= 500 ? "internal" : "validation"),
		message: parsed.message,
		retryable: RETRYABLE_STATUS_CODES.has(params.statusCode)
	};
}
function createSdkError(error) {
	return Object.assign(new Error(error.message), {
		category: error.category,
		retryable: error.retryable
	});
}
function calculateBackoff(attempt) {
	return 2 ** attempt * 1e3 + Math.random() * 500;
}
function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
function stripResponseSignature(payload) {
	if (!payload || typeof payload !== "object" || !("_responseSignature" in payload)) return {
		data: payload,
		responseSignature: null
	};
	const { _responseSignature, ...rest } = payload;
	return {
		data: rest,
		responseSignature: typeof _responseSignature === "string" ? _responseSignature : null
	};
}
function stripRequestNonce(payload) {
	if (!payload || typeof payload !== "object" || !("_requestNonce" in payload)) return {
		data: payload,
		requestNonce: null
	};
	const { _requestNonce, ...rest } = payload;
	return {
		data: rest,
		requestNonce: typeof _requestNonce === "string" ? _requestNonce : null
	};
}
function buildEnvelope({ action, payload }) {
	return {
		intent: "execute",
		service: SDK_SERVICE,
		action,
		payload: {
			...payload,
			_fingerprint: CACHED_FINGERPRINT
		}
	};
}
function buildAuthHeaders({ apiKey, apiSecret, payload }) {
	const nonce = generateNonce();
	const timestamp = createTimestamp();
	return {
		"content-type": "application/json",
		"x-nylon-key": apiKey,
		"x-nylon-nonce": nonce,
		"x-nylon-signature": createSignature({
			fingerprint: CACHED_FINGERPRINT,
			nonce,
			timestamp,
			payload,
			secret: apiSecret
		}),
		"x-nylon-timestamp": timestamp
	};
}
function withTimeout(timeoutMs) {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
	return {
		controller,
		cleanup: () => clearTimeout(timeoutId)
	};
}
function createTransport({ apiKey, apiSecret, baseUrl = DEFAULT_BASE_URL, timeoutMs = DEFAULT_TIMEOUT_MS, maxRetries = DEFAULT_MAX_RETRIES, fetch: fetchImpl }) {
	async function send(request) {
		const envelope = buildEnvelope(request);
		const signedPayload = envelope.payload;
		const bodyString = JSON.stringify(envelope);
		async function attempt(currentAttempt) {
			const headers = buildAuthHeaders({
				apiKey,
				apiSecret,
				payload: signedPayload
			});
			const { controller, cleanup } = withTimeout(timeoutMs);
			try {
				const response = await fetchImpl(baseUrl, {
					method: "POST",
					headers,
					body: bodyString,
					signal: controller.signal
				});
				const contentLength = response.headers?.get("content-length");
				if (contentLength && Number(contentLength) > MAX_RESPONSE_BYTES) {
					cleanup();
					return I(JSON.stringify({
						category: "internal",
						message: "Received an invalid response from the server",
						retryable: false
					}));
				}
				if (!response.ok) {
					const statusCode = response.status;
					const retryable = RETRYABLE_STATUS_CODES.has(statusCode);
					let errorMessage = `HTTP ${statusCode}`;
					try {
						const errorBody = await response.json();
						if (errorBody && typeof errorBody === "object" && "message" in errorBody) errorMessage = String(errorBody.message);
					} catch {
						errorMessage = response.statusText || errorMessage;
					}
					if (retryable && currentAttempt < maxRetries) {
						cleanup();
						await delay(calculateBackoff(currentAttempt));
						return attempt(currentAttempt + 1);
					}
					cleanup();
					return I(JSON.stringify(buildHttpError({
						message: errorMessage,
						statusCode
					})));
				}
				const responseBody = await response.json();
				if (!responseBody || typeof responseBody !== "object" || !("status" in responseBody)) {
					cleanup();
					return I(JSON.stringify({
						category: "internal",
						message: "Received an invalid response from the server",
						retryable: false
					}));
				}
				const { status, message, data } = responseBody;
				if (status === true) {
					const { data: strippedData, responseSignature } = stripResponseSignature(data);
					if (!responseSignature) {
						cleanup();
						return I(JSON.stringify({
							category: "internal",
							message: "Could not verify the server response",
							retryable: false
						}));
					}
					if (!verifyResponseSignature(strippedData, responseSignature, apiSecret)) {
						cleanup();
						return I(JSON.stringify({
							category: "internal",
							message: "Could not verify the server response",
							retryable: false
						}));
					}
					const { data: unboundData, requestNonce: echoedNonce } = stripRequestNonce(strippedData);
					if (echoedNonce !== headers["x-nylon-nonce"]) {
						cleanup();
						return I(JSON.stringify({
							category: "internal",
							message: "Could not verify the server response",
							retryable: false
						}));
					}
					cleanup();
					return L(unboundData);
				}
				const parsedError = parseError(message);
				cleanup();
				return I(JSON.stringify(parsedError));
			} catch (error) {
				cleanup();
				const isAbort = error instanceof DOMException && error.name === "AbortError";
				const sdkError = {
					category: isAbort ? "timeout" : "network",
					message: isAbort ? "The request timed out" : "Could not reach the server, check your network connection and try again",
					retryable: true
				};
				if (currentAttempt < maxRetries) {
					await delay(calculateBackoff(currentAttempt));
					return attempt(currentAttempt + 1);
				}
				return I(JSON.stringify(sdkError));
			}
		}
		return attempt(0);
	}
	return {
		send,
		parseError
	};
}
function parseError(error) {
	try {
		const parsed = JSON.parse(error);
		if (parsed && typeof parsed === "object" && "category" in parsed && "message" in parsed && typeof parsed.category === "string" && typeof parsed.message === "string") return parsed;
	} catch {}
	const fromSuffix = parseCategoryFromMessage(error);
	return {
		category: fromSuffix.category ?? "internal",
		message: fromSuffix.message
	};
}
var STATUS_TO_EVENT = {
	pending: "processing",
	processing: "processing",
	on_hold: "processing",
	successful: "success",
	failed: "failed",
	cancelled: "cancelled"
};
function statusToEvent(status) {
	return STATUS_TO_EVENT[status] ?? null;
}
var TERMINAL_STATES = /* @__PURE__ */ new Set([
	"successful",
	"failed",
	"cancelled"
]);
function normalizeStatus(raw) {
	if (raw === "completed") return "successful";
	return raw;
}
function createPaymentInstance(initialResponse, deps) {
	const state = {
		reference: initialResponse.reference,
		status: normalizeStatus(initialResponse.status),
		transaction: null,
		pollingTimer: null,
		lastStatusEvent: null,
		resolved: false,
		pollAttempts: 0,
		pollStartTime: Date.now(),
		onDelayed: deps.onDelayed ?? "wait",
		earlyReturnPending: false,
		emitter: createEmitter(),
		fetchStatus: deps.fetchStatus,
		fetchTransaction: deps.fetchTransaction,
		pollIntervalMs: deps.pollIntervalMs ?? 2e3,
		maxPollDuration: deps.maxPollDuration,
		maxPollAttempts: deps.maxPollAttempts
	};
	function resolveWithError(error, category, retryable) {
		state.resolved = true;
		stopUpdates();
		const parsed = parseError(error);
		emitEvent("error", parsed.message, category ?? parsed.category, parsed.retryable);
	}
	function emitEvent(event, error, category, retryable) {
		const data = {
			event,
			reference: state.reference,
			transaction: state.transaction ?? void 0,
			error,
			category,
			retryable,
			timestamp: (/* @__PURE__ */ new Date()).toISOString()
		};
		state.emitter.emit(event, data);
	}
	async function handleTerminalState(status) {
		const txResult = await state.fetchTransaction({ reference: state.reference });
		if (txResult.isOk) {
			state.transaction = txResult.value;
			const event = statusToEvent(status);
			if (event) emitEvent(event, status === "failed" ? state.transaction.failureReason ?? void 0 : void 0);
		} else emitEvent("error", `Failed to fetch transaction: ${txResult.error}`);
		state.resolved = true;
		stopUpdates();
	}
	async function handleStatusUpdate(response) {
		if (state.resolved) return;
		if (response.reference !== state.reference) {
			resolveWithError("Received a status update for a different transaction", "internal");
			return;
		}
		const newStatus = normalizeStatus(response.status);
		state.status = newStatus;
		if (response.delayed && state.onDelayed === "return" && !TERMINAL_STATES.has(newStatus)) {
			await returnPendingEarly();
			return;
		}
		const event = statusToEvent(newStatus);
		if (!event || event === state.lastStatusEvent) return;
		state.lastStatusEvent = event;
		if (TERMINAL_STATES.has(newStatus)) {
			await handleTerminalState(newStatus);
			return;
		}
		emitEvent(event);
	}
	async function returnPendingEarly() {
		const txResult = await state.fetchTransaction({ reference: state.reference });
		if (txResult.isOk) state.transaction = txResult.value;
		state.earlyReturnPending = true;
		state.resolved = true;
		stopUpdates();
	}
	function handlePollError(error) {
		const parsed = parseError(error);
		if (parsed.category === "not_found") return;
		emitEvent("error", parsed.message, parsed.category, parsed.retryable);
		state.resolved = true;
		stopUpdates();
	}
	function scheduleNextPoll() {
		if (state.resolved || state.pollingTimer) return;
		const delay2 = resolvePollIntervalMs({
			baseIntervalMs: state.pollIntervalMs,
			pollStartTimeMs: state.pollStartTime
		}) + Math.random() * POLL_JITTER_MS;
		state.pollingTimer = setTimeout(() => {
			state.pollingTimer = null;
			pollStatus();
		}, delay2);
	}
	async function pollStatus() {
		if (state.resolved) {
			stopUpdates();
			return;
		}
		if (state.maxPollAttempts !== void 0 && state.pollAttempts >= state.maxPollAttempts) {
			resolveWithError("Timed out waiting for the transaction status to update", "timeout");
			return;
		}
		if (state.maxPollDuration !== void 0 && Date.now() - state.pollStartTime >= state.maxPollDuration) {
			resolveWithError("Timed out waiting for the transaction status to update", "timeout");
			return;
		}
		state.pollAttempts += 1;
		const result = await state.fetchStatus({ reference: state.reference });
		if (result.isOk) await handleStatusUpdate(result.value);
		else handlePollError(result.error);
		if (state.resolved) {
			stopUpdates();
			return;
		}
		scheduleNextPoll();
	}
	function startUpdates() {
		if (TERMINAL_STATES.has(state.status)) {
			setTimeout(() => {
				handleTerminalState(state.status);
			}, 0);
			return;
		}
		const initialEvent = statusToEvent(state.status);
		if (initialEvent) {
			state.lastStatusEvent = initialEvent;
			setTimeout(() => {
				if (!state.resolved) emitEvent(initialEvent);
			}, 0);
		}
		scheduleNextPoll();
	}
	function stopUpdates() {
		if (state.pollingTimer) {
			clearTimeout(state.pollingTimer);
			state.pollingTimer = null;
		}
	}
	function on(event, handler) {
		state.emitter.on(event, handler);
		return paymentInstance;
	}
	function off(event, handler) {
		state.emitter.off(event, handler);
		return paymentInstance;
	}
	function once(event, handler) {
		state.emitter.once(event, handler);
		return paymentInstance;
	}
	function wait() {
		return new Promise((resolve) => {
			if (state.resolved) {
				if (state.earlyReturnPending && state.transaction) {
					resolve(state.transaction);
					return;
				}
				resolve(state.status === "successful" && state.transaction ? state.transaction : null);
				return;
			}
			function onSuccess() {
				cleanup();
				resolve(state.transaction ?? null);
			}
			function onFailed() {
				cleanup();
				resolve(null);
			}
			function onCancelled() {
				cleanup();
				resolve(null);
			}
			function onError() {
				cleanup();
				resolve(null);
			}
			function cleanup() {
				state.emitter.off("success", onSuccess);
				state.emitter.off("failed", onFailed);
				state.emitter.off("cancelled", onCancelled);
				state.emitter.off("error", onError);
			}
			state.emitter.on("success", onSuccess);
			state.emitter.on("failed", onFailed);
			state.emitter.on("cancelled", onCancelled);
			state.emitter.on("error", onError);
		});
	}
	const paymentInstance = {
		get reference() {
			return state.reference;
		},
		get status() {
			return state.status;
		},
		on,
		once,
		off,
		wait
	};
	if (deps.initialError) {
		state.resolved = true;
		const err = deps.initialError;
		setTimeout(() => {
			emitEvent("error", err.message, err.category, err.retryable);
		}, 0);
	} else startUpdates();
	return paymentInstance;
}
function normalizePhone(phone) {
	let normalized = phone.replace(/\s+/g, "").replace(/^\+/, "");
	if (normalized.startsWith("0") && normalized.length === 10) normalized = `256${normalized.slice(1)}`;
	return normalized;
}
function isValidPhoneFormat(normalizedPhone) {
	return /^\d{9,15}$/.test(normalizedPhone);
}
var TIMEOUT_MESSAGE = "Timed out waiting for the transaction status to update";
var sleep = (ms) => new Promise((resolve) => {
	setTimeout(resolve, ms);
});
async function pollUntilTerminal(deps) {
	const pollStartTime = Date.now();
	let attempts = 0;
	while (true) {
		if (deps.maxPollAttempts !== void 0 && attempts >= deps.maxPollAttempts) return I(TIMEOUT_MESSAGE);
		if (deps.maxPollDurationMs !== void 0 && Date.now() - pollStartTime >= deps.maxPollDurationMs) return I(TIMEOUT_MESSAGE);
		attempts += 1;
		const statusResult = await deps.fetchStatus({ reference: deps.reference });
		if (statusResult.isErr) {
			const parsed = parseError(statusResult.error);
			if (parsed.category === "not_found") {
				await sleep(deps.pollIntervalMs);
				continue;
			}
			return I(parsed.message);
		}
		const status = statusResult.value;
		if (isTerminalTransactionStatus(status.status)) {
			const tx = await deps.fetchTransaction({ reference: deps.reference });
			if (tx.isOk) return L(tx.value);
			return I(tx.error);
		}
		if (status.delayed && deps.onDelayed === "return") {
			const tx = await deps.fetchTransaction({ reference: deps.reference });
			if (tx.isOk) return L(tx.value);
			return I(tx.error);
		}
		await sleep(resolvePollIntervalMs({
			baseIntervalMs: deps.pollIntervalMs,
			pollStartTimeMs: pollStartTime
		}) + Math.random() * POLL_JITTER_MS);
	}
}
var DEFAULT_TOLERANCE_SECONDS = 300;
function toPayloadBytes(payload) {
	return typeof payload === "string" ? Buffer.from(payload, "utf8") : Buffer.from(payload);
}
function extractSignedTimestampMs(payloadString) {
	let parsed;
	try {
		parsed = JSON.parse(payloadString);
	} catch {
		return null;
	}
	if (!parsed || typeof parsed !== "object") return null;
	const raw = parsed.timestamp;
	if (typeof raw === "number" && Number.isFinite(raw)) return raw < 0xe8d4a51000 ? raw * 1e3 : raw;
	if (typeof raw === "string") {
		const numeric = Number(raw);
		if (raw.trim() !== "" && Number.isFinite(numeric)) return numeric < 0xe8d4a51000 ? numeric * 1e3 : numeric;
		const ms = Date.parse(raw);
		return Number.isNaN(ms) ? null : ms;
	}
	return null;
}
function verifyWebhookSignature(input) {
	try {
		const payloadBytes = toPayloadBytes(input.payload);
		const expectedSignature = createHmac("sha256", input.secret).update(payloadBytes).digest("hex");
		if (input.signature !== input.signature.toLowerCase()) return false;
		const providedBuffer = Buffer.from(input.signature, "hex");
		const expectedBuffer = Buffer.from(expectedSignature, "hex");
		if (providedBuffer.length !== expectedBuffer.length) return false;
		if (!timingSafeEqual(providedBuffer, expectedBuffer)) return false;
		const toleranceSeconds = input.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
		if (toleranceSeconds === -1) return true;
		if (toleranceSeconds < 0) return false;
		const timestampMs = extractSignedTimestampMs(payloadBytes.toString("utf8"));
		if (timestampMs === null) return false;
		return Math.abs(Date.now() - timestampMs) <= toleranceSeconds * 1e3;
	} catch {
		return false;
	}
}
var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function resolveReference(reference) {
	if (reference === void 0) return randomUUID();
	if (!UUID_REGEX.test(reference)) throwValidation("reference must be a valid UUID");
	return reference;
}
async function runHook(hook, ...args) {
	if (!hook || hook.enabled === false) return void 0;
	const result = await c(async () => hook.fn(...args));
	if (result.isOk) return result.value;
	await c(async () => hook.onError(result.error));
}
function throwValidation(message) {
	throw createSdkError({
		category: "validation",
		message
	});
}
function validateCollectionAmount(amount) {
	if (!Number.isInteger(amount) || amount <= 0) throwValidation("amount must be a positive integer");
	if (amount < 500) throwValidation("Collection amount must be at least 500 UGX");
}
function validatePayoutAmount(amount) {
	if (!Number.isInteger(amount) || amount <= 0) throwValidation("amount must be a positive integer");
	if (amount < 5e3) throwValidation("Payout amount must be at least 5000 UGX");
}
function validateTestOutcome(testOutcome) {
	if (testOutcome !== void 0 && testOutcome !== "success" && testOutcome !== "fail") throwValidation("testOutcome must be \"success\" or \"fail\"");
}
function validateNonEmpty(value, fieldName) {
	if (!value || value.trim() === "") throwValidation(`${fieldName} is required`);
}
function validatePhoneFormat(normalizedPhone, fieldName) {
	if (!isValidPhoneFormat(normalizedPhone)) throwValidation(`${fieldName} must be a valid phone number`);
}
function prepareCollectPayload(input) {
	const reference = resolveReference(input.reference);
	validateCollectionAmount(input.amount);
	validateTestOutcome(input.testOutcome);
	validateNonEmpty(input.customer.name, "customer.name");
	validateNonEmpty(input.customer.phoneNumber, "customer.phoneNumber");
	const normalizedPhone = normalizePhone(input.customer.phoneNumber);
	validatePhoneFormat(normalizedPhone, "customer.phoneNumber");
	validateNonEmpty(input.description, "description");
	if (input.method === "bank" && !input.bank) throwValidation("bank details are required when method is \"bank\"");
	return {
		...input,
		reference,
		customer: {
			...input.customer,
			phoneNumber: normalizedPhone
		}
	};
}
function preparePayoutPayload(input) {
	const reference = resolveReference(input.reference);
	validatePayoutAmount(input.amount);
	validateTestOutcome(input.testOutcome);
	validateNonEmpty(input.customer.name, "customer.name");
	validateNonEmpty(input.customer.phoneNumber, "customer.phoneNumber");
	const normalizedPhone = normalizePhone(input.customer.phoneNumber);
	validatePhoneFormat(normalizedPhone, "customer.phoneNumber");
	validateNonEmpty(input.description, "description");
	validateNonEmpty(input.destination.accountHolderName, "destination.accountHolderName");
	validateNonEmpty(input.destination.accountNumber, "destination.accountNumber");
	return {
		...input,
		reference,
		customer: {
			...input.customer,
			phoneNumber: normalizedPhone
		}
	};
}
function applyBeforeHookMutation(mutated, current, prepare) {
	return prepare({
		...mutated,
		reference: mutated.reference ?? current.reference
	});
}
function createSdkInstance(config) {
	const transport = createTransport({
		apiKey: config.apiKey,
		apiSecret: config.apiSecret,
		baseUrl: config.baseUrl,
		timeoutMs: config.timeoutMs,
		maxRetries: config.maxRetries,
		fetch: config.fetch
	});
	const commonDeps = {
		fetchStatus: (input) => transport.send({
			action: SDK_ACTIONS.getStatus,
			payload: input
		}),
		fetchTransaction: (input) => transport.send({
			action: SDK_ACTIONS.getTransaction,
			payload: input
		}),
		pollIntervalMs: config.maxPollIntervalMs,
		maxPollDuration: config.maxPollDurationMs,
		maxPollAttempts: config.maxPollAttempts,
		onDelayed: config.onDelayed
	};
	const pollDeps = {
		fetchStatus: commonDeps.fetchStatus,
		fetchTransaction: commonDeps.fetchTransaction,
		maxPollAttempts: config.maxPollAttempts,
		maxPollDurationMs: config.maxPollDurationMs,
		onDelayed: config.onDelayed,
		pollIntervalMs: config.maxPollIntervalMs
	};
	async function continueResolveIfNeeded(transaction) {
		if (isTerminalTransactionStatus(transaction.status)) return L(transaction);
		return pollUntilTerminal({
			...pollDeps,
			reference: transaction.reference
		});
	}
	async function collectPayment(input) {
		let payload = prepareCollectPayload(input);
		const mutated = await runHook(config.hooks?.beforeCollect, payload);
		if (mutated != null) payload = applyBeforeHookMutation(mutated, payload, prepareCollectPayload);
		const result = await transport.send({
			action: SDK_ACTIONS.collectPayment,
			payload
		});
		await runHook(config.hooks?.afterCollect, result.isOk ? L({
			reference: result.value.reference,
			status: result.value.status
		}) : I(result.error), {
			...payload,
			raw: input
		});
		if (result.isErr) {
			const sdkErr = parseError(result.error);
			return createPaymentInstance({
				reference: payload.reference,
				status: "pending"
			}, {
				...commonDeps,
				initialError: sdkErr
			});
		}
		return createPaymentInstance(result.value, commonDeps);
	}
	async function collectPaymentAndResolve(input) {
		let payload = prepareCollectPayload(input);
		const mutated = await runHook(config.hooks?.beforeCollect, payload);
		if (mutated != null) payload = applyBeforeHookMutation(mutated, payload, prepareCollectPayload);
		const result = await transport.send({
			action: SDK_ACTIONS.collectPaymentAndResolve,
			payload
		});
		await runHook(config.hooks?.afterCollect, result.isOk ? L({
			reference: result.value.reference,
			status: result.value.status
		}) : I(result.error), {
			...payload,
			raw: input
		});
		if (result.isOk) return continueResolveIfNeeded(result.value);
		return I(result.error);
	}
	async function makePayout(input) {
		let payload = preparePayoutPayload(input);
		const mutated = await runHook(config.hooks?.beforePayout, payload);
		if (mutated != null) payload = applyBeforeHookMutation(mutated, payload, preparePayoutPayload);
		const result = await transport.send({
			action: SDK_ACTIONS.makePayout,
			payload
		});
		await runHook(config.hooks?.afterPayout, result.isOk ? L({
			reference: result.value.reference,
			status: result.value.status
		}) : I(result.error), {
			...payload,
			raw: input
		});
		if (result.isErr) {
			const sdkErr = parseError(result.error);
			return createPaymentInstance({
				reference: payload.reference,
				status: "pending"
			}, {
				...commonDeps,
				initialError: sdkErr
			});
		}
		return createPaymentInstance(result.value, commonDeps);
	}
	async function makePayoutAndResolve(input) {
		let payload = preparePayoutPayload(input);
		const mutated = await runHook(config.hooks?.beforePayout, payload);
		if (mutated != null) payload = applyBeforeHookMutation(mutated, payload, preparePayoutPayload);
		const result = await transport.send({
			action: SDK_ACTIONS.makePayoutAndResolve,
			payload
		});
		await runHook(config.hooks?.afterPayout, result.isOk ? L({
			reference: result.value.reference,
			status: result.value.status
		}) : I(result.error), {
			...payload,
			raw: input
		});
		if (result.isOk) return continueResolveIfNeeded(result.value);
		return I(result.error);
	}
	async function getStatus(input) {
		validateNonEmpty(input.reference, "reference");
		const result = await transport.send({
			action: SDK_ACTIONS.getStatus,
			payload: input
		});
		if (result.isOk) return L(result.value);
		return I(result.error);
	}
	async function getTransaction(input) {
		if (!input.id && !input.reference) throwValidation("id or reference is required");
		const result = await transport.send({
			action: SDK_ACTIONS.getTransaction,
			payload: input
		});
		if (result.isOk) return L(result.value);
		return I(result.error);
	}
	async function verifyPhone(input) {
		validateNonEmpty(input.phoneNumber, "phoneNumber");
		const normalizedPhone = normalizePhone(input.phoneNumber);
		validatePhoneFormat(normalizedPhone, "phoneNumber");
		const result = await transport.send({
			action: SDK_ACTIONS.verifyPhone,
			payload: {
				...input,
				phoneNumber: normalizedPhone
			}
		});
		if (result.isOk) return L(result.value);
		return I(result.error);
	}
	async function createInvoice(input) {
		validateCollectionAmount(input.amount);
		validateNonEmpty(input.customerEmail, "customerEmail");
		if (input.items) {
			if (input.items.length > 50) throwValidation("items must not exceed 50");
			for (const item of input.items) {
				if (!Number.isInteger(item.quantity) || item.quantity <= 0) throwValidation("item quantity must be a positive integer");
				if (!Number.isInteger(item.unitPrice) || item.unitPrice <= 0) throwValidation("item unitPrice must be a positive integer");
			}
		}
		const result = await transport.send({
			action: SDK_ACTIONS.createInvoice,
			payload: input
		});
		if (result.isOk) return L(result.value);
		return I(result.error);
	}
	async function listTransactions(input) {
		const result = await transport.send({
			action: SDK_ACTIONS.listTransactions,
			payload: input ?? {}
		});
		if (result.isOk) return L(result.value);
		return I(result.error);
	}
	async function getTransactionsByTag(tag, options) {
		return listTransactions({
			...options,
			tags: [tag]
		});
	}
	function verifyWebhook(input) {
		return verifyWebhookSignature(input);
	}
	return {
		collectPayment,
		collectPaymentAndResolve,
		makePayout,
		makePayoutAndResolve,
		getStatus,
		getTransaction,
		listTransactions,
		getTransactionsByTag,
		verifyPhone,
		createInvoice,
		verifyWebhookSignature: verifyWebhook
	};
}
var instances = /* @__PURE__ */ new Map();
function createNylonPay(config) {
	if (!config.apiKey) throw new Error("apiKey is required");
	if (!config.apiKey.startsWith("npk_")) throw new Error("apiKey must start with \"npk_\"");
	if (!config.apiSecret) throw new Error("apiSecret is required");
	if (!config.apiSecret.startsWith("nps_")) throw new Error("apiSecret must start with \"nps_\"");
	const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
	const secretHash = createHash("sha256").update(config.apiSecret).digest("hex").slice(0, 16);
	const instanceKey = `${config.apiKey}:${baseUrl}:${secretHash}`;
	if (!config.force) {
		const existing = instances.get(instanceKey);
		if (existing) return existing;
	}
	const instance = createSdkInstance({
		apiKey: config.apiKey,
		apiSecret: config.apiSecret,
		baseUrl,
		timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
		maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
		maxPollIntervalMs: config.maxPollIntervalMs ?? DEFAULT_MAX_POLL_INTERVAL_MS,
		maxPollDurationMs: config.maxPollDurationMs,
		maxPollAttempts: config.maxPollAttempts,
		onDelayed: config.onDelayed ?? "wait",
		fetch: config.fetch ?? globalThis.fetch.bind(globalThis),
		hooks: config.hooks
	});
	instances.set(instanceKey, instance);
	return instance;
}
//#endregion
export { parseError as n, createNylonPay as t };
