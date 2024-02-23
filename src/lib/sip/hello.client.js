import { UserAgent, Registerer, Inviter, SessionState } from 'sip.js'
import statusStore from '$lib/store/status.store.js'

const voipServer = 'unifiza.bizvoip.co.za'
const voipPort = '8089'
const transportOptions = {
	server: 'wss://' + voipServer + ':' + voipPort + '/ws',
}

let uri = null
let userAgentOptions = null
let userAgent = null
let registerer = null
let inviter = null

let isAgentReady = false
let callTimeout = 0

export function register(ext, pwd) {
	// an authenticated user agent
	uri = UserAgent.makeURI('sip:' + ext + '@' + voipServer)

	// agent options
	userAgentOptions = {
		authorizationPassword: pwd,
		authorizationUsername: ext,
		transportOptions: transportOptions,
		// delegate: {
		//     onInvite,
		// },
		uri: uri,
	}

	userAgent = new UserAgent(userAgentOptions)

	// Register in order to authenticate with the server and receive messages.
	registerer = new Registerer(userAgent)

	userAgent.start().then(() => {
		registerer.register()
	})

	registerer.stateChange.addListener((newState) => {
		statusStore.showMessage(newState)
	})
}

export function startCall(numberToCall) {
	userAgent.start().then(() => {
		registerer.register()
		let target = UserAgent.makeURI('sip:' + numberToCall + '@' + voipServer)
		if (target) {
			inviter = new Inviter(userAgent, target, {
				sessionDescriptionHandlerOptions: {
					constraints: { audio: true, video: false },
				},
			})

			inviter
				.invite()
				.then(() => {
					statusStore.showMessage('Invitation sent')
				})
				.catch((error) => {
					statusStore.showMessage('Invite Error')
				})

			inviter.stateChange.addListener((newState) => {
				statusStore.showMessage(newState)
				switch (newState) {
					case SessionState.Establishing:
						break
					case SessionState.Established:
						let remoteAudio = document.getElementById('remoteAudio')
						remoteAudio.srcObject =
							inviter.sessionDescriptionHandler.remoteMediaStream
						remoteAudio.onloadedmetadata = function (e) {
							remoteAudio.play()
						}
						break
					case SessionState.Terminated:
						break
					default:
						break
				}
			})
		} else {
			statusStore.showMessage('Could NOT establish connection. Try logging in again.', false)
		}
	})
}

function onInvite(invitation) {
	invitation.stateChange.addListener((newState) => {
		switch (newState) {
			case SessionState.Establishing:
				statusStore.showMessage('Establishing Incoming Connection')
				break
			case SessionState.Established:
				statusStore.showMessage('In call')

				let remoteAudio = document.getElementById('remoteAudio')
				remoteAudio.srcObject =
					invitation.sessionDescriptionHandler.remoteMediaStream
				remoteAudio.onloadedmetadata = function (e) {
					remoteAudio.play()
				}
				inviter = invitation
				break
			case SessionState.Terminated:
				statusStore.showMessage('Call ended')
				break
			default:
				break
		}
	})

	let constrainsDefault = {
		audio: true,
		video: false,
	}

	const options = {
		sessionDescriptionHandlerOptions: {
			constraints: constrainsDefault,
		},
	}

	if (isAgentReady) {
		invitation.accept(options)
		isAgentReady = false
		callTimeout = 0
		statusStore.showMessage('Please wait...')
	} else {
		if (callTimeout % 2 !== 0) {
			statusStore.showMessage('Call waiting!!')
		} else {
			statusStore.showMessage('')
		}

		callTimeout++
		if (callTimeout <= 40) {
			setTimeout(onInvite, 500, invitation)
		} else {
			invitation.reject()
		}
	}
}

export function answerIncoming() {
	isAgentReady = true
}

export function transferCall(toExt) {
	const transferTarget = UserAgent.makeURI("sip:" + toExt + "@" + voipServer)

	// an inviter is a session
	inviter.refer(transferTarget, {
		// Example of extra headers in REFER request
		requestOptions: {
			extraHeaders: ["X-Referred-By-Someone: Username"],
		},
		requestDelegate: {
			onAccept() {
				// ...
			},
		},
	})

}


export function endSession() {
	if (inviter) {
		inviter.bye()
	}
}
